import { useState } from 'react';
import { X, Lock, Shield } from 'lucide-react';
import { PinInput } from './PinInput';
import { toast } from 'sonner';

interface GlobalPinModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'verify';
  title?: string;
  description?: string;
}

export function GlobalPinModal({
  show,
  onClose,
  onSuccess,
  mode,
  title,
  description
}: GlobalPinModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');

  if (!show) return null;

  const handleSubmit = () => {
    if (mode === 'create') {
      if (step === 'enter') {
        if (pin.length !== 4) {
          toast.error('PIN must be 4 digits');
          return;
        }
        setStep('confirm');
        setConfirmPin('');
      } else {
        if (confirmPin.length !== 4) {
          toast.error('Please confirm your PIN');
          return;
        }
        if (pin !== confirmPin) {
          toast.error('PINs do not match');
          setPin('');
          setConfirmPin('');
          setStep('enter');
          return;
        }
        // Save PIN
        localStorage.setItem('wagxa_pin', pin);
        localStorage.setItem('wagxa_has_pin', 'true');
        toast.success('PIN created successfully!');
        handleClose();
        onSuccess();
      }
    } else {
      // Verify mode
      if (pin.length !== 4) {
        toast.error('Please enter your 4-digit PIN');
        return;
      }
      const storedPin = localStorage.getItem('wagxa_pin');
      if (pin === storedPin) {
        toast.success('PIN verified!');
        handleClose();
        onSuccess();
      } else {
        toast.error('Incorrect PIN');
        setPin('');
      }
    }
  };

  const handleClose = () => {
    setPin('');
    setConfirmPin('');
    setStep('enter');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={handleClose}
    >
      <div
        className="rounded-2xl shadow-2xl p-6 max-w-md w-full"
        style={{ backgroundColor: 'var(--bg-card)' }}
        onClick={(e) => e.stopPropagation()}
        onKeyPress={handleKeyPress}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)'
            }}>
              {mode === 'create' ? (
                <Lock className="w-6 h-6 text-white" />
              ) : (
                <Shield className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {title || (mode === 'create' ? 'Create Security PIN' : 'Enter PIN')}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {description || (mode === 'create' && step === 'confirm'
                  ? 'Confirm your PIN'
                  : mode === 'create'
                  ? 'Protect your account'
                  : 'Verify your identity')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{ backgroundColor: 'var(--bg-accent)' }}
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* PIN Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'create' && step === 'confirm'
              ? 'Confirm PIN'
              : mode === 'create'
              ? 'Enter 4-digit PIN'
              : 'Enter your PIN'}
          </label>
          <PinInput
            length={4}
            value={step === 'confirm' ? confirmPin : pin}
            onChange={step === 'confirm' ? setConfirmPin : setPin}
            type="number"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--bg-accent)',
              color: 'var(--text-primary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={(step === 'confirm' ? confirmPin.length : pin.length) !== 4}
            className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
              color: 'white',
            }}
          >
            {mode === 'create' && step === 'confirm'
              ? 'Confirm'
              : mode === 'create'
              ? 'Next'
              : 'Verify'}
          </button>
        </div>

        {/* Help Text */}
        {mode === 'create' && (
          <p className="text-xs text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
            You'll need this PIN for withdrawals and sensitive actions
          </p>
        )}
      </div>
    </div>
  );
}
