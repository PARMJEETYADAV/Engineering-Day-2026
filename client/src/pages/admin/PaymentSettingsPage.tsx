import React, { useState, useEffect } from 'react';
import { QrCode, Upload, Save, CheckCircle2, AlertCircle, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export const PaymentSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [upiId, setUpiId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingText, setSavingText] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Database Purge state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [purgingDb, setPurgingDb] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      if (res.data?.success) {
        const s = res.data.settings;
        setSettings(s);
        setUpiId(s.payment_upi_id || '');
        setAccountName(s.payment_account_name || '');
        setInstructions(s.payment_instructions || '');
        setUniversityName(s.university_name || '');
        setQrCodeUrl(s.payment_qr_code || '/uploads/qr_codes/default_qr.jpeg');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveTextSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingText(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.patch('/admin/settings', {
        upiId,
        accountName,
        instructions,
        universityName,
      });

      if (res.data?.success) {
        setMessage('Payment and university configuration updated successfully!');
        setTimeout(() => setMessage(null), 3500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSavingText(false);
    }
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadQr = async () => {
    if (!qrFile) return;
    setUploadingQr(true);
    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append('qrCode', qrFile);

    try {
      const res = await api.post('/admin/settings/qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setMessage('New UPI QR Code published live to all payment pages!');
        setQrCodeUrl(res.data.qrCodeUrl);
        setQrFile(null);
        setQrPreview(null);
        setTimeout(() => setMessage(null), 3500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload QR image.');
    } finally {
      setUploadingQr(false);
    }
  };

  const handlePurgeDatabase = async () => {
    if (resetConfirmText.trim() !== 'RESET') {
      alert('Please type RESET in uppercase to confirm.');
      return;
    }

    setPurgingDb(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.post('/admin/clear-registrations');
      if (res.data?.success) {
        setMessage(res.data.message);
        setShowResetModal(false);
        setResetConfirmText('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purge database records.');
    } finally {
      setPurgingDb(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
          PAYMENT & QR <span className="text-[#00D9FF]">CONFIGURATION</span>
        </h1>
        <p className="font-tech text-xs text-[#8594A6]">
          Manage Official University UPI ID, Account Identity, Payment Instructions, and Live QR Code Graphic
        </p>
      </div>

      {message && (
        <div className="p-3 bg-[#00D9FF]/15 border border-[#00D9FF] text-[#00D9FF] text-xs rounded flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#FF4444]/15 border border-[#FF4444] text-[#FF4444] text-xs rounded flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: QR Code Preview & Replacement (5 cols) */}
        <div className="lg:col-span-5 hud-card p-6 rounded-lg border-2 border-[#00D9FF]/40 shadow-neon-cyan space-y-6">
          <div className="flex items-center space-x-2 text-[#00D9FF] pb-3 border-b border-white/10">
            <QrCode className="w-5 h-5 text-[#FFC800]" />
            <h2 className="font-oswald text-base text-white uppercase font-bold">
              ACTIVE PAYMENT QR CODE
            </h2>
          </div>

          <div className="text-center space-y-3">
            <div className="p-4 bg-white rounded-lg inline-block shadow-lg border-2 border-[#00D9FF]">
              <img
                src={qrPreview || qrCodeUrl || '/uploads/qr_codes/default_qr.jpeg'}
                alt="Active Payment QR"
                className="w-56 h-56 object-contain mx-auto"
              />
            </div>
            <p className="text-[11px] font-tech text-[#00D9FF]">
              {qrPreview ? 'PREVIEW OF NEW SELECTION' : 'CURRENTLY DISPLAYED ON PAYMENT SCREEN'}
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-white/10">
            <label className="block font-tech text-xs text-[#D0D5DC] uppercase">
              UPLOAD / REPLACE QR CODE IMAGE
            </label>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleQrFileChange}
              className="w-full text-xs font-tech text-[#8594A6] file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-anton file:bg-[#00D9FF] file:text-[#010914] hover:file:bg-[#00BFFF] cursor-pointer"
            />

            {qrFile && (
              <button
                type="button"
                disabled={uploadingQr}
                onClick={handleUploadQr}
                className="w-full py-2.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-xs tracking-wider rounded shadow-neon-yellow transition-all disabled:opacity-50"
              >
                {uploadingQr ? 'UPLOADING...' : 'CONFIRM & PUBLISH THIS QR CODE'}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Text Configuration Form (7 cols) */}
        <div className="lg:col-span-7 hud-card p-6 rounded-lg border border-white/10 space-y-6">
          <h2 className="font-oswald text-base text-white uppercase font-bold pb-3 border-b border-white/10">
            UPI ACCOUNT & PAYMENT INSTRUCTIONS
          </h2>

          <form onSubmit={handleSaveTextSettings} className="space-y-4 text-xs font-tech">
            <div>
              <label className="text-[#8594A6] uppercase block mb-1">
                OFFICIAL UPI ID <span className="text-[#FFC800]">*</span>
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="engineeringday2026@upi"
                className="w-full p-2.5 bg-[#010914] border border-[#00D9FF]/30 rounded text-sm text-[#00D9FF] font-mono focus:outline-none focus:border-[#00D9FF]"
              />
            </div>

            <div>
              <label className="text-[#8594A6] uppercase block mb-1">
                PAYEE / ACCOUNT NAME <span className="text-[#FFC800]">*</span>
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Engineering Day 2026 Organizers"
                className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-sm text-white focus:outline-none focus:border-[#00D9FF]"
              />
            </div>

            <div>
              <label className="text-[#8594A6] uppercase block mb-1">
                UNIVERSITY EMBLEM TITLE
              </label>
              <input
                type="text"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="University Institute of Engineering & Technology"
                className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-sm text-white focus:outline-none focus:border-[#00D9FF]"
              />
            </div>

            <div>
              <label className="text-[#8594A6] uppercase block mb-1">
                PAYMENT INSTRUCTIONS DISPLAYED TO STUDENTS
              </label>
              <textarea
                rows={5}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-xs text-[#D0D5DC] focus:outline-none focus:border-[#00D9FF]"
              />
            </div>

            <button
              type="submit"
              disabled={savingText}
              className="px-8 py-3 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-xs tracking-wider rounded shadow-neon-yellow transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingText ? 'SAVING...' : 'SAVE SETTINGS'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone: Database Maintenance & Registrations Reset */}
      <div className="hud-card p-6 rounded-lg border-2 border-[#FF4444]/40 bg-[#FF4444]/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[#FF4444]">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="font-anton text-lg text-white tracking-wide">
                DANGER ZONE: <span className="text-[#FF4444]">DATABASE PURGE & RESET</span>
              </h2>
            </div>
            <p className="font-tech text-xs text-[#8594A6]">
              Permanently purges all registrations, e-sports teams, payments, and uploaded receipt screenshots.
              <br />
              <span className="text-[#00D9FF]">Note:</span> Admin accounts, official events, and payment configurations are safely preserved.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setResetConfirmText('');
              setShowResetModal(true);
            }}
            className="px-5 py-2.5 bg-[#FF4444] hover:bg-red-600 text-white font-anton text-xs tracking-wider rounded flex items-center space-x-2 shadow-[0_0_15px_rgba(255,68,68,0.4)]"
          >
            <Trash2 className="w-4 h-4" />
            <span>RESET REGISTRATION DATABASE</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="hud-card max-w-md w-full p-6 rounded-lg border-2 border-[#FF4444] space-y-4">
            <div className="flex items-center space-x-2 text-[#FF4444]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-anton text-xl text-white">CONFIRM DATABASE PURGE</h3>
            </div>

            <p className="text-xs text-[#D0D5DC] font-tech leading-relaxed">
              This action will permanently delete all student registrations, BGMI/Free Fire teams, payments, and uploaded screenshot files.
            </p>

            <div className="p-3 bg-[#010914] border border-[#FF4444]/30 rounded text-xs font-tech text-[#FFC800]">
              To prevent accidental deletion, please type <strong className="text-white font-mono">RESET</strong> below:
            </div>

            <input
              type="text"
              placeholder="Type RESET to confirm"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="w-full p-2.5 bg-[#010914] border border-[#FF4444]/50 rounded text-xs font-mono text-white text-center tracking-widest focus:outline-none focus:border-[#FF4444]"
            />

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-xs font-tech text-[#8594A6] rounded"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={purgingDb || resetConfirmText.trim() !== 'RESET'}
                onClick={handlePurgeDatabase}
                className="px-6 py-2 bg-[#FF4444] hover:bg-red-600 text-white font-anton text-xs tracking-wider rounded disabled:opacity-40"
              >
                {purgingDb ? 'PURGING DATABASE...' : 'PERMANENTLY RESET DATA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
