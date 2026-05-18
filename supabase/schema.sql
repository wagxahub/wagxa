-- Gaming Platform Database Schema
-- Run this SQL in your Supabase SQL Editor: https://supabase.com/dashboard/project/vaannirvtlogjxmsphlg/sql

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  avatar TEXT NOT NULL DEFAULT '👤',
  vip_tier INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Balances Table
CREATE TABLE IF NOT EXISTS user_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  main_balance DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  game_balance DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  referral_balance DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  advertiser_balance DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Security Table
CREATE TABLE IF NOT EXISTS user_security (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash TEXT,
  two_fa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  two_fa_secret TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Game History Table
CREATE TABLE IF NOT EXISTS game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  bet_amount DECIMAL(20, 2) NOT NULL,
  win_amount DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  multiplier DECIMAL(10, 2),
  is_win BOOLEAN NOT NULL,
  server_seed_hash TEXT NOT NULL,
  client_seed TEXT NOT NULL,
  nonce INTEGER NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leaderboard Stats Table
CREATE TABLE IF NOT EXISTS leaderboard_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar TEXT NOT NULL,
  total_wagered DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  total_won DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  total_profit DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  games_played INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  biggest_win DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  current_streak INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 0,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_history_user_id ON game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_game_history_created_at ON game_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_stats(rank ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_profit ON leaderboard_stats(total_profit DESC);

-- Row Level Security Policies

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Balances
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balances"
  ON user_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own balances"
  ON user_balances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balances"
  ON user_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Security
ALTER TABLE user_security ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own security settings"
  ON user_security FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings"
  ON user_security FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings"
  ON user_security FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Game History
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own game history"
  ON game_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game history"
  ON game_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Leaderboard Stats
ALTER TABLE leaderboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard stats"
  ON leaderboard_stats FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own leaderboard stats"
  ON leaderboard_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leaderboard stats"
  ON leaderboard_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_balances_updated_at
  BEFORE UPDATE ON user_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_security_updated_at
  BEFORE UPDATE ON user_security
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_stats_updated_at
  BEFORE UPDATE ON leaderboard_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user data on signup
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
DECLARE
  random_username TEXT;
  random_code TEXT;
BEGIN
  -- Generate random username (User_XXXXX)
  random_username := 'User_' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');

  -- Generate random referral code
  random_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));

  -- Insert user profile
  INSERT INTO user_profiles (id, username, email, referral_code)
  VALUES (NEW.id, random_username, NEW.email, random_code);

  -- Insert initial balances
  INSERT INTO user_balances (user_id)
  VALUES (NEW.id);

  -- Insert security settings
  INSERT INTO user_security (user_id)
  VALUES (NEW.id);

  -- Insert leaderboard stats
  INSERT INTO leaderboard_stats (user_id, username, avatar)
  VALUES (NEW.id, random_username, '👤');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user data on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_data();
