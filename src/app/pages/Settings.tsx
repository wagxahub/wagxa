import { Settings as SettingsIcon, Moon, Lock, CreditCard, Globe, Save, Shield, CheckCircle, Edit, Phone, Mail, Key, FileText, Camera, Video, Home, Upload } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { PinInput } from '../components/PinInput';

export function Settings() {
  const navigate = useNavigate();
  const {
    theme,
    setTheme,
    hasPin,
    setHasPin,
    addWallet,
    setDefaultWallet,
    defaultWallet,
    setPin: savePin,
    verifyPin,
    email,
    phoneNumber,
    setPhoneNumber: savePhoneNumber,
    setEmail: saveEmail,
    emailVerified,
    phoneVerified,
    twoFactorEnabled,
    documentVerified,
    walletAddress,
    walletVerified,
    setEmailVerified,
    setPhoneVerified,
    setTwoFactorEnabled,
    setDocumentVerified,
    setWalletAddress,
    setWalletVerified
  } = useUser();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [language, setLanguage] = useState('English');
  const [usdtAddress, setUsdtAddress] = useState('');
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [showPinVerifyModal, setShowPinVerifyModal] = useState(false);
  const [showPhonePinVerifyModal, setShowPhonePinVerifyModal] = useState(false);
  const [verifyPinInput, setVerifyPinInput] = useState('');
  const [phonePinInput, setPhonePinInput] = useState('');
  const [showPhoneVerifyModal, setShowPhoneVerifyModal] = useState(false);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [showEmailVerifyModal, setShowEmailVerifyModal] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [showDocVerifyModal, setShowDocVerifyModal] = useState(false);
  const [docVerifyStep, setDocVerifyStep] = useState(1);
  const [idVerified, setIdVerified] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);
  const [videoSelfieVerified, setVideoSelfieVerified] = useState(false);
  const [addressVerified, setAddressVerified] = useState(false);
  const [showWalletVerifyModal, setShowWalletVerifyModal] = useState(false);
  const [walletVerificationCode, setWalletVerificationCode] = useState('');
  const [walletInput, setWalletInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  // Load saved wallet address and email on mount
  useEffect(() => {
    if (defaultWallet) {
      setUsdtAddress(defaultWallet.address);
    }
    if (walletAddress) {
      setWalletInput(walletAddress);
    }
    if (email) {
      setEmailInput(email);
    }
  }, [defaultWallet, walletAddress, email]);

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
    savePin(pin);
    setShowPinModal(false);
    toast.success('PIN set successfully!');
    setPin('');
    setConfirmPin('');
  };

  const handleEditWallet = () => {
    if (!hasPin) {
      toast.error('Please set up a PIN first to protect your wallet');
      return;
    }
    setShowPinVerifyModal(true);
  };

  const handleVerifyPin = () => {
    if (verifyPin(verifyPinInput)) {
      setIsEditingWallet(true);
      setShowPinVerifyModal(false);
      setVerifyPinInput('');
      toast.success('PIN verified! You can now edit your wallet address');
    } else {
      toast.error('Incorrect PIN');
      setVerifyPinInput('');
    }
  };

  const handleSavePayment = () => {
    if (!usdtAddress) {
      toast.error('Please enter a USDT address');
      return;
    }
    const wallet = { address: usdtAddress, network: 'BSC (BEP20)' };
    addWallet(wallet);
    setDefaultWallet(wallet);
    setIsEditingWallet(false);
    toast.success('Wallet address saved ✅');
  };

  const handleEditPhone = () => {
    if (!hasPin) {
      toast.error('Please set up a PIN first to protect your phone number');
      return;
    }
    setShowPhonePinVerifyModal(true);
  };

  const handleVerifyPhonePin = () => {
    if (verifyPin(phonePinInput)) {
      setIsEditingPhone(true);
      setPhoneInput(phoneNumber);
      setShowPhonePinVerifyModal(false);
      setPhonePinInput('');
      toast.success('PIN verified! You can now edit your phone number');
    } else {
      toast.error('Incorrect PIN');
      setPhonePinInput('');
    }
  };

  const handleSavePhone = () => {
    if (!phoneInput) {
      toast.error('Please enter a phone number');
      return;
    }
    const fullPhone = `${countryCode} ${phoneInput}`;
    savePhoneNumber(fullPhone);
    setIsEditingPhone(false);
    // Show verification modal after saving
    setShowPhoneVerifyModal(true);
    toast.success('Phone number saved! Please verify with the code sent to your phone.');
  };

  const handleSendPhoneVerification = () => {
    if (!phoneNumber) {
      toast.error('Please add a phone number first');
      return;
    }
    // Simulate sending verification code
    toast.success('Verification code sent to your phone!');
    setShowPhoneVerifyModal(true);
  };

  const handleVerifyPhone = () => {
    // Simulate verification - in production, this would check with backend
    if (phoneVerificationCode.length === 6) {
      setPhoneVerified(true);
      setShowPhoneVerifyModal(false);
      setPhoneVerificationCode('');
      toast.success('Phone number verified successfully!');
    } else {
      toast.error('Invalid verification code');
    }
  };

  const handleSendEmailVerification = () => {
    if (!email) {
      toast.error('No email address found');
      return;
    }
    // Simulate sending verification code
    toast.success('Verification code sent to your email!');
    setShowEmailVerifyModal(true);
  };

  const handleVerifyEmail = () => {
    // Simulate verification - in production, this would check with backend
    if (emailVerificationCode.length === 6) {
      setEmailVerified(true);
      setShowEmailVerifyModal(false);
      setEmailVerificationCode('');
      toast.success('Email verified successfully!');
    } else {
      toast.error('Invalid verification code');
    }
  };

  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      toast.success('2FA disabled');
    } else {
      setShow2FAModal(true);
    }
  };

  const handleEnable2FA = () => {
    if (twoFACode.length === 6) {
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setTwoFACode('');
      toast.success('2FA enabled successfully!');
    } else {
      toast.error('Invalid 2FA code');
    }
  };

  const handleStartDocVerification = () => {
    setDocVerifyStep(1);
    setShowDocVerifyModal(true);
  };

  const handleIdUpload = () => {
    setIdVerified(true);
    toast.success('ID document uploaded successfully!');
  };

  const handleSelfieUpload = () => {
    setSelfieVerified(true);
    toast.success('Selfie uploaded successfully!');
  };

  const handleVideoSelfieUpload = () => {
    setVideoSelfieVerified(true);
    toast.success('Video selfie uploaded successfully!');
  };

  const handleAddressUpload = () => {
    setAddressVerified(true);
    toast.success('Address document uploaded successfully!');
  };

  const handleCompleteStep1 = () => {
    if (idVerified && selfieVerified) {
      setDocVerifyStep(2);
      toast.success('Step 1 completed! Proceeding to Step 2...');
    } else {
      toast.error('Please complete both ID and Selfie verification');
    }
  };

  const handleCompleteVerification = () => {
    if (videoSelfieVerified && addressVerified) {
      setDocumentVerified(true);
      setShowDocVerifyModal(false);
      toast.success('Document verification completed successfully!');
    } else {
      toast.error('Please complete both Video Selfie and Address verification');
    }
  };

  const handleSaveEmail = () => {
    if (!emailInput || !emailInput.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    saveEmail(emailInput);
    setEmailVerified(false); // Reset verification when email changes
    toast.success('Email saved! Please verify it.');
  };

  const handleSaveWallet = () => {
    if (!walletInput || walletInput.length < 20) {
      toast.error('Please enter a valid wallet address');
      return;
    }
    setWalletAddress(walletInput);
    toast.success('Wallet address saved! Please verify it.');
  };

  const handleVerifyWallet = () => {
    setShowWalletVerifyModal(true);
  };

  const handleConfirmWalletVerification = () => {
    if (walletVerificationCode.length === 6) {
      setWalletVerified(true);
      setShowWalletVerifyModal(false);
      setWalletVerificationCode('');
      toast.success('Wallet address verified successfully!');
    } else {
      toast.error('Invalid verification code');
    }
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

                {/* 2FA Section */}
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-accent)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        2FA Authentication
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${twoFactorEnabled ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Add an extra layer of security
                  </p>
                  <button
                    onClick={handleToggle2FA}
                    className="w-full py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                    style={{
                      backgroundColor: twoFactorEnabled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: twoFactorEnabled ? '#EF4444' : '#22C55E',
                      border: twoFactorEnabled ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>

                {/* Email Address Section */}
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-accent)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        Email Address
                      </span>
                    </div>
                    {emailVerified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  }}>
                    {email || 'No email address set'}
                  </p>
                  {emailVerified ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: 'var(--bg-accent)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        opacity: 0.6,
                      }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </button>
                  ) : email ? (
                    <button
                      onClick={handleSendEmailVerification}
                      className="w-full py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                      style={{
                        backgroundColor: 'rgba(10, 132, 255, 0.1)',
                        color: '#0A84FF',
                        border: '1px solid rgba(10, 132, 255, 0.2)',
                      }}
                    >
                      Verify Email
                    </button>
                  ) : (
                    <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                      Please register or log in to set your email
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone Number Settings */}
            <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                  <Phone className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    Phone Number
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    For verification
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {phoneNumber && !isEditingPhone ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-accent)', border: '1px solid var(--border-color)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Saved Phone Number</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {phoneNumber}
                        </p>
                        {phoneVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleEditPhone}
                        className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                        style={{
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          color: '#8B5CF6',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      {!phoneVerified && (
                        <button
                          onClick={handleSendPhoneVerification}
                          className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95"
                          style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            color: '#22C55E',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                          }}
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-3 rounded-xl text-sm w-32"
                        style={{
                          backgroundColor: 'var(--bg-accent)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+234">🇳🇬 +234</option>
                        <option value="+27">🇿🇦 +27</option>
                        <option value="+254">🇰🇪 +254</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+7">🇷🇺 +7</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+64">🇳🇿 +64</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+60">🇲🇾 +60</option>
                        <option value="+63">🇵🇭 +63</option>
                        <option value="+66">🇹🇭 +66</option>
                      </select>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Enter phone number"
                        className="flex-1 px-4 py-3 rounded-xl text-sm"
                        style={{
                          backgroundColor: 'var(--bg-accent)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSavePhone}
                      className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                        color: 'white',
                      }}
                    >
                      <Save className="w-4 h-4" />
                      Save Phone Number
                    </button>
                    {isEditingPhone && (
                      <button
                        onClick={() => {
                          setIsEditingPhone(false);
                          setPhoneInput('');
                        }}
                        className="w-full py-2 rounded-xl font-medium text-sm transition-all active:scale-95"
                        style={{
                          backgroundColor: 'var(--bg-accent)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Document Verification */}
            <div className="rounded-2xl shadow-sm p-6" style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
            }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'rgba(255, 215, 0, 0.1)'
                }}>
                  <FileText className="w-5 h-5" style={{ color: '#FFD700' }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    Document Verification
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Complete KYC verification
                  </p>
                </div>
                {idVerified && selfieVerified && videoSelfieVerified && addressVerified && (
                  <div className="px-3 py-1 rounded-full" style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <span className="text-xs font-semibold" style={{ color: '#22C55E' }}>
                      ✓ Verified
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Step 1 Progress */}
                <div className="p-4 rounded-xl" style={{
                  backgroundColor: 'var(--bg-accent)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{
                        backgroundColor: idVerified && selfieVerified ? '#22C55E' : 'rgba(255, 215, 0, 0.2)',
                        color: idVerified && selfieVerified ? 'white' : '#FFD700'
                      }}>
                        1
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Step 1: Identity Verification
                      </span>
                    </div>
                    {idVerified && selfieVerified && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <FileText className="w-3 h-3" />
                      <span>ID {idVerified ? '✓' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Camera className="w-3 h-3" />
                      <span>Selfie {selfieVerified ? '✓' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 Progress */}
                <div className="p-4 rounded-xl" style={{
                  backgroundColor: 'var(--bg-accent)',
                  border: '1px solid var(--border-color)',
                  opacity: idVerified && selfieVerified ? 1 : 0.5
                }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{
                        backgroundColor: videoSelfieVerified && addressVerified ? '#22C55E' : 'rgba(255, 215, 0, 0.2)',
                        color: videoSelfieVerified && addressVerified ? 'white' : '#FFD700'
                      }}>
                        2
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Step 2: Advanced Verification
                      </span>
                    </div>
                    {videoSelfieVerified && addressVerified && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Video className="w-3 h-3" />
                      <span>Video {videoSelfieVerified ? '✓' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Home className="w-3 h-3" />
                      <span>Address {addressVerified ? '✓' : ''}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartDocVerification}
                  disabled={documentVerified}
                  className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed"
                  style={{
                    background: documentVerified
                      ? 'var(--bg-accent)'
                      : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: documentVerified ? 'var(--text-secondary)' : '#000',
                    opacity: documentVerified ? 0.6 : 1,
                  }}
                >
                  {documentVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {idVerified && selfieVerified
                        ? 'Continue to Step 2'
                        : 'Start Verification'}
                    </>
                  )}
                </button>
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
                {defaultWallet && !isEditingWallet ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-accent)', border: '1px solid var(--border-color)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Saved Wallet Address</p>
                      <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                        {defaultWallet.address.slice(0, 6)}...{defaultWallet.address.slice(-4)}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {defaultWallet.network}
                      </p>
                    </div>
                    <button
                      onClick={handleEditWallet}
                      className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        backgroundColor: 'rgba(10, 132, 255, 0.1)',
                        color: '#0A84FF',
                        border: '1px solid rgba(10, 132, 255, 0.2)',
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit Wallet Address
                    </button>
                  </div>
                ) : (
                  <>
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
                    {isEditingWallet && (
                      <button
                        onClick={() => {
                          setIsEditingWallet(false);
                          setUsdtAddress(defaultWallet?.address || '');
                        }}
                        className="w-full py-2 rounded-xl font-medium text-sm transition-all active:scale-95"
                        style={{
                          backgroundColor: 'var(--bg-accent)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </>
                )}
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
                <PinInput
                  length={4}
                  value={pin}
                  onChange={setPin}
                  type="number"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Confirm PIN
                </label>
                <PinInput
                  length={4}
                  value={confirmPin}
                  onChange={setConfirmPin}
                  type="number"
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

      {/* PIN Verification Modal */}
      {showPinVerifyModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowPinVerifyModal(false)}
        >
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Verify PIN
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Please enter your PIN to edit wallet address
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Enter PIN
                </label>
                <PinInput
                  length={4}
                  value={verifyPinInput}
                  onChange={setVerifyPinInput}
                  type="number"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleVerifyPin}
                  disabled={verifyPinInput.length !== 4}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
                    color: 'white',
                  }}
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    setShowPinVerifyModal(false);
                    setVerifyPinInput('');
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

      {/* Phone PIN Verification Modal */}
      {showPhonePinVerifyModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowPhonePinVerifyModal(false)}
        >
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Verify PIN
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Please enter your PIN to edit phone number
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Enter PIN
                </label>
                <PinInput
                  length={4}
                  value={phonePinInput}
                  onChange={setPhonePinInput}
                  type="number"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleVerifyPhonePin}
                  disabled={phonePinInput.length !== 4}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
                    color: 'white',
                  }}
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    setShowPhonePinVerifyModal(false);
                    setPhonePinInput('');
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

      {/* Phone Verification Code Modal */}
      {showPhoneVerifyModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowPhoneVerifyModal(false)}
        >
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Verify Phone Number
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Enter the 6-digit code sent to {phoneNumber}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                  Verification Code
                </label>
                <PinInput
                  length={6}
                  value={phoneVerificationCode}
                  onChange={setPhoneVerificationCode}
                  type="number"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleVerifyPhone}
                  disabled={phoneVerificationCode.length !== 6}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    color: 'white',
                  }}
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    setShowPhoneVerifyModal(false);
                    setPhoneVerificationCode('');
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

      {/* Email Verification Code Modal */}
      {showEmailVerifyModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowEmailVerifyModal(false)}
        >
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Verify Email
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Enter the 6-digit code sent to {email}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                  Verification Code
                </label>
                <PinInput
                  length={6}
                  value={emailVerificationCode}
                  onChange={setEmailVerificationCode}
                  type="number"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleVerifyEmail}
                  disabled={emailVerificationCode.length !== 6}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    color: 'white',
                  }}
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    setShowEmailVerifyModal(false);
                    setEmailVerificationCode('');
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

      {/* Wallet Verification Code Modal */}
      {showWalletVerifyModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowWalletVerifyModal(false)}
        >
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Verify Wallet Address
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Enter the 6-digit code sent to your registered email
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                  Verification Code
                </label>
                <PinInput
                  length={6}
                  value={walletVerificationCode}
                  onChange={setWalletVerificationCode}
                  type="number"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmWalletVerification}
                  disabled={walletVerificationCode.length !== 6}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    color: 'white',
                  }}
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    setShowWalletVerifyModal(false);
                    setWalletVerificationCode('');
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

      {/* Document Verification Modal */}
      {showDocVerifyModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowDocVerifyModal(false)}
        >
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${docVerifyStep === 1 ? 'ring-2' : ''}`} style={{
                backgroundColor: docVerifyStep === 1 ? 'rgba(255, 215, 0, 0.1)' : 'var(--bg-accent)',
                ringColor: docVerifyStep === 1 ? '#FFD700' : 'transparent'
              }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{
                  backgroundColor: idVerified && selfieVerified ? '#22C55E' : '#FFD700',
                  color: 'white'
                }}>
                  {idVerified && selfieVerified ? '✓' : '1'}
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Identity</span>
              </div>
              <div className="w-8 h-0.5" style={{ backgroundColor: 'var(--border-color)' }} />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${docVerifyStep === 2 ? 'ring-2' : ''}`} style={{
                backgroundColor: docVerifyStep === 2 ? 'rgba(255, 215, 0, 0.1)' : 'var(--bg-accent)',
                ringColor: docVerifyStep === 2 ? '#FFD700' : 'transparent',
                opacity: docVerifyStep === 2 || (idVerified && selfieVerified) ? 1 : 0.5
              }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{
                  backgroundColor: videoSelfieVerified && addressVerified ? '#22C55E' : '#FFD700',
                  color: 'white'
                }}>
                  {videoSelfieVerified && addressVerified ? '✓' : '2'}
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Advanced</span>
              </div>
            </div>

            {/* Step 1 Content */}
            {docVerifyStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Step 1: Identity Verification
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Upload your government-issued ID and a selfie
                  </p>
                </div>

                {/* ID Verification */}
                <div className="p-5 rounded-xl" style={{
                  backgroundColor: 'var(--bg-accent)',
                  border: idVerified ? '2px solid #22C55E' : '1px solid var(--border-color)'
                }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: idVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(10, 132, 255, 0.1)'
                    }}>
                      <FileText className="w-6 h-6" style={{ color: idVerified ? '#22C55E' : '#0A84FF' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>ID Document</h3>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Passport, Driver's License, or National ID
                      </p>
                    </div>
                    {idVerified && <CheckCircle className="w-6 h-6 text-green-500" />}
                  </div>
                  {!idVerified && (
                    <button
                      onClick={handleIdUpload}
                      className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        backgroundColor: 'rgba(10, 132, 255, 0.1)',
                        color: '#0A84FF',
                        border: '1px solid rgba(10, 132, 255, 0.2)'
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      Upload ID Document
                    </button>
                  )}
                </div>

                {/* Selfie Verification */}
                <div className="p-5 rounded-xl" style={{
                  backgroundColor: 'var(--bg-accent)',
                  border: selfieVerified ? '2px solid #22C55E' : '1px solid var(--border-color)'
                }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: selfieVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(10, 132, 255, 0.1)'
                    }}>
                      <Camera className="w-6 h-6" style={{ color: selfieVerified ? '#22C55E' : '#0A84FF' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Selfie Photo</h3>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Clear photo of your face holding your ID
                      </p>
                    </div>
                    {selfieVerified && <CheckCircle className="w-6 h-6 text-green-500" />}
                  </div>
                  {!selfieVerified && (
                    <button
                      onClick={handleSelfieUpload}
                      className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        backgroundColor: 'rgba(10, 132, 255, 0.1)',
                        color: '#0A84FF',
                        border: '1px solid rgba(10, 132, 255, 0.2)'
                      }}
                    >
                      <Camera className="w-4 h-4" />
                      Take Selfie
                    </button>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCompleteStep1}
                    disabled={!idVerified || !selfieVerified}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: idVerified && selfieVerified
                        ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                        : 'rgba(255, 215, 0, 0.2)',
                      color: idVerified && selfieVerified ? '#000' : 'var(--text-secondary)',
                    }}
                  >
                    Continue to Step 2
                  </button>
                  <button
                    onClick={() => setShowDocVerifyModal(false)}
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
            )}

            {/* Step 2 Content */}
            {docVerifyStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Step 2: Advanced Verification
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Record a video selfie and upload proof of address
                  </p>
                </div>

                {/* Video Selfie */}
                <div className="p-5 rounded-xl" style={{
                  backgroundColor: 'var(--bg-accent)',
                  border: videoSelfieVerified ? '2px solid #22C55E' : '1px solid var(--border-color)'
                }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: videoSelfieVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(10, 132, 255, 0.1)'
                    }}>
                      <Video className="w-6 h-6" style={{ color: videoSelfieVerified ? '#22C55E' : '#0A84FF' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Video Selfie</h3>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Record a 5-second video saying your name
                      </p>
                    </div>
                    {videoSelfieVerified && <CheckCircle className="w-6 h-6 text-green-500" />}
                  </div>
                  {!videoSelfieVerified && (
                    <button
                      onClick={handleVideoSelfieUpload}
                      className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        backgroundColor: 'rgba(10, 132, 255, 0.1)',
                        color: '#0A84FF',
                        border: '1px solid rgba(10, 132, 255, 0.2)'
                      }}
                    >
                      <Video className="w-4 h-4" />
                      Record Video
                    </button>
                  )}
                </div>

                {/* Address Verification */}
                <div className="p-5 rounded-xl" style={{
                  backgroundColor: 'var(--bg-accent)',
                  border: addressVerified ? '2px solid #22C55E' : '1px solid var(--border-color)'
                }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: addressVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(10, 132, 255, 0.1)'
                    }}>
                      <Home className="w-6 h-6" style={{ color: addressVerified ? '#22C55E' : '#0A84FF' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Proof of Address</h3>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Utility bill, bank statement (less than 3 months old)
                      </p>
                    </div>
                    {addressVerified && <CheckCircle className="w-6 h-6 text-green-500" />}
                  </div>
                  {!addressVerified && (
                    <button
                      onClick={handleAddressUpload}
                      className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        backgroundColor: 'rgba(10, 132, 255, 0.1)',
                        color: '#0A84FF',
                        border: '1px solid rgba(10, 132, 255, 0.2)'
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Document
                    </button>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setDocVerifyStep(1)}
                    className="px-6 py-3 rounded-xl font-semibold transition-all active:scale-95"
                    style={{
                      backgroundColor: 'var(--bg-accent)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCompleteVerification}
                    disabled={!videoSelfieVerified || !addressVerified}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: videoSelfieVerified && addressVerified
                        ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                        : 'rgba(34, 197, 94, 0.2)',
                      color: videoSelfieVerified && addressVerified ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    Complete Verification
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShow2FAModal(false)}
        >
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Enable 2FA
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            <div className="mb-4 p-4 bg-white rounded-xl flex items-center justify-center">
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                QR Code Placeholder
              </div>
            </div>
            <p className="text-xs mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
              Manual key: ABCD-EFGH-IJKL-MNOP
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                  Enter 6-digit code from app
                </label>
                <PinInput
                  length={6}
                  value={twoFACode}
                  onChange={setTwoFACode}
                  type="number"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleEnable2FA}
                  disabled={twoFACode.length !== 6}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    color: 'white',
                  }}
                >
                  Enable 2FA
                </button>
                <button
                  onClick={() => {
                    setShow2FAModal(false);
                    setTwoFACode('');
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
