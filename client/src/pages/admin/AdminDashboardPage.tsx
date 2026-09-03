import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { AdminStats } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => {
        if (res.data?.success) {
          setStats(res.data.stats);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-[#00D9FF] font-tech text-xs">
        CALCULATING AUDIT METRICS & REVENUE AGGREGATES...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-20 text-center text-[#FF4444] font-tech text-xs">
        FAILED TO LOAD DASHBOARD METRICS.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
            EXECUTIVE <span className="text-[#FFC800]">OVERVIEW</span>
          </h1>
          <p className="font-tech text-xs text-[#8594A6]">
            Real-time Registration & Financial Verification Metrics
          </p>
        </div>

        {stats.pendingVerifications > 0 && (
          <Link
            to="/admin/payments"
            className="px-4 py-2 rounded bg-[#00D9FF]/15 border border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/25 font-tech text-xs font-bold tracking-wider flex items-center space-x-2 animate-pulse shadow-neon-cyan"
          >
            <Clock className="w-4 h-4 text-[#FFC800]" />
            <span>{stats.pendingVerifications} PENDING VERIFICATION(S)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="hud-card p-5 rounded border border-[#00D9FF]/30">
          <span className="font-tech text-[10px] text-[#8594A6] uppercase block">TOTAL STUDENTS</span>
          <div className="font-anton text-3xl text-white mt-1">{stats.totalStudents}</div>
          <span className="text-[10px] text-[#00D9FF] font-tech">Enrolled accounts</span>
        </div>

        <div className="hud-card p-5 rounded border border-white/20">
          <span className="font-tech text-[10px] text-[#8594A6] uppercase block">TOTAL REGISTRATIONS</span>
          <div className="font-anton text-3xl text-white mt-1">{stats.totalRegistrations}</div>
          <span className="text-[10px] text-[#8594A6] font-tech">Across all events</span>
        </div>

        <div className="hud-card p-5 rounded border border-[#00D9FF] shadow-neon-cyan">
          <span className="font-tech text-[10px] text-[#00D9FF] uppercase font-bold block">PENDING REVIEWS</span>
          <div className="font-anton text-3xl text-[#00D9FF] mt-1">{stats.pendingVerifications}</div>
          <span className="text-[10px] text-[#FFC800] font-tech">Action required</span>
        </div>

        <div className="hud-card p-5 rounded border border-[#008CFF]/40">
          <span className="font-tech text-[10px] text-[#8594A6] uppercase block">APPROVED REGISTRATIONS</span>
          <div className="font-anton text-3xl text-[#008CFF] mt-1">{stats.approvedRegistrations}</div>
          <span className="text-[10px] text-[#00D9FF] font-tech">Passes issued</span>
        </div>

        <div className="hud-card p-5 rounded border border-[#FF4444]/30">
          <span className="font-tech text-[10px] text-[#8594A6] uppercase block">REJECTED PAYMENTS</span>
          <div className="font-anton text-3xl text-[#FF4444] mt-1">{stats.rejectedRegistrations}</div>
          <span className="text-[10px] text-[#FF4444] font-tech">Resubmission sought</span>
        </div>

        <div className="hud-card p-5 rounded border-2 border-[#FFC800] shadow-neon-yellow">
          <span className="font-tech text-[10px] text-[#FFC800] uppercase font-bold block">TOTAL COLLECTION</span>
          <div className="font-anton text-3xl text-[#FFC800] mt-1">₹{stats.totalCollection}</div>
          <span className="text-[10px] text-white font-tech">Verified & Received</span>
        </div>
      </div>

      {/* Event-wise Distribution Breakdown */}
      <div className="hud-card p-6 rounded-lg border border-[#00D9FF]/30 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="font-anton text-xl text-white tracking-wide">
              EVENT-WISE REGISTRATION BREAKDOWN
            </h2>
            <p className="font-tech text-xs text-[#8594A6]">
              Participation distribution across competitive and cultural categories
            </p>
          </div>
          <span className="font-tech text-xs text-[#FFC800]">
            TOTAL REVENUE PENDING: ₹{stats.totalPendingAmount}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.eventStats.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded bg-[#010914] border border-white/10 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-tech text-[#00D9FF] uppercase">{ev.category}</span>
                <h3 className="font-oswald text-base text-white font-bold">{ev.name}</h3>
                <span className="text-xs font-tech text-[#8594A6]">
                  Fee: {ev.fee > 0 ? `₹${ev.fee}` : 'Free'}
                </span>
              </div>
              <div className="text-right">
                <div className="font-anton text-3xl text-[#FFC800]">{ev.count}</div>
                <span className="text-[10px] font-tech text-[#8594A6]">Participants</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="hud-card p-6 rounded-lg border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-anton text-xl text-white tracking-wide">
            RECENT REGISTRATIONS REQUIRING ATTENTION
          </h2>
          <Link
            to="/admin/registrations"
            className="text-xs font-tech text-[#00D9FF] hover:underline flex items-center space-x-1"
          >
            <span>View All Registrations</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-tech">
            <thead className="bg-[#010914] border-b border-white/10 text-[#8594A6] uppercase">
              <tr>
                <th className="p-3">REG ID</th>
                <th className="p-3">STUDENT</th>
                <th className="p-3">EVENT</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">UTR NUMBER</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.recentRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-white/[0.02]">
                  <td className="p-3 font-mono font-bold text-[#FFC800]">
                    {reg.registrationNumber}
                  </td>
                  <td className="p-3">
                    <div className="text-white font-bold">{reg.student?.studentProfile?.fullName || 'Student'}</div>
                    <div className="text-[#8594A6] text-[11px]">{reg.student?.email}</div>
                  </td>
                  <td className="p-3 text-white">{reg.event.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        reg.status === 'APPROVED'
                          ? 'bg-[#008CFF]/20 text-[#00D9FF]'
                          : reg.status === 'UNDER_REVIEW'
                          ? 'bg-[#00D9FF]/15 text-[#00D9FF]'
                          : reg.status === 'REJECTED'
                          ? 'bg-[#FF4444]/20 text-[#FF4444]'
                          : 'bg-[#FFC800]/20 text-[#FFC800]'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[#D0D5DC]">
                    {reg.payment?.transactionId || 'Not submitted'}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/admin/registrations/${reg.id}`}
                      className="px-3 py-1 bg-[#00D9FF]/15 hover:bg-[#00D9FF]/30 border border-[#00D9FF]/40 text-[#00D9FF] rounded font-tech text-[11px]"
                    >
                      INSPECT
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
