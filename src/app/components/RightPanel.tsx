import { Clock, Trophy, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

/**
 * RIGHT PANEL - DESKTOP ONLY
 * 
 * Fixed width: 320px
 * Contains:
 * 1. Active Round Card
 * 2. Top Winners Card
 * 3. Recent Wins Card
 */

export function RightPanel() {
  const { formatUSDT } = useUser();
  
  // Active Round State
  const [activeRoundPlayers, setActiveRoundPlayers] = useState(87);
  const [activeRoundPool, setActiveRoundPool] = useState(1847.5);
  const [countdown, setCountdown] = useState(45);
  const [progress, setProgress] = useState(67);

  // Top Winners
  const topWinners = [
    { name: 'James K.', amount: 342.50, avatar: '👤' },
    { name: 'Sarah M.', amount: 289.75, avatar: '👤' },
    { name: 'David L.', amount: 245.20, avatar: '👤' },
    { name: 'Fatima A.', amount: 198.90, avatar: '👤' },
    { name: 'Michael B.', amount: 176.40, avatar: '👤' },
  ];

  // Recent Wins State
  const [recentWins, setRecentWins] = useState([
    { user: 'Alex', amount: 45.30, time: '2m ago' },
    { user: 'Maria', amount: 78.60, time: '5m ago' },
    { user: 'John', amount: 23.10, time: '8m ago' },
    { user: 'Lisa', amount: 156.80, time: '12m ago' },
  ]);

  // Active Round Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRoundPlayers(prev => prev + Math.floor(Math.random() * 3));
      setActiveRoundPool(prev => prev + (Math.random() * 15 + 5));
      setCountdown(prev => (prev <= 1 ? 60 : prev - 1));
      setProgress(prev => Math.min(100, prev + Math.random() * 2));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Recent Wins Rotation
  useEffect(() => {
    const interval = setInterval(() => {
      const newWins = [...recentWins];
      newWins.pop();
      newWins.unshift({
        user: ['Alex', 'Maria', 'John', 'Lisa', 'Sarah', 'David'][Math.floor(Math.random() * 6)],
        amount: Math.random() * 200 + 10,
        time: 'Just now'
      });
      setRecentWins(newWins);
    }, 8000);

    return () => clearInterval(interval);
  }, [recentWins]);

  return (
    <div 
      className="hidden lg:block flex-shrink-0 overflow-y-auto"
      style={{
        width: '320px',
        height: 'calc(100vh - 88px)',
        paddingLeft: '12px',
        paddingRight: '24px',
        paddingBottom: '2rem',
      }}
    >
      <div className="space-y-4">
        
        {/* ACTIVE ROUND CARD */}
        <div 
          className="rounded-2xl p-4"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10B981' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Active Round
              </h3>
            </div>
            <span className="text-xs px-2 py-1 rounded-full" style={{ 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              color: '#10B981',
              fontWeight: 600
            }}>
              LIVE
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Players</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{activeRoundPlayers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pool</span>
              <span className="text-sm font-bold" style={{ color: '#10B981' }}>{formatUSDT(activeRoundPool)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ends in</span>
              <span className="text-sm font-bold" style={{ color: '#FF9800' }}>{countdown}s</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ 
                width: `${progress}%`,
                backgroundColor: '#10B981'
              }}
            />
          </div>
        </div>

        {/* TOP WINNERS CARD */}
        <div 
          className="rounded-2xl p-4"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4" style={{ color: '#FFD700' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Top Winners
            </h3>
          </div>

          <div className="space-y-2">
            {topWinners.map((winner, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-2 px-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.08)' : 'transparent' 
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{winner.avatar}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {winner.name}
                  </span>
                </div>
                <span className="text-xs font-bold" style={{ color: '#10B981' }}>
                  {formatUSDT(winner.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT WINS CARD */}
        <div 
          className="rounded-2xl p-4"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--blue-primary)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Recent Wins
            </h3>
          </div>

          <div className="space-y-2">
            {recentWins.map((win, index) => (
              <div 
                key={index}
                className="py-2 border-b transition-all"
                style={{ 
                  borderColor: 'var(--border-color)',
                  opacity: index === 0 ? 1 : 0.7
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {win.user} just won
                  </span>
                  <span className="text-xs font-bold" style={{ color: '#10B981' }}>
                    {formatUSDT(win.amount)}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {win.time}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
