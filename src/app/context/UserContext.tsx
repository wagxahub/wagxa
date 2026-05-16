import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

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

  currencyPreference: 'ngn' | 'usd';
  theme: 'light' | 'dark';
  exchangeRate: number;

  userBankAccounts: any[];
  userWallets: any[];
  defaultBank: any;
  defaultWallet: any;
  transactions: any[];

  setBalance: (v: number) => void;
  setGameBalance: (v: number) => void;
  setUsdtBalance: (v: number) => void;
  setAdvertiseBalance: (v: number) => void;
  setReferralBalance: (v: number) => void;

  setDefaultBank: (b: any) => void;
  setDefaultWallet: (w: any) => void;

  setCurrencyPreference: (p: 'ngn' | 'usd') => void;
  setTheme: (t: 'light' | 'dark') => void;

  updateBalance: (a: number) => void;

  addBankAccount: (b: any) => void;
  addWallet: (w: any) => void;
  addTransaction: (t: any) => void;

  formatCurrency: (a: number, forceUSD?: boolean) => string;
  formatUSDT: (a: number) => string;
  convertAmount: (a: number, from: 'ngn' | 'usd') => number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState(0);
  const [gameBalance, setGameBalanceState] = useState(0);
  const [usdtBalance, setUsdtBalanceState] = useState(0);
  const [advertiseBalance, setAdvertiseBalanceState] = useState(0);
  const [referralBalance, setReferralBalanceState] = useState(3500);

  const [isVIP] = useState(false);
  const [vipLevel] = useState<0 | 1 | 2 | 3>(0);
  const [vipProgress] = useState(0);

  const [isAgeVerified] = useState(false);
  const [hasPin] = useState(false);

  const [currencyPreference, setCurrencyPreferenceState] =
    useState<'ngn' | 'usd'>('usd');

  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');

  const [exchangeRate] = useState(1500);

  const [userBankAccounts, setUserBankAccounts] = useState<any[]>([]);
  const [userWallets, setUserWallets] = useState<any[]>([]);
  const [defaultBank, setDefaultBankState] = useState<any>(null);
  const [defaultWallet, setDefaultWalletState] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const FIXED_RATE = 1400;

  // ================= BALANCE =================
  const setBalance = (v: number) => setBalanceState(v);
  const setGameBalance = (v: number) => setGameBalanceState(v);
  const setUsdtBalance = (v: number) => setUsdtBalanceState(v);
  const setAdvertiseBalance = (v: number) =>
    setAdvertiseBalanceState(v);
  const setReferralBalance = (v: number) =>
    setReferralBalanceState(v);

  const updateBalance = (a: number) =>
    setBalanceState(prev => prev + a);

  // ================= BANK / WALLET =================
  const setDefaultBank = (b: any) => setDefaultBankState(b);
  const setDefaultWallet = (w: any) => setDefaultWalletState(w);

  const addBankAccount = (b: any) =>
    setUserBankAccounts(prev => [...prev, b]);

  const addWallet = (w: any) =>
    setUserWallets(prev => [...prev, w]);

  // ================= TRANSACTIONS =================
  const addTransaction = (t: any) => {
    const now = new Date();
    const date =
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) +
      ', ' +
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

    setTransactions(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        ...t,
        date,
      },
      ...prev,
    ]);
  };

  // ================= CURRENCY =================
  const setCurrencyPreference = (p: 'ngn' | 'usd') =>
    setCurrencyPreferenceState(p);

  const convertAmount = (a: number, from: 'ngn' | 'usd') =>
    from === 'ngn' ? a / FIXED_RATE : a * FIXED_RATE;

  const formatCurrency = (a: number, forceUSD = false) => {
    const v = Math.floor(a);
    return currencyPreference === 'usd' || forceUSD
      ? `$${v.toLocaleString()}`
      : `₦${v.toLocaleString()}`;
  };

  const formatUSDT = (a: number) =>
    `$${Math.floor(a).toLocaleString()}`;

  // ================= THEME FIX (IMPORTANT) =================
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.remove('dark');
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }, [theme]);

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);

    const root = document.documentElement;

    if (t === 'dark') {
      root.classList.add('dark');
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.remove('dark');
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }

    localStorage.setItem('theme', t);
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

        currencyPreference,
        theme,
        exchangeRate,

        userBankAccounts,
        userWallets,
        defaultBank,
        defaultWallet,
        transactions,

        setBalance,
        setGameBalance,
        setUsdtBalance,
        setAdvertiseBalance,
        setReferralBalance,

        setDefaultBank,
        setDefaultWallet,

        setCurrencyPreference,
        setTheme,

        updateBalance,

        addBankAccount,
        addWallet,
        addTransaction,

        formatCurrency,
        formatUSDT,
        convertAmount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx)
    throw new Error('useUser must be used within UserProvider');
  return ctx;
}
