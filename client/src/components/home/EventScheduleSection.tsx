import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Code2, HelpCircle, Music, Trophy, ArrowRight, ShieldCheck, Sparkles, MapPin, Clock } from 'lucide-react';
import { EventItem } from '../../types';

interface EventScheduleProps {
  events?: EventItem[];
}

export const EventScheduleSection: React.FC<EventScheduleProps> = ({ events }) => {
  // Pre-configured fallback details if events not yet loaded from DB
  const defaultDay1Events = [
    {
      name: 'E-SPORTS — BGMI',
      slug: 'bgmi',
      fee: '₹49 PER MEMBER',
      isFree: false,
      time: '10:00 AM - 01:00 PM',
      venue: 'Apex University Auditorium, VT Road, Mansarovar',
      category: 'ESPORTS',
      desc: 'Compete in an exciting BGMI tournament and showcase your gaming skills, teamwork and strategy.',
    },
    {
      name: 'E-SPORTS — FREE FIRE',
      slug: 'free-fire',
      fee: '₹49 PER MEMBER',
      isFree: false,
      time: '02:00 PM - 05:00 PM',
      venue: 'Apex University Auditorium, VT Road, Mansarovar',
      category: 'ESPORTS',
      desc: 'Battle it out in a competitive Free Fire tournament and prove your gaming skills.',
    },
    {
      name: 'BLIND CODING COMPETITION',
      slug: 'blind-coding',
      fee: '₹49',
      isFree: false,
      time: '11:00 AM - 01:00 PM',
      venue: 'Apex University Auditorium, VT Road, Mansarovar',
      category: 'TECHNICAL',
      desc: 'Test your programming logic and problem-solving skills under challenging conditions.',
    },
    {
      name: 'QUIZ COMPETITION',
      slug: 'quiz',
      fee: '₹49',
      isFree: false,
      time: '02:30 PM - 04:30 PM',
      venue: 'Apex University Auditorium, VT Road, Mansarovar',
      category: 'TECHNICAL',
      desc: 'Test your knowledge across engineering, technology, science, general awareness and current affairs.',
    },
  ];

  const defaultDay2Events = [
    {
      name: 'CULTURAL PERFORMANCE',
      slug: 'cultural-performance',
      fee: 'FREE ENTRY',
      isFree: true,
      time: '10:00 AM - 01:30 PM',
      venue: 'Apex University Auditorium, VT Road, Mansarovar',
      category: 'CULTURAL',
      desc: 'A platform for students to showcase their singing, dancing, performing and creative talents.',
    },
    {
      name: 'PRIZE DISTRIBUTION',
      slug: 'prize-distribution',
      fee: 'FREE ENTRY',
      isFree: true,
      time: '03:00 PM - 05:30 PM',
      venue: 'Apex University Auditorium, VT Road, Mansarovar',
      category: 'CEREMONY',
      desc: 'Recognizing winners and celebrating excellence achieved during Engineering Day 2026.',
    },
  ];

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'ESPORTS':
      case 'GAMING':
        return Gamepad2;
      case 'TECHNICAL':
      case 'WORKSHOP':
        return Code2;
      case 'CULTURAL':
        return Music;
      case 'CEREMONY':
        return Trophy;
      default:
        return Sparkles;
    }
  };

  // Use dynamic events from database if available
  const hasDynamicEvents = events && events.length > 0;
  const day1Events = hasDynamicEvents
    ? events
        .filter((e) => e.day === 'DAY_1')
        .map((e) => ({
          name: e.name,
          slug: e.slug,
          fee: e.registrationFee > 0 ? `₹${e.registrationFee}` : 'FREE ENTRY',
          isFree: e.registrationFee === 0,
          time: `${e.startTime || '10:00 AM'} - ${e.endTime || '01:00 PM'}`,
          venue: e.venue || 'Apex University Auditorium, VT Road, Mansarovar',
          category: e.category,
          desc: e.description,
        }))
    : defaultDay1Events;

  const day2Events = hasDynamicEvents
    ? events
        .filter((e) => e.day === 'DAY_2')
        .map((e) => ({
          name: e.name,
          slug: e.slug,
          fee: e.registrationFee > 0 ? `₹${e.registrationFee}` : 'FREE ENTRY',
          isFree: e.registrationFee === 0,
          time: `${e.startTime || '10:00 AM'} - ${e.endTime || '01:30 PM'}`,
          venue: e.venue || 'Apex University Auditorium, VT Road, Mansarovar',
          category: e.category,
          desc: e.description,
        }))
    : defaultDay2Events;

  return (
    <section className="py-20 bg-[#010914] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-2 mb-16">
          <div className="inline-flex items-center space-x-2 text-[#00D9FF] font-tech text-xs tracking-widest uppercase font-bold">
            <ShieldCheck className="w-4 h-4 text-[#FFC800]" />
            <span>OFFICIAL EVENT TIMETABLE</span>
          </div>
          <h2 className="font-anton text-4xl sm:text-5xl text-white tracking-wide">
            EVENT <span className="text-[#FFC800]">SCHEDULE</span>
          </h2>
          <p className="font-oswald text-sm sm:text-base text-[#8594A6] tracking-wider uppercase max-w-xl mx-auto">
            TWO DAYS OF INTENSE COMPETITION, ENGINEERING EXCELLENCE, AND CELEBRATION
          </p>
        </div>

        {/* DAY 1 Block */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#00D9FF]/30">
            <div>
              <div className="font-tech text-xs text-[#00D9FF] tracking-widest font-semibold uppercase">
                DAY 1 — 14TH SEPTEMBER 2026
              </div>
              <h3 className="font-anton text-2xl sm:text-3xl text-[#FFC800] tracking-wider">
                TECH. COMPETE. CONQUER.
              </h3>
            </div>
            <span className="mt-2 sm:mt-0 font-tech text-xs text-[#8594A6]">
              {day1Events.length} Event{day1Events.length === 1 ? '' : 's'} Scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {day1Events.map((event) => {
              const Icon = getEventIcon(event.category);
              return (
                <div
                  key={event.name}
                  className="hud-card p-6 rounded-lg hover:border-[#00D9FF] transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        <div className="p-3 rounded-lg bg-[#008CFF]/15 text-[#00D9FF] group-hover:text-[#FFC800] transition-colors shrink-0 mt-1">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="font-tech text-[11px] text-[#00D9FF] tracking-widest font-extrabold uppercase">
                            {event.category}
                          </span>
                          <h4 className="font-anton text-xl sm:text-2xl text-white tracking-wide font-normal leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-0.5">
                            {event.name}
                          </h4>
                        </div>
                      </div>

                      {/* Clear High-Contrast Fee / Free Entry Badge */}
                      <div className="shrink-0">
                        {event.isFree ? (
                          <div className="px-3.5 py-1.5 rounded bg-[#00FF88]/15 border-2 border-[#00FF88]/70 font-anton text-xs sm:text-sm text-[#00FF88] tracking-widest uppercase shadow-[0_0_12px_rgba(0,255,136,0.3)] flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
                            <span>FREE ENTRY</span>
                          </div>
                        ) : (
                          <div className="px-3.5 py-1.5 rounded bg-[#FFC800]/15 border-2 border-[#FFC800]/60 font-anton text-xs sm:text-sm text-[#FFC800] tracking-wider uppercase shadow-[0_0_12px_rgba(255,200,0,0.3)]">
                            {event.fee}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#D0D5DC] leading-relaxed">
                      {event.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 font-tech text-xs text-[#00D9FF]">
                      <Clock className="w-3.5 h-3.5 text-[#FFC800]" />
                      <span>{event.time}</span>
                    </div>

                    <Link
                      to={`/events/${event.slug}`}
                      className="inline-flex items-center space-x-1 font-oswald text-xs tracking-wider text-[#FFC800] hover:text-white transition-colors"
                    >
                      <span>VIEW DETAILS</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DAY 2 Block */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#FFC800]/30">
            <div>
              <div className="font-tech text-xs text-[#FFC800] tracking-widest font-semibold uppercase">
                DAY 2 — 15TH SEPTEMBER 2026
              </div>
              <h3 className="font-anton text-2xl sm:text-3xl text-white tracking-wider">
                CELEBRATE. PERFORM. <span className="text-[#00D9FF]">HONOUR.</span>
              </h3>
            </div>
            <span className="mt-2 sm:mt-0 font-tech text-xs text-[#8594A6]">
              {day2Events.length} Event{day2Events.length === 1 ? '' : 's'} Scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {day2Events.map((event) => {
              const Icon = getEventIcon(event.category);
              return (
                <div
                  key={event.name}
                  className="hud-card p-6 rounded-lg hover:border-[#FFC800] transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        <div className="p-3 rounded-lg bg-[#FFC800]/15 text-[#FFC800] shrink-0 mt-1">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="font-tech text-[11px] text-[#FFC800] tracking-widest font-extrabold uppercase">
                            {event.category}
                          </span>
                          <h4 className="font-anton text-xl sm:text-2xl text-white tracking-wide font-normal leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-0.5">
                            {event.name}
                          </h4>
                        </div>
                      </div>

                      {/* Clear High-Contrast Fee / Free Entry Badge */}
                      <div className="shrink-0">
                        {event.isFree ? (
                          <div className="px-3.5 py-1.5 rounded bg-[#00FF88]/20 border-2 border-[#00FF88]/70 font-anton text-xs sm:text-sm text-[#00FF88] tracking-widest uppercase shadow-[0_0_12px_rgba(0,255,136,0.3)] flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
                            <span>FREE ENTRY</span>
                          </div>
                        ) : (
                          <div className="px-3.5 py-1.5 rounded bg-[#FFC800]/15 border-2 border-[#FFC800]/60 font-anton text-xs sm:text-sm text-[#FFC800] tracking-wider uppercase shadow-[0_0_12px_rgba(255,200,0,0.3)]">
                            {event.fee}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#D0D5DC] leading-relaxed">
                      {event.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 font-tech text-xs text-[#00D9FF]">
                      <Clock className="w-3.5 h-3.5 text-[#FFC800]" />
                      <span>{event.time}</span>
                    </div>

                    <Link
                      to={`/events/${event.slug}`}
                      className="inline-flex items-center space-x-1 font-oswald text-xs tracking-wider text-[#FFC800] hover:text-white transition-colors"
                    >
                      <span>VIEW DETAILS</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
