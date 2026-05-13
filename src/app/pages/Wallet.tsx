import { Menu, User, Bell, Eye, ArrowDown, ArrowUp, Gamepad2, ArrowRight, Gift, TrendingUp, DollarSign, Crown, Clock, ChevronRight, Sparkles, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useBonus } from '../context/BonusContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { TransferModal } from '../components/TransferModal';
import { toast } from 'sonner';
import { TopBar } from '../components/TopBar';
import { ResponsiveContainer } from '../components/ResponsiveContainer';
import NoDepositBonusModal from '../components/NoDepositBonusModal';

export function Wallet() {
  const { gameBalance, usdtBalance, formatUSDT, balance, formatCurrency, isVIP, setBalance, setGameBalance, transactions: contextTransactions, addTransaction } = useUser();
  const { bonusBalance, activeBonus, getBonusProgress, hasClaimedWelcomeBonus, hasClaimedNoDepositBonus } = useBonus();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 15, minutes: 17 });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferToGameModal, setShowTransferToGameModal] = useState(false);
  const [showTransferFromGameModal, setShowTransferFromGameModal] = useState(false);
  const [showGiftUpgradeModal, setShowGiftUpgradeModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showNoDepositModal, setShowNoDepositModal] = useState(false);
  const [isGiftClaimed, setIsGiftClaimed] = useState(false);
  const [reward, setReward] = useState(0);
  const [rewardType, setRewardType] = useState<'cash' | 'vip1' | 'vip2' | 'vip3' | 'cashback'>('cash');
  const [isOpening, setIsOpening] = useState(false);

  // Calculate total balance correctly: main balance + game balance + bonus balance
  const totalBalance = balance + gameBalance + bonusBalance;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes } = prev;
        if (minutes > 0) {
          minutes--;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
        }
        return { hours, minutes };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check if gift was claimed today
  useEffect(() => {
    const lastClaim = localStorage.getItem('lastGiftClaim');
    const today = new Date().toDateString();
    
    if (lastClaim === today) {
      setIsGiftClaimed(true);
    }

    // Calculate time until midnight (reset time)
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft({ hours, minutes });
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 60000);

    return () => clearInterval(timerInterval);
  }, []);

  const handleGiftClick = () => {
    if (!isVIP) {
      setShowGiftUpgradeModal(true);
      return;
    }

    if (isGiftClaimed) {
      toast.info('You\'ve already claimed today\'s gift! Come back tomorrow.');
      return;
    }

    // Open gift with animation
    setIsOpening(true);
    
    setTimeout(() => {
      // Generate random reward with different types
      const rewardOptions = [
        { type: 'cash', value: 0.20, label: '$0.20 Cash Bonus' },
        { type: 'vip1', value: 0, label: 'VIP Level 1 Upgrade' },
        { type: 'vip2', value: 0, label: 'VIP Level 2 Upgrade' },
        { type: 'vip3', value: 0, label: 'VIP Level 3 Upgrade' },
        { type: 'cashback', value: 0.15, label: '$0.15 Cashback Bonus' },
        { type: 'cash', value: 0.10, label: '$0.10 Surprise Bonus' },
      ];
      
      const randomRewardData = rewardOptions[Math.floor(Math.random() * rewardOptions.length)];
      setReward(randomRewardData.value);
      setRewardType(randomRewardData.type as 'cash' | 'vip1' | 'vip2' | 'vip3' | 'cashback');
      setIsGiftClaimed(true);
      setIsOpening(false);
      setShowRewardModal(true);
      
      // Save claim to localStorage
      localStorage.setItem('lastGiftClaim', new Date().toDateString());
      
      // Add cash reward to balance
      if (randomRewardData.value > 0) {
        setGameBalance(gameBalance + randomRewardData.value);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* TOP HEADER - Fixed */}
      <TopBar />

      {/* DESKTOP: 2-COLUMN LAYOUT, MOBILE: SINGLE COLUMN */}
      <div className="w-full mx-auto pb-20" style={{
        maxWidth: 'min(1440px, 100vw)',
        paddingLeft: 'clamp(1rem, 5vw, 6.25rem)',
        paddingRight: 'clamp(1rem, 5vw, 6.25rem)',
        paddingTop: 'clamp(1rem, 3vw, 2rem)',
      }}>
        
        {/* MOBILE: Back Button */}
        <div className="lg:hidden rounded-t-3xl pt-4 px-4 pb-3 -mx-4 mt-2" style={{ backgroundColor: 'var(--bg-card)' }}>
          <button className="flex items-center gap-2 text-base font-medium" style={{ color: 'var(--text-primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        </div>

        {/* DESKTOP GRID: LEFT (60%) + RIGHT (40%) */}
        <div className="lg:grid" style={{
          gridTemplateColumns: '1fr min(480px, 40%)',
          gap: 'clamp(1.5rem, 3vw, 2.5rem)',
        }}>
          
          {/* ==================== LEFT COLUMN - PRIMARY (60%) ==================== */}
          <div className="space-y-6">
            
            {/* 1. TOTAL BALANCE (HERO) */}
            <div className="relative -mx-4 lg:mx-0 px-4 lg:px-0 pb-4 lg:pb-0" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="rounded-3xl p-6 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%)',
                boxShadow: '0 8px 24px rgba(45, 108, 223, 0.2)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>

                <div className="relative z-10">
                  <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Balance</p>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-4xl font-bold text-white">{formatUSDT(totalBalance)}</h2>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }}>
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* 2. BALANCE BREAKDOWN */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="flex flex-col gap-1 px-2 py-2 rounded-xl" style={{
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }}>
                      <div className="flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                          <rect x="2" y="5" width="20" height="14" rx="2"/>
                          <path d="M2 10h20" stroke="rgba(33,150,243,1)" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Main</p>
                        <p className="text-sm font-bold text-white">{formatUSDT(balance)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 px-2 py-2 rounded-xl" style={{
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }}>
                      <div className="flex items-center justify-center">
                        <Gamepad2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Game</p>
                        <p className="text-sm font-bold text-white">{formatUSDT(gameBalance)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 px-2 py-2 rounded-xl" style={{
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }}>
                      <div className="flex items-center justify-center">
                        <Gift className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Bonus</p>
                        <p className="text-sm font-bold text-white">{formatUSDT(bonusBalance)}</p>
                      </div>
                    </div>
                  </div>

                  {/* 3. PRIMARY ACTIONS */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      className="py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        backgroundColor: '#00C853',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,200,83,0.3)'
                      }}
                      onClick={() => setShowDepositModal(true)}
                    >
                      <ArrowDown className="w-5 h-5" />
                      Deposit
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{
                        backgroundColor: 'rgba(255,255,255,0.3)'
                      }}>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>

                    <button
                      className="py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        backgroundColor: '#2196F3',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(33,150,243,0.3)'
                      }}
                      onClick={() => setShowWithdrawModal(true)}
                    >
                      <ArrowUp className="w-5 h-5" />
                      Withdraw
                    </button>
                  </div>

                  {/* 4. SECONDARY ACTIONS */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      className="flex items-center gap-2 text-sm font-semibold text-white transition-all active:scale-95"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                      onClick={() => setShowTransferToGameModal(true)}
                    >
                      <Gamepad2 className="w-4 h-4" />
                      Transfer to Game
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      className="flex items-center gap-2 text-sm font-semibold text-white transition-all active:scale-95"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                      onClick={() => setShowTransferFromGameModal(true)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/>
                      </svg>
                      Transfer to Main
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. QUICK ACTIONS (OPTIONAL) - DESKTOP ONLY */}
            <div className="hidden lg:grid grid-cols-3 gap-4">
              <button className="p-4 rounded-2xl text-center transition-all hover:scale-105" style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}>
                <DollarSign className="w-6 h-6 mx-auto mb-2" style={{ color: '#00C853' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Buy Crypto</p>
              </button>
              <button className="p-4 rounded-2xl text-center transition-all hover:scale-105" style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}>
                <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--blue-primary)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>History</p>
              </button>
              <button className="p-4 rounded-2xl text-center transition-all hover:scale-105" style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}>
                <Gift className="w-6 h-6 mx-auto mb-2" style={{ color: '#F57C00' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Promotions</p>
              </button>
            </div>

          </div>

          {/* ==================== RIGHT COLUMN - SECONDARY (40%) ==================== */}
          <div className="space-y-6 mt-4 lg:mt-0">

            {/* ACTIVE BONUS PROGRESS */}
            {activeBonus && (
              <div className="rounded-2xl p-6 relative overflow-hidden" style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)'
              }}>
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white">Active Bonus</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Wagering Progress</span>
                      <span className="text-white font-medium">
                        ${activeBonus.wageringCompleted.toFixed(2)} / ${activeBonus.wageringRequired.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(getBonusProgress().percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {getBonusProgress().percentage.toFixed(1)}% complete
                    </p>
                  </div>

                  {activeBonus.expiryDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">
                        Expires {new Date(activeBonus.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BONUS OFFERS */}
            {(!hasClaimedWelcomeBonus || !hasClaimedNoDepositBonus) && (
              <div className="space-y-4">
                {/* Welcome Bonus */}
                {!hasClaimedWelcomeBonus && (
                  <div
                    onClick={() => navigate('/welcome-bonus')}
                    className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Gift className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-purple-400">WELCOME BONUS</div>
                        <div className="text-base font-bold text-white mb-1">Up to $200</div>
                        <p className="text-xs text-slate-300 mb-2">
                          Claim your welcome bonus and boost your balance!
                        </p>
                        <div className="flex items-center gap-1 text-xs text-purple-300">
                          <TrendingUp className="w-3 h-3" />
                          <span>5 Bonus Tiers</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                )}

                {/* No Deposit Bonus - Only show if welcome bonus NOT claimed */}
                {!hasClaimedNoDepositBonus && !hasClaimedWelcomeBonus && (
                  <div
                    onClick={() => setShowNoDepositModal(true)}
                    className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Gift className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-green-400">NO DEPOSIT</div>
                        <div className="text-base font-bold text-white mb-1">Free $5</div>
                        <p className="text-xs text-slate-300 mb-2">
                          Get $5 free - no deposit required!
                        </p>
                        <div className="flex items-center gap-1 text-xs text-green-300">
                          <TrendingUp className="w-3 h-3" />
                          <span>20x Wagering</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 1. CLAIM BONUS (TOP PRIORITY) */}
            <div className="rounded-3xl p-4 flex items-center justify-between relative overflow-hidden" style={{
              background: 'linear-gradient(90deg, #FFF9E6 0%, #FFECB3 100%)',
              border: '2px solid #FFD54F'
            }}>
              {/* Sunburst rays */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-8"
                    style={{
                      width: '100px',
                      height: '2px',
                      background: 'linear-gradient(90deg, #FFD700 0%, transparent 100%)',
                      transformOrigin: 'left center',
                      transform: `rotate(${i * 30}deg)`,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 flex-1 relative z-10">
                <div className="text-4xl">{isGiftClaimed ? '✨' : '🎁'}</div>
                <div>
                  <h3 className="text-base font-bold mb-0.5" style={{ color: '#F57C00' }}>
                    {isGiftClaimed ? 'Bonus Claimed!' : 'Claim Bonus'}
                  </h3>
                  <p className="text-xs" style={{ color: '#F57C00' }}>
                    {isGiftClaimed ? `Resets in ${timeLeft.hours}h ${timeLeft.minutes}m` : 'Instantly added to Main Balance'}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleGiftClick}
                disabled={isGiftClaimed}
                className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5" 
                style={{
                  background: isGiftClaimed ? 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)' : 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                  color: isGiftClaimed ? '#FFFFFF' : '#663C00',
                  boxShadow: isGiftClaimed ? '0 2px 8px rgba(0,0,0,0.1)' : '0 4px 12px rgba(255,193,7,0.4)'
                }}
              >
                {!isGiftClaimed && <span className="text-base">+$</span>}
                {isGiftClaimed ? 'Claimed' : 'Claim Now'}
              </button>
            </div>

            {/* 2. STATS ROW (HORIZONTAL) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)'
              }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'rgba(0, 200, 83, 0.1)'
                }}>
                  <TrendingUp className="w-6 h-6" style={{ color: '#00C853' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>1,245</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>Users depositing now</p>
                </div>
              </div>

              <div className="rounded-2xl p-4 flex items-center gap-3" style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)'
              }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'rgba(45, 108, 223, 0.1)'
                }}>
                  <DollarSign className="w-6 h-6" style={{ color: 'var(--blue-primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>$32,000</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>Bonuses paid today</p>
                </div>
              </div>
            </div>

            {/* 3. RECENT ACTIVITY (MAIN FEED) - Scrollable with fixed height */}
            <div className="rounded-2xl p-5" style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              minHeight: '300px',
              maxHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: 'var(--blue-primary)' }} />
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
                </div>
                <button className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--blue-primary)' }}>
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1" style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--border-color) transparent',
              }}>
                {contextTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your transactions will appear here</p>
                  </div>
                ) : (
                  contextTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center relative" style={{
                          backgroundColor: transaction.icon === 'gamepad' ? 'rgba(102, 102, 102, 0.1)' : 'rgba(33, 150, 243, 0.1)'
                        }}>
                          {transaction.icon === 'gamepad' ? (
                            <>
                              <Gamepad2 className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{
                                backgroundColor: transaction.amount >= 0 ? '#00C853' : '#FF3B30'
                              }}>
                                {transaction.amount >= 0 ? (
                                  <TrendingUp className="w-3 h-3 text-white" />
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                    <path d="M18 15l-6-6-6 6"/>
                                  </svg>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <rect x="2" y="5" width="20" height="14" rx="2" fill="#2196F3"/>
                                <path d="M2 10h20" stroke="white" strokeWidth="2"/>
                              </svg>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{
                                backgroundColor: '#00C853'
                              }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </div>
                            </>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {transaction.description}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {transaction.date} • {transaction.status}
                          </p>
                        </div>
                      </div>
                      <p className="text-base font-bold" style={{ 
                        color: transaction.amount >= 0 ? '#00C853' : '#FF3B30' 
                      }}>
                        {transaction.amount >= 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 4. EARN MORE / VIP CARD (BOTTOM) */}
            <div className="rounded-2xl p-4 flex items-center justify-between gap-3" style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)'
            }}>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                  backgroundColor: 'rgba(94, 53, 177, 0.1)'
                }}>
                  <Crown className="w-6 h-6" style={{ color: '#5E35B1' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>Earn More</h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Referrals & campaigns</p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/upgrade')}
                className="px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center gap-1 flex-shrink-0"
                style={{
                  backgroundColor: '#5E35B1',
                  color: 'white'
                }}
              >
                Upgrade to VIP
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={(amount) => {
          setBalance(balance + amount);
          addTransaction({
            description: 'Deposit - Naira',
            amount: amount,
            status: 'Completed',
            icon: 'deposit',
            type: 'deposit',
          });
          toast.success(`Deposited successfully!`);
        }}
        onUSDTSuccess={(amount) => {
          setGameBalance(gameBalance + amount);
          addTransaction({
            description: 'Deposit - USDT',
            amount: amount,
            status: 'Completed',
            icon: 'deposit',
            type: 'deposit',
          });
          toast.success(`USDT deposited successfully!`);
        }}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={(amount, type) => {
          if (type === 'naira') {
            setBalance(balance - amount);
            addTransaction({
              description: 'Withdraw - Naira',
              amount: -amount,
              status: 'Processing',
              icon: 'withdraw',
              type: 'withdraw',
            });
          } else {
            setGameBalance(gameBalance - amount);
            addTransaction({
              description: 'Withdraw - USDT',
              amount: -amount,
              status: 'Processing',
              icon: 'withdraw',
              type: 'withdraw',
            });
          }
          toast.success(`Withdrawal initiated successfully!`);
        }}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={showTransferToGameModal}
        onClose={() => setShowTransferToGameModal(false)}
        direction="toGame"
        onSuccess={(amount) => {
          setBalance(balance - amount);
          setGameBalance(gameBalance + amount);
          addTransaction({
            description: 'Transfer to Game',
            amount: -amount,
            status: 'Completed',
            icon: 'gamepad',
            type: 'transfer',
          });
          toast.success(`Transferred to game successfully!`);
        }}
      />

      <TransferModal
        isOpen={showTransferFromGameModal}
        onClose={() => setShowTransferFromGameModal(false)}
        direction="toMain"
        onSuccess={(amount) => {
          setBalance(balance + amount);
          setGameBalance(gameBalance - amount);
          addTransaction({
            description: 'Transfer from Game',
            amount: amount,
            status: 'Completed',
            icon: 'gamepad',
            type: 'transfer',
          });
          toast.success(`Transferred from game successfully!`);
        }}
      />

      {/* Gift Upgrade Modal */}
      {showGiftUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Upgrade to VIP
            </h2>

            <div className="space-y-4">
              <p className="text-sm" style={{ color: '#666666' }}>
                To claim daily bonuses, you need to upgrade to VIP membership.
              </p>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowGiftUpgradeModal(false);
                    navigate('/upgrade');
                  }}
                  className="w-full py-3 rounded-xl text-white font-bold transition-transform active:scale-95"
                  style={{ backgroundColor: '#5E35B1' }}
                >
                  Upgrade to VIP
                </button>
                <button
                  onClick={() => setShowGiftUpgradeModal(false)}
                  className="w-full py-3 rounded-xl font-semibold"
                  style={{ backgroundColor: '#F5F5F5', color: '#1A1A1A' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center relative overflow-hidden">
            {/* Success Icon */}
            <div className="relative mb-6">
              <div 
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)'
                }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
              🎉 Congratulations!
            </h2>
            
            <p className="text-sm mb-4" style={{ color: '#666666' }}>
              You've claimed your daily bonus!
            </p>

            <div 
              className="py-6 px-8 rounded-xl mb-6 relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              }}
            >
              <p className="text-white/80 text-sm mb-2">You Received</p>
              {rewardType.startsWith('vip') ? (
                <>
                  <p className="text-white text-3xl font-bold mb-1">
                    👑 VIP Level {rewardType.slice(-1)}
                  </p>
                  <p className="text-white/80 text-xs">Upgrade Unlocked!</p>
                </>
              ) : rewardType === 'cashback' ? (
                <>
                  <p className="text-white text-4xl font-bold">
                    ${reward.toFixed(2)}
                  </p>
                  <p className="text-white/80 text-xs mt-1">Cashback Bonus</p>
                </>
              ) : (
                <p className="text-white text-4xl font-bold">
                  ${reward.toFixed(2)}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowRewardModal(false)}
              className="w-full py-3 rounded-xl font-bold transition-transform active:scale-95"
              style={{ backgroundColor: '#5E35B1', color: 'white' }}
            >
              Awesome!
            </button>

            <p className="text-xs mt-4" style={{ color: '#999999' }}>
              Resets in 24 hours • {timeLeft.hours}h {timeLeft.minutes}m remaining
            </p>
          </div>
        </div>
      )}

      {/* No Deposit Bonus Modal */}
      <NoDepositBonusModal
        isOpen={showNoDepositModal}
        onClose={() => setShowNoDepositModal(false)}
      />
    </div>
  );
}