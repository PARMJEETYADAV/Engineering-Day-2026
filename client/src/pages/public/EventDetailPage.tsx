import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Award, ShieldCheck, ChevronLeft, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { EventItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    api
      .get(`/events/${slug}`)
      .then((res) => {
        if (res.data?.success) {
          setEvent(res.data.event);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center text-[#00D9FF] font-tech text-sm">
        <div className="w-8 h-8 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        LOADING EVENT SPECIFICATION...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-24 text-center max-w-md mx-auto hud-card p-8 rounded">
        <h2 className="font-anton text-2xl text-white">EVENT NOT FOUND</h2>
        <p className="text-xs text-[#8594A6] mt-2 mb-6">The requested event does not exist or has been modified.</p>
        <Link to="/events" className="px-5 py-2.5 bg-[#00D9FF] text-[#010914] font-oswald text-xs tracking-wider rounded">
          BACK TO ALL EVENTS
        </Link>
      </div>
    );
  }

  const handleRegisterClick = () => {
    const isEsports =
      event.category === 'ESPORTS' || event.slug === 'bgmi' || event.slug === 'free-fire';
    const destination = isEsports
      ? `/student/esports/create?game=${event.slug.includes('free') ? 'FREE_FIRE' : 'BGMI'}`
      : `/student/register-event?eventId=${event.id}`;

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(destination)}`);
    } else {
      navigate(destination);
    }
  };

  return (
    <div className="py-16 bg-[#010914] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb / Back button */}
        <Link
          to="/events"
          className="inline-flex items-center space-x-1.5 text-xs font-tech text-[#8594A6] hover:text-[#00D9FF] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO EVENTS DIRECTORY</span>
        </Link>

        {/* Hero Card */}
        <div className="hud-card p-8 rounded-lg border-2 border-[#00D9FF]/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-2 text-xs font-tech text-[#00D9FF] font-bold uppercase mb-2">
                <span>{event.day.replace('_', ' ')}</span>
                <span>•</span>
                <span>{event.category}</span>
                <span>•</span>
                <span className="text-[#FFC800]">{event.date}</span>
              </div>
              <h1 className="font-anton text-3xl sm:text-5xl text-white tracking-wide">
                {event.name}
              </h1>
            </div>

            <div className="text-left md:text-right">
              <span className="font-tech text-xs text-[#8594A6] uppercase block">ENTRY FEE</span>
              <span className="font-anton text-3xl sm:text-4xl text-[#FFC800]">
                {event.registrationFee > 0 ? `₹${event.registrationFee}` : 'FREE ENTRY'}
              </span>
              <span className="block text-[11px] font-tech text-[#00D9FF]">
                {event.isTeamEvent ? `Squad / Team (${event.minTeamSize} members)` : 'Individual Solo'}
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 text-xs font-tech">
            <div className="p-3 bg-[#000510] rounded border border-white/5 space-y-1">
              <div className="flex items-center space-x-1.5 text-[#00D9FF]">
                <Clock className="w-4 h-4" />
                <span>TIMING</span>
              </div>
              <div className="text-white font-bold">{event.startTime || 'TBA'} - {event.endTime || 'TBA'}</div>
            </div>

            <div className="p-3 bg-[#000510] rounded border border-white/5 space-y-1">
              <div className="flex items-center space-x-1.5 text-[#FFC800]">
                <MapPin className="w-4 h-4" />
                <span>VENUE</span>
              </div>
              <div className="text-white font-bold">{event.venue || 'Campus Auditorium'}</div>
            </div>

            <div className="p-3 bg-[#000510] rounded border border-white/5 space-y-1">
              <div className="flex items-center space-x-1.5 text-[#008CFF]">
                <Users className="w-4 h-4" />
                <span>TEAM SIZE</span>
              </div>
              <div className="text-white font-bold">
                {event.isTeamEvent ? `${event.minTeamSize} Players` : 'Solo (1 Member)'}
              </div>
            </div>

            <div className="p-3 bg-[#000510] rounded border border-white/5 space-y-1">
              <div className="flex items-center space-x-1.5 text-[#00D9FF]">
                <ShieldCheck className="w-4 h-4" />
                <span>STATUS</span>
              </div>
              <div className={event.isRegistrationOpen ? 'text-[#00D9FF] font-bold' : 'text-[#FF4444] font-bold'}>
                {event.isRegistrationOpen ? 'OPEN FOR REGISTRATION' : 'REGISTRATION CLOSED'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="font-oswald text-lg text-white tracking-wider uppercase">OVERVIEW</h3>
            <p className="text-sm text-[#D0D5DC] leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Rules and Regulations */}
          {event.rules && (
            <div className="space-y-4 pt-6 mt-6 border-t border-white/10">
              <h3 className="font-oswald text-lg text-[#FFC800] tracking-wider uppercase">
                RULES & CODE OF CONDUCT
              </h3>
              <div className="p-5 rounded bg-[#000510] border border-[#00D9FF]/20 text-xs sm:text-sm text-[#D0D5DC] whitespace-pre-line leading-relaxed font-mono">
                {event.rules}
              </div>
            </div>
          )}

          {/* Action CTA */}
          <div className="pt-8 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#8594A6] font-tech">
              * Official university identity card is mandatory during the event day.
            </div>

            {event.isRegistrationOpen && event.category !== 'CEREMONY' && (
              <button
                onClick={handleRegisterClick}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-base tracking-wider rounded shadow-neon-yellow transition-all flex items-center justify-center space-x-2"
              >
                <span>REGISTER FOR THIS EVENT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
