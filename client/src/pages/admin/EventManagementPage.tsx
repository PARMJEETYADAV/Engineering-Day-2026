import React, { useState, useEffect } from 'react';
import { Calendar, Edit, CheckCircle2, AlertCircle, Clock, MapPin, DollarSign, X, Plus, Trash2, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { EventItem } from '../../types';

export const EventManagementPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const initialNewEvent = {
    name: '',
    category: 'TECHNICAL',
    day: 'DAY_1',
    date: '14 September 2026',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'Apex University Auditorium, VT Road, Mansarovar',
    registrationFee: 49,
    maxParticipants: 100,
    isRegistrationOpen: true,
    isTeamEvent: false,
    minTeamSize: 1,
    maxTeamSize: 1,
    description: '',
    rules: '1. Standard university rules apply.\n2. Must carry valid university ID card.\n3. Reporting time: 15 minutes before scheduled start.\n4. Decisions of event coordinators will be final.',
  };

  const [newEvent, setNewEvent] = useState(initialNewEvent);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/events');
      if (res.data?.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setSaving(true);

    try {
      const res = await api.patch(`/admin/events/${editingEvent.id}`, editingEvent);
      if (res.data?.success) {
        setMessage(`Event "${editingEvent.name}" updated successfully!`);
        setTimeout(() => setMessage(null), 4000);
        setEditingEvent(null);
        fetchEvents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update event.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.post('/admin/events', newEvent);
      if (res.data?.success) {
        setMessage(`Event "${newEvent.name}" created successfully!`);
        setTimeout(() => setMessage(null), 4000);
        setIsAddingEvent(false);
        setNewEvent(initialNewEvent);
        fetchEvents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    setSaving(true);

    try {
      const res = await api.delete(`/admin/events/${deletingEvent.id}`);
      if (res.data?.success) {
        setMessage(`Event "${deletingEvent.name}" deleted successfully!`);
        setTimeout(() => setMessage(null), 4000);
        setDeletingEvent(null);
        fetchEvents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
            EVENT <span className="text-[#FFC800]">MANAGEMENT</span>
          </h1>
          <p className="font-tech text-xs text-[#8594A6]">
            Configure, Add, or Delete Competition Events with Complete Dates, Timelines, Fees & Venues
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingEvent(true)}
          className="px-5 py-2.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider uppercase rounded shadow-neon-yellow flex items-center space-x-2 self-start sm:self-auto transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 text-[#010914]" />
          <span>+ ADD NEW EVENT</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-[#00D9FF]/15 border border-[#00D9FF] text-[#00D9FF] text-xs font-tech rounded flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#00D9FF] shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12 text-[#8594A6] font-tech text-xs">
          Loading events catalog...
        </div>
      ) : events.length === 0 ? (
        <div className="hud-card p-12 text-center rounded-lg border border-white/10 space-y-3">
          <Calendar className="w-12 h-12 text-[#8594A6] mx-auto opacity-40" />
          <p className="font-oswald text-lg text-white">NO EVENTS CONFIGURED</p>
          <p className="text-xs text-[#8594A6]">Click "+ ADD NEW EVENT" to initialize your first event.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="hud-card p-6 rounded-lg border border-white/10 space-y-4 hover:border-[#00D9FF]/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-tech text-[10px] text-[#00D9FF] uppercase font-bold tracking-wider">
                    {ev.day.replace('_', ' ')} • {ev.category}
                  </span>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.isRegistrationOpen
                          ? 'bg-[#008CFF]/20 text-[#00D9FF]'
                          : 'bg-[#FF4444]/20 text-[#FF4444]'
                      }`}
                    >
                      {ev.isRegistrationOpen ? 'REGISTRATION OPEN' : 'CLOSED'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded bg-[#FFC800]/10 border border-[#FFC800]/30 font-anton text-xs text-[#FFC800]">
                      {ev.registrationFee > 0 ? `₹${ev.registrationFee}` : 'FREE ENTRY'}
                    </span>
                  </div>
                </div>

                <h2 className="font-anton text-2xl text-white">{ev.name}</h2>
                <p className="text-xs text-[#8594A6] leading-relaxed line-clamp-2">{ev.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs font-tech text-[#D0D5DC] pt-2">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FFC800] shrink-0" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00D9FF] shrink-0" />
                    <span>{ev.startTime || 'TBA'} - {ev.endTime || 'TBA'}</span>
                  </div>
                  <div className="col-span-2 flex items-start space-x-1.5 text-[11px] text-[#8594A6]">
                    <MapPin className="w-3.5 h-3.5 text-[#008CFF] shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{ev.venue || 'Apex University Auditorium, VT Road, Mansarovar'}</span>
                  </div>
                  <div className="col-span-2 text-[11px] text-[#8594A6]">
                    👥 Capacity: <strong className="text-white">{ev.maxParticipants ? `${ev.maxParticipants} slots` : 'Unlimited'}</strong>
                    {ev.isTeamEvent && (
                      <span className="ml-2 text-[#00D9FF]">• Squad ({ev.minTeamSize}-{ev.maxTeamSize} players)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDeletingEvent(ev)}
                  className="px-3 py-1.5 bg-[#FF4444]/15 hover:bg-[#FF4444]/25 border border-[#FF4444]/40 text-[#FF4444] font-tech text-xs rounded flex items-center space-x-1 transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>DELETE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingEvent(ev)}
                  className="px-4 py-1.5 bg-[#00D9FF]/15 hover:bg-[#00D9FF]/25 border border-[#00D9FF]/40 text-[#00D9FF] font-oswald text-xs tracking-wider rounded flex items-center space-x-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>EDIT SPECIFICATIONS</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD NEW EVENT MODAL */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="hud-card max-w-2xl w-full p-6 rounded-lg border-2 border-[#FFC800] space-y-4 my-8 shadow-neon-yellow">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-anton text-xl text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-[#FFC800]" />
                <span>ADD NEW EVENT</span>
              </span>
              <button
                onClick={() => setIsAddingEvent(false)}
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-[#8594A6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-tech">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">
                    EVENT NAME <span className="text-[#FFC800]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ROBOTICS RACE"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    className="w-full p-2.5 bg-[#010914] border border-[#FFC800]/40 rounded text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">CATEGORY</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                  >
                    <option value="TECHNICAL">TECHNICAL</option>
                    <option value="ESPORTS">ESPORTS</option>
                    <option value="CULTURAL">CULTURAL</option>
                    <option value="CEREMONY">CEREMONY</option>
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="GAMING">GAMING</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">EVENT DAY</label>
                  <select
                    value={newEvent.day}
                    onChange={(e) => {
                      const dayVal = e.target.value;
                      setNewEvent({
                        ...newEvent,
                        day: dayVal,
                        date: dayVal === 'DAY_2' ? '15 September 2026' : '14 September 2026',
                      });
                    }}
                    className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                  >
                    <option value="DAY_1">DAY 1 (14 Sep 2026)</option>
                    <option value="DAY_2">DAY 2 (15 Sep 2026)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">
                    EVENT DATE <span className="text-[#FFC800]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    placeholder="e.g. 14 September 2026"
                    className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                  />
                </div>

                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">REGISTRATION FEE (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newEvent.registrationFee}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        registrationFee: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full p-2.5 bg-[#010914] border border-[#FFC800]/40 rounded text-[#FFC800] font-bold"
                  />
                  <span className="text-[10px] text-[#8594A6] mt-0.5 block">0 = Free Entry</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">START TIME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                  />
                </div>

                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">END TIME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01:00 PM"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8594A6] uppercase block mb-1">VENUE / LOCATION</label>
                <input
                  type="text"
                  required
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                />
              </div>

              <div>
                <label className="text-[#8594A6] uppercase block mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summary of the event..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">MAX PARTICIPANTS (SLOTS)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100 (empty for unlimited)"
                    value={newEvent.maxParticipants || ''}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        maxParticipants: e.target.value ? parseInt(e.target.value, 10) : 0,
                      })
                    }
                    className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-5">
                  <input
                    type="checkbox"
                    id="newRegOpenToggle"
                    checked={newEvent.isRegistrationOpen}
                    onChange={(e) => setNewEvent({ ...newEvent, isRegistrationOpen: e.target.checked })}
                    className="w-4 h-4 text-[#00D9FF] rounded bg-[#010914] border-white/20"
                  />
                  <label htmlFor="newRegOpenToggle" className="text-white cursor-pointer select-none">
                    REGISTRATION ACTIVE IMMEDIATELY
                  </label>
                </div>
              </div>

              <div className="p-3 rounded bg-[#010914] border border-white/10 space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="newTeamEventToggle"
                    checked={newEvent.isTeamEvent}
                    onChange={(e) => setNewEvent({ ...newEvent, isTeamEvent: e.target.checked })}
                    className="w-4 h-4 text-[#FFC800] rounded bg-[#010914] border-white/20"
                  />
                  <label htmlFor="newTeamEventToggle" className="text-white font-bold cursor-pointer select-none">
                    IS THIS A TEAM-BASED EVENT?
                  </label>
                </div>

                {newEvent.isTeamEvent && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[#8594A6] uppercase block mb-1">MIN SQUAD SIZE</label>
                      <input
                        type="number"
                        min={1}
                        value={newEvent.minTeamSize}
                        onChange={(e) => setNewEvent({ ...newEvent, minTeamSize: parseInt(e.target.value, 10) || 1 })}
                        className="w-full p-2 bg-[#000510] border border-white/20 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[#8594A6] uppercase block mb-1">MAX SQUAD SIZE</label>
                      <input
                        type="number"
                        min={1}
                        value={newEvent.maxTeamSize}
                        onChange={(e) => setNewEvent({ ...newEvent, maxTeamSize: parseInt(e.target.value, 10) || 1 })}
                        className="w-full p-2 bg-[#000510] border border-white/20 rounded text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[#8594A6] uppercase block mb-1">EVENT RULES & GUIDELINES</label>
                <textarea
                  rows={3}
                  value={newEvent.rules}
                  onChange={(e) => setNewEvent({ ...newEvent, rules: e.target.value })}
                  className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-4 py-2 bg-white/5 text-xs text-[#8594A6] rounded"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-xs tracking-wider rounded disabled:opacity-50 shadow-neon-yellow"
                >
                  {saving ? 'CREATING...' : 'CONFIRM & ADD EVENT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="hud-card max-w-2xl w-full p-6 rounded-lg border-2 border-[#00D9FF] space-y-4 my-8 shadow-neon-cyan">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-anton text-xl text-white">
                EDIT EVENT: {editingEvent.name}
              </span>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-[#8594A6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs font-tech">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">EVENT NAME</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.name}
                    onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                    className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                  />
                </div>

                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">REGISTRATION FEE (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingEvent.registrationFee}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        registrationFee: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full p-2.5 bg-[#010914] border border-[#FFC800]/40 rounded text-[#FFC800] font-bold"
                  />
                  <span className="text-[10px] text-[#8594A6] mt-0.5 block">0 = Free Entry</span>
                </div>
              </div>

              <div>
                <label className="text-[#8594A6] uppercase block mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={editingEvent.description}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">EVENT DATE</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 September 2026"
                    value={editingEvent.date || ''}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">START TIME</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={editingEvent.startTime || ''}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, startTime: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">END TIME</label>
                  <input
                    type="text"
                    placeholder="e.g. 01:00 PM"
                    value={editingEvent.endTime || ''}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, endTime: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8594A6] uppercase block mb-1">VENUE / LOCATION</label>
                <input
                  type="text"
                  value={editingEvent.venue || ''}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, venue: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#8594A6] uppercase block mb-1">
                    MAXIMUM PARTICIPANTS (SLOTS)
                  </label>
                  <input
                    type="number"
                    placeholder="Empty for unlimited"
                    value={editingEvent.maxParticipants ?? ''}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        maxParticipants: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="regOpenToggle"
                    checked={editingEvent.isRegistrationOpen}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, isRegistrationOpen: e.target.checked })
                    }
                    className="w-4 h-4 text-[#00D9FF] rounded bg-[#010914] border-white/20"
                  />
                  <label htmlFor="regOpenToggle" className="text-white cursor-pointer select-none font-bold">
                    REGISTRATION PORTAL OPEN
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[#8594A6] uppercase block mb-1">
                  EVENT RULES & CODE OF CONDUCT (TEXT/MARKDOWN)
                </label>
                <textarea
                  rows={3}
                  value={editingEvent.rules || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, rules: e.target.value })}
                  className="w-full p-2.5 bg-[#010914] border border-white/20 rounded text-white font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 bg-white/5 text-xs text-[#8594A6] rounded"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-xs tracking-wider rounded disabled:opacity-50 shadow-neon-yellow"
                >
                  {saving ? 'COMMITTING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="hud-card max-w-md w-full p-6 rounded-lg border-2 border-[#FF4444] space-y-4 shadow-[0_0_20px_rgba(255,68,68,0.4)]">
            <div className="flex items-center space-x-3 text-[#FF4444]">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-anton text-xl text-white">DELETE EVENT</h3>
            </div>

            <p className="text-xs text-[#D0D5DC] leading-relaxed">
              Are you sure you want to permanently delete event{' '}
              <strong className="text-white underline">"{deletingEvent.name}"</strong>?
            </p>

            <div className="p-3 bg-[#FF4444]/10 border border-[#FF4444]/30 rounded text-xs text-[#FFC800] font-tech">
              ⚠️ Any student registrations and payment logs linked to this event will also be removed.
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingEvent(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-tech text-white rounded"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleDeleteEvent}
                className="px-5 py-2 bg-[#FF4444] hover:bg-[#D32F2F] text-white font-anton text-xs tracking-wider uppercase rounded shadow-[0_0_10px_rgba(255,68,68,0.5)]"
              >
                {saving ? 'DELETING...' : 'YES, PERMANENTLY DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
