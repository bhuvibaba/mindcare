/*
  # MindCare Database Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text)
      - `language` (text, default 'en')
      - `coins` (integer, default 20)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `mood` (text)
      - `tags` (text array)
      - `language` (text, default 'en')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `mood_analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `mood_score` (integer)
      - `emotion` (text)
      - `intensity` (text)
      - `date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - Trigger to automatically create profile on user signup
    - Function to update mood analytics when journal entries are created
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'User',
  email text,
  language text NOT NULL DEFAULT 'en',
  coins integer NOT NULL DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  mood text NOT NULL,
  tags text[] DEFAULT '{}',
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mood_analytics table
CREATE TABLE IF NOT EXISTS mood_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  emotion text NOT NULL,
  intensity text NOT NULL CHECK (intensity IN ('low', 'medium', 'high')),
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for journal_entries
CREATE POLICY "Users can read own journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for mood_analytics
CREATE POLICY "Users can read own mood analytics"
  ON mood_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood analytics"
  ON mood_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update mood analytics when journal entry is created
CREATE OR REPLACE FUNCTION create_mood_analytics_from_journal()
RETURNS trigger AS $$
DECLARE
  mood_score_value integer;
BEGIN
  -- Convert mood to score
  mood_score_value := CASE NEW.mood
    WHEN 'happy' THEN 5
    WHEN 'okay' THEN 3
    WHEN 'sad' THEN 1
    ELSE 3
  END;

  -- Insert mood analytics entry
  INSERT INTO mood_analytics (user_id, mood_score, emotion, intensity, date)
  VALUES (
    NEW.user_id,
    mood_score_value,
    NEW.mood,
    'medium', -- Default intensity
    DATE(NEW.created_at)
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    mood_score = (mood_analytics.mood_score + mood_score_value) / 2,
    emotion = NEW.mood,
    created_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for mood analytics
DROP TRIGGER IF EXISTS on_journal_entry_created ON journal_entries;
CREATE TRIGGER on_journal_entry_created
  AFTER INSERT ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION create_mood_analytics_from_journal();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_analytics_user_id ON mood_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_analytics_date ON mood_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_analytics_user_date ON mood_analytics(user_id, date);