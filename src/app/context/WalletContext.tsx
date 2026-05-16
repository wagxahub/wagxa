import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

type WalletContextType = {
  balance: number;
  gameBalance: number;
  bonusBalance: number;
  loading: boolean;
  refreshWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [balance, setBalance] = useState(0);
  const [gameBalance, setGameBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshWallet = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setBalance(0);
        setGameBalance(0);
        setBonusBalance(0);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("wallets")
        .select("balance, game_balance, bonus_balance")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setBalance(Number(data.balance || 0));
        setGameBalance(Number(data.game_balance || 0));
        setBonusBalance(Number(data.bonus_balance || 0));
      } else {
        // Create wallet row if none exists
        await supabase.from("wallets").insert({
          user_id: user.id,
          balance: 0,
          game_balance: 0,
          bonus_balance: 0
        });
      }
    } catch (err) {
      console.error("Wallet error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  return (
    <WalletContext.Provider value={{
      balance,
      gameBalance,
      bonusBalance,
      loading,
      refreshWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
};
