import React, { useEffect } from 'react';
import { ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { GOOGLE_FORM_REGISTRATION_URL } from '../../constants/links';

export const RegisterPage: React.FC = () => {
  useEffect(() => {
    // Auto-redirect to the official Google Form
    window.location.href = GOOGLE_FORM_REGISTRATION_URL;
  }, []);

  return (
    <div className="py-24 bg-[#010914] min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full hud-card p-8 rounded-lg border-2 border-[#00D9FF]/40 text-center space-y-6 shadow-neon-cyan">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FFC800]/10 border border-[#FFC800]/40 flex items-center justify-center">
          <ExternalLink className="w-8 h-8 text-[#FFC800] animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-xs font-tech text-[#00D9FF] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#FFC800]" />
            <span>DIRECT REGISTRATION PORTAL</span>
          </div>
          <h1 className="font-anton text-2xl sm:text-3xl text-white tracking-wide">
            OFFICIAL GOOGLE FORM REGISTRATION
          </h1>
          <p className="text-xs text-[#8594A6] font-tech leading-relaxed pt-1">
            All event registrations for Engineer's Day 2026 are conducted directly through Google Forms. No login or account required. Redirecting you now...
          </p>
        </div>

        <div className="pt-2">
          <a
            href={GOOGLE_FORM_REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider uppercase rounded shadow-neon-yellow flex items-center justify-center gap-2 transition-all"
          >
            <span>OPEN GOOGLE FORM NOW</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
