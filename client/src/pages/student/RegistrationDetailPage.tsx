import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, Printer, ArrowLeft, ShieldCheck, Download, AlertTriangle, Cpu, Terminal } from 'lucide-react';
import api from '../../services/api';
import { RegistrationItem } from '../../types';

export const RegistrationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isJustSubmitted = queryParams.get('submitted') === 'true';

  const [registration, setRegistration] = useState<RegistrationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .get(`/registrations/${id}`)
      .then((res) => {
        if (res.data?.success) {
          setRegistration(res.data.registration);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch registration details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#00D9FF] font-tech text-xs">
        RETRIEVING REGISTRATION RECORD...
      </div>
    );
  }

  if (!registration || error) {
    return (
      <div className="py-24 text-center hud-card max-w-md mx-auto p-8 rounded">
        <h2 className="font-anton text-2xl text-white">RECORD NOT FOUND</h2>
        <p className="text-xs text-[#8594A6] mt-2 mb-4">{error || 'This registration is unavailable.'}</p>
        <Link to="/student/dashboard" className="text-xs font-tech text-[#FFC800] underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isApproved = registration.status === 'APPROVED';
  const isUnderReview = registration.status === 'UNDER_REVIEW';
  const isPendingPayment = registration.status === 'PAYMENT_PENDING';
  const isRejected = registration.status === 'REJECTED';

  return (
    <div className="py-12 bg-[#010914] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation */}
        <div className="no-print flex items-center justify-between">
          <Link
            to="/student/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-tech text-[#8594A6] hover:text-[#00D9FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO MY DASHBOARD</span>
          </Link>

          {isApproved && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#00D9FF] hover:bg-[#00BFFF] text-[#010914] font-anton text-xs tracking-wider rounded flex items-center space-x-2 shadow-neon-cyan"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT CONFIRMATION PASS</span>
            </button>
          )}
        </div>

        {/* Just Submitted Banner */}
        {isJustSubmitted && (
          <div className="no-print p-6 rounded-lg bg-[#00D9FF]/10 border-2 border-[#00D9FF] shadow-neon-cyan space-y-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#00D9FF] mx-auto animate-bounce" />
            <div className="font-tech text-xs text-[#FFC800] font-bold uppercase">
              ENGINEERING DAY 2026
            </div>
            <h2 className="font-anton text-3xl text-white tracking-wide">
              REGISTRATION SUBMITTED
            </h2>
            <p className="text-xs sm:text-sm text-[#D0D5DC] max-w-xl mx-auto leading-relaxed">
              Your registration and payment proof have been submitted successfully.
              Your registration will be confirmed after admin verification.
            </p>
          </div>
        )}

        {/* Printable Official Pass Container */}
        <div
          id="printable-pass"
          className="hud-card p-8 rounded-lg border-2 border-[#00D9FF]/50 relative overflow-hidden bg-[#010914]"
        >
          {/* Top Header of Pass */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#00D9FF]/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded bg-[#000510] border border-[#00D9FF] flex items-center justify-center text-[#00D9FF] shadow-neon-cyan">
                <Cpu className="w-7 h-7" />
              </div>
              <div>
                <div className="font-anton text-2xl text-white tracking-wide">
                  ENGINEERING <span className="text-[#FFC800]">DAY 2026</span>
                </div>
                <div className="font-tech text-xs text-[#00D9FF] tracking-widest font-bold">
                  OFFICIAL UNIVERSITY ADMISSION PASS
                </div>
              </div>
            </div>

            {/* Official Status Stamp */}
            <div className="text-right">
              {isApproved && (
                <div className="inline-block px-4 py-1.5 rounded bg-[#008CFF]/20 border-2 border-[#00D9FF] text-[#00D9FF] font-anton text-sm tracking-wider shadow-neon-cyan">
                  REGISTRATION CONFIRMED ✓
                </div>
              )}
              {isUnderReview && (
                <div className="inline-block px-4 py-1.5 rounded bg-[#00D9FF]/10 border border-[#00D9FF] text-[#00D9FF] font-tech text-xs font-bold animate-pulse">
                  UNDER ADMINISTRATIVE REVIEW
                </div>
              )}
              {isPendingPayment && (
                <div className="inline-block px-4 py-1.5 rounded bg-[#FFC800]/10 border border-[#FFC800] text-[#FFC800] font-tech text-xs font-bold">
                  PAYMENT PENDING
                </div>
              )}
              {isRejected && (
                <div className="inline-block px-4 py-1.5 rounded bg-[#FF4444]/10 border border-[#FF4444] text-[#FF4444] font-tech text-xs font-bold">
                  VERIFICATION REJECTED
                </div>
              )}
            </div>
          </div>

          {/* Pass Details Grid */}
          <div className="py-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-tech">
              <div className="p-3 bg-[#000510] rounded border border-white/10">
                <span className="text-[#8594A6] uppercase block">REGISTRATION ID</span>
                <span className="font-mono text-sm font-bold text-[#FFC800]">
                  {registration.registrationNumber}
                </span>
              </div>

              <div className="p-3 bg-[#000510] rounded border border-white/10">
                <span className="text-[#8594A6] uppercase block">EVENT NAME</span>
                <span className="font-oswald text-base font-bold text-white">
                  {registration.event.name}
                </span>
              </div>

              <div className="p-3 bg-[#000510] rounded border border-white/10">
                <span className="text-[#8594A6] uppercase block">DATE & VENUE</span>
                <span className="text-white font-bold block">{registration.event.date}</span>
                <span className="text-[#00D9FF] text-[10px]">{registration.event.venue || 'Campus Arena'}</span>
              </div>

              <div className="p-3 bg-[#000510] rounded border border-white/10">
                <span className="text-[#8594A6] uppercase block">PAYMENT STATUS</span>
                <span className={`font-bold ${isApproved ? 'text-[#00D9FF]' : 'text-[#FFC800]'}`}>
                  {registration.payment ? `${registration.payment.status} (₹${registration.payment.amount})` : 'UNPAID'}
                </span>
              </div>
            </div>

            {/* Student Bio block */}
            <div className="p-4 rounded bg-[#000510] border border-[#00D9FF]/20 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-tech">
              <div>
                <span className="text-[#8594A6] uppercase block">STUDENT NAME</span>
                <span className="text-white font-bold">{registration.student?.studentProfile?.fullName || 'Student'}</span>
              </div>
              <div>
                <span className="text-[#8594A6] uppercase block">EMAIL</span>
                <span className="text-white font-bold">{registration.student?.email}</span>
              </div>
              <div>
                <span className="text-[#8594A6] uppercase block">MOBILE</span>
                <span className="text-white font-bold">{registration.student?.studentProfile?.mobile}</span>
              </div>
              <div>
                <span className="text-[#8594A6] uppercase block">COURSE & SEMESTER</span>
                <span className="text-white font-bold">
                  {registration.student?.studentProfile?.course} ({registration.student?.studentProfile?.semester})
                </span>
              </div>
              <div>
                <span className="text-[#8594A6] uppercase block">ENROLLMENT NUMBER</span>
                <span className="text-[#FFC800] font-bold">
                  {registration.student?.studentProfile?.enrollmentNumber || 'N/A'}
                </span>
              </div>
              {registration.payment && (
                <div>
                  <span className="text-[#8594A6] uppercase block">UTR / TRANSACTION REF</span>
                  <span className="text-[#00D9FF] font-mono font-bold">
                    {registration.payment.transactionId}
                  </span>
                </div>
              )}
            </div>

            {/* If Squad event */}
            {registration.teamName && (
              <div className="p-4 rounded bg-[#000510] border border-white/10 text-xs font-tech space-y-1">
                <span className="text-[#FFC800] uppercase font-bold">SQUAD / TEAM NAME:</span>
                <div className="text-white font-bold text-sm">{registration.teamName}</div>
                {registration.teamMembers && (
                  <div className="text-[#8594A6] pt-1">
                    Squad Members: {registration.teamMembers}
                  </div>
                )}
              </div>
            )}

            {/* Rejection notice if rejected */}
            {isRejected && (
              <div className="p-4 rounded bg-[#FF4444]/15 border border-[#FF4444] space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-[#FF4444] font-bold uppercase">
                  <XCircle className="w-4 h-4" />
                  <span>PAYMENT VERIFICATION FAILED</span>
                </div>
                <p className="text-[#FFC800]">
                  <strong>Admin Reason:</strong> {registration.payment?.rejectionReason}
                </p>
                <div className="pt-2">
                  <Link
                    to={`/student/payment/${registration.id}`}
                    className="inline-block px-4 py-2 bg-[#FF4444] hover:bg-red-600 text-white font-anton text-xs tracking-wider rounded"
                  >
                    UPLOAD NEW PAYMENT PROOF
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Pass Footer Security Stamp */}
          <div className="pt-6 border-t border-[#00D9FF]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] font-tech text-[#8594A6] gap-2">
            <div>
              ISSUED BY: FACULTY OF ENGINEERING & TECHNOLOGY
            </div>
            <div className="text-[#00D9FF]">
              VERIFICATION TOKEN: {registration.id.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
