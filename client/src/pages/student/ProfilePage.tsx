import React, { useState } from 'react';
import { User, Mail, Phone, BookOpen, Layers, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      if (res.data?.success) {
        setPwSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      setPwError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="py-14 bg-[#010914] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-[#00D9FF] font-tech text-xs tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4 text-[#FFC800]" />
            <span>STUDENT PROFILE & SECURITY CONSOLE</span>
          </div>
          <h1 className="font-anton text-3xl sm:text-5xl text-white tracking-wide">
            MY <span className="text-[#FFC800]">PROFILE</span>
          </h1>
          <p className="font-oswald text-xs sm:text-sm text-[#8594A6] tracking-wider uppercase">
            MANAGE YOUR UNIVERSITY CREDENTIALS AND ACCESS CONTROLS
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Details Card */}
          <div className="hud-card p-6 rounded-lg border border-[#00D9FF]/30 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded bg-[#008CFF]/20 text-[#00D9FF] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-oswald text-lg text-white uppercase font-bold">
                  STUDENT RECORD
                </h3>
                <span className="font-tech text-xs text-[#8594A6]">University Enrolled Profile</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-tech">
              <div>
                <span className="text-[#8594A6] block uppercase">FULL NAME</span>
                <span className="text-white font-bold text-sm">{user?.fullName}</span>
              </div>

              <div>
                <span className="text-[#8594A6] block uppercase">EMAIL ADDRESS</span>
                <span className="text-white font-bold">{user?.email}</span>
              </div>

              <div>
                <span className="text-[#8594A6] block uppercase">CONTACT MOBILE</span>
                <span className="text-white font-bold">{user?.profile?.mobile || 'N/A'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[#8594A6] block uppercase">COURSE</span>
                  <span className="text-white font-bold">{user?.profile?.course || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#8594A6] block uppercase">SEMESTER</span>
                  <span className="text-white font-bold">{user?.profile?.semester || 'N/A'}</span>
                </div>
              </div>

              <div>
                <span className="text-[#8594A6] block uppercase">ENROLLMENT NUMBER</span>
                <span className="text-[#FFC800] font-bold">
                  {user?.profile?.enrollmentNumber || 'Not specified'}
                </span>
              </div>

              <div>
                <span className="text-[#8594A6] block uppercase">DEPARTMENT</span>
                <span className="text-white font-bold">
                  {user?.profile?.department || 'Department of Engineering'}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="hud-card p-6 rounded-lg border border-[#FFC800]/30 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded bg-[#FFC800]/20 text-[#FFC800] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-oswald text-lg text-white uppercase font-bold">
                  CHANGE PASSWORD
                </h3>
                <span className="font-tech text-xs text-[#8594A6]">Security & Session Protection</span>
              </div>
            </div>

            {pwSuccess && (
              <div className="p-3 bg-[#00D9FF]/10 border border-[#00D9FF]/40 text-[#00D9FF] text-xs rounded flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{pwSuccess}</span>
              </div>
            )}

            {pwError && (
              <div className="p-3 bg-[#FF4444]/10 border border-[#FF4444]/40 text-[#FF4444] text-xs rounded flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                  CURRENT PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#000510] border border-white/10 rounded text-xs text-white focus:outline-none focus:border-[#FFC800]"
                />
              </div>

              <div>
                <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#000510] border border-white/10 rounded text-xs text-white focus:outline-none focus:border-[#FFC800]"
                />
              </div>

              <div>
                <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#000510] border border-white/10 rounded text-xs text-white focus:outline-none focus:border-[#FFC800]"
                />
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-3 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-yellow transition-all disabled:opacity-50"
              >
                {pwLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
