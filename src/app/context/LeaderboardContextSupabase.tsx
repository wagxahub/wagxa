import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

export interface LeaderboardUser {
  userId: string;
  username: string;
  avatar: string;
  totalWagered: number;
  totalWon: number;
  totalProfit: number;
  gamesPlayed: number;
  winRate: number;
  biggestWin: number;
  currentStreak: number;
  rank: number;
  lastActive: number;
}

interface LeaderboardContextType {
  leaderboard: LeaderboardUser[];
  updateUserStats: (userId: string, stats: Partial<LeaderboardUser>) => void;
  recordGamePlayed: (userId: string, wagered: number, won: number, isWin: boolean) => void;
  getUserRank: (userId: string) => number;
  getTopUsers: (limit: number) => LeaderboardUser[];
  clearLeaderboard: () => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  // Load leaderboard from Supabase on mount and when user changes
  useEffect(() => {
    loadLeaderboard();

    // Set up real-time subscription
    const subscription = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leaderboard_stats'
      }, () => {
        loadLeaderboard();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .order('total_profit', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData: LeaderboardUser[] = data.map((row, index) => ({
          userId: row.user_id,
          username: row.username,
          avatar: row.avatar,
          totalWagered: parseFloat(row.total_wagered.toString()),
          totalWon: parseFloat(row.total_won.toString()),
          totalProfit: parseFloat(row.total_profit.toString()),
          gamesPlayed: row.games_played,
          winRate: parseFloat(row.win_rate.toString()),
          biggestWin: parseFloat(row.biggest_win.toString()),
          currentStreak: row.current_streak,
          rank: index + 1, // Assign rank based on sorted order
          lastActive: new Date(row.last_active).getTime()
        }));

        setLeaderboard(formattedData);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  // Record a game played
  const recordGamePlayed = async (userId: string, wagered: number, won: number, isWin: boolean) => {
    if (!user) return;

    try {
      const profit = won - wagered;

      // Fetch current stats
      const { data: currentStats } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (currentStats) {
        // Update existing stats
        const newGamesPlayed = currentStats.games_played + 1;
        const newTotalWagered = parseFloat(currentStats.total_wagered.toString()) + wagered;
        const newTotalWon = parseFloat(currentStats.total_won.toString()) + won;
        const newTotalProfit = parseFloat(currentStats.total_profit.toString()) + profit;
        const newBiggestWin = Math.max(parseFloat(currentStats.biggest_win.toString()), won);
        const newCurrentStreak = isWin ? currentStats.current_streak + 1 : 0;

        // Calculate win rate
        const totalWins = isWin
          ? Math.floor(parseFloat(currentStats.win_rate.toString()) * currentStats.games_played / 100) + 1
          : Math.floor(parseFloat(currentStats.win_rate.toString()) * currentStats.games_played / 100);
        const newWinRate = (totalWins / newGamesPlayed) * 100;

        await supabase
          .from('leaderboard_stats')
          .update({
            total_wagered: newTotalWagered,
            total_won: newTotalWon,
            total_profit: newTotalProfit,
            games_played: newGamesPlayed,
            win_rate: Math.round(newWinRate * 100) / 100,
            biggest_win: newBiggestWin,
            current_streak: newCurrentStreak,
            last_active: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Create new stats entry (shouldn't happen due to trigger, but just in case)
        const winRate = isWin ? 100 : 0;

        await supabase
          .from('leaderboard_stats')
          .insert({
            user_id: user.id,
            username: userId,
            avatar: '👤',
            total_wagered: wagered,
            total_won: won,
            total_profit: profit,
            games_played: 1,
            win_rate: winRate,
            biggest_win: won,
            current_streak: isWin ? 1 : 0,
            last_active: new Date().toISOString()
          });
      }

      // Reload leaderboard to update rankings
      await loadLeaderboard();
    } catch (error) {
      console.error('Error recording game:', error);
    }
  };

  // Update user stats
  const updateUserStats = async (userId: string, stats: Partial<LeaderboardUser>) => {
    if (!user) return;

    try {
      await supabase
        .from('leaderboard_stats')
        .update({
          username: stats.username,
          avatar: stats.avatar,
          total_wagered: stats.totalWagered,
          total_won: stats.totalWon,
          total_profit: stats.totalProfit,
          games_played: stats.gamesPlayed,
          win_rate: stats.winRate,
          biggest_win: stats.biggestWin,
          current_streak: stats.currentStreak,
          last_active: new Date().toISOString()
        })
        .eq('user_id', user.id);

      await loadLeaderboard();
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  // Get user's rank
  const getUserRank = (userId: string): number => {
    const user = leaderboard.find(u => u.userId === userId);
    return user?.rank || 0;
  };

  // Get top N users
  const getTopUsers = (limit: number): LeaderboardUser[] => {
    return leaderboard.slice(0, limit);
  };

  // Clear leaderboard (admin function)
  const clearLeaderboard = async () => {
    try {
      await supabase.from('leaderboard_stats').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
      setLeaderboard([]);
    } catch (error) {
      console.error('Error clearing leaderboard:', error);
    }
  };

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        updateUserStats,
        recordGamePlayed,
        getUserRank,
        getTopUsers,
        clearLeaderboard,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
}
