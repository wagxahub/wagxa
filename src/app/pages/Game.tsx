import { useState, useEffect, useRef } from 'react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { useBonus } from '../context/BonusContext';
import { useLeaderboard } from '../context/LeaderboardContext';
import { toast } from 'sonner';
import { Shield, RefreshCw, Info, Users, TrendingUp, Clock } from 'lucide-react';
import { GameFooter } from '../components/GameFooter';
import { createGameSession, generateColorResult, saveGameRecord, type GameSession } from '@/lib/provablyFair';

type GameResult = 'red' | 'blue';

export function Game() {
  const { balance, updateBalance, formatCurrency: globalFormatCurrency, currencyPreference, gameBalance, updateGameBalance, username } = useUser();
  const { addWagering } = useBonus();
  const { recordGamePlayed } = useLeaderboard();
  const [betAmount, setBetAmount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState<'red' | 'blue' | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [redStake, setRedStake] = useState(0);
  const [blueStake, setBlueStake] = useState(0);
  const [redPlayers, setRedPlayers] = useState(0);
  const [bluePlayers, setBluePlayers] = useState(0);
  const [recentIncrease, setRecentIncrease] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastWinner, setLastWinner] = useState<GameResult | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>(['red', 'blue', 'blue', 'red', 'red', 'blue', 'blue', 'red']);
  const [showProvablyFair, setShowProvablyFair] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [activeTab, setActiveTab] = useState<'yours' | 'recent'>('yours');
  const [showBetConfirmation, setShowBetConfirmation] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState<'win' | 'loss' | 'no-bet' | null>(null);
  const [placedBet, setPlacedBet] = useState<{ color: 'red' | 'blue', amount: number } | null>(null);
  const [yourBetHistory, setYourBetHistory] = useState<Array<{ round: number, color: GameResult, amount: number, result: string, payout: number }>>([
    { round: 11, color: 'blue', amount: 100, result: 'win', payout: 165 },
    { round: 10, color: 'red', amount: 50, result: 'loss', payout: 0 },
    { round: 9, color: 'blue', amount: 200, result: 'win', payout: 330 },
  ]);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [serverSeedHash, setServerSeedHash] = useState<string>('');

  const placedBetRef = useRef<{ color: 'red' | 'blue', amount: number } | null>(null);
  const currentRoundRef = useRef(12);

  const formatCurrency = (amount: number, hideDecimals?: boolean): string => {
    if (currencyPreference === 'ngn') {
      return `₦${Math.floor(amount).toLocaleString('en-US')}`;
    } else {
      return `$${amount.toFixed(2)}`;
    }
  };

  const totalPool = (redStake + blueStake) / 100;
  const recentIncreaseDisplay = recentIncrease / 100;
  const redStakeDisplay = redStake / 100;
  const blueStakeDisplay = blueStake / 100;

  const potentialWin = betAmount > 0 && selectedColor ? (betAmount * 1.65) : 0;
  const potentialWinPercent = betAmount > 0 ? 65 : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endRound();
          setCurrentRound(r => {
            const newRound = r + 1;
            currentRoundRef.current = newRound;
            return newRound;
          });
          return 90;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const endRound = async () => {
    setIsSpinning(true);

    // Create provably fair game session
    const session = await createGameSession();
    setGameSession(session);
    setServerSeedHash(session.serverSeedHash);

    // Generate provably fair result
    const winner: GameResult = await generateColorResult(
      session.serverSeed,
      session.clientSeed,
      session.nonce
    );

    const baseRotation = 720 + 360 * 5;
    const finalRotation = winner === 'red' ? baseRotation + 90 : baseRotation + 270;
    setSpinRotation(finalRotation);
    setGameHistory((prev) => [winner, ...prev.slice(0, 7)]);

    const betSnapshot = placedBetRef.current ? { ...placedBetRef.current } : null;
    const roundNumber = currentRoundRef.current;

    // Save provably fair record
    saveGameRecord({
      gameId: `color_${roundNumber}`,
      serverSeed: session.serverSeed,
      serverSeedHash: session.serverSeedHash,
      clientSeed: session.clientSeed,
      nonce: session.nonce,
      result: winner,
      timestamp: Date.now()
    });
    
    setTimeout(() => {
      setLastWinner(winner);
      setShowResult(true);

      if (betSnapshot && betSnapshot.color === winner) {
        const won = betSnapshot.amount * 1.65;
        setWinAmount(won);
        updateGameBalance(won);
        setResultType('win');

        setYourBetHistory(prev => [{
          round: roundNumber,
          color: betSnapshot.color,
          amount: betSnapshot.amount,
          result: 'win',
          payout: won
        }, ...prev].slice(0, 10));

        // Track win in leaderboard
        recordGamePlayed(username || 'guest', betSnapshot.amount, won, true);

      } else if (betSnapshot && betSnapshot.color !== winner) {
        setResultType('loss');
        setWinAmount(betSnapshot.amount);

        setYourBetHistory(prev => [{
          round: roundNumber,
          color: betSnapshot.color,
          amount: betSnapshot.amount,
          result: 'loss',
          payout: 0
        }, ...prev].slice(0, 10));

        // Track loss in leaderboard
        recordGamePlayed(username || 'guest', betSnapshot.amount, 0, false);

      } else {
        setResultType('no-bet');
      }

      setIsPlaying(false);
      setPlacedBet(null);
      placedBetRef.current = null;
      
      setTimeout(() => {
        setShowResult(false);
        setIsSpinning(false);
        setSpinRotation(0);
        setLastWinner(null);
        setShowResultModal(true);
        
        setRedPlayers(Math.floor(Math.random() * 20) + 10);
        setBluePlayers(Math.floor(Math.random() * 20) + 10);
        setRedStake(Math.floor(Math.random() * 3000) + 2000);
        setBlueStake(Math.floor(Math.random() * 3000) + 2000);
        
        setTimeout(() => {
          setSelectedColor(null);
          setBetAmount(0);
        }, 500);
      }, 3000);
    }, 4000);
  };

  const handlePlaceBet = () => {
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }
    if (betAmount <= 0) {
      toast.error('Please enter a bet amount');
      return;
    }
    if (betAmount > gameBalance) {
      setErrorMessage(`You need ${formatCurrency(betAmount, true)} but only have ${formatCurrency(gameBalance, true)} in your gaming balance. Please transfer funds from your main wallet.`);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    setShowBetConfirmation(true);
  };

  const confirmBet = () => {
    updateGameBalance(-betAmount);
    addWagering(betAmount); // Track wagering for bonus
    setIsPlaying(true);

    if (selectedColor === 'red') {
      setRedStake((prev) => prev + (betAmount * 100));
      setRedPlayers((prev) => prev + 1);
    } else {
      setBlueStake((prev) => prev + (betAmount * 100));
      setBluePlayers((prev) => prev + 1);
    }

    toast.success('Bet placed successfully!');
    setShowBetConfirmation(false);
    setPlacedBet({ color: selectedColor!, amount: betAmount });
    placedBetRef.current = { color: selectedColor!, amount: betAmount };
    currentRoundRef.current = currentRound;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLastFiveSeconds = timeLeft <= 5 && timeLeft > 0;

  const recentBets = [
    { user: username || 'Guest', color: 'red' as GameResult, amount: 5.00, time: '2s ago' },
    { user: 'CryptoKing', color: 'blue' as GameResult, amount: 3.00, time: '5s ago' },
    { user: 'LuckyPlayer', color: 'red' as GameResult, amount: 1.50, time: '12s ago' },
    { user: 'WinStreak', color: 'blue' as GameResult, amount: 8.00, time: '18s ago' },
    { user: 'HighRoller', color: 'red' as GameResult, amount: 2.50, time: '25s ago' },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: '#0A0A0A' }}>
      <TopBar />

      {/* MOBILE LAYOUT (< 1024px) - Original vertical layout */}
      <div className="lg:hidden w-full max-w-[480px] md:max-w-[768px] mx-auto px-4 md:px-6 pb-20">
        {/* Mobile content preserved... */}
        <div className="flex items-center justify-between w-full mt-4 mb-4">
          <BackButton className="mb-0" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>Round</p>
              <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>#{currentRound}</p>
            </div>
            <button
              onClick={() => setShowRules(true)}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">Rules</span>
            </button>
          </div>
        </div>

        {/* Mobile pool stats */}
        <div className="rounded-xl shadow-lg grid grid-cols-3 gap-3 p-4 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex flex-col items-center rounded-lg p-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '2px solid #EF4444' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#EF4444' }}>🔴 RED</p>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{redPlayers}</p>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(redStakeDisplay, true)}</p>
          </div>

          <div className="flex flex-col items-center rounded-lg p-3" style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #EF4444 100%)' }}>
            <p className="text-xs font-semibold mb-1 text-yellow-900">💰 POOL</p>
            <p className="text-xl font-bold text-white">{formatCurrency(totalPool, true)}</p>
          </div>

          <div className="flex flex-col items-center rounded-lg p-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '2px solid #3B82F6' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#3B82F6' }}>🔵 BLUE</p>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{bluePlayers}</p>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(blueStakeDisplay, true)}</p>
          </div>
        </div>

        {/* Mobile wheel */}
        <div className="relative w-full max-w-md mx-auto mb-6">
          {/* Pointer */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-4" style={{ zIndex: 20 }}>
            <svg width="48" height="60" viewBox="0 0 40 50">
              <path d="M 20 45 L 5 10 L 20 15 L 35 10 Z" fill="white" />
              <path d="M 20 43 L 7 12 L 20 16 L 33 12 Z" fill="#EF4444" />
            </svg>
          </div>

          <div style={{ width: '100%', aspectRatio: '1', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `rotate(${spinRotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'transform 0.5s ease',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 400 400">
                <defs>
                  <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#F87171', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>

                <path
                  d="M 200 40 A 160 160 0 0 1 200 360 L 200 280 A 80 80 0 0 0 200 120 Z"
                  fill="url(#blueGrad)"
                  style={{ 
                    cursor: 'pointer', 
                    opacity: showResult && lastWinner === 'red' ? 0.4 : 1,
                    filter: selectedColor === 'blue' && !isSpinning ? 'drop-shadow(0 0 15px #3B82F6)' : 'none'
                  }}
                  onClick={() => !isPlaying && !isSpinning && setSelectedColor('blue')}
                />

                <path
                  d="M 200 40 A 160 160 0 0 0 200 360 L 200 280 A 80 80 0 0 1 200 120 Z"
                  fill="url(#redGrad)"
                  style={{ 
                    cursor: 'pointer', 
                    opacity: showResult && lastWinner === 'blue' ? 0.4 : 1,
                    filter: selectedColor === 'red' && !isSpinning ? 'drop-shadow(0 0 15px #EF4444)' : 'none'
                  }}
                  onClick={() => !isPlaying && !isSpinning && setSelectedColor('red')}
                />

                {/* Tap Me Text */}
                <text x="300" y="190" fontSize="20" fontWeight="700" fill="white" textAnchor="middle">Tap</text>
                <text x="300" y="215" fontSize="20" fontWeight="700" fill="white" textAnchor="middle">Me</text>
                <text x="100" y="190" fontSize="20" fontWeight="700" fill="white" textAnchor="middle">Tap</text>
                <text x="100" y="215" fontSize="20" fontWeight="700" fill="white" textAnchor="middle">Me</text>

                <circle cx="200" cy="200" r="70" fill="white" />
              </svg>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              {isSpinning ? (
                <>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>SPINNING...</p>
                  <div className="text-3xl">🎰</div>
                </>
              ) : showResult ? (
                <>
                  <p className="text-2xl mb-1">{lastWinner === 'blue' ? '🔵' : '🔴'}</p>
                  <p className="text-sm font-bold" style={{ color: lastWinner === 'blue' ? '#3B82F6' : '#EF4444' }}>
                    {lastWinner === 'blue' ? 'BLUE' : 'RED'} WINS
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>TIME LEFT</p>
                  <p className="text-4xl font-bold" style={{ color: isLastFiveSeconds ? '#EF4444' : '#0A84FF' }}>
                    {formatTime(timeLeft)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile betting */}
        <div className="rounded-xl shadow-lg p-5 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: '#FFFFFF' }}>Place Your Bet</h3>
          
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-primary)' }}>
              Bet Amount
            </label>
            <input
              type="number"
              value={betAmount || ''}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full border-2 rounded-lg p-3 text-lg font-semibold"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 5, 10].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount((prev) => prev + amount)}
                className="rounded-lg font-semibold py-2"
                style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-primary)' }}
              >
                +${amount}
              </button>
            ))}
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={isPlaying || !selectedColor || betAmount <= 0}
            className="w-full rounded-lg font-bold py-3"
            style={{
              background: (!selectedColor || betAmount <= 0 || isPlaying) ? '#9CA3AF' : 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #EF4444 100%)',
              color: 'white'
            }}
          >
            {isPlaying ? '✓ BET PLACED' : 'PLACE BET'}
          </button>
        </div>

        {/* Mobile: Current Selection Card */}
        {selectedColor && (
          <div className="rounded-xl shadow-lg p-4 mb-4" style={{
            backgroundColor: selectedColor === 'blue' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `2px solid ${selectedColor === 'blue' ? '#3B82F6' : '#EF4444'}`
          }}>
            <p className="text-sm font-semibold mb-2" style={{ color: '#9CA3AF' }}>CURRENT SELECTION</p>
            <p className="text-lg font-bold mb-1" style={{ color: selectedColor === 'blue' ? '#3B82F6' : '#EF4444' }}>
              {selectedColor === 'blue' ? '🔵 BLUE' : '🔴 RED'}
            </p>
            {betAmount > 0 && (
              <p className="text-lg font-bold" style={{ color: '#10B981' }}>
                Potential Win: {formatCurrency(potentialWin, true)} (+{potentialWinPercent}%)
              </p>
            )}
          </div>
        )}

        {/* Mobile: Game History */}
        <div className="rounded-xl shadow-lg p-4 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
            LAST 8 RESULTS
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {gameHistory.slice(0, 8).map((result, index) => (
              <div
                key={index}
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-lg flex-shrink-0"
                style={{ backgroundColor: result === 'red' ? '#FEE2E2' : '#DBEAFE' }}
              >
                <span className="text-xl">{result === 'red' ? '🔴' : '🔵'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Live Bets Card */}
        <div className="rounded-xl shadow-lg p-4 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: '#0A84FF' }} />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
              LIVE BETS
            </h3>
            <span className="ml-auto px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#10B981', color: 'white' }}>
              LIVE
            </span>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {recentBets.map((bet, index) => (
              <div
                key={index}
                className="p-3 rounded-lg flex items-center justify-between"
                style={{ backgroundColor: 'var(--bg-accent)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{bet.color === 'red' ? '🔴' : '🔵'}</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{bet.user}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{bet.time}</p>
                  </div>
                </div>
                <p className="text-sm font-bold" style={{ color: '#FBBF24' }}>
                  ${bet.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Tabs for Bet History */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab('yours')}
            className="flex-1 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: activeTab === 'yours' ? '#0A84FF' : 'var(--bg-card)',
              color: activeTab === 'yours' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Your Bets
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className="flex-1 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: activeTab === 'recent' ? '#0A84FF' : 'var(--bg-card)',
              color: activeTab === 'recent' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Recent Bets
          </button>
        </div>

        {/* Mobile: Bet Feed */}
        <div className="rounded-xl shadow-lg p-4 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          {activeTab === 'yours' ? (
            <div className="space-y-3">
              {yourBetHistory.length === 0 ? (
                <p className="text-center py-6" style={{ color: 'var(--text-secondary)' }}>
                  No bets placed yet
                </p>
              ) : (
                yourBetHistory.map((bet, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-accent)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{bet.color === 'red' ? '🔴' : '🔵'}</span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Round #{bet.round}
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                          backgroundColor: bet.result === 'win' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: bet.result === 'win' ? '#10B981' : '#EF4444'
                        }}
                      >
                        {bet.result === 'win' ? 'WIN' : 'LOSS'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Bet: {formatCurrency(bet.amount, true)}
                      </span>
                      <span className="text-sm font-bold" style={{
                        color: bet.result === 'win' ? '#10B981' : '#EF4444'
                      }}>
                        {bet.result === 'win' ? '+' : '-'}{formatCurrency(bet.result === 'win' ? bet.payout : bet.amount, true)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentBets.map((bet, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: 'var(--bg-accent)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{bet.color === 'red' ? '🔴' : '🔵'}</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{bet.user}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{bet.time}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold" style={{ color: '#FBBF24' }}>
                    ${bet.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP LAYOUT (≥ 1024px) - 60/40 SPLIT */}
      <div className="hidden lg:block w-full max-w-[1600px] mx-auto px-8 pb-20">
        <div className="mb-4">
          <BackButton />
        </div>

        {/* DESKTOP: TWO-COLUMN LAYOUT - 52/48 */}
        <div className="flex gap-6">
          {/* LEFT: MAIN GAME AREA + BETTING (60%) */}
          <div className="w-[60%] space-y-4">
            
            {/* Header with Round Info */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>Color Prediction</h1>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Choose Red or Blue • 1.65x multiplier</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>ROUND</p>
                  <p className="text-3xl font-bold" style={{ color: '#0A84FF' }}>#{currentRound}</p>
                </div>
                <button
                  onClick={() => setShowRules(true)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                >
                  <Info className="w-5 h-5" />
                  <span className="font-semibold">Rules</span>
                </button>
              </div>
            </div>

            {/* Pool Stats - Horizontal */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '2px solid #EF4444' }}>
                <p className="text-sm font-bold mb-2" style={{ color: '#EF4444' }}>🔴 RED POOL</p>
                <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{formatCurrency(redStakeDisplay, true)}</p>
                <p className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Users className="w-3 h-3" />
                  {redPlayers} players
                </p>
              </div>

              <div className="rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #EF4444 100%)' }}>
                <p className="text-sm font-bold mb-2 text-yellow-900">💰 TOTAL POOL</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(totalPool, true)}</p>
                <p className="text-xs text-yellow-100">Winner takes all</p>
              </div>

              <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '2px solid #3B82F6' }}>
                <p className="text-sm font-bold mb-2" style={{ color: '#3B82F6' }}>🔵 BLUE POOL</p>
                <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{formatCurrency(blueStakeDisplay, true)}</p>
                <p className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Users className="w-3 h-3" />
                  {bluePlayers} players
                </p>
              </div>
            </div>

            {/* MAIN WHEEL */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="relative mx-auto" style={{ width: '340px', height: '340px' }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `rotate(${spinRotation}deg)`,
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'transform 0.5s ease',
                  }}
                >
                  <svg width="100%" height="100%" viewBox="0 0 400 400">
                    <defs>
                      <linearGradient id="blueGradDesk" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="redGradDesk" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#F87171', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
                        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>

                    <path
                      d="M 200 40 A 160 160 0 0 1 200 360 L 200 280 A 80 80 0 0 0 200 120 Z"
                      fill="url(#blueGradDesk)"
                      filter={selectedColor === 'blue' ? 'url(#glow)' : 'none'}
                      style={{
                        cursor: 'pointer',
                        opacity: showResult && lastWinner === 'red' ? 0.4 : 1,
                        filter: selectedColor === 'blue' && !isSpinning ? 'drop-shadow(0 0 20px #3B82F6)' : 'none'
                      }}
                      onClick={() => !isPlaying && !isSpinning && setSelectedColor('blue')}
                    />

                    <path
                      d="M 200 40 A 160 160 0 0 0 200 360 L 200 280 A 80 80 0 0 1 200 120 Z"
                      fill="url(#redGradDesk)"
                      filter={selectedColor === 'red' ? 'url(#glow)' : 'none'}
                      style={{
                        cursor: 'pointer',
                        opacity: showResult && lastWinner === 'blue' ? 0.4 : 1,
                        filter: selectedColor === 'red' && !isSpinning ? 'drop-shadow(0 0 20px #EF4444)' : 'none'
                      }}
                      onClick={() => !isPlaying && !isSpinning && setSelectedColor('red')}
                    />

                    <text x="90" y="195" fontSize="26" fontWeight="700" fill="white" textAnchor="middle">Tap</text>
                    <text x="90" y="225" fontSize="26" fontWeight="700" fill="white" textAnchor="middle">Me</text>
                    <text x="310" y="195" fontSize="26" fontWeight="700" fill="white" textAnchor="middle">Tap</text>
                    <text x="310" y="225" fontSize="26" fontWeight="700" fill="white" textAnchor="middle">Me</text>

                    <circle cx="200" cy="200" r="75" fill="white" />
                  </svg>
                </div>

                {/* Center Timer */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  {isSpinning ? (
                    <>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#6B7280' }}>SPINNING...</p>
                      <div className="text-5xl">🎰</div>
                    </>
                  ) : showResult ? (
                    <>
                      <p className="text-5xl mb-2">{lastWinner === 'blue' ? '🔵' : '🔴'}</p>
                      <p className="text-xl font-bold" style={{ color: lastWinner === 'blue' ? '#3B82F6' : '#EF4444' }}>
                        {lastWinner === 'blue' ? 'BLUE' : 'RED'} WINS!
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>TIME LEFT</p>
                      <p className="text-3xl font-bold" style={{
                        color: isLastFiveSeconds ? '#EF4444' : '#0A84FF',
                        textShadow: isLastFiveSeconds ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none'
                      }}>
                        {formatTime(timeLeft)}
                      </p>
                    </>
                  )}
                </div>

                {/* Pointer */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-4" style={{ zIndex: 20 }}>
                  <svg width="48" height="60" viewBox="0 0 40 50">
                    <path d="M 20 45 L 5 10 L 20 15 L 35 10 Z" fill="white" />
                    <path d="M 20 43 L 7 12 L 20 16 L 33 12 Z" fill="#EF4444" />
                  </svg>
                </div>

                {/* Warning */}
                {isLastFiveSeconds && !isSpinning && (
                  <div className="absolute bottom-0 left-0 right-0 text-center">
                    <p className="text-base font-bold animate-pulse" style={{ color: '#EF4444' }}>
                      ⚠ BETS CLOSING SOON!
                    </p>
                  </div>
                )}
              </div>

              {/* Selection Info */}
              {selectedColor && (
                <div className="mt-5 text-center p-4 rounded-xl" style={{
                  backgroundColor: selectedColor === 'blue' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `2px solid ${selectedColor === 'blue' ? '#3B82F6' : '#EF4444'}`
                }}>
                  <p className="text-lg font-bold mb-1" style={{ color: selectedColor === 'blue' ? '#3B82F6' : '#EF4444' }}>
                    Selected: {selectedColor === 'blue' ? '🔵 BLUE' : '🔴 RED'}
                  </p>
                  {betAmount > 0 && (
                    <p className="text-lg font-bold" style={{ color: '#10B981' }}>
                      Potential Win: {formatCurrency(potentialWin, true)} (+{potentialWinPercent}%)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* BETTING CONTROLS - MOVED FROM RIGHT SIDE */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '2px solid var(--border-color)' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Place Your Bet</h3>
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Your Balance</p>
                  <p className="text-lg font-bold" style={{ color: '#0A84FF' }}>{formatCurrency(gameBalance, true)}</p>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg text-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                  <p className="text-sm font-semibold">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-primary)' }}>
                    Bet Amount (USDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      $
                    </span>
                    <input
                      type="number"
                      value={betAmount || ''}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full border-2 rounded-xl p-4 pl-10 text-xl font-bold"
                      style={{
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-primary)' }}>
                    Quick Amounts
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 5, 10, 50].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setBetAmount((prev) => prev + amount)}
                        className="rounded-lg font-semibold py-3 transition-all hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: amount === 50 ? '#FBBF24' : 'var(--bg-accent)',
                          color: amount === 50 ? '#78350F' : 'var(--text-primary)',
                          border: amount === 50 ? '2px solid #F59E0B' : 'none',
                          fontSize: '0.875rem'
                        }}
                      >
                        +${amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceBet}
                disabled={isPlaying || !selectedColor || betAmount <= 0 || isSpinning}
                className="w-full rounded-xl font-bold text-xl py-5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: (!selectedColor || betAmount <= 0 || isPlaying)
                    ? '#9CA3AF'
                    : 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #EF4444 100%)',
                  color: 'white',
                  boxShadow: (!selectedColor || betAmount <= 0 || isPlaying) ? 'none' : '0 0 30px rgba(251, 191, 36, 0.5)'
                }}
              >
                {isPlaying ? '✓ BET PLACED' : 'PLACE BET'}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <Shield className="w-4 h-4" style={{ color: '#10B981' }} />
                <p className="text-xs font-medium" style={{ color: '#10B981' }}>Provably Fair</p>
              </div>
            </div>

            {/* Last Results */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <p className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                LAST 8 RESULTS
              </p>
              <div className="flex gap-3">
                {gameHistory.slice(0, 8).map((result, index) => (
                  <div
                    key={index}
                    className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-transform hover:scale-110"
                    style={{ backgroundColor: result === 'red' ? '#FEE2E2' : '#DBEAFE' }}
                  >
                    <span className="text-2xl">{result === 'red' ? '🔴' : '🔵'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE FEED ONLY (40%) - STICKY & CLEAN */}
          <div className="w-[38%] sticky top-20 self-start space-y-4" style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
            
            {/* Live Bets Feed */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" style={{ color: '#0A84FF' }} />
                <h3 className="text-sm font-bold" style={{ color: '#FFFFFF' }}>LIVE BETS</h3>
                <span className="ml-auto px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#10B981', color: 'white' }}>
                  LIVE
                </span>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {recentBets.map((bet, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg flex items-center justify-between"
                    style={{ backgroundColor: 'var(--bg-accent)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{bet.color === 'red' ? '🔴' : '🔵'}</span>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{bet.user}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{bet.time}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold" style={{ color: '#FBBF24' }}>
                      ${bet.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bet History Tabs */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('yours')}
                  className="flex-1 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: activeTab === 'yours' ? '#0A84FF' : 'transparent',
                    color: activeTab === 'yours' ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  Your Bets
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className="flex-1 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: activeTab === 'recent' ? '#0A84FF' : 'transparent',
                    color: activeTab === 'recent' ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  Recent Bets
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {activeTab === 'yours' ? (
                  yourBetHistory.length === 0 ? (
                    <p className="text-center py-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      No bets placed yet
                    </p>
                  ) : (
                    yourBetHistory.map((bet, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--bg-accent)' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{bet.color === 'red' ? '🔴' : '🔵'}</span>
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              Round #{bet.round}
                            </span>
                          </div>
                          <span
                            className="text-xs font-bold px-2 py-1 rounded"
                            style={{
                              backgroundColor: bet.result === 'win' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: bet.result === 'win' ? '#10B981' : '#EF4444'
                            }}
                          >
                            {bet.result === 'win' ? 'WIN' : 'LOSS'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Bet: {formatCurrency(bet.amount, true)}
                          </span>
                          <span className="text-sm font-bold" style={{
                            color: bet.result === 'win' ? '#10B981' : '#EF4444'
                          }}>
                            {bet.result === 'win' ? '+' : '-'}{formatCurrency(bet.result === 'win' ? bet.payout : bet.amount, true)}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  recentBets.map((bet, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg flex items-center justify-between"
                      style={{ backgroundColor: 'var(--bg-accent)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{bet.color === 'red' ? '🔴' : '🔵'}</span>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{bet.user}</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{bet.time}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold" style={{ color: '#FBBF24' }}>
                        ${bet.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Player Count */}
            <div className="rounded-xl p-4 text-center" style={{ background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)' }}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5 text-white" />
                <p className="text-2xl font-bold text-white">{redPlayers + bluePlayers}</p>
              </div>
              <p className="text-sm text-blue-100">Players Online</p>
            </div>
          </div>
        </div>
      </div>

      <GameFooter />

      {/* Modals */}
      {showBetConfirmation && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowBetConfirmation(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Confirm Bet
            </h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Color:</span>
                <span className="font-bold" style={{ color: selectedColor === 'blue' ? '#3B82F6' : '#EF4444' }}>
                  {selectedColor === 'blue' ? '🔵 BLUE' : '🔴 RED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Amount:</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(betAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Potential Win:</span>
                <span className="font-bold" style={{ color: '#10B981' }}>
                  {formatCurrency(potentialWin)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmBet}
                className="flex-1 py-3 rounded-xl font-bold"
                style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #EF4444 100%)', color: 'white' }}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowBetConfirmation(false)}
                className="px-6 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showResultModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowResultModal(false)}
        >
          <div
            className="rounded-2xl p-8 max-w-md w-full text-center"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {resultType === 'win' ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#10B981' }}>YOU WON!</h2>
                <p className="text-4xl font-bold mb-4" style={{ color: '#10B981' }}>
                  +{formatCurrency(winAmount)}
                </p>
              </>
            ) : resultType === 'loss' ? (
              <>
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#EF4444' }}>Better Luck Next Time</h2>
                <p className="text-2xl font-bold mb-4" style={{ color: '#EF4444' }}>
                  -{formatCurrency(winAmount)}
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#9CA3AF' }}>Round Ended</h2>
                <p style={{ color: 'var(--text-secondary)' }}>You didn't place a bet this round</p>
              </>
            )}
            <button
              onClick={() => setShowResultModal(false)}
              className="mt-6 px-8 py-3 rounded-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)', color: 'white' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {showRules && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowRules(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How to Play
            </h2>
            <div className="space-y-4" style={{ color: 'var(--text-secondary)' }}>
              <p>1. Select a color (Red or Blue) by clicking on the wheel</p>
              <p>2. Enter your bet amount in USDT</p>
              <p>3. Click "PLACE BET" before the timer runs out</p>
              <p>4. If your color wins, you get 1.65x your bet!</p>
              <p>5. Results are provably fair and random</p>
            </div>
            <button
              onClick={() => setShowRules(false)}
              className="mt-6 w-full py-3 rounded-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)', color: 'white' }}
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}