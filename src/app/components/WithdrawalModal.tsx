
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { X } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

type Step =
  | 'input'
  | 'confirm'
  | 'processing'
  | 'success'
  | 'pending'
  | 'error'
  | 'expired';

export function WithdrawModal({ isOpen, onClose, onSuccess }: WithdrawModalProps) {
  const navigate = useNavigate();
  const { gameBalance, defaultWallet } = useUser();

  const [step, setStep] = useState<Step>('input');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [timer, setTimer] = useState(600);

  const walletAddress = defaultWallet?.address || '0xDEMO_WALLET_ADDRESS';

  // TIMER
  useEffect(() => {
    if (step !== 'input') {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setStep('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step]);

  const formatTime = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const handleContinue = () => {
    const val = parseFloat(amount);

    if (!val || val < 5) return toast.error('Minimum withdrawal is 5 USDT');
    if (val > gameBalance) return toast.error('Insufficient balance');
    if (!defaultWallet) return toast.error('No wallet found');

    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!txHash || txHash.length < 10) {
      return toast.error('Invalid transaction hash');
    }

    setStep('processing');

    setTimeout(() => {
      Math.random() > 0.2 ? setStep('success') : setStep('error');
    }, 2000);
  };

  const finish = () => {
    onSuccess(parseFloat(amount));
    onClose();
    reset();
  };

  const reset = () => {
    setStep('input');
    setAmount('');
    setTxHash('');
    setTimer(600);
  };

  const handleCancel = () => {
    onClose();
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

      <div className="w-full max-w-md rounded-2xl bg-[#0B0E11] border border-white/10 shadow-2xl">

        {/* HEADER */}
        <div className="relative p-5 border-b border-white/10">

          <button
            onClick={handleCancel}
            className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            style={{ backgroundColor: 'var(--bg-accent)' }}
          >
            <span style={{ color: 'var(--text-primary)' }}>✕</span>
          </button>

          <h2 className="text-white text-lg font-semibold">
            Withdraw USDT
          </h2>

          <p className="text-xs text-gray-400">
            BEP20 Network only
          </p>
        </div>

        {/* INPUT */}
        {step === 'input' && (
          <div className="p-5">

            <label className="text-xs text-gray-400">
              Amount (USDT)
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full mt-2 p-3 rounded-lg bg-[#161A1E] text-white border border-white/10"
            />

            <p className="text-xs text-gray-500 mt-2">
              Minimum withdrawal: 5 USDT
            </p>

            {!defaultWallet && (
              <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">
                  No wallet found. Go to settings to add one.
                </p>
                <button
                  onClick={() => {
                    handleCancel();
                    navigate('/settings');
                  }}
                  className="mt-2 text-xs text-[#0A84FF]"
                >
                  Go to Settings
                </button>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={!amount || parseFloat(amount) < 5}
              className="w-full mt-4 p-3 rounded-lg text-black font-semibold"
              style={{ backgroundColor: '#0A84FF' }}
            >
              Continue
            </button>
          </div>
        )}

        {/* CONFIRM */}
        {step === 'confirm' && (
          <div className="p-5">

            <div className="flex justify-between mb-3">
              <p className="text-sm text-gray-400">Confirm Withdrawal</p>
              <p className="text-[#0A84FF] text-sm">⏱ {formatTime()}</p>
            </div>

            <div className="bg-[#161A1E] p-3 rounded-lg mb-3 border border-white/10">
              <p className="text-xs text-gray-400">Amount</p>
              <p className="text-white font-semibold">{amount} USDT</p>
            </div>

            <div className="bg-[#161A1E] p-3 rounded-lg mb-3 border border-white/10">
              <p className="text-xs text-gray-400">Wallet</p>

              <div className="flex justify-between items-center gap-2">
                <p className="text-xs text-white break-all">
                  {walletAddress}
                </p>

                <button
                  onClick={() => copy(walletAddress)}
                  className="w-8 h-8 rounded bg-[#0A84FF] text-black flex items-center justify-center"
                >
                  📋
                </button>
              </div>
            </div>

            <input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Transaction Hash"
              className="w-full p-3 rounded-lg bg-[#161A1E] text-white border border-white/10"
            />

            <button
              onClick={handleConfirm}
              className="w-full mt-4 p-3 rounded-lg text-black font-semibold"
              style={{ backgroundColor: '#0A84FF' }}
            >
              Confirm Withdrawal
            </button>
          </div>
        )}

        {/* PROCESSING */}
        {step === 'processing' && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"
              style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}
            />
            <p className="text-white">Processing...</p>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="p-8 text-center">

            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="text-green-400 text-3xl">✓</span>
            </div>

            <h2 className="text-green-400 font-semibold">
              Withdrawal Successful
            </h2>

            <p className="text-white mt-2">
              {amount} USDT sent
            </p>

            <button
              onClick={finish}
              className="w-full mt-5 p-3 rounded-lg text-black font-semibold"
              style={{ backgroundColor: '#0A84FF' }}
            >
              Done
            </button>
          </div>
        )}

        {/* ERROR */}
        {step === 'error' && (
          <div className="p-6 text-center">
            <p className="text-red-400">Transaction Failed</p>

            <button
              onClick={reset}
              className="w-full mt-4 p-3 rounded-lg text-black font-semibold"
              style={{ backgroundColor: '#0A84FF' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* EXPIRED */}
        {step === 'expired' && (
          <div className="p-6 text-center">
            <p className="text-red-400">Session Expired</p>

            <button
              onClick={reset}
              className="w-full mt-4 p-3 rounded-lg text-black font-semibold"
              style={{ backgroundColor: '#0A84FF' }}
            >
              New Withdrawal
            </button>
          </div>
        )}

      </div>
    </div>
  );
}	

