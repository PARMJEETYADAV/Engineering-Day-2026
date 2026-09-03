import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, ChevronLeft, ChevronRight, AlertCircle, Shield } from 'lucide-react';
import api from '../../services/api';

export const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/students?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
      if (res.data?.success) {
        setStudents(res.data.students);
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
    fetchStudents();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleToggleStatus = async (studentId: string) => {
    try {
      const res = await api.patch(`/admin/students/${studentId}/toggle`);
      if (res.data?.success) {
        setMessage(res.data.message);
        setTimeout(() => setMessage(null), 3000);
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update student status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
          STUDENT <span className="text-[#FFC800]">DIRECTORY</span>
        </h1>
        <p className="font-tech text-xs text-[#8594A6]">
          Total Enrolled Accounts: {totalCount} • Account State & Security Controls
        </p>
      </div>

      {message && (
        <div className="p-3 bg-[#00D9FF]/15 border border-[#00D9FF] text-[#00D9FF] text-xs rounded">
          {message}
        </div>
      )}

      {/* Search Bar */}
      <div className="hud-card p-4 rounded-lg">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, email, mobile, or enrollment number..."
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
      </div>

      {/* Students Table */}
      <div className="hud-card rounded-lg border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#00D9FF] font-tech text-xs">
            QUERYING STUDENT DATABASE...
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center text-[#8594A6] font-tech text-xs">
            No student accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-tech">
              <thead className="bg-[#010914] border-b border-white/10 text-[#8594A6] uppercase">
                <tr>
                  <th className="p-3">FULL NAME</th>
                  <th className="p-3">EMAIL</th>
                  <th className="p-3">MOBILE</th>
                  <th className="p-3">COURSE / SEM</th>
                  <th className="p-3">ENROLLMENT NO</th>
                  <th className="p-3">REGISTRATIONS</th>
                  <th className="p-3">ACCOUNT STATE</th>
                  <th className="p-3 text-right">CONTROLS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">
                      {st.studentProfile?.fullName || 'N/A'}
                    </td>
                    <td className="p-3 text-[#D0D5DC]">{st.email}</td>
                    <td className="p-3 text-[#00D9FF]">
                      {st.studentProfile?.mobile || 'N/A'}
                    </td>
                    <td className="p-3 text-[#8594A6]">
                      {st.studentProfile?.course} ({st.studentProfile?.semester})
                    </td>
                    <td className="p-3 text-[#FFC800] font-mono">
                      {st.studentProfile?.enrollmentNumber || '—'}
                    </td>
                    <td className="p-3 font-bold text-white text-center sm:text-left">
                      {st._count?.registrations || 0}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.isActive
                            ? 'bg-[#008CFF]/20 text-[#00D9FF]'
                            : 'bg-[#FF4444]/20 text-[#FF4444]'
                        }`}
                      >
                        {st.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(st.id)}
                        className={`px-3 py-1 rounded text-[11px] font-anton tracking-wider ${
                          st.isActive
                            ? 'bg-[#FF4444]/20 hover:bg-[#FF4444]/40 text-[#FF4444] border border-[#FF4444]/30'
                            : 'bg-[#00D9FF]/20 hover:bg-[#00D9FF]/40 text-[#00D9FF] border border-[#00D9FF]/30'
                        }`}
                      >
                        {st.isActive ? 'DEACTIVATE' : 'ENABLE'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 bg-[#010914] border-t border-white/10 flex items-center justify-between text-xs font-tech text-[#8594A6]">
          <span>
            Page {page} of {totalPages || 1}
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
