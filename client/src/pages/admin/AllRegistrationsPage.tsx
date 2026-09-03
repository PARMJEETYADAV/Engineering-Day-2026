import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { RegistrationItem, EventItem } from '../../types';

export const AllRegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [eventId, setEventId] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [course, setCourse] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search,
        eventId,
        status,
        course,
        sortBy,
        sortOrder,
      });

      const res = await api.get(`/admin/registrations?${params.toString()}`);
      if (res.data?.success) {
        setRegistrations(res.data.registrations);
        setTotalPages(res.data.pagination.totalPages);
        setTotalCount(res.data.pagination.totalCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/events').then((res) => {
      if (res.data?.success) setEvents(res.data.events);
    });
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [page, eventId, status, course, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRegistrations();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
            ALL <span className="text-[#FFC800]">REGISTRATIONS</span>
          </h1>
          <p className="font-tech text-xs text-[#8594A6]">
            Total Records: {totalCount} • Filter, Audit, and Export
          </p>
        </div>

        <Link
          to="/admin/export"
          className="px-4 py-2 bg-[#00D9FF]/15 hover:bg-[#00D9FF]/25 border border-[#00D9FF]/40 text-xs font-tech text-[#00D9FF] rounded flex items-center space-x-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT SPREADSHEET</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="hud-card p-4 rounded-lg space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name, Email, Mobile, Reg ID, or UTR..."
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
            <label className="text-[#8594A6] uppercase text-[10px] block mb-1">EVENT</label>
            <select
              value={eventId}
              onChange={(e) => {
                setEventId(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 bg-[#010914] border border-white/10 rounded text-xs text-white"
            >
              <option value="ALL">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
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
            </select>
          </div>

          <div>
            <label className="text-[#8594A6] uppercase text-[10px] block mb-1">SORT BY</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 bg-[#010914] border border-white/10 rounded text-xs text-white"
            >
              <option value="createdAt">Date Created</option>
              <option value="registrationNumber">Registration ID</option>
            </select>
          </div>

          <div>
            <label className="text-[#8594A6] uppercase text-[10px] block mb-1">ORDER</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full p-2 bg-[#010914] border border-white/10 rounded text-xs text-white"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="hud-card rounded-lg border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#00D9FF] font-tech text-xs">
            QUERYING DATABASE RECORDS...
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-16 text-center text-[#8594A6] font-tech text-xs">
            No registrations found matching the specified parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-tech">
              <thead className="bg-[#010914] border-b border-white/10 text-[#8594A6] uppercase">
                <tr>
                  <th className="p-3">REG ID</th>
                  <th className="p-3">STUDENT NAME</th>
                  <th className="p-3">CONTACT</th>
                  <th className="p-3">COURSE / SEM</th>
                  <th className="p-3">EVENT</th>
                  <th className="p-3">FEE</th>
                  <th className="p-3">UTR NUMBER</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">DATE</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#FFC800]">
                      {reg.registrationNumber}
                    </td>

                    <td className="p-3 text-white font-bold">
                      {reg.student?.studentProfile?.fullName || 'N/A'}
                    </td>

                    <td className="p-3">
                      <div className="text-[#8594A6]">{reg.student?.email}</div>
                      <div className="text-[#00D9FF] text-[11px]">
                        {reg.student?.studentProfile?.mobile}
                      </div>
                    </td>

                    <td className="p-3 text-[#D0D5DC]">
                      {reg.student?.studentProfile?.course} ({reg.student?.studentProfile?.semester})
                    </td>

                    <td className="p-3 text-white font-bold">{reg.event.name}</td>

                    <td className="p-3 font-anton text-[#FFC800]">
                      ₹{reg.payment?.amount ?? reg.event.registrationFee}
                    </td>

                    <td className="p-3 font-mono text-white text-[11px]">
                      {reg.payment?.transactionId || '—'}
                    </td>

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

                    <td className="p-3 text-[#8594A6]">
                      {reg.createdAt.split('T')[0]}
                    </td>

                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/registrations/${reg.id}`}
                        className="px-2.5 py-1 bg-[#00D9FF]/15 hover:bg-[#00D9FF]/30 border border-[#00D9FF]/40 text-[#00D9FF] rounded font-tech text-[11px]"
                      >
                        VIEW
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
            Page {page} of {totalPages || 1} ({totalCount} total entries)
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
