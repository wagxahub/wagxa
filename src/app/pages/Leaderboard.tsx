import { Trophy, Crown, Zap, Gift, Users, Share2, Copy, ChevronRight, ArrowUp, ArrowDown, Minus, Flame, Star, Target, Award, Sparkles, Check, Lock } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { useLeaderboard } from '../context/LeaderboardContext';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

export function Leaderboard() {
  const { formatUSDT, username } = useUser();
  const { leaderboard, getTopUsers, getUserRank } = useLeaderboard();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [canClaimReward, setCanClaimReward] = useState(true);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Get top users and transform to expected format
  const leaders = useMemo(() => {
    const topUsers = getTopUsers(50);
    return topUsers.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      earnings: user.totalProfit,
      wins: user.gamesPlayed,
      streak: user.currentStreak,
      rankChange: 0, // We don't track rank changes yet
      badges: user.rank === 1 ? ['crown'] : user.currentStreak >= 5 ? ['fire'] : []
    }));
  }, [leaderboard]);

  // Get current user's stats
  const currentUser = useMemo(() => {
    const userStats = leaderboard.find(u => u.username === username);
    const userRank = getUserRank(username || 'guest') || 0;
    const gamesPlayed = userStats?.gamesPlayed || 0;
    const nextRankTarget = userRank > 30 ? 30 : userRank > 10 ? 10 : userRank > 3 ? 3 : 1;
    const winsNeeded = Math.max(0, 10 - gamesPlayed); // Simplified calculation

    return {
      rank: userRank,
      username: username || 'You',
      earnings: userStats?.totalProfit || 0,
      wins: gamesPlayed,
      streak: userStats?.currentStreak || 0,
      rankChange: 0,
      winsToNextRank: winsNeeded,
      nextRankTarget,
      dailyStreak: 0, // Not tracked yet
      winStreak: userStats?.currentStreak || 0,
    };
  }, [leaderboard, username, getUserRank]);

  const rewards = [
    { tier: 'Top 1', prize: 500, icon: '👑', color: '#FFD700' },
    { tier: 'Top 3', prize: 250, icon: '🥇', color: '#FFA500' },
    { tier: 'Top 10', prize: 100, icon: '🏆', color: '#0A84FF' },
    { tier: 'Top 30', prize: 50, icon: '🎯', color: '#34D399' },
    { tier: 'Top 50', prize: 25, icon: '⭐', color: '#A78BFA' },
  ];

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyReferral = () => {
    const referralCode = 'REF2026XYZ';
    navigator.clipboard.writeText(`Join me on the platform! Use code: ${referralCode}`);
    toast.success('Referral link copied!');
  };

  const handleClaimReward = () => {
    if (!canClaimReward || rewardClaimed) {
      toast.info('No rewards available to claim right now');
      return;
    }
    setShowRewardModal(true);
    setRewardClaimed(true);
    setTimeout(() => {
      setShowRewardModal(false);
    }, 3000);
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'fire': return <Flame className="w-3.5 h-3.5" style={{ color: '#FF6B35' }} />;
      case 'crown': return <Crown className="w-3.5 h-3.5" style={{ color: '#FFD700' }} />;
      case 'star': return <Star className="w-3.5 h-3.5" style={{ color: '#FFA500' }} />;
      default: return null;
    }
  };

  const getRankChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center gap-1">
          <ArrowUp className="w-3.5 h-3.5" style={{ color: '#34D399' }} />
          <span className="text-xs font-semibold" style={{ color: '#34D399' }}>+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1">
          <ArrowDown className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
          <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>{change}</span>
        </div>
      );
    }
    return <Minus className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0B0F1A' }}>
      <TopBar />

      {/* DESKTOP: STRUCTURED LAYOUT - MAX 1320px */}
      <div className="w-full max-w-[1320px] mx-auto px-4 md:px-6 lg:px-10 flex-1 pb-32">
        
        {/* Back Button */}
        <div className="mb-5">
          <BackButton />
        </div>

        {/* PAGE HEADER */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              boxShadow: '0 4px 16px rgba(255, 215, 0, 0.2)'
            }}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">Leaderboard</h1>
              <p className="text-sm text-gray-400 truncate">Compete & Win Rewards</p>
            </div>
          </div>
          <button 
            onClick={handleShare}
            className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-transform active:scale-95"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Share2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* DESKTOP: 70/30 SPLIT LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* LEFT COLUMN: 70% - PRIMARY CONTENT */}
          <div className="w-full lg:flex-[0.7]">

            {/* TOP PODIUM */}
            {leaders.length >= 3 && (
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 mb-6">

              {/* Rank #2 */}
              <div className="w-full md:w-auto md:flex-1 md:max-w-[200px] order-2 md:order-1">
                <div 
                  className="w-full rounded-2xl p-5 text-center transition-transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(192, 192, 192, 0.05) 100%)',
                    border: '1px solid rgba(192, 192, 192, 0.2)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
                    }}>
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white" style={{
                      backgroundColor: '#C0C0C0'
                    }}>
                      2
                    </div>
                    
                    <p className="w-full font-bold text-sm text-white truncate">
                      {leaders[1].username}
                    </p>
                    
                    <p className="text-lg font-bold" style={{ color: '#C0C0C0' }}>
                      {formatUSDT(leaders[1].earnings)}
                    </p>
                    
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FF6B35' }} />
                      <span className="text-xs font-medium text-gray-400">
                        {leaders[1].streak} streak
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500">{leaders[1].wins} wins</p>
                  </div>
                </div>
              </div>

              {/* Rank #1 */}
              <div className="w-full md:w-auto md:flex-1 md:max-w-[260px] order-1 md:order-2">
                <div 
                  className="w-full rounded-2xl p-6 text-center transition-transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    boxShadow: '0 8px 24px rgba(255, 215, 0, 0.2), 0 0 40px rgba(255, 215, 0, 0.1)'
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 flex-shrink-0 rounded-full flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
                    }}>
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    }}>
                      1
                    </div>
                    
                    <p className="w-full font-bold text-base text-white truncate">
                      {leaders[0].username}
                    </p>
                    
                    <p className="text-xl font-bold" style={{ color: '#FFD700' }}>
                      {formatUSDT(leaders[0].earnings)}
                    </p>
                    
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 flex-shrink-0" style={{ color: '#FF6B35' }} />
                      <span className="text-sm font-semibold" style={{ color: '#FF6B35' }}>
                        {leaders[0].streak} streak
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {leaders[0].badges.map((badge, idx) => (
                        <div key={idx} className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center" style={{
                          backgroundColor: 'rgba(255, 215, 0, 0.1)'
                        }}>
                          {getBadgeIcon(badge)}
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-500">{leaders[0].wins} wins</p>
                  </div>
                </div>
              </div>

              {/* Rank #3 */}
              <div className="w-full md:w-auto md:flex-1 md:max-w-[200px] order-3">
                <div 
                  className="w-full rounded-2xl p-5 text-center transition-transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(205, 127, 50, 0.05) 100%)',
                    border: '1px solid rgba(205, 127, 50, 0.2)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
                    }}>
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white" style={{
                      backgroundColor: '#CD7F32'
                    }}>
                      3
                    </div>
                    
                    <p className="w-full font-bold text-sm text-white truncate">
                      {leaders[2].username}
                    </p>
                    
                    <p className="text-lg font-bold" style={{ color: '#CD7F32' }}>
                      {formatUSDT(leaders[2].earnings)}
                    </p>
                    
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FF6B35' }} />
                      <span className="text-xs font-medium text-gray-400">
                        {leaders[2].streak} streak
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500">{leaders[2].wins} wins</p>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Empty State */}
            {leaders.length === 0 && (
              <div className="w-full rounded-2xl p-12 text-center mb-6" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold text-white mb-2">No Leaders Yet</h3>
                <p className="text-gray-400 text-sm">Be the first to climb the leaderboard!</p>
              </div>
            )}

            {/* TOP PLAYERS LIST */}
            <div className="w-full rounded-2xl p-6" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div className="w-full flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Top Players</h2>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3 flex-shrink-0" style={{ color: '#34D399' }} />
                    <span>Up</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowDown className="w-3 h-3 flex-shrink-0" style={{ color: '#EF4444' }} />
                    <span>Down</span>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col gap-3">
                {leaders.map((leader) => {
                  const isCurrentUser = leader.rank === currentUser.rank;
                  
                  return (
                    <div
                      key={leader.rank}
                      className="w-full flex items-center justify-between gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                      style={{
                        backgroundColor: isCurrentUser 
                          ? 'rgba(10, 132, 255, 0.1)' 
                          : leader.rank <= 3 
                            ? 'rgba(255, 215, 0, 0.05)' 
                            : 'rgba(255, 255, 255, 0.02)',
                        border: isCurrentUser ? '1px solid rgba(10, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <div
                        className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold"
                        style={{
                          background: leader.rank === 1 
                            ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                            : leader.rank === 2
                              ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
                              : leader.rank === 3
                                ? 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'
                                : isCurrentUser
                                  ? 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)'
                                  : 'rgba(255, 255, 255, 0.05)',
                          color: leader.rank <= 3 || isCurrentUser ? 'white' : '#9CA3AF',
                          border: leader.rank <= 3 || isCurrentUser ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {leader.rank}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white truncate">
                            {isCurrentUser ? 'You' : leader.username}
                          </p>
                          {leader.badges.length > 0 && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {leader.badges.slice(0, 2).map((badge, idx) => (
                                <div key={idx}>
                                  {getBadgeIcon(badge)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {leader.wins} wins • {leader.streak} streak
                        </p>
                      </div>
                      
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                        <p className="font-bold whitespace-nowrap" style={{ 
                          color: leader.rank === 1 ? '#FFD700' : leader.rank === 2 ? '#C0C0C0' : leader.rank === 3 ? '#CD7F32' : '#0A84FF' 
                        }}>
                          {formatUSDT(leader.earnings)}
                        </p>
                        {getRankChangeIndicator(leader.rankChange)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                className="w-full mt-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'rgba(10, 132, 255, 0.1)',
                  color: '#0A84FF',
                  border: '1px solid rgba(10, 132, 255, 0.2)'
                }}
              >
                <span>View Full Leaderboard</span>
                <ChevronRight className="w-5 h-5 flex-shrink-0" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: 30% - STATS & CTA */}
          <div className="w-full lg:flex-[0.3] flex flex-col gap-5">
            
            {/* YOUR POSITION CARD */}
            <div 
              className="w-full rounded-2xl p-5 flex flex-col gap-5"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.1) 0%, rgba(10, 132, 255, 0.05) 100%)',
                border: '1px solid rgba(10, 132, 255, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="w-full flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg text-white" style={{
                    background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
                  }}>
                    #{currentUser.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">Your Position</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getRankChangeIndicator(currentUser.rankChange)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold" style={{ color: '#0A84FF' }}>
                    {formatUSDT(currentUser.earnings)}
                  </p>
                  <p className="text-xs text-gray-400">{currentUser.wins} wins</p>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2">
                <div className="w-full flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-300 truncate flex-1">
                    Progress to Top {currentUser.nextRankTarget}
                  </p>
                  <p className="text-sm font-semibold flex-shrink-0" style={{ color: '#0A84FF' }}>
                    {currentUser.winsToNextRank} more wins
                  </p>
                </div>
                
                <div className="w-full relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(10, 132, 255, 0.15)' }}>
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      width: `${((currentUser.wins) / (currentUser.wins + currentUser.winsToNextRank)) * 100}%`,
                      background: 'linear-gradient(90deg, #0A84FF 0%, #0066CC 100%)',
                    }}
                  />
                </div>
              </div>

              <div className="w-full flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{
                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                  border: '1px solid rgba(255, 107, 53, 0.2)'
                }}>
                  <Flame className="w-4 h-4 flex-shrink-0" style={{ color: '#FF6B35' }} />
                  <span className="text-xs font-semibold whitespace-nowrap" style={{ color: '#FF6B35' }}>
                    {currentUser.streak} Win Streak
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{
                  backgroundColor: 'rgba(52, 211, 153, 0.1)',
                  border: '1px solid rgba(52, 211, 153, 0.2)'
                }}>
                  <Zap className="w-4 h-4 flex-shrink-0" style={{ color: '#34D399' }} />
                  <span className="text-xs font-semibold whitespace-nowrap" style={{ color: '#34D399' }}>
                    Active Player
                  </span>
                </div>
              </div>

              <button 
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
                }}
                onClick={() => window.location.href = '/dashboard'}
              >
                <Target className="w-5 h-5 flex-shrink-0" />
                <span>Play to Rank Up</span>
                <ChevronRight className="w-5 h-5 flex-shrink-0" />
              </button>
            </div>

            {/* WEEKLY REWARDS */}
            <div className="w-full rounded-2xl p-5" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div className="w-full flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Weekly Rewards</h3>
                <p className="text-xs text-gray-400">Resets in 3 days</p>
              </div>
              
              <div className="w-full flex flex-col gap-3">
                {rewards.map((reward, idx) => {
                  const isUserTarget = reward.tier === 'Top 50';
                  
                  return (
                    <div 
                      key={idx}
                      className="w-full rounded-xl p-4 transition-transform hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                        border: isUserTarget ? `2px solid ${reward.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: isUserTarget ? `0 4px 16px ${reward.color}40` : 'none'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{reward.icon}</div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-400">
                            {reward.tier}
                          </p>
                          <p className="text-lg font-bold" style={{ color: reward.color }}>
                            ${reward.prize}
                          </p>
                        </div>
                        {isUserTarget && (
                          <div className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center" style={{
                            backgroundColor: reward.color
                          }}>
                            <Target className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STREAK TRACKERS */}
            <div className="w-full flex flex-col gap-4">
              {/* Daily Streak */}
              <div 
                className="w-full rounded-2xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)',
                  border: '1px solid rgba(255, 107, 53, 0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 flex-shrink-0" style={{ color: '#FF6B35' }} />
                  <h3 className="text-sm font-bold text-white">Daily Streak</h3>
                </div>
                
                <p className="text-2xl font-bold mb-2" style={{ color: '#FF6B35' }}>
                  {currentUser.dailyStreak} Days
                </p>
                
                <div className="w-full relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 107, 53, 0.15)' }}>
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      width: `${(currentUser.dailyStreak / 10) * 100}%`,
                      background: 'linear-gradient(90deg, #FF6B35 0%, #FF8C42 100%)',
                    }}
                  />
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  {10 - currentUser.dailyStreak} days to next reward
                </p>
              </div>

              {/* Win Streak */}
              <div 
                className="w-full rounded-2xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
                  border: '1px solid rgba(52, 211, 153, 0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 flex-shrink-0" style={{ color: '#34D399' }} />
                  <h3 className="text-sm font-bold text-white">Win Streak</h3>
                </div>
                
                <p className="text-2xl font-bold mb-2" style={{ color: '#34D399' }}>
                  {currentUser.winStreak} Wins
                </p>
                
                <div className="w-full relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)' }}>
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      width: `${(currentUser.winStreak / 5) * 100}%`,
                      background: 'linear-gradient(90deg, #34D399 0%, #10B981 100%)',
                    }}
                  />
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  {5 - currentUser.winStreak} wins to next milestone
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full"
            style={{ backgroundColor: '#1A1F2E' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-4">Share Your Progress</h2>
            <p className="text-sm text-gray-400 mb-6">
              Share your leaderboard position and invite friends to compete!
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCopyReferral}
                className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{
                  backgroundColor: '#0A84FF',
                  color: 'white'
                }}
              >
                <Copy className="w-5 h-5" />
                Copy Link
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-6 py-3 rounded-xl font-semibold transition-all active:scale-95"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div 
            className="rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
            style={{ backgroundColor: '#1A1F2E' }}
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
            }}>
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
            <p className="text-gray-400 mb-4">You've earned a reward!</p>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{
              backgroundColor: 'rgba(34, 197, 94, 0.2)'
            }}>
              <Check className="w-6 h-6" style={{ color: '#34D399' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
