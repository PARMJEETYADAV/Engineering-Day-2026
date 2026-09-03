import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QrCode, Copy, Check, Upload, AlertCircle, ShieldCheck, ArrowLeft, Clock, FileImage } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import { RegistrationItem, PaymentConfig } from '../../types';

export const PaymentPage: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState<RegistrationItem | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!registrationId) return;

    // Load registration details and active payment config concurrently
    Promise.all([
      api.get(`/registrations/${registrationId}`),
      api.get('/payments/config'),
    ])
      .then(([regRes, configRes]) => {
        if (regRes.data?.success) {
          setRegistration(regRes.data.registration);
          // If already has transaction ID
          if (regRes.data.registration.payment?.transactionId) {
            setTransactionId(regRes.data.registration.payment.transactionId);
          }
        }
        if (configRes.data?.success) {
          setPaymentConfig(configRes.data.config);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load registration or payment configuration.');
      })
      .finally(() => setLoading(false));
  }, [registrationId]);

  const handleCopyUpi = () => {
    if (paymentConfig?.upiId) {
      navigator.clipboard.writeText(paymentConfig.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image exceeds the 5MB file size limit.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file format. Only JPG, PNG, and WEBP images are supported.');
      return;
    }

    setScreenshotFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!transactionId || transactionId.trim().length < 4) {
      setError('Please provide a valid 12-digit UTR / Transaction ID from your payment receipt.');
      return;
    }

    if (!screenshotFile && !registration?.payment?.screenshotPath) {
      setError('Please upload a screenshot or receipt of your completed payment.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('registrationId', registrationId!);
    formData.append('transactionId', transactionId.trim());
    if (screenshotFile) {
      formData.append('screenshot', screenshotFile);
    }

    try {
      const res = await api.post('/payments/proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        // Trigger subtle confetti celebration
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#00D9FF', '#FFC800', '#008CFF'],
        });

        navigate(`/student/registrations/${registrationId}?submitted=true`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#00D9FF] font-tech text-xs">
        INITIALIZING SECURE PAYMENT INTERFACE...
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="py-24 text-center hud-card max-w-md mx-auto p-8 rounded">
        <h2 className="font-anton text-2xl text-white">REGISTRATION NOT FOUND</h2>
        <Link to="/student/dashboard" className="text-xs font-tech text-[#FFC800] mt-4 block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="py-14 bg-[#010914] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          to="/student/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-tech text-[#8594A6] hover:text-[#00D9FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO DASHBOARD</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-[#00D9FF] font-tech text-xs tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4 text-[#FFC800]" />
            <span>OFFICIAL UNIVERSITY PAYMENT CONSOLE</span>
          </div>
          <h1 className="font-anton text-3xl sm:text-5xl text-white tracking-wide">
            SCAN & <span className="text-[#FFC800]">PAY</span>
          </h1>
          <p className="font-oswald text-xs sm:text-sm text-[#8594A6] tracking-wider uppercase">
            COMPLETE UPI TRANSACTION AND SUBMIT VERIFICATION PROOF
          </p>
        </div>

        {/* Rejection Alert if Re-uploading */}
        {registration.status === 'REJECTED' && registration.payment?.rejectionReason && (
          <div className="p-4 rounded-lg bg-[#FF4444]/10 border border-[#FF4444]/40 text-xs text-[#FFC800] flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-[#FF4444] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white uppercase font-bold block mb-0.5">
                PAYMENT RE-UPLOAD REQUIRED:
              </strong>
              <span>{registration.payment.rejectionReason}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded bg-[#FF4444]/10 border border-[#FF4444]/40 text-[#FF4444] text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Split: Left = Event Information, Right = Payment Scanner & Proof */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Event Specs & Fee */}
          <div className="lg:col-span-5 space-y-6">
            <div className="hud-card p-6 rounded-lg border border-[#00D9FF]/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-tech text-xs text-[#00D9FF] uppercase font-bold">
                  REGISTRATION SPECIFICATION
                </span>
                <span className="px-2 py-0.5 rounded bg-[#00D9FF]/10 font-mono text-xs text-[#00D9FF]">
                  {registration.registrationNumber}
                </span>
              </div>

              <div>
                <span className="font-tech text-[10px] text-[#8594A6] uppercase block">
                  SELECTED TOURNAMENT
                </span>
                <h2 className="font-anton text-2xl text-white tracking-wide mt-0.5">
                  {registration.event.name}
                </h2>
                <p className="text-xs text-[#8594A6] mt-1 leading-relaxed">
                  {registration.event.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2 text-xs font-tech">
                <div className="flex items-center justify-between">
                  <span className="text-[#8594A6]">EVENT DATE:</span>
                  <span className="text-white">{registration.event.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8594A6]">VENUE:</span>
                  <span className="text-white">{registration.event.venue || 'Campus Arena'}</span>
                </div>
                {registration.teamName && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8594A6]">SQUAD NAME:</span>
                    <span className="text-[#00D9FF] font-bold">{registration.teamName}</span>
                  </div>
                )}
              </div>

              {/* Total Payable Box */}
              <div className="p-4 rounded bg-[#000510] border-2 border-[#FFC800] text-center space-y-1">
                <span className="font-tech text-[11px] text-[#8594A6] uppercase tracking-wider block">
                  TOTAL AMOUNT PAYABLE
                </span>
                <div className="font-anton text-4xl text-[#FFC800] glow-yellow">
                  ₹{registration.event.registrationFee}
                </div>
                <span className="font-tech text-[10px] text-[#00D9FF] block">
                  * Calculated directly from university event database
                </span>
              </div>

              <div className="text-[11px] text-[#8594A6] space-y-1 pt-2">
                <p>• Single unified fee covering all team members for squad events.</p>
                <p>• Do not alter payment amount. Exact match required for admin approval.</p>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code, UPI Details, and Upload Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="hud-card p-8 rounded-lg border-2 border-[#00D9FF]/40 shadow-neon-cyan space-y-8">
              {/* QR and UPI ID Showcase */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10">
                {/* QR Code Container */}
                <div className="relative p-3 bg-white rounded-lg shadow-[0_0_20px_rgba(0,217,255,0.3)] shrink-0">
                  <img
                    src={paymentConfig?.qrCodeUrl || '/uploads/qr_codes/default_qr.jpeg'}
                    alt="University UPI QR Code"
                    className="w-44 h-44 object-contain"
                  />
                  <div className="mt-1 text-center font-tech text-[10px] text-gray-800 font-bold uppercase tracking-wider">
                    SCAN TO PAY ₹{registration.event.registrationFee}
                  </div>
                </div>

                {/* UPI ID & Details */}
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div className="inline-flex items-center space-x-1.5 text-xs font-tech text-[#FFC800] font-bold">
                    <QrCode className="w-4 h-4" />
                    <span>INSTANT UPI TRANSFER</span>
                  </div>

                  <div>
                    <span className="font-tech text-[10px] text-[#8594A6] uppercase block">
                      PAYEE ACCOUNT NAME
                    </span>
                    <span className="font-oswald text-base text-white font-bold">
                      {paymentConfig?.accountName || "Engineer's Day Organizers"}
                    </span>
                  </div>

                  <div>
                    <span className="font-tech text-[10px] text-[#8594A6] uppercase block mb-1">
                      UPI ID
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1.5 bg-[#000510] border border-[#00D9FF]/40 rounded font-mono text-xs text-[#00D9FF] select-all">
                        {paymentConfig?.upiId || 'engineeringday2026@upi'}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-3 py-1.5 bg-[#008CFF]/20 hover:bg-[#008CFF]/40 border border-[#008CFF]/40 rounded text-xs font-tech text-white flex items-center space-x-1"
                        title="Copy UPI ID"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#00D9FF]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#8594A6] leading-snug">
                    Supported: Google Pay, PhonePe, Paytm, BHIM, and all banking UPI apps.
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded bg-[#000510] border border-[#00D9FF]/20 space-y-1.5 text-xs font-tech text-[#D0D5DC]">
                <strong className="text-[#FFC800] uppercase block">SUBMISSION INSTRUCTIONS:</strong>
                <ol className="list-decimal list-inside space-y-1 text-[#8594A6]">
                  <li>Scan the QR code and transfer exactly ₹{registration.event.registrationFee}.</li>
                  <li>Copy the 12-digit Transaction / UTR Number from your bank receipt.</li>
                  <li>Upload a screenshot of the completed payment receipt below.</li>
                  <li>Submit for manual verification by the event committee.</li>
                </ol>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleSubmitProof} className="space-y-6">
                {/* Transaction ID / UTR */}
                <div>
                  <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                    TRANSACTION ID / UTR NUMBER <span className="text-[#FF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 12-digit UTR (e.g. 423589123456)"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#000510] border border-[#00D9FF]/30 rounded text-sm text-white font-mono placeholder-[#8594A6] focus:outline-none focus:border-[#00D9FF]"
                  />
                  <span className="text-[10px] text-[#8594A6] font-tech mt-1 block">
                    Found in your UPI payment details receipt under 'UPI Ref No' or 'UTR'.
                  </span>
                </div>

                {/* Screenshot Upload Dropzone */}
                <div>
                  <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                    PAYMENT SCREENSHOT PROOF <span className="text-[#FF4444]">*</span>
                  </label>

                  <div className="relative border-2 border-dashed border-[#00D9FF]/40 rounded-lg p-6 text-center hover:border-[#00D9FF] transition-colors bg-[#000510]/50">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {previewUrl ? (
                      <div className="space-y-3">
                        <img
                          src={previewUrl}
                          alt="Uploaded Receipt Preview"
                          className="max-h-48 mx-auto rounded border border-[#00D9FF]/40 object-contain shadow-neon-cyan"
                        />
                        <div className="text-xs font-tech text-[#00D9FF]">
                          {screenshotFile?.name} (Click or drag to replace)
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-[#00D9FF] mx-auto animate-bounce" />
                        <div className="font-oswald text-sm text-white tracking-wider">
                          CLICK TO BROWSE OR DRAG RECEIPT HERE
                        </div>
                        <p className="text-[11px] text-[#8594A6] font-tech">
                          Allowed: JPG, JPEG, PNG, WEBP (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Note */}
                <div className="p-3 rounded bg-[#008CFF]/10 border border-[#008CFF]/30 text-[11px] font-tech text-[#00D9FF] flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#FFC800] shrink-0" />
                  <span>
                    Your payment will be verified by the event administration team before registration is confirmed.
                  </span>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-base tracking-wider rounded shadow-neon-yellow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>UPLOADING & VERIFYING PROOF...</span>
                  ) : (
                    <>
                      <span>SUBMIT PAYMENT PROOF FOR VERIFICATION</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
