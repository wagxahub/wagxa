import { useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  type?: 'number' | 'text';
}

export function PinInput({
  length = 4,
  value,
  onChange,
  autoFocus = true,
  type = 'number'
}: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Only allow single character
    if (newValue.length > 1) {
      return;
    }

    // For number type, only allow digits
    if (type === 'number' && newValue && !/^\d$/.test(newValue)) {
      return;
    }

    // Update value
    const newPinArray = value.split('');
    newPinArray[index] = newValue;
    const newPin = newPinArray.join('');
    onChange(newPin);

    // Auto-focus next input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current box is empty, move to previous
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newPinArray = value.split('');
        newPinArray[index] = '';
        onChange(newPinArray.join(''));
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);

    if (type === 'number' && !/^\d+$/.test(pastedData)) {
      return;
    }

    onChange(pastedData);

    // Focus the next empty box or last box
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type={type === 'number' ? 'tel' : 'text'}
          inputMode={type === 'number' ? 'numeric' : 'text'}
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-2xl font-bold rounded-xl transition-all focus:scale-105"
          style={{
            backgroundColor: 'var(--bg-accent)',
            border: '2px solid var(--border-color)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0A84FF';
            e.target.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color)';
            e.target.style.boxShadow = 'none';
          }}
        />
      ))}
    </div>
  );
}
