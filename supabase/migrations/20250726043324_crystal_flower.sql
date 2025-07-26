-- MindCare Database Schema for Neon PostgreSQL
-- Run this in your Neon database console or via psql

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'User',
  email TEXT UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  coins INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create mood_analytics table
CREATE TABLE IF NOT EXISTS mood_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  emotion TEXT NOT NULL,
  intensity TEXT NOT NULL CHECK (intensity IN ('low', 'medium', 'high')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create function to update mood analytics when journal entry is created
CREATE OR REPLACE FUNCTION create_mood_analytics_from_journal()
RETURNS TRIGGER AS $$
DECLARE
  mood_score_value INTEGER;
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
    'medium',
    DATE(NEW.created_at)
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    mood_score = (mood_analytics.mood_score + mood_score_value) / 2,
    emotion = NEW.mood,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mood analytics
DROP TRIGGER IF EXISTS on_journal_entry_created ON journal_entries;
CREATE TRIGGER on_journal_entry_created
  AFTER INSERT ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION create_mood_analytics_from_journal();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
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

-- Insert a sample user for testing (optional)
-- INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com');