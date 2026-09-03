import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  DollarSign,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import { TeamItem, EsportsStats } from '../../types';

export const AdminEsportsTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [stats, setStats] = useState<EsportsStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [game, setGame] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStats = () => {
    api.get('/admin/esports/stats').then((res) => {
      if (res.data?.success) setStats(res.data.stats);
    });
  };

  const fetchTeams = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: '15',
      search,
      game,
      status,
    });

    api
      .get(`/admin/esports/teams?${params.toString()}`)
      .then((res) => {
        if (res.data?.success) {
          setTeams(res.data.teams);
          setTotalPages(res.data.pagination.totalPages);
          setTotalCount(res.data.pagination.totalCount);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [page, game, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTeams();
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const params = new URLSearchParams({ format, game, status });
      const res = await api.get(`/admin/esports/export?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Esports_Teams_${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to export teams.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-7 h-7 text-[#00D9FF]" />
            <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
              E-SPORTS <span className="text-[#FFC800]">TEAMS MANAGEMENT</span>
            </h1>
          </div>
          <p className="font-tech text-xs text-[#8594A6] mt-1">
            BGMI & Free Fire Squad Verification, Roster Inspection, and Tournament Ledgers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-xs tracking-wider rounded shadow-neon-yellow flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT EXCEL</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="px-3.5 py-2 bg-[#00D9FF]/20 hover:bg-[#00D9FF]/30 border border-[#00D9FF]/40 text-[#00D9FF] font-tech text-xs rounded flex items-center space-x-1.5"
          >
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Counters */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="hud-card p-4 rounded border border-[#00D9FF]/30">
            <span className="text-[10px] text-[#8594A6] uppercase block font-tech">TOTAL BGMI</span>
            <div className="font-anton text-2xl text-white mt-1">{stats.totalBgmiTeams}</div>
          </div>
          <div className="hud-card p-4 rounded border border-[#FFC800]/30">
            <span className="text-[10px] text-[#8594A6] uppercase block font-tech">TOTAL FREE FIRE</span>
            <div className="font-anton text-2xl text-[#FFC800] mt-1">{stats.totalFreeFireTeams}</div>
          </div>
          <div className="hud-card p-4 rounded border border-[#00D9FF]/30">
            <span className="text-[10px] text-[#8594A6] uppercase block font-tech">PENDING REVIEW</span>
            <div className="font-anton text-2xl text-[#00D9FF] mt-1">{stats.pendingTeams}</div>
          </div>
          <div className="hud-card p-4 rounded border border-[#008CFF]/30">
            <span className="text-[10px] text-[#8594A6] uppercase block font-tech">APPROVED TEAMS</span>
            <div className="font-anton text-2xl text-[#008CFF] mt-1">{stats.approvedTeams}</div>
          </div>
          <div className="hud-card p-4 rounded border border-[#FF4444]/30">
            <span className="text-[10px] text-[#8594A6] uppercase block font-tech">REJECTED</span>
            <div className="font-anton text-2xl text-[#FF4444] mt-1">{stats.rejectedTeams}</div>
          </div>
          <div className="hud-card p-4 rounded border border-white/10">
            <span className="text-[10px] text-[#8594A6] uppercase block font-tech">TOTAL PLAYERS</span>
            <div className="font-anton text-2xl text-white mt-1">{stats.totalPlayers}</div>
          </div>
          <div className="hud-card p-4 rounded border border-[#FFC800]/40">
            <span className="text-[10px] text-[#8594A6] uppercase block font-tech">COLLECTION</span>
            <div className="font-anton text-2xl text-[#FFC800] mt-1">₹{stats.totalCollection}</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="hud-card p-4 rounded-lg space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Team Name, Team ID, Captain Name, Email, or UTR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#010914] border border-[#00D9FF]/30 rounded text-xs text-white placeholder-[#8594A6] focus:outline-none focus:border-[#00D9FF]"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-xs tracking-wider rounded"
          >
            SEARCH
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tech">
          <div>
            <label className="text-[#8594A6] uppercase text-[10px] block mb-1">GAME</label>
            <select
              value={game}
              onChange={(e) => {
                setGame(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 bg-[#010914] border border-white/10 rounded text-xs text-white"
            >
              <option value="ALL">All Games</option>
              <option value="BGMI">BGMI</option>
              <option value="FREE_FIRE">Free Fire</option>
            </select>
          </div>

          <div>
            <label className="text-[#8594A6] uppercase text-[10px] block mb-1">STATUS</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 bg-[#010914] border border-white/10 rounded text-xs text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="REJECTED">Rejected</option>
              <option value="RESUBMISSION_REQUIRED">Resubmission Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="hud-card rounded-lg border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#00D9FF] font-tech text-xs">
            QUERYING E-SPORTS SQUADS...
          </div>
        ) : teams.length === 0 ? (
          <div className="p-16 text-center text-[#8594A6] font-tech text-xs">
            No E-Sports teams found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-tech">
              <thead className="bg-[#010914] border-b border-white/10 text-[#8594A6] uppercase">
                <tr>
                  <th className="p-3">TEAM ID</th>
                  <th className="p-3">TEAM NAME</th>
                  <th className="p-3">GAME</th>
                  <th className="p-3">CAPTAIN</th>
                  <th className="p-3">MEMBERS</th>
                  <th className="p-3">AMOUNT</th>
                  <th className="p-3">UTR NUMBER</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">DATE</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-mono font-bold text-[#FFC800]">
                      {team.teamId}
                    </td>

                    <td className="p-3 font-bold text-white">
                      {team.teamName}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          team.game === 'BGMI'
                            ? 'bg-[#00D9FF]/20 text-[#00D9FF]'
                            : 'bg-[#FFC800]/20 text-[#FFC800]'
                        }`}
                      >
                        {team.game}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="text-white font-bold">
                        {team.captain?.studentProfile?.fullName || 'N/A'}
                      </div>
                      <div className="text-[#8594A6] text-[11px]">{team.captain?.email}</div>
                    </td>

                    <td className="p-3 font-bold text-[#00D9FF]">
                      {team.memberCount} / 4 Players
                    </td>

                    <td className="p-3 font-anton text-[#FFC800]">
                      ₹{team.payment?.amount ?? team.memberCount * 49}
                    </td>

                    <td className="p-3 font-mono text-white text-[11px]">
                      {team.payment?.transactionId || '—'}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          team.status === 'APPROVED'
                            ? 'bg-[#008CFF]/20 text-[#00D9FF]'
                            : team.status === 'UNDER_REVIEW'
                            ? 'bg-[#00D9FF]/15 text-[#00D9FF]'
                            : team.status === 'REJECTED'
                            ? 'bg-[#FF4444]/20 text-[#FF4444]'
                            : 'bg-[#FFC800]/20 text-[#FFC800]'
                        }`}
                      >
                        {team.status}
                      </span>
                    </td>

                    <td className="p-3 text-[#8594A6]">
                      {team.createdAt ? team.createdAt.split('T')[0] : ''}
                    </td>

                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/esports/teams/${team.id}`}
                        className="px-3 py-1 bg-[#00D9FF]/15 hover:bg-[#00D9FF]/30 border border-[#00D9FF]/40 text-[#00D9FF] rounded font-tech text-[11px] inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>INSPECT</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-[#010914] border-t border-white/10 flex items-center justify-between text-xs font-tech text-[#8594A6]">
          <span>
            Page {page} of {totalPages || 1} ({totalCount} total teams)
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
