import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useBonus } from '../context/BonusContext';
import { useLeaderboard } from '../context/LeaderboardContext';
import { toast } from 'sonner';
import { createGameSession, generateWheelResult, saveGameRecord, type GameSession } from '@/lib/provablyFair';
import { Users, Clock, Trophy, Zap, TrendingUp, Info, Shield, Copy, Check, HelpCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { PvPWheelModals } from '../components/PvPWheelModals';
import { GameFooter } from '../components/GameFooter';

interface Player {
  id: string;
  username: string;
  avatar: string;
  betAmount: number;
  color: string;
  percentage: number;
}

interface Activity {
  id: string;
  username: string;
  amount: number;
  timestamp: number;
}

interface HistoryRecord {
  id: string;
  roundNumber: number;
  betAmount: number;
  result: 'win' | 'loss';
  payout: number;
  timestamp: number;
  tier: TierType;
}

interface WinnerRecord {
  id: string;
  username: string;
  avatar: string;
  betAmount: number;
  payout: number;
  timestamp: number;
  tier: TierType;
}

type BotBehaviorType = 'EARLY' | 'MID' | 'LATE';

interface BotPlayer {
  id: string;
  name: string;
  avatar: string;
  betAmount: number;
  joinTime: number;
  behaviorType: BotBehaviorType;
  hasJoined: boolean;
}

type GameState = 'waiting' | 'countdown' | 'spinning' | 'result';
type TierType = 'CASUAL' | 'MID' | 'PRO';

interface TierConfig {
  id: TierType;
  label: string;
  emoji: string;
  minBet: number;
  maxBet: number;
  color: string;
  description: string;
}

const TIERS: TierConfig[] = [
  { id: 'CASUAL', label: 'Casual', emoji: '🎮', minBet: 1, maxBet: 20, color: '#3B82F6', description: '$1-$20' },
  { id: 'MID', label: 'Mid', emoji: '💰', minBet: 21, maxBet: 100, color: '#8B5CF6', description: '$21-$100' },
  { id: 'PRO', label: 'Pro', emoji: '💎', minBet: 101, maxBet: 999999, color: '#F59E0B', description: '$101+' },
];

// Individual tier state
interface TierState {
  gameState: GameState;
  players: Player[];
  totalPool: number;
  countdown: number;
  rotation: number;
  idleRotation: number;
  isSpinning: boolean;
  winner: Player | null;
  showResult: boolean;
  recentActivity: Activity[];
  hasJoined: boolean;
  userBetAmount: number; // Track user's bet for this round
  botQueue: BotPlayer[];
  isLocked: boolean;
  roundCounter: number;
}

const BOT_CONFIG = {
  ENABLE_BOTS: true,
  MAX_PLAYERS: 10, // Maximum total players per round (including user)
  FAST_JOIN_MODE: false,
};

const createInitialTierState = (): TierState => ({
  gameState: 'countdown',
  players: [],
  totalPool: 0,
  countdown: 25,
  rotation: 0,
  idleRotation: 0,
  isSpinning: false,
  winner: null,
  showResult: false,
  recentActivity: [],
  hasJoined: false,
  userBetAmount: 0,
  botQueue: [],
  isLocked: false,
  roundCounter: 1,
});

export function PvPWheel() {
  const { gameBalance, updateGameBalance, formatUSDT, username } = useUser();
  const { addWagering } = useBonus();
  const { recordGamePlayed } = useLeaderboard();
  const navigate = useNavigate();

  // Active tier selection
  const [activeTier, setActiveTier] = useState<TierType>('CASUAL');
  
  // Multi-tier states - Each tier runs independently
  const [tierStates, setTierStates] = useState<Record<TierType, TierState>>({
    CASUAL: createInitialTierState(),
    MID: createInitialTierState(),
    PRO: createInitialTierState(),
  });
  
  // User bet input
  const [betAmount, setBetAmount] = useState<number>(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [poolPulse, setPoolPulse] = useState(false);

  // Auto Join State
  const [autoJoinEnabled, setAutoJoinEnabled] = useState(false);
  const [showAutoJoinOptions, setShowAutoJoinOptions] = useState(false);
  const [autoJoinBetAmount, setAutoJoinBetAmount] = useState<number>(0);
  const [autoJoinMaxRounds, setAutoJoinMaxRounds] = useState<number | null>(null);
  const [autoJoinStopOnWin, setAutoJoinStopOnWin] = useState(false);
  const [autoJoinStopOnLoss, setAutoJoinStopOnLoss] = useState(false);
  const [autoJoinRoundsPlayed, setAutoJoinRoundsPlayed] = useState(0);

  // History - Combined across all tiers
  const [historyTab, setHistoryTab] = useState<'winners' | 'history'>('history');
  const [historyViewTab, setHistoryViewTab] = useState<'winners' | 'myHistory'>('winners');
  const [userHistory, setUserHistory] = useState<HistoryRecord[]>([]);
  const [recentWinnersList, setRecentWinnersList] = useState<WinnerRecord[]>([]);
  
  // Weekly leaderboard - resets every Monday
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<{username: string; avatar: string; totalWon: number; gamesPlayed: number; tier: TierType}[]>([]);

  // Modals
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showProvablyFairModal, setShowProvablyFairModal] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [clientSeed, setClientSeed] = useState('user_seed_' + Math.random().toString(36).substring(7));
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Live tracker for showing current player
  const [liveTrackerPlayer, setLiveTrackerPlayer] = useState<string>('Waiting...');

  // Refs for each tier's timers
  const tierTimerRefs = useRef<Record<TierType, number | null>>({
    CASUAL: null,
    MID: null,
    PRO: null,
  });
  
  const tierBotRefs = useRef<Record<TierType, number | null>>({
    CASUAL: null,
    MID: null,
    PRO: null,
  });

  const tierRotationRefs = useRef<Record<TierType, number>>({
    CASUAL: 0,
    MID: 0,
    PRO: 0,
  });

  const wheelRef = useRef<SVGSVGElement>(null);
  
  // Motion values for tracking live rotation during animation
  const casualRotation = useMotionValue(0);
  const midRotation = useMotionValue(0);
  const proRotation = useMotionValue(0);

  // Mock provably fair
  const serverSeedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const nonce = 12345;

  const playerColors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
    '#10B981', '#06B6D4', '#F97316', '#6366F1',
  ];

  const botNames = ['CryptoKing', 'LuckyMike', 'ProGamer', 'SpinMaster', 'WheelBoss', 'BetKing', 'Fortune777', 'MegaWin', 'DiamondHands', 'MoonShot', 'RocketMan', 'GoldRush'];
  const botAvatars = ['👑', '🎲', '🎮', '🔥', '💎', '⚡', '🎯', '🌟', '🚀', '💰', '🏆', '💸'];

  // Generate bot bet for specific tier
  const generateBotBet = (tier: TierType): number => {
    const tierConfig = TIERS.find(t => t.id === tier);
    if (!tierConfig) return 1;
    
    const { minBet, maxBet } = tierConfig;
    const range = maxBet - minBet;
    const random = Math.random();
    const skew = Math.pow(random, 1.5);
    
    return Math.floor(skew * range) + minBet;
  };

  // Generate bot queue for specific tier
  const generateBotQueue = (tier: TierType): BotPlayer[] => {
    if (!BOT_CONFIG.ENABLE_BOTS) return [];
    
    const bots: BotPlayer[] = [];
    // Generate 5-9 bots (leaving room for user to join)
    const botCount = Math.floor(Math.random() * 5) + 5; // 5-9 bots
    
    
    for (let i = 0; i < botCount; i++) {
      const random = Math.random();
      let behaviorType: BotBehaviorType;
      let joinTime: number;
      
      if (random < 0.4) {
        behaviorType = 'EARLY';
        joinTime = Math.random() * 8;
      } else if (random < 0.75) {
        behaviorType = 'MID';
        joinTime = Math.random() * 12 + 8;
      } else {
        behaviorType = 'LATE';
        joinTime = Math.random() * 4 + 20;
      }
      
      const jitter = (Math.random() - 0.5) * 0.6;
      joinTime = Math.max(0, joinTime + jitter);
      
      if (behaviorType === 'LATE' && Math.random() < 0.2) {
        joinTime = Math.max(20, Math.min(24, joinTime + 2));
      }
      
      const randomIndex = Math.floor(Math.random() * botNames.length);
      
      bots.push({
        id: `bot_${tier}_${Date.now()}_${i}`,
        name: botNames[randomIndex],
        avatar: botAvatars[randomIndex],
        betAmount: generateBotBet(tier),
        joinTime,
        behaviorType,
        hasJoined: false
      });
    }
    
    return bots.sort((a, b) => a.joinTime - b.joinTime);
  };

  // Add bot to specific tier
  const addBotToTier = (tier: TierType, bot: BotPlayer) => {
    setTierStates(prevStates => {
      const tierState = prevStates[tier];
      
      if (bot.hasJoined || tierState.isLocked || tierState.gameState !== 'countdown') {
        return prevStates;
      }
      
      if (tierState.players.some(p => p.id === bot.id)) {
        return prevStates;
      }
      
      // Don't add bot if we've reached max players
      if (tierState.players.length >= BOT_CONFIG.MAX_PLAYERS) {
        return prevStates;
      }
      
      
      const newPlayer: Player = {
        id: bot.id,
        username: bot.name,
        avatar: bot.avatar,
        betAmount: bot.betAmount,
        color: playerColors[tierState.players.length % playerColors.length],
        percentage: 0
      };
      
      const updatedPlayers = [...tierState.players, newPlayer];
      const newTotal = updatedPlayers.reduce((sum, p) => sum + p.betAmount, 0);
      
      const playersWithPercentage = updatedPlayers.map(p => ({
        ...p,
        percentage: (p.betAmount / newTotal) * 100
      }));
      
      // Mark bot as joined
      const updatedBotQueue = tierState.botQueue.map(b => 
        b.id === bot.id ? { ...b, hasJoined: true } : b
      );
      
      return {
        ...prevStates,
        [tier]: {
          ...tierState,
          players: playersWithPercentage,
          totalPool: newTotal,
          botQueue: updatedBotQueue,
        }
      };
    });
    
    setPoolPulse(true);
    setTimeout(() => setPoolPulse(false), 1000);
  };

  // Initialize all tiers on mount
  useEffect(() => {
    
    setTierStates({
      CASUAL: { ...createInitialTierState(), botQueue: generateBotQueue('CASUAL') },
      MID: { ...createInitialTierState(), botQueue: generateBotQueue('MID') },
      PRO: { ...createInitialTierState(), botQueue: generateBotQueue('PRO') },
    });
    
  }, []);

  // Idle rotation for each tier
  useEffect(() => {
    const intervals: number[] = [];
    
    TIERS.forEach(tier => {
      const tierState = tierStates[tier.id];
      if ((tierState.gameState === 'waiting' || tierState.gameState === 'countdown') && !tierState.isSpinning) {
        const interval = setInterval(() => {
          setTierStates(prev => ({
            ...prev,
            [tier.id]: {
              ...prev[tier.id],
              idleRotation: (prev[tier.id].idleRotation + 0.3) % 360
            }
          }));
        }, 100); // Reduced from 50ms to 100ms for better performance
        intervals.push(interval as unknown as number);
      }
    });
    
    return () => intervals.forEach(i => clearInterval(i));
  }, [tierStates.CASUAL.gameState, tierStates.MID.gameState, tierStates.PRO.gameState, tierStates.CASUAL.isSpinning, tierStates.MID.isSpinning, tierStates.PRO.isSpinning]);

  // Live tracker - show player at arrow position based on wheel rotation
  useEffect(() => {
    const activeTierState = tierStates[activeTier];
    
    if (activeTierState.players.length === 0) {
      setLiveTrackerPlayer('Waiting...');
      return;
    }
    
    // Get the appropriate motion value for the active tier
    const motionValue = activeTier === 'CASUAL' ? casualRotation : activeTier === 'MID' ? midRotation : proRotation;
    
    const updateTracker = () => {
      // Get current rotation from motion value (this updates during animation!)
      let currentRotation = motionValue.get();
      
      // If not spinning, add idle rotation
      if (!activeTierState.isSpinning) {
        currentRotation += activeTierState.idleRotation;
      }
      
      // Normalize rotation to 0-360
      const normalizedRotation = ((currentRotation % 360) + 360) % 360;
      
      // Coordinate system explanation:
      // - Arrow points at the TOP (12 o'clock)
      // - Segments with startAngle=0 are drawn at TOP (with -90° SVG offset applied)
      // - When wheel rotates by +R degrees, segments move and we need to find which is at top
      const targetAngle = (360 - normalizedRotation) % 360;
      
      // Calculate segments using percentage (same as generateWheelSegments)
      let currentAngle = 0;
      
      for (const player of activeTierState.players) {
        const segmentAngle = ((player.percentage || 0) / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + segmentAngle;
        
        // Check if target angle is in this segment
        if (targetAngle >= startAngle && targetAngle < endAngle) {
          setLiveTrackerPlayer(player.username);
          return;
        }
        
        currentAngle = endAngle;
      }
      
      // Fallback - show first player if no match
      if (activeTierState.players.length > 0) {
        setLiveTrackerPlayer(activeTierState.players[0].username);
      }
    };
    
    // Update at moderate frequency for better performance
    const interval = setInterval(updateTracker, 100); // Update every 100ms for smooth tracking without lag
    updateTracker(); // Initial update
    
    return () => clearInterval(interval);
  }, [activeTier, tierStates[activeTier].players, tierStates[activeTier].isSpinning, casualRotation, midRotation, proRotation]);

  // Multi-tier countdown timers - Each tier manages its own countdown
  useEffect(() => {
    TIERS.forEach(tier => {
      const tierState = tierStates[tier.id];
      
      if (tierState.gameState === 'countdown' && !tierTimerRefs.current[tier.id]) {
        const startTime = Date.now();
        const totalDuration = 25000;
        
        
        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));
          
          setTierStates(prevStates => {
            const currentTierState = prevStates[tier.id];
            
            if (currentTierState.gameState !== 'countdown') {
              return prevStates;
            }
            
            if (remaining === 0) {
              clearInterval(tierTimerRefs.current[tier.id]!);
              tierTimerRefs.current[tier.id] = null;
              
              
              setTimeout(() => {
                startSpinForTier(tier.id);
              }, 200);
              
              return {
                ...prevStates,
                [tier.id]: { ...currentTierState, countdown: 0 }
              };
            }
            
            return {
              ...prevStates,
              [tier.id]: { ...currentTierState, countdown: remaining }
            };
          });
        }, 100);
        
        tierTimerRefs.current[tier.id] = interval as unknown as number;
      }
      
      // Cleanup if not in countdown
      if (tierState.gameState !== 'countdown' && tierTimerRefs.current[tier.id]) {
        clearInterval(tierTimerRefs.current[tier.id]!);
        tierTimerRefs.current[tier.id] = null;
      }
    });
    
    return () => {
      TIERS.forEach(tier => {
        if (tierTimerRefs.current[tier.id]) {
          clearInterval(tierTimerRefs.current[tier.id]!);
          tierTimerRefs.current[tier.id] = null;
        }
      });
    };
  }, [tierStates.CASUAL.gameState, tierStates.MID.gameState, tierStates.PRO.gameState]);

  // Multi-tier BOT timing engine - Each tier manages its own bots
  useEffect(() => {
    if (!BOT_CONFIG.ENABLE_BOTS) return;

    TIERS.forEach(tier => {
      const tierState = tierStates[tier.id];
      
      if (tierState.gameState === 'countdown' && tierState.botQueue.length > 0 && !tierBotRefs.current[tier.id]) {
        const checkInterval = BOT_CONFIG.FAST_JOIN_MODE ? 200 : 500;
        const startTime = Date.now();
        
        
        const timer = setInterval(() => {
          const currentTime = (Date.now() - startTime) / 1000;
          const timeRemaining = 25 - currentTime;
          
          setTierStates(prevStates => {
            const currentTierState = prevStates[tier.id];
            
            // Lock at T-5 seconds
            if (timeRemaining <= 5 && !currentTierState.isLocked) {
              return {
                ...prevStates,
                [tier.id]: { ...currentTierState, isLocked: true }
              };
            }
            
            return prevStates;
          });
          
          // Add bots whose join time has arrived
          tierState.botQueue.forEach(bot => {
            if (!bot.hasJoined && currentTime >= bot.joinTime) {
              addBotToTier(tier.id, bot);
            }
          });
        }, checkInterval);
        
        tierBotRefs.current[tier.id] = timer as unknown as number;
      }
      
      // Cleanup if not in countdown
      if (tierState.gameState !== 'countdown' && tierBotRefs.current[tier.id]) {
        clearInterval(tierBotRefs.current[tier.id]!);
        tierBotRefs.current[tier.id] = null;
      }
    });

    return () => {
      TIERS.forEach(tier => {
        if (tierBotRefs.current[tier.id]) {
          clearInterval(tierBotRefs.current[tier.id]!);
          tierBotRefs.current[tier.id] = null;
        }
      });
    };
  }, [tierStates.CASUAL.gameState, tierStates.MID.gameState, tierStates.PRO.gameState, tierStates.CASUAL.botQueue.length, tierStates.MID.botQueue.length, tierStates.PRO.botQueue.length]);

  // Auto-switch tier based on bet amount
  useEffect(() => {
    if (betAmount > 0) {
      const matchingTier = TIERS.find(tier => 
        betAmount >= tier.minBet && betAmount <= tier.maxBet
      );
      if (matchingTier && matchingTier.id !== activeTier) {
        setActiveTier(matchingTier.id);
      }
    }
  }, [betAmount, activeTier]);

  // Auto Join Logic
  useEffect(() => {
    if (!autoJoinEnabled || autoJoinBetAmount <= 0) return;
    
    const tierState = tierStates[activeTier];
    
    // Check if we should auto join
    if (
      tierState.gameState === 'countdown' &&
      !tierState.isLocked &&
      !tierState.hasJoined &&
      autoJoinBetAmount <= gameBalance
    ) {
      // Check stop conditions
      if (autoJoinMaxRounds && autoJoinRoundsPlayed >= autoJoinMaxRounds) {
        setAutoJoinEnabled(false);
        toast.info('Auto join stopped - max rounds reached');
        return;
      }
      
      // Auto join the round
      const betToUse = autoJoinBetAmount;
      
      
      // Deduct balance
      updateGameBalance(-betToUse);
      addWagering(betToUse); // Track wagering for bonus

      // Add player
      setTierStates(prevStates => {
        const currentTierState = prevStates[activeTier];
        const updatedPlayers = [
          ...currentTierState.players,
          {
            id: 'you',
            username: username || 'You',
            avatar: '👤',
            betAmount: betToUse,
            color: '#60A5FA',
            percentage: 0
          }
        ];
        
        const newTotal = currentTierState.totalPool + betToUse;
        const playersWithPercentage = updatedPlayers.map(p => ({
          ...p,
          percentage: (p.betAmount / newTotal) * 100
        }));
        
        return {
          ...prevStates,
          [activeTier]: {
            ...currentTierState,
            players: playersWithPercentage,
            totalPool: newTotal,
            hasJoined: true,
            userBetAmount: betToUse,
          }
        };
      });
      
      setPoolPulse(true);
      setTimeout(() => setPoolPulse(false), 1000);
      
      setAutoJoinRoundsPlayed(prev => prev + 1);
    }
  }, [autoJoinEnabled, autoJoinBetAmount, tierStates, activeTier, gameBalance, autoJoinMaxRounds, autoJoinRoundsPlayed, updateGameBalance]);

  // Auto Join stop on win/loss
  useEffect(() => {
    const tierState = tierStates[activeTier];
    
    if (!autoJoinEnabled) return;
    if (!tierState.showResult || !tierState.winner) return;
    
    const isWin = tierState.winner.id === 'you';
    
    if ((autoJoinStopOnWin && isWin) || (autoJoinStopOnLoss && !isWin)) {
      setAutoJoinEnabled(false);
      toast.info(`Auto join stopped - ${isWin ? 'won' : 'lost'} round`);
    }
  }, [autoJoinEnabled, autoJoinStopOnWin, autoJoinStopOnLoss, tierStates, activeTier]);

  // Weekly leaderboard reset (every Monday)
  useEffect(() => {
    const checkWeeklyReset = () => {
      const lastReset = localStorage.getItem('pvp_wheel_leaderboard_reset');
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
      
      if (dayOfWeek === 1) { // Monday
        const today = now.toDateString();
        if (lastReset !== today) {
          setWeeklyLeaderboard([]);
          localStorage.setItem('pvp_wheel_leaderboard_reset', today);
        }
      }
    };
    
    checkWeeklyReset();
    const interval = setInterval(checkWeeklyReset, 1000 * 60 * 60); // Check every hour
    
    return () => clearInterval(interval);
  }, []);

  // Handle user join for active tier
  const handleJoinRound = () => {
    const tierState = tierStates[activeTier];
    
    
    if (tierState.gameState !== 'countdown') {
      toast.error('Wait for the next round to start');
      return;
    }
    if (tierState.isLocked) {
      toast.error('Round is locked! Wait for next round');
      return;
    }
    if (betAmount <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    if (betAmount > gameBalance) {
      toast.error(`Not enough funds! You need ${formatUSDT(betAmount)} but only have ${formatUSDT(gameBalance)}. Transfer more from your main wallet.`);
      return;
    }
    
    // Check tier limits
    const tierConfig = TIERS.find(t => t.id === activeTier);
    if (tierConfig) {
      if (betAmount < tierConfig.minBet || betAmount > tierConfig.maxBet) {
        toast.error(`${tierConfig.label} tier: ${tierConfig.description} only`);
        return;
      }
    }
    
    if (tierState.hasJoined) {
      toast.error('You already joined this round!');
      return;
    }
    
    // Check if round is full
    if (tierState.players.length >= BOT_CONFIG.MAX_PLAYERS) {
      toast.error('Round is full! Maximum 10 players per round.');
      return;
    }
    
    // Deduct balance
    updateGameBalance(-betAmount);
    addWagering(betAmount); // Track wagering for bonus

    // Add user to tier
    setTierStates(prevStates => {
      const currentTierState = prevStates[activeTier];
      
      const userPlayer: Player = {
        id: 'you',
        username: 'You',
        avatar: '👤',
        betAmount: betAmount,
        color: '#22C55E',
        percentage: 0
      };
      
      const updatedPlayers = [...currentTierState.players, userPlayer];
      const newTotal = updatedPlayers.reduce((sum, p) => sum + p.betAmount, 0);
      
      const playersWithPercentage = updatedPlayers.map(p => ({
        ...p,
        percentage: (p.betAmount / newTotal) * 100
      }));
      
      return {
        ...prevStates,
        [activeTier]: {
          ...currentTierState,
          players: playersWithPercentage,
          totalPool: newTotal,
          hasJoined: true,
          userBetAmount: betAmount,
        }
      };
    });
    
    setPoolPulse(true);
    setTimeout(() => setPoolPulse(false), 1000);
  };

  // Start spin for specific tier
  const startSpinForTier = async (tier: TierType) => {
    // Generate provably fair result first
    const session = await createGameSession();
    const wheelResult = await generateWheelResult(
      session.serverSeed,
      session.clientSeed,
      session.nonce
    );

    // Convert 0-9 result to percentage (0-100)
    const random = (wheelResult / 9) * 100;

    setTierStates(prevStates => {
      const tierState = prevStates[tier];

      if (tierState.players.length === 0) {
        toast.error(`No players in ${tier} - restarting...`);

        setTimeout(() => handleNewRound(tier), 1000);
        return prevStates;
      }


      // Pick winner using provably fair random number
      let cumulative = 0;
      let selectedWinner = tierState.players[0];

      for (const player of tierState.players) {
        cumulative += player.percentage;
        if (random <= cumulative) {
          selectedWinner = player;
          break;
        }
      }

      // Save provably fair record
      saveGameRecord({
        gameId: `wheel_${tier}_${Date.now()}`,
        serverSeed: session.serverSeed,
        serverSeedHash: session.serverSeedHash,
        clientSeed: session.clientSeed,
        nonce: session.nonce,
        result: { wheelResult, winnerId: selectedWinner.id },
        timestamp: Date.now()
      });
      
      
      // Calculate rotation
      const segments = generateWheelSegments(tierState.players);
      const winnerSegment = segments.find(s => s.player.id === selectedWinner.id);
      
      if (!winnerSegment) {
        return prevStates;
      }
      
      // DEBUG: Log all segments with their angles
      segments.forEach((seg, idx) => {
        const center = (seg.startAngle + seg.endAngle) / 2;
        const isWinner = seg.player.id === selectedWinner.id;
      });
      
      // === EXACT IMPLEMENTATION AS SPECIFIED ===
      // Arrow is at TOP (0°)
      // Winner is picked FIRST
      // Rotate wheel so winner.center aligns with arrow
      // Formula: targetAngle = 360 - winner.center
      
      const winnerCenter = (winnerSegment.startAngle + winnerSegment.endAngle) / 2;
      const targetAngle = 360 - winnerCenter;
      
      // Add base spins for visual effect
      const baseRotation = 6 * 360; // 6 full spins
      const totalRotation = baseRotation + targetAngle;
      
      
      tierRotationRefs.current[tier] = totalRotation % 360;
      
      // Set the motion value for animation
      const motionValue = tier === 'CASUAL' ? casualRotation : tier === 'MID' ? midRotation : proRotation;
      motionValue.set(0); // Start from 0 for clean animation
      
      setTimeout(() => {
        setTierStates(prev => ({
          ...prev,
          [tier]: {
            ...prev[tier],
            gameState: 'result',
            winner: selectedWinner,
            showResult: true,
            isSpinning: false,
          }
        }));
        
        // Handle winner payout and history tracking
        // CRITICAL: Only update user history if user actually played (userBetAmount > 0)
        const userActuallyPlayed = tierState.userBetAmount > 0 && tierState.hasJoined;
        
        
        if (selectedWinner.id === 'you' && userActuallyPlayed) {
          updateGameBalance(tierState.totalPool);

          // Add to user history - WIN
          setUserHistory(prev => {
            const newHistory = [{
              id: `history-${Date.now()}-${Math.random()}`,
              roundNumber: tierState.roundCounter,
              betAmount: tierState.userBetAmount,
              result: 'win' as const,
              payout: tierState.totalPool,
              timestamp: Date.now(),
              tier: tier,
            }, ...prev.slice(0, 19)];
            return newHistory;
          });

          // Track win in leaderboard
          recordGamePlayed(username || 'guest', tierState.userBetAmount, tierState.totalPool, true);
        } else if (selectedWinner.id !== 'you' && userActuallyPlayed) {
          // User LOST - only add if user actually played
          setUserHistory(prev => {
            const newHistory = [{
              id: `history-${Date.now()}-${Math.random()}`,
              roundNumber: tierState.roundCounter,
              betAmount: tierState.userBetAmount,
              result: 'loss' as const,
              payout: 0,
              timestamp: Date.now(),
              tier: tier,
            }, ...prev.slice(0, 19)];
            return newHistory;
          });

          // Track loss in leaderboard
          recordGamePlayed(username || 'guest', tierState.userBetAmount, 0, false);
        } else {
        }
        
        // Add to winner list
        setRecentWinnersList(prev => {
          const newWinner = {
            id: `winner-${Date.now()}-${Math.random()}`,
            username: selectedWinner.username,
            avatar: selectedWinner.avatar,
            betAmount: selectedWinner.betAmount,
            payout: tierState.totalPool,
            timestamp: Date.now(),
            tier: tier,
          };
          return [newWinner, ...prev.slice(0, 19)];
        });
        
        // Update weekly leaderboard
        setWeeklyLeaderboard(prev => {
          const existing = prev.find(entry => entry.username === selectedWinner.username);
          if (existing) {
            return prev.map(entry =>
              entry.username === selectedWinner.username
                ? { ...entry, totalWon: entry.totalWon + tierState.totalPool, gamesPlayed: entry.gamesPlayed + 1 }
                : entry
            ).sort((a, b) => b.totalWon - a.totalWon);
          } else {
            return [...prev, {
              username: selectedWinner.username,
              avatar: selectedWinner.avatar,
              totalWon: tierState.totalPool,
              gamesPlayed: 1,
              tier: tier
            }].sort((a, b) => b.totalWon - a.totalWon).slice(0, 50);
          }
        });
        
        // Hide result flash after 3 seconds
        setTimeout(() => {
          setTierStates(prev => ({
            ...prev,
            [tier]: {
              ...prev[tier],
              showResult: false
            }
          }));
        }, 3000);
        
        // Start new round after delay
        setTimeout(() => {
          handleNewRound(tier);
        }, 3000);
      }, 8000); // 6-second spin + 2-second pause before showing result
      
      return {
        ...prevStates,
        [tier]: {
          ...tierState,
          gameState: 'spinning',
          isSpinning: true,
          rotation: totalRotation,
        }
      };
    });
  };

  // Start new round for specific tier
  const handleNewRound = (tier: TierType) => {
    setTierStates(prevStates => {
      const tierState = prevStates[tier];
      
      
      // Cleanup timers
      if (tierBotRefs.current[tier]) {
        clearInterval(tierBotRefs.current[tier]!);
        tierBotRefs.current[tier] = null;
      }
      
      const newBots = generateBotQueue(tier);
      
      return {
        ...prevStates,
        [tier]: {
          ...createInitialTierState(),
          botQueue: newBots,
          roundCounter: tierState.roundCounter + 1,
        }
      };
    });
    
    toast.success(`${tier} round starting!`);
  };

  // Generate wheel segments
  const generateWheelSegments = (players: Player[]) => {
    if (players.length === 0) return [];
    
    let currentAngle = 0;
    return players.map((player, index) => {
      const segmentAngle = ((player.percentage || 0) / 100) * 360;
      const segment = {
        player,
        startAngle: currentAngle,
        endAngle: currentAngle + segmentAngle,
        color: player.color,
        index
      };
      currentAngle += segmentAngle;
      return segment;
    });
  };

  // Get active tier state
  const activeTierState = tierStates[activeTier];
  const wheelSegments = generateWheelSegments(activeTierState.players);
  const highestBettor = activeTierState.players.length > 0 
    ? activeTierState.players.reduce((max, player) => player.betAmount > max.betAmount ? player : max, activeTierState.players[0])
    : null;

  // Auto-detect tier based on bet amount
  const getDetectedTier = (amount: number): TierType => {
    if (amount >= 101) return 'PRO';
    if (amount >= 21) return 'MID';
    return 'CASUAL';
  };

  // Auto-switch tier when bet amount changes
  useEffect(() => {
    if (betAmount > 0) {
      const detectedTier = getDetectedTier(betAmount);
      if (detectedTier !== activeTier) {
        setActiveTier(detectedTier);
      }
    }
  }, [betAmount]);

  const currentTierConfig = TIERS.find(t => t.id === activeTier) || TIERS[0];

  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to clipboard!');
  };

  // Bet presets
  const betPresets = [1, 5, 10, 20, 50, 100, 200];

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0F172A' }}>
      
      {/* ========== MOBILE LAYOUT (< 1024px) ========== */}
      <div className="lg:hidden">
        <TopBar title="PvP Wheel Battle" onBack={() => navigate('/dashboard')} />

        <div className="px-4 py-6">
          
          {/* INFO BUTTONS - Above tier tabs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setShowRulesModal(true)}
              className="py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60A5FA',
              }}
            >
              <Info className="w-4 h-4" />
              Rules
            </button>
            <button
              onClick={() => setShowProvablyFairModal(true)}
              className="py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22C55E',
              }}
            >
              <Shield className="w-4 h-4" />
              Fair
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              style={{
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#F59E0B',
              }}
            >
              <Trophy className="w-4 h-4" />
              Board
            </button>
          </div>



          {/* POOL DISPLAY - Super Slick */}
          <motion.div
            animate={{ scale: poolPulse ? 1.03 : 1 }}
            className="mb-4 py-2.5 px-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.4)',
              boxShadow: poolPulse ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-[10px] font-bold mb-0.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                  {currentTierConfig.emoji} {currentTierConfig.label} Pool
                </div>
                <div className="text-2xl font-black" style={{ 
                  background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {formatUSDT(activeTierState.totalPool)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold mb-0.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                  Players
                </div>
                <div className="text-2xl font-black" style={{ color: '#60A5FA' }}>
                  {activeTierState.players.length}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Header: Round Number, Live Tracker, Game Balance */}
          <div className="flex items-center justify-between mb-2 px-2 gap-2">
            {/* Round Number - Left */}
            <div className="font-bold text-sm" style={{ 
              color: '#60A5FA',
              textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
              whiteSpace: 'nowrap'
            }}>
              Round #{activeTierState.roundCounter}
            </div>
            
            {/* Live Tracker - Middle */}
            <div className="flex-1 text-center min-w-0">
              <div className="font-bold text-sm animate-pulse truncate" style={{ 
                color: '#FBBF24',
                textShadow: '0 0 15px rgba(251, 191, 36, 0.8)'
              }}>
                🎯 {liveTrackerPlayer}
              </div>
            </div>
            
            {/* Game Balance - Right */}
            <div className="font-bold text-sm" style={{ 
              color: '#22C55E',
              textShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
              whiteSpace: 'nowrap'
            }}>
              💰 game bal. {formatUSDT(gameBalance)}
            </div>
          </div>

          {/* WHEEL with countdown in center */}
          <div className="rounded-xl p-4 mb-4 relative" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
          }}>
            {/* Tier Badge - Top Left */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg font-bold text-xs z-10" style={{
              background: `linear-gradient(135deg, ${currentTierConfig.color}60 0%, ${currentTierConfig.color}30 100%)`,
              border: `1.5px solid ${currentTierConfig.color}`,
              color: currentTierConfig.color,
              boxShadow: `0 0 15px ${currentTierConfig.color}40`
            }}>
              {currentTierConfig.emoji} {currentTierConfig.label} {currentTierConfig.description}
            </div>

            {/* Arrow Pointer - OUTSIDE wheel, hanging above it */}
            <div className="flex justify-center mb-2">
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg width="44" height="56" viewBox="0 0 48 60">
                  <defs>
                    <linearGradient id="arrowGradientMobile" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 24 55 L 6 12 L 24 18 L 42 12 Z" 
                    fill="url(#arrowGradientMobile)" 
                    stroke="#FFFFFF" 
                    strokeWidth="2.5"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Wheel Container */}
            <div className="relative flex items-center justify-center">
              {/* Countdown - Centered, Non-Rotating */}
              {activeTierState.gameState === 'countdown' && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="text-center">
                    {activeTierState.isLocked && (
                      <div className="text-xl mb-1">🔒</div>
                    )}
                    <div className="text-4xl font-black" style={{ 
                      color: activeTierState.countdown <= 5 ? '#EF4444' : '#60A5FA'
                    }}>
                      {activeTierState.countdown}
                    </div>
                  </div>
                </div>
              )}

              {/* Wheel SVG */}
              <div className="relative w-full max-w-[360px] mx-auto">
                <motion.svg
                  ref={wheelRef}
                  className="w-full h-auto"
                  viewBox="0 0 400 400"
                  animate={{
                    rotate: activeTierState.isSpinning ? activeTierState.rotation : activeTierState.rotation + activeTierState.idleRotation,
                    scale: activeTierState.isSpinning ? 1.02 : 1
                  }}
                  transition={
                    activeTierState.isSpinning 
                      ? { duration: 6, ease: [0.25, 0.1, 0.25, 1.0] } // Faster, smoother deceleration
                      : { duration: 0.3 }
                  }
                  onUpdate={(latest) => {
                    // Update the motion value as the animation progresses for live tracking
                    if (activeTierState.isSpinning && typeof latest.rotate === 'number') {
                      const motionValue = activeTier === 'CASUAL' ? casualRotation : activeTier === 'MID' ? midRotation : proRotation;
                      motionValue.set(latest.rotate);
                    }
                  }}
                >
                  {/* Wheel segments */}
                  {wheelSegments.length > 0 ? (
                    wheelSegments.map((segment, index) => {
                      const x1 = 200 + 195 * Math.cos((segment.startAngle - 90) * Math.PI / 180);
                      const y1 = 200 + 195 * Math.sin((segment.startAngle - 90) * Math.PI / 180);
                      const x2 = 200 + 195 * Math.cos((segment.endAngle - 90) * Math.PI / 180);
                      const y2 = 200 + 195 * Math.sin((segment.endAngle - 90) * Math.PI / 180);
                      const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                      
                      return (
                        <g key={segment.player.id}>
                          <path
                            d={`M 200 200 L ${x1} ${y1} A 195 195 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={segment.color}
                            opacity={hoveredSegment === index ? 0.9 : 0.7}
                            stroke="#1E293B"
                            strokeWidth="2"
                            onMouseEnter={() => setHoveredSegment(index)}
                            onMouseLeave={() => setHoveredSegment(null)}
                            style={{ cursor: 'pointer' }}
                          />
                          
                          {/* Player avatar on segment */}
                          {segment.endAngle - segment.startAngle > 8 && (
                            <text
                              x={200 + 120 * Math.cos(((segment.startAngle + segment.endAngle) / 2 - 90) * Math.PI / 180)}
                              y={200 + 120 * Math.sin(((segment.startAngle + segment.endAngle) / 2 - 90) * Math.PI / 180)}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize={Math.min(28, Math.max(16, (segment.endAngle - segment.startAngle) * 0.7))}
                            >
                              {segment.player.avatar}
                            </text>
                          )}
                        </g>
                      );
                    })
                  ) : (
                    <circle cx="200" cy="200" r="195" fill="rgba(51, 65, 85, 0.5)" stroke="#334155" strokeWidth="2" />
                  )}
                  
                  {/* Center circle */}
                  <circle cx="200" cy="200" r="45" fill="#1E293B" stroke="#475569" strokeWidth="3" />
                </motion.svg>
              </div>
            </div>
          </div>

          {/* MY BET INFO - Shows after joining */}
          {activeTierState.hasJoined && activeTierState.gameState === 'countdown' && (
            <div className="mb-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  border: '2px solid rgba(59, 130, 246, 0.4)',
                }}
              >
                {(() => {
                  const userPlayer = activeTierState.players.find(p => p.id === 'you');
                  if (!userPlayer) return null;
                  
                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{userPlayer.avatar}</div>
                        <div>
                          <div className="font-bold text-white text-sm">Your Bet</div>
                          <div className="text-xs font-bold" style={{ color: '#60A5FA' }}>
                            {userPlayer.percentage.toFixed(2)}% chance
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-xl" style={{ color: '#60A5FA' }}>
                          {formatUSDT(userPlayer.betAmount)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
              
              {/* Auto Bet Stop Button */}
              {autoJoinEnabled && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => {
                    setAutoJoinEnabled(false);
                    toast.info('Auto bet cancelled');
                  }}
                  className="w-full mt-2 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    border: '2px solid rgba(239, 68, 68, 0.5)',
                  }}
                >
                  🛑 Stop Auto Bet ({autoJoinRoundsPlayed}/{autoJoinMaxRounds || '∞'})
                </motion.button>
              )}
            </div>
          )}

          {/* BET INPUT & JOIN */}
          {!activeTierState.hasJoined && activeTierState.gameState === 'countdown' && !activeTierState.isLocked && (
            <div className="mb-4">
              {/* Quick Bet Presets */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {betPresets.map(preset => (
                  <button
                    key={preset}
                    onClick={() => setBetAmount(preset)}
                    className="py-2 rounded-lg font-bold text-xs transition-all"
                    style={{
                      background: betAmount === preset 
                        ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                        : 'rgba(30, 41, 59, 0.8)',
                      border: betAmount === preset ? '2px solid #60A5FA' : '2px solid rgba(148, 163, 184, 0.2)',
                      color: betAmount === preset ? 'white' : '#94A3B8',
                    }}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={betAmount || ''}
                onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Enter bet amount..."
                className="w-full px-4 py-3 rounded-xl mb-3 text-white font-bold text-center"
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: inputFocused ? '2px solid #3B82F6' : '2px solid rgba(148, 163, 184, 0.2)',
                }}
              />
              
              <div className="flex gap-2">
                <motion.button
                  onClick={handleJoinRound}
                  disabled={activeTierState.hasJoined || betAmount <= 0 || betAmount > gameBalance}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 rounded-xl font-black text-base"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                    color: 'white',
                    opacity: (activeTierState.hasJoined || betAmount <= 0 || betAmount > gameBalance) ? 0.5 : 1,
                  }}
                >
                  JOIN
                </motion.button>
                
                {/* Auto Join Button */}
                <motion.button
                  onClick={() => setShowAutoJoinOptions(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded-xl transition-all"
                  style={{
                    background: autoJoinEnabled 
                      ? 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)'
                      : 'rgba(30, 41, 59, 0.8)',
                    border: autoJoinEnabled ? '2px solid #22C55E' : '2px solid rgba(148, 163, 184, 0.2)',
                    color: autoJoinEnabled ? 'white' : '#94A3B8',
                  }}
                >
                  <Zap className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          )}

          {/* Auto Join Modal moved to global section */}
          {/* (See below after desktop layout) */}
          
          {/* PLAYERS LIST */}
          <div className="rounded-xl p-4 mb-4" style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
          }}>
            <div className="font-bold mb-3 flex items-center justify-between" style={{ color: '#94A3B8' }}>
              <div>
                <Users className="inline w-4 h-4 mr-2" />
                Players ({activeTierState.players.length})
              </div>
              {highestBettor && (
                <div className="text-xs flex items-center gap-1" style={{ color: '#F59E0B' }}>
                  <Trophy className="w-3 h-3" />
                  Top: {formatUSDT(highestBettor.betAmount)}
                </div>
              )}
            </div>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {activeTierState.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ background: 'rgba(51, 65, 85, 0.4)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-xl">{player.avatar}</div>
                    <div>
                      <div className="font-bold text-white text-xs">{player.username}</div>
                      <div className="text-[10px]" style={{ color: '#94A3B8' }}>
                        {player.percentage.toFixed(1)}% chance
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-sm" style={{ color: player.color }}>
                    {formatUSDT(player.betAmount)}
                  </div>
                </div>
              ))}
              {activeTierState.players.length === 0 && (
                <div className="text-center py-8" style={{ color: '#64748B' }}>
                  Waiting for players to join...
                </div>
              )}
            </div>
          </div>

          {/* HISTORY TABS - Winners & My History */}
          <div className="rounded-xl p-4" style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
          }}>
            {/* Tab Headers */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setHistoryViewTab('winners')}
                className="flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all"
                style={{
                  background: historyViewTab === 'winners' 
                    ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                    : 'rgba(51, 65, 85, 0.4)',
                  color: historyViewTab === 'winners' ? 'white' : '#94A3B8',
                }}
              >
                <Trophy className="inline w-3 h-3 mr-1" />
                Winners
              </button>
              <button
                onClick={() => setHistoryViewTab('myHistory')}
                className="flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all"
                style={{
                  background: historyViewTab === 'myHistory' 
                    ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                    : 'rgba(51, 65, 85, 0.4)',
                  color: historyViewTab === 'myHistory' ? 'white' : '#94A3B8',
                }}
              >
                <Clock className="inline w-3 h-3 mr-1" />
                My History
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {(() => {
                return null;
              })()}
              {historyViewTab === 'winners' ? (
                <>
                  {recentWinnersList.slice(0, 10).map((winner) => {
                    const tierConfig = TIERS.find(t => t.id === winner.tier);
                    return (
                      <div
                        key={winner.id}
                        className="flex items-center justify-between p-2 rounded-lg"
                        style={{ background: 'rgba(51, 65, 85, 0.4)' }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-lg">{winner.avatar}</div>
                          <div>
                            <div className="font-bold text-white text-xs">{winner.username}</div>
                            <div className="text-[10px] flex items-center gap-1.5">
                              <span 
                                className="px-1.5 py-0.5 rounded font-bold text-[9px]"
                                style={{ 
                                  background: tierConfig?.color + '40',
                                  color: tierConfig?.color,
                                  border: `1px solid ${tierConfig?.color}60`
                                }}
                              >
                                {tierConfig?.emoji} {tierConfig?.label}
                              </span>
                              <span style={{ color: '#64748B' }}>
                                {new Date(winner.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-sm" style={{ color: '#22C55E' }}>
                          +{formatUSDT(winner.payout)}
                        </div>
                      </div>
                    );
                  })}
                  {recentWinnersList.length === 0 && (
                    <div className="text-center py-8" style={{ color: '#64748B' }}>
                      No winners yet...
                    </div>
                  )}
                </>
              ) : (
                <>
                  {userHistory.slice(0, 10).map((record) => {
                    const tierConfig = TIERS.find(t => t.id === record.tier);
                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-2 rounded-lg"
                        style={{ background: 'rgba(51, 65, 85, 0.4)' }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-lg">{record.result === 'win' ? '🏆' : '💔'}</div>
                          <div>
                            <div className="font-bold text-white text-xs">Round #{record.roundNumber}</div>
                            <div className="text-[10px] flex items-center gap-1.5">
                              <span 
                                className="px-1.5 py-0.5 rounded font-bold text-[9px]"
                                style={{ 
                                  background: tierConfig?.color + '40',
                                  color: tierConfig?.color,
                                  border: `1px solid ${tierConfig?.color}60`
                                }}
                              >
                                {tierConfig?.emoji} {tierConfig?.label}
                              </span>
                              <span style={{ color: '#64748B' }}>
                                {formatUSDT(record.betAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-xs" style={{ color: record.result === 'win' ? '#22C55E' : '#EF4444' }}>
                          {record.result === 'win' ? '+' : '-'}{formatUSDT(record.result === 'win' ? record.payout : record.betAmount)}
                        </div>
                      </div>
                    );
                  })}
                  {userHistory.length === 0 && (
                    <div className="text-center py-8" style={{ color: '#64748B' }}>
                      No history yet...
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ========== DESKTOP LAYOUT (≥ 1024px) ========== */}
      <div className="hidden lg:block w-full max-w-[1600px] mx-auto px-8 pb-20 pt-6">
        
        {/* Top Bar: Back + Balance + Actions */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          
          <div className="px-6 py-3 rounded-xl" style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>Gaming Balance</p>
            <p className="text-2xl font-bold" style={{ color: '#60A5FA' }}>
              {formatUSDT(gameBalance)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="p-3 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.2)' }}
            >
              <Trophy className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowProvablyFairModal(!showProvablyFairModal)}
              className="p-3 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.2)' }}
            >
              <Shield className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowRulesModal(!showRulesModal)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.2)' }}
            >
              <Info className="w-5 h-5" />
              <span className="font-semibold">Rules</span>
            </button>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT: 60/40 SPLIT */}
        <div className="flex gap-6">
          
          {/* LEFT COLUMN (60%) - GAME AREA */}
          <div className="w-[60%] space-y-4">
            
            {/* Title + Stats */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  {TIERS.find(t => t.id === activeTier)?.emoji} {activeTier} Wheel Battle
                </h1>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  Higher bets = Higher win chance • Fair & Provable
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 rounded-xl" style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: '#60A5FA' }} />
                    <span className="text-lg font-bold" style={{ color: '#60A5FA' }}>
                      {activeTierState.players.length}
                    </span>
                    <span className="text-sm" style={{ color: '#94A3B8' }}>Players</span>
                  </div>
                </div>
              </div>
            </div>

            {/* POOL DISPLAY - Super Slick */}
            <motion.div
              animate={{ scale: poolPulse ? 1.03 : 1 }}
              className="p-4 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
                border: '2px solid rgba(59, 130, 246, 0.4)',
                boxShadow: poolPulse ? '0 0 25px rgba(59, 130, 246, 0.4)' : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                    {currentTierConfig.emoji} {currentTierConfig.label} Pool
                  </div>
                  <div className="text-3xl font-black" style={{ 
                    background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {formatUSDT(activeTierState.totalPool)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                    Status
                  </div>
                  <div className="text-base font-bold" style={{ color: activeTierState.isLocked ? '#F59E0B' : '#22C55E' }}>
                    {activeTierState.isLocked ? '🔒 Locked' : '✅ Open'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Header: Round Number, Live Tracker, Game Balance */}
            <div className="flex items-center justify-between mb-3 px-2 gap-4">
              {/* Round Number - Left */}
              <div className="font-bold text-base" style={{ 
                color: '#60A5FA',
                textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                whiteSpace: 'nowrap'
              }}>
                Round #{activeTierState.roundCounter}
              </div>
              
              {/* Live Tracker - Middle */}
              <div className="flex-1 text-center min-w-0">
                <div className="font-bold text-base animate-pulse truncate" style={{ 
                  color: '#FBBF24',
                  textShadow: '0 0 15px rgba(251, 191, 36, 0.8)'
                }}>
                  🎯 {liveTrackerPlayer}
                </div>
              </div>
              
              {/* Game Balance - Right */}
              <div className="font-bold text-base" style={{ 
                color: '#22C55E',
                textShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
                whiteSpace: 'nowrap'
              }}>
                💰 game bal. {formatUSDT(gameBalance)}
              </div>
            </div>

            {/* WHEEL with countdown in center */}
            <div className="rounded-2xl p-6 relative" style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
            }}>
              {/* Tier Badge - Top Left */}
              <div className="absolute top-4 left-4 px-4 py-2 rounded-lg font-bold text-sm z-10" style={{
                background: `linear-gradient(135deg, ${currentTierConfig.color}60 0%, ${currentTierConfig.color}30 100%)`,
                border: `2px solid ${currentTierConfig.color}`,
                color: currentTierConfig.color,
                boxShadow: `0 0 20px ${currentTierConfig.color}40`
              }}>
                {currentTierConfig.emoji} {currentTierConfig.label} {currentTierConfig.description}
              </div>

              {/* Countdown - Centered, Non-Rotating */}
              {/* Arrow Pointer - OUTSIDE wheel, hanging above it */}
              <div className="flex justify-center mb-3">
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="50" height="64" viewBox="0 0 48 60">
                    <defs>
                      <linearGradient id="arrowGradientDesktop" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M 24 55 L 6 12 L 24 18 L 42 12 Z" 
                      fill="url(#arrowGradientDesktop)" 
                      stroke="#FFFFFF" 
                      strokeWidth="3"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Wheel Container */}
              <div className="relative flex items-center justify-center">
                {/* Countdown - Centered, Non-Rotating */}
                {activeTierState.gameState === 'countdown' && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="text-center">
                      {activeTierState.isLocked && (
                        <div className="text-2xl mb-1">🔒</div>
                      )}
                      <div className="text-6xl font-black" style={{ 
                        color: activeTierState.countdown <= 5 ? '#EF4444' : '#60A5FA'
                      }}>
                        {activeTierState.countdown}
                      </div>
                    </div>
                  </div>
                )}

                {/* Wheel SVG */}
                <div className="relative w-full max-w-[480px] mx-auto">
                  <motion.svg
                    className="w-full h-auto"
                    viewBox="0 0 400 400"
                    animate={{
                      rotate: activeTierState.isSpinning ? activeTierState.rotation : activeTierState.rotation + activeTierState.idleRotation,
                      scale: activeTierState.isSpinning ? 1.02 : 1
                    }}
                    transition={
                      activeTierState.isSpinning 
                        ? { duration: 6, ease: [0.25, 0.1, 0.25, 1.0] } // Faster, smoother deceleration
                        : { duration: 0.3 }
                    }
                    onUpdate={(latest) => {
                      // Update the motion value as the animation progresses for live tracking
                      if (activeTierState.isSpinning && typeof latest.rotate === 'number') {
                        const motionValue = activeTier === 'CASUAL' ? casualRotation : activeTier === 'MID' ? midRotation : proRotation;
                        motionValue.set(latest.rotate);
                      }
                    }}
                  >
                    {wheelSegments.length > 0 ? (
                      wheelSegments.map((segment, index) => {
                        const x1 = 200 + 195 * Math.cos((segment.startAngle - 90) * Math.PI / 180);
                        const y1 = 200 + 195 * Math.sin((segment.startAngle - 90) * Math.PI / 180);
                        const x2 = 200 + 195 * Math.cos((segment.endAngle - 90) * Math.PI / 180);
                        const y2 = 200 + 195 * Math.sin((segment.endAngle - 90) * Math.PI / 180);
                        const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                        
                        return (
                          <g key={segment.player.id}>
                            <path
                              d={`M 200 200 L ${x1} ${y1} A 195 195 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={segment.color}
                              opacity={hoveredSegment === index ? 0.9 : 0.7}
                              stroke="#1E293B"
                              strokeWidth="2"
                              onMouseEnter={() => setHoveredSegment(index)}
                              onMouseLeave={() => setHoveredSegment(null)}
                              style={{ cursor: 'pointer' }}
                            />
                            
                            {segment.endAngle - segment.startAngle > 8 && (
                              <text
                                x={200 + 120 * Math.cos(((segment.startAngle + segment.endAngle) / 2 - 90) * Math.PI / 180)}
                                y={200 + 120 * Math.sin(((segment.startAngle + segment.endAngle) / 2 - 90) * Math.PI / 180)}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={Math.min(32, Math.max(18, (segment.endAngle - segment.startAngle) * 0.8))}
                              >
                                {segment.player.avatar}
                              </text>
                            )}
                          </g>
                        );
                      })
                    ) : (
                      <circle cx="200" cy="200" r="195" fill="rgba(51, 65, 85, 0.5)" stroke="#334155" strokeWidth="2" />
                    )}
                    
                    {/* Center circle */}
                    <circle cx="200" cy="200" r="50" fill="#1E293B" stroke="#475569" strokeWidth="3" />
                  </motion.svg>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (40%) - BETTING & INFO */}
          <div className="w-[40%] space-y-4">
            
            {/* MY BET INFO - Shows after joining */}
            {activeTierState.hasJoined && activeTierState.gameState === 'countdown' && (
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    border: '2px solid rgba(59, 130, 246, 0.4)',
                  }}
                >
                  {(() => {
                    const userPlayer = activeTierState.players.find(p => p.id === 'you');
                    if (!userPlayer) return null;
                    
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{userPlayer.avatar}</div>
                          <div>
                            <div className="font-bold text-white">Your Bet</div>
                            <div className="text-sm font-bold" style={{ color: '#60A5FA' }}>
                              {userPlayer.percentage.toFixed(2)}% chance
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-2xl" style={{ color: '#60A5FA' }}>
                            {formatUSDT(userPlayer.betAmount)}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
                
                {/* Auto Bet Stop Button */}
                {autoJoinEnabled && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => {
                      setAutoJoinEnabled(false);
                      toast.info('Auto bet cancelled');
                    }}
                    className="w-full mt-3 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                      color: 'white',
                      border: '2px solid rgba(239, 68, 68, 0.5)',
                    }}
                  >
                    🛑 Stop Auto Bet ({autoJoinRoundsPlayed}/{autoJoinMaxRounds || '∞'})
                  </motion.button>
                )}
              </div>
            )}

            {/* BET INPUT & JOIN */}
            {!activeTierState.hasJoined && activeTierState.gameState === 'countdown' && !activeTierState.isLocked && (
              <div className="rounded-xl p-6" style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
              }}>
                <div className="font-bold mb-4" style={{ color: '#FFFFFF' }}>
                  💸 Place Your Bet
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {betPresets.map(preset => (
                    <button
                      key={preset}
                      onClick={() => setBetAmount(preset)}
                      className="py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
                      style={{
                        background: betAmount === preset 
                          ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                          : 'rgba(51, 65, 85, 0.6)',
                        border: betAmount === preset ? '2px solid #60A5FA' : '2px solid rgba(148, 163, 184, 0.2)',
                        color: betAmount === preset ? 'white' : '#94A3B8',
                      }}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  value={betAmount || ''}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter custom amount..."
                  className="w-full px-4 py-3 rounded-xl mb-4 text-white font-bold text-center text-lg"
                  style={{
                    background: 'rgba(51, 65, 85, 0.6)',
                    border: '2px solid rgba(148, 163, 184, 0.2)',
                  }}
                />
                
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleJoinRound}
                    disabled={betAmount <= 0 || betAmount > gameBalance}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 rounded-xl font-black text-lg"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                      color: 'white',
                      opacity: (betAmount <= 0 || betAmount > gameBalance) ? 0.5 : 1,
                    }}
                  >
                    JOIN
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setShowAutoJoinOptions(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 rounded-xl transition-all"
                    style={{
                      background: autoJoinEnabled 
                        ? 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)'
                        : 'rgba(51, 65, 85, 0.6)',
                      border: autoJoinEnabled ? '2px solid #22C55E' : '2px solid rgba(148, 163, 184, 0.2)',
                      color: autoJoinEnabled ? 'white' : '#94A3B8',
                    }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Already Joined Badge */}
            {activeTierState.hasJoined && (
              <div className="rounded-xl p-6 text-center" style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
                border: '2px solid rgba(34, 197, 94, 0.4)',
              }}>
                <div className="text-4xl mb-2">✅</div>
                <div className="font-black text-lg mb-1" style={{ color: '#22C55E' }}>
                  YOU'RE IN!
                </div>
                <div className="text-sm" style={{ color: '#94A3B8' }}>
                  Good luck! 🍀
                </div>
              </div>
            )}

            {/* PLAYERS LIST */}
            <div className="rounded-xl p-4" style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
            }}>
              <div className="font-bold mb-3 flex items-center justify-between" style={{ color: '#94A3B8' }}>
                <div>
                  <Users className="inline w-4 h-4 mr-2" />
                  Players ({activeTierState.players.length})
                </div>
                {highestBettor && (
                  <div className="text-xs flex items-center gap-1" style={{ color: '#F59E0B' }}>
                    <Trophy className="w-3 h-3" />
                    {formatUSDT(highestBettor.betAmount)}
                  </div>
                )}
              </div>
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-2">
                {activeTierState.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2.5 rounded-lg transition-all hover:scale-105"
                    style={{ background: 'rgba(51, 65, 85, 0.4)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-lg">{player.avatar}</div>
                      <div>
                        <div className="font-bold text-white text-xs">{player.username}</div>
                        <div className="text-[10px]" style={{ color: '#94A3B8' }}>
                          {player.percentage.toFixed(1)}% chance
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-xs" style={{ color: player.color }}>
                      {formatUSDT(player.betAmount)}
                    </div>
                  </div>
                ))}
                {activeTierState.players.length === 0 && (
                  <div className="text-center py-12" style={{ color: '#64748B' }}>
                    Waiting for players...
                  </div>
                )}
              </div>
            </div>

            {/* WINNER HISTORY */}
            <div className="rounded-xl p-4" style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
            }}>
              {/* Tab Headers */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setHistoryViewTab('winners')}
                  className="flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all hover:scale-105"
                  style={{
                    background: historyViewTab === 'winners' 
                      ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                      : 'rgba(51, 65, 85, 0.4)',
                    color: historyViewTab === 'winners' ? 'white' : '#94A3B8',
                  }}
                >
                  <Trophy className="inline w-4 h-4 mr-1" />
                  Winners
                </button>
                <button
                  onClick={() => setHistoryViewTab('myHistory')}
                  className="flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all hover:scale-105"
                  style={{
                    background: historyViewTab === 'myHistory' 
                      ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                      : 'rgba(51, 65, 85, 0.4)',
                    color: historyViewTab === 'myHistory' ? 'white' : '#94A3B8',
                  }}
                >
                  <Clock className="inline w-4 h-4 mr-1" />
                  My History
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2">
                {(() => {
                  return null;
                })()}
                {historyViewTab === 'winners' ? (
                  <>
                    {recentWinnersList.slice(0, 10).map((winner) => {
                      const tierConfig = TIERS.find(t => t.id === winner.tier);
                      return (
                        <div
                      key={winner.id}
                      className="flex items-center justify-between p-2.5 rounded-lg transition-all hover:scale-105"
                      style={{ background: 'rgba(51, 65, 85, 0.4)' }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-base">{winner.avatar}</div>
                        <div>
                          <div className="font-bold text-white text-xs">{winner.username}</div>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span 
                              className="px-1.5 py-0.5 rounded font-bold text-[9px]"
                              style={{ 
                                background: tierConfig?.color + '40',
                                color: tierConfig?.color,
                                border: `1px solid ${tierConfig?.color}60`
                              }}
                            >
                              {tierConfig?.emoji} {tierConfig?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-xs" style={{ color: '#22C55E' }}>
                        +{formatUSDT(winner.payout)}
                      </div>
                    </div>
                      );
                    })}
                    {recentWinnersList.length === 0 && (
                      <div className="text-center py-8" style={{ color: '#64748B' }}>
                        No winners yet...
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {userHistory.slice(0, 10).map((record) => {
                      const tierConfig = TIERS.find(t => t.id === record.tier);
                      return (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-2.5 rounded-lg transition-all hover:scale-105"
                          style={{ background: 'rgba(51, 65, 85, 0.4)' }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-base">{record.result === 'win' ? '🏆' : '💔'}</div>
                            <div>
                              <div className="font-bold text-white text-xs">Round #{record.roundNumber}</div>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span 
                                  className="px-1.5 py-0.5 rounded font-bold text-[9px]"
                                  style={{ 
                                    background: tierConfig?.color + '40',
                                    color: tierConfig?.color,
                                    border: `1px solid ${tierConfig?.color}60`
                                  }}
                                >
                                  {tierConfig?.emoji} {tierConfig?.label}
                                </span>
                                <span style={{ color: '#64748B' }}>
                                  {formatUSDT(record.betAmount)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-xs" style={{ color: record.result === 'win' ? '#22C55E' : '#EF4444' }}>
                            {record.result === 'win' ? '+' : '-'}{formatUSDT(record.result === 'win' ? record.payout : record.betAmount)}
                          </div>
                        </div>
                      );
                    })}
                    {userHistory.length === 0 && (
                      <div className="text-center py-8" style={{ color: '#64748B' }}>
                        No history yet...
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      <GameFooter />
      
      {/* AUTO JOIN OPTIONS MODAL - Global (works for both mobile & desktop) */}
      <AnimatePresence>
        {showAutoJoinOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowAutoJoinOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-xl p-6 max-w-md w-full"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.98) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" style={{ color: '#22C55E' }} />
                  Auto Join
                </h3>
                <button onClick={() => setShowAutoJoinOptions(false)}>
                  <X className="w-5 h-5" style={{ color: '#94A3B8' }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: '#94A3B8' }}>
                    Bet Amount
                  </label>
                  <input
                    type="number"
                    value={autoJoinBetAmount || ''}
                    onChange={(e) => setAutoJoinBetAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount..."
                    className="w-full px-4 py-2 rounded-lg text-white font-bold"
                    style={{
                      background: 'rgba(51, 65, 85, 0.6)',
                      border: '2px solid rgba(148, 163, 184, 0.2)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: '#94A3B8' }}>
                    Number of Rounds
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 5, 10, 20].map(count => (
                      <button
                        key={count}
                        onClick={() => setAutoJoinMaxRounds(count)}
                        className="py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
                        style={{
                          background: autoJoinMaxRounds === count 
                            ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                            : 'rgba(51, 65, 85, 0.6)',
                          border: autoJoinMaxRounds === count ? '2px solid #60A5FA' : '2px solid rgba(148, 163, 184, 0.2)',
                          color: autoJoinMaxRounds === count ? 'white' : '#94A3B8',
                        }}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setAutoJoinMaxRounds(null)}
                    className="w-full mt-2 py-2 rounded-lg font-bold text-xs transition-all"
                    style={{
                      background: autoJoinMaxRounds === null 
                        ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                        : 'rgba(51, 65, 85, 0.6)',
                      border: autoJoinMaxRounds === null ? '2px solid #60A5FA' : '2px solid rgba(148, 163, 184, 0.2)',
                      color: autoJoinMaxRounds === null ? 'white' : '#94A3B8',
                    }}
                  >
                    ∞ Unlimited
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.4)' }}>
                  <span className="text-sm font-bold text-white">Stop on Win</span>
                  <button
                    onClick={() => setAutoJoinStopOnWin(!autoJoinStopOnWin)}
                    className="w-12 h-6 rounded-full transition-all"
                    style={{
                      background: autoJoinStopOnWin ? '#22C55E' : 'rgba(148, 163, 184, 0.3)',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full bg-white transition-all"
                      style={{
                        marginLeft: autoJoinStopOnWin ? '26px' : '2px',
                      }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.4)' }}>
                  <span className="text-sm font-bold text-white">Stop on Loss</span>
                  <button
                    onClick={() => setAutoJoinStopOnLoss(!autoJoinStopOnLoss)}
                    className="w-12 h-6 rounded-full transition-all"
                    style={{
                      background: autoJoinStopOnLoss ? '#22C55E' : 'rgba(148, 163, 184, 0.3)',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full bg-white transition-all"
                      style={{
                        marginLeft: autoJoinStopOnLoss ? '26px' : '2px',
                      }}
                    />
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (autoJoinBetAmount > 0) {
                      setAutoJoinEnabled(!autoJoinEnabled);
                      setBetAmount(autoJoinBetAmount);
                      setShowAutoJoinOptions(false);
                      toast.success(autoJoinEnabled ? 'Auto Join disabled' : 'Auto Join enabled');
                    } else {
                      toast.error('Please enter a bet amount');
                    }
                  }}
                  className="w-full py-3 rounded-xl font-black"
                  style={{
                    background: autoJoinEnabled 
                      ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                      : 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
                    color: 'white',
                  }}
                >
                  {autoJoinEnabled ? 'DISABLE AUTO JOIN' : 'ENABLE AUTO JOIN'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* RESULT CARD - Small & Only if User Played */}
      <AnimatePresence>
        {activeTierState.showResult && activeTierState.winner && activeTierState.userBetAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <motion.div
              className="rounded-2xl p-6 shadow-2xl"
              style={{
                background: activeTierState.winner.id === 'you'
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
                border: activeTierState.winner.id === 'you'
                  ? '2px solid #22C55E'
                  : '2px solid #EF4444',
                minWidth: '280px',
              }}
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                  }}
                  transition={{ duration: 0.4, repeat: 2 }}
                  className="text-5xl mb-2"
                >
                  {activeTierState.winner.id === 'you' ? '🎉' : '💔'}
                </motion.div>
                
                <div className="text-2xl font-black mb-2 text-white">
                  {activeTierState.winner.id === 'you' ? 'YOU WON!' : 'YOU LOST!'}
                </div>
                
                <div className="text-3xl font-black text-white mb-1">
                  {formatUSDT(activeTierState.totalPool)}
                </div>
                
                {activeTierState.winner.id !== 'you' && (
                  <div className="text-sm mt-2 text-white opacity-90">
                    Winner: {activeTierState.winner.username} {activeTierState.winner.avatar}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* LEADERBOARD MODAL */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setShowLeaderboard(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-t-3xl md:rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6" style={{ color: '#F59E0B' }} />
                    Weekly Leaderboard
                  </h2>
                  <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                    Resets every Monday • All Tiers Combined
                  </p>
                </div>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="p-2 rounded-lg transition-all hover:scale-110"
                  style={{
                    background: 'rgba(148, 163, 184, 0.1)',
                    color: '#94A3B8',
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Top Winners */}
              <div className="space-y-3">
                {weeklyLeaderboard.slice(0, 20).map((player, index) => {
                  const tierConfig = TIERS.find(t => t.id === player.tier);
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                  
                  return (
                    <motion.div
                      key={`${player.username}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{
                        background: index < 3 
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.2) 100%)'
                          : 'rgba(30, 41, 59, 0.6)',
                        border: index < 3
                          ? '2px solid rgba(245, 158, 11, 0.4)'
                          : '1px solid rgba(148, 163, 184, 0.15)',
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="text-lg font-black w-7" style={{ color: index < 3 ? '#F59E0B' : '#64748B' }}>
                          {medal || `#${index + 1}`}
                        </div>
                        <div className="text-xl">{player.avatar}</div>
                        <div>
                          <div className="font-bold text-white text-sm">{player.username}</div>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span style={{ color: '#64748B' }}>
                              {player.gamesPlayed} games
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-base" style={{ color: '#22C55E' }}>
                          {formatUSDT(player.totalWon)}
                        </div>
                        <div className="text-[10px]" style={{ color: '#94A3B8' }}>
                          total won
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {weeklyLeaderboard.length === 0 && (
                  <div className="text-center py-12" style={{ color: '#64748B' }}>
                    No winners yet. Be the first!
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <PvPWheelModals
        showRulesModal={showRulesModal}
        setShowRulesModal={setShowRulesModal}
        showProvablyFairModal={showProvablyFairModal}
        setShowProvablyFairModal={setShowProvablyFairModal}
        clientSeed={clientSeed}
        setClientSeed={setClientSeed}
        serverSeedHash={serverSeedHash}
        nonce={nonce}
        copiedField={copiedField}
        handleCopy={copyToClipboard}
      />
    </div>
  );
}
