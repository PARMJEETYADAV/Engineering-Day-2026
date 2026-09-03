import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Calendar, Filter, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { EventItem } from '../../types';

export const ExportDataPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [status, setStatus] = useState('ALL');
  const [eventId, setEventId] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api.get('/events').then((res) => {
      if (res.data?.success) setEvents(res.data.events);
    });
  }, []);

  const handleExport = async (format: 'excel' | 'csv') => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        format,
        status,
        eventId,
        startDate,
        endDate,
      });

      const response = await api.get(`/admin/export?${params.toString()}`, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Engineering_Day_2026_Registrations_${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to generate export file. Please check filters.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
          EXPORT <span className="text-[#FFC800]">CENTER</span>
        </h1>
        <p className="font-tech text-xs text-[#8594A6]">
          Download Full Registration & Payment Ledger in Excel (.xlsx) and CSV Formats
        </p>
      </div>

      <div className="hud-card p-8 rounded-lg border border-[#00D9FF]/30 space-y-6 max-w-3xl">
        <div className="flex items-center space-x-2 text-[#00D9FF] pb-4 border-b border-white/10">
          <Filter className="w-5 h-5 text-[#FFC800]" />
          <h2 className="font-oswald text-base text-white uppercase font-bold">
            CUSTOMIZE EXPORT FILTERS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-tech">
          <div>
            <label className="text-[#8594A6] uppercase block mb-1">EVENT FILTER</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full p-2.5 bg-[#010914] border border-white/10 rounded text-white"
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
            <label className="text-[#8594A6] uppercase block mb-1">REGISTRATION STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 bg-[#010914] border border-white/10 rounded text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved Only</option>
              <option value="UNDER_REVIEW">Pending Review Only</option>
              <option value="PAYMENT_PENDING">Pending Payment Only</option>
              <option value="REJECTED">Rejected Only</option>
            </select>
          </div>

          <div>
            <label className="text-[#8594A6] uppercase block mb-1">FROM DATE</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-[#010914] border border-white/10 rounded text-white"
            />
          </div>

          <div>
            <label className="text-[#8594A6] uppercase block mb-1">TO DATE</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-[#010914] border border-white/10 rounded text-white"
            />
          </div>
        </div>

        {/* Download Buttons */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExport('excel')}
            className="flex-1 py-3.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-yellow flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exporting ? 'GENERATING EXCEL...' : 'DOWNLOAD EXCEL SPREADSHEET (.XLSX)'}</span>
          </button>

          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExport('csv')}
            className="flex-1 py-3.5 bg-[#00D9FF] hover:bg-[#00BFFF] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-cyan flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{exporting ? 'GENERATING CSV...' : 'DOWNLOAD CSV DATA (.CSV)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
