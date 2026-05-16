import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { X } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number, type: 'usdt') => void;
}

export function WithdrawModal({ isOpen, onClose, onSuccess }: WithdrawModalProps) {
  const navigate = useNavigate();

  // ✅ MAIN BALANCE ONLY
  const { balance, defaultWallet } = useUser();

  const [usdtAmount, setUsdtAmount] = useState('');
  const [usdtStep, setUsdtStep] = useState<'input' | 'confirm' | 'processing' | 'success' | 'pending'>('input');
  const [usdtError, setUsdtError] = useState('');

  const [sessionTimer, setSessionTimer] = useState(600);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (isOpen && !sessionExpired && sessionTimer > 0) {
      const interval = setInterval(() => {
        setSessionTimer(prev => {
          if (prev <= 1) {
            setSessionExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, sessionExpired, sessionTimer]);

  const resetSession = () => {
    setSessionTimer(600);
    setSessionExpired(false);
    setUsdtStep('input');
    setUsdtAmount('');
    setUsdtError('');
  };

  const handleContinue = () => {
    const amount = parseFloat(usdtAmount);

    if (!amount || amount < 5) {
      setUsdtError('Minimum withdrawal is 5 USDT');
      return;
    }

    if (amount > balance) {
      setUsdtError('Insufficient balance');
      return;
    }

    if (!defaultWallet) {
      setUsdtError('No wallet address found');
      return;
    }

    setUsdtError('');
    setUsdtStep('confirm');
  };

  const handleConfirm = () => {
    setUsdtStep('processing');

    setTimeout(() => {
      if (Math.random() > 0.3) {
        setUsdtStep('pending');
      } else {
        setUsdtStep('success');
      }
    }, 2000);
  };

  const handleSuccess = () => {
    const amount = parseFloat(usdtAmount);
    onSuccess(amount, 'usdt');
    onClose();
    resetSession();
  };

  const handleCancel = () => {
    onClose();
    resetSession();
  };

  const handleGoToSettings = () => {
    onClose();
    navigate('/settings');
  };

  if (!isOpen) return null;

  if (sessionExpired) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="rounded-lg shadow-lg max-w-md w-full p-8 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#EF4444' }}>
            Session expired
          </h2>

          <button
            onClick={resetSession}
            className="w-full py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#0A84FF' }}
          >
            Restart Withdrawal
          </button>
        </div>
      </div>
    );
  }

  const amount = parseFloat(usdtAmount);
  const isValidAmount = amount >= 5 && amount <= balance;
  const isWalletReady = !!defaultWallet;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg shadow-lg max-w-md w-full max-h-[85vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)' }}>

        {/* CLOSE BUTTON */}
        <div className="sticky top-0 z-10 flex justify-end p-4 pb-0" style={{ backgroundColor: 'var(--bg-card)' }}>
          <button
            onClick={handleCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-accent)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* INPUT STEP */}
        {usdtStep === 'input' && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Withdraw USDT
            </h2>

            {/* MAIN BALANCE */}
            <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'var(--bg-accent)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Main Balance
              </p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.floor(balance).toLocaleString()} USDT
              </p>
            </div>

            <div className="space-y-3">
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
                  className="w-full px-4 py-2.5 border rounded-lg"
                  style={{
                    borderColor: usdtError ? '#EF4444' : 'var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />

                {usdtError && (
                  <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                    {usdtError}
                  </p>
                )}
              </div>

              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(10,132,255,0.1)' }}>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Minimum withdrawal: 5 USDT
                </p>
              </div>

              {/* WALLET BLOCK */}
              {!defaultWallet ? (
                <div className="p-3 rounded-lg border-2" style={{ borderColor: '#EF4444' }}>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                    No wallet found
                  </p>

                  <button
                    onClick={handleGoToSettings}
                    className="w-full py-2 rounded-lg text-white"
                    style={{ backgroundColor: '#0A84FF' }}
                  >
                    Go to Settings
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Wallet Connected
                  </p>
                  <p className="text-xs font-mono break-all" style={{ color: 'var(--text-primary)' }}>
                    {defaultWallet.address}
                  </p>
                </div>
              )}

              {/* CONTINUE BUTTON (FIXED) */}
              <button
                onClick={handleContinue}
                disabled={!isValidAmount || !isWalletReady}
                className="w-full py-2.5 rounded-lg text-white font-medium text-sm"
                style={{
                  backgroundColor: isValidAmount && isWalletReady ? '#0A84FF' : '#9CA3AF',
                  cursor: isValidAmount && isWalletReady ? 'pointer' : 'not-allowed',
                  opacity: isValidAmount && isWalletReady ? 1 : 0.6
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* CONFIRM STEP */}
        {usdtStep === 'confirm' && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold mb-3">Confirm Withdrawal</h2>

            <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'var(--bg-accent)' }}>
              <p>{usdtAmount} USDT</p>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-2.5 rounded-lg text-white"
              style={{ backgroundColor: '#0A84FF' }}
            >
              Confirm
            </button>
          </div>
        )}

        {/* PROCESS */}
        {usdtStep === 'processing' && (
          <div className="p-8 text-center">
            <p>Processing...</p>
          </div>
        )}

        {/* SUCCESS */}
        {usdtStep === 'success' && (
          <div className="p-6 text-center">
            <h2 style={{ color: '#10B981' }}>Success</h2>
            <button onClick={handleSuccess} className="w-full mt-4 py-2.5 text-white bg-blue-500 rounded-lg">
              Done
            </button>
          </div>
        )}

        {/* PENDING */}
        {usdtStep === 'pending' && (
          <div className="p-6 text-center">
            <h2 style={{ color: '#FBBF24' }}>Pending</h2>
            <button onClick={handleSuccess} className="w-full mt-4 py-2.5 text-white bg-blue-500 rounded-lg">
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
