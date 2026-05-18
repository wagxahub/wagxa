import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BonusTier {
  id: number;
  bonus: number;
  minDeposit: number;
  wagering: number;
  badge?: string;
  glowColor: string;
  featured?: boolean;
}

interface ActiveBonus {
  bonusAmount: number;
  wageringRequired: number;
  wageringCompleted: number;
  startDate: number;
  expiryDate?: number;
  tier: number;
}

interface BonusContextType {
  activeBonus: ActiveBonus | null;
  bonusBalance: number;
  hasClaimedWelcomeBonus: boolean;
  hasClaimedNoDepositBonus: boolean;
  claimWelcomeBonus: (tier: BonusTier, depositAmount: number) => boolean;
  claimNoDepositBonus: () => boolean;
  addWagering: (amount: number) => void;
  getBonusProgress: () => { percentage: number; remaining: number };
  clearBonus: () => void;
  updateBonusBalance: (amount: number) => void;
  checkAndConvertCompletedBonus: () => number;
}

const BonusContext = createContext<BonusContextType | undefined>(undefined);

export function BonusProvider({ children }: { children: ReactNode }) {
  const [activeBonus, setActiveBonus] = useState<ActiveBonus | null>(null);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [hasClaimedWelcomeBonus, setHasClaimedWelcomeBonus] = useState(false);
  const [hasClaimedNoDepositBonus, setHasClaimedNoDepositBonus] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedBonus = localStorage.getItem('wagxa_active_bonus');
      const savedBonusBalance = localStorage.getItem('wagxa_bonus_balance');
      const welcomeClaimed = localStorage.getItem('wagxa_welcome_bonus_claimed');
      const noDepositClaimed = localStorage.getItem('wagxa_no_deposit_bonus_claimed');

      if (savedBonus) {
        const bonus = JSON.parse(savedBonus);
        if (bonus.expiryDate && Date.now() > bonus.expiryDate) {
          clearBonus();
        } else {
          setActiveBonus(bonus);
        }
      }

      if (savedBonusBalance) {
        setBonusBalance(parseFloat(savedBonusBalance));
      }

      if (welcomeClaimed === 'true') {
        setHasClaimedWelcomeBonus(true);
      }

      if (noDepositClaimed === 'true') {
        setHasClaimedNoDepositBonus(true);
      }
    } catch (e) {
      // Silently handle error
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (activeBonus) {
      localStorage.setItem('wagxa_active_bonus', JSON.stringify(activeBonus));
    } else {
      localStorage.removeItem('wagxa_active_bonus');
    }
  }, [activeBonus]);

  useEffect(() => {
    localStorage.setItem('wagxa_bonus_balance', bonusBalance.toString());
  }, [bonusBalance]);

  // Check for wagering completion and emit event
  useEffect(() => {
    if (!activeBonus) return;

    const progress = (activeBonus.wageringCompleted / activeBonus.wageringRequired) * 100;

    if (progress >= 100 && bonusBalance > 0) {
      // Wagering complete - dispatch event for UserContext to handle
      const event = new CustomEvent('bonusCompleted', {
        detail: { amount: bonusBalance }
      });
      window.dispatchEvent(event);

      // Dispatch notification event
      const notificationEvent = new CustomEvent('addNotification', {
        detail: {
          type: 'bonus',
          title: 'Bonus Converted!',
          message: `Congratulations! Your $${bonusBalance.toFixed(2)} bonus has been converted to main balance`,
          icon: '✅',
        }
      });
      window.dispatchEvent(notificationEvent);

      // Clear the bonus
      clearBonus();
    }
  }, [activeBonus, bonusBalance]);

  const claimWelcomeBonus = (tier: BonusTier, depositAmount: number): boolean => {
    if (hasClaimedWelcomeBonus || depositAmount < tier.minDeposit) {
      return false;
    }

    const bonus: ActiveBonus = {
      bonusAmount: tier.bonus,
      wageringRequired: tier.bonus * tier.wagering,
      wageringCompleted: 0,
      startDate: Date.now(),
      expiryDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
      tier: tier.id
    };

    setActiveBonus(bonus);
    setBonusBalance(tier.bonus);
    setHasClaimedWelcomeBonus(true);
    localStorage.setItem('wagxa_welcome_bonus_claimed', 'true');

    return true;
  };

  const claimNoDepositBonus = (): boolean => {
    if (hasClaimedNoDepositBonus) {
      return false;
    }

    const bonus: ActiveBonus = {
      bonusAmount: 5,
      wageringRequired: 100,
      wageringCompleted: 0,
      startDate: Date.now(),
      expiryDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
      tier: 0
    };

    setActiveBonus(bonus);
    setBonusBalance(5);
    setHasClaimedNoDepositBonus(true);
    localStorage.setItem('wagxa_no_deposit_bonus_claimed', 'true');

    return true;
  };

  const addWagering = (amount: number) => {
    if (!activeBonus) return;

    const newWagering = Math.min(
      activeBonus.wageringCompleted + amount,
      activeBonus.wageringRequired
    );

    setActiveBonus({
      ...activeBonus,
      wageringCompleted: newWagering
    });
  };

  const getBonusProgress = () => {
    if (!activeBonus) {
      return { percentage: 0, remaining: 0 };
    }

    const percentage = (activeBonus.wageringCompleted / activeBonus.wageringRequired) * 100;
    const remaining = activeBonus.wageringRequired - activeBonus.wageringCompleted;

    return { percentage, remaining };
  };

  const clearBonus = () => {
    setActiveBonus(null);
    setBonusBalance(0);
  };

  const updateBonusBalance = (amount: number) => {
    const newBalance = bonusBalance + amount;

    if (newBalance <= 0) {
      clearBonus();
    } else {
      setBonusBalance(newBalance);
    }
  };

  const checkAndConvertCompletedBonus = (): number => {
    if (!activeBonus) return 0;

    const progress = getBonusProgress();

    if (progress.percentage >= 100 && bonusBalance > 0) {
      const convertedAmount = bonusBalance;
      clearBonus();
      return convertedAmount;
    }

    return 0;
  };

  return (
    <BonusContext.Provider
      value={{
        activeBonus,
        bonusBalance,
        hasClaimedWelcomeBonus,
        hasClaimedNoDepositBonus,
        claimWelcomeBonus,
        claimNoDepositBonus,
        addWagering,
        getBonusProgress,
        clearBonus,
        updateBonusBalance,
        checkAndConvertCompletedBonus
      }}
    >
      {children}
    </BonusContext.Provider>
  );
}

export function useBonus() {
  const context = useContext(BonusContext);
  if (!context) {
    throw new Error('useBonus must be used within BonusProvider');
  }
  return context;
}
