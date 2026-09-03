import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Administrative credentials are required.');
      return;
    }

    setLoading(true);
    const result = await login(email, password, 'ADMIN');
    setLoading(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message || 'Access denied. Invalid administrator credentials.');
    }
  };

  return (
    <div className="py-20 bg-[#000510] min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded bg-[#010914] border-2 border-[#FFC800] text-[#FFC800] flex items-center justify-center mx-auto shadow-neon-yellow">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
            ADMINISTRATIVE <span className="text-[#FFC800]">PORTAL</span>
          </h1>
          <p className="font-tech text-xs text-[#8594A6] tracking-widest uppercase">
            RESTRICTED ACCESS • UNIVERSITY EVENT COMMITTEE
          </p>
        </div>

        {/* Card */}
        <div className="hud-card p-8 rounded-lg border-2 border-[#FFC800]/40 shadow-neon-yellow space-y-6">
          {error && (
            <div className="p-4 rounded bg-[#FF4444]/15 border border-[#FF4444] text-[#FF4444] text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                ADMINISTRATOR EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@engineeringday2026.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#010914] border border-[#FFC800]/30 rounded text-xs text-white focus:outline-none focus:border-[#FFC800]"
                />
              </div>
            </div>

            <div>
              <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#010914] border border-[#FFC800]/30 rounded text-xs text-white focus:outline-none focus:border-[#FFC800]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-yellow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>VERIFYING SECURITY CREDENTIALS...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>AUTHORIZE ADMINISTRATIVE ACCESS</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center">
            <Link
              to="/"
              className="inline-flex items-center space-x-1 text-xs font-tech text-[#8594A6] hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
