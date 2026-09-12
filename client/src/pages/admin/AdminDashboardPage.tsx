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
  Database,
  Download,
  HelpCircle,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { AdminStats } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showDbGuide, setShowDbGuide] = useState(false);

  const handleDownloadBackup = async () => {
    setExporting(true);
    try {
      const response = await api.get('/admin/export?format=excel', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Engineering_Day_2026_Full_Database_Backup_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to generate backup file.');
    } finally {
      setExporting(false);
    }
  };

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

      {/* Database Persistence Status Banner */}
      <div
        className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          stats.isPermanent
            ? 'bg-[#00D9FF]/10 border-[#00D9FF]/40 text-[#00D9FF]'
            : 'bg-[#FFC800]/10 border-[#FFC800]/40 text-[#FFC800]'
        }`}
      >
        <div className="flex items-start sm:items-center space-x-3">
          <Database className="w-6 h-6 shrink-0 mt-1 sm:mt-0" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-anton text-base tracking-wide text-white">DATABASE STATUS:</span>
              <span className="text-white px-2.5 py-0.5 rounded bg-black/50 font-mono text-xs border border-white/10 font-bold">
                {stats.dbProvider || 'SQLITE'}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded font-tech font-bold ${
                  stats.isPermanent
                    ? 'bg-[#00D9FF]/20 text-[#00D9FF] border border-[#00D9FF]/30'
                    : 'bg-[#FFC800]/20 text-[#FFC800] border border-[#FFC800]/30 animate-pulse'
                }`}
              >
                {stats.isPermanent
                  ? '✓ 100% PERMANENT CLOUD DATABASE ACTIVE'
                  : '⚠️ RUNNING ON LOCAL DISK (ACTION RECOMMENDED)'}
              </span>
            </div>
            <p className="font-tech text-xs text-[#D0D5DC] mt-1">
              {stats.isPermanent
                ? 'All registrations, squads, and payments are permanently stored in PostgreSQL and will NEVER be erased on server sleep.'
                : 'Render free tier erases local files when sleeping. Connect your free cloud PostgreSQL database to keep all registrations forever.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadBackup}
            disabled={exporting}
            className="px-3.5 py-2 rounded bg-[#010914] border border-white/20 text-white hover:border-[#FFC800] hover:text-[#FFC800] font-tech text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'EXPORTING...' : 'EXPORT BACKUP (EXCEL)'}</span>
          </button>
          {!stats.isPermanent && (
            <button
              type="button"
              onClick={() => setShowDbGuide(true)}
              className="px-4 py-2 rounded bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-xs tracking-wider shadow-neon-yellow flex items-center space-x-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>ENABLE PERMANENT DB</span>
            </button>
          )}
        </div>
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

      {/* Cloud Database Setup Guide Modal */}
      {showDbGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="hud-card max-w-2xl w-full p-6 rounded-xl border border-[#00D9FF]/40 bg-[#000510] text-white shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-[#FFC800]" />
                <h3 className="font-anton text-lg tracking-wide text-white">
                  PERMANENT CLOUD DATABASE SETUP GUIDE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDbGuide(false)}
                className="p-1 hover:bg-white/10 rounded text-[#8594A6] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-tech text-[#D0D5DC] leading-relaxed">
              <div className="p-3.5 rounded bg-[#FFC800]/10 border border-[#FFC800]/30 text-[#FFC800]">
                <strong className="block font-bold mb-1">WHY DOES DATA RESET ON SLEEP?</strong>
                Render's free hosting puts servers to sleep after 15 minutes of inactivity. When it sleeps, the local container disk (SQLite file) is wiped. To keep all student registrations, squad lists, and payments forever, connect a <strong>Free Cloud Database</strong>.
              </div>

              <div className="p-3.5 rounded bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF]">
                <strong className="block font-bold mb-1">NOTE ON MONGODB VS POSTGRESQL:</strong>
                This application uses <strong>Prisma Relational SQL</strong> (Foreign keys for students, squads, payments, and events). MongoDB is a NoSQL document store and is incompatible with relational schemas. We have fully configured <strong>PostgreSQL</strong>, which is 100% cloud-ready and <strong>completely free</strong> on Render, Neon, or Supabase with ZERO code changes!
              </div>

              <div>
                <h4 className="font-anton text-sm text-white mb-2 tracking-wide">
                  METHOD 1: RENDER FREE POSTGRESQL (RECOMMENDED - 2 MINUTES)
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[#BAC7D5]">
                  <li>Go to your <strong>Render Dashboard</strong> (<a href="https://dashboard.render.com" target="_blank" rel="noreferrer" className="text-[#00D9FF] underline">dashboard.render.com</a>).</li>
                  <li>Click <strong>New +</strong> in the top menu and select <strong>PostgreSQL</strong>.</li>
                  <li>Give it a name like <code className="bg-black px-1.5 py-0.5 rounded text-[#FFC800]">engineering-day-db</code> and click <strong>Create Database</strong>.</li>
                  <li>Once created, scroll down to <strong>Connections</strong> and copy the <strong>Internal Database URL</strong> (or External Database URL).</li>
                  <li>Go to your Web Service in Render ➔ <strong>Environment</strong> tab.</li>
                  <li>Add or update the environment variable:
                    <div className="mt-1 p-2 bg-black/60 rounded font-mono text-[11px] text-[#00D9FF] select-all border border-white/10">
                      DATABASE_URL = &lt;paste-your-copied-postgres-url-here&gt;
                    </div>
                  </li>
                  <li>Click <strong>Save Changes</strong>. Render will redeploy and automatically migrate all tables permanently!</li>
                </ol>
              </div>

              <div>
                <h4 className="font-anton text-sm text-white mb-2 tracking-wide">
                  METHOD 2: NEON.TECH (FREE SERVERLESS POSTGRES)
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[#BAC7D5]">
                  <li>Sign up for free at <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-[#00D9FF] underline">neon.tech</a> with your GitHub account.</li>
                  <li>Create a free database project named <code className="bg-black px-1.5 py-0.5 rounded text-[#FFC800]">engineering-day</code>.</li>
                  <li>Copy the connection string (starts with <code className="text-[#00D9FF]">postgresql://...</code>).</li>
                  <li>Paste it into your Render Web Service Environment as <code className="text-[#FFC800]">DATABASE_URL</code>.</li>
                </ol>
              </div>

              <div className="p-3 rounded bg-black/40 border border-white/10 flex items-center justify-between">
                <span className="text-[#8594A6]">Need a local backup right now?</span>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  disabled={exporting}
                  className="px-3 py-1.5 rounded bg-[#010914] border border-[#00D9FF]/40 text-[#00D9FF] hover:bg-[#00D9FF]/20 text-xs font-anton tracking-wide flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{exporting ? 'EXPORTING...' : 'EXPORT EXCEL BACKUP'}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDbGuide(false)}
                className="px-5 py-2 rounded bg-[#00D9FF] hover:bg-[#00B4D8] text-[#000510] font-anton text-xs tracking-wider"
              >
                GOT IT, CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
