import { 
  createUser, 
  getUser, 
  updateUser, 
  createJournalEntry, 
  getJournalEntries, 
  getMoodAnalytics,
  createMoodAnalytics,
  testConnection 
} from '../lib/neon';
import { User, JournalEntry } from '../types';

// Storage interface for Neon database
export const neonStorage = {
  // Test connection
  testConnection,

  // User management
  async createUser(name: string, email?: string): Promise<User> {
    try {
      const dbUser = await createUser(name, email);
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email || '',
        language: dbUser.language,
        coins: dbUser.coins,
        joinDate: new Date(dbUser.created_at)
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getUser(id: string): Promise<User | null> {
    try {
      const dbUser = await getUser(id);
      if (!dbUser) return null;
      
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email || '',
        language: dbUser.language,
        coins: dbUser.coins,
        joinDate: new Date(dbUser.created_at)
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const dbUser = await updateUser(id, updates);
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email || '',
        language: dbUser.language,
        coins: dbUser.coins,
        joinDate: new Date(dbUser.created_at)
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  },

  // Journal entries
  async createJournalEntry(userId: string, content: string, mood: string, tags: string[] = [], language: string = 'en'): Promise<JournalEntry> {
    try {
      const dbEntry = await createJournalEntry(userId, content, mood, tags, language);
      return {
        id: dbEntry.id,
        userId: dbEntry.user_id,
        date: new Date(dbEntry.created_at),
        content: dbEntry.content,
        mood: dbEntry.mood,
        tags: dbEntry.tags || [],
        language: dbEntry.language
      };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  },

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    try {
      const dbEntries = await getJournalEntries(userId);
      return dbEntries.map(entry => ({
        id: entry.id,
        userId: entry.user_id,
        date: new Date(entry.created_at),
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags || [],
        language: entry.language
      }));
    } catch (error) {
      console.error('Error getting journal entries:', error);
      return [];
    }
  },

  // Mood analytics
  async getMoodAnalytics(userId: string, days: number = 30) {
    try {
      const analytics = await getMoodAnalytics(userId, days);
      return analytics.map(item => ({
        id: item.id,
        userId: item.user_id,
        moodScore: item.mood_score,
        emotion: item.emotion,
        intensity: item.intensity,
        date: new Date(item.date),
        createdAt: new Date(item.created_at)
      }));
    } catch (error) {
      console.error('Error getting mood analytics:', error);
      return [];
    }
  },

  async createMoodAnalytics(userId: string, moodScore: number, emotion: string, intensity: string = 'medium') {
    try {
      const analytics = await createMoodAnalytics(userId, moodScore, emotion, intensity);
      return {
        id: analytics.id,
        userId: analytics.user_id,
        moodScore: analytics.mood_score,
        emotion: analytics.emotion,
        intensity: analytics.intensity,
        date: new Date(analytics.date),
        createdAt: new Date(analytics.created_at)
      };
    } catch (error) {
      console.error('Error creating mood analytics:', error);
      throw error;
    }
  }
};