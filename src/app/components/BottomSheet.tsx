import { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  features: string[];
}

export function BottomSheet({ isOpen, onClose, title, description, features }: BottomSheetProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 transition-opacity"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          animation: isOpen ? 'fadeIn 200ms ease-out' : 'none',
        }}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
        style={{
          height: '60vh',
          backgroundColor: '#171A22',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 250ms ease-out',
        }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div
            className="w-12 h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          />
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 60px)' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-black"
              style={{ color: '#FFFFFF' }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-all hover:bg-white/10"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p
            className="mb-6"
            style={{
              fontSize: '15px',
              lineHeight: '1.5',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            {description}
          </p>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: '#00FF88' }}
                />
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
