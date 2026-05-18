import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  // USDT deposit states
  const [usdtAmount, setUsdtAmount] = useState('');
  const [usdtStep, setUsdtStep] = useState<'input' | 'instructions' | 'hash' | 'verifying' | 'success' | 'error' | 'expired'>('input');
  const [usdtTimer, setUsdtTimer] = useState(600); // 10 minutes
  const [usdtWalletAddress] = useState('0xA7f92Ks8d2F3m9Lp4Hj7Nk5Qr6Ts8Vw3Xy9Z93Kd');
  const [usdtTxHash, setUsdtTxHash] = useState('');
  const [usdtError, setUsdtError] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  // USDT timer countdown
  useEffect(() => {
    if (usdtStep === 'instructions' && usdtTimer > 0) {
      const interval = setInterval(() => {
        setUsdtTimer(prev => {
          if (prev <= 1) {
            setUsdtStep('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [usdtStep, usdtTimer]);

  // ============================================
  // USDT DEPOSIT HANDLERS
  // ============================================
  const handleUSDTGenerate = () => {
    const amount = parseFloat(usdtAmount);
    if (!amount || amount < 5) {
      setUsdtError('Minimum deposit is 5 USDT');
      return;
    }

    setUsdtError('');
    setUsdtTimer(600);
    setUsdtStep('instructions');
  };

  const handleUSDTProceedToHash = () => {
    setUsdtStep('hash');
  };

  const handleUSDTVerify = () => {
    if (!usdtTxHash || usdtTxHash.length < 10) {
      setUsdtError('Please enter a valid transaction hash');
      return;
    }

    setUsdtError('');
    setUsdtStep('verifying');

    // Simulate verification
    setTimeout(() => {
      // 80% success rate for demo
      if (Math.random() > 0.2) {
        setUsdtStep('success');
      } else {
        setUsdtStep('error');
      }
    }, 3000);
  };

  const handleUSDTSuccess = () => {
    const amount = parseFloat(usdtAmount);

    // Reset flow first
    resetUSDTFlow();

    // Close modal
    onClose();

    // Call success callback last (this might trigger navigation)
    onSuccess(amount);
  };

  const handleCopyUSDTAddress = () => {
    navigator.clipboard.writeText(usdtWalletAddress);
    toast.success('Copied!');
  };

  const handleCopyUSDTAmount = () => {
    navigator.clipboard.writeText(usdtAmount);
    toast.success('Copied!');
  };

  const formatUSDTTimer = () => {
    const mins = Math.floor(usdtTimer / 60);
    const secs = usdtTimer % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetUSDTFlow = () => {
    setUsdtStep('input');
    setUsdtAmount('');
    setUsdtTxHash('');
    setUsdtError('');
    setShowQRCode(false);
  };

  const handleCancel = () => {
    onClose();
    resetUSDTFlow();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg shadow-lg max-w-md w-full" style={{ backgroundColor: 'var(--bg-card)' }}>

        {/* USDT DEPOSIT CONTENT */}
        <>
          {/* USDT - STEP 1: INPUT */}
          {usdtStep === 'input' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Deposit USDT
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Enter Amount (USDT)
                  </label>
                  <input
                    type="number"
                    value={usdtAmount}
                    onChange={(e) => {
                      setUsdtAmount(e.target.value);
                      setUsdtError('');
                    }}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border rounded-lg text-lg"
                    style={{
                      borderColor: usdtError ? '#EF4444' : 'var(--border-color)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-secondary)'
                    }}
                  />
                  {usdtError && (
                    <p className="text-sm mt-1" style={{ color: '#EF4444' }}>
                      {usdtError}
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    💡 Minimum deposit: 5 USDT
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 rounded-lg border-2 font-medium"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUSDTGenerate}
                    disabled={!usdtAmount || parseFloat(usdtAmount) < 5}
                    className="flex-1 py-3 rounded-lg text-white font-medium transition-all"
                    style={{
                      backgroundColor: usdtAmount && parseFloat(usdtAmount) >= 5 ? '#0A84FF' : '#9CA3AF',
                      cursor: usdtAmount && parseFloat(usdtAmount) >= 5 ? 'pointer' : 'not-allowed',
                      opacity: usdtAmount && parseFloat(usdtAmount) >= 5 ? 1 : 0.6
                    }}
                  >
                    Generate Deposit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* USDT - STEP 2: INSTRUCTIONS */}
          {usdtStep === 'instructions' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Deposit USDT
                </h2>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: usdtTimer <= 120 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(10, 132, 255, 0.1)' }}>
                  <span className="text-sm">⏱</span>
                  <span className="text-sm font-bold" style={{ color: usdtTimer <= 120 ? '#EF4444' : '#0A84FF' }}>
                    {formatUSDTTimer()}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-accent)' }}>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Send EXACT amount</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-2xl font-bold" style={{ color: '#0A84FF' }}>{usdtAmount} USDT</p>
                      <button
                        onClick={handleCopyUSDTAmount}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                        style={{ backgroundColor: '#0A84FF', color: 'white' }}
                      >
                        Copy Amount
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Network</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>BSC (BEP20)</p>
                  </div>

                  <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Wallet Address</p>
                    <p className="text-xs font-mono mb-2 break-all" style={{ color: 'var(--text-primary)' }}>
                      {usdtWalletAddress}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyUSDTAddress}
                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
                        style={{ backgroundColor: '#0A84FF', color: 'white' }}
                      >
                        Copy Address
                      </button>
                      <button
                        onClick={() => setShowQRCode(!showQRCode)}
                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                      >
                        {showQRCode ? 'Hide QR' : 'Show QR Code'}
                      </button>
                    </div>
                  </div>

                  {showQRCode && (
                    <div className="pt-3 border-t flex justify-center" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="p-4 rounded-lg" style={{ backgroundColor: 'white' }}>
                        <div className="w-40 h-40 flex items-center justify-center" style={{ backgroundColor: '#E5E7EB' }}>
                          <p className="text-xs text-center px-2" style={{ color: '#6B7280' }}>QR Code<br/>(Demo)</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #EF4444' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#EF4444' }}>⚠️ Warning</p>
                <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Send only USDT via BSC (BEP20)</li>
                  <li>• Amount must match exactly</li>
                  <li>• Wrong network or token will result in loss of funds</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-lg border-2 font-medium"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUSDTProceedToHash}
                  className="flex-1 py-3 rounded-lg text-white font-medium transition-all"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  I Have Sent Payment
                </button>
              </div>
            </div>
          )}

          {/* USDT - STEP 3: SUBMIT HASH */}
          {usdtStep === 'hash' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Confirm Payment
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Enter Transaction Hash (TxID)
                  </label>
                  <input
                    type="text"
                    value={usdtTxHash}
                    onChange={(e) => {
                      setUsdtTxHash(e.target.value);
                      setUsdtError('');
                    }}
                    placeholder="0x8392ab...kdl3"
                    className="w-full px-4 py-3 border rounded-lg text-sm font-mono"
                    style={{
                      borderColor: usdtError ? '#EF4444' : 'var(--border-color)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-secondary)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: usdtError ? '#EF4444' : 'var(--text-secondary)' }}>
                    {usdtError || 'Paste the transaction hash from your wallet'}
                  </p>
                </div>

                <button
                  onClick={handleUSDTVerify}
                  disabled={!usdtTxHash || usdtTxHash.length < 10}
                  className="w-full py-3 rounded-lg text-white font-medium transition-all"
                  style={{
                    backgroundColor: usdtTxHash && usdtTxHash.length >= 10 ? '#0A84FF' : '#9CA3AF',
                    cursor: usdtTxHash && usdtTxHash.length >= 10 ? 'pointer' : 'not-allowed',
                    opacity: usdtTxHash && usdtTxHash.length >= 10 ? 1 : 0.6
                  }}
                >
                  Verify Payment
                </button>
              </div>
            </div>
          )}

          {/* USDT - STEP 4: VERIFYING */}
          {usdtStep === 'verifying' && (
            <div className="p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}></div>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                🔄 Verifying transaction...
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Please wait while we confirm your deposit
              </p>
            </div>
          )}

          {/* USDT - SUCCESS */}
          {usdtStep === 'success' && (
            <div className="p-8 text-center">
              <div className="mb-6 mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <div className="text-5xl">✓</div>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#10B981' }}>
                ✅ Deposit Confirmed
              </h2>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                +{usdtAmount} USDT
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                added to wallet
              </p>
              <button
                onClick={handleUSDTSuccess}
                className="w-full py-3 rounded-lg text-white font-medium transition-all active:scale-95"
                style={{ backgroundColor: '#0A84FF' }}
              >
                Continue
              </button>
            </div>
          )}

          {/* USDT - ERROR */}
          {usdtStep === 'error' && (
            <div className="p-8 text-center">
              <div className="mb-6 mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <div className="text-5xl">✕</div>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#EF4444' }}>
                ❌ Transaction not found
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                or incorrect amount
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-lg border-2 font-medium"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setUsdtStep('hash')}
                  className="flex-1 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* USDT - EXPIRED */}
          {usdtStep === 'expired' && (
            <div className="p-8 text-center">
              <div className="mb-6 mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <div className="text-5xl">⏱</div>
              </div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#EF4444' }}>
                ❌ Session expired
              </h2>
              <button
                onClick={resetUSDTFlow}
                className="w-full py-3 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#0A84FF' }}
              >
                Generate New Deposit
              </button>
            </div>
          )}
        </>
      </div>
    </div>
  );
}
