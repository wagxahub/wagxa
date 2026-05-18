import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useBonus } from '../context/BonusContext';
import { PartyPopper, TrendingUp, Clock, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BonusSuccess() {
  const navigate = useNavigate();
  const { activeBonus, bonusBalance, getBonusProgress } = useBonus();
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!activeBonus) {
      navigate('/');
      return;
    }

    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#ec4899', '#8b5cf6'],
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#ec4899', '#8b5cf6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [activeBonus, navigate]);

  useEffect(() => {
    if (!activeBonus?.expiryDate) return;

    const updateTime = () => {
      const now = Date.now();
      const diff = activeBonus.expiryDate! - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setTimeRemaining(`${days}d ${hours}h remaining`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [activeBonus]);

  if (!activeBonus) return null;

  const progress = getBonusProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
            <PartyPopper className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bonus Claimed!
          </h1>

          <p className="text-lg text-slate-300">
            Your welcome bonus is now active
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 space-y-6"
        >
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-2">Bonus Balance</div>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              ${bonusBalance.toFixed(2)}
            </div>
          </div>

          <div className="h-px bg-slate-700"></div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Wagering Progress</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-white">
                    ${activeBonus.wageringCompleted.toFixed(2)}
                  </span>
                  <span className="text-sm text-slate-500">
                    / ${activeBonus.wageringRequired.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Time Remaining</div>
                <div className="text-lg font-bold text-white">{timeRemaining}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Bonus Type</div>
                <div className="text-lg font-bold text-white">
                  {activeBonus.tier === 0 ? 'No Deposit Bonus' : 'Welcome Bonus'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-purple-200 text-center">
              Complete the wagering requirement to convert your bonus to real cash!
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105"
          >
            Start Playing
          </button>
        </motion.div>
      </div>
    </div>
  );
}
