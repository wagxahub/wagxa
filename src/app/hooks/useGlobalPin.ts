import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useGlobalPin() {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState<'create' | 'verify'>('verify');
  const [onPinSuccess, setOnPinSuccess] = useState<(() => void) | null>(null);

  const hasPin = useCallback(() => {
    return localStorage.getItem('wagxa_has_pin') === 'true';
  }, []);

  const requirePin = useCallback((callback: () => void, title?: string, description?: string) => {
    if (!hasPin()) {
      // No PIN set, force creation
      setPinMode('create');
      setOnPinSuccess(() => callback);
      setShowPinModal(true);
    } else {
      // PIN exists, verify it
      setPinMode('verify');
      setOnPinSuccess(() => callback);
      setShowPinModal(true);
    }
  }, [hasPin]);

  const handlePinSuccess = useCallback(() => {
    if (onPinSuccess) {
      onPinSuccess();
      setOnPinSuccess(null);
    }
    setShowPinModal(false);
  }, [onPinSuccess]);

  const handlePinClose = useCallback(() => {
    setShowPinModal(false);
    setOnPinSuccess(null);
  }, []);

  return {
    showPinModal,
    pinMode,
    hasPin: hasPin(),
    requirePin,
    handlePinSuccess,
    handlePinClose
  };
}
