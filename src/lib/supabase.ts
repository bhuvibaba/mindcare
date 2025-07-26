import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://edjmhhzpltfbcuembals.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkam1oaHpwbHRmYmN1ZW1iYWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDE2MjgsImV4cCI6MjA2OTA3NzYyOH0.LYDjWMrgHgkXw1hm7YDccVV8OExgBI-4G4xpPdtUJg8';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found, using fallback values');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};
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