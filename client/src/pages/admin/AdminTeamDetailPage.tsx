import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Gamepad2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Shield,
  CreditCard,
  Lock,
  RotateCcw,
} from 'lucide-react';
import api from '../../services/api';
import { TeamItem } from '../../types';

export const AdminTeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [team, setTeam] = useState<TeamItem | null>(null);
  const [duplicateUtrFound, setDuplicateUtrFound] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Modals
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [resubmissionNote, setResubmissionNote] = useState('');
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTeamDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/esports/teams/${id}`);
      if (res.data?.success) {
        setTeam(res.data.team);
        setDuplicateUtrFound(res.data.isDuplicateUtr);
        setDuplicateInfo(res.data.duplicateUtrInfo);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const handleApprove = async () => {
    if (!team) return;
    if (!window.confirm(`Confirm approval of team "${team.teamName}"? This will lock the roster and activate their tournament entry.`)) return;

    setProcessing(true);
    setMessage(null);
    try {
      const res = await api.patch(`/admin/esports/teams/${team.id}/approve`);
      if (res.data?.success) {
        setMessage({ type: 'success', text: res.data.message });
        fetchTeamDetails();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Approval failed.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!team || !rejectionReason.trim()) return;
    setProcessing(true);
    setMessage(null);
    try {
      const res = await api.patch(`/admin/esports/teams/${team.id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      if (res.data?.success) {
        setMessage({ type: 'success', text: res.data.message });
        setShowRejectModal(false);
        setRejectionReason('');
        fetchTeamDetails();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Rejection failed.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleResubmission = async () => {
    if (!team) return;
    setProcessing(true);
    setMessage(null);
    try {
      const res = await api.patch(`/admin/esports/teams/${team.id}/resubmission`, {
        reason: resubmissionNote.trim(),
      });
      if (res.data?.success) {
        setMessage({ type: 'success', text: res.data.message });
        setShowResubmitModal(false);
        setResubmissionNote('');
        fetchTeamDetails();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to request resubmission.' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#00D9FF] font-tech text-xs">
        RETRIEVING COMPLETE SQUAD AUDIT DOSSIER...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="py-20 text-center text-[#FF4444] font-tech text-xs">
        E-Sports team record not found.
      </div>
    );
  }

  const expectedAmount = team.memberCount * 49;

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <Link
        to="/admin/esports/teams"
        className="inline-flex items-center space-x-1.5 text-xs font-tech text-[#8594A6] hover:text-[#00D9FF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO ALL E-SPORTS TEAMS</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-0.5 rounded bg-[#FFC800]/20 text-[#FFC800] font-tech text-xs font-bold border border-[#FFC800]/30">
              {team.game}
            </span>
            <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
              {team.teamName} <span className="text-[#00D9FF]">({team.teamId})</span>
            </h1>
          </div>
          <p className="font-tech text-xs text-[#8594A6] mt-1">
            Registered: {team.createdAt ? new Date(team.createdAt).toLocaleString() : ''} • Squad: {team.memberCount} / 4 Players
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={processing || team.status === 'APPROVED'}
            onClick={handleApprove}
            className="px-5 py-2.5 bg-[#00D9FF] hover:bg-[#00BFFF] text-[#010914] font-anton text-xs tracking-wider rounded shadow-neon-cyan flex items-center space-x-1.5 disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>APPROVE SQUAD</span>
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={() => setShowResubmitModal(true)}
            className="px-4 py-2.5 bg-[#FFC800]/20 hover:bg-[#FFC800]/30 border border-[#FFC800]/40 text-[#FFC800] font-anton text-xs tracking-wider rounded flex items-center space-x-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REQUEST RESUBMISSION</span>
          </button>

          <button
            type="button"
            disabled={processing || team.status === 'REJECTED'}
            onClick={() => setShowRejectModal(true)}
            className="px-4 py-2.5 bg-[#FF4444]/20 hover:bg-[#FF4444]/40 border border-[#FF4444]/40 text-[#FF4444] font-anton text-xs tracking-wider rounded flex items-center space-x-1.5 disabled:opacity-40"
          >
            <XCircle className="w-4 h-4" />
            <span>REJECT PROOF</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded text-xs flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-[#00D9FF]/15 border border-[#00D9FF] text-[#00D9FF]'
              : 'bg-[#FF4444]/15 border border-[#FF4444] text-[#FF4444]'
          }`}
        >
          <span>{message.text}</span>
        </div>
      )}

      {/* Duplicate UTR Alert Banner */}
      {duplicateUtrFound && (
        <div className="p-4 rounded-lg bg-[#FF4444]/15 border-2 border-[#FF4444] space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-[#FF4444] font-anton text-sm tracking-wide">
            <AlertTriangle className="w-5 h-5" />
            <span>WARNING: DUPLICATE UTR NUMBER DETECTED</span>
          </div>
          <p className="text-white">
            The UTR number <strong>{team.payment?.transactionId}</strong> was also used by another squad:
          </p>
          {duplicateInfo && (
            <div className="p-2.5 bg-[#000510] rounded text-[#FFC800] font-tech text-xs">
              Other Team: <strong>{duplicateInfo.otherTeamName}</strong> ({duplicateInfo.otherTeamId})
            </div>
          )}
        </div>
      )}

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Status Card */}
        <div className="hud-card p-6 rounded-lg border border-white/10 space-y-3">
          <span className="text-[10px] text-[#8594A6] uppercase font-tech block">TEAM STATUS</span>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded text-xs font-anton tracking-wider ${
                team.status === 'APPROVED'
                  ? 'bg-[#008CFF]/20 text-[#00D9FF] border border-[#00D9FF]/40'
                  : team.status === 'UNDER_REVIEW'
                  ? 'bg-[#00D9FF]/15 text-[#00D9FF] border border-[#00D9FF]/40'
                  : team.status === 'REJECTED'
                  ? 'bg-[#FF4444]/20 text-[#FF4444] border border-[#FF4444]/40'
                  : 'bg-[#FFC800]/20 text-[#FFC800] border border-[#FFC800]/40'
              }`}
            >
              {team.status}
            </span>
            {team.isLocked && (
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-tech text-[#8594A6] flex items-center space-x-1">
                <Lock className="w-3 h-3 text-[#00D9FF]" />
                <span>ROSTER LOCKED</span>
              </span>
            )}
          </div>
          <div className="text-xs font-tech text-[#D0D5DC]">
            Squad Size: <strong className="text-white">{team.memberCount} Players</strong> (₹49 each)
          </div>
        </div>

        {/* Captain Summary Card */}
        <div className="hud-card p-6 rounded-lg border border-white/10 space-y-2">
          <span className="text-[10px] text-[#00D9FF] uppercase font-tech font-bold block">
            TEAM CAPTAIN
          </span>
          <div className="text-white font-bold text-sm">
            {team.captain?.studentProfile?.fullName || 'N/A'}
          </div>
          <div className="text-xs font-tech text-[#8594A6] space-y-0.5">
            <div>Email: {team.captain?.email}</div>
            <div>Mobile: {team.captain?.studentProfile?.mobile || 'N/A'}</div>
            <div>
              Course: {team.captain?.studentProfile?.course} ({team.captain?.studentProfile?.semester})
            </div>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="hud-card p-6 rounded-lg border border-[#FFC800]/40 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#FFC800] uppercase font-tech font-bold block">
              FINANCIAL AUDIT
            </span>
            <span className="font-anton text-lg text-[#FFC800]">₹{expectedAmount}</span>
          </div>
          <div className="text-xs font-tech text-[#D0D5DC] space-y-1">
            <div className="flex justify-between">
              <span>Expected Amount:</span>
              <span className="font-bold text-white">₹{expectedAmount} ({team.memberCount} × ₹49)</span>
            </div>
            <div className="flex justify-between">
              <span>Submitted UTR:</span>
              <span className="font-mono text-[#00D9FF] font-bold">
                {team.payment?.transactionId || 'Not submitted'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className="text-white">{team.payment?.status || 'PENDING'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Table / Cards */}
      <div className="space-y-4">
        <h2 className="font-oswald text-lg text-white uppercase font-bold">
          SQUAD ROSTER & GAMING CREDENTIALS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {team.members.map((member, idx) => (
            <div
              key={member.id}
              className={`hud-card p-5 rounded-lg border space-y-3 ${
                member.isCaptain ? 'border-[#00D9FF]/50 bg-[#00D9FF]/5' : 'border-white/10'
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-tech text-xs text-[#8594A6] font-bold">MEMBER #{idx + 1}</span>
                {member.isCaptain && (
                  <span className="px-2 py-0.5 rounded bg-[#00D9FF]/20 text-[#00D9FF] font-tech text-[10px] font-bold">
                    CAPTAIN
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs font-tech">
                <span className="font-bold text-white text-sm block truncate">{member.fullName}</span>
                <div className="text-[#8594A6] truncate">{member.email}</div>
                <div className="text-[#00D9FF]">{member.mobile}</div>
                <div className="text-[#D0D5DC]">
                  {member.course} ({member.semester})
                </div>
                {member.enrollmentNumber && (
                  <div className="text-[#FFC800] font-mono">Roll: {member.enrollmentNumber}</div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1 text-xs font-tech bg-[#010914] p-2.5 rounded">
                <div className="flex justify-between">
                  <span className="text-[#8594A6] text-[11px]">IGN:</span>
                  <span className="text-[#FFC800] font-bold">{member.ign}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8594A6] text-[11px]">
                    {team.game === 'BGMI' ? 'Player ID:' : 'UID:'}
                  </span>
                  <span className="text-white font-mono">{member.gameUid}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Proof & Drive Verification Section */}
      <div className="hud-card p-6 rounded-lg border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2 text-[#FFC800]">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-oswald text-base text-white uppercase font-bold">
              PAYMENT PROOF & RECEIPT VERIFICATION
            </h3>
          </div>
        </div>

        {team.payment?.rejectionReason && (
          <div className="p-3 bg-[#FF4444]/10 border border-[#FF4444]/30 rounded text-xs text-[#FFC800]">
            <strong>Active Rejection / Resubmission Note:</strong> {team.payment.rejectionReason}
          </div>
        )}

        {team.payment?.screenshotPath ? (
          <div className="space-y-3">
            <div className="p-3 bg-[#010914] rounded border border-white/10 flex items-center justify-center max-h-80 overflow-hidden">
              <img
                src={`/api/payments/screenshot/${team.payment.screenshotPath}?token=${encodeURIComponent(localStorage.getItem('token') || '')}`}
                alt="Payment Proof"
                className="max-h-72 object-contain rounded"
              />
            </div>
            <a
              href={`/api/payments/screenshot/${team.payment.screenshotPath}?token=${encodeURIComponent(localStorage.getItem('token') || '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-tech text-[#00D9FF] hover:underline"
            >
              <span>Inspect full-resolution image in new tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="p-12 text-center text-xs font-tech text-[#8594A6] bg-[#000510] rounded">
            No payment screenshot uploaded for this team.
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="hud-card max-w-md w-full p-6 rounded-lg border border-[#FF4444] space-y-4">
            <h3 className="font-anton text-lg text-white">ENTER REJECTION REASON</h3>
            <textarea
              rows={3}
              placeholder="e.g. Transaction reference invalid or receipt amount does not match 4 players (₹196)."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-[#010914] border border-white/20 rounded text-xs text-white focus:outline-none focus:border-[#FF4444]"
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-white/5 text-xs text-[#8594A6] rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing || rejectionReason.trim().length < 4}
                onClick={handleReject}
                className="px-5 py-2 bg-[#FF4444] text-white font-anton text-xs rounded"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resubmit Modal */}
      {showResubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="hud-card max-w-md w-full p-6 rounded-lg border border-[#FFC800] space-y-4">
            <h3 className="font-anton text-lg text-white">REQUEST RESUBMISSION NOTE</h3>
            <textarea
              rows={3}
              placeholder="e.g. Please re-upload a clear screenshot showing the full bank transaction reference."
              value={resubmissionNote}
              onChange={(e) => setResubmissionNote(e.target.value)}
              className="w-full p-3 bg-[#010914] border border-white/20 rounded text-xs text-white focus:outline-none focus:border-[#FFC800]"
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowResubmitModal(false)}
                className="px-4 py-2 bg-white/5 text-xs text-[#8594A6] rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleResubmission}
                className="px-5 py-2 bg-[#FFC800] text-[#010914] font-anton text-xs rounded"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
