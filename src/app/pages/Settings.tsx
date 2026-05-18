import { Settings as SettingsIcon, Moon, Lock, CreditCard, Globe, Save, Shield, CheckCircle } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

export function Settings() {
  const navigate = useNavigate();
  const {
    theme,
    setTheme,
    hasPin,
    setHasPin,
    addWallet,
    setDefaultWallet
  } = useUser();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [language, setLanguage] = useState('English');
  const [usdtAddress, setUsdtAddress] = useState('');

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme} mode`);
  };

  const handleSetPin = () => {
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    setHasPin(true);
    setShowPinModal(false);
    toast.success('PIN set successfully!');
    setPin('');
    setConfirmPin('');
  };

  const handleSavePayment = () => {
    if (!usdtAddress) {
      toast.error('Please enter a USDT address');
      return;
    }
    const wallet = { address: usdtAddress, network: 'BSC (BEP20)' };
    addWallet(wallet);
    setDefaultWallet(wallet);
    toast.success('Wallet address saved ✅');
  };

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />

      {/* DESKTOP: STRUCTURED LAYOUT - MAX 1320px */}
      <div className="w-full max-w-[1320px] mx-auto px-4 md:px-6 lg:px-10 pb-20">
        
        {/* Back Button */}
        <div className="mb-5">
          <BackButton />
        </div>
        
        {/* PAGE HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
            boxShadow: '0 4px 16px rgba(10, 132, 255, 0.2)'
          }}>
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Settings
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Manage your preferences and account settings
            </p>
          </div>
        </div>

        {/* DESKTOP: 65/35 SPLIT LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* LEFT COLUMN: 65% - PREFERENCES */}
          <div className="w-full lg:flex-[0.65] space-y-5">

            {/* Theme Selection */}
            <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                  <Moon className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    Theme
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Dark theme is permanently enabled
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled
                  className="p-4 rounded-xl font-semibold opacity-50 cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  ☀️ Light Mode
                </button>
                <button
                  className="p-4 rounded-xl font-semibold"
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    border: '2px solid #8B5CF6',
                    color: '#8B5CF6',
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>🌙 Dark Mode</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <Globe className="w-5 h-5" style={{ color: '#22C55E' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    Language
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Select your preferred language
                  </p>
                </div>
              </div>
              
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  toast.success(`Language changed to ${e.target.value}`);
                }}
                className="w-full px-4 py-3 rounded-xl font-medium"
                style={{
                  backgroundColor: 'var(--bg-accent)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="English">🇬🇧 English</option>
                <option value="Spanish">🇪🇸 Spanish</option>
                <option value="French">🇫🇷 French</option>
                <option value="German">🇩🇪 German</option>
                <option value="Portuguese">🇵🇹 Portuguese</option>
              </select>
            </div>
          </div>

          {/* RIGHT COLUMN: 35% - SECURITY & PAYMENT */}
          <div className="w-full lg:flex-[0.35] space-y-5">
            
            {/* Security Settings */}
            <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <Shield className="w-5 h-5" style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    Security
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Protect your account
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-accent)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        PIN Protection
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${hasPin ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {hasPin ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPinModal(true)}
                    className="w-full mt-3 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                    style={{
                      backgroundColor: hasPin ? 'rgba(239, 68, 68, 0.1)' : 'rgba(10, 132, 255, 0.1)',
                      color: hasPin ? '#EF4444' : '#0A84FF',
                      border: hasPin ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(10, 132, 255, 0.2)',
                    }}
                  >
                    {hasPin ? 'Change PIN' : 'Set PIN'}
                  </button>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-accent)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      Change Password
                    </span>
                  </div>
                  <button
                    onClick={() => toast.info('Password change feature coming soon')}
                    className="w-full mt-3 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                    style={{
                      backgroundColor: 'rgba(10, 132, 255, 0.1)',
                      color: '#0A84FF',
                      border: '1px solid rgba(10, 132, 255, 0.2)',
                    }}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Settings (USDT) */}
            <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <CreditCard className="w-5 h-5" style={{ color: '#22C55E' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    USDT Wallet
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    For withdrawals
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                  placeholder="Enter USDT address"
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  BSC (BEP20) Network
                </p>
                <button
                  onClick={handleSavePayment}
                  className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    color: 'white',
                  }}
                >
                  <Save className="w-4 h-4" />
                  Save Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowPinModal(false)}
        >
          <div 
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {hasPin ? 'Change PIN' : 'Set PIN'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  New PIN (4 digits)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Confirm PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSetPin}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
                    color: 'white',
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setPin('');
                    setConfirmPin('');
                  }}
                  className="px-6 py-3 rounded-xl font-semibold transition-all active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
