import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

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
  currencyPreference: "ngn" | "usd";
  theme: "light" | "dark";
  exchangeRate: number;

  userBankAccounts: Array<{
    bankName: string;
    accountNumber: string;
    accountName: string;
  }>;

  userWallets: Array<{
    address: string;
    network: string;
  }>;

  defaultBank: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null;

  defaultWallet: {
    address: string;
    network: string;
  } | null;

  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    status: string;
    icon: string;
    type: "deposit" | "withdraw" | "transfer" | "game";
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

  setCurrencyPreference: (pref: "ngn" | "usd") => void;
  setTheme: (theme: "light" | "dark") => void;

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
    type: "deposit" | "withdraw" | "transfer" | "game";
  }) => void;

  formatCurrency: (amount: number, forceUSD?: boolean) => string;
  formatUSDT: (amount: number) => string;
  convertAmount: (amount: number, from: "ngn" | "usd") => number;

  addBankAccount: (bank: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => void;

  addWallet: (wallet: { address: string; network: string }) => void;

  setDefaultBank: (
    bank: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    } | null
  ) => void;

  setDefaultWallet: (
    wallet: { address: string; network: string } | null
  ) => void;
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

  const [currencyPreference, setCurrencyPreferenceState] =
    useState<"ngn" | "usd">("usd");

  const [theme, setThemeState] = useState<"light" | "dark">("dark");
  const [exchangeRate, setExchangeRate] = useState(1500);

  const FIXED_RATE = 1400;

  const [userBankAccounts, setUserBankAccounts] = useState<
    Array<{ bankName: string; accountNumber: string; accountName: string }>
  >([]);

  const [userWallets, setUserWallets] = useState<
    Array<{ address: string; network: string }>
  >([]);

  const [defaultBank, setDefaultBank] = useState<{
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null>(null);

  const [defaultWallet, setDefaultWallet] = useState<{
    address: string;
    network: string;
  } | null>(null);

  const [transactions, setTransactions] = useState<any[]>([]);

  const setVipLevel = (level: 0 | 1 | 2 | 3) => {
    setVipLevelState(level);
    setVipProgress(0);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.add("dark-theme");
  }, []);

  useEffect(() => {
    const updateRate = () => {
      const fluctuation = Math.random() * 50 - 25;
      setExchangeRate(1500 + fluctuation);
    };

    const interval = setInterval(updateRate, 30000);
    updateRate();
    return () => clearInterval(interval);
  }, []);

  const setCurrencyPreference = (pref: "ngn" | "usd") => {
    const prev = currencyPreference;
    setCurrencyPreferenceState(pref);

    if (prev === "usd" && pref === "ngn") {
      setBalanceState((p) => p * FIXED_RATE);
    } else if (prev === "ngn" && pref === "usd") {
      setBalanceState((p) => p / FIXED_RATE);
    }
  };

  const formatCurrency = (amount: number, forceUSD = false) => {
    const val = Math.floor(amount);
    if (currencyPreference === "usd" || forceUSD) {
      return `$${val.toLocaleString()}`;
    }
    return `₦${val.toLocaleString()}`;
  };

  const formatUSDT = (amount: number) =>
    `$${Math.floor(amount).toLocaleString()}`;

  const convertAmount = (amount: number, from: "ngn" | "usd") => {
    return from === "ngn" ? amount / exchangeRate : amount * exchangeRate;
  };

  const updateBalance = (v: number) => setBalanceState((p) => p + v);
  const updateGameBalance = (v: number) => setGameBalance((p) => p + v);
  const updateUsdtBalance = (v: number) => setUsdtBalance((p) => p + v);
  const updateAdvertiseBalance = (v: number) =>
    setAdvertiseBalance((p) => p + v);
  const updateReferralBalance = (v: number) =>
    setReferralBalance((p) => p + v);

  const addBankAccount = (bank: any) =>
    setUserBankAccounts((p) => [...p, bank]);

  const addWallet = (wallet: any) =>
    setUserWallets((p) => [...p, wallet]);

  const addTransaction = (tx: any) => {
    setTransactions((p) => [
      {
        id: Date.now().toString(),
        ...tx,
        date: new Date().toLocaleString(),
      },
      ...p,
    ]);
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

        setBalance: setBalanceState,
        setGameBalance,
        setUsdtBalance,
        setAdvertiseBalance,
        setReferralBalance,

        setIsVIP,
        setVipLevel,
        setVipProgress,
        setIsAgeVerified,
        setHasPin,

        setCurrencyPreference,
        setTheme: setThemeState,

        updateBalance,
        updateGameBalance,
        updateUsdtBalance,
        updateAdvertiseBalance,
        updateReferralBalance,

        addTransaction,
        formatCurrency,
        formatUSDT,
        convertAmount,

        addBankAccount,
        addWallet,
        setDefaultBank,
        setDefaultWallet,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
