import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Code2, HelpCircle, Music, Trophy, Search, Filter, Calendar, MapPin, Clock } from 'lucide-react';
import api from '../../services/api';
import { EventItem } from '../../types';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get('/events')
      .then((res) => {
        if (res.data?.success) {
          setEvents(res.data.events);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'ESPORTS':
        return Gamepad2;
      case 'TECHNICAL':
        return Code2;
      case 'CULTURAL':
        return Music;
      case 'CEREMONY':
        return Trophy;
      default:
        return Code2;
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesCategory = selectedCategory === 'ALL' || ev.category === selectedCategory;
    const matchesDay = selectedDay === 'ALL' || ev.day === selectedDay;
    const matchesSearch =
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      ev.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesDay && matchesSearch;
  });

  return (
    <div className="py-16 bg-[#010914] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] font-tech text-xs tracking-widest uppercase">
            <span>OFFICIAL TOURNAMENT CATALOG</span>
          </div>
          <h1 className="font-anton text-4xl sm:text-6xl text-white tracking-wide">
            EXPLORE <span className="text-[#FFC800]">EVENTS</span>
          </h1>
          <p className="font-oswald text-base text-[#8594A6] tracking-wider uppercase max-w-xl mx-auto">
            14TH & 15TH SEPTEMBER 2026 • SIGN UP FOR MULTIPLE COMPETITIONS
          </p>
        </div>

        {/* Filter Controls */}
        <div className="hud-card p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#8594A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#000510] border border-[#00D9FF]/30 rounded text-xs text-white placeholder-[#8594A6] focus:outline-none focus:border-[#00D9FF]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center space-x-1 mr-2 text-xs font-tech text-[#8594A6]">
              <Filter className="w-3.5 h-3.5" />
              <span>CATEGORY:</span>
            </div>
            {['ALL', 'ESPORTS', 'TECHNICAL', 'CULTURAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded text-xs font-oswald tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#FFC800] text-[#010914] font-bold shadow-neon-yellow'
                    : 'bg-[#000510] text-[#D0D5DC] border border-[#00D9FF]/20 hover:border-[#00D9FF]'
                }`}
              >
                {cat}
              </button>
            ))}

            <div className="h-4 w-px bg-white/20 mx-2 hidden lg:block" />

            {['ALL', 'DAY_1', 'DAY_2'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded text-xs font-tech tracking-wider transition-all ${
                  selectedDay === d
                    ? 'bg-[#00D9FF] text-[#010914] font-bold shadow-neon-cyan'
                    : 'bg-[#000510] text-[#8594A6] border border-white/10 hover:border-white/30'
                }`}
              >
                {d.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="hud-card p-6 rounded h-64 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 hud-card rounded">
            <p className="font-oswald text-lg text-[#8594A6] uppercase">No events matched your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => {
              const Icon = getEventIcon(ev.category);
              return (
                <div
                  key={ev.id}
                  className="hud-card p-6 rounded flex flex-col justify-between hover:border-[#00D9FF] transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded bg-[#008CFF]/15 text-[#00D9FF] group-hover:text-[#FFC800] transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded bg-[#FFC800]/10 border border-[#FFC800]/30 font-anton text-sm text-[#FFC800]">
                        {ev.registrationFee > 0 ? `₹${ev.registrationFee}` : 'FREE ENTRY'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-[11px] font-tech text-[#00D9FF] font-bold">
                        <span>{ev.day.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{ev.category}</span>
                      </div>
                      <h3 className="font-oswald text-xl text-white font-bold tracking-wide mt-1">
                        {ev.name}
                      </h3>
                    </div>

                    <p className="text-xs text-[#8594A6] leading-relaxed line-clamp-3">
                      {ev.description}
                    </p>

                    <div className="space-y-1.5 pt-2 text-[11px] font-tech text-[#D0D5DC]">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-[#00D9FF]" />
                        <span>{ev.startTime || 'TBA'} - {ev.endTime || 'TBA'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-[#FFC800]" />
                        <span>{ev.venue || 'Campus Arena'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                    <Link
                      to={`/events/${ev.slug}`}
                      className="flex-1 py-2.5 text-center font-oswald text-xs tracking-wider text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                    >
                      VIEW DETAILS
                    </Link>
                    {ev.isRegistrationOpen && ev.category !== 'CEREMONY' && (
                      <Link
                        to={
                          ev.category === 'ESPORTS' || ev.slug === 'bgmi' || ev.slug === 'free-fire'
                            ? `/student/esports/create?game=${ev.slug.includes('free') ? 'FREE_FIRE' : 'BGMI'}`
                            : `/student/register-event?eventId=${ev.id}`
                        }
                        className="flex-1 py-2.5 text-center font-anton text-xs tracking-wider text-[#010914] bg-[#FFC800] hover:bg-[#E5B400] rounded shadow-neon-yellow transition-all"
                      >
                        {ev.category === 'ESPORTS' || ev.slug === 'bgmi' || ev.slug === 'free-fire'
                          ? 'BUILD SQUAD'
                          : 'REGISTER'}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
