import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

// Database types
export interface UserProfile {
  id: string; // Supabase auth user ID
  username: string;
  email?: string;
  phone?: string;
  avatar: string;
  vip_tier: number;
  referral_code: string;
  created_at: string;
  updated_at: string;
}

export interface UserBalances {
  user_id: string;
  main_balance: number;
  game_balance: number;
  referral_balance: number;
  advertiser_balance: number;
  updated_at: string;
}

export interface UserSecurity {
  user_id: string;
  pin_hash?: string;
  two_fa_enabled: boolean;
  two_fa_secret?: string;
  updated_at: string;
}

export interface GameHistory {
  id: string;
  user_id: string;
  game_type: string;
  bet_amount: number;
  win_amount: number;
  multiplier?: number;
  is_win: boolean;
  server_seed_hash: string;
  client_seed: string;
  nonce: number;
  result: any;
  created_at: string;
}

export interface LeaderboardStats {
  user_id: string;
  username: string;
  avatar: string;
  total_wagered: number;
  total_won: number;
  total_profit: number;
  games_played: number;
  win_rate: number;
  biggest_win: number;
  current_streak: number;
  rank: number;
  last_active: string;
  updated_at: string;
}
