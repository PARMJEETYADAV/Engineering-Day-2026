import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  FileImage,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';
import { RegistrationItem } from '../../types';

export const PaymentVerificationPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [actionRegId, setActionRegId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [resubmitReason, setResubmitReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchVerificationQueue = async () => {
    setLoading(true);
    try {
      // Fetch registrations under review
      const res = await api.get('/admin/registrations?status=UNDER_REVIEW&limit=50');
      if (res.data?.success) {
        setRegistrations(res.data.registrations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationQueue();
  }, []);

  const handleApprove = async (regId: string) => {
    if (!window.confirm('Confirm approval of this payment proof?')) return;
    setProcessing(true);
    setMessage(null);

    try {
      const res = await api.patch(`/admin/registrations/${regId}/approve`);
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Payment approved successfully!' });
        fetchVerificationQueue();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to approve payment.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!actionRegId || !rejectionReason.trim()) return;
    setProcessing(true);
    setMessage(null);

    try {
      const res = await api.patch(`/admin/registrations/${actionRegId}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Payment rejected. Student has been notified.' });
        setShowRejectModal(false);
        setRejectionReason('');
        setActionRegId(null);
        fetchVerificationQueue();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reject payment.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleResubmitSubmit = async () => {
    if (!actionRegId) return;
    setProcessing(true);
    setMessage(null);

    try {
      const res = await api.patch(`/admin/registrations/${actionRegId}/resubmit`, {
        note: resubmitReason.trim() || undefined,
      });
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Re-submission request dispatched to student.' });
        setShowResubmitModal(false);
        setResubmitReason('');
        setActionRegId(null);
        fetchVerificationQueue();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to request resubmission.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
            PAYMENT VERIFICATION <span className="text-[#00D9FF]">CENTER</span>
          </h1>
          <p className="font-tech text-xs text-[#8594A6]">
            Manual UPI & Screenshot Audit Pipeline
          </p>
        </div>

        <button
          onClick={fetchVerificationQueue}
          className="px-4 py-2 bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/40 text-xs font-tech text-[#00D9FF] rounded flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>REFRESH QUEUE</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded text-xs flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-[#00D9FF]/15 border border-[#00D9FF] text-[#00D9FF]'
              : 'bg-[#FF4444]/15 border border-[#FF4444] text-[#FF4444]'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Queue Table */}
      <div className="hud-card rounded-lg border border-[#00D9FF]/30 overflow-hidden">
        <div className="p-4 bg-[#010914] border-b border-white/10 flex items-center justify-between">
          <span className="font-anton text-lg text-white">
            PENDING AUDIT QUEUE ({registrations.length})
          </span>
          <span className="text-xs font-tech text-[#FFC800]">
            Requires strict UTR & Receipt cross-referencing
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#00D9FF] font-tech text-xs">
            REFRESHING AUDIT QUEUE...
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#00D9FF] mx-auto" />
            <h3 className="font-anton text-xl text-white">ALL CAUGHT UP!</h3>
            <p className="text-xs text-[#8594A6] font-tech">
              No pending payment proofs are currently awaiting administrative review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-tech">
              <thead className="bg-[#010914] border-b border-white/10 text-[#8594A6] uppercase">
                <tr>
                  <th className="p-3.5">REG ID</th>
                  <th className="p-3.5">STUDENT DETAILS</th>
                  <th className="p-3.5">EVENT</th>
                  <th className="p-3.5">FEE</th>
                  <th className="p-3.5">UTR / TRANSACTION NO</th>
                  <th className="p-3.5">RECEIPT PROOF</th>
                  <th className="p-3.5 text-right">AUDIT ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#FFC800]">
                      {reg.registrationNumber}
                    </td>

                    <td className="p-3.5">
                      <div className="text-white font-bold">
                        {reg.student?.studentProfile?.fullName || 'Student'}
                      </div>
                      <div className="text-[#8594A6] text-[11px]">{reg.student?.email}</div>
                      <div className="text-[#00D9FF] text-[11px]">
                        {reg.student?.studentProfile?.mobile}
                      </div>
                    </td>

                    <td className="p-3.5 text-white font-bold">
                      {reg.event.name}
                    </td>

                    <td className="p-3.5 font-anton text-sm text-[#FFC800]">
                      ₹{reg.payment?.amount ?? reg.event.registrationFee}
                    </td>

                    <td className="p-3.5">
                      <div className="font-mono text-xs text-white bg-[#010914] px-2.5 py-1 rounded border border-white/10 inline-block select-all">
                        {reg.payment?.transactionId || 'N/A'}
                      </div>
                    </td>

                    <td className="p-3.5">
                      {reg.payment?.screenshotPath ? (
                        <button
                          type="button"
                          onClick={() => setSelectedScreenshot(reg.payment?.screenshotPath || null)}
                          className="px-2.5 py-1 bg-[#008CFF]/15 hover:bg-[#008CFF]/30 border border-[#008CFF]/40 text-[#00D9FF] rounded flex items-center space-x-1"
                        >
                          <FileImage className="w-3.5 h-3.5" />
                          <span>VIEW RECEIPT</span>
                        </button>
                      ) : (
                        <span className="text-[#8594A6]">No image</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => handleApprove(reg.id)}
                          className="px-3 py-1.5 bg-[#00D9FF] hover:bg-[#00BFFF] text-[#010914] font-anton text-xs tracking-wider rounded shadow-neon-cyan flex items-center space-x-1 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>APPROVE</span>
                        </button>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => {
                            setActionRegId(reg.id);
                            setShowRejectModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#FF4444]/20 hover:bg-[#FF4444]/40 border border-[#FF4444]/40 text-[#FF4444] font-anton text-xs tracking-wider rounded disabled:opacity-50"
                        >
                          <span>REJECT</span>
                        </button>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => {
                            setActionRegId(reg.id);
                            setShowResubmitModal(true);
                          }}
                          className="px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/20 text-[#8594A6] hover:text-white font-tech text-[11px] rounded"
                          title="Request Resubmission"
                        >
                          <span>RESUBMIT</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Secure Screenshot Viewer Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="hud-card max-w-3xl w-full p-6 rounded-lg border-2 border-[#00D9FF] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-anton text-lg text-white">SECURE PAYMENT PROOF VIEWER</span>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-xs font-tech text-[#8594A6] hover:text-white px-2 py-1 bg-white/10 rounded"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-[#010914] p-2 rounded">
              <img
                src={`/api/payments/screenshot/${selectedScreenshot}?token=${encodeURIComponent(localStorage.getItem('token') || '')}`}
                alt="Payment Screenshot Proof"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-tech text-[#8594A6] pt-2">
              <span>Verified server-side image stream</span>
              <a
                href={`/api/payments/screenshot/${selectedScreenshot}?token=${encodeURIComponent(localStorage.getItem('token') || '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#00D9FF] hover:underline flex items-center space-x-1"
              >
                <span>Open full image in new tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal (Reason strictly required) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="hud-card max-w-md w-full p-6 rounded-lg border border-[#FF4444] space-y-4">
            <div className="flex items-center space-x-2 text-[#FF4444]">
              <XCircle className="w-5 h-5" />
              <h3 className="font-anton text-lg text-white">REJECT PAYMENT PROOF</h3>
            </div>

            <p className="text-xs text-[#8594A6] font-tech">
              A clear reason is mandatory so the student knows why their proof was invalid.
            </p>

            <div>
              <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                REJECTION REASON <span className="text-[#FF4444]">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. UTR number not found in bank statement, or screenshot is cropped/unreadable."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 bg-[#010914] border border-[#FF4444]/40 rounded text-xs text-white focus:outline-none focus:border-[#FF4444]"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setActionRegId(null);
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-tech text-[#8594A6] rounded"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={processing || rejectionReason.trim().length < 4}
                onClick={handleRejectSubmit}
                className="px-5 py-2 bg-[#FF4444] hover:bg-red-600 text-white font-anton text-xs tracking-wider rounded disabled:opacity-50"
              >
                {processing ? 'REJECTING...' : 'CONFIRM REJECTION'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resubmission Request Modal */}
      {showResubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="hud-card max-w-md w-full p-6 rounded-lg border border-[#FFC800] space-y-4">
            <div className="flex items-center space-x-2 text-[#FFC800]">
              <Clock className="w-5 h-5" />
              <h3 className="font-anton text-lg text-white">REQUEST RE-SUBMISSION</h3>
            </div>

            <p className="text-xs text-[#8594A6] font-tech">
              Allows the student to re-upload proof without a formal rejection mark.
            </p>

            <div>
              <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                COORDINATOR NOTE
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please upload full uncropped receipt showing timestamp."
                value={resubmitReason}
                onChange={(e) => setResubmitReason(e.target.value)}
                className="w-full p-3 bg-[#010914] border border-[#FFC800]/40 rounded text-xs text-white focus:outline-none focus:border-[#FFC800]"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowResubmitModal(false);
                  setActionRegId(null);
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-tech text-[#8594A6] rounded"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleResubmitSubmit}
                className="px-5 py-2 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-xs tracking-wider rounded disabled:opacity-50 shadow-neon-yellow"
              >
                {processing ? 'TRANSMITTING...' : 'SEND REQUEST'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
