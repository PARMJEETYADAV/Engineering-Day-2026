import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 bg-[#010914] min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-anton text-3xl text-white tracking-wide">
            RECOVER <span className="text-[#FFC800]">ACCOUNT</span>
          </h1>
          <p className="font-tech text-xs text-[#8594A6]">
            Enter your university registered email to receive reset instructions
          </p>
        </div>

        <div className="hud-card p-8 rounded-lg border border-[#00D9FF]/30">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-[#00D9FF] mx-auto" />
              <h3 className="font-oswald text-lg text-white">INSTRUCTIONS DISPATCHED</h3>
              <p className="text-xs text-[#D0D5DC] leading-relaxed">
                If an active student account is associated with <strong>{email}</strong>, a recovery notice has been sent. Check your inbox and spam folders.
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 text-xs font-tech text-[#FFC800] hover:underline"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-[#FF4444]/10 border border-[#FF4444]/40 text-[#FF4444] text-xs rounded">
                  {error}
                </div>
              )}
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
                    className="w-full pl-9 pr-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs text-white focus:outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#00D9FF] hover:bg-[#00BFFF] text-[#010914] font-anton text-sm tracking-wider rounded transition-all shadow-neon-cyan"
              >
                {loading ? 'TRANSMITTING...' : 'SEND RESET INSTRUCTIONS'}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1 text-xs font-tech text-[#8594A6] hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
