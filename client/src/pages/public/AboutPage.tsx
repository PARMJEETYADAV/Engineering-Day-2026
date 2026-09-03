import React from 'react';
import { Award, Compass, Cpu, Target, Users, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 bg-[#010914] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-xs font-tech text-[#00D9FF]">
            <Calendar className="w-3.5 h-3.5 text-[#FFC800]" />
            <span>ESTABLISHED ANNUAL TRADITION • 14-15 SEPTEMBER 2026</span>
          </div>
          <h1 className="font-anton text-4xl sm:text-6xl text-white tracking-wide">
            ABOUT <span className="text-[#FFC800]">ENGINEERING DAY</span>
          </h1>
          <p className="font-oswald text-base sm:text-lg text-[#8594A6] tracking-wider uppercase">
            COMMEMORATING INNOVATION, EXCELLENCE, AND FUTURE CREATORS
          </p>
        </div>

        {/* Narrative & History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6 text-sm sm:text-base text-[#D0D5DC] leading-relaxed">
            <div className="hud-card p-8 rounded-lg space-y-4">
              <h2 className="font-anton text-2xl text-white tracking-wide">
                THE SIGNIFICANCE OF 15TH SEPTEMBER
              </h2>
              <p>
                In India, National Engineers' Day is observed annually on 15th September to mark the birth
                anniversary of Sir Mokshagundam Visvesvaraya (1861–1962), a visionary civil engineer, statesman,
                and Bharat Ratna awardee whose dam designs, flood protection systems, and industrial frameworks
                revolutionized national infrastructure.
              </p>
              <p>
                At our university, Engineering Day has evolved beyond traditional speeches into a vibrant, high-octane,
                multi-disciplinary symposium spanning two full days: <strong>14th & 15th September 2026</strong>.
                It bridges the gap between foundational engineering principles and 21st-century digital craft.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="hud-card p-6 rounded space-y-2 border-l-4 border-l-[#00D9FF]">
                <div className="flex items-center space-x-2 text-[#00D9FF]">
                  <Target className="w-5 h-5" />
                  <h3 className="font-oswald text-base font-bold text-white uppercase">OUR MISSION</h3>
                </div>
                <p className="text-xs text-[#8594A6]">
                  To inspire students to think critically, code cleanly, coordinate seamlessly in competitive
                  environments, and demonstrate fearless technological curiosity.
                </p>
              </div>

              <div className="hud-card p-6 rounded space-y-2 border-l-4 border-l-[#FFC800]">
                <div className="flex items-center space-x-2 text-[#FFC800]">
                  <Compass className="w-5 h-5" />
                  <h3 className="font-oswald text-base font-bold text-white uppercase">OUR VISION</h3>
                </div>
                <p className="text-xs text-[#8594A6]">
                  To create a premier university platform that celebrates technological rigor, esports strategy,
                  and performing arts in an integrated campus festival.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Facts Sidebar */}
          <div className="space-y-6">
            <div className="hud-card p-6 rounded-lg space-y-4 border border-[#00D9FF]/30">
              <h3 className="font-oswald text-lg text-white tracking-wider uppercase border-b border-white/10 pb-2">
                FESTIVAL AT A GLANCE
              </h3>
              <ul className="space-y-3 text-xs font-tech text-[#D0D5DC]">
                <li className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-[#8594A6]">DATES</span>
                  <span className="text-white font-bold">14-15 September 2026</span>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-[#8594A6]">EDITION</span>
                  <span className="text-[#FFC800] font-bold">Official 2026 Conclave</span>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-[#8594A6]">VENUE</span>
                  <span className="text-[#00D9FF] text-right font-medium">Apex University Auditorium, VT Road, Mansarovar</span>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-[#8594A6]">PARTICIPANTS</span>
                  <span className="text-white font-bold">1000+ Students</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[#8594A6]">RECOGNITION</span>
                  <span className="text-[#FFC800] font-bold">Trophies & Certificates</span>
                </li>
              </ul>

              <div className="pt-4">
                <Link
                  to="/register"
                  className="block w-full py-3 text-center bg-[#FFC800] text-[#010914] font-anton text-sm tracking-wider uppercase rounded shadow-neon-yellow"
                >
                  JOIN THE FESTIVAL
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
