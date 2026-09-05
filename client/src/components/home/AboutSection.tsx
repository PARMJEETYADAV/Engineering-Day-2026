import React from 'react';
import { Cpu, Terminal, Users, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#000510] border-t border-[#00D9FF]/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Visual Poster HUD Graphics */}
          <div className="relative">
            <div className="hud-card p-8 rounded-lg border-2 border-[#00D9FF]/40 shadow-neon-cyan relative">
              <div className="flex items-center justify-between pb-6 border-b border-[#00D9FF]/20">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-[#FF4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFC800]" />
                  <div className="w-3 h-3 rounded-full bg-[#00D9FF]" />
                </div>
                <span className="font-tech text-xs text-[#00D9FF] tracking-widest font-mono">
                  SYS://ENG_DAY_2026.INIT
                </span>
              </div>

              <div className="py-8 space-y-6">
                <div>
                  <span className="font-tech text-xs text-[#FFC800] tracking-widest uppercase">
                    CAMPUS TECHNOLOGY CONCLAVE
                  </span>
                  <h3 className="font-anton text-3xl sm:text-4xl text-white tracking-wide mt-1">
                    WHERE CODE MEETS CIRCUITRY
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-[#D0D5DC] leading-relaxed">
                  Engineer's Day 2026 is the university's premier technical showcase, uniting undergraduate,
                  postgraduate, and polytechnic innovators across disciplines for 48 hours of competitive problem-solving.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-[#010914] rounded border border-[#008CFF]/30">
                    <div className="font-anton text-2xl text-[#FFC800]">2 DAYS</div>
                    <div className="font-tech text-[10px] text-[#8594A6]">Intense Excitement</div>
                  </div>
                  <div className="p-3 bg-[#010914] rounded border border-[#00D9FF]/30">
                    <div className="font-anton text-2xl text-[#00D9FF]">5 EVENTS</div>
                    <div className="font-tech text-[10px] text-[#8594A6]">Tournaments & Stage</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-tech text-[#8594A6]">
                <span>FACULTY OF ENGINEERING</span>
                <span className="text-[#FFC800]">14-15 SEPTEMBER 2026</span>
              </div>
            </div>
          </div>

          {/* Right Column: Mission and Principles */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="font-tech text-xs text-[#00D9FF] tracking-widest font-semibold uppercase">
                ABOUT THE FESTIVAL
              </span>
              <h2 className="font-anton text-4xl sm:text-5xl text-white tracking-wide">
                CELEBRATING <span className="text-[#FFC800]">ENGINEERS</span>
              </h2>
              <p className="font-oswald text-sm sm:text-base text-[#8594A6] tracking-wider uppercase">
                HONORING SIR M. VISVESVARAYA'S LEGACY WITH MODERN TECH
              </p>
            </div>

            <p className="text-sm text-[#D0D5DC] leading-relaxed">
              Every year on 15th September, India observes Engineers' Day to commemorate the birth anniversary
              of legendary engineer Sir Mokshagundam Visvesvaraya. Our university commemorates this monumental
              occasion with a two-day carnival celebrating logic, algorithmic mastery, tactical gaming, and creative stage performance.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-[#FFC800] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-[#D0D5DC]">
                  <strong className="text-white">Merit-First Competitions:</strong> Rigorous evaluation by experienced faculty judges and esports adjudicators.
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-[#00D9FF] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-[#D0D5DC]">
                  <strong className="text-white">Seamless Digital Portal:</strong> Fully computerized registrations, instant UPI payments, and downloadable entry passes.
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-[#008CFF] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-[#D0D5DC]">
                  <strong className="text-white">Prestigious Honors:</strong> Cash prizes, crystal trophies, and authenticated university certificates awarded on Day 2.
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/about"
                className="inline-flex items-center space-x-2 text-xs font-tech tracking-widest text-[#FFC800] hover:text-white transition-colors"
              >
                <span>READ COMPLETE FESTIVAL DOSSIER</span>
                <span>›</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
