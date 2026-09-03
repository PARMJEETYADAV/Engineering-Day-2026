import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, PlusCircle, CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight, Download, CreditCard, ShieldCheck, Gamepad2, Lock, Shield, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { RegistrationItem, TeamItem } from '../../types';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      api.get('/registrations/my').catch(() => ({ data: { success: false, registrations: [] } })),
      api.get('/esports/my-teams').catch(() => ({ data: { success: false, teams: [] } })),
    ])
      .then(([regRes, teamRes]) => {
        if (regRes.data?.success) setRegistrations(regRes.data.registrations);
        if (teamRes.data?.success) setTeams(teamRes.data.teams);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const approvedCount = registrations.filter((r) => r.status === 'APPROVED').length;
  const underReviewCount = registrations.filter((r) => r.status === 'UNDER_REVIEW').length;
  const pendingPaymentCount = registrations.filter((r) => r.status === 'PAYMENT_PENDING').length;
  const rejectedCount = registrations.filter((r) => r.status === 'REJECTED').length;

  return (
    <div className="py-12 bg-[#010914] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Welcome Header */}
        <div className="hud-card p-8 rounded-lg border-2 border-[#00D9FF]/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-xs font-tech text-[#00D9FF] font-bold uppercase">
                <Calendar className="w-4 h-4 text-[#FFC800]" />
                <span>ENGINEERING DAY • 14–15 SEPTEMBER 2026</span>
              </div>
              <h1 className="font-anton text-3xl sm:text-5xl text-white tracking-wide">
                WELCOME, <span className="text-[#FFC800]">{user?.fullName?.toUpperCase() || 'STUDENT'}</span>
              </h1>
              <p className="font-tech text-xs sm:text-sm text-[#8594A6]">
                Portal Account ID: <span className="text-[#00D9FF] font-mono">{user?.id.substring(0, 13)}...</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/student/esports"
                className="px-6 py-3 bg-[#00D9FF] hover:bg-[#00BFFF] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-cyan transition-all flex items-center space-x-2"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>REGISTER FOR E-SPORTS (BGMI / FF)</span>
              </Link>
              <Link
                to="/student/register-event"
                className="px-5 py-3 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-yellow transition-all flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>OTHER EVENTS</span>
              </Link>
              <Link
                to="/student/profile"
                className="px-5 py-3 bg-[#000510] hover:bg-white/5 border border-[#00D9FF]/40 text-xs font-tech text-[#00D9FF] tracking-wider rounded"
              >
                EDIT PROFILE
              </Link>
            </div>
          </div>

          {/* Student Profile Quick Summary HUD */}
          {user?.profile && (
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-tech">
              <div>
                <span className="text-[#8594A6] block uppercase">Course / Branch</span>
                <span className="text-white font-bold">{user.profile.course}</span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">Semester</span>
                <span className="text-white font-bold">{user.profile.semester}</span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">Mobile</span>
                <span className="text-white font-bold">{user.profile.mobile}</span>
              </div>
              <div>
                <span className="text-[#8594A6] block uppercase">Enrollment No</span>
                <span className="text-[#FFC800] font-bold">{user.profile.enrollmentNumber || 'Not provided'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="hud-card p-5 rounded border border-[#00D9FF]/20">
            <span className="font-tech text-[10px] text-[#8594A6] uppercase block">TOTAL REGISTRATIONS</span>
            <div className="font-anton text-3xl text-white mt-1">{registrations.length}</div>
          </div>

          <div className="hud-card p-5 rounded border border-[#FFC800]/20">
            <span className="font-tech text-[10px] text-[#8594A6] uppercase block">PENDING PAYMENT</span>
            <div className="font-anton text-3xl text-[#FFC800] mt-1">{pendingPaymentCount}</div>
          </div>

          <div className="hud-card p-5 rounded border border-[#00D9FF]/30">
            <span className="font-tech text-[10px] text-[#8594A6] uppercase block">UNDER REVIEW</span>
            <div className="font-anton text-3xl text-[#00D9FF] mt-1">{underReviewCount}</div>
          </div>

          <div className="hud-card p-5 rounded border border-[#008CFF]/30">
            <span className="font-tech text-[10px] text-[#8594A6] uppercase block">APPROVED & CONFIRMED</span>
            <div className="font-anton text-3xl text-[#008CFF] mt-1">{approvedCount}</div>
          </div>

          <div className="hud-card p-5 rounded border border-[#FF4444]/20 col-span-2 md:col-span-1">
            <span className="font-tech text-[10px] text-[#8594A6] uppercase block">REJECTED / ACTION REQ</span>
            <div className="font-anton text-3xl text-[#FF4444] mt-1">{rejectedCount}</div>
          </div>
        </div>

        {/* My E-Sports Teams Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="w-6 h-6 text-[#00D9FF]" />
              <h2 className="font-anton text-2xl text-white tracking-wide">
                MY E-SPORTS <span className="text-[#00D9FF]">TEAMS</span>
              </h2>
            </div>
            <Link
              to="/student/esports"
              className="px-3.5 py-1.5 bg-[#00D9FF]/15 hover:bg-[#00D9FF]/25 border border-[#00D9FF]/40 text-xs font-tech text-[#00D9FF] rounded flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>CREATE SQUAD</span>
            </Link>
          </div>

          {teams.length === 0 ? (
            <div className="hud-card p-8 rounded text-center space-y-3 border border-white/10">
              <Gamepad2 className="w-10 h-10 text-[#8594A6] mx-auto opacity-50" />
              <p className="font-tech text-xs text-[#8594A6]">
                You haven't registered an E-Sports squad yet for BGMI or Free Fire.
              </p>
              <Link
                to="/student/esports"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#00D9FF] text-[#010914] font-anton text-xs tracking-wider rounded shadow-neon-cyan"
              >
                <span>REGISTER SQUAD (1–4 PLAYERS)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="hud-card p-6 sm:p-8 rounded-lg border-2 border-[#00D9FF]/40 space-y-6 shadow-neon-cyan"
                >
                  {/* Team Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded bg-[#FFC800]/20 text-[#FFC800] font-tech text-xs font-bold border border-[#FFC800]/30">
                          {team.game === 'BGMI' ? 'BGMI' : 'FREE FIRE'}
                        </span>
                        <h3 className="font-anton text-2xl sm:text-3xl text-white tracking-wide">
                          {team.teamName}
                        </h3>
                      </div>
                      <div className="font-mono text-xs text-[#00D9FF] font-bold">
                        TEAM ID: {team.teamId}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
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
                        {team.status === 'APPROVED'
                          ? 'APPROVED ✓'
                          : team.status === 'UNDER_REVIEW'
                          ? 'UNDER REVIEW'
                          : team.status === 'REJECTED'
                          ? 'REJECTED'
                          : team.status === 'RESUBMISSION_REQUIRED'
                          ? 'RESUBMISSION REQUIRED'
                          : 'PAYMENT PENDING'}
                      </span>

                      {team.isLocked && (
                        <span className="px-2.5 py-1 rounded bg-[#000510] border border-white/20 text-[#8594A6] font-tech text-xs flex items-center space-x-1">
                          <Lock className="w-3.5 h-3.5 text-[#00D9FF]" />
                          <span>TEAM LOCKED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Locked Notice if Approved */}
                  {team.status === 'APPROVED' && (
                    <div className="p-3 bg-[#008CFF]/10 border border-[#00D9FF]/30 rounded text-xs font-tech text-[#00D9FF] flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>TEAM LOCKED:</strong> Your team has been officially approved. Roster details can no longer be modified. Contact the event coordinator if a correction is needed.
                      </span>
                    </div>
                  )}

                  {/* Rejection Alert */}
                  {(team.status === 'REJECTED' || team.status === 'RESUBMISSION_REQUIRED') && team.payment?.rejectionReason && (
                    <div className="p-4 bg-[#FF4444]/10 border border-[#FF4444]/40 rounded-lg space-y-2 text-xs font-tech text-white">
                      <div className="text-[#FF4444] font-anton text-sm flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>PAYMENT PROOF REJECTED BY ADMINISTRATOR</span>
                      </div>
                      <p>
                        <strong>Reason:</strong> {team.payment.rejectionReason}
                      </p>
                      <div className="pt-2">
                        <Link
                          to={`/student/esports/create?game=${team.game}`}
                          className="px-4 py-2 bg-[#FF4444] hover:bg-red-600 text-white font-anton text-xs tracking-wider rounded inline-flex items-center space-x-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>RESUBMIT PAYMENT PROOF</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Squad Summary Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#000510] p-4 rounded-lg border border-white/5 text-xs font-tech">
                    <div>
                      <span className="text-[#8594A6] uppercase block text-[10px]">SQUAD SIZE</span>
                      <span className="font-bold text-white text-sm">{team.memberCount} / 4 Players</span>
                    </div>
                    <div>
                      <span className="text-[#8594A6] uppercase block text-[10px]">TOTAL AMOUNT</span>
                      <span className="font-anton text-base text-[#FFC800]">
                        ₹{team.payment?.amount ?? team.memberCount * 49}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8594A6] uppercase block text-[10px]">PAYMENT UTR</span>
                      <span className="font-mono text-white text-xs">
                        {team.payment?.transactionId || 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8594A6] uppercase block text-[10px]">PAYMENT STATUS</span>
                      <span className="text-[#00D9FF] font-bold">
                        {team.payment?.status === 'APPROVED' ? 'VERIFIED' : team.payment?.status || 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Member Roster Cards */}
                  <div className="space-y-3">
                    <span className="font-oswald text-xs uppercase tracking-wider text-[#8594A6] block">
                      OFFICIAL SQUAD ROSTER ({team.members.length} MEMBERS)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {team.members.map((member, idx) => (
                        <div
                          key={member.id}
                          className={`p-4 rounded border text-xs font-tech space-y-2 ${
                            member.isCaptain
                              ? 'bg-[#00D9FF]/5 border-[#00D9FF]/40 shadow-neon-cyan'
                              : 'bg-[#010914] border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-[#8594A6] text-[10px] font-bold">
                              MEMBER #{idx + 1}
                            </span>
                            {member.isCaptain && (
                              <span className="px-2 py-0.5 rounded bg-[#00D9FF]/20 text-[#00D9FF] text-[10px] font-bold">
                                TEAM CAPTAIN
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-white font-bold text-sm block truncate">
                              {member.fullName}
                            </span>
                            <span className="text-[#8594A6] text-[11px] block truncate">
                              {member.course} ({member.semester})
                            </span>
                          </div>

                          <div className="pt-1 border-t border-white/5 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-[#8594A6] text-[10px]">IGN:</span>
                              <span className="text-[#FFC800] font-bold">{member.ign}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8594A6] text-[10px]">
                                {team.game === 'BGMI' ? 'Player ID:' : 'UID:'}
                              </span>
                              <span className="text-white font-mono">{member.gameUid}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Registrations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-anton text-2xl text-white tracking-wide">
              OTHER EVENT <span className="text-[#FFC800]">REGISTRATIONS</span>
            </h2>
            <span className="font-tech text-xs text-[#8594A6]">
              Showing {registrations.length} record(s)
            </span>
          </div>

          {loading ? (
            <div className="hud-card p-12 text-center text-[#00D9FF] font-tech text-xs">
              FETCHING REGISTRATION RECORDS...
            </div>
          ) : registrations.length === 0 ? (
            <div className="hud-card p-12 rounded-lg text-center space-y-4">
              <p className="font-oswald text-lg text-[#8594A6] uppercase">
                YOU HAVE NOT REGISTERED FOR ANY EVENTS YET.
              </p>
              <Link
                to="/student/register-event"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#FFC800] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-yellow"
              >
                <span>CHOOSE AN EVENT TO PARTICIPATE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="hud-card p-6 rounded-lg border border-[#00D9FF]/25 hover:border-[#00D9FF]/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded bg-[#00D9FF]/10 border border-[#00D9FF]/30 font-mono text-xs text-[#00D9FF] font-bold">
                        {reg.registrationNumber}
                      </span>

                      {/* Status Badges */}
                      {reg.status === 'APPROVED' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#008CFF]/20 text-[#00D9FF] border border-[#008CFF]/40 text-xs font-tech font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00D9FF]" />
                          <span>CONFIRMED ✓</span>
                        </span>
                      )}

                      {reg.status === 'UNDER_REVIEW' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#00D9FF]/15 text-[#00D9FF] border border-[#00D9FF]/40 text-xs font-tech font-bold animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-[#FFC800]" />
                          <span>PAYMENT UNDER REVIEW</span>
                        </span>
                      )}

                      {reg.status === 'PAYMENT_PENDING' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#FFC800]/20 text-[#FFC800] border border-[#FFC800]/40 text-xs font-tech font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>PAYMENT PENDING</span>
                        </span>
                      )}

                      {reg.status === 'REJECTED' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#FF4444]/20 text-[#FF4444] border border-[#FF4444]/40 text-xs font-tech font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>ACTION REQUIRED</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-anton text-2xl text-white tracking-wide">
                      {reg.event.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-tech text-[#8594A6]">
                      <span>📅 {reg.event.date}</span>
                      <span>•</span>
                      <span>⏰ {reg.event.startTime || 'TBA'}</span>
                      <span>•</span>
                      <span>📍 {reg.event.venue || 'University Campus'}</span>
                      {reg.payment && (
                        <>
                          <span>•</span>
                          <span className="text-[#D0D5DC]">UTR: {reg.payment.transactionId}</span>
                        </>
                      )}
                    </div>

                    {/* Rejection Note Alert */}
                    {reg.status === 'REJECTED' && reg.payment?.rejectionReason && (
                      <div className="mt-2 p-3 bg-[#FF4444]/10 border border-[#FF4444]/30 rounded text-xs text-[#FFC800]">
                        <strong>Admin Reason:</strong> {reg.payment.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap items-center gap-3">
                    {reg.status === 'PAYMENT_PENDING' && (
                      <Link
                        to={`/student/payment/${reg.id}`}
                        className="px-5 py-2.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-xs tracking-wider rounded shadow-neon-yellow flex items-center space-x-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>PAY & UPLOAD PROOF</span>
                      </Link>
                    )}

                    {reg.status === 'REJECTED' && (
                      <Link
                        to={`/student/payment/${reg.id}`}
                        className="px-5 py-2.5 bg-[#FF4444] hover:bg-red-600 text-white font-anton text-xs tracking-wider rounded flex items-center space-x-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>RE-UPLOAD PROOF</span>
                      </Link>
                    )}

                    <Link
                      to={`/student/registrations/${reg.id}`}
                      className="px-4 py-2.5 bg-[#000510] hover:bg-white/10 border border-[#00D9FF]/30 text-xs font-tech text-[#00D9FF] rounded flex items-center space-x-1"
                    >
                      <span>VIEW PASS / DETAILS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
