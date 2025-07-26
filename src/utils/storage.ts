import { User, JournalEntry, Session, Review } from '../types';

// Mock authentication utilities
export const mockAuth = {
  isLoggedIn: (): boolean => {
    return localStorage.getItem('mindcare_auth_token') !== null;
  },

  login: (email: string, name: string): void => {
    const authToken = btoa(`${email}:${Date.now()}`); // Simple mock token
    localStorage.setItem('mindcare_auth_token', authToken);
    localStorage.setItem('mindcare_auth_email', email);
    
    // Create or update user profile
    const existingUser = storage.getUser();
    const user: User = {
      id: existingUser?.id || Date.now().toString(),
      name: name,
      email: email,
      language: existingUser?.language || 'en',
      coins: existingUser?.coins || 20,
      joinDate: existingUser?.joinDate || new Date()
    };
    storage.setUser(user);
  },

  logout: (): void => {
    localStorage.removeItem('mindcare_auth_token');
    localStorage.removeItem('mindcare_auth_email');
    // Keep user data but mark as logged out
  },

  getCurrentUserEmail: (): string | null => {
    return localStorage.getItem('mindcare_auth_email');
  }
};

// Local storage utilities
export const storage = {
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