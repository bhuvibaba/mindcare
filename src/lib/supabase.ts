import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          language: string;
          coins: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email?: string | null;
          language?: string;
          coins?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          language?: string;
          coins?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          mood: string;
          tags: string[];
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          mood: string;
          tags?: string[];
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          mood?: string;
          tags?: string[];
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      mood_analytics: {
        Row: {
          id: string;
          user_id: string;
          mood_score: number;
          emotion: string;
          intensity: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood_score: number;
          emotion: string;
          intensity: string;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood_score?: number;
          emotion?: string;
          intensity?: string;
          date?: string;
          created_at?: string;
        };
      };
    };
  };
}