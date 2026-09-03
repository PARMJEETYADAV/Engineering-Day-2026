import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Zap, Sparkles, Trophy, Cpu, Code2, Gamepad2, ShieldCheck } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#010914] pt-8 pb-16">
      {/* Background Circuit Grid & Glow effects */}
      <div className="absolute inset-0 tech-grid-bg opacity-35 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#008CFF]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#FFC800]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Rotating Mechanical Gear SVGs (Subtle background engineering motifs) */}
      <div className="absolute -top-16 -left-16 w-80 h-80 opacity-15 pointer-events-none animate-spin-slow">
        <svg viewBox="0 0 100 100" fill="none" stroke="#00D9FF" strokeWidth="1.5">
          <circle cx="50" cy="50" r="30" strokeDasharray="4 2" />
          <circle cx="50" cy="50" r="42" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect
              key={deg}
              x="47"
              y="2"
              width="6"
              height="10"
              rx="1"
              fill="#00D9FF"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="10" fill="#010914" stroke="#FFC800" strokeWidth="2" />
        </svg>
      </div>

      <div className="absolute -bottom-24 -right-20 w-96 h-96 opacity-10 pointer-events-none animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }}>
        <svg viewBox="0 0 100 100" fill="none" stroke="#FFC800" strokeWidth="1.5">
          <circle cx="50" cy="50" r="35" strokeDasharray="6 3" />
          <circle cx="50" cy="50" r="45" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <rect
              key={deg}
              x="48"
              y="1"
              width="4"
              height="8"
              fill="#FFC800"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top HUD Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#000510] border border-[#00D9FF]/40 shadow-[0_0_15px_rgba(0,217,255,0.2)] mb-8">
          <Calendar className="w-4 h-4 text-[#FFC800]" />
          <span className="font-tech text-xs sm:text-sm text-[#00D9FF] tracking-widest font-semibold uppercase">
            14TH & 15TH SEPTEMBER 2026
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFC800] animate-ping" />
        </div>

        {/* Poster-Inspired Giant Headline */}
        <div className="space-y-0 select-none">
          <h1 className="font-anton uppercase text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white leading-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
            ENGINEERING
          </h1>
          <div className="relative inline-block">
            <h2 className="font-anton uppercase text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-normal text-[#FFC800] leading-none drop-shadow-[0_0_35px_rgba(255,200,0,0.4)]">
              DAY
            </h2>
            {/* Cyberpunk accent lines */}
            <div className="absolute -bottom-3 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_10px_#00D9FF]" />
          </div>
        </div>

        {/* Subheadline (from prompt) */}
        <div className="mt-8 max-w-3xl mx-auto">
          <p className="font-oswald tracking-[0.2em] text-sm sm:text-lg md:text-xl text-[#F2F2F2] uppercase font-semibold leading-snug">
            CELEBRATING INNOVATION. <span className="text-[#00D9FF]">HONORING ENGINEERS.</span> BUILDING THE FUTURE.
          </p>
          <p className="mt-3 font-tech text-xs sm:text-sm text-[#FFC800] tracking-widest uppercase font-bold">
            2 DAYS. LIMITLESS EXCITEMENT.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-lg tracking-wider rounded transition-all shadow-neon-yellow flex items-center justify-center space-x-2 group hover:scale-[1.02]"
          >
            <span>REGISTER NOW</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/events"
            className="w-full sm:w-auto px-8 py-4 bg-[#000510] hover:bg-[#008CFF]/15 border border-[#00D9FF] text-[#00D9FF] hover:text-white font-oswald text-base tracking-widest rounded transition-all shadow-neon-cyan flex items-center justify-center space-x-2"
          >
            <span>EXPLORE EVENTS</span>
          </Link>
        </div>

        {/* Administrator / Faculty Login Option */}
        <div className="mt-5 flex items-center justify-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded bg-[#000510]/80 hover:bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-xs font-tech text-[#8594A6] hover:text-[#00D9FF] transition-all shadow-[0_0_12px_rgba(0,217,255,0.15)] group"
          >
            <ShieldCheck className="w-4 h-4 text-[#FFC800] group-hover:scale-110 transition-transform" />
            <span>AUTHORIZED FACULTY & ADMIN ACCESS PORTAL</span>
            <span className="text-[#FFC800] font-bold">➔</span>
          </Link>
        </div>

        {/* Mini Feature Badges */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          <div className="hud-card p-3 rounded text-left flex items-center space-x-3">
            <div className="p-2 rounded bg-[#008CFF]/15 text-[#00D9FF]">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-oswald text-xs tracking-wider text-white">E-SPORTS ARENA</div>
              <div className="font-tech text-[10px] text-[#8594A6]">BGMI & Free Fire</div>
            </div>
          </div>

          <div className="hud-card p-3 rounded text-left flex items-center space-x-3">
            <div className="p-2 rounded bg-[#FFC800]/15 text-[#FFC800]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-oswald text-xs tracking-wider text-white">BLIND CODING</div>
              <div className="font-tech text-[10px] text-[#8594A6]">Pure Logic Challenge</div>
            </div>
          </div>

          <div className="hud-card p-3 rounded text-left flex items-center space-x-3">
            <div className="p-2 rounded bg-[#00D9FF]/15 text-[#00D9FF]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-oswald text-xs tracking-wider text-white">TECH & SCIENCE QUIZ</div>
              <div className="font-tech text-[10px] text-[#8594A6]">Audio-Visual Rounds</div>
            </div>
          </div>

          <div className="hud-card p-3 rounded text-left flex items-center space-x-3">
            <div className="p-2 rounded bg-[#008CFF]/15 text-[#FFC800]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="font-oswald text-xs tracking-wider text-white">GRAND PRIZES</div>
              <div className="font-tech text-[10px] text-[#8594A6]">Trophies & Honors</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
