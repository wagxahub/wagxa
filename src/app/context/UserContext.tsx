import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UserContextType {
  balance: number;
  gameBalance: number;
  usdtBalance: number;
  advertiseBalance: number;
  referralBalance: number;
  isVIP: boolean;
  vipLevel: 0 | 1 | 2 | 3;
  vipProgress: number; // Progress to next level (0-100)
  isAgeVerified: boolean;
  hasPin: boolean;
  theme: 'light' | 'dark';
  userWallets: Array<{ address: string; network: string }>;
  defaultWallet: { address: string; network: string } | null;
  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    status: string;
    icon: string;
    type: 'deposit' | 'withdraw' | 'transfer' | 'game';
  }>;
  setBalance: (balance: number) => void;
  setGameBalance: (balance: number) => void;
  setUsdtBalance: (balance: number) => void;
  setAdvertiseBalance: (balance: number) => void;
  setReferralBalance: (balance: number) => void;
  setIsVIP: (isVIP: boolean) => void;
  setVipLevel: (level: 0 | 1 | 2 | 3) => void;
  setVipProgress: (progress: number) => void;
  setIsAgeVerified: (verified: boolean) => void;
  setHasPin: (hasPin: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateBalance: (amount: number) => void;
  updateGameBalance: (amount: number) => void;
  updateUsdtBalance: (amount: number) => void;
  updateAdvertiseBalance: (amount: number) => void;
  updateReferralBalance: (amount: number) => void;
  addTransaction: (transaction: {
    description: string;
    amount: number;
    status: string;
    icon: string;
    type: 'deposit' | 'withdraw' | 'transfer' | 'game';
  }) => void;
  formatCurrency: (amount: number) => string;
  formatUSDT: (amount: number) => string;
  addWallet: (wallet: { address: string; network: string }) => void;
  setDefaultWallet: (wallet: { address: string; network: string } | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState(0);
  const [gameBalance, setGameBalance] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [advertiseBalance, setAdvertiseBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(3500);
  const [isVIP, setIsVIP] = useState(false);
  const [vipLevel, setVipLevelState] = useState<0 | 1 | 2 | 3>(0);
  const [vipProgress, setVipProgress] = useState(0);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark'); // Force dark mode permanently
  const [userWallets, setUserWallets] = useState<Array<{ address: string; network: string }>>([]);
  const [defaultWallet, setDefaultWallet] = useState<{ address: string; network: string } | null>(null);
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    status: string;
    icon: string;
    type: 'deposit' | 'withdraw' | 'transfer' | 'game';
  }>>([]);

  // Update VIP level and reset progress
  const setVipLevel = (level: 0 | 1 | 2 | 3) => {
    setVipLevelState(level);
    setVipProgress(0); // Reset progress when leveling up
  };

  // Force dark mode on mount
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');

    // Remove light theme if it exists
    root.classList.remove('light-theme');
  }, []);

  // Load balances from localStorage on mount
  useEffect(() => {
    try {
      const savedBalance = localStorage.getItem('wagxa_balance');
      const savedGameBalance = localStorage.getItem('wagxa_game_balance');
      const savedUsdtBalance = localStorage.getItem('wagxa_usdt_balance');
      const savedAdvertiseBalance = localStorage.getItem('wagxa_advertise_balance');
      const savedReferralBalance = localStorage.getItem('wagxa_referral_balance');
      const savedTransactions = localStorage.getItem('wagxa_transactions');

      if (savedBalance) setBalanceState(parseFloat(savedBalance));
      if (savedGameBalance) setGameBalance(parseFloat(savedGameBalance));
      if (savedUsdtBalance) setUsdtBalance(parseFloat(savedUsdtBalance));
      if (savedAdvertiseBalance) setAdvertiseBalance(parseFloat(savedAdvertiseBalance));
      if (savedReferralBalance) setReferralBalance(parseFloat(savedReferralBalance));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    } catch (e) {
      // Silently handle error
    }
  }, []);

  // Save balances to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('wagxa_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('wagxa_game_balance', gameBalance.toString());
  }, [gameBalance]);

  useEffect(() => {
    localStorage.setItem('wagxa_usdt_balance', usdtBalance.toString());
  }, [usdtBalance]);

  useEffect(() => {
    localStorage.setItem('wagxa_advertise_balance', advertiseBalance.toString());
  }, [advertiseBalance]);

  useEffect(() => {
    localStorage.setItem('wagxa_referral_balance', referralBalance.toString());
  }, [referralBalance]);

  useEffect(() => {
    localStorage.setItem('wagxa_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Listen for bonus completion events
  useEffect(() => {
    const handleBonusCompleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { amount } = customEvent.detail;

      // Transfer bonus to main balance
      setBalanceState(prev => prev + amount);

      // Add to transaction history
      const newTransaction = {
        id: Date.now().toString(),
        description: `Bonus Converted to Main Balance - $${amount.toFixed(2)}`,
        amount: amount,
        date: new Date().toLocaleDateString(),
        status: 'completed',
        icon: '✅',
        type: 'transfer' as const
      };
      setTransactions(prev => [newTransaction, ...prev]);
    };

    window.addEventListener('bonusCompleted', handleBonusCompleted);

    return () => {
      window.removeEventListener('bonusCompleted', handleBonusCompleted);
    };
  }, []);

  const setBalance = (newBalance: number) => {
    setBalanceState(newBalance);
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  };

  const updateBalance = (amount: number) => {
    setBalanceState(prev => prev + amount);
  };

  const updateGameBalance = (amount: number) => {
    setGameBalance(prev => prev + amount);
  };

  const updateUsdtBalance = (amount: number) => {
    setUsdtBalance(prev => prev + amount);
  };

  const updateAdvertiseBalance = (amount: number) => {
    setAdvertiseBalance(prev => prev + amount);
  };

  const updateReferralBalance = (amount: number) => {
    setReferralBalance(prev => prev + amount);
  };

  const formatCurrency = (amount: number): string => {
    // Remove .00 from all balances
    const roundedAmount = Math.floor(amount);
    return `$${roundedAmount.toLocaleString('en-US')}`;
  };

  const formatUSDT = (amount: number): string => {
    const roundedAmount = Math.floor(amount);
    return `$${roundedAmount.toLocaleString('en-US')}`;
  };

  const addWallet = (wallet: { address: string; network: string }) => {
    setUserWallets(prev => [...prev, wallet]);
  };

  const addTransaction = (transaction: {
    description: string;
    amount: number;
    status: string;
    icon: string;
    type: 'deposit' | 'withdraw' | 'transfer' | 'game';
  }) => {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const newTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: transaction.description,
      amount: transaction.amount,
      date: dateString,
      status: transaction.status,
      icon: transaction.icon,
      type: transaction.type,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  return (
    <UserContext.Provider
      value={{
        balance,
        gameBalance,
        usdtBalance,
        advertiseBalance,
        referralBalance,
        isVIP,
        vipLevel,
        vipProgress,
        isAgeVerified,
        hasPin,
        theme,
        setBalance,
        setGameBalance,
        setUsdtBalance,
        setAdvertiseBalance,
        setReferralBalance,
        setIsVIP,
        setVipLevel,
        setVipProgress,
        setIsAgeVerified,
        setHasPin,
        setTheme,
        updateBalance,
        updateGameBalance,
        updateUsdtBalance,
        updateAdvertiseBalance,
        updateReferralBalance,
        addTransaction,
        formatCurrency,
        formatUSDT,
        userWallets,
        defaultWallet,
        addWallet,
        setDefaultWallet,
        transactions,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}