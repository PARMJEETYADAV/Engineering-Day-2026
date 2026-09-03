import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin, Shield, Terminal, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#000510] border-t border-[#00D9FF]/20 text-[#D0D5DC] relative overflow-hidden">
      {/* Background circuit lines overlay */}
      <div className="absolute inset-0 tech-grid-bg opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Theme */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-[#010914] border border-[#00D9FF]/50 flex items-center justify-center shadow-neon-cyan">
                <Cpu className="w-6 h-6 text-[#00D9FF]" />
              </div>
              <div className="flex flex-col">
                <span className="font-anton tracking-wider text-xl text-white">
                  ENGINEERING <span className="text-[#FFC800]">DAY</span>
                </span>
                <span className="font-tech text-[10px] text-[#00D9FF] tracking-widest font-semibold">
                  EDITION 2026
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#8594A6] leading-relaxed">
              Celebrating Innovation. Honoring Engineers. Building The Future. 
              The flagship annual engineering symposium and competition festival.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded bg-[#008CFF]/10 border border-[#008CFF]/30 text-xs font-tech text-[#00D9FF]">
                <span className="w-2 h-2 rounded-full bg-[#FFC800] animate-pulse" />
                <span>14TH & 15TH SEPTEMBER 2026</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-oswald tracking-widest text-sm text-white uppercase border-b border-[#00D9FF]/20 pb-2">
              PORTAL NAVIGATION
            </h3>
            <ul className="space-y-2 text-xs font-tech tracking-wider">
              <li>
                <Link to="/" className="hover:text-[#FFC800] flex items-center space-x-1 transition-colors">
                  <span>› HOME</span>
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#FFC800] flex items-center space-x-1 transition-colors">
                  <span>› COMPETITIVE EVENTS</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#FFC800] flex items-center space-x-1 transition-colors">
                  <span>› ABOUT THE FESTIVAL</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#FFC800] flex items-center space-x-1 transition-colors">
                  <span>› STUDENT REGISTRATION</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#FFC800] flex items-center space-x-1 transition-colors">
                  <span>› HELP & CONTACT DESK</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-oswald tracking-widest text-sm text-white uppercase border-b border-[#00D9FF]/20 pb-2">
              COORDINATION DESK
            </h3>
            <div className="space-y-2.5 text-xs text-[#8594A6]">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#00D9FF] shrink-0 mt-0.5" />
                <span>Apex University Auditorium, VT Road, Mansarovar</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#FFC800] shrink-0" />
                <span>parmjeetyadav1230@gmail.com</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-[#00D9FF] shrink-0 mt-0.5" />
                <div className="space-y-0.5 font-tech text-[11px]">
                  <div>Parmjeet Yadav : 9467843851</div>
                  <div>Priyanshu Sharma : 7541841303</div>
                </div>
              </div>
            </div>
          </div>

          {/* University Placeholder & Admin Portal Link */}
          <div className="space-y-3">
            <h3 className="font-oswald tracking-widest text-sm text-white uppercase border-b border-[#00D9FF]/20 pb-2">
              INSTITUTIONAL EMBLEM
            </h3>
            <div className="p-4 rounded bg-[#010914] border border-[#00D9FF]/30 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full border-2 border-[#FFC800] flex items-center justify-center bg-[#02182e] shadow-neon-yellow">
                <Terminal className="w-6 h-6 text-[#FFC800]" />
              </div>
              <span className="font-oswald text-xs tracking-wider text-white">
                FACULTY OF ENGINEERING & TECHNOLOGY
              </span>
              <span className="text-[10px] text-[#8594A6]">
                Official Autonomous University Portal
              </span>
            </div>

            <div className="pt-2">
              <Link
                to="/admin/login"
                className="flex items-center justify-center space-x-1.5 w-full py-2 bg-[#000510] hover:bg-[#00D9FF]/15 border border-[#00D9FF]/40 rounded text-xs font-tech text-[#00D9FF] hover:text-[#FFC800] transition-all shadow-[0_0_10px_rgba(0,217,255,0.15)]"
              >
                <Shield className="w-3.5 h-3.5 text-[#FFC800]" />
                <span>FACULTY / ADMIN LOGIN PORTAL</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#00D9FF]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8594A6]">
          <p>© 2026 Engineering Day Organizing Committee. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0 font-tech text-[11px]">
            <span className="text-[#00D9FF]">PORTAL STATUS: ONLINE</span>
            <span>•</span>
            <span className="text-[#FFC800]">SEPTEMBER 14-15, 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
