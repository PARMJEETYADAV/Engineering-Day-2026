import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  FileImage,
  ExternalLink,
  User,
  Calendar,
  CreditCard,
} from 'lucide-react';
import api from '../../services/api';
import { RegistrationItem } from '../../types';

export const AdminRegistrationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState<RegistrationItem | null>(null);
  const [duplicateUtrFound, setDuplicateUtrFound] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/registrations/${id}`);
      if (res.data?.success) {
        setRegistration(res.data.registration);
        setDuplicateUtrFound(res.data.isDuplicateUtr);
        setDuplicateInfo(res.data.registration.duplicateUtrInfo);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleApprove = async () => {
    if (!registration) return;
    if (!window.confirm('Confirm approval of this registration and payment?')) return;
    setProcessing(true);
    setMessage(null);

    try {
      const res = await api.patch(`/admin/registrations/${registration.id}/approve`);
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Registration approved and entry pass activated.' });
        fetchDetails();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Approval failed.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!registration || !rejectionReason.trim()) return;
    setProcessing(true);
    setMessage(null);

    try {
      const res = await api.patch(`/admin/registrations/${registration.id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Payment rejected. Reason dispatched to student.' });
        setShowRejectModal(false);
        setRejectionReason('');
        fetchDetails();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Rejection failed.' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#00D9FF] font-tech text-xs">
        RETRIEVING COMPLETE AUDIT RECORD...
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="py-20 text-center text-[#FF4444] font-tech text-xs">
        Registration record not found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <Link
        to="/admin/registrations"
        className="inline-flex items-center space-x-1.5 text-xs font-tech text-[#8594A6] hover:text-[#00D9FF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO ALL REGISTRATIONS</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
              AUDIT DOSSIER: <span className="text-[#FFC800]">{registration.registrationNumber}</span>
            </h1>
            <span
              className={`px-3 py-1 rounded text-xs font-anton tracking-wider ${
                registration.status === 'APPROVED'
                  ? 'bg-[#008CFF]/20 text-[#00D9FF] border border-[#00D9FF]/40'
                  : registration.status === 'UNDER_REVIEW'
                  ? 'bg-[#00D9FF]/15 text-[#00D9FF] border border-[#00D9FF]/40'
                  : registration.status === 'REJECTED'
                  ? 'bg-[#FF4444]/20 text-[#FF4444] border border-[#FF4444]/40'
                  : 'bg-[#FFC800]/20 text-[#FFC800] border border-[#FFC800]/40'
              }`}
            >
              {registration.status}
            </span>
          </div>
          <p className="font-tech text-xs text-[#8594A6] mt-1">
            Created: {registration.createdAt} • Target: {registration.event.name}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            disabled={processing || registration.status === 'APPROVED'}
            onClick={handleApprove}
            className="px-5 py-2.5 bg-[#00D9FF] hover:bg-[#00BFFF] text-[#010914] font-anton text-xs tracking-wider rounded shadow-neon-cyan flex items-center space-x-1.5 disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>APPROVE REGISTRATION</span>
          </button>

          <button
            type="button"
            disabled={processing || registration.status === 'REJECTED'}
            onClick={() => setShowRejectModal(true)}
            className="px-5 py-2.5 bg-[#FF4444]/20 hover:bg-[#FF4444]/40 border border-[#FF4444]/40 text-[#FF4444] font-anton text-xs tracking-wider rounded disabled:opacity-40"
          >
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

      {/* Duplicate UTR Flag Alert */}
      {duplicateUtrFound && (
        <div className="p-4 rounded-lg bg-[#FF4444]/15 border-2 border-[#FF4444] space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-[#FF4444] font-anton text-sm tracking-wide">
            <AlertTriangle className="w-5 h-5" />
            <span>CRITICAL WARNING: DUPLICATE TRANSACTION ID DETECTED</span>
          </div>
          <p className="text-white">
            The UTR number <strong>{registration.payment?.transactionId}</strong> has already been submitted
            in another registration:
          </p>
          {duplicateInfo && (
            <div className="p-3 bg-[#000510] rounded text-[#FFC800] font-tech text-xs space-y-1">
              <div>Other Registration ID: <strong>{duplicateInfo.otherRegistrationNumber}</strong></div>
              <div>Other Student: <strong>{duplicateInfo.otherStudent}</strong></div>
              <div>Other Event: <strong>{duplicateInfo.otherEvent}</strong></div>
            </div>
          )}
          <span className="text-[#8594A6] text-[11px] block">
            * Verify bank statement carefully before approving to prevent double-claiming of the same receipt.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Student & Event Specs */}
        <div className="space-y-6">
          {/* Student Info Card */}
          <div className="hud-card p-6 rounded-lg border border-white/10 space-y-4">
            <div className="flex items-center space-x-2 text-[#00D9FF] pb-3 border-b border-white/10">
              <User className="w-4 h-4" />
              <h3 className="font-oswald text-base text-white uppercase font-bold">
                STUDENT PARTICIPANT RECORD
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-tech">
              <div>
                <span className="text-[#8594A6] block uppercase">FULL NAME</span>
                <span className="text-white font-bold text-sm">
                  {registration.student?.studentProfile?.fullName || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">EMAIL</span>
                <span className="text-white font-bold">{registration.student?.email}</span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">MOBILE NUMBER</span>
                <span className="text-[#00D9FF] font-bold">
                  {registration.student?.studentProfile?.mobile || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">ENROLLMENT NO</span>
                <span className="text-[#FFC800] font-bold">
                  {registration.student?.studentProfile?.enrollmentNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">COURSE</span>
                <span className="text-white font-bold">
                  {registration.student?.studentProfile?.course}
                </span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">SEMESTER</span>
                <span className="text-white font-bold">
                  {registration.student?.studentProfile?.semester}
                </span>
              </div>
            </div>
          </div>

          {/* Event Info Card */}
          <div className="hud-card p-6 rounded-lg border border-white/10 space-y-4">
            <div className="flex items-center space-x-2 text-[#FFC800] pb-3 border-b border-white/10">
              <Calendar className="w-4 h-4" />
              <h3 className="font-oswald text-base text-white uppercase font-bold">
                EVENT SPECIFICATION
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-tech">
              <div>
                <span className="text-[#8594A6] block uppercase">EVENT NAME</span>
                <span className="text-white font-bold">{registration.event.name}</span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">CATEGORY & DAY</span>
                <span className="text-[#00D9FF] font-bold">
                  {registration.event.category} ({registration.event.day})
                </span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">EVENT DATE</span>
                <span className="text-white">{registration.event.date}</span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">VENUE</span>
                <span className="text-white">{registration.event.venue || 'Campus Arena'}</span>
              </div>
            </div>

            {registration.teamName && (
              <div className="p-3 bg-[#010914] rounded border border-white/5 text-xs font-tech">
                <span className="text-[#FFC800] font-bold uppercase block">TEAM / SQUAD:</span>
                <span className="text-white text-sm font-bold">{registration.teamName}</span>
                {registration.teamMembers && (
                  <p className="text-[#8594A6] mt-1">Roster: {registration.teamMembers}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment & Proof Column */}
        <div className="space-y-6">
          <div className="hud-card p-6 rounded-lg border-2 border-[#00D9FF]/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2 text-[#00D9FF]">
                <CreditCard className="w-4 h-4" />
                <h3 className="font-oswald text-base text-white uppercase font-bold">
                  PAYMENT & UTR VERIFICATION
                </h3>
              </div>
              <span className="font-anton text-lg text-[#FFC800]">
                AMOUNT: ₹{registration.payment?.amount ?? registration.event.registrationFee}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-tech">
              <div>
                <span className="text-[#8594A6] block uppercase">UTR / TRANSACTION ID</span>
                <span className="font-mono text-sm text-white font-bold select-all bg-[#010914] px-2 py-0.5 rounded inline-block">
                  {registration.payment?.transactionId || 'Not submitted'}
                </span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">PAYMENT DATE</span>
                <span className="text-white">
                  {registration.payment?.paymentDate
                    ? registration.payment.paymentDate.split('T')[0]
                    : 'N/A'}
                </span>
              </div>
              {registration.payment?.verifiedBy && (
                <div>
                  <span className="text-[#8594A6] block uppercase">VERIFIED BY</span>
                  <span className="text-[#00D9FF]">{registration.payment.verifiedBy}</span>
                </div>
              )}
              {registration.payment?.verifiedAt && (
                <div>
                  <span className="text-[#8594A6] block uppercase">VERIFIED AT</span>
                  <span className="text-white">{registration.payment.verifiedAt.split('T')[0]}</span>
                </div>
              )}
            </div>

            {/* Rejection reason display if present */}
            {registration.payment?.rejectionReason && (
              <div className="p-3 bg-[#FF4444]/10 border border-[#FF4444]/30 rounded text-xs text-[#FFC800]">
                <strong>Active Rejection Note:</strong> {registration.payment.rejectionReason}
              </div>
            )}

            {/* Receipt Preview */}
            <div className="space-y-2 pt-2">
              <span className="font-tech text-xs text-[#8594A6] uppercase block">
                PAYMENT SCREENSHOT ATTACHMENT
              </span>

              {registration.payment?.screenshotPath ? (
                <div className="space-y-2">
                  <div className="p-2 bg-[#010914] rounded border border-white/10 flex items-center justify-center max-h-72 overflow-hidden">
                    <img
                      src={`/api/payments/screenshot/${registration.payment.screenshotPath}?token=${encodeURIComponent(localStorage.getItem('token') || '')}`}
                      alt="Payment Receipt"
                      className="max-h-64 object-contain rounded"
                    />
                  </div>
                  <a
                    href={`/api/payments/screenshot/${registration.payment.screenshotPath}?token=${encodeURIComponent(localStorage.getItem('token') || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-tech text-[#00D9FF] hover:underline"
                  >
                    <span>Inspect full-resolution image in new tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-8 bg-[#010914] rounded text-center text-xs text-[#8594A6]">
                  No screenshot uploaded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="hud-card max-w-md w-full p-6 rounded-lg border border-[#FF4444] space-y-4">
            <h3 className="font-anton text-lg text-white">ENTER REJECTION REASON</h3>
            <textarea
              rows={3}
              placeholder="e.g. Transaction reference invalid or receipt cropped."
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
    </div>
  );
};
