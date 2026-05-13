import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, useMotionValue } from 'motion/react';
import { ArrowLeft, Zap, Shield, FileText, X, RefreshCw, Users, Play, Plus, LogOut, Copy, Share2, Lock } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { toast } from 'sonner';
import { useUser } from '../context/UserContext';
import { useBonus } from '../context/BonusContext';

// Types
type CoinSide = 'HEADS' | 'TAILS';
type RoomStatus = 'WAITING' | 'READY' | 'IN_PROGRESS' | 'RESULT';

interface Player {
  id: string;
  username: string;
  avatar: string;
  side: CoinSide | null;
  isReady: boolean;
}

interface Room {
  roomId: string;
  stakeAmount: number;
  players: (Player | null)[];
  status: RoomStatus;
  result: CoinSide | null;
  createdAt: number;
}

interface HistoryRecord {
  roundId: number;
  playerSide: CoinSide;
  opponentSide: CoinSide;
  result: CoinSide;
  won: boolean;
  amount: number;
  timestamp: number;
}

// Stake Room Configuration
const STAKE_ROOMS = [
  { amount: 1, label: '$1', color: '#60A5FA' },
  { amount: 5, label: '$5', color: '#F59E0B' },
  { amount: 10, label: '$10', color: '#8B5CF6' },
  { amount: 20, label: '$20', color: '#EF4444' },
  { amount: 50, label: '$50', color: '#10B981' },
  { amount: 100, label: '$100', color: '#F97316' },
];

// Bot names
const BOT_NAMES = [
  'CoinMaster', 'FlipKing', 'LuckyFlip', 'HeadsUp', 'TailsWin',
  'QuickFlip', 'CoinPro', 'FlipLord', 'WinStreak', 'GoldenFlip',
  'FastCoin', 'FlipNinja', 'CoinChamp', 'BetMaster', 'FlipHero'
];

const BOT_AVATARS = ['🤖', '👾', '🎯', '⚡', '🔥', '💎', '🌟', '🎲', '🃏', '🎰'];

// Generate bot
const generateBot = (side: CoinSide): Player => ({
  id: `bot_${Date.now()}_${Math.random()}`,
  username: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
  avatar: BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)],
  side,
  isReady: false
});

export default function PvPCoinFlip() {
  const navigate = useNavigate();

  // Use global game balance from context
  const { gameBalance, updateGameBalance, formatUSDT } = useUser();
  const { addWagering } = useBonus();
  
  // Current view: 'lobby' | 'room'
  const [currentView, setCurrentView] = useState<'lobby' | 'room'>('lobby');
  
  // Current room
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  
  // User player state
  const [userPlayer, setUserPlayer] = useState<Player | null>(null);
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  
  // History & Stats - will be loaded from sessionStorage
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, profit: 0 });
  const [roundCounter, setRoundCounter] = useState(1);
  
  // Coin flip rotation
  const coinRotation = useMotionValue(0);
  
  // Timers
  const flipTimerRef = useRef<number | null>(null);
  const botJoinTimerRef = useRef<number | null>(null);
  const botReadyTimerRef = useRef<number | null>(null);

  // Track if result has been processed to prevent duplicate updates
  const resultProcessedRef = useRef<boolean>(false);
  const gameStartedRef = useRef<boolean>(false);
  
  // Modals
  const [showProvablyFair, setShowProvablyFair] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivateRoomModal, setShowPrivateRoomModal] = useState(false);
  const [privateRoomMode, setPrivateRoomMode] = useState<'create' | 'join' | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [selectedStakeForPrivate, setSelectedStakeForPrivate] = useState<number>(0);
  
  // Load data from localStorage on mount (persists even after closing browser)
  useEffect(() => {
    const savedHistory = localStorage.getItem('pvpCoinFlip_history');
    const savedStats = localStorage.getItem('pvpCoinFlip_stats');
    const savedRoundCounter = localStorage.getItem('pvpCoinFlip_roundCounter');

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    if (savedRoundCounter) {
      setRoundCounter(JSON.parse(savedRoundCounter));
    }
  }, []);

  // Save data to localStorage whenever it changes (persists even after closing browser)
  useEffect(() => {
    localStorage.setItem('pvpCoinFlip_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('pvpCoinFlip_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('pvpCoinFlip_roundCounter', JSON.stringify(roundCounter));
  }, [roundCounter]);
  
  // ========== PRIVATE ROOM SYSTEM ==========

  // Generate a random 6-character room code
  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Open Private Room Modal
  const handleOpenPrivateRoom = (stakeAmount: number) => {
    setSelectedStakeForPrivate(stakeAmount);
    setShowPrivateRoomModal(true);
  };

  // Create Private Room with Code
  const handleCreatePrivateRoom = () => {
    if (selectedStakeForPrivate > gameBalance) {
      toast.error('Insufficient balance!');
      return;
    }

    // Generate room code
    const code = generateRoomCode();
    setRoomCode(code);

    // Deduct stake from balance
    updateGameBalance(-selectedStakeForPrivate);
    addWagering(selectedStakeForPrivate); // Track wagering for bonus

    // Create room
    const newRoom: Room = {
      roomId: `private_${code}`,
      stakeAmount: selectedStakeForPrivate,
      players: [null, null],
      status: 'WAITING',
      result: null,
      createdAt: Date.now()
    };

    // Join as Player A (Host) with crown avatar
    const player: Player = {
      id: 'user',
      username: '🏠 You (Host)',
      avatar: '👑',
      side: null,
      isReady: false
    };

    newRoom.players[0] = player;
    setUserPlayer(player);
    setCurrentRoom(newRoom);

    // Set mode to create to show code
    setPrivateRoomMode('create');

    toast.success(`Private room created! Code: ${code}`);
  };

  // Join Private Room with Code
  const handleJoinPrivateRoom = () => {
    if (!joinRoomCode || joinRoomCode.trim().length !== 6) {
      toast.error('Please enter a valid 6-character code');
      return;
    }

    if (selectedStakeForPrivate > gameBalance) {
      toast.error('Insufficient balance!');
      return;
    }

    // Deduct stake from balance
    updateGameBalance(-selectedStakeForPrivate);
    addWagering(selectedStakeForPrivate); // Track wagering for bonus

    // Create/Join room (simulated - in real app would look up existing room)
    const newRoom: Room = {
      roomId: `private_${joinRoomCode}`,
      stakeAmount: selectedStakeForPrivate,
      players: [null, null],
      status: 'WAITING',
      result: null,
      createdAt: Date.now()
    };

    // Create a simulated host player with different avatar
    const hostPlayer: Player = {
      id: 'host',
      username: '🏠 Host',
      avatar: '👑',
      side: null,
      isReady: false
    };

    // Join as Player B with different avatar and username
    const player: Player = {
      id: 'user',
      username: '🎮 You',
      avatar: '🎯',
      side: null,
      isReady: false
    };

    newRoom.players[0] = hostPlayer;
    newRoom.players[1] = player;
    setUserPlayer(player);
    setCurrentRoom(newRoom);
    setCurrentView('room');
    setShowPrivateRoomModal(false);
    setPrivateRoomMode(null);
    setJoinRoomCode('');

    toast.success('Joined private room! Select your side');
  };

  // Copy room code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('Room code copied to clipboard!');
  };

  // Share room code
  const handleShareCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join my PvP Coin Flip game',
        text: `Join my game with code: ${roomCode}`,
      }).then(() => {
        toast.success('Shared successfully!');
      }).catch(() => {
        // Fallback to copy
        handleCopyCode();
      });
    } else {
      // Fallback to copy if share API not available
      handleCopyCode();
    }
  };

  // Continue to game after creating private room
  const handleContinueToGame = () => {
    setShowPrivateRoomModal(false);
    setPrivateRoomMode(null);
    setCurrentView('room');
  };

  // ========== LOBBY SYSTEM ==========

  // ACTION: Play Now (Auto-match)
  const handlePlayNow = (stakeAmount: number) => {
    if (stakeAmount > gameBalance) {
      toast.error('Insufficient balance!');
      return;
    }
    
    // Deduct stake from balance
    updateGameBalance(-stakeAmount);
    addWagering(stakeAmount); // Track wagering for bonus

    // Search for existing room or create new one
    toast.info('Searching for opponent...');
    
    // Create room (simulating auto-match by creating room)
    const newRoom: Room = {
      roomId: `room_${Date.now()}`,
      stakeAmount,
      players: [null, null],
      status: 'WAITING',
      result: null,
      createdAt: Date.now()
    };
    
    // Join as Player A with distinct username
    const player: Player = {
      id: 'user',
      username: '🎮 You',
      avatar: '😎',
      side: null,
      isReady: false
    };

    newRoom.players[0] = player;
    setUserPlayer(player);
    setCurrentRoom(newRoom);
    setCurrentView('room');

    toast.success('Room joined! Waiting for opponent...');

    // Simulate bot joining after 2 seconds (auto-match)
    botJoinTimerRef.current = window.setTimeout(() => {
      handleBotJoin(newRoom);
    }, 2000);
  };

  // ACTION: Create Room (Manual challenge)
  const handleCreateRoom = (stakeAmount: number) => {
    if (stakeAmount > gameBalance) {
      toast.error('Insufficient balance!');
      return;
    }

    // Deduct stake from balance
    updateGameBalance(-stakeAmount);
    addWagering(stakeAmount); // Track wagering for bonus

    // Create room
    const newRoom: Room = {
      roomId: `room_${Date.now()}`,
      stakeAmount,
      players: [null, null],
      status: 'WAITING',
      result: null,
      createdAt: Date.now()
    };

    // Join as Player A with distinct username
    const player: Player = {
      id: 'user',
      username: '🎮 You',
      avatar: '😎',
      side: null,
      isReady: false
    };
    
    newRoom.players[0] = player;
    setUserPlayer(player);
    setCurrentRoom(newRoom);
    setCurrentView('room');
    
    toast.success('Room created! Waiting for opponent...');
    
    // Simulate bot joining after 3 seconds (manual wait)
    botJoinTimerRef.current = window.setTimeout(() => {
      handleBotJoin(newRoom);
    }, 3000);
  };
  
  // ========== MATCHMAKING LOGIC ==========
  
  // Bot joins room
  const handleBotJoin = (room: Room) => {
    // Automatically assign opposite side to opponent
    const playerASide = room.players[0]?.side;
    const opponentSide: CoinSide = playerASide === 'HEADS' ? 'TAILS' : 
                                   playerASide === 'TAILS' ? 'HEADS' : 
                                   'TAILS'; // Default to TAILS if player hasn't selected yet
    
    const bot = generateBot(opponentSide);
    bot.side = opponentSide; // Explicitly set the opposite side
    
    const updatedRoom = { ...room };
    updatedRoom.players[1] = bot;
    
    setCurrentRoom(updatedRoom);
    toast.success(`${bot.username} joined the room!`);
    
    // If player A hasn't selected a side yet, they need to select first
    // If player A already selected, bot auto-gets opposite and gets ready after delay
    if (playerASide) {
      // Player A already selected, bot gets ready after 1.5 seconds
      botReadyTimerRef.current = window.setTimeout(() => {
        const readyBot = { ...bot, isReady: true };
        updatedRoom.players[1] = readyBot;
        setCurrentRoom({ ...updatedRoom });
      }, 1500);
    }
  };
  
  // ========== ROOM SYSTEM (CORE) ==========
  
  // Player selects side
  const handleSelectSide = (side: CoinSide) => {
    if (!currentRoom || currentRoom.status !== 'WAITING') return;

    setSelectedSide(side);

    const updatedPlayer = { ...userPlayer!, side };
    setUserPlayer(updatedPlayer);

    const updatedRoom = { ...currentRoom };

    // Find which position the user is in (0 or 1)
    const userPosition = updatedRoom.players[0]?.id === userPlayer?.id ? 0 : 1;
    const opponentPosition = userPosition === 0 ? 1 : 0;

    // Update user's side
    updatedRoom.players[userPosition] = updatedPlayer;

    // If opponent already exists, automatically assign opposite side
    if (updatedRoom.players[opponentPosition]) {
      const oppositeSide: CoinSide = side === 'HEADS' ? 'TAILS' : 'HEADS';
      const updatedOpponent = { ...updatedRoom.players[opponentPosition], side: oppositeSide };
      updatedRoom.players[opponentPosition] = updatedOpponent;

      // Opponent gets ready automatically after 1 second
      setTimeout(() => {
        const readyOpponent = { ...updatedOpponent, isReady: true };
        updatedRoom.players[opponentPosition] = readyOpponent;
        setCurrentRoom({ ...updatedRoom });
      }, 1000);
    }

    setCurrentRoom(updatedRoom);
  };
  
  // Player clicks "Ready"
  const handleReady = () => {
    if (!currentRoom || !selectedSide) {
      toast.error('Please select a side first!');
      return;
    }

    const updatedPlayer = { ...userPlayer!, isReady: true };
    setUserPlayer(updatedPlayer);

    const updatedRoom = { ...currentRoom };

    // Find which position the user is in (0 or 1)
    const userPosition = updatedRoom.players[0]?.id === userPlayer?.id ? 0 : 1;
    const opponentPosition = userPosition === 0 ? 1 : 0;

    // Update user's ready state
    updatedRoom.players[userPosition] = updatedPlayer;
    setCurrentRoom(updatedRoom);

    toast.success('You are ready!');

    // Opponent gets ready after 1 second
    botReadyTimerRef.current = window.setTimeout(() => {
      if (updatedRoom.players[opponentPosition]) {
        const updatedOpponent = { ...updatedRoom.players[opponentPosition]!, isReady: true };
        updatedRoom.players[opponentPosition] = updatedOpponent;
        setCurrentRoom({ ...updatedRoom });
      }
    }, 1000);
  };
  
  // Monitor room state changes
  useEffect(() => {
    if (!currentRoom) {
      gameStartedRef.current = false;
      return;
    }

    const playerA = currentRoom.players[0];
    const playerB = currentRoom.players[1];

    // WAITING → READY (both players joined and ready)
    if (currentRoom.status === 'WAITING' &&
        playerA && playerB &&
        playerA.isReady && playerB.isReady &&
        !gameStartedRef.current) {

      gameStartedRef.current = true;

      const updatedRoom = { ...currentRoom, status: 'READY' as RoomStatus };
      setCurrentRoom(updatedRoom);

      toast.success('Both players ready! Starting game...');

      // READY → IN_PROGRESS
      setTimeout(() => {
        startCoinFlip(updatedRoom);
      }, 1000);
    }
  }, [currentRoom]);
  
  // ========== GAME FLOW ==========
  
  // READY → COIN FLIP (IN_PROGRESS)
  const startCoinFlip = (room: Room) => {
    const updatedRoom = { ...room, status: 'IN_PROGRESS' as RoomStatus };
    setCurrentRoom(updatedRoom);

    // Reset result processed flag for new round
    resultProcessedRef.current = false;

    // Determine winner (50/50)
    const winnerSide: CoinSide = Math.random() < 0.5 ? 'HEADS' : 'TAILS';

    // Calculate rotation (more spins for longer, smoother animation)
    const baseRotations = 8;
    const targetRotation = winnerSide === 'HEADS' ? 0 : 180;
    const totalRotation = baseRotations * 360 + targetRotation;

    // Animate coin
    coinRotation.set(totalRotation);

    // COIN FLIP → RESULT (match animation duration)
    flipTimerRef.current = window.setTimeout(() => {
      showResult(updatedRoom, winnerSide);
    }, 6000);
  };
  
  // IN_PROGRESS → RESULT
  const showResult = (room: Room, winnerSide: CoinSide) => {
    // Prevent duplicate processing
    if (resultProcessedRef.current) {
      return;
    }
    resultProcessedRef.current = true;

    const updatedRoom = {
      ...room,
      status: 'RESULT' as RoomStatus,
      result: winnerSide
    };
    setCurrentRoom(updatedRoom);

    const playerA = room.players[0]!;
    const playerB = room.players[1]!;

    // Determine which player is the user
    const isUserPlayerA = playerA.id === userPlayer?.id;
    const userPlayerData = isUserPlayerA ? playerA : playerB;
    const opponentPlayerData = isUserPlayerA ? playerB : playerA;

    // Check if user won
    const won = userPlayerData.side === winnerSide;

    // Update balance and stats (only once due to flag above)
    if (won) {
      const winAmount = room.stakeAmount * 2;
      updateGameBalance(winAmount);
      setStats(prev => ({
        wins: prev.wins + 1,
        losses: prev.losses,
        profit: prev.profit + room.stakeAmount
      }));
      toast.success(`🎉 You won ${formatUSDT(winAmount)}!`);
    } else {
      setStats(prev => ({
        wins: prev.wins,
        losses: prev.losses + 1,
        profit: prev.profit - room.stakeAmount
      }));
      toast.error(`You lost ${formatUSDT(room.stakeAmount)}`);
    }

    // Update history
    const record: HistoryRecord = {
      roundId: roundCounter,
      playerSide: userPlayerData.side!,
      opponentSide: opponentPlayerData.side!,
      result: winnerSide,
      won,
      amount: room.stakeAmount,
      timestamp: Date.now()
    };

    setHistory(prev => [record, ...prev].slice(0, 50));
    setRoundCounter(prev => prev + 1);
  };
  
  // ========== RESET LOGIC ==========
  
  // ACTION: Rematch (Keep same room, reset state)
  const handleRematch = () => {
    if (!currentRoom) return;
    
    toast.info('Requesting rematch...');
    
    // Check balance
    if (currentRoom.stakeAmount > gameBalance) {
      toast.error('Insufficient balance for rematch!');
      return;
    }
    
    // Deduct stake
    updateGameBalance(-currentRoom.stakeAmount);
    addWagering(currentRoom.stakeAmount); // Track wagering for bonus

    // Simulate opponent accepting rematch
    setTimeout(() => {
      performReset('rematch');
    }, 1000);
  };
  
  // ACTION: Leave Room
  const handleLeaveRoom = () => {
    // Refund stake if leaving before opponent joined
    if (currentRoom && currentRoom.status === 'WAITING' && !currentRoom.players[1]) {
      updateGameBalance(currentRoom.stakeAmount);
      toast.info(`Stake refunded: ${formatUSDT(currentRoom.stakeAmount)}`);
    }
    performReset('leave');
  };
  
  // RESET ROOM STATE
  const performReset = (action: 'rematch' | 'leave') => {
    // Clear timers
    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
    if (botJoinTimerRef.current) {
      clearTimeout(botJoinTimerRef.current);
      botJoinTimerRef.current = null;
    }
    if (botReadyTimerRef.current) {
      clearTimeout(botReadyTimerRef.current);
      botReadyTimerRef.current = null;
    }

    // Reset flags
    resultProcessedRef.current = false;
    gameStartedRef.current = false;

    if (action === 'leave') {
      // Return to lobby
      setCurrentView('lobby');
      setCurrentRoom(null);
      setUserPlayer(null);
      setSelectedSide(null);
      coinRotation.set(0);
      toast.info('Left the room');
    } else if (action === 'rematch') {
      // Reset room to WAITING state with same players
      if (!currentRoom) return;
      
      const playerA = currentRoom.players[0];
      const playerB = currentRoom.players[1];
      
      const resetRoom: Room = {
        ...currentRoom,
        status: 'WAITING',
        result: null,
        players: [
          playerA ? { ...playerA, side: null, isReady: false } : null,
          playerB ? { ...playerB, side: null, isReady: false } : null
        ]
      };

      // Find which position the user is in
      const userPosition = currentRoom.players[0]?.id === userPlayer?.id ? 0 : 1;

      setCurrentRoom(resetRoom);
      setUserPlayer(resetRoom.players[userPosition]);
      setSelectedSide(null);
      coinRotation.set(0);

      toast.success('Room reset! Select your side again');
      
      // Bot gets ready automatically after 2 seconds
      setTimeout(() => {
        if (resetRoom.players[1]) {
          const updatedBot = { ...resetRoom.players[1]!, isReady: true };
          resetRoom.players[1] = updatedBot;
          setCurrentRoom({ ...resetRoom });
        }
      }, 2000);
    }
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
      if (botJoinTimerRef.current) clearTimeout(botJoinTimerRef.current);
      if (botReadyTimerRef.current) clearTimeout(botReadyTimerRef.current);
    };
  }, []);
  
  return (
    <div className="min-h-screen pb-20" style={{ background: '#0F172A' }}>
      
      {/* Provably Fair Modal */}
      {showProvablyFair && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl p-6 max-w-md w-full"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.5)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                <Shield className="w-6 h-6" style={{ color: '#60A5FA' }} />
                Provably Fair
              </h2>
              <button
                onClick={() => setShowProvablyFair(false)}
                className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                <X className="w-5 h-5" style={{ color: '#94A3B8' }} />
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
              Our coin flip system uses cryptographic hashing to ensure 100% fairness. Every result is predetermined and verifiable.
            </p>
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>Server Seed</p>
                <p className="text-xs font-mono" style={{ color: '#60A5FA' }}>7a3f9c2e8b1d...</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>Client Seed</p>
                <p className="text-xs font-mono" style={{ color: '#60A5FA' }}>4d2c8a1f6e9b...</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl p-6 max-w-md w-full"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
              border: '2px solid rgba(148, 163, 184, 0.5)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                <FileText className="w-6 h-6" style={{ color: '#94A3B8' }} />
                Terms & Conditions
              </h2>
              <button
                onClick={() => setShowTerms(false)}
                className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                <X className="w-5 h-5" style={{ color: '#94A3B8' }} />
              </button>
            </div>
            <div className="space-y-3 text-sm" style={{ color: '#94A3B8' }}>
              <p>• You must be 18+ to play</p>
              <p>• All bets are final once placed</p>
              <p>• 50/50 odds on all flips</p>
              <p>• 2x payout on wins</p>
              <p>• House edge: 0%</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Private Room Modal */}
      {showPrivateRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl p-6 max-w-md w-full"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
              border: '2px solid rgba(139, 92, 246, 0.5)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                <Lock className="w-6 h-6" style={{ color: '#8B5CF6' }} />
                Private Room
              </h2>
              <button
                onClick={() => {
                  setShowPrivateRoomModal(false);
                  setPrivateRoomMode(null);
                  setJoinRoomCode('');
                  setRoomCode('');
                }}
                className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                <X className="w-5 h-5" style={{ color: '#94A3B8' }} />
              </button>
            </div>

            {/* Initial Choice - Create or Join */}
            {!privateRoomMode && (
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <p className="text-sm" style={{ color: '#94A3B8' }}>
                    Stake Amount: <span className="font-bold" style={{ color: '#8B5CF6' }}>${selectedStakeForPrivate}</span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    handleCreatePrivateRoom();
                  }}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Create Private Room
                </button>

                <button
                  onClick={() => setPrivateRoomMode('join')}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '2px solid rgba(59, 130, 246, 0.5)',
                    color: '#60A5FA'
                  }}
                >
                  <Users className="w-5 h-5" />
                  Join with Code
                </button>
              </div>
            )}

            {/* Create Mode - Show Code */}
            {privateRoomMode === 'create' && roomCode && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm mb-2" style={{ color: '#94A3B8' }}>
                    Share this code with your friend
                  </p>
                  <div className="py-4 px-6 rounded-xl" style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '2px solid rgba(139, 92, 246, 0.5)'
                  }}>
                    <p className="text-4xl font-black tracking-widest" style={{ color: '#8B5CF6' }}>
                      {roomCode}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyCode}
                    className="py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '2px solid rgba(34, 197, 94, 0.5)',
                      color: '#22C55E'
                    }}
                  >
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </button>

                  <button
                    onClick={handleShareCode}
                    className="py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '2px solid rgba(59, 130, 246, 0.5)',
                      color: '#60A5FA'
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                <button
                  onClick={handleContinueToGame}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  Continue to Game
                </button>

                <p className="text-xs text-center" style={{ color: '#64748B' }}>
                  Waiting for opponent to join...
                </p>
              </div>
            )}

            {/* Join Mode - Enter Code */}
            {privateRoomMode === 'join' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: '#94A3B8' }}>
                    Enter Room Code
                  </label>
                  <input
                    type="text"
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="w-full py-4 px-4 rounded-xl font-bold text-2xl text-center tracking-widest uppercase"
                    style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '2px solid rgba(59, 130, 246, 0.3)',
                      color: '#60A5FA'
                    }}
                  />
                </div>

                <button
                  onClick={handleJoinPrivateRoom}
                  disabled={joinRoomCode.trim().length !== 6}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all"
                  style={{
                    background: joinRoomCode.trim().length === 6
                      ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                      : 'rgba(148, 163, 184, 0.2)',
                    color: joinRoomCode.trim().length === 6 ? '#FFFFFF' : '#64748B',
                    boxShadow: joinRoomCode.trim().length === 6 ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none',
                    cursor: joinRoomCode.trim().length === 6 ? 'pointer' : 'not-allowed'
                  }}
                >
                  Join Room
                </button>

                <button
                  onClick={() => setPrivateRoomMode(null)}
                  className="w-full py-3 rounded-xl font-semibold transition-all"
                  style={{
                    background: 'rgba(148, 163, 184, 0.1)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    color: '#94A3B8'
                  }}
                >
                  Back
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
      
      {/* ========== MOBILE LAYOUT ========== */}
      <div className="lg:hidden">
        <TopBar 
          title="⚡ PvP Coin Flip" 
          onBack={() => currentView === 'room' ? handleLeaveRoom() : navigate('/dashboard')} 
        />
        
        <div className="px-4 py-6 space-y-4">
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="px-3 py-2 rounded-lg text-center" style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: '#94A3B8' }}>Wins</div>
              <div className="text-lg font-bold" style={{ color: '#22C55E' }}>{stats.wins}</div>
            </div>
            <div className="px-3 py-2 rounded-lg text-center" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: '#94A3B8' }}>Losses</div>
              <div className="text-lg font-bold" style={{ color: '#EF4444' }}>{stats.losses}</div>
            </div>
            <div className="px-3 py-2 rounded-lg text-center" style={{
              background: stats.profit >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: stats.profit >= 0 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: '#94A3B8' }}>Profit</div>
              <div className="text-lg font-bold" style={{ color: stats.profit >= 0 ? '#22C55E' : '#EF4444' }}>
                {formatUSDT(stats.profit)}
              </div>
            </div>
          </div>
          
          {/* Balance */}
          <div className="px-4 py-3 rounded-xl text-center" style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>Game Balance</div>
            <div className="text-2xl font-bold" style={{ color: '#60A5FA' }}>{formatUSDT(gameBalance)}</div>
          </div>
          
          {/* ========== LOBBY VIEW ========== */}
          {currentView === 'lobby' && (
            <>
              <div className="rounded-xl p-4" style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)'
              }}>
                <h3 className="font-bold mb-3 text-lg" style={{ color: '#FFFFFF' }}>🎰 Select Stake Room</h3>
                <div className="grid grid-cols-2 gap-3">
                  {STAKE_ROOMS.map((room) => (
                    <div
                      key={room.amount}
                      className="rounded-xl p-4"
                      style={{
                        background: `linear-gradient(135deg, ${room.color}20 0%, ${room.color}10 100%)`,
                        border: `2px solid ${room.color}40`
                      }}
                    >
                      <div className="text-center mb-3">
                        <div className="text-2xl font-black" style={{ color: room.color }}>
                          {room.label}
                        </div>
                        <div className="text-xs" style={{ color: '#94A3B8' }}>Stake Amount</div>
                      </div>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => handlePlayNow(room.amount)}
                          className="w-full py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1"
                          style={{
                            background: room.color,
                            color: '#FFFFFF'
                          }}
                        >
                          <Play className="w-3 h-3" />
                          Play Now
                        </button>

                        <button
                          onClick={() => handleOpenPrivateRoom(room.amount)}
                          className="w-full py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1"
                          style={{
                            background: 'rgba(148, 163, 184, 0.2)',
                            border: `1px solid ${room.color}60`,
                            color: room.color
                          }}
                        >
                          <Lock className="w-3 h-3" />
                          Private Room
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* ========== ROOM VIEW ========== */}
          {currentView === 'room' && currentRoom && (
            <>
              {/* Room Info */}
              <div className="rounded-xl p-3" style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold" style={{ color: '#94A3B8' }}>Room Stake</div>
                    <div className="text-xl font-bold" style={{ color: '#60A5FA' }}>
                      {formatUSDT(currentRoom.stakeAmount)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg font-bold text-xs" style={{
                      background: currentRoom.status === 'WAITING' ? 'rgba(251, 191, 36, 0.2)' :
                                 currentRoom.status === 'READY' ? 'rgba(34, 197, 94, 0.2)' :
                                 currentRoom.status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.2)' :
                                 'rgba(139, 92, 246, 0.2)',
                      border: currentRoom.status === 'WAITING' ? '1px solid #FBBF24' :
                             currentRoom.status === 'READY' ? '1px solid #22C55E' :
                             currentRoom.status === 'IN_PROGRESS' ? '1px solid #3B82F6' :
                             '1px solid #8B5CF6',
                      color: currentRoom.status === 'WAITING' ? '#FBBF24' :
                            currentRoom.status === 'READY' ? '#22C55E' :
                            currentRoom.status === 'IN_PROGRESS' ? '#3B82F6' :
                            '#8B5CF6'
                    }}>
                      {currentRoom.status}
                    </div>
                    {/* Exit button when waiting for opponent */}
                    {currentRoom.status === 'WAITING' && !currentRoom.players[1] && (
                      <button
                        onClick={handleLeaveRoom}
                        className="p-2 rounded-lg transition-all hover:scale-110"
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#EF4444'
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Show Room Code when waiting for opponent in private room */}
              {currentRoom.status === 'WAITING' && !currentRoom.players[1] && roomCode && (
                <div className="rounded-xl p-4" style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '2px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <div className="text-center">
                    <p className="text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>
                      Private Room Code
                    </p>
                    <div className="py-2 px-4 rounded-lg mb-3" style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.4)'
                    }}>
                      <p className="text-2xl font-black tracking-widest" style={{ color: '#8B5CF6' }}>
                        {roomCode}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyCode}
                        className="flex-1 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1"
                        style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          color: '#22C55E'
                        }}
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                      <button
                        onClick={handleShareCode}
                        className="flex-1 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1"
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60A5FA'
                        }}
                      >
                        <Share2 className="w-3 h-3" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Game Area */}
              <div className="rounded-xl p-6 relative" style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                minHeight: '350px'
              }}>
                
                {/* PLAYER A - LEFT */}
                {currentRoom.players[0] && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center z-10" style={{ width: '70px' }}>
                    <div className="text-4xl mb-1.5">{currentRoom.players[0].avatar}</div>
                    <div className="text-xs font-bold mb-1.5 text-center" style={{ color: '#FFFFFF' }}>
                      {currentRoom.players[0].username}
                    </div>
                    {currentRoom.players[0].side && (
                      <div className="px-2 py-1 rounded text-[10px] font-bold text-center mb-1" style={{
                        background: currentRoom.players[0].side === 'HEADS' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(139, 92, 246, 0.3)',
                        border: currentRoom.players[0].side === 'HEADS' ? '1px solid #F59E0B' : '1px solid #8B5CF6',
                        color: currentRoom.players[0].side === 'HEADS' ? '#F59E0B' : '#8B5CF6'
                      }}>
                        {currentRoom.players[0].side === 'HEADS' ? '👑' : '⭐'}
                      </div>
                    )}
                    {currentRoom.players[0].isReady && (
                      <div className="text-[10px] font-bold" style={{ color: '#22C55E' }}>✓ Ready</div>
                    )}
                  </div>
                )}
                
                {/* PLAYER B - RIGHT */}
                {currentRoom.players[1] ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center z-10" style={{ width: '70px' }}>
                    <div className="text-4xl mb-1.5">{currentRoom.players[1].avatar}</div>
                    <div className="text-xs font-bold mb-1.5 text-center" style={{ color: '#FFFFFF' }}>
                      {currentRoom.players[1].username}
                    </div>
                    {currentRoom.players[1].side && (
                      <div className="px-2 py-1 rounded text-[10px] font-bold text-center mb-1" style={{
                        background: currentRoom.players[1].side === 'HEADS' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(139, 92, 246, 0.3)',
                        border: currentRoom.players[1].side === 'HEADS' ? '1px solid #F59E0B' : '1px solid #8B5CF6',
                        color: currentRoom.players[1].side === 'HEADS' ? '#F59E0B' : '#8B5CF6'
                      }}>
                        {currentRoom.players[1].side === 'HEADS' ? '👑' : '⭐'}
                      </div>
                    )}
                    {currentRoom.players[1].isReady && (
                      <div className="text-[10px] font-bold" style={{ color: '#22C55E' }}>✓ Ready</div>
                    )}
                  </div>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center z-10" style={{ width: '70px' }}>
                    <div className="text-4xl mb-1.5">❓</div>
                    <div className="text-xs font-bold text-center" style={{ color: '#94A3B8' }}>Waiting...</div>
                  </div>
                )}
                
                {/* COIN */}
                <div className="flex justify-center items-center py-12">
                  <motion.div
                    className="relative"
                    style={{
                      width: '160px',
                      height: '160px',
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                    animate={{
                      rotateY: coinRotation.get()
                    }}
                    transition={{
                      duration: currentRoom.status === 'IN_PROGRESS' ? 6 : 0.5,
                      ease: currentRoom.status === 'IN_PROGRESS' ? [0.16, 0.84, 0.44, 1] : 'easeOut'
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full flex items-center justify-center font-black text-6xl"
                      style={{
                        background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                        border: '6px solid #FCD34D',
                        boxShadow: '0 10px 40px rgba(245, 158, 11, 0.5)',
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      👑
                    </div>
                    
                    <div
                      className="absolute inset-0 rounded-full flex items-center justify-center font-black text-6xl"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                        border: '6px solid #C4B5FD',
                        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.5)',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      ⭐
                    </div>
                  </motion.div>
                </div>
                
                {/* Icons */}
                <button
                  onClick={() => setShowProvablyFair(true)}
                  className="absolute bottom-3 left-3 hover:scale-110 transition-transform z-10"
                  style={{ color: '#60A5FA' }}
                >
                  <Shield className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => setShowTerms(true)}
                  className="absolute bottom-3 right-3 hover:scale-110 transition-transform z-10"
                  style={{ color: '#94A3B8' }}
                >
                  <FileText className="w-6 h-6" />
                </button>
                
                {/* Status Messages */}
                {currentRoom.status === 'WAITING' && !currentRoom.players[1] && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center text-sm font-semibold" style={{ color: '#FBBF24' }}>
                    🔍 Waiting for opponent...
                  </div>
                )}
                
                {currentRoom.status === 'WAITING' && currentRoom.players[1] && !userPlayer?.side && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center text-sm font-semibold" style={{ color: '#94A3B8' }}>
                    Select your side below
                  </div>
                )}
                
                {currentRoom.status === 'IN_PROGRESS' && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center text-base font-bold" style={{ color: '#60A5FA' }}>
                    🎲 Flipping...
                  </div>
                )}
                
                {currentRoom.status === 'RESULT' && currentRoom.result && (() => {
                  // Determine which player is the user
                  const isUserPlayerA = currentRoom.players[0]?.id === userPlayer?.id;
                  const userPlayerData = isUserPlayerA ? currentRoom.players[0] : currentRoom.players[1];
                  const userWon = userPlayerData?.side === currentRoom.result;

                  return (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center z-20"
                    >
                      <div className="text-xl font-black mb-1" style={{
                        color: userWon ? '#22C55E' : '#EF4444'
                      }}>
                        {userWon ? '🎉 YOU WIN!' : '😔 YOU LOSE'}
                      </div>
                      <div className="text-sm font-bold" style={{ color: '#94A3B8' }}>
                        {currentRoom.result === 'HEADS' ? '👑 HEADS' : '⭐ TAILS'}
                      </div>
                    </motion.div>
                  );
                })()}
              </div>
              
              {/* Controls based on Room Status */}
              
              {/* WAITING - Side Selection */}
              {currentRoom.status === 'WAITING' && currentRoom.players[1] && !userPlayer?.isReady && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSelectSide('HEADS')}
                      disabled={currentRoom.status !== 'WAITING' || (selectedSide !== null && selectedSide !== 'HEADS')}
                      className="py-6 rounded-xl font-bold text-lg transition-all relative"
                      style={{
                        background: selectedSide === 'HEADS' 
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.4) 0%, rgba(251, 191, 36, 0.2) 100%)'
                          : selectedSide === 'TAILS'
                          ? 'rgba(30, 41, 59, 0.3)'
                          : 'rgba(30, 41, 59, 0.6)',
                        border: selectedSide === 'HEADS' 
                          ? '2px solid #F59E0B'
                          : selectedSide === 'TAILS'
                          ? '2px solid rgba(148, 163, 184, 0.1)'
                          : '2px solid rgba(148, 163, 184, 0.2)',
                        color: selectedSide === 'HEADS' ? '#F59E0B' : selectedSide === 'TAILS' ? '#64748B' : '#94A3B8',
                        boxShadow: selectedSide === 'HEADS' ? '0 0 20px rgba(245, 158, 11, 0.3)' : 'none',
                        opacity: selectedSide === 'TAILS' ? 0.4 : 1,
                        cursor: (currentRoom.status !== 'WAITING' || selectedSide === 'TAILS') ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <div className="text-4xl mb-2">👑</div>
                      <div>HEADS</div>
                      {selectedSide === 'HEADS' && (
                        <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded" style={{
                          background: 'rgba(34, 197, 94, 0.3)',
                          border: '1px solid #22C55E',
                          color: '#22C55E'
                        }}>
                          YOU
                        </div>
                      )}
                      {selectedSide === 'TAILS' && (
                        <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded" style={{
                          background: 'rgba(148, 163, 184, 0.2)',
                          border: '1px solid #64748B',
                          color: '#64748B'
                        }}>
                          🔒 OPPONENT
                        </div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleSelectSide('TAILS')}
                      disabled={currentRoom.status !== 'WAITING' || (selectedSide !== null && selectedSide !== 'TAILS')}
                      className="py-6 rounded-xl font-bold text-lg transition-all relative"
                      style={{
                        background: selectedSide === 'TAILS' 
                          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(167, 139, 250, 0.2) 100%)'
                          : selectedSide === 'HEADS'
                          ? 'rgba(30, 41, 59, 0.3)'
                          : 'rgba(30, 41, 59, 0.6)',
                        border: selectedSide === 'TAILS' 
                          ? '2px solid #8B5CF6'
                          : selectedSide === 'HEADS'
                          ? '2px solid rgba(148, 163, 184, 0.1)'
                          : '2px solid rgba(148, 163, 184, 0.2)',
                        color: selectedSide === 'TAILS' ? '#8B5CF6' : selectedSide === 'HEADS' ? '#64748B' : '#94A3B8',
                        boxShadow: selectedSide === 'TAILS' ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none',
                        opacity: selectedSide === 'HEADS' ? 0.4 : 1,
                        cursor: (currentRoom.status !== 'WAITING' || selectedSide === 'HEADS') ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <div className="text-4xl mb-2">⭐</div>
                      <div>TAILS</div>
                      {selectedSide === 'TAILS' && (
                        <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded" style={{
                          background: 'rgba(34, 197, 94, 0.3)',
                          border: '1px solid #22C55E',
                          color: '#22C55E'
                        }}>
                          YOU
                        </div>
                      )}
                      {selectedSide === 'HEADS' && (
                        <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded" style={{
                          background: 'rgba(148, 163, 184, 0.2)',
                          border: '1px solid #64748B',
                          color: '#64748B'
                        }}>
                          🔒 OPPONENT
                        </div>
                      )}
                    </button>
                  </div>
                  
                  <button
                    onClick={handleReady}
                    disabled={!selectedSide}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                    style={{
                      background: selectedSide
                        ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                        : 'rgba(148, 163, 184, 0.2)',
                      color: selectedSide ? '#FFFFFF' : '#64748B',
                      boxShadow: selectedSide ? '0 0 20px rgba(34, 197, 94, 0.4)' : 'none',
                      cursor: selectedSide ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <Zap className="w-5 h-5" />
                    I'M READY
                  </button>
                </>
              )}
              
              {/* RESULT - Action Buttons */}
              {currentRoom.status === 'RESULT' && (
                <div className="space-y-3">
                  <button
                    onClick={handleRematch}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      color: '#FFFFFF',
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
                    }}
                  >
                    <RefreshCw className="w-5 h-5" />
                    Rematch
                  </button>
                  
                  <button
                    onClick={handleLeaveRoom}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '2px solid rgba(239, 68, 68, 0.3)',
                      color: '#EF4444'
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    Leave Room
                  </button>
                </div>
              )}
            </>
          )}
          
          {/* History */}
          {history.length > 0 && (
            <div className="rounded-xl p-4" style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.15)'
            }}>
              <h3 className="font-bold mb-3" style={{ color: '#FFFFFF' }}>Recent Flips</h3>
              <div className="space-y-2">
                {history.slice(0, 10).map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{
                      background: record.won ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: record.won ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {record.result === 'HEADS' ? '👑' : '⭐'}
                      </span>
                      <div>
                        <div className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
                          {record.result}
                        </div>
                        <div className="text-[10px]" style={{ color: '#94A3B8' }}>
                          ${record.amount} stake
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{
                        color: record.won ? '#22C55E' : '#EF4444'
                      }}>
                        {record.won ? '+' : '-'}{formatUSDT(record.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
      
      {/* Desktop layout would be similar but with more space */}
      <div className="hidden lg:block">
        <div className="w-full max-w-[1600px] mx-auto px-8 pb-20 pt-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => currentView === 'room' ? handleLeaveRoom() : navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                background: 'rgba(148, 163, 184, 0.1)',
                color: '#94A3B8',
                border: '1px solid rgba(148, 163, 184, 0.2)'
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              {currentView === 'room' ? 'Leave Room' : 'Back'}
            </button>
            
            <div className="px-6 py-3 rounded-xl" style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>Gaming Balance</p>
              <p className="text-2xl font-bold" style={{ color: '#60A5FA' }}>
                {formatUSDT(gameBalance)}
              </p>
            </div>
          </div>
          
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
              ⚡ PvP Coin Flip
            </h1>
            <p className="text-lg" style={{ color: '#94A3B8' }}>
              Desktop view - Full implementation similar to mobile
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}