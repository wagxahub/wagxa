import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, TrendingUp, Clock } from 'lucide-react';
import { useBonus } from '../context/BonusContext';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';

interface NoDepositBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NoDepositBonusModal({ isOpen, onClose }: NoDepositBonusModalProps) {
  const { claimNoDepositBonus, hasClaimedNoDepositBonus } = useBonus();
  const { addTransaction } = useUser();
  const { addNotification } = useNotifications();

  const handleClaim = () => {
    const success = claimNoDepositBonus();
    if (success) {
      // Add to transaction history
      addTransaction({
        description: 'No Deposit Bonus Claimed - $5',
        amount: 5,
        status: 'completed',
        icon: '🎁',
        type: 'deposit'
      });
      // Add notification
      addNotification({
        type: 'bonus',
        title: 'Free Bonus Claimed!',
        message: 'You\'ve successfully claimed $5 no-deposit bonus with 20x wagering requirement',
        icon: '🎁',
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          ></motion.div>

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full pointer-events-auto relative"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Free $5 Bonus!
                </h2>

                <p className="text-slate-300">
                  No deposit required - start playing now
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 mb-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Bonus Amount</div>
                    <div className="text-lg font-bold text-white">$5.00</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Wagering Required</div>
                    <div className="text-lg font-bold text-white">$100 (20x)</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Valid For</div>
                    <div className="text-lg font-bold text-white">7 Days</div>
                  </div>
                </div>
              </div>

              {hasClaimedNoDepositBonus ? (
                <div className="bg-slate-700/50 text-slate-400 font-medium py-4 rounded-xl text-center">
                  Already Claimed
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105"
                >
                  Claim Free Bonus
                </button>
              )}

              <p className="text-xs text-slate-500 text-center mt-4">
                One-time offer. Terms and conditions apply.
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
