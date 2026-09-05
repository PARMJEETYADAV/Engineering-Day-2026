import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Calendar, ShieldCheck, ArrowRight, ArrowLeft, Users, CreditCard } from 'lucide-react';
import api from '../../services/api';
import { EventItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const RegisterEventPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialEventId = queryParams.get('eventId') || '';

  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId);
  const [step, setStep] = useState<number>(1);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/events')
      .then((res) => {
        if (res.data?.success) {
          // Filter out non-registerable ceremonies
          const registerable = res.data.events.filter(
            (e: EventItem) => e.isRegistrationOpen && e.category !== 'CEREMONY'
          );
          setEvents(registerable);
          if (!selectedEventId && registerable.length > 0) {
            setSelectedEventId(registerable[0].id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Auto-redirect if an E-Sports event is selected
  useEffect(() => {
    if (selectedEvent) {
      const isEsports =
        selectedEvent.category === 'ESPORTS' ||
        selectedEvent.slug === 'bgmi' ||
        selectedEvent.slug === 'free-fire';

      if (isEsports) {
        const gameParam = selectedEvent.slug.includes('free') ? 'FREE_FIRE' : 'BGMI';
        navigate(`/student/esports/create?game=${gameParam}`, { replace: true });
      }
    }
  }, [selectedEvent, navigate]);

  const handleCreateRegistration = async () => {
    if (!selectedEvent) return;
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/registrations', {
        eventId: selectedEvent.id,
        teamName: selectedEvent.isTeamEvent ? teamName : undefined,
        teamMembers: selectedEvent.isTeamEvent && teamMembers ? teamMembers.split(',').map((s) => s.trim()) : undefined,
      });

      if (res.data?.success) {
        const reg = res.data.registration;
        // If event requires payment, direct to payment screen immediately
        if (selectedEvent.requiresPayment && selectedEvent.registrationFee > 0) {
          navigate(`/student/payment/${reg.id}`);
        } else {
          navigate(`/student/registrations/${reg.id}`);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(
          err.response.data.message ||
            'You have already submitted a registration for this event.'
        );
      } else {
        setError(err.response?.data?.message || 'Failed to submit registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-14 bg-[#010914] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-[#00D9FF] font-tech text-xs tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4 text-[#FFC800]" />
            <span>EVENT ENROLLMENT WORKFLOW</span>
          </div>
          <h1 className="font-anton text-3xl sm:text-5xl text-white tracking-wide">
            REGISTER FOR <span className="text-[#FFC800]">COMPETITION</span>
          </h1>
          <p className="font-oswald text-xs sm:text-sm text-[#8594A6] tracking-wider uppercase">
            SELECT EVENT • CONFIRM DETAILS • INITIALIZE PAYMENT
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="hud-card p-4 rounded-lg border border-[#00D9FF]/20 flex items-center justify-between text-xs font-tech">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-[#FFC800] font-bold' : 'text-[#8594A6]'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center">1</span>
            <span>CHOOSE EVENT</span>
          </div>
          <span className="text-white/20">―</span>
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-[#FFC800] font-bold' : 'text-[#8594A6]'}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center">2</span>
            <span>VERIFY DETAILS</span>
          </div>
          <span className="text-white/20">―</span>
          <div className="flex items-center space-x-2 text-[#8594A6]">
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center">3</span>
            <span>MAKE PAYMENT</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded bg-[#FF4444]/10 border border-[#FF4444]/40 text-[#FF4444] text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              <Link to="/student/dashboard" className="text-[#00D9FF] font-tech underline mt-1 block">
                Go to Student Dashboard to view existing registrations ›
              </Link>
            </div>
          </div>
        )}

        {/* STEP 1: Select Event */}
        {step === 1 && (
          <div className="hud-card p-8 rounded-lg border border-[#00D9FF]/30 space-y-6">
            <div>
              <h2 className="font-anton text-2xl text-white tracking-wide">
                STEP 1: SELECT EVENT
              </h2>
              <p className="font-tech text-xs text-[#8594A6]">
                Click on the event you wish to register for
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map((ev) => {
                const isSelected = selectedEventId === ev.id;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`p-5 rounded text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#008CFF]/20 border-[#00D9FF] shadow-neon-cyan'
                        : 'bg-[#000510] border-white/10 hover:border-[#00D9FF]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-tech mb-2">
                        <span className="text-[#00D9FF]">{ev.day.replace('_', ' ')}</span>
                        <span className="px-2 py-0.5 rounded bg-[#FFC800]/10 text-[#FFC800] font-bold">
                          {ev.registrationFee > 0 ? `₹${ev.registrationFee}` : 'FREE'}
                        </span>
                      </div>
                      <h3 className="font-oswald text-lg text-white font-bold">{ev.name}</h3>
                      <p className="text-xs text-[#8594A6] line-clamp-2 mt-1">{ev.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-tech text-[#D0D5DC] flex items-center justify-between">
                      <span>{ev.isTeamEvent ? `Squad (${ev.minTeamSize} players)` : 'Solo Entry'}</span>
                      {isSelected && <span className="text-[#FFC800] font-bold">SELECTED ✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                disabled={!selectedEventId}
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-yellow transition-all flex items-center space-x-2"
              >
                <span>PROCEED TO STEP 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Verify & Confirm Personal Details */}
        {step === 2 && selectedEvent && (
          <div className="hud-card p-8 rounded-lg border border-[#00D9FF]/30 space-y-6">
            <div>
              <h2 className="font-anton text-2xl text-white tracking-wide">
                STEP 2: VERIFY DETAILS & TEAM
              </h2>
              <p className="font-tech text-xs text-[#8594A6]">
                Confirm participant and tournament information
              </p>
            </div>

            {/* Event Summary Card */}
            <div className="p-4 rounded bg-[#000510] border border-[#00D9FF]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-oswald text-xl text-white font-bold">{selectedEvent.name}</span>
                <span className="font-anton text-xl text-[#FFC800]">
                  FEE: {selectedEvent.registrationFee > 0 ? `₹${selectedEvent.registrationFee}` : 'FREE'}
                </span>
              </div>
              <p className="text-xs text-[#8594A6]">{selectedEvent.description}</p>
              <div className="text-[11px] font-tech text-[#00D9FF] pt-1">
                Date: {selectedEvent.date} • Venue: {selectedEvent.venue || 'Campus Arena'}
              </div>
            </div>

            {/* Student Details Pre-filled */}
            <div className="space-y-3">
              <h3 className="font-oswald text-base text-white uppercase">STUDENT DETAILS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-tech">
                <div className="p-3 rounded bg-[#000510] border border-white/5">
                  <span className="text-[#8594A6] block uppercase">Student Name</span>
                  <span className="text-white font-bold">{user?.fullName}</span>
                </div>
                <div className="p-3 rounded bg-[#000510] border border-white/5">
                  <span className="text-[#8594A6] block uppercase">Student Email</span>
                  <span className="text-white font-bold">{user?.email}</span>
                </div>
                <div className="p-3 rounded bg-[#000510] border border-white/5">
                  <span className="text-[#8594A6] block uppercase">Course</span>
                  <span className="text-white font-bold">{user?.profile?.course || 'N/A'}</span>
                </div>
                <div className="p-3 rounded bg-[#000510] border border-white/5">
                  <span className="text-[#8594A6] block uppercase">Semester</span>
                  <span className="text-white font-bold">{user?.profile?.semester || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Team details if squad event */}
            {selectedEvent.isTeamEvent && (
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="flex items-center space-x-2 text-[#00D9FF]">
                  <Users className="w-5 h-5" />
                  <h3 className="font-oswald text-base text-white uppercase font-bold">
                    SQUAD INFORMATION ({selectedEvent.minTeamSize} PLAYERS)
                  </h3>
                </div>

                <div>
                  <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                    TEAM / CLAN NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delta Force / Byte Brawlers"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
                  />
                </div>

                <div>
                  <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                    OTHER TEAM MEMBERS (NAMES & IN-GAME IDS, COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Verma (ID: 55412), Priya Singh (ID: 66321)"
                    value={teamMembers}
                    onChange={(e) => setTeamMembers(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-xs font-tech text-[#D0D5DC] rounded flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>CHANGE EVENT</span>
              </button>

              <button
                type="button"
                disabled={loading || (selectedEvent.isTeamEvent && !teamName.trim())}
                onClick={handleCreateRegistration}
                className="px-8 py-3 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-yellow transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>INITIALIZING...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>CONFIRM & PROCEED TO PAYMENT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
