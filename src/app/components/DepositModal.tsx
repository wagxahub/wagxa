import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUSDTSuccess?: (amount: number) => void;
}

type Step = 'input' | 'network' | 'confirm' | 'success' | 'error' | 'expired';

export function DepositModal({
  isOpen,
  onClose,
  onUSDTSuccess
}: DepositModalProps) {

  const [step, setStep] = useState<Step>('input');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [timer, setTimer] = useState(600);

  const walletAddress = '0xDEMO_WALLET_ADDRESS';

  // TIMER (Binance style expiry)
  useEffect(() => {
    if (step !== 'network') return;

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
  }, [step]);

  const formatTime = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const copy = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast.success(label || 'Copied');
  };

  const continueDeposit = () => {
    const val = parseFloat(amount);
    if (!val || val < 5) return toast.error('Minimum is $5');

    setStep('network');
    setTimer(600);
  };

  const confirmTx = () => {
    if (!txHash || txHash.length < 10) {
      return toast.error('Invalid Tx Hash');
    }

    setStep('confirm');

    setTimeout(() => {
      Math.random() > 0.2 ? setStep('success') : setStep('error');
    }, 2000);
  };

  const finish = () => {
    onUSDTSuccess?.(parseFloat(amount));
    onClose();
    reset();
  };

  const reset = () => {
    setStep('input');
    setAmount('');
    setTxHash('');
    setTimer(600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

      <div className="w-full max-w-md rounded-2xl bg-[#0B0E11] border border-white/10 shadow-2xl">

        {/* HEADER (Binance style) */}
        <div className="p-5 border-b border-white/10">
          <h2 className="text-white text-lg font-semibold">
            Deposit Crypto
          </h2>
          <p className="text-xs text-gray-400">
            USDT (BEP20) Network only
          </p>
        </div>

        {/* STEP 1 - INPUT */}
        {step === 'input' && (
          <div className="p-5">

            <label className="text-xs text-gray-400">
              Amount (USDT)
            </label>

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full mt-2 p-3 rounded-lg bg-[#161A1E] text-white border border-white/10"
            />

            <p className="text-xs text-gray-500 mt-2">
              Minimum deposit: $5
            </p>

            <button
              onClick={continueDeposit}
              className="w-full mt-4 p-3 rounded-lg bg-[#FCD535] text-black font-semibold"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2 - NETWORK */}
        {step === 'network' && (
          <div className="p-5">

            {/* TIMER */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-400">Send USDT</p>
              <p className="text-[#FCD535] font-mono text-sm">
                ⏱ {formatTime()}
              </p>
            </div>

            {/* AMOUNT CARD */}
            <div className="bg-[#161A1E] p-3 rounded-lg mb-3 border border-white/10">
              <p className="text-xs text-gray-400">Amount</p>
              <p className="text-lg text-white font-semibold">
                {amount} USDT
              </p>

              <button
                onClick={() => copy(amount, 'Amount copied')}
                className="text-xs text-[#FCD535] mt-1"
              >
                Copy amount
              </button>
            </div>

            {/* NETWORK */}
            <div className="bg-[#161A1E] p-3 rounded-lg mb-3 border border-white/10">
              <p className="text-xs text-gray-400">Network</p>
              <p className="text-white">BSC (BEP20)</p>
            </div>

            {/* WALLET */}
            <div className="bg-[#161A1E] p-3 rounded-lg border border-white/10">
              <p className="text-xs text-gray-400 mb-1">
                Wallet Address
              </p>

              <div className="flex justify-between items-center gap-2">
                <p className="text-xs text-white break-all">
                  {walletAddress}
                </p>

                <button
                  onClick={() => copy(walletAddress, 'Address copied')}
                  className="w-8 h-8 flex items-center justify-center rounded bg-[#FCD535] text-black"
                >
                  📋
                </button>
              </div>
            </div>

            {/* WARNING */}
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400">
                ⚠ Send only USDT (BEP20). Wrong network may result in permanent loss.
              </p>
            </div>

            <button
              onClick={() => setStep('confirm')}
              className="w-full mt-4 p-3 bg-[#FCD535] text-black font-semibold rounded-lg"
            >
              I Have Sent Payment
            </button>
          </div>
        )}

        {/* STEP 3 - CONFIRM */}
        {step === 'confirm' && (
          <div className="p-5">

            <label className="text-xs text-gray-400">
              Transaction Hash
            </label>

            <input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Paste TxID"
              className="w-full mt-2 p-3 bg-[#161A1E] text-white rounded-lg border border-white/10"
            />

            <p className="text-xs text-gray-500 mt-2">
              You can find this in Binance / Trust Wallet
            </p>

            <button
              onClick={confirmTx}
              className="w-full mt-4 p-3 bg-[#FCD535] text-black font-semibold rounded-lg"
            >
              Verify Deposit
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="p-8 text-center">

            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="text-green-400 text-3xl">✓</span>
            </div>

            <h2 className="text-green-400 font-semibold">
              Deposit Successful
            </h2>

            <p className="text-white text-lg mt-2">
              +{amount} USDT
            </p>

            <button
              onClick={finish}
              className="w-full mt-5 p-3 bg-green-500 text-black rounded-lg font-semibold"
            >
              Done
            </button>
          </div>
        )}

        {/* ERROR */}
        {step === 'error' && (
          <div className="p-6 text-center">

            <h2 className="text-red-400">Transaction Failed</h2>

            <button
              onClick={reset}
              className="w-full mt-4 p-3 bg-[#FCD535] text-black rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EXPIRED */}
        {step === 'expired' && (
          <div className="p-6 text-center">

            <h2 className="text-red-400">Session Expired</h2>

            <button
              onClick={reset}
              className="w-full mt-4 p-3 bg-[#FCD535] text-black rounded-lg"
            >
              New Deposit
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
