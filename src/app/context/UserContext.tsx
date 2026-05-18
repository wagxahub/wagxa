import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import type { UserProfile, UserBalances, UserSecurity } from '@/lib/supabase';

interface UserContextType {
  balance: number;
  gameBalance: number;
  usdtBalance: number;
  advertiseBalance: number;
  referralBalance: number;
  isVIP: boolean;
  vipLevel: 0 | 1 | 2 | 3;
  vipProgress: number;
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
  currencyPreference: 'usd' | 'ngn';
  loading: boolean;
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
  formatCurrency: (amount: number, hideDecimals?: boolean) => string;
  formatUSDT: (amount: number) => string;
  addWallet: (wallet: { address: string; network: string }) => void;
  setDefaultWallet: (wallet: { address: string; network: string } | null) => void;
  setPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // Profile state
  const [username, setUsernameState] = useState('');
  const [email, setEmailState] = useState('');
  const [phoneNumber, setPhoneNumberState] = useState('');
  const [profilePhoto, setProfilePhotoState] = useState('👤');
  const [vipLevel, setVipLevelState] = useState<0 | 1 | 2 | 3>(0);
  const [vipProgress, setVipProgress] = useState(0);
  const [memberSince, setMemberSinceState] = useState('');

  // Balance state
  const [balance, setBalanceState] = useState(0);
  const [gameBalance, setGameBalanceState] = useState(0);
  const [usdtBalance, setUsdtBalanceState] = useState(0);
  const [advertiseBalance, setAdvertiseBalanceState] = useState(0);
  const [referralBalance, setReferralBalanceState] = useState(0);

  // Security state
  const [hasPin, setHasPinState] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabledState] = useState(false);

  // Other state
  const [isVIP, setIsVIP] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [documentVerified, setDocumentVerified] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletVerified, setWalletVerified] = useState(false);
  const [userWallets, setUserWallets] = useState<Array<{ address: string; network: string }>>([]);
  const [defaultWallet, setDefaultWallet] = useState<{ address: string; network: string } | null>(null);
  const [transactions, setTransactions] = useState<Array<any>>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currencyPreference, setCurrencyPreference] = useState<'usd' | 'ngn'>('usd');

  // Load user data from Supabase when authenticated
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // User logged out - clear data
      clearUserData();
      setLoading(false);
      return;
    }

    // User logged in - fetch data
    loadUserData(user.id);
  }, [user, authLoading]);

  const clearUserData = () => {
    setUsernameState('');
    setEmailState('');
    setPhoneNumberState('');
    setProfilePhotoState('👤');
    setVipLevelState(0);
    setVipProgress(0);
    setBalanceState(0);
    setGameBalanceState(0);
    setUsdtBalanceState(0);
    setAdvertiseBalanceState(0);
    setReferralBalanceState(0);
    setHasPinState(false);
    setTwoFactorEnabledState(false);
  };

  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setUsernameState(profile.username);
        setEmailState(profile.email || '');
        setPhoneNumberState(profile.phone || '');
        setProfilePhotoState(profile.avatar);
        setVipLevelState(profile.vip_tier as 0 | 1 | 2 | 3);
        setMemberSinceState(profile.created_at);
      }

      // Fetch balances
      const { data: balances } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (balances) {
        setBalanceState(parseFloat(balances.main_balance.toString()));
        setGameBalanceState(parseFloat(balances.game_balance.toString()));
        setReferralBalanceState(parseFloat(balances.referral_balance.toString()));
        setAdvertiseBalanceState(parseFloat(balances.advertiser_balance.toString()));
        setUsdtBalanceState(parseFloat(balances.main_balance.toString())); // Same as main
      }

      // Fetch security settings
      const { data: security } = await supabase
        .from('user_security')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (security) {
        setHasPinState(!!security.pin_hash);
        setTwoFactorEnabledState(security.two_fa_enabled);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  // Update balances in Supabase
  const updateSupabaseBalances = async (balanceUpdates: Partial<UserBalances>) => {
    if (!user) return;

    try {
      await supabase
        .from('user_balances')
        .update(balanceUpdates)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  };

  // Update profile in Supabase
  const updateSupabaseProfile = async (profileUpdates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      await supabase
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Balance setters with Supabase sync
  const setBalance = (newBalance: number) => {
    setBalanceState(newBalance);
    updateSupabaseBalances({ main_balance: newBalance });
  };

  const setGameBalance = (newBalance: number) => {
    setGameBalanceState(newBalance);
    updateSupabaseBalances({ game_balance: newBalance });
  };

  const setAdvertiseBalance = (newBalance: number) => {
    setAdvertiseBalanceState(newBalance);
    updateSupabaseBalances({ advertiser_balance: newBalance });
  };

  const setReferralBalance = (newBalance: number) => {
    setReferralBalanceState(newBalance);
    updateSupabaseBalances({ referral_balance: newBalance });
  };

  const setUsdtBalance = (newBalance: number) => {
    setUsdtBalanceState(newBalance);
    updateSupabaseBalances({ main_balance: newBalance });
  };

  // Update functions
  const updateBalance = (amount: number) => setBalance(balance + amount);
  const updateGameBalance = (amount: number) => setGameBalance(gameBalance + amount);
  const updateAdvertiseBalance = (amount: number) => setAdvertiseBalance(advertiseBalance + amount);
  const updateReferralBalance = (amount: number) => setReferralBalance(referralBalance + amount);
  const updateUsdtBalance = (amount: number) => setUsdtBalance(usdtBalance + amount);

  // Profile setters with Supabase sync
  const setUsername = (newUsername: string) => {
    setUsernameState(newUsername);
    updateSupabaseProfile({ username: newUsername });
  };

  const setEmail = (newEmail: string) => {
    setEmailState(newEmail);
    updateSupabaseProfile({ email: newEmail });
  };

  const setPhoneNumber = (newPhone: string) => {
    setPhoneNumberState(newPhone);
    updateSupabaseProfile({ phone: newPhone });
  };

  const setProfilePhoto = (newPhoto: string) => {
    setProfilePhotoState(newPhoto);
    updateSupabaseProfile({ avatar: newPhoto });
  };

  const setVipLevel = (level: 0 | 1 | 2 | 3) => {
    setVipLevelState(level);
    setVipProgress(0);
    updateSupabaseProfile({ vip_tier: level });
  };

  const setMemberSince = (date: string) => {
    setMemberSinceState(date);
  };

  // Security setters
  const setHasPin = (value: boolean) => {
    setHasPinState(value);
  };

  const setTwoFactorEnabled = (enabled: boolean) => {
    setTwoFactorEnabledState(enabled);
    if (user) {
      supabase
        .from('user_security')
        .update({ two_fa_enabled: enabled })
        .eq('user_id', user.id);
    }
  };

  // PIN functions (using localStorage for now - could be moved to Supabase with hashing)
  const setPin = (pin: string) => {
    localStorage.setItem('wagxa_pin', pin);
    setHasPin(true);
    if (user) {
      // In production, hash the PIN before storing
      supabase
        .from('user_security')
        .update({ pin_hash: pin }) // Should be hashed!
        .eq('user_id', user.id);
    }
  };

  const verifyPin = (pin: string): boolean => {
    const stored = localStorage.getItem('wagxa_pin');
    return stored === pin;
  };

  // Other functions
  const addTransaction = (transaction: any) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const formatCurrency = (amount: number, hideDecimals?: boolean): string => {
    if (currencyPreference === 'ngn') {
      return `₦${Math.floor(amount).toLocaleString('en-US')}`;
    }
    return `$${hideDecimals ? Math.floor(amount) : amount.toFixed(2)}`;
  };

  const formatUSDT = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const addWallet = (wallet: { address: string; network: string }) => {
    setUserWallets((prev) => [...prev, wallet]);
  };

  // Theme (keep dark mode)
  useEffect(() => {
    document.documentElement.classList.add('dark', 'dark-theme');
    document.documentElement.classList.remove('light-theme');
  }, []);

  const value: UserContextType = {
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
    userWallets,
    defaultWallet,
    transactions,
    currencyPreference,
    loading,
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
    addWallet,
    setDefaultWallet,
    setPin,
    verifyPin,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
