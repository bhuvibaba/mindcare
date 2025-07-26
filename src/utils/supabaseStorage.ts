import { supabase } from '../lib/supabase';
import { User, JournalEntry } from '../types';

// Auth utilities
export const authUtils = {
  // Sign up with email and password
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
};

// Profile utilities
export const profileUtils = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email || '',
      language: data.language,
      coins: data.coins,
      joinDate: new Date(data.created_at),
    } as User;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<User>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        email: updates.email,
        language: updates.language,
        coins: updates.coins,
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    
    return data;
  },

  // Update user coins
  updateCoins: async (userId: string, coins: number) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ coins: Math.max(0, coins) })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating coins:', error);
      return null;
    }
    
    return data;
  },
};

// Journal utilities
export const journalUtils = {
  // Get all journal entries for a user
  getJournalEntries: async (userId: string): Promise<JournalEntry[]> => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching journal entries:', error);
      return [];
    }
    
    return data.map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      date: new Date(entry.created_at),
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags,
      language: entry.language,
    }));
  },

  // Add a new journal entry
  addJournalEntry: async (entry: Omit<JournalEntry, 'id'>) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: entry.userId,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags,
        language: entry.language,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding journal entry:', error);
      return null;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      date: new Date(data.created_at),
      content: data.content,
      mood: data.mood,
      tags: data.tags,
      language: data.language,
    } as JournalEntry;
  },

  // Update a journal entry
  updateJournalEntry: async (entryId: string, updates: Partial<JournalEntry>) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        content: updates.content,
        mood: updates.mood,
        tags: updates.tags,
        language: updates.language,
      })
      .eq('id', entryId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating journal entry:', error);
      return null;
    }
    
    return data;
  },

  // Delete a journal entry
  deleteJournalEntry: async (entryId: string) => {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);
    
    if (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
    
    return true;
  },
};

// Mood analytics utilities
export const moodUtils = {
  // Get mood analytics for a user
  getMoodAnalytics: async (userId: string, days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('mood_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching mood analytics:', error);
      return [];
    }
    
    return data;
  },

  // Get mood trends for charts
  getMoodTrends: async (userId: string, period: 'week' | 'month' | 'quarter' = 'week') => {
    let days = 7;
    if (period === 'month') days = 30;
    if (period === 'quarter') days = 90;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('mood_analytics')
      .select('date, mood_score, emotion, intensity')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching mood trends:', error);
      return [];
    }
    
    return data;
  },

  // Get mood distribution
  getMoodDistribution: async (userId: string, days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('mood_analytics')
      .select('emotion')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0]);
    
    if (error) {
      console.error('Error fetching mood distribution:', error);
      return {};
    }
    
    // Count emotions
    const distribution: Record<string, number> = {};
    data.forEach(item => {
      distribution[item.emotion] = (distribution[item.emotion] || 0) + 1;
    });
    
    return distribution;
  },

  // Add mood analytics entry (usually triggered by journal entry)
  addMoodAnalytics: async (userId: string, moodScore: number, emotion: string, intensity: string) => {
    const { data, error } = await supabase
      .from('mood_analytics')
      .insert({
        user_id: userId,
        mood_score: moodScore,
        emotion,
        intensity,
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding mood analytics:', error);
      return null;
    }
    
    return data;
  },
};

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to journal entries changes
  subscribeToJournalEntries: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('journal_entries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to mood analytics changes
  subscribeToMoodAnalytics: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('mood_analytics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_analytics',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to profile changes
  subscribeToProfile: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};