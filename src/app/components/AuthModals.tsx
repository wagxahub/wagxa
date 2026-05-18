import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalsProps {
  show: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthModals({
  show,
  onClose,
  initialMode = 'login',
  onSuccess,
}: AuthModalsProps) {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setIsLoading(true);

    try {
      const { error: authError } = await signIn(loginData.email, loginData.password);

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onClose();

      if (onSuccess) onSuccess();

      window.location.href = "/dashboard";

    } catch (err) {
      setError("Something went wrong");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setIsLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!registerData.username.trim()) {
      setError("Please enter a username");
      setIsLoading(false);
      return;
    }

    try {
      const { error: authError } = await signUp(
        registerData.email,
        registerData.password,
        registerData.username
      );

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onClose();

      if (onSuccess) onSuccess();

      window.location.href = "/wallet";

    } catch (err) {
      setError("Something went wrong");
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  if (!show) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      >
        {/* MODAL */}
        <div
          className="relative w-full max-w-md animate-modal-in"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#111111',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(0, 255, 204, 0.2)',
          }}
        >

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <X className="w-5 h-5" style={{ color: '#94A3B8' }} />
          </button>

          {/* ERROR */}
          {error && (
            <div className="mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* LOGIN */}
          {mode === 'login' && (
            <div>
              <h2 className="text-3xl font-black mb-2" style={{ color: '#fff' }}>
                Welcome back
              </h2>

              <p className="text-base mb-8" style={{ color: '#94A3B8' }}>
                Login to join the round
              </p>

              <form onSubmit={handleLogin} className="space-y-5">

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: '#64748B' }} />

                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 rounded-xl"
                      style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#fff',
                      }}
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: '#64748B' }} />

                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      className="w-full pl-12 pr-12 py-4 rounded-xl"
                      style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#fff',
                      }}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-all active:scale-95"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-5 h-5" style={{ color: '#64748B' }} />
                      ) : (
                        <Eye className="w-5 h-5" style={{ color: '#64748B' }} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #00ffcc, #00b3ff)',
                    color: '#000',
                  }}
                >
                  {isLoading ? 'Logging in...' : 'Login & Join Round'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-400">
                No account?{' '}
                <button onClick={switchMode} className="text-cyan-400 font-bold">
                  Register
                </button>
              </p>
            </div>
          )}

          {/* REGISTER */}
          {mode === 'register' && (
            <div>
              <h2 className="text-3xl font-black mb-2" style={{ color: '#fff' }}>
                Create account
              </h2>

              <p className="text-base mb-8" style={{ color: '#94A3B8' }}>
                Start playing in seconds
              </p>

              <form onSubmit={handleRegister} className="space-y-5">

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: '#64748B' }} />
                  <input
                    type="text"
                    placeholder="Username"
                    value={registerData.username}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, username: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-4 rounded-xl"
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#fff',
                    }}
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: '#64748B' }} />
                  <input
                    type="email"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-4 rounded-xl"
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#fff',
                    }}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: '#64748B' }} />
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, password: e.target.value })
                    }
                    className="w-full pl-12 pr-12 py-4 rounded-xl"
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#fff',
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-all active:scale-95"
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="w-5 h-5" style={{ color: '#64748B' }} />
                    ) : (
                      <Eye className="w-5 h-5" style={{ color: '#64748B' }} />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: '#64748B' }} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-12 py-4 rounded-xl"
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#fff',
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-all active:scale-95"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" style={{ color: '#64748B' }} />
                    ) : (
                      <Eye className="w-5 h-5" style={{ color: '#64748B' }} />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #00ffcc, #00b3ff)',
                    color: '#000',
                  }}
                >
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{' '}
                <button onClick={switchMode} className="text-cyan-400 font-bold">
                  Login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
