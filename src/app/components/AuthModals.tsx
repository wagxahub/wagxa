import { useState } from 'react';
import { X, Mail, Lock } from 'lucide-react';
import { supabase } from "../../lib/supabase";

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

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // ✅ LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔥 LOGIN CLICKED");

    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      console.log("🔥 SUPABASE LOGIN RESPONSE:", { data, error });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      if (!data?.session) {
        setError("No session created");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onClose();

      if (onSuccess) onSuccess();

      window.location.href = "/wallet";

    } catch (err) {
      console.log(err);
      setError("Something went wrong");
      setIsLoading(false);
    }
  };

  // ✅ REGISTER (basic working version)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setIsLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
      });

      console.log("🔥 REGISTER RESPONSE:", { data, error });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onClose();

      if (onSuccess) onSuccess();

      window.location.href = "/wallet";

    } catch (err) {
      console.log(err);
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
        }}
      />

      {/* MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 380,
          margin: '80px auto',
          padding: 24,
          borderRadius: 16,
          background: '#111',
          color: 'white',
        }}
      >
        {/* CLOSE */}
        <button onClick={onClose} style={{ float: 'right' }}>
          <X />
        </button>

        {/* ERROR */}
        {error && (
          <p style={{ color: 'red', marginBottom: 10 }}>{error}</p>
        )}

        {/* LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <h2>Login</h2>

            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />

            <button disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <p onClick={switchMode} style={{ cursor: 'pointer' }}>
              No account? Register
            </p>
          </form>
        )}

        {/* REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <h2>Register</h2>

            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={registerData.confirmPassword}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  confirmPassword: e.target.value,
                })
              }
            />

            <button disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Account"}
            </button>

            <p onClick={switchMode} style={{ cursor: 'pointer' }}>
              Already have account? Login
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
