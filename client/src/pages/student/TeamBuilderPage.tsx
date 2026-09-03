import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Upload,
  Copy,
  Check,
  ExternalLink,
  Shield,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface MemberForm {
  fullName: string;
  email: string;
  mobile: string;
  course: string;
  semester: string;
  enrollmentNumber: string;
  ign: string;
  gameUid: string;
}

export const TeamBuilderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const gameParam = searchParams.get('game')?.toUpperCase() === 'FREE_FIRE' ? 'FREE_FIRE' : 'BGMI';
  const game = gameParam as 'BGMI' | 'FREE_FIRE';

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Team & Members, 2: Payment & Proof, 3: Confirmation
  const [teamName, setTeamName] = useState('');
  const [captainIgn, setCaptainIgn] = useState('');
  const [captainGameUid, setCaptainGameUid] = useState('');
  const [additionalMembers, setAdditionalMembers] = useState<MemberForm[]>([]);

  // Payment State
  const [createdTeam, setCreatedTeam] = useState<any>(null);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch active payment settings (UPI ID & QR)
  useEffect(() => {
    api.get('/public/payment-config').then((res) => {
      if (res.data?.success) {
        setPaymentConfig(res.data.paymentConfig);
      }
    });
  }, []);

  // Total members calculation (Captain + additional)
  const totalMemberCount = 1 + additionalMembers.length;
  const feePerMember = 49;
  const totalAmount = totalMemberCount * feePerMember;

  const gameUidLabel = game === 'BGMI' ? 'BGMI Player ID' : 'Free Fire UID';
  const gameUidPlaceholder = game === 'BGMI' ? 'e.g. 5123456789' : 'e.g. 1234567890';

  const handleAddMember = () => {
    if (totalMemberCount >= 4) return;
    setError(null);
    setAdditionalMembers([
      ...additionalMembers,
      {
        fullName: '',
        email: '',
        mobile: '',
        course: user?.profile?.course || 'B.Tech CSE',
        semester: user?.profile?.semester || '6th',
        enrollmentNumber: '',
        ign: '',
        gameUid: '',
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    setError(null);
    setAdditionalMembers(additionalMembers.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof MemberForm, value: string) => {
    const updated = [...additionalMembers];
    updated[index][field] = value;
    setAdditionalMembers(updated);
  };

  const handleCopyUpi = () => {
    if (paymentConfig?.upiId) {
      navigator.clipboard.writeText(paymentConfig.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  // Step 1 Submission: Create Team Record on Backend
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teamName.trim() || teamName.trim().length < 3) {
      setError('Team name must be at least 3 characters long.');
      return;
    }

    if (!captainIgn.trim() || !captainGameUid.trim()) {
      setError(`Please enter your Captain In-Game Name (IGN) and ${gameUidLabel}.`);
      return;
    }

    // Validate additional members
    for (let i = 0; i < additionalMembers.length; i++) {
      const m = additionalMembers[i];
      if (!m.fullName.trim() || !m.email.trim() || !m.mobile.trim() || !m.ign.trim() || !m.gameUid.trim()) {
        setError(`Please fill in all required fields for Member ${i + 2}.`);
        return;
      }
      if (m.mobile.replace(/\D/g, '').length !== 10) {
        setError(`Member ${i + 2} mobile number must be exactly 10 digits.`);
        return;
      }
    }

    // Check duplicate fields within team
    const allEmails = [user?.email?.toLowerCase(), ...additionalMembers.map((m) => m.email.toLowerCase().trim())];
    const allMobiles = [user?.profile?.mobile, ...additionalMembers.map((m) => m.mobile.trim())];
    const allUids = [captainGameUid.trim().toLowerCase(), ...additionalMembers.map((m) => m.gameUid.trim().toLowerCase())];

    if (new Set(allEmails).size !== allEmails.length) {
      setError('Duplicate email address detected within the team.');
      return;
    }
    if (new Set(allMobiles).size !== allMobiles.length) {
      setError('Duplicate mobile number detected within the team.');
      return;
    }
    if (new Set(allUids).size !== allUids.length) {
      setError(`Duplicate ${gameUidLabel} detected within the team.`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/esports/teams', {
        teamName: teamName.trim(),
        game,
        captainIgn: captainIgn.trim(),
        captainGameUid: captainGameUid.trim(),
        members: additionalMembers,
      });

      if (res.data?.success) {
        setCreatedTeam(res.data.team);
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create team. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Submission: Submit Payment Proof
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdTeam) return;
    setError(null);

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      setError('Please enter a valid 12-digit UPI Transaction ID / UTR.');
      return;
    }

    if (!screenshotFile) {
      setError('Please upload your payment confirmation screenshot.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('transactionId', transactionId.trim());
    formData.append('screenshot', screenshotFile);
    formData.append(
      'driveUrl',
      'https://drive.google.com/drive/folders/1KR_u6xWgPn8Zns9CGV10-tDh8V-J4WCF?usp=drive_link'
    );

    try {
      const res = await api.post(`/esports/teams/${createdTeam.id}/payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setSuccessMessage('Payment proof submitted successfully! Your team is now UNDER REVIEW.');
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-[#010914] min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          to="/events"
          className="inline-flex items-center space-x-2 text-xs font-tech text-[#8594A6] hover:text-[#00D9FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO EVENTS CATALOG</span>
        </Link>

        {/* Header & HUD Progress */}
        <div className="space-y-4 text-center">
          <h1 className="font-anton text-3xl sm:text-5xl text-white tracking-wide">
            E-SPORTS <span className="text-[#FFC800]">TEAM REGISTRATION</span>
          </h1>
          <p className="font-oswald text-xs sm:text-sm text-[#00D9FF] tracking-wider uppercase font-bold">
            {game === 'BGMI' ? 'BATTLEGROUNDS MOBILE INDIA' : 'FREE FIRE MAX'} • SQUAD BUILDING HUB
          </p>

          {/* 4-Step HUD Progress Bar */}
          <div className="max-w-xl mx-auto grid grid-cols-4 gap-2 pt-4">
            <div
              className={`p-2 rounded border text-center font-tech text-[11px] ${
                step >= 1
                  ? 'border-[#00D9FF] bg-[#00D9FF]/10 text-[#00D9FF] font-bold'
                  : 'border-white/10 text-[#8594A6]'
              }`}
            >
              01 TEAM
            </div>
            <div
              className={`p-2 rounded border text-center font-tech text-[11px] ${
                step >= 1
                  ? 'border-[#00D9FF] bg-[#00D9FF]/10 text-[#00D9FF] font-bold'
                  : 'border-white/10 text-[#8594A6]'
              }`}
            >
              02 MEMBERS
            </div>
            <div
              className={`p-2 rounded border text-center font-tech text-[11px] ${
                step >= 2
                  ? 'border-[#FFC800] bg-[#FFC800]/10 text-[#FFC800] font-bold'
                  : 'border-white/10 text-[#8594A6]'
              }`}
            >
              03 PAYMENT
            </div>
            <div
              className={`p-2 rounded border text-center font-tech text-[11px] ${
                step >= 3
                  ? 'border-[#00D9FF] bg-[#00D9FF]/20 text-[#00D9FF] font-bold'
                  : 'border-white/10 text-[#8594A6]'
              }`}
            >
              04 SUBMIT
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-[#FF4444]/15 border border-[#FF4444] text-[#FF4444] text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: TEAM & MEMBERS BUILDER */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Fields (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Team Information Card */}
              <div className="hud-card p-6 rounded-lg border border-white/10 space-y-4">
                <h2 className="font-oswald text-base text-white uppercase font-bold border-b border-white/10 pb-3">
                  01. TEAM DETAILS & GAME SELECTION
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-tech">
                  <div>
                    <label className="text-[#8594A6] uppercase block mb-1">
                      TEAM NAME <span className="text-[#FFC800]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CYBER TITANS"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full p-2.5 bg-[#010914] border border-[#00D9FF]/30 rounded text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                    <span className="text-[10px] text-[#8594A6] mt-1 block">
                      3-50 characters. Must be unique for {game}.
                    </span>
                  </div>

                  <div>
                    <label className="text-[#8594A6] uppercase block mb-1">SELECTED TOURNAMENT</label>
                    <div className="w-full p-2.5 bg-[#000510] border border-white/10 rounded font-bold text-[#FFC800] flex items-center justify-between">
                      <span>{game === 'BGMI' ? 'BGMI (Battlegrounds Mobile India)' : 'Free Fire Max'}</span>
                      <span className="text-xs bg-[#FFC800]/20 text-[#FFC800] px-2 py-0.5 rounded">₹49/Player</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Captain Details Card (Auto-Filled) */}
              <div className="hud-card p-6 rounded-lg border-2 border-[#00D9FF]/40 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2 text-[#00D9FF]">
                    <Shield className="w-4 h-4" />
                    <h2 className="font-oswald text-base text-white uppercase font-bold">
                      TEAM CAPTAIN (MEMBER 1)
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-[#00D9FF]/20 border border-[#00D9FF]/40 text-[#00D9FF] font-tech text-xs font-bold">
                    TEAM CAPTAIN (YOU)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tech bg-[#010914] p-3 rounded border border-white/5">
                  <div>
                    <span className="text-[#8594A6] text-[10px] block uppercase">NAME</span>
                    <span className="text-white font-bold">{user?.profile?.fullName || user?.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[#8594A6] text-[10px] block uppercase">EMAIL</span>
                    <span className="text-[#D0D5DC] truncate block">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-[#8594A6] text-[10px] block uppercase">MOBILE</span>
                    <span className="text-[#00D9FF]">{user?.profile?.mobile || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#8594A6] text-[10px] block uppercase">COURSE / SEM</span>
                    <span className="text-white">
                      {user?.profile?.course} ({user?.profile?.semester})
                    </span>
                  </div>
                </div>

                {/* Captain Gaming Credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-tech pt-2">
                  <div>
                    <label className="text-[#8594A6] uppercase block mb-1">
                      CAPTAIN IN-GAME NAME (IGN) <span className="text-[#FFC800]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mortal_OP"
                      value={captainIgn}
                      onChange={(e) => setCaptainIgn(e.target.value)}
                      className="w-full p-2.5 bg-[#010914] border border-[#00D9FF]/30 rounded text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8594A6] uppercase block mb-1">
                      CAPTAIN {gameUidLabel.toUpperCase()} <span className="text-[#FFC800]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={gameUidPlaceholder}
                      value={captainGameUid}
                      onChange={(e) => setCaptainGameUid(e.target.value)}
                      className="w-full p-2.5 bg-[#010914] border border-[#00D9FF]/30 rounded text-white font-mono focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Additional Members */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-oswald text-base text-white uppercase font-bold">
                      ADDITIONAL SQUAD MEMBERS (0 – 3)
                    </h2>
                    <p className="font-tech text-xs text-[#8594A6]">
                      Min 1 member (Captain only). Max 4 members.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={totalMemberCount >= 4}
                    onClick={handleAddMember}
                    className="px-4 py-2 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-xs tracking-wider rounded shadow-neon-yellow flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ADD MEMBER</span>
                  </button>
                </div>

                {totalMemberCount >= 4 && (
                  <div className="p-2.5 bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF] text-xs font-tech rounded text-center">
                    Maximum team size reached (4 / 4 Members).
                  </div>
                )}

                {additionalMembers.map((member, index) => (
                  <div
                    key={index}
                    className="hud-card p-6 rounded-lg border border-white/10 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="font-oswald text-sm text-[#FFC800] uppercase font-bold">
                        MEMBER {index + 2} DETAILS
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="px-2.5 py-1 bg-[#FF4444]/20 hover:bg-[#FF4444]/40 border border-[#FF4444]/40 text-[#FF4444] rounded text-[11px] font-tech flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>REMOVE</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-tech">
                      <div>
                        <label className="text-[#8594A6] uppercase block mb-1">
                          FULL NAME <span className="text-[#FFC800]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={member.fullName}
                          onChange={(e) => handleMemberChange(index, 'fullName', e.target.value)}
                          placeholder="Player Name"
                          className="w-full p-2 bg-[#010914] border border-white/10 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[#8594A6] uppercase block mb-1">
                          EMAIL ID <span className="text-[#FFC800]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={member.email}
                          onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                          placeholder="player@gmail.com"
                          className="w-full p-2 bg-[#010914] border border-white/10 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[#8594A6] uppercase block mb-1">
                          MOBILE NUMBER <span className="text-[#FFC800]">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={member.mobile}
                          onChange={(e) => handleMemberChange(index, 'mobile', e.target.value)}
                          placeholder="10-digit number"
                          className="w-full p-2 bg-[#010914] border border-white/10 rounded text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tech">
                      <div>
                        <label className="text-[#8594A6] uppercase block mb-1">COURSE</label>
                        <input
                          type="text"
                          required
                          value={member.course}
                          onChange={(e) => handleMemberChange(index, 'course', e.target.value)}
                          placeholder="e.g. B.Tech IT"
                          className="w-full p-2 bg-[#010914] border border-white/10 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[#8594A6] uppercase block mb-1">SEMESTER</label>
                        <input
                          type="text"
                          required
                          value={member.semester}
                          onChange={(e) => handleMemberChange(index, 'semester', e.target.value)}
                          placeholder="e.g. 6th"
                          className="w-full p-2 bg-[#010914] border border-white/10 rounded text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tech">
                      <div>
                        <label className="text-[#8594A6] uppercase block mb-1">
                          IN-GAME NAME (IGN) <span className="text-[#FFC800]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={member.ign}
                          onChange={(e) => handleMemberChange(index, 'ign', e.target.value)}
                          placeholder="e.g. ScoutOP"
                          className="w-full p-2 bg-[#010914] border border-[#00D9FF]/30 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[#8594A6] uppercase block mb-1">
                          {gameUidLabel.toUpperCase()} <span className="text-[#FFC800]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={member.gameUid}
                          onChange={(e) => handleMemberChange(index, 'gameUid', e.target.value)}
                          placeholder={gameUidPlaceholder}
                          className="w-full p-2 bg-[#010914] border border-[#00D9FF]/30 rounded text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Sticky Live Payment Summary (4 Cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="hud-card p-6 rounded-lg border-2 border-[#00D9FF]/50 shadow-neon-cyan space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-oswald text-base text-white uppercase font-bold">
                    PAYMENT SUMMARY
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#00D9FF]/20 text-[#00D9FF] font-tech text-xs font-bold">
                    {game}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-tech">
                  <div className="flex justify-between text-[#8594A6]">
                    <span>Squad Members:</span>
                    <span className="font-bold text-white">
                      {totalMemberCount} / 4 Players
                    </span>
                  </div>

                  <div className="flex justify-between text-[#8594A6]">
                    <span>Fee Per Player:</span>
                    <span className="font-bold text-white">₹{feePerMember}</span>
                  </div>

                  <div className="flex justify-between text-[#8594A6]">
                    <span>Calculation:</span>
                    <span className="text-[#00D9FF]">₹{feePerMember} × {totalMemberCount}</span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                    <span className="font-anton text-lg text-white tracking-wide">TOTAL DUE:</span>
                    <span className="font-anton text-2xl text-[#FFC800]">₹{totalAmount}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-yellow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? 'INITIALIZING SQUAD...' : 'PROCEED TO PAYMENT'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-[#8594A6] text-center font-tech">
                  * Next step: Scan QR code and enter payment transaction reference.
                </p>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT & PROOF SUBMISSION */}
        {step === 2 && createdTeam && (
          <form onSubmit={handleSubmitPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: QR & Official Drive Link (5 Cols) */}
            <div className="lg:col-span-5 hud-card p-6 rounded-lg border-2 border-[#00D9FF]/40 shadow-neon-cyan space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2 text-[#00D9FF]">
                  <QrCode className="w-5 h-5 text-[#FFC800]" />
                  <h2 className="font-oswald text-base text-white uppercase font-bold">
                    SCAN & PAY SQUAD FEE
                  </h2>
                </div>
                <span className="font-anton text-lg text-[#FFC800]">₹{totalAmount}</span>
              </div>

              {/* QR Graphic */}
              <div className="text-center space-y-3">
                <div className="p-3 bg-white rounded-lg inline-block border-2 border-[#00D9FF] shadow-lg">
                  <img
                    src={paymentConfig?.qrCodeUrl || '/uploads/qr_codes/default_qr.jpeg'}
                    alt="University UPI QR"
                    className="w-56 h-56 object-contain mx-auto"
                  />
                </div>
                <p className="text-[11px] text-[#00D9FF] font-tech font-bold">
                  OFFICIAL UNIVERSITY E-SPORTS DESK QR
                </p>
              </div>

              {/* UPI ID Copy */}
              <div className="p-3 bg-[#000510] rounded border border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#8594A6] uppercase block font-tech">OFFICIAL UPI ID</span>
                  <span className="font-mono text-xs text-[#00D9FF] font-bold">
                    {paymentConfig?.upiId || 'engineeringday2026@upi'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-tech flex items-center space-x-1"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-[#00D9FF]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: UTR & Proof Upload (7 Cols) */}
            <div className="lg:col-span-7 hud-card p-6 rounded-lg border border-white/10 space-y-6">
              <div className="border-b border-white/10 pb-3">
                <h2 className="font-oswald text-base text-white uppercase font-bold">
                  03. SUBMIT TRANSACTION VERIFICATION
                </h2>
                <p className="font-tech text-xs text-[#8594A6]">
                  Team: <strong>{createdTeam.teamName}</strong> • Squad ID: <strong>{createdTeam.teamId}</strong>
                </p>
              </div>

              <div className="space-y-4 text-xs font-tech">
                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">
                    12-DIGIT UTR / TRANSACTION ID <span className="text-[#FFC800]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 260914987654"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full p-3 bg-[#010914] border border-[#00D9FF]/40 rounded text-sm text-[#00D9FF] font-mono focus:outline-none focus:border-[#00D9FF]"
                  />
                  <span className="text-[10px] text-[#8594A6] mt-1 block">
                    Found on your payment app receipt (Google Pay, PhonePe, Paytm, etc.).
                  </span>
                </div>

                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">
                    UPLOAD PAYMENT SCREENSHOT <span className="text-[#FFC800]">*</span>
                  </label>
                  <input
                    type="file"
                    required
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleScreenshotChange}
                    className="w-full text-xs font-tech text-[#8594A6] file:mr-3 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-anton file:bg-[#00D9FF] file:text-[#010914] hover:file:bg-[#00BFFF] cursor-pointer"
                  />
                  <span className="text-[10px] text-[#8594A6] mt-1 block">
                    Supported: JPG, PNG, WEBP (Max 5MB). Ensure the UTR and amount are clearly visible.
                  </span>
                </div>

                {screenshotPreview && (
                  <div className="space-y-2 p-3 bg-[#010914] rounded border border-white/10">
                    <span className="text-[#8594A6] text-[10px] uppercase block">PREVIEW OF ATTACHMENT:</span>
                    <img
                      src={screenshotPreview}
                      alt="Receipt Preview"
                      className="max-h-48 object-contain rounded mx-auto"
                    />
                  </div>
                )}

                <div className="p-4 bg-[#000510] rounded border border-white/10 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8594A6]">Expected Squad Total:</span>
                    <span className="font-anton text-sm text-[#FFC800]">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8594A6]">Status Upon Submission:</span>
                    <span className="text-[#00D9FF] font-bold">UNDER REVIEW</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-yellow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'SUBMITTING VERIFICATION...' : 'SUBMIT TEAM REGISTRATION'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: SUBMISSION CONFIRMATION */}
        {step === 3 && createdTeam && (
          <div className="hud-card max-w-2xl mx-auto p-8 rounded-lg border-2 border-[#00D9FF] text-center space-y-6 shadow-neon-cyan">
            <div className="w-16 h-16 rounded-full bg-[#00D9FF]/20 text-[#00D9FF] flex items-center justify-center mx-auto border-2 border-[#00D9FF]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-anton text-3xl text-white">TEAM REGISTRATION SUBMITTED</h2>
              <p className="font-tech text-xs text-[#00D9FF] uppercase tracking-widest font-bold">
                STATUS: UNDER REVIEW
              </p>
              <p className="text-xs text-[#8594A6] max-w-md mx-auto leading-relaxed">
                Your team <strong>{createdTeam.teamName}</strong> ({createdTeam.teamId}) has been received.
                Our event admin is reviewing your payment and roster.
              </p>
            </div>

            <div className="p-4 bg-[#000510] rounded border border-white/10 text-xs font-tech max-w-md mx-auto space-y-1 text-left">
              <div>Team ID: <span className="text-[#FFC800] font-bold">{createdTeam.teamId}</span></div>
              <div>Game: <span className="text-white font-bold">{game}</span></div>
              <div>Squad Size: <span className="text-[#00D9FF] font-bold">{totalMemberCount} Players</span></div>
              <div>Amount: <span className="text-[#FFC800] font-bold">₹{totalAmount}</span></div>
            </div>

            <div className="pt-2">
              <Link
                to="/student/dashboard"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#00D9FF] text-[#010914] font-anton text-xs tracking-wider rounded shadow-neon-cyan"
              >
                <span>GO TO STUDENT DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
