import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get('redirect') || '/student/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password, 'STUDENT');
    setLoading(false);

    if (result.success) {
      navigate(redirectUrl);
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="py-20 bg-[#010914] min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-[#00D9FF] font-tech text-xs tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4 text-[#FFC800]" />
            <span>PORTAL ACCESS</span>
          </div>
          <h1 className="font-anton text-4xl text-white tracking-wide">
            STUDENT <span className="text-[#FFC800]">LOGIN</span>
          </h1>
          <p className="font-oswald text-xs sm:text-sm text-[#8594A6] tracking-wider uppercase">
            ENGINEER'S DAY 2026 REGISTRATION CONSOLE
          </p>
        </div>

        {/* Login Card */}
        <div className="hud-card p-8 rounded-lg border border-[#00D9FF]/30 shadow-neon-cyan">
          {error && (
            <div className="mb-6 p-4 rounded bg-[#FF4444]/10 border border-[#FF4444]/40 text-[#FF4444] text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                STUDENT EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-tech text-xs text-[#D0D5DC] uppercase">
                  PASSWORD
                </label>
                <Link
                  to="/forgot-password"
                  className="font-tech text-[11px] text-[#00D9FF] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-base tracking-wider rounded shadow-neon-yellow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>ACCESS DASHBOARD</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-[#8594A6]">
            New participant?{' '}
            <Link to="/register" className="text-[#00D9FF] font-tech font-bold hover:underline">
              Create student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
