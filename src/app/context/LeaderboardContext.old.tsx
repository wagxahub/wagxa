import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  // Load leaderboard from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('wagxa_leaderboard');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setLeaderboard(data);
      } catch (e) {
        console.error('Failed to load leaderboard:', e);
      }
    }
  }, []);

  // Save leaderboard to localStorage whenever it changes
  useEffect(() => {
    if (leaderboard.length > 0) {
      localStorage.setItem('wagxa_leaderboard', JSON.stringify(leaderboard));
    }
  }, [leaderboard]);

  // Update leaderboard rankings
  const updateRankings = (users: LeaderboardUser[]): LeaderboardUser[] => {
    // Sort by total profit (descending)
    const sorted = [...users].sort((a, b) => b.totalProfit - a.totalProfit);

    // Assign ranks
    return sorted.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
  };

  // Update user stats
  const updateUserStats = (userId: string, stats: Partial<LeaderboardUser>) => {
    setLeaderboard(prev => {
      const existingIndex = prev.findIndex(u => u.userId === userId);

      if (existingIndex >= 0) {
        // Update existing user
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...stats,
          lastActive: Date.now()
        };
        return updateRankings(updated);
      } else {
        // Add new user
        const newUser: LeaderboardUser = {
          userId,
          username: stats.username || 'Guest',
          avatar: stats.avatar || '👤',
          totalWagered: stats.totalWagered || 0,
          totalWon: stats.totalWon || 0,
          totalProfit: stats.totalProfit || 0,
          gamesPlayed: stats.gamesPlayed || 0,
          winRate: stats.winRate || 0,
          biggestWin: stats.biggestWin || 0,
          currentStreak: stats.currentStreak || 0,
          rank: 0,
          lastActive: Date.now()
        };
        return updateRankings([...prev, newUser]);
      }
    });
  };

  // Record a game played
  const recordGamePlayed = (userId: string, wagered: number, won: number, isWin: boolean) => {
    setLeaderboard(prev => {
      const existingIndex = prev.findIndex(u => u.userId === userId);
      const profit = won - wagered;

      if (existingIndex >= 0) {
        // Update existing user
        const user = prev[existingIndex];
        const updated = [...prev];

        const newGamesPlayed = user.gamesPlayed + 1;
        const newTotalWagered = user.totalWagered + wagered;
        const newTotalWon = user.totalWon + won;
        const newTotalProfit = user.totalProfit + profit;
        const newBiggestWin = Math.max(user.biggestWin, won);
        const newCurrentStreak = isWin ? user.currentStreak + 1 : 0;

        // Calculate win rate
        const totalWins = isWin
          ? Math.floor(user.winRate * user.gamesPlayed / 100) + 1
          : Math.floor(user.winRate * user.gamesPlayed / 100);
        const newWinRate = (totalWins / newGamesPlayed) * 100;

        updated[existingIndex] = {
          ...user,
          gamesPlayed: newGamesPlayed,
          totalWagered: newTotalWagered,
          totalWon: newTotalWon,
          totalProfit: newTotalProfit,
          winRate: Math.round(newWinRate * 100) / 100,
          biggestWin: newBiggestWin,
          currentStreak: newCurrentStreak,
          lastActive: Date.now()
        };

        return updateRankings(updated);
      } else {
        // Create new user entry
        const newUser: LeaderboardUser = {
          userId,
          username: 'Guest',
          avatar: '👤',
          totalWagered: wagered,
          totalWon: won,
          totalProfit: profit,
          gamesPlayed: 1,
          winRate: isWin ? 100 : 0,
          biggestWin: won,
          currentStreak: isWin ? 1 : 0,
          rank: 0,
          lastActive: Date.now()
        };

        return updateRankings([...prev, newUser]);
      }
    });
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

  // Clear leaderboard
  const clearLeaderboard = () => {
    setLeaderboard([]);
    localStorage.removeItem('wagxa_leaderboard');
  };

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        updateUserStats,
        recordGamePlayed,
        getUserRank,
        getTopUsers,
        clearLeaderboard
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
}
