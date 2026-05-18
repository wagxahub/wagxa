import { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { Check, Lock, TrendingUp, Info, Gift, Sparkles, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

interface DayData {
  day: string;
  date: string;
  totalBets: number;
  platformFees: number;
  status: 'claimed' | 'today' | 'locked' | 'available';
}

export function DailyRebate() {
  const { vipLevel, gameBalance, setGameBalance, addTransaction } = useUser();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // Get claimed days from localStorage
  const getClaimedDays = () => {
    const stored = localStorage.getItem('wagxa_claimed_rebate_days');
    if (stored) {
      try {
        return new Set(JSON.parse(stored));
      } catch {
        return new Set<string>();
      }
    }
    return new Set<string>();
  };

  const [claimedDays, setClaimedDays] = useState<Set<string>>(getClaimedDays());

  // VIP rebate percentages
  const getRebatePercentage = () => {
    if (vipLevel === 3) return 10;
    if (vipLevel === 2) return 8.5;
    if (vipLevel === 1) return 7;
    return 4; // Free users
  };

  const rebatePercentage = getRebatePercentage();

  // Generate weekly data based on actual calendar
  const generateWeeklyData = (): DayData[] => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Start from Monday of current week
    const monday = new Date(today);
    const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    monday.setDate(today.getDate() - daysSinceMonday);

    return daysOfWeek.slice(1).concat(daysOfWeek.slice(0, 1)).map((dayName, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}`;
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;
      const isClaimed = claimedDays.has(dayName);

      let status: 'claimed' | 'today' | 'locked' | 'available';
      if (isClaimed) {
        status = 'claimed';
      } else if (isToday) {
        status = 'today';
      } else if (isPast || isFuture) {
        status = 'locked';
      } else {
        status = 'available';
      }

      return {
        day: dayName,
        date: dateStr,
        totalBets: 0,
        platformFees: 0,
        status
      };
    });
  };

  const weeklyData = generateWeeklyData();

  const calculateRebate = (platformFees: number) => {
    return (platformFees * rebatePercentage) / 100;
  };

  const handleDayClick = (dayData: DayData) => {
    if (dayData.status === 'locked') {
      const today = new Date();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert to Monday=0
      const dayIndex = daysOfWeek.slice(1).concat(daysOfWeek.slice(0, 1)).indexOf(dayData.day);

      if (dayIndex < currentDayOfWeek) {
        toast.error('You missed this day\'s rebate. Only today\'s rebate can be claimed.');
      } else {
        toast.error('This day is not available yet');
      }
      return;
    }
    setSelectedDay(dayData);
    setShowBreakdown(true);
  };

  const handleClaim = () => {
    if (!selectedDay) return;

    if (selectedDay.status === 'claimed') {
      toast.error('Already claimed for this day');
      return;
    }

    if (selectedDay.status === 'locked') {
      toast.error('You cannot claim rebates for past or future days');
      return;
    }

    if (selectedDay.status !== 'today') {
      toast.error('You can only claim today\'s rebate');
      return;
    }

    const rebateAmount = calculateRebate(selectedDay.platformFees);

    if (rebateAmount === 0) {
      toast.error('No rebate available. Play games to earn rebates!');
      return;
    }

    // Add rebate to balance
    setGameBalance(gameBalance + rebateAmount);

    // Add transaction
    addTransaction({
      description: `Daily Rebate - ${selectedDay.day}`,
      amount: rebateAmount,
      status: 'Completed',
      icon: 'gift',
      type: 'game',
    });

    // Mark as claimed and persist to localStorage
    const newClaimedDays = new Set([...claimedDays, selectedDay.day]);
    setClaimedDays(newClaimedDays);
    localStorage.setItem('wagxa_claimed_rebate_days', JSON.stringify([...newClaimedDays]));

    // Close modal and show success
    setShowBreakdown(false);
    toast.success(`🎉 You received $${rebateAmount.toFixed(2)} rebate!`);
  };

  const getTotalWeeklyRebate = () => {
    return weeklyData.reduce((sum, day) => {
      if (day.status !== 'locked') {
        return sum + calculateRebate(day.platformFees);
      }
      return sum;
    }, 0);
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />

      {/* DESKTOP: LEFT-ALIGNED LAYOUT - INCREASED WIDTH */}
      <div className="w-full max-w-[1240px] mx-auto px-4 md:px-6 lg:px-10 py-8 pb-20">
        {/* Back Button */}
        <div className="mb-5">
          <BackButton />
        </div>

        {/* HEADER ROW - Horizontal on Desktop */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Gift className="w-10 h-10" style={{ color: '#FFD700' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Daily Rebate Rewards
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ 
            backgroundColor: 'rgba(10, 132, 255, 0.1)',
            border: '1px solid rgba(10, 132, 255, 0.3)',
          }}>
            <Sparkles className="w-4 h-4" style={{ color: '#0A84FF' }} />
            <span className="text-sm font-medium" style={{ color: '#0A84FF' }}>
              Available to all users (Free & VIP)
            </span>
          </div>
        </div>

        {/* TOP SUMMARY CARD - Horizontal Layout on Desktop */}
        <div className="rounded-2xl shadow-sm p-6 mb-5" style={{ 
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}>
          <div className="flex items-start justify-between flex-wrap gap-6">
            {/* LEFT SIDE: Rebate Info */}
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-6 h-6" style={{ color: vipLevel > 0 ? '#FFD700' : '#0A84FF' }} />
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Your Rebate Rate: {rebatePercentage}%
                </h3>
                {vipLevel > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ 
                    backgroundColor: 'rgba(255, 215, 0, 0.15)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                  }}>
                    <Crown className="w-4 h-4" style={{ color: '#FFD700' }} />
                    <span className="text-xs font-bold" style={{ color: '#FFD700' }}>VIP {vipLevel}</span>
                  </div>
                )}
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                {vipLevel > 0 
                  ? `You are earning ${rebatePercentage}% cashback on platform fees (rake).`
                  : 'You are earning 4% cashback on platform fees (rake). Upgrade to VIP to earn more.'
                }
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <Info className="w-4 h-4" />
                <span>Rebates are calculated from platform fees (rake), not total bets</span>
              </div>
            </div>
            
            {/* RIGHT SIDE: Weekly Total */}
            <div className="text-right">
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>This Week's Total</p>
              <p className="text-4xl font-bold" style={{ color: '#34D399' }}>
                ${getTotalWeeklyRebate().toFixed(2)}
              </p>
            </div>
          </div>

          {vipLevel === 0 && (
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5" style={{ color: '#FFD700' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Upgrade to VIP to increase your rebate percentage
                  </span>
                </div>
                <button
                  onClick={() => navigate('/upgrade')}
                  className="px-5 py-2 rounded-lg font-medium text-white transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* REBATE LEVELS - ONE ROW ON DESKTOP */}
        <div className="rounded-2xl shadow-sm p-5 mb-5" style={{ 
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Rebate Rates by Level
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-5 rounded-xl text-center transition-all ${vipLevel === 0 ? 'ring-2' : ''}`} style={{ 
              backgroundColor: 'var(--bg-accent)',
              ringColor: vipLevel === 0 ? '#0A84FF' : 'transparent',
            }}>
              <p className="text-sm mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Free</p>
              <p className="text-3xl font-bold" style={{ color: '#0A84FF' }}>4%</p>
            </div>
            <div className={`p-5 rounded-xl text-center transition-all ${vipLevel === 1 ? 'ring-2' : ''}`} style={{ 
              backgroundColor: 'var(--bg-accent)',
              ringColor: vipLevel === 1 ? '#C0C0C0' : 'transparent',
            }}>
              <p className="text-sm mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>VIP 1</p>
              <p className="text-3xl font-bold" style={{ color: '#C0C0C0' }}>7%</p>
            </div>
            <div className={`p-5 rounded-xl text-center transition-all ${vipLevel === 2 ? 'ring-2' : ''}`} style={{ 
              backgroundColor: 'var(--bg-accent)',
              ringColor: vipLevel === 2 ? '#FFD700' : 'transparent',
            }}>
              <p className="text-sm mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>VIP 2</p>
              <p className="text-3xl font-bold" style={{ color: '#FFD700' }}>8.5%</p>
            </div>
            <div className={`p-5 rounded-xl text-center transition-all ${vipLevel === 3 ? 'ring-2' : ''}`} style={{ 
              backgroundColor: 'var(--bg-accent)',
              ringColor: vipLevel === 3 ? '#00D4FF' : 'transparent',
            }}>
              <p className="text-sm mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>VIP 3</p>
              <p className="text-3xl font-bold" style={{ color: '#00D4FF' }}>10%</p>
            </div>
          </div>
        </div>

        {/* WEEKLY CALENDAR - EQUAL SPACING */}
        <div className="mb-5">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Weekly Rebate Calendar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 md:gap-3">
            {weeklyData.map((dayData) => {
              const rebate = calculateRebate(dayData.platformFees);
              const isToday = dayData.status === 'today';
              const isClaimed = dayData.status === 'claimed' || claimedDays.has(dayData.day);
              const isLocked = dayData.status === 'locked';

              return (
                <button
                  key={dayData.day}
                  onClick={() => handleDayClick(dayData)}
                  disabled={isLocked}
                  className="p-2 sm:p-3 rounded-xl text-center transition-all active:scale-95 disabled:active:scale-100"
                  style={{
                    backgroundColor: isToday 
                      ? 'rgba(10, 132, 255, 0.15)' 
                      : isClaimed 
                      ? 'rgba(52, 211, 153, 0.1)'
                      : 'var(--bg-card)',
                    border: isToday 
                      ? '2px solid #0A84FF' 
                      : isClaimed
                      ? '2px solid rgba(52, 211, 153, 0.3)'
                      : '1px solid var(--border-color)',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.5 : 1,
                  }}
                >
                  {/* Status Icon */}
                  <div className="flex justify-center mb-1">
                    {isClaimed ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)' }}>
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#34D399' }} />
                      </div>
                    ) : isLocked ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(128, 128, 128, 0.2)' }}>
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: 'var(--text-secondary)' }} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 215, 0, 0.2)' }}>
                        <Gift className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#FFD700' }} />
                      </div>
                    )}
                  </div>

                  {/* Day (First 3 letters) */}
                  <p className="text-xs font-bold mb-0.5" style={{ color: isToday ? '#0A84FF' : 'var(--text-primary)' }}>
                    {dayData.day.substring(0, 3)}
                  </p>

                  {/* Rebate Amount */}
                  {!isLocked && (
                    <p className="text-xs sm:text-sm font-bold" style={{ color: isClaimed ? '#34D399' : '#FFD700' }}>
                      ${rebate.toFixed(1)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Section */}
        <div className="rounded-xl shadow-sm p-5" style={{ 
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}>
          <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            💡 How Daily Rebates Work
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>• Rebates are calculated from platform fees (rake), not your total bets</li>
            <li>• Platform fees are typically 5% of your total bets across all games</li>
            <li>• Your rebate percentage depends on your VIP level (4% for free, up to 10% for VIP 3)</li>
            <li>• You can only claim today's rebate - missed days cannot be claimed</li>
            <li>• Claim your daily rebate once per day before it expires</li>
            <li>• The calendar resets every Monday with a new week</li>
            <li>• Upgrade to VIP to earn higher rebate percentages</li>
          </ul>
        </div>
      </div>

      {/* Breakdown Modal */}
      {showBreakdown && selectedDay && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowBreakdown(false)}
        >
          <div 
            className="rounded-2xl shadow-2xl p-5 max-w-sm w-full"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 215, 0, 0.2)' }}>
                <Gift className="w-6 h-6" style={{ color: '#FFD700' }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {selectedDay.day} Rebate
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {selectedDay.date}, 2026
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Bets</span>
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  ${selectedDay.totalBets.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Platform Fees (5%)</span>
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  ${selectedDay.platformFees.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your Rebate Rate</span>
                <span className="font-bold text-sm" style={{ color: vipLevel > 0 ? '#FFD700' : '#0A84FF' }}>
                  {rebatePercentage}%
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Final Rebate</span>
                <span className="text-xl font-bold" style={{ color: '#34D399' }}>
                  ${calculateRebate(selectedDay.platformFees).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {selectedDay.status !== 'claimed' && !claimedDays.has(selectedDay.day) ? (
                <button
                  onClick={handleClaim}
                  className="w-full py-2.5 rounded-xl font-bold text-white transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' }}
                >
                  Claim ${calculateRebate(selectedDay.platformFees).toFixed(2)}
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-xl font-bold text-center text-sm" style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', color: '#34D399' }}>
                  ✓ Already Claimed
                </div>
              )}
              
              <button
                onClick={() => setShowBreakdown(false)}
                className="w-full py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}