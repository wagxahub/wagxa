import { useState, useEffect } from 'react';
import { Shield, Zap, Clock, ArrowRight, TrendingUp, Users, Target } from 'lucide-react';
import { LandingHeader } from '../components/LandingHeader';
import { LandingSidebar } from '../components/LandingSidebar';
import { LiveWheel } from '../components/LiveWheel';
import { LiveActivityFeed } from '../components/LiveActivityFeed';
import { LiveGameScreen } from '../components/LiveGameScreen';
import { FAQSection } from '../components/FAQSection';
import { BottomSheet } from '../components/BottomSheet';
import { useAuth } from '../context/AuthContext';

interface ActivityItem {
  id: number;
  text: string;
  type: 'join' | 'win';
  timestamp: string;
}

export function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeBottomSheet, setActiveBottomSheet] = useState<string | null>(null);
  const { openAuthModal } = useAuth();

  // Desktop wheel state - all live functionality
  const [countdown, setCountdown] = useState(0);
  const [roundDuration, setRoundDuration] = useState(0);
  const [poolValue, setPoolValue] = useState(0);
  const [playersJoined, setPlayersJoined] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [activePlayers, setActivePlayers] = useState(0);
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 1, text: 'User842 joined $20', type: 'join', timestamp: '2s ago' },
    { id: 2, text: 'KingDex won $167', type: 'win', timestamp: '5s ago' },
    { id: 3, text: 'SpinMaster joined $35', type: 'join', timestamp: '8s ago' },
    { id: 4, text: 'Player391 won $203', type: 'win', timestamp: '12s ago' },
  ]);

  // Countdown timer with lock behavior (DESKTOP)
  useEffect(() => {
    if (isLocked || isResetting) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Lock the round
          setIsLocked(true);
          
          // Freeze for 0.3-0.5s
          const lockDuration = Math.random() * 200 + 300; // 300-500ms
          setTimeout(() => {
            setIsResetting(true);
            
            // Immediate transition
            setTimeout(() => {
              // Reset with variation
              const newPlayerCount = Math.floor(Math.random() * 10) + 38; // 38-48
              const basePool = Math.floor(Math.random() * 2000) + 11000; // 11000-13000
              const newDuration = Math.floor(Math.random() * 5) + 8; // 8-12s
              
              setPlayersJoined(newPlayerCount);
              setPoolValue(basePool);
              setRoundDuration(newDuration);
              setCountdown(newDuration);
              setIsLocked(false);
              setIsResetting(false);
            }, 500); // Quick transition
          }, lockDuration);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, isResetting]);

  // Realistic player count increase (DESKTOP)
  useEffect(() => {
    if (isLocked || isResetting) return;

    const interval = setInterval(() => {
      setPlayersJoined((prev) => {
        if (prev >= 50) return 50;
        
        // Accelerate near end
        const isBurst = (prev >= 45) || (countdown <= 3);
        const increase = isBurst 
          ? Math.random() > 0.4 ? 2 : 1
          : Math.random() > 0.7 ? 1 : 0;
        
        return Math.min(prev + increase, 50);
      });
    }, Math.random() * 1500 + 1000); // 1-2.5s

    return () => clearInterval(interval);
  }, [countdown, isLocked, isResetting]);

  // Irregular pool growth (DESKTOP)
  useEffect(() => {
    if (isLocked || isResetting) return;

    const interval = setInterval(() => {
      const increments = [50, 80, 100, 150, 200, 280, 350];
      const isSpike = Math.random() > 0.88; // 12% chance
      const increase = isSpike 
        ? Math.floor(Math.random() * 500) + 500 // $500-1000 spike
        : increments[Math.floor(Math.random() * increments.length)];
      
      setPoolValue((prev) => prev + increase);
    }, Math.random() * 2000 + 1000); // 1-3s

    return () => clearInterval(interval);
  }, [isLocked, isResetting]);

  // Continuous activity feed (DESKTOP)
  useEffect(() => {
    const usernames = ['User842', 'KingDex', 'CryptoMike', 'SpinMaster', 'Player391', 'LuckyDave', 'BetKing', 'User573', 'WinnerTom', 'GambitAce'];
    const activityTemplates = [
      { text: (user: string) => `${user} joined $${[10, 15, 20, 25, 30, 35, 50][Math.floor(Math.random() * 7)]}`, type: 'join' as const },
      { text: (user: string) => `${user} won $${[850, 1200, 1670, 2030, 1450, 1780][Math.floor(Math.random() * 6)]}`, type: 'win' as const },
      { text: () => `+${[2, 3, 4][Math.floor(Math.random() * 3)]} players joined`, type: 'join' as const },
    ];

    const scheduleNext = () => {
      const delay = Math.random() * 2500 + 1500; // 1.5-4s

      setTimeout(() => {
        // Occasional silence (15% chance)
        if (Math.random() > 0.85) {
          setTimeout(scheduleNext, Math.random() * 1000 + 2000); // 2-3s silence
          return;
        }

        const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
        const username = usernames[Math.floor(Math.random() * usernames.length)];
        
        const newActivity: ActivityItem = {
          id: Date.now(),
          text: template.text(username),
          type: template.type,
          timestamp: 'just now',
        };

        setActivities((prev) => [newActivity, ...prev.slice(0, 5)]);
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }, []);

  // Update timestamps (DESKTOP)
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities((prev) => 
        prev.map((activity, index) => {
          const seconds = (index + 1) * 2;
          return {
            ...activity,
            timestamp: index === 0 ? 'just now' : `${seconds}s ago`,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Subtle active player count updates (DESKTOP)
  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.random() > 0.5 
        ? Math.floor(Math.random() * 5) + 1 
        : -Math.floor(Math.random() * 3);
      
      setActivePlayers((prev) => Math.max(1200, Math.min(1300, prev + change)));
    }, Math.random() * 8000 + 5000); // 5-13s

    return () => clearInterval(interval);
  }, []);

  // Timer color and behavior (DESKTOP)
  const getTimerColor = () => {
    if (countdown >= 6) return '#00FFC6'; // Green
    if (countdown >= 3) return '#FFA500'; // Yellow
    return '#FF5A5F'; // Red
  };

  const isYellowZone = countdown < 6 && countdown >= 3;
  const isRedZone = countdown < 3 && countdown > 0;

  // Dynamic pressure text (DESKTOP)
  const fillPercentage = (playersJoined / 50) * 100;
  const getPressureText = () => {
    if (fillPercentage >= 90) return 'Last spots remaining';
    if (fillPercentage >= 70) return 'Almost full';
    return 'Pool filling fast';
  };

  // CTA text escalation (DESKTOP)
  const getCtaText = () => {
    if (isRedZone) return 'LAST CHANCE – ENTER NOW';
    if (isYellowZone) return 'JOIN BEFORE LOCK';
    return 'JOIN THIS ROUND NOW';
  };

  const handleJoinNow = () => {
    openAuthModal('register');
  };

  const handleSignIn = () => {
    openAuthModal('login');
  };

  // Menu handlers
  const handleHowItWorks = () => {
    setActiveBottomSheet('how-it-works');
  };

  const handleRewards = () => {
    // Scroll to earn-rewards card and highlight it
    setTimeout(() => {
      const earnRewardsCard = document.getElementById('earn-rewards-card');
      if (earnRewardsCard) {
        earnRewardsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Apply highlight effect
        earnRewardsCard.style.transform = 'scale(1.02)';
        earnRewardsCard.style.transition = 'transform 300ms ease-out';
        setTimeout(() => {
          earnRewardsCard.style.transform = 'scale(1)';
        }, 300);
      }
    }, 100);
  };

  const handleInvite = () => {
    // Scroll to invite-earn card and highlight it
    setTimeout(() => {
      const inviteEarnCard = document.getElementById('invite-earn-card');
      if (inviteEarnCard) {
        inviteEarnCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Apply highlight effect
        inviteEarnCard.style.transform = 'scale(1.02)';
        inviteEarnCard.style.transition = 'transform 300ms ease-out';
        setTimeout(() => {
          inviteEarnCard.style.transform = 'scale(1)';
        }, 300);
      }
    }, 100);
  };

  const handleSupport = () => {
    setActiveBottomSheet('support');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Header - Mobile */}
      <div className="lg:hidden">
        <LandingHeader onMenuClick={() => setIsSidebarOpen(true)} />
      </div>

      {/* Header - Desktop */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-40" style={{
        height: '80px',
        backgroundColor: '#0A0A0A',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div className="h-full w-full mx-auto flex items-center justify-between" style={{
          maxWidth: 'min(1440px, 100vw)',
          paddingLeft: 'clamp(1.5rem, 5vw, 6.25rem)', // 24px to 100px
          paddingRight: 'clamp(1.5rem, 5vw, 6.25rem)',
        }}>
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)',
            }}>
              <span className="text-xl font-black" style={{ color: '#0A0A0A' }}>E</span>
            </div>
            <span className="text-xl font-black whitespace-nowrap" style={{ color: '#FFFFFF' }}>EARNIXY</span>
          </div>

          {/* Center Nav */}
          <nav className="flex items-center" style={{
            gap: 'clamp(1rem, 2vw, 2rem)', // 16px to 32px
          }}>
            {[
              { label: 'How It Works', action: handleHowItWorks },
              { label: 'Rewards', action: handleRewards },
              { label: 'Invite Friends', action: handleInvite },
              { label: 'Support', action: handleSupport },
            ].map((link, index) => (
              <button
                key={index}
                onClick={link.action}
                className="text-sm font-medium transition-colors hover:text-white whitespace-nowrap"
                style={{ color: '#A0A6B1' }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={handleSignIn}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/5"
              style={{
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              Sign In
            </button>
            <button
              onClick={handleJoinNow}
              className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 whitespace-nowrap"
              style={{
                background: '#00FF88',
                color: '#0A0A0A',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
              }}
            >
              Join Now
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar - Mobile Only */}
      <div className="lg:hidden">
        <LandingSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onHowItWorks={handleHowItWorks}
          onRewards={handleRewards}
          onInvite={handleInvite}
          onSupport={handleSupport}
        />
      </div>

      {/* Main Content */}
      <div className="pt-[56px] lg:pt-[80px]">{/* Mobile pt-14, Desktop pt-20 */}

        {/* HERO SECTION - Desktop: 2-column, Mobile: Full-width */}
        <section style={{
          paddingLeft: 'clamp(1rem, 5vw, 6.25rem)', // 16px to 100px
          paddingRight: 'clamp(1rem, 5vw, 6.25rem)',
          paddingTop: 'clamp(2rem, 4vw, 4rem)', // 32px to 64px
          paddingBottom: 'clamp(2rem, 4vw, 4rem)',
        }}>
          <div style={{
            maxWidth: 'min(1320px, 100%)',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {/* Desktop: 2-column layout */}
            <div className="lg:grid" style={{
              gridTemplateColumns: '1fr min(420px, 35%)', // Responsive right column
              gap: 'clamp(1.5rem, 3vw, 2rem)', // 24px to 32px
            }}>
              {/* MOBILE: LIVE GAME CARD */}
              <div className="lg:hidden">
                <LiveGameScreen />
              </div>
              
              {/* DESKTOP LEFT: LIVE GAME CARD */}
              <div className="hidden lg:block">
                <div className="rounded-2xl relative" style={{
                  padding: 'clamp(1.5rem, 3vw, 2rem)', // 24px to 32px
                  backgroundColor: '#0F1115',
                  border: `1px solid ${isLocked ? 'rgba(255, 90, 95, 0.3)' : 'rgba(0, 255, 136, 0.2)'}`,
                  boxShadow: isLocked ? '0 0 40px rgba(255, 90, 95, 0.15)' : '0 0 40px rgba(0, 255, 136, 0.15)',
                  minHeight: 'min(600px, 80vh)',
                  transition: 'all 0.3s ease',
                }}>
                  {/* LIVE badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
                      backgroundColor: 'rgba(255, 0, 0, 0.15)',
                      border: '1px solid rgba(255, 0, 0, 0.3)',
                    }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FF0000' }} />
                      <span className="text-xs font-bold" style={{ color: '#FF0000' }}>LIVE</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#A0A6B1' }}>Round #2847</span>
                  </div>

                  {/* WHEEL - Responsive size with DYNAMIC timer */}
                  <div className="relative mx-auto" style={{ 
                    width: 'clamp(280px, 50%, 460px)', // 280px to 460px based on viewport
                    aspectRatio: '1/1', // Perfect square
                    marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
                  }}>
                    {/* Wheel Container */}
                    <div
                      className="w-full h-full rounded-full relative overflow-hidden transition-all duration-300"
                      style={{
                        background: 'conic-gradient(from 0deg, #FF6B6B 0deg 60deg, #4ECDC4 60deg 120deg, #FFE66D 120deg 180deg, #95E1D3 180deg 240deg, #F38181 240deg 300deg, #AA96DA 300deg 360deg)',
                        boxShadow: '0 0 40px rgba(0, 255, 198, 0.3), inset 0 0 40px rgba(0, 0, 0, 0.5)',
                        animation: isLocked ? 'none' : 'spin-slow 20s linear infinite',
                        opacity: isLocked ? 0.5 : 1,
                      }}
                    >
                      {/* Center Circle - DYNAMIC colors and values */}
                      <div
                        className="absolute top-1/2 left-1/2 rounded-full flex flex-col items-center justify-center transition-all duration-300"
                        style={{
                          width: '50%', // 50% of wheel size
                          height: '50%',
                          backgroundColor: '#0B0F14',
                          border: `3px solid ${getTimerColor()}`,
                          boxShadow: `0 0 30px ${getTimerColor()}66`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div
                          className="font-black transition-all duration-300"
                          style={{
                            fontSize: 'clamp(2.5rem, 5vw, 4rem)', // Responsive font
                            color: getTimerColor(),
                            lineHeight: '1',
                          }}
                        >
                          {countdown}s
                        </div>
                        <div style={{ 
                          fontSize: 'clamp(0.625rem, 1vw, 0.75rem)',
                          fontWeight: '600',
                          color: '#9CA3AF',
                          marginTop: '0.25rem',
                        }}>
                          LOCKS IN
                        </div>
                      </div>

                      {/* Pointer */}
                      <div
                        className="absolute top-0 left-1/2"
                        style={{
                          width: '0',
                          height: '0',
                          borderLeft: '10px solid transparent',
                          borderRight: '10px solid transparent',
                          borderTop: '24px solid #FFFFFF',
                          filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))',
                          transform: 'translateX(-50%)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Pool & Players - DYNAMIC values */}
                  <div className="space-y-3 mb-6">
                    <div className="text-center">
                      <p className="text-sm mb-1" style={{ color: '#A0A6B1' }}>Current Pool</p>
                      <p className="transition-all duration-300" style={{ 
                        fontSize: 'clamp(2rem, 4vw, 3rem)', // Responsive
                        fontWeight: '900',
                        color: '#00FF88',
                        textShadow: '0 0 20px rgba(0, 255, 198, 0.5)',
                      }}>
                        ${poolValue.toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Player count with pressure text */}
                    <div className="text-center mb-2">
                      <p className="text-lg font-black mb-1 transition-all duration-300" style={{ color: '#FFFFFF' }}>
                        {playersJoined} / 50 players
                      </p>
                      <p 
                        className="text-sm font-bold mb-2 transition-all duration-300" 
                        style={{ 
                          color: fillPercentage >= 90 ? '#FF5A5F' : fillPercentage >= 70 ? '#FFA500' : '#00FFC6' 
                        }}
                      >
                        {getPressureText()}
                      </p>
                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1F2A37' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${fillPercentage}%`,
                            background: fillPercentage >= 90 
                              ? 'linear-gradient(90deg, #FF5A5F 0%, #FF3333 100%)'
                              : 'linear-gradient(90deg, #00FFC6 0%, #3B82F6 100%)',
                            boxShadow: fillPercentage >= 90 
                              ? '0 0 12px rgba(255, 90, 95, 0.6)'
                              : '0 0 10px rgba(0, 255, 198, 0.5)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Potential winnings */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg" style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    }}>
                      <span className="text-sm" style={{ color: '#A0A6B1' }}>Potential Win</span>
                      <span className="text-sm font-semibold" style={{ color: '#00FF88' }}>
                        ${Math.floor(poolValue * 0.73).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* CTA - DYNAMIC text and styling */}
                  <button
                    onClick={handleJoinNow}
                    disabled={isLocked}
                    className="w-full rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      padding: 'clamp(0.875rem, 2vw, 1.25rem)', // 14px to 20px
                      fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)', // 14px to 18px
                      background: isLocked 
                        ? '#6B7280'
                        : isRedZone
                        ? 'linear-gradient(135deg, #FF5A5F 0%, #FF3333 100%)'
                        : 'linear-gradient(135deg, #00FFC6 0%, #00D9A5 100%)',
                      color: '#0A0A0A',
                      boxShadow: isLocked
                        ? 'none'
                        : isRedZone
                        ? '0 0 40px rgba(255, 90, 95, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 0 30px rgba(0, 255, 198, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
                      letterSpacing: '0.5px',
                      animation: isRedZone && !isLocked ? 'pulse-glow 0.5s infinite' : 'none',
                      transform: isRedZone && !isLocked ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    {isLocked ? 'Entry closed – Round full' : getCtaText()}
                  </button>

                  {/* CTA REASSURANCE */}
                  {!isLocked && (
                    <p className="text-center text-xs mt-2" style={{ color: '#6B7280' }}>
                      Join in seconds • No hassle • Start instantly
                    </p>
                  )}

                  {/* URGENCY TEXT */}
                  {(isYellowZone || isRedZone) && !isLocked && (
                    <p className="text-center text-xs font-bold mt-2 animate-pulse" style={{ color: '#FF5A5F' }}>
                      {isRedZone ? '⚡ SECONDS LEFT' : 'Filling fast'}
                    </p>
                  )}
                </div>
              </div>

              {/* DESKTOP RIGHT: HAPPENING NOW - DYNAMIC activity feed */}
              <div className="hidden lg:block">
                <div className="rounded-2xl" style={{
                  padding: 'clamp(1rem, 2vw, 1.5rem)',
                  backgroundColor: '#0F1115',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  minHeight: 'min(600px, 80vh)',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <h3 style={{
                    fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                    fontWeight: '900',
                    marginBottom: '1rem',
                    color: '#FFFFFF',
                  }}>
                    Happening Now
                  </h3>
                  
                  {/* Dynamic activity feed */}
                  <div className="space-y-3 flex-1 overflow-auto">
                    {activities.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between transition-all duration-500"
                        style={{
                          animation: index === 0 ? 'slide-fade-in 0.5s ease-out' : 'none',
                          opacity: 1 - index * 0.1,
                          padding: '0.75rem',
                          backgroundColor: index === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                          borderRadius: '0.5rem',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: item.type === 'win' ? 'rgba(0, 255, 198, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              border: `1px solid ${item.type === 'win' ? 'rgba(0, 255, 198, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                            }}
                          >
                            <span className="text-base">👤</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ 
                              color: item.type === 'win' ? '#00FFC6' : '#3B82F6',
                              lineHeight: '1.4',
                            }}>
                              {item.text}
                            </p>
                            <span className="text-xs" style={{ color: '#6B7280' }}>
                              {item.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Active players count */}
                  <div 
                    className="mt-4 text-center py-3 px-4 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(0, 255, 198, 0.05)',
                      border: '1px solid rgba(0, 255, 198, 0.15)',
                    }}
                  >
                    <p 
                      className="text-sm font-bold transition-all duration-300" 
                      style={{ 
                        color: '#00FFC6',
                      }}
                    >
                      {activePlayers.toLocaleString()}+ players active now
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE ONLY: Simple Hero Text */}
        <section className="px-4 py-8 lg:hidden">
          <div className="max-w-[480px] mx-auto text-center">
            {/* Headline */}
            <h1 className="mb-3" style={{ 
              fontSize: '32px',
              lineHeight: '1.1',
              fontWeight: '900',
              color: '#FFFFFF',
            }}>
              Earn. Play.
            </h1>
            <h1 className="mb-4" style={{ 
              fontSize: '32px',
              lineHeight: '1.1',
              fontWeight: '900',
              color: '#00FF88',
            }}>
              Predict. Repeat.
            </h1>

            {/* Subtext */}
            <p className="mb-6" style={{
              fontSize: '15px',
              lineHeight: '1.5',
              color: '#A0A6B1',
            }}>
              Real players. Real pools. Multiple ways to earn.
            </p>

            {/* Trust Row */}
            <div className="flex items-center justify-center gap-2 flex-wrap" style={{
              fontSize: '12px',
              color: '#6B7280',
            }}>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" style={{ color: '#00FF88' }} />
                <span>Provably fair</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" style={{ color: '#00FF88' }} />
                <span>Instant payouts</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ 
                  backgroundColor: '#00FF88',
                  boxShadow: '0 0 8px #00FF88',
                }} />
                <span>Live activity</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — PLATFORM LOOP */}
        <section className="px-4 py-12 lg:hidden">
          <div className="max-w-[480px] mx-auto">
            {/* Horizontal Icons */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {[
                { icon: Target, label: 'Play' },
                { icon: TrendingUp, label: 'Win' },
                { icon: Zap, label: 'Earn' },
                { icon: ArrowRight, label: 'Repeat' },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.05) 100%)',
                      border: '1px solid rgba(0, 255, 136, 0.2)',
                    }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: '#00FF88' }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#A0A6B1' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Caption */}
            <p className="text-center text-sm" style={{ color: '#6B7280' }}>
              Stay active. Keep earning.
            </p>
          </div>
        </section>

        {/* STATS ROW - Desktop: Horizontal, Mobile: Grid */}
        <section className="px-4 lg:px-[100px] py-12">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-3 gap-3 lg:gap-6">
              {[
                { value: '10,000+', label: 'Rounds Completed', icon: Target },
                { value: '250K+', label: 'Active Players', icon: Users },
                { value: '$5M+', label: 'Total Paid Out', icon: TrendingUp },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-4 lg:p-6 rounded-xl lg:rounded-2xl text-center"
                  style={{
                    backgroundColor: '#0F1115',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
                  }}
                >
                  <div className="hidden lg:flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.05) 100%)',
                      border: '1px solid rgba(0, 255, 136, 0.2)',
                    }}>
                      <stat.icon className="w-6 h-6" style={{ color: '#00FF88' }} />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-4xl font-black mb-1 lg:mb-2" style={{ color: '#00FF88' }}>
                    {stat.value}
                  </p>
                  <p className="text-xs lg:text-sm font-semibold" style={{ color: '#A0A6B1' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION - Desktop: Horizontal, Mobile: Vertical */}
        <section className="px-4 lg:px-[100px] py-12 lg:py-16" style={{
          backgroundColor: '#12151C',
        }}>
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-2xl lg:text-3xl font-black text-center mb-8 lg:mb-12" style={{ color: '#FFFFFF' }}>
              START EARNING IN MULTIPLE WAYS
            </h2>

            <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
              {[
                {
                  id: 'ai-predictions',
                  icon: Target,
                  emoji: '🎯',
                  title: 'Play Live Rounds',
                  description: 'Join live rounds, pick your lucky number and win big.',
                  cta: 'Start Playing →',
                },
                {
                  id: 'earn-rewards',
                  icon: Zap,
                  emoji: '💰',
                  title: 'Earn Rewards',
                  description: 'Complete tasks and achievements to unlock rewards.',
                  cta: 'Explore Rewards →',
                },
                {
                  id: 'invite-earn',
                  icon: Users,
                  emoji: '👥',
                  title: 'Invite & Earn',
                  description: 'Invite friends and earn from their winnings.',
                  cta: 'Invite Friends →',
                },
              ].map((item, index) => (
                <button
                  key={index}
                  id={`${item.id}-card`}
                  onClick={() => setActiveBottomSheet(item.id)}
                  className="w-full p-4 lg:p-6 rounded-xl lg:rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
                  style={{
                    backgroundColor: '#0F1115',
                    border: '1px solid rgba(0, 255, 136, 0.15)',
                  }}
                >
                  <div className="flex items-start gap-3 lg:block">
                    <div className="text-3xl lg:text-4xl lg:mb-4">{item.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-base lg:text-xl font-bold mb-1 lg:mb-3" style={{ color: '#FFFFFF' }}>
                        {item.title}
                      </h3>
                      <p className="text-sm lg:text-base mb-2 lg:mb-4" style={{ 
                        color: '#A0A6B1',
                        lineHeight: '1.5',
                      }}>
                        {item.description}
                      </p>
                      <p className="text-xs lg:text-sm font-semibold hidden lg:block" style={{ color: '#00FF88' }}>
                        {item.cta}
                      </p>
                      <p className="text-xs lg:hidden" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        Tap to explore
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 — LIVE ACTIVITY */}
        <section className="px-4 py-12 lg:hidden">
          <div className="max-w-[480px] mx-auto">
            <h2 className="text-2xl font-black text-center mb-8" style={{ color: '#FFFFFF' }}>
              Happening Now
            </h2>

            <LiveActivityFeed />
          </div>
        </section>

        {/* CTA STRIP - Desktop: Full-width gradient, Mobile: Simple */}
        <section className="px-4 lg:px-[100px] py-12 lg:py-16 relative overflow-hidden">
          {/* Radial Glow Background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 255, 136, 0.15) 0%, transparent 70%)',
            }}
          />

          <div className="max-w-[480px] lg:max-w-[1200px] mx-auto">
            {/* Desktop: Full CTA Strip */}
            <div className="hidden lg:flex items-center justify-between p-8 rounded-2xl relative z-10" style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(0, 255, 136, 0.15) 100%)',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              boxShadow: '0 0 40px rgba(0, 255, 136, 0.2)',
            }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{
                  background: 'rgba(0, 255, 136, 0.2)',
                }}>
                  <Clock className="w-7 h-7" style={{ color: '#00FF88' }} />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-1" style={{ color: '#FFFFFF' }}>
                    NEXT ROUND IS FILLING FAST!
                  </h3>
                  <p className="text-base" style={{ color: '#A0A6B1' }}>
                    Don't miss your chance to win big.
                  </p>
                </div>
              </div>
              <button
                onClick={handleJoinNow}
                className="px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105"
                style={{
                  background: '#00FF88',
                  color: '#0A0A0A',
                  boxShadow: '0 0 30px rgba(0, 255, 136, 0.4)',
                }}
              >
                JOIN ROUND NOW
              </button>
            </div>

            {/* Mobile: Simple CTA */}
            <div className="lg:hidden text-center relative z-10">
              <h2 className="text-3xl font-black mb-2" style={{ color: '#FFFFFF' }}>
                Next round is filling…
              </h2>
              <p className="text-lg font-semibold mb-8" style={{ color: '#A0A6B1' }}>
                Don't miss it.
              </p>

              <button
                onClick={handleJoinNow}
                className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  height: '52px',
                  background: '#00FF88',
                  color: '#0D0F14',
                  fontSize: '16px',
                  fontWeight: '700',
                  borderRadius: '999px',
                  boxShadow: '0 0 40px rgba(0, 255, 136, 0.5), 0 4px 12px rgba(0, 0, 0, 0.2)',
                  border: 'none',
                  letterSpacing: '0.5px',
                }}
              >
                JOIN ROUND NOW
              </button>
            </div>
          </div>
        </section>

        {/* FAQ SECTION - Desktop: 2-column, Mobile: Single column */}
        <section className="px-4 lg:px-[100px] py-12 lg:py-16" style={{
          backgroundColor: '#12151C',
        }}>
          <div className="max-w-[480px] lg:max-w-[1200px] mx-auto">
            <h2 className="text-2xl lg:text-3xl font-black text-center mb-8 lg:mb-12" style={{ color: '#FFFFFF' }}>
              {/* Mobile: FAQ, Desktop: FREQUENTLY ASKED QUESTIONS */}
              <span className="lg:hidden">FAQ</span>
              <span className="hidden lg:inline">FREQUENTLY ASKED QUESTIONS</span>
            </h2>
            
            <div className="lg:hidden">
              <FAQSection />
            </div>

            {/* Desktop: 2-column FAQ */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
              <FAQSection />
            </div>
          </div>
        </section>

        {/* FOOTER - Desktop: Enhanced, Mobile: Simple */}
        <footer className="px-6 lg:px-[100px] py-8 lg:py-12">
          <div className="max-w-[480px] lg:max-w-[1200px] mx-auto">
            {/* Desktop: Logo + Tagline */}
            <div className="hidden lg:flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)',
              }}>
                <span className="text-2xl font-black" style={{ color: '#0A0A0A' }}>E</span>
              </div>
              <div>
                <span className="text-2xl font-black block" style={{ color: '#FFFFFF' }}>EARNIXY</span>
                <span className="text-sm" style={{ color: '#A0A6B1' }}>Play. Earn. Win.</span>
              </div>
            </div>

            {/* Trust Line */}
            <p 
              className="text-center mb-4" 
              style={{ 
                fontSize: '13px',
                fontWeight: '400',
                lineHeight: '1.4',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              Provably Fair • Secure • Play responsibly • 18+
            </p>

            {/* Links Row */}
            <div 
              className="flex items-center justify-center gap-3 lg:gap-6 mb-3 lg:mb-6"
              style={{
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              <a 
                href="#terms" 
                className="transition-opacity hover:opacity-100"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                {/* Desktop: Full names, Mobile: Short */}
                <span className="lg:hidden">Terms</span>
                <span className="hidden lg:inline">Terms of Service</span>
              </a>
              <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>•</span>
              <a 
                href="#privacy" 
                className="transition-opacity hover:opacity-100"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                <span className="lg:hidden">Privacy</span>
                <span className="hidden lg:inline">Privacy Policy</span>
              </a>
              <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>•</span>
              <a 
                href="#support" 
                className="transition-opacity hover:opacity-100"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                Support
              </a>
              <span className="hidden lg:inline" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>•</span>
              <a 
                href="#contact" 
                className="hidden lg:inline transition-opacity hover:opacity-100"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                Contact Us
              </a>
            </div>

            {/* Contact Line */}
            <p 
              className="text-center mb-2" 
              style={{ 
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              24/7 Support available
            </p>

            {/* Copyright */}
            <p 
              className="text-center" 
              style={{ 
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <span className="lg:hidden">© 2026 YourPlatform. All rights reserved.</span>
              <span className="hidden lg:inline">© 2024 EARNIXY. All rights reserved.</span>
            </p>
          </div>
        </footer>
      </div>

      {/* Bottom Sheets */}
      <BottomSheet
        isOpen={activeBottomSheet === 'how-it-works'}
        onClose={() => setActiveBottomSheet(null)}
        title="How it works"
        description="Join live rounds, participate, and earn in real time."
        features={[
          'Join a live round',
          'Participate before it locks',
          'Earn based on activity',
        ]}
      />

      <BottomSheet
        isOpen={activeBottomSheet === 'ai-predictions'}
        onClose={() => setActiveBottomSheet(null)}
        title="AI Predictions"
        description="Get smarter picks powered by real-time insights."
        features={[
          'Updated daily',
          'Confidence-based signals',
          'Designed to improve decisions',
        ]}
      />
      
      <BottomSheet
        isOpen={activeBottomSheet === 'earn-rewards'}
        onClose={() => setActiveBottomSheet(null)}
        title="Earn Rewards"
        description="Complete simple actions and earn as you go."
        features={[
          'Daily tasks',
          'Instant rewards',
          'Stack bonuses over time',
        ]}
      />
      
      <BottomSheet
        isOpen={activeBottomSheet === 'invite-earn'}
        onClose={() => setActiveBottomSheet(null)}
        title="Invite & Earn"
        description="Invite friends and earn from their activity."
        features={[
          'Earn per referral',
          'Ongoing rewards',
          'No limits',
        ]}
      />

      <BottomSheet
        isOpen={activeBottomSheet === 'support'}
        onClose={() => setActiveBottomSheet(null)}
        title="Support"
        description="Need help? We're here for you."
        features={[
          '24/7 support available',
          'Fast response',
          'Contact anytime',
        ]}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 90, 95, 0.6);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 90, 95, 0.8);
          }
        }

        @keyframes slide-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}