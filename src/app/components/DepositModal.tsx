import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUSDTSuccess?: (amount: number) => void;
}

export function DepositModal({ isOpen, onClose, onUSDTSuccess }: DepositModalProps) {
  // ONLY USDT FLOW (NO NAIRA)
  const [step, setStep] = useState<'input' | 'send' | 'hash' | 'verifying' | 'success' | 'error' | 'expired'>('input');

  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(600);

  const walletAddress = '0xA7f92Ks8d2F3m9Lp4Hj7Nk5Qr6Ts8Vw3Xy9Z93Kd';

  // TIMER
  useEffect(() => {
    if (step === 'send' && timer > 0) {
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
  }, [step, timer]);

  const formatTime = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerate = () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 5) {
      setError('Minimum 5 USDT');
      return;
    }
    setError('');
    setTimer(600);
    setStep('send');
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const handleVerify = () => {
    if (!txHash || txHash.length < 10) {
      setError('Invalid transaction hash');
      return;
    }

    setError('');
    setStep('verifying');

    setTimeout(() => {
      Math.random() > 0.2 ? setStep('success') : setStep('error');
    }, 2500);
  };

  const handleSuccess = () => {
    onUSDTSuccess?.(parseFloat(amount));
    onClose();
    reset();
  };

  const reset = () => {
    setStep('input');
    setAmount('');
    setTxHash('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-2xl shadow-xl bg-[#0B0F19] border border-white/10">

        {/* HEADER (Binance style minimal) */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              ₮
            </div>
            <h2 className="text-white font-semibold">USDT Deposit</h2>
          </div>

          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        {/* STEP 1 */}
        {step === 'input' && (
          <div className="p-5 space-y-4">
            <p className="text-white/60 text-sm">Enter amount to deposit</p>

            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="0.00 USDT"
              className="w-full p-3 rounded-lg bg-[#111827] text-white border border-white/10"
            />

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="text-xs text-white/50">
              Min deposit: 5 USDT
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-3 rounded-lg bg-blue-500 text-white font-medium"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2 - SEND */}
        {step === 'send' && (
          <div className="p-5 space-y-4">

            <div className="flex justify-between text-xs text-white/50">
              <span>Send USDT (BEP20)</span>
              <span className="text-blue-400 font-bold">{formatTime()}</span>
            </div>

            <div className="bg-[#111827] p-4 rounded-lg space-y-2 border border-white/10">

              <div className="text-xs text-white/50">Amount</div>
              <div className="text-blue-400 font-bold text-lg">
                {amount} USDT
              </div>

              <button
                onClick={() => copy(amount)}
                className="text-xs text-blue-400"
              >
                Copy Amount
              </button>

              <hr className="border-white/10 my-2" />

              <div className="text-xs text-white/50">Wallet</div>
              <div className="text-white text-xs break-all">
                {walletAddress}
              </div>

              <button
                onClick={() => copy(walletAddress)}
                className="text-xs text-blue-400"
              >
                Copy Address
              </button>
            </div>

            <button
              onClick={() => setStep('hash')}
              className="w-full py-3 rounded-lg bg-blue-500 text-white"
            >
              I have sent payment
            </button>
          </div>
        )}

        {/* STEP 3 - HASH */}
        {step === 'hash' && (
          <div className="p-5 space-y-4">

            <input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Enter transaction hash"
              className="w-full p-3 rounded-lg bg-[#111827] text-white border border-white/10"
            />

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              onClick={handleVerify}
              className="w-full py-3 rounded-lg bg-blue-500 text-white"
            >
              Verify
            </button>
          </div>
        )}

        {/* VERIFY */}
        {step === 'verifying' && (
          <div className="p-10 text-center text-white">
            <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            Verifying transaction...
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="p-10 text-center space-y-4 text-white">
            <div className="text-4xl text-blue-400">✓</div>
            <div className="text-green-400 font-bold">Deposit Successful</div>
            <div>{amount} USDT</div>

            <button
              onClick={handleSuccess}
              className="w-full py-3 rounded-lg bg-blue-500"
            >
              Continue
            </button>
          </div>
        )}

        {/* ERROR */}
        {step === 'error' && (
          <div className="p-10 text-center space-y-4 text-white">
            <div className="text-red-400 text-3xl">✕</div>
            <div>Transaction not found</div>

            <button
              onClick={() => setStep('hash')}
              className="w-full py-3 rounded-lg bg-blue-500"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EXPIRED */}
        {step === 'expired' && (
          <div className="p-10 text-center text-white space-y-4">
            <div className="text-red-400">Session expired</div>

            <button
              onClick={reset}
              className="w-full py-3 rounded-lg bg-blue-500"
            >
              Restart
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
