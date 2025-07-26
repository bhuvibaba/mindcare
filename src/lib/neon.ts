import { Pool } from 'pg';

// Create a connection pool for Neon database
const pool = new Pool({
  connectionString: import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Neon database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Neon database connection failed:', error);
    return false;
  }
};

// Execute query
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// User management
export const createUser = async (name: string, email?: string) => {
  const result = await query(
    'INSERT INTO users (name, email, language, coins) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email || null, 'en', 20]
  );
  return result.rows[0];
};

export const getUser = async (id: string) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const updateUser = async (id: string, updates: any) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  
  const result = await query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0];
};

// Journal entries
export const createJournalEntry = async (userId: string, content: string, mood: string, tags: string[] = [], language: string = 'en') => {
  const result = await query(
    'INSERT INTO journal_entries (user_id, content, mood, tags, language) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, content, mood, tags, language]
  );
  return result.rows[0];
};

export const getJournalEntries = async (userId: string) => {
  const result = await query(
    'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

// Mood analytics
export const getMoodAnalytics = async (userId: string, days: number = 30) => {
  const result = await query(
    `SELECT * FROM mood_analytics 
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '${days} days'
     ORDER BY date DESC`,
    [userId]
  );
  return result.rows;
};

export const createMoodAnalytics = async (userId: string, moodScore: number, emotion: string, intensity: string = 'medium') => {
  const result = await query(
    `INSERT INTO mood_analytics (user_id, mood_score, emotion, intensity, date)
     VALUES ($1, $2, $3, $4, CURRENT_DATE)
     ON CONFLICT (user_id, date) 
     DO UPDATE SET mood_score = (mood_analytics.mood_score + $2) / 2, emotion = $3, updated_at = NOW()
     RETURNING *`,
    [userId, moodScore, emotion, intensity]
  );
  return result.rows[0];
};

export default pool;