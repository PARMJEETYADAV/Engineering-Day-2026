import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs?page=${page}&limit=20`);
      if (res.data?.success) {
        setLogs(res.data.logs);
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
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
          ADMIN <span className="text-[#00D9FF]">AUDIT LOGS</span>
        </h1>
        <p className="font-tech text-xs text-[#8594A6]">
          Immutable Trail of All Administrative Actions, Approvals, and System Alterations
        </p>
      </div>

      {/* Log Table */}
      <div className="hud-card rounded-lg border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#00D9FF] font-tech text-xs">
            FETCHING SECURITY LOG ENTRIES...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-[#8594A6] font-tech text-xs">
            No audit logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-tech">
              <thead className="bg-[#010914] border-b border-white/10 text-[#8594A6] uppercase">
                <tr>
                  <th className="p-3.5">TIMESTAMP</th>
                  <th className="p-3.5">ADMINISTRATOR</th>
                  <th className="p-3.5">ACTION</th>
                  <th className="p-3.5">TARGET TYPE</th>
                  <th className="p-3.5">ACTION DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 text-[#8594A6] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-[#00D9FF] font-bold">
                      {log.admin?.email}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#FFC800]">
                      {log.targetType}
                    </td>
                    <td className="p-3.5 text-[#D0D5DC] font-mono text-[11px] max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-[#010914] border-t border-white/10 flex items-center justify-between text-xs font-tech text-[#8594A6]">
          <span>Page {page} of {totalPages || 1} ({totalCount} entries)</span>
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
