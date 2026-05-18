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
  username: string;
  email: string;
  phoneNumber: string;
  profilePhoto: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  documentVerified: boolean;
  walletAddress: string;
  walletVerified: boolean;
  memberSince: string;
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
  setUsername: (username: string) => void;
  setEmail: (email: string) => void;
  setPhoneNumber: (phone: string) => void;
  setProfilePhoto: (photo: string) => void;
  setEmailVerified: (verified: boolean) => void;
  setPhoneVerified: (verified: boolean) => void;
  setTwoFactorEnabled: (enabled: boolean) => void;
  setDocumentVerified: (verified: boolean) => void;
  setWalletAddress: (address: string) => void;
  setWalletVerified: (verified: boolean) => void;
  setMemberSince: (date: string) => void;
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
  setPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState(0);
  const [gameBalance, setGameBalance] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [advertiseBalance, setAdvertiseBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(0);
  const [isVIP, setIsVIP] = useState(false);
  const [vipLevel, setVipLevelState] = useState<0 | 1 | 2 | 3>(0);
  const [vipProgress, setVipProgress] = useState(0);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark'); // Force dark mode permanently
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('wagxa_username') || '';
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('wagxa_email') || '';
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [documentVerified, setDocumentVerified] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletVerified, setWalletVerified] = useState(false);
  const [memberSince, setMemberSince] = useState(() => {
    const saved = localStorage.getItem('wagxa_member_since');
    return saved || '';
  });
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

  // Load all data from localStorage on mount
  useEffect(() => {
    try {
      const savedBalance = localStorage.getItem('wagxa_balance');
      const savedGameBalance = localStorage.getItem('wagxa_game_balance');
      const savedUsdtBalance = localStorage.getItem('wagxa_usdt_balance');
      const savedAdvertiseBalance = localStorage.getItem('wagxa_advertise_balance');
      const savedReferralBalance = localStorage.getItem('wagxa_referral_balance');
      const savedTransactions = localStorage.getItem('wagxa_transactions');
      const savedIsVIP = localStorage.getItem('wagxa_is_vip');
      const savedVipLevel = localStorage.getItem('wagxa_vip_level');
      const savedVipProgress = localStorage.getItem('wagxa_vip_progress');
      const savedIsAgeVerified = localStorage.getItem('wagxa_age_verified');
      const savedHasPin = localStorage.getItem('wagxa_has_pin');
      const savedUsername = localStorage.getItem('wagxa_username');
      const savedEmail = localStorage.getItem('wagxa_email');
      const savedPhoneNumber = localStorage.getItem('wagxa_phone_number');
      const savedProfilePhoto = localStorage.getItem('wagxa_profile_photo');
      const savedEmailVerified = localStorage.getItem('wagxa_email_verified');
      const savedPhoneVerified = localStorage.getItem('wagxa_phone_verified');
      const savedTwoFactorEnabled = localStorage.getItem('wagxa_two_factor_enabled');
      const savedDocumentVerified = localStorage.getItem('wagxa_document_verified');
      const savedWalletAddress = localStorage.getItem('wagxa_wallet_address');
      const savedWalletVerified = localStorage.getItem('wagxa_wallet_verified');
      const savedUserWallets = localStorage.getItem('wagxa_user_wallets');
      const savedDefaultWallet = localStorage.getItem('wagxa_default_wallet');

      if (savedBalance) setBalanceState(parseFloat(savedBalance));
      if (savedGameBalance) setGameBalance(parseFloat(savedGameBalance));
      if (savedUsdtBalance) setUsdtBalance(parseFloat(savedUsdtBalance));
      if (savedAdvertiseBalance) setAdvertiseBalance(parseFloat(savedAdvertiseBalance));
      if (savedReferralBalance) setReferralBalance(parseFloat(savedReferralBalance));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedIsVIP) setIsVIP(savedIsVIP === 'true');
      if (savedVipLevel) setVipLevelState(parseInt(savedVipLevel) as 0 | 1 | 2 | 3);
      if (savedVipProgress) setVipProgress(parseFloat(savedVipProgress));
      if (savedIsAgeVerified) setIsAgeVerified(savedIsAgeVerified === 'true');
      if (savedHasPin) setHasPin(savedHasPin === 'true');
      if (savedUsername) setUsername(savedUsername);
      if (savedEmail) setEmail(savedEmail);
      if (savedPhoneNumber) setPhoneNumber(savedPhoneNumber);
      if (savedProfilePhoto) setProfilePhoto(savedProfilePhoto);
      if (savedEmailVerified) setEmailVerified(savedEmailVerified === 'true');
      if (savedPhoneVerified) setPhoneVerified(savedPhoneVerified === 'true');
      if (savedTwoFactorEnabled) setTwoFactorEnabled(savedTwoFactorEnabled === 'true');
      if (savedDocumentVerified) setDocumentVerified(savedDocumentVerified === 'true');
      if (savedWalletAddress) setWalletAddress(savedWalletAddress);
      if (savedWalletVerified) setWalletVerified(savedWalletVerified === 'true');
      if (savedUserWallets) setUserWallets(JSON.parse(savedUserWallets));
      if (savedDefaultWallet) setDefaultWallet(JSON.parse(savedDefaultWallet));
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

  useEffect(() => {
    localStorage.setItem('wagxa_is_vip', isVIP.toString());
  }, [isVIP]);

  useEffect(() => {
    localStorage.setItem('wagxa_vip_level', vipLevel.toString());
  }, [vipLevel]);

  useEffect(() => {
    localStorage.setItem('wagxa_vip_progress', vipProgress.toString());
  }, [vipProgress]);

  useEffect(() => {
    localStorage.setItem('wagxa_age_verified', isAgeVerified.toString());
  }, [isAgeVerified]);

  useEffect(() => {
    localStorage.setItem('wagxa_has_pin', hasPin.toString());
  }, [hasPin]);

  useEffect(() => {
    localStorage.setItem('wagxa_user_wallets', JSON.stringify(userWallets));
  }, [userWallets]);

  useEffect(() => {
    localStorage.setItem('wagxa_default_wallet', JSON.stringify(defaultWallet));
  }, [defaultWallet]);

  useEffect(() => {
    localStorage.setItem('wagxa_username', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('wagxa_email', email);
  }, [email]);

  useEffect(() => {
    localStorage.setItem('wagxa_phone_number', phoneNumber);
  }, [phoneNumber]);

  useEffect(() => {
    localStorage.setItem('wagxa_profile_photo', profilePhoto);
  }, [profilePhoto]);

  useEffect(() => {
    localStorage.setItem('wagxa_email_verified', emailVerified.toString());
  }, [emailVerified]);

  useEffect(() => {
    localStorage.setItem('wagxa_phone_verified', phoneVerified.toString());
  }, [phoneVerified]);

  useEffect(() => {
    localStorage.setItem('wagxa_two_factor_enabled', twoFactorEnabled.toString());
  }, [twoFactorEnabled]);

  useEffect(() => {
    localStorage.setItem('wagxa_document_verified', documentVerified.toString());
  }, [documentVerified]);

  useEffect(() => {
    localStorage.setItem('wagxa_wallet_address', walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    localStorage.setItem('wagxa_wallet_verified', walletVerified.toString());
  }, [walletVerified]);

  useEffect(() => {
    localStorage.setItem('wagxa_member_since', memberSince);
  }, [memberSince]);

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

  const setPin = (pin: string) => {
    localStorage.setItem('wagxa_pin', pin);
    setHasPin(true);
  };

  const verifyPin = (pin: string): boolean => {
    const storedPin = localStorage.getItem('wagxa_pin');
    return storedPin === pin;
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
        username,
        email,
        phoneNumber,
        profilePhoto,
        emailVerified,
        phoneVerified,
        twoFactorEnabled,
        documentVerified,
        walletAddress,
        walletVerified,
        memberSince,
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
        setUsername,
        setEmail,
        setPhoneNumber,
        setProfilePhoto,
        setEmailVerified,
        setPhoneVerified,
        setTwoFactorEnabled,
        setDocumentVerified,
        setWalletAddress,
        setWalletVerified,
        setMemberSince,
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
        setPin,
        verifyPin,
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