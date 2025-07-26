import { User, JournalEntry, Session, Review } from '../types';
import { neonStorage } from './neonStorage';

// Local storage utilities
export const storage = {
  // Database connection test
  testDatabaseConnection: async (): Promise<boolean> => {
    try {
      return await neonStorage.testConnection();
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  },

  // User data
  getUser: (): User | null => {
    const userData = localStorage.getItem('mindcare_user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  },

  setUser: (user: User): void => {
    localStorage.setItem('mindcare_user', JSON.stringify(user));
  },

  // Journal entries
  getJournalEntries: (): JournalEntry[] => {
    const entries = localStorage.getItem('mindcare_journal');
    if (entries) {
      return JSON.parse(entries);
    }
    return [];
  },

  addJournalEntry: (entry: JournalEntry): void => {
    const entries = storage.getJournalEntries();
    entries.push(entry);
    localStorage.setItem('mindcare_journal', JSON.stringify(entries));
    
    // Also save to database if user is logged in
    const user = storage.getUser();
    if (user && user.id) {
      neonStorage.createJournalEntry(
        user.id, 
        entry.content, 
        entry.mood, 
        entry.tags, 
        entry.language
      ).catch(error => {
        console.error('Failed to sync journal entry to database:', error);
      });
    }
  },

  // Sessions
  getSessions: (): Session[] => {
    const sessions = localStorage.getItem('mindcare_sessions');
    return sessions ? JSON.parse(sessions) : [];
  },

  addSession: (session: Session): void => {
    const sessions = storage.getSessions();
    sessions.push(session);
    localStorage.setItem('mindcare_sessions', JSON.stringify(sessions));
  },

  // Reviews
  getReviews: (): Review[] => {
    const reviews = localStorage.getItem('mindcare_reviews');
    return reviews ? JSON.parse(reviews) : [];
  },

  addReview: (review: Review): void => {
    const reviews = storage.getReviews();
    reviews.push(review);
    localStorage.setItem('mindcare_reviews', JSON.stringify(reviews));
  },

  // Coins
  updateCoins: (coins: number): void => {
    const user = storage.getUser();
    if (user) {
      user.coins = Math.max(0, coins);
      storage.setUser(user);
    }
  },

  // Language preference
  getLanguage: (): string => {
    return localStorage.getItem('mindcare_language') || 'en';
  },

  setLanguage: (language: string): void => {
    localStorage.setItem('mindcare_language', language);
  },

  // Database operations
  async createDatabaseUser(name: string, email?: string): Promise<User | null> {
    try {
      return await neonStorage.createUser(name, email);
    } catch (error) {
      console.error('Error creating database user:', error);
      return null;
    }
  },

  async syncJournalEntries(userId: string): Promise<JournalEntry[]> {
    try {
      return await neonStorage.getJournalEntries(userId);
    } catch (error) {
      console.error('Error syncing journal entries:', error);
      return [];
    }
  },

  async syncMoodAnalytics(userId: string, days: number = 30) {
    try {
      return await neonStorage.getMoodAnalytics(userId, days);
    } catch (error) {
      console.error('Error syncing mood analytics:', error);
      return [];
    }
  }
};

// Initialize default user if none exists
export const initializeUser = (): User => {
  let user = storage.getUser();
  if (!user) {
    user = {
      id: Date.now().toString(),
      name: 'User',
      email: '',
      language: 'en',
      coins: 20, // Starting coins
      joinDate: new Date()
    };
    storage.setUser(user);
  }
  return user;
};

// Initialize database connection on app start
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    const connected = await storage.testDatabaseConnection();
    if (connected) {
      console.log('✅ Neon database connected successfully');
    } else {
      console.log('⚠️ Database connection failed, using local storage only');
    }
    return connected;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};