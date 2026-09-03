import React from 'react';
import { UserPlus, CheckSquare, QrCode, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RegistrationStepsSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'CREATE ACCOUNT',
      icon: UserPlus,
      desc: 'Register with your student email, mobile, and branch credentials to create your secure portal profile.',
      highlightColor: '#00D9FF',
    },
    {
      step: '02',
      title: 'SELECT EVENT',
      icon: CheckSquare,
      desc: 'Choose from BGMI, Free Fire, Blind Coding, Quiz, and Cultural performances. Multi-event participation is supported.',
      highlightColor: '#008CFF',
    },
    {
      step: '03',
      title: 'MAKE PAYMENT',
      icon: QrCode,
      desc: 'Scan the official university UPI QR code and transfer the exact fee using Google Pay, PhonePe, Paytm, or BHIM.',
      highlightColor: '#FFC800',
    },
    {
      step: '04',
      title: 'UPLOAD PROOF & GET VERIFIED',
      icon: ShieldCheck,
      desc: 'Upload your payment receipt along with the 12-digit UTR number. The admin team verifies and confirms your pass.',
      highlightColor: '#00D9FF',
    },
  ];

  return (
    <section className="py-20 bg-[#000510] border-y border-[#00D9FF]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-16">
          <span className="font-tech text-xs text-[#FFC800] tracking-widest uppercase font-bold">
            SIMPLE 4-STEP PROCEDURE
          </span>
          <h2 className="font-anton text-4xl sm:text-5xl text-white tracking-wide">
            REGISTRATION <span className="text-[#00D9FF]">PROCESS</span>
          </h2>
          <p className="font-oswald text-sm sm:text-base text-[#8594A6] tracking-wider uppercase max-w-lg mx-auto">
            HOW TO SECURE YOUR ENTRY FOR ENGINEER'S DAY 2026
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="hud-card p-6 rounded relative flex flex-col justify-between hover:border-[#00D9FF] transition-all group"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-anton text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-[#8594A6] group-hover:from-[#FFC800] group-hover:to-[#00D9FF] transition-all">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded bg-[#010914] border border-[#00D9FF]/30 flex items-center justify-center text-[#00D9FF] group-hover:text-[#FFC800] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-oswald text-lg font-bold text-white tracking-wide uppercase">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8594A6] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Micro step connector line */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-tech text-[#00D9FF]">
                  <span>PHASE {index + 1} OF 4</span>
                  <span className="text-[#FFC800]">› ACTIVE</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-base tracking-wider rounded transition-all shadow-neon-yellow"
          >
            <span>START REGISTRATION NOW</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
