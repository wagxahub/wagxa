import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useBonus } from '../context/BonusContext';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import { Gift, TrendingUp, Zap } from 'lucide-react';
import { DepositModal } from '../components/DepositModal';

const bonusTiers = [
  {
    id: 1,
    bonus: 5,
    minDeposit: 5,
    wagering: 20,
    badge: 'STARTER',
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    id: 2,
    bonus: 10,
    minDeposit: 10,
    wagering: 20,
    badge: 'BRONZE',
    glowColor: 'rgba(251, 146, 60, 0.3)',
  },
  {
    id: 3,
    bonus: 25,
    minDeposit: 25,
    wagering: 20,
    badge: 'SILVER',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    featured: true,
  },
  {
    id: 4,
    bonus: 50,
    minDeposit: 50,
    wagering: 20,
    badge: 'GOLD',
    glowColor: 'rgba(234, 179, 8, 0.3)',
  },
  {
    id: 5,
    bonus: 200,
    minDeposit: 200,
    wagering: 20,
    badge: 'PLATINUM',
    glowColor: 'rgba(168, 85, 247, 0.3)',
  },
];

export default function WelcomeBonus() {
  const navigate = useNavigate();
  const { claimWelcomeBonus, hasClaimedWelcomeBonus } = useBonus();
  const { balance, gameBalance, updateBalance, addTransaction } = useUser();
  const { addNotification } = useNotifications();
  const [selectedTier, setSelectedTier] = useState(bonusTiers[2]);
  const [depositAmount, setDepositAmount] = useState('25');
  const [error, setError] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [pendingClaim, setPendingClaim] = useState(false);

  if (hasClaimedWelcomeBonus) {
    navigate('/');
    return null;
  }

  const handleClaim = () => {
    const amount = parseFloat(depositAmount);

    if (isNaN(amount) || amount < selectedTier.minDeposit) {
      setError(`Minimum deposit is $${selectedTier.minDeposit}`);
      return;
    }

    // Check if user has sufficient balance (main + game balance)
    const totalBalance = balance + gameBalance;

    if (totalBalance >= amount) {
      // User has sufficient balance, claim bonus immediately
      const success = claimWelcomeBonus(selectedTier, amount);
      if (success) {
        // Add to transaction history
        addTransaction({
          description: `Welcome Bonus Claimed - $${selectedTier.bonus}`,
          amount: selectedTier.bonus,
          status: 'completed',
          icon: '🎁',
          type: 'deposit'
        });
        // Add notification
        addNotification({
          type: 'bonus',
          title: 'Welcome Bonus Claimed!',
          message: `You've successfully claimed $${selectedTier.bonus} ${selectedTier.badge} bonus with ${selectedTier.wagering}x wagering requirement`,
          icon: '🎁',
        });
        navigate('/bonus-success');
      } else {
        setError('Failed to claim bonus');
      }
    } else {
      // User needs to deposit, show deposit modal
      setPendingClaim(true);
      setShowDepositModal(true);
    }
  };

  const handleDepositSuccess = (depositedAmount: number) => {
    // Update user's balance with deposited amount
    updateBalance(depositedAmount);

    // After deposit, claim the bonus
    if (pendingClaim) {
      const amount = parseFloat(depositAmount);
      const success = claimWelcomeBonus(selectedTier, amount);
      if (success) {
        // Add to transaction history
        addTransaction({
          description: `Welcome Bonus Claimed - $${selectedTier.bonus}`,
          amount: selectedTier.bonus,
          status: 'completed',
          icon: '🎁',
          type: 'deposit'
        });
        // Add notification
        addNotification({
          type: 'bonus',
          title: 'Welcome Bonus Claimed!',
          message: `You've successfully claimed $${selectedTier.bonus} ${selectedTier.badge} bonus with ${selectedTier.wagering}x wagering requirement`,
          icon: '🎁',
        });
        setPendingClaim(false);
        navigate('/bonus-success');
      } else {
        setError('Failed to claim bonus');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6"
          >
            <Gift className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Welcome Bonus
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-300"
          >
            Choose your bonus tier and start winning!
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {bonusTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => {
                setSelectedTier(tier);
                setDepositAmount(tier.minDeposit.toString());
                setError('');
              }}
              className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all ${
                selectedTier.id === tier.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              } ${tier.featured ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' : ''}`}
              style={{
                boxShadow: selectedTier.id === tier.id ? `0 0 30px ${tier.glowColor}` : 'none',
              }}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}

              <div className="text-center">
                <div className="text-xs font-bold text-purple-400 mb-2">{tier.badge}</div>
                <div className="text-3xl font-bold text-white mb-1">${tier.bonus}</div>
                <div className="text-xs text-slate-400 mb-4">Bonus</div>

                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span>Min: ${tier.minDeposit}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>{tier.wagering}x Wager</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-md mx-auto bg-slate-800/50 border border-slate-700 rounded-2xl p-8"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Deposit Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => {
                  setDepositAmount(e.target.value);
                  setError('');
                }}
                min={selectedTier.minDeposit}
                step="0.01"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white text-lg focus:outline-none focus:border-purple-500 transition-colors"
                placeholder={`Min $${selectedTier.minDeposit}`}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Deposit:</span>
              <span className="text-white font-medium">${depositAmount || '0'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Bonus:</span>
              <span className="text-green-400 font-medium">+${selectedTier.bonus}</span>
            </div>
            <div className="h-px bg-slate-700"></div>
            <div className="flex justify-between text-base">
              <span className="text-slate-300 font-medium">Total Balance:</span>
              <span className="text-white font-bold">
                ${(parseFloat(depositAmount || '0') + selectedTier.bonus).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Wagering Required:</span>
              <span className="text-yellow-400">${selectedTier.bonus * selectedTier.wagering}</span>
            </div>
          </div>

          <button
            onClick={handleClaim}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105"
          >
            Claim Bonus & Deposit
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            By claiming, you agree to complete {selectedTier.wagering}x wagering requirements within 30 days.
          </p>
        </motion.div>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={handleDepositSuccess}
      />
    </div>
  );
}
