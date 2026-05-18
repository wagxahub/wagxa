import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export function AuthModal() {
  const navigate = useNavigate();
  const { showAuthModal, authMode, closeAuthModal, openAuthModal, signIn, signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (authMode === 'register') {
      if (!username.trim()) {
        toast.error('Please enter a username');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username);
      if (!error) {
        // Redirect to wallet after successful registration
        navigate('/wallet');
      }
    } else {
      const { error } = await signIn(email, password);
      if (!error) {
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      }
    }

    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={closeAuthModal}
    >
      <div
        className="rounded-2xl shadow-2xl p-6 max-w-md w-full"
        style={{ backgroundColor: 'var(--bg-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-lg transition-all hover:scale-110"
            style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="w-full pl-10 pr-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Choose a username"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl"
                style={{
                  backgroundColor: 'var(--bg-accent)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl"
                style={{
                  backgroundColor: 'var(--bg-accent)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                placeholder="••••••••"
              />
            </div>
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
              color: 'white',
            }}
          >
            {loading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                closeAuthModal();
                setTimeout(() => {
                  openAuthModal(authMode === 'login' ? 'register' : 'login');
                }, 100);
              }}
              className="font-semibold"
              style={{ color: '#0A84FF' }}
            >
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
