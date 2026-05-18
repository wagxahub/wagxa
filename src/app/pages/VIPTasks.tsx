import { Trophy, Clock, Sparkles, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ResponsiveContainer } from '../components/ResponsiveContainer';

type TaskStatus = 'incomplete' | 'ready' | 'claimed';

interface Task {
  id: number;
  title: string;
  description: string;
  progress: number;
  total: number;
  baseReward: number;
  vip1Reward: number;
  vip2Reward: number;
  vip3Reward: number;
  status: TaskStatus;
}

export function VIPTasks() {
  const { isVIP, vipLevel, updateBalance, updateGameBalance, formatCurrency } = useUser();
  const navigate = useNavigate();
  
  // ===== INTERACTIVE PROTOTYPE STATE =====
  // Play 5 Games Task
  const [play5Progress, setPlay5Progress] = useState(0);
  const [play5Claimed, setPlay5Claimed] = useState(false);
  
  // Win 3 Games Task
  const [win3Progress, setWin3Progress] = useState(0);
  const [win3Claimed, setWin3Claimed] = useState(false);
  
  // Global Earnings Tracker
  const [earningsToday, setEarningsToday] = useState(0);
  
  // Static Tasks (Not Interactive)
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: 3, 
      title: 'Refer 1 New User', 
      description: 'Invite a friend to join',
      progress: 0, 
      total: 1, 
      baseReward: 5.00,
      vip1Reward: 7.50,
      vip2Reward: 10.00,
      vip3Reward: 12.50,
      status: 'incomplete'
    },
    { 
      id: 4, 
      title: 'Place $20 in Bets', 
      description: 'Total bet amount for today',
      progress: 12, 
      total: 20, 
      baseReward: 1.50,
      vip1Reward: 2.25,
      vip2Reward: 3.00,
      vip3Reward: 3.75,
      status: 'incomplete'
    },
  ]);

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [rebateEarnings, setRebateEarnings] = useState(0);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentReward = (task: Task) => {
    if (vipLevel === 3) return task.vip3Reward;
    if (vipLevel === 2) return task.vip2Reward;
    if (vipLevel === 1) return task.vip1Reward;
    return task.baseReward;
  };

  const getNextVIPReward = (task: Task) => {
    if (vipLevel === 0) return task.vip1Reward;
    if (vipLevel === 1) return task.vip2Reward;
    if (vipLevel === 2) return task.vip3Reward;
    return task.vip3Reward;
  };

  const handleClaimReward = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'ready') return;

    const reward = getCurrentReward(task);
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: 'claimed' as TaskStatus } : t
    ));
    
    updateGameBalance(reward);
    setEarningsToday(prev => prev + reward);
    toast.success(`🎉 Claimed ${formatCurrency(reward)}!`);
  };

  const handleCompleteTask = (taskId: number) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, progress: t.total, status: 'ready' as TaskStatus } : t
    ));
    toast.success('Task completed! Claim your reward!');
  };

  const handleClaimBonus = () => {
    const completedTasksCount = tasks.filter(t => t.status === 'claimed').length;
    const totalTasks = tasks.length;
    const allTasksCompleted = completedTasksCount === totalTasks;
    if (!allTasksCompleted) {
      toast.error('Complete all tasks first!');
      return;
    }
    const bonusReward = vipLevel === 3 ? 10.00 : vipLevel === 2 ? 7.50 : vipLevel === 1 ? 5.00 : 3.00;
    updateGameBalance(bonusReward);
    setEarningsToday(prev => prev + bonusReward);
    toast.success(`🎉 Bonus claimed! +${formatCurrency(bonusReward)}`);
  };

  // ===== INTERACTIVE PROTOTYPE HANDLERS =====
  
  // Play 5 Games Handler
  const handlePlayGame = () => {
    if (play5Progress < 5 && !play5Claimed) {
      setPlay5Progress(prev => prev + 1);
      toast.success(`Game played! Progress: ${play5Progress + 1}/5`);
    }
  };

  // Claim Play 5 Games Reward
  const handleClaimPlay5 = () => {
    if (play5Progress === 5 && !play5Claimed) {
      const reward = 1.00;
      setPlay5Claimed(true);
      updateGameBalance(reward);
      setEarningsToday(prev => prev + reward);
      toast.success(`🎉 Claimed $${reward.toFixed(2)}!`);
    }
  };

  // Win 3 Games Handler
  const handleWinGame = () => {
    if (win3Progress < 3 && !win3Claimed) {
      setWin3Progress(prev => prev + 1);
      toast.success(`Game won! Progress: ${win3Progress + 1}/3`);
    }
  };

  // Claim Win 3 Games Reward
  const handleClaimWin3 = () => {
    if (win3Progress === 3 && !win3Claimed) {
      const reward = 2.00;
      setWin3Claimed(true);
      updateGameBalance(reward);
      setEarningsToday(prev => prev + reward);
      toast.success(`🎉 Claimed $${reward.toFixed(2)}!`);
    }
  };

  // Reset Day (24H Simulation)
  const handleResetDay = () => {
    setPlay5Progress(0);
    setPlay5Claimed(false);
    setWin3Progress(0);
    setWin3Claimed(false);
    setEarningsToday(0);
    setTasks(tasks.map(t => ({ ...t, progress: 0, status: 'incomplete' as TaskStatus })));
    toast.success('🔄 Day reset! All tasks refreshed.');
  };

  return (
    <div className="min-h-screen w-full" style={{ 
      background: '#0B1220'
    }}>
      <TopBar />

      {/* ===== MAIN FRAME - PAGE CONTAINER ===== */}
      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-20" style={{
        paddingTop: '16px',
      }}>
        
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* ===== DESKTOP: 2-COLUMN LAYOUT (Left 65% + Right 35%) ===== */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ==================== LEFT CONTENT (PRIMARY - 65%) ==================== */}
          <div className="flex-1 lg:flex-[0_0_calc(65%-16px)]" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            
            {/* ===== BALANCE CARD (PREMIUM CARD) ===== */}
            <div className="w-full" style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0F1C2E 0%, #1A2A40 100%)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.35)'
            }}>
              {/* Header Row */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Sparkles style={{ color: '#F4C430', width: '20px', height: '20px' }} />
                  <h2 className="font-bold text-base" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                    Earnings Today
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock style={{ color: 'rgba(255, 255, 255, 0.6)', width: '14px', height: '14px' }} />
                  <span className="font-bold text-sm" style={{ color: '#FFFFFF' }}>
                    {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Big Amount */}
              <p style={{ fontSize: '44px', lineHeight: '1', color: '#FFFFFF', fontWeight: 700 }}>
                ${earningsToday.toFixed(2)}
              </p>
              
              {/* Subtext */}
              <p className="text-sm" style={{ color: '#8FA3BF', marginBottom: '4px' }}>
                +${rebateEarnings.toFixed(2)} today
              </p>

              {/* Earnings Breakdown - VERTICAL */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm" style={{ color: '#A8B3C7' }}>Task Earnings</span>
                  <span className="font-bold text-base" style={{ color: '#E6EDF7' }}>${earningsToday.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm" style={{ color: '#A8B3C7' }}>Rebate Bonus</span>
                  <span className="font-bold text-base" style={{ color: '#E6EDF7' }}>${rebateEarnings.toFixed(2)}</span>
                </div>
              </div>

              {/* Earnings Rate - Inside Card */}
              <div className="pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <p className="text-xs font-medium" style={{ color: '#7E8CA3' }}>
                  💰 Earnings Rate: Free 40% • VIP1 50% • VIP2 60% • VIP3 70%
                </p>
              </div>
            </div>

            {/* ===== TASK SECTION CONTAINER ===== */}
            <div className="w-full" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '0'
            }}>
              {/* Header */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Trophy style={{ color: '#F4C430', width: '24px', height: '24px' }} />
                  <h2 className="font-bold text-lg" style={{ color: '#FFFFFF' }}>
                    Daily Tasks
                  </h2>
                </div>
                <div style={{
                  borderRadius: '12px',
                  padding: '6px 12px',
                  background: 'rgba(244, 196, 48, 0.12)',
                  border: '1px solid rgba(244, 196, 48, 0.25)'
                }}>
                  <p className="font-bold text-xs" style={{ color: '#F4C430' }}>
                    🎁 Bonus
                  </p>
                </div>
              </div>

              {/* Progress Info */}
              <p className="text-sm font-semibold" style={{ color: '#8FA3BF' }}>
                {(play5Claimed ? 1 : 0) + (win3Claimed ? 1 : 0) + tasks.filter(t => t.status === 'claimed').length}/4 Completed · {4 - ((play5Claimed ? 1 : 0) + (win3Claimed ? 1 : 0) + tasks.filter(t => t.status === 'claimed').length)} remaining
              </p>

              {/* ===== TASKS GRID - 2 PER ROW ON DESKTOP ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{
                width: '100%',
              }}>
                {/* ===== INTERACTIVE TASK 1: PLAY 5 GAMES ===== */}
                <div 
                  className="w-full"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: '#0C1624',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.35)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Subtle top gradient overlay */}
                  <div className="absolute top-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%)'
                  }} />

                  {/* Title + Reward Badge */}
                  <div className="flex items-start justify-between w-full">
                    <h3 className="font-bold flex-1 text-base" style={{ lineHeight: '1.3', color: '#FFFFFF' }}>
                      Play 5 Games Today
                    </h3>
                    
                    {/* Reward Badge */}
                    <div className="flex items-center justify-center flex-shrink-0" style={{ 
                      width: '72px',
                      height: '32px',
                      borderRadius: '999px',
                      background: play5Claimed 
                        ? 'transparent'
                        : play5Progress === 5 
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(255, 255, 255, 0.06)',
                      border: play5Claimed 
                        ? '1px solid rgba(34, 197, 94, 0.4)'
                        : play5Progress === 5
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <p className="font-black text-sm" style={{ 
                        color: play5Claimed 
                          ? '#22C55E'
                          : play5Progress === 5 
                            ? '#22C55E'
                            : '#A8B3C7'
                      }}>
                        $1.00
                      </p>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    Complete 5 game rounds
                    {play5Claimed && (
                      <span className="text-xs font-semibold ml-2" style={{ color: '#22C55E' }}>
                        · ✓ Claimed
                      </span>
                    )}
                  </p>

                  {/* Smart Hint */}
                  {!play5Claimed && (
                    <p className="text-xs" style={{ 
                      color: '#6B7280',
                      fontSize: '11px',
                      opacity: 0.8
                    }}>
                      💡 Stay active to unlock higher earning rates
                    </p>
                  )}
                  
                  {/* Progress + Button (IF NOT CLAIMED) */}
                  {!play5Claimed && (
                    <>
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="font-semibold text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {play5Progress}/5
                          </span>
                          <span className="font-bold text-xs" style={{ 
                            color: play5Progress === 5 ? '#22C55E' : '#3B82F6'
                          }}>
                            {((play5Progress / 5) * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="w-full rounded-full overflow-hidden" style={{ 
                          height: '6px',
                          background: 'rgba(255, 255, 255, 0.08)'
                        }}>
                          <div 
                            className="h-full transition-all duration-500"
                            style={{ 
                              width: `${(play5Progress / 5) * 100}%`,
                              background: play5Progress === 5 ? '#22C55E' : '#3B82F6'
                            }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      {play5Progress < 5 ? (
                        <button
                          onClick={handlePlayGame}
                          className="w-full rounded-xl font-semibold text-sm transition-all active:scale-95"
                          style={{ 
                            height: '48px',
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0px 6px 18px rgba(59, 130, 246, 0.35)'
                          }}
                        >
                          🎮 Play Game ({play5Progress}/5)
                        </button>
                      ) : (
                        <button
                          onClick={handleClaimPlay5}
                          className="w-full rounded-xl font-semibold text-sm transition-all active:scale-95"
                          style={{ 
                            height: '48px',
                            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0px 6px 18px rgba(245, 158, 11, 0.35)'
                          }}
                        >
                          🎁 Claim $1.00
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* ===== INTERACTIVE TASK 2: WIN 3 GAMES ===== */}
                <div 
                  className="w-full"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: '#0C1624',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.35)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Subtle top gradient overlay */}
                  <div className="absolute top-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%)'
                  }} />

                  {/* Title + Reward Badge */}
                  <div className="flex items-start justify-between w-full">
                    <h3 className="font-bold flex-1 text-base" style={{ lineHeight: '1.3', color: '#FFFFFF' }}>
                      Win 3 Games
                    </h3>
                    
                    {/* Reward Badge */}
                    <div className="flex items-center justify-center flex-shrink-0" style={{ 
                      width: '72px',
                      height: '32px',
                      borderRadius: '999px',
                      background: win3Claimed 
                        ? 'transparent'
                        : win3Progress === 3 
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(255, 255, 255, 0.06)',
                      border: win3Claimed 
                        ? '1px solid rgba(34, 197, 94, 0.4)'
                        : win3Progress === 3
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <p className="font-black text-sm" style={{ 
                        color: win3Claimed 
                          ? '#22C55E'
                          : win3Progress === 3 
                            ? '#22C55E'
                            : '#A8B3C7'
                      }}>
                        $2.00
                      </p>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    Win any 3 games
                    {win3Claimed && (
                      <span className="text-xs font-semibold ml-2" style={{ color: '#22C55E' }}>
                        · ✓ Claimed
                      </span>
                    )}
                  </p>
                  
                  {/* Progress + Button (IF NOT CLAIMED) */}
                  {!win3Claimed && (
                    <>
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="font-semibold text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {win3Progress}/3
                          </span>
                          <span className="font-bold text-xs" style={{ 
                            color: win3Progress === 3 ? '#22C55E' : '#3B82F6'
                          }}>
                            {((win3Progress / 3) * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="w-full rounded-full overflow-hidden" style={{ 
                          height: '6px',
                          background: 'rgba(255, 255, 255, 0.08)'
                        }}>
                          <div 
                            className="h-full transition-all duration-500"
                            style={{ 
                              width: `${(win3Progress / 3) * 100}%`,
                              background: win3Progress === 3 ? '#22C55E' : '#3B82F6'
                            }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      {win3Progress < 3 ? (
                        <button
                          onClick={handleWinGame}
                          className="w-full rounded-xl font-semibold text-sm transition-all active:scale-95"
                          style={{ 
                            height: '48px',
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0px 6px 18px rgba(59, 130, 246, 0.35)'
                          }}
                        >
                          🏆 Win Game ({win3Progress}/3)
                        </button>
                      ) : (
                        <button
                          onClick={handleClaimWin3}
                          className="w-full rounded-xl font-semibold text-sm transition-all active:scale-95"
                          style={{ 
                            height: '48px',
                            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0px 6px 18px rgba(245, 158, 11, 0.35)'
                          }}
                        >
                          🎁 Claim $2.00
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* ===== STATIC TASKS ===== */}
                {tasks.map((task, index) => {
                  const progressPercent = (task.progress / task.total) * 100;
                  const currentReward = getCurrentReward(task);
                  const isClaimed = task.status === 'claimed';
                  const isReady = task.status === 'ready';
                  const isHighValue = currentReward >= 5.00;
                  const isFirstTask = index === 0;

                  return (
                    <div 
                      key={task.id}
                      className="w-full"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '16px',
                        backgroundColor: '#0C1624',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.35)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Subtle top gradient overlay */}
                      <div className="absolute top-0 left-0 right-0 h-px" style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%)'
                      }} />

                      {/* Title + Reward Badge */}
                      <div className="flex items-start justify-between w-full">
                        <h3 className="font-bold flex-1 text-base" style={{ lineHeight: '1.3', color: '#FFFFFF' }}>
                          {task.title}
                        </h3>
                        
                        {/* Reward Badge - Amount Only */}
                        <div className="flex items-center justify-center flex-shrink-0" style={{ 
                          width: '72px',
                          height: '32px',
                          borderRadius: '999px',
                          background: isClaimed 
                            ? 'transparent'
                            : isReady 
                              ? 'rgba(16, 185, 129, 0.12)'
                              : isHighValue
                                ? 'rgba(244, 196, 48, 0.15)'
                                : 'rgba(255, 255, 255, 0.06)',
                          border: isClaimed 
                            ? '1px solid rgba(34, 197, 94, 0.4)'
                            : isReady
                              ? '1px solid rgba(16, 185, 129, 0.3)'
                              : isHighValue
                                ? '1px solid rgba(244, 196, 48, 0.3)'
                                : '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                          <p className="font-black text-sm" style={{ 
                            color: isClaimed 
                              ? '#22C55E'
                              : isReady 
                                ? '#22C55E'
                                : isHighValue
                                  ? '#F4C430'
                                  : '#A8B3C7'
                          }}>
                            ${currentReward.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Subtitle / Status Line */}
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        {task.description}
                        {isClaimed && (
                          <span className="text-xs font-semibold ml-2" style={{ 
                            color: '#22C55E'
                          }}>
                            · ✓ Claimed
                          </span>
                        )}
                      </p>

                      {/* Smart Hint - First Task Only */}
                      {!isClaimed && isFirstTask && (
                        <p className="text-xs" style={{ 
                          color: '#6B7280',
                          fontSize: '11px',
                          opacity: 0.8
                        }}>
                          💡 Stay active to unlock higher earning rates
                        </p>
                      )}
                      
                      {/* Progress + Button (IF NOT CLAIMED) */}
                      {!isClaimed && (
                        <>
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between w-full mb-2">
                              <span className="font-semibold text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {task.progress}/{task.total}
                              </span>
                              <span className="font-bold text-xs" style={{ 
                                color: isReady ? '#22C55E' : '#3B82F6'
                              }}>
                                {progressPercent.toFixed(0)}%
                              </span>
                            </div>
                            
                            <div className="w-full rounded-full overflow-hidden" style={{ 
                              height: '6px',
                              background: 'rgba(255, 255, 255, 0.08)'
                            }}>
                              <div 
                                className="h-full transition-all duration-500"
                                style={{ 
                                  width: `${Math.min(progressPercent, 100)}%`,
                                  background: isReady ? '#22C55E' : '#3B82F6'
                                }}
                              />
                            </div>
                          </div>

                          {/* Primary Button - Brighter than card */}
                          <button
                            onClick={() => {
                              if (task.status === 'incomplete') {
                                handleCompleteTask(task.id);
                              } else if (task.status === 'ready') {
                                handleClaimReward(task.id);
                              }
                            }}
                            className="w-full rounded-xl font-semibold text-sm transition-all active:scale-95"
                            style={{ 
                              height: '48px',
                              background: isReady 
                                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' 
                                : '#3B82F6',
                              color: 'white',
                              border: 'none',
                              boxShadow: isReady 
                                ? '0px 6px 18px rgba(245, 158, 11, 0.35)'
                                : '0px 6px 18px rgba(59, 130, 246, 0.35)'
                            }}
                          >
                            {isReady 
                              ? `🎁 Claim $${currentReward.toFixed(2)}`
                              : 'Complete Task'}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Bonus Section - Card (interactive) */}
                {tasks.filter(t => t.status === 'claimed').length === tasks.length && (
                  <div className="rounded-2xl p-4 relative overflow-hidden" style={{
                    backgroundColor: '#111F34',
                    border: '1px solid rgba(31, 41, 55, 0.4)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)'
                  }}>
                    {/* Subtle top gradient overlay */}
                    <div className="absolute top-0 left-0 right-0 h-px" style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%)'
                    }} />

                    <div className="flex items-start justify-between w-full mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Sparkles style={{ color: '#F59E0B', width: '20px', height: '20px' }} />
                          <h3 className="font-black text-white text-lg">
                            Complete All Bonus
                          </h3>
                        </div>
                        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          🎉 All tasks done! Claim your bonus
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center flex-shrink-0" style={{ 
                        width: '72px',
                        height: '32px',
                        borderRadius: '999px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        <p className="font-black text-sm" style={{ color: '#D4AF37' }}>
                          ${vipLevel === 3 ? 10.00 : vipLevel === 2 ? 7.50 : vipLevel === 1 ? 5.00 : 3.00}.00
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleClaimBonus}
                      className="w-full rounded-xl font-semibold text-sm transition-all active:scale-95"
                      style={{ 
                        height: '48px',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0px 6px 18px rgba(245, 158, 11, 0.35)'
                      }}
                    >
                      🎁 Claim Bonus ${vipLevel === 3 ? 10.00 : vipLevel === 2 ? 7.50 : vipLevel === 1 ? 5.00 : 3.00}.00
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ===== DEBUG: RESET DAY BUTTON ===== */}
            <div className="text-center pb-4">
              <button
                onClick={handleResetDay}
                className="w-full rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{ 
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#8FA3BF',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: 'none'
                }}
              >
                🔄 Reset Day (Test Mode)
              </button>
            </div>
          </div>

          {/* ==================== RIGHT PANEL (SECONDARY - 35%) ==================== */}
          <div className="hidden lg:block lg:flex-[0_0_calc(35%-16px)]" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            
            {/* ===== DAILY TASK BENEFITS CARD ===== */}
            <div className="rounded-2xl p-5" style={{
              backgroundColor: '#0C1624',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.35)',
            }}>
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp style={{ color: '#22C55E', width: '24px', height: '24px' }} className="flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-white text-base mb-1">
                    Daily Task Benefits
                  </h4>
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Maximize your earnings
                  </p>
                </div>
              </div>
              
              <ul className="text-xs space-y-3" style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6'
              }}>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">✅</span>
                  <span>New tasks available every 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">💎</span>
                  <span>VIP members earn up to 2.5x more per task</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">🎁</span>
                  <span>Complete all 4 tasks for bonus rewards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">⚡</span>
                  <span>Instant crediting to Game Balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">📊</span>
                  <span>Track your progress in real-time</span>
                </li>
              </ul>
            </div>

            {/* ===== VIP UPGRADE CTA CARD ===== */}
            {vipLevel < 3 && (
              <div className="rounded-2xl p-5 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0px 8px 24px rgba(59, 130, 246, 0.25)',
              }}>
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}/>

                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles style={{ color: '#FBBF24', width: '24px', height: '24px' }} />
                    <h3 className="font-bold text-lg text-white">
                      Unlock Higher Rewards
                    </h3>
                  </div>
                  
                  <p className="text-center text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Upgrade to <span className="font-bold text-yellow-300">VIP {vipLevel + 1}</span> and earn up to{' '}
                    <span className="font-bold text-yellow-300">
                      {vipLevel === 0 ? '50%' : vipLevel === 1 ? '60%' : '75%'}
                    </span> from every task
                  </p>

                  {/* Reward Comparison */}
                  <div className="rounded-xl p-3 mb-4" style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Current earnings
                      </span>
                      <span className="text-sm font-bold text-white">
                        ${earningsToday.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        As VIP {vipLevel + 1}
                      </span>
                      <span className="text-sm font-bold text-yellow-300">
                        ${(earningsToday * (vipLevel === 0 ? 1.5 : vipLevel === 1 ? 1.6 : 1.75)).toFixed(2)} 🔥
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/upgrade')}
                    className="w-full rounded-xl font-bold text-sm transition-all active:scale-95 hover:scale-105"
                    style={{ 
                      height: '48px',
                      background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                      color: '#1E3A8A',
                      boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)'
                    }}
                  >
                    Upgrade to VIP {vipLevel + 1} →
                  </button>
                </div>
              </div>
            )}

            {/* ===== PROGRESS SUMMARY CARD ===== */}
            <div className="rounded-2xl p-5" style={{
              backgroundColor: '#0C1624',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.35)',
            }}>
              <div className="flex items-center gap-2 mb-4">
                <Trophy style={{ color: '#F4C430', width: '20px', height: '20px' }} />
                <h4 className="font-bold text-white text-base">
                  Progress Summary
                </h4>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Tasks Completed
                  </span>
                  <span className="text-sm font-bold text-white">
                    {(play5Claimed ? 1 : 0) + (win3Claimed ? 1 : 0) + tasks.filter(t => t.status === 'claimed').length}/4
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Total Earned Today
                  </span>
                  <span className="text-sm font-bold" style={{ color: '#22C55E' }}>
                    ${earningsToday.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Rebate Bonus
                  </span>
                  <span className="text-sm font-bold" style={{ color: '#22C55E' }}>
                    ${rebateEarnings.toFixed(2)}
                  </span>
                </div>

                <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Resets in
                    </span>
                    <span className="text-sm font-bold" style={{ color: '#3B82F6' }}>
                      {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}