import React from 'react';
import { AlertCircle, FileText, CheckCircle, ShieldAlert } from 'lucide-react';

export const ImportantInfoSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#000510] border-t border-[#00D9FF]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hud-card p-8 rounded-lg border border-[#00D9FF]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-[#FFC800]/10 text-[#FFC800] font-tech text-xs tracking-widest uppercase">
            MANDATORY PROTOCOLS
          </div>

          <div className="flex items-center space-x-3 mb-6">
            <AlertCircle className="w-6 h-6 text-[#FFC800]" />
            <h3 className="font-anton text-2xl text-white tracking-wide">
              IMPORTANT GUIDELINES FOR ALL PARTICIPANTS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-[#D0D5DC]">
            <div className="p-4 rounded bg-[#010914] border border-[#00D9FF]/20 space-y-2">
              <div className="font-oswald text-base text-[#00D9FF] uppercase font-bold">
                1. UNIVERSITY IDENTITY CARDS
              </div>
              <p className="text-[#8594A6]">
                All registered participants must carry their physical University ID card or Department Admission receipt to enter the arena.
              </p>
            </div>

            <div className="p-4 rounded bg-[#010914] border border-[#FFC800]/20 space-y-2">
              <div className="font-oswald text-base text-[#FFC800] uppercase font-bold">
                2. VERIFIED ENTRY PASSES
              </div>
              <p className="text-[#8594A6]">
                Only students with an <strong className="text-white">APPROVED</strong> status and digital pass downloaded from this portal will be admitted to tournaments.
              </p>
            </div>

            <div className="p-4 rounded bg-[#010914] border border-[#008CFF]/20 space-y-2">
              <div className="font-oswald text-base text-[#008CFF] uppercase font-bold">
                3. FAIR PLAY & CODE OF CONDUCT
              </div>
              <p className="text-[#8594A6]">
                Strict adherence to tournament rules. Cheating, emulation software in mobile gaming, or misconduct will lead to instant disqualification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
