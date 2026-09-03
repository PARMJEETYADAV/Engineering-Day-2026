import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cpu, Menu, X, User, ShieldCheck, LogOut, Calendar, Trophy, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isStudent } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'EVENTS', path: '/events' },
    { name: 'E-SPORTS', path: '/student/esports' },
    { name: 'ABOUT', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#010914]/95 backdrop-blur-md border-b border-[#00D9FF]/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
      {/* Top micro-banner */}
      <div className="bg-gradient-to-r from-[#000510] via-[#021326] to-[#000510] border-b border-[#00D9FF]/10 text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#00D9FF]">
            <Calendar className="w-3.5 h-3.5 text-[#FFC800]" />
            <span className="font-tech tracking-wider text-[11px] sm:text-xs">
              OFFICIAL UNIVERSITY EVENT • 14TH & 15TH SEPTEMBER 2026
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-[#D0D5DC] text-[11px] font-tech">
            <span className="text-[#FFC800]">TECH. COMPETE. CONQUER.</span>
            <span className="text-[#008CFF]">|</span>
            <Link
              to="/admin/login"
              className="inline-flex items-center space-x-1 text-[#00D9FF] hover:text-[#FFC800] transition-colors font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFC800]" />
              <span>FACULTY / ADMIN ACCESS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded bg-gradient-to-br from-[#000510] to-[#021b33] border border-[#00D9FF]/40 flex items-center justify-center shadow-neon-cyan group-hover:border-[#FFC800] transition-colors">
              <Cpu className="w-6 h-6 text-[#00D9FF] group-hover:text-[#FFC800] transition-colors" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFC800] rounded-full animate-ping" />
            </div>
            <div className="flex flex-col">
              <span className="font-anton tracking-wider text-xl sm:text-2xl text-white group-hover:text-[#FFC800] transition-colors leading-none">
                ENGINEERING <span className="text-[#00D9FF]">DAY</span>
              </span>
              <span className="font-tech text-[10px] tracking-[0.25em] text-[#8594A6] uppercase">
                EDITION 2026
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-3 py-2 text-xs font-oswald tracking-widest transition-all ${
                  isActive(link.path)
                    ? 'text-[#FFC800] font-bold'
                    : 'text-[#D0D5DC] hover:text-[#00D9FF]'
                }`}
              >
                <span>{link.name}</span>
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFC800] shadow-[0_0_8px_#FFC800]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/40 rounded text-xs font-tech text-[#00D9FF] tracking-wider transition-all shadow-[0_0_10px_rgba(0,217,255,0.2)]"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FFC800]" />
                    <span>ADMIN PORTAL</span>
                  </Link>
                )}

                {isStudent && (
                  <Link
                    to="/student/dashboard"
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#008CFF]/15 hover:bg-[#008CFF]/30 border border-[#008CFF]/40 rounded text-xs font-tech text-white tracking-wider transition-all"
                  >
                    <User className="w-4 h-4 text-[#00D9FF]" />
                    <span>DASHBOARD</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 text-[#D0D5DC] hover:text-[#FF4444] transition-colors rounded hover:bg-white/5"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/admin/login"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#000510] hover:bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-xs font-tech text-[#00D9FF] hover:text-white transition-all shadow-[0_0_10px_rgba(0,217,255,0.2)]"
                  title="Authorized Faculty & Admin Login"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFC800]" />
                  <span>ADMIN LOGIN</span>
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-oswald tracking-widest text-[#D0D5DC] hover:text-white transition-colors"
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="relative group px-4 py-1.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton tracking-wider text-xs uppercase rounded transition-all shadow-neon-yellow flex items-center space-x-1"
                >
                  <span>REGISTER NOW</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded border border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF]/10 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#000510] border-b border-[#00D9FF]/30 px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded text-sm font-oswald tracking-widest ${
                  isActive(link.path)
                    ? 'bg-[#FFC800]/10 text-[#FFC800] border-l-2 border-[#FFC800]'
                    : 'text-[#D0D5DC] hover:bg-white/5 hover:text-[#00D9FF]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#00D9FF]/20 flex flex-col space-y-2.5">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full py-2.5 bg-[#00D9FF]/15 border border-[#00D9FF]/40 rounded text-xs font-tech text-[#00D9FF] tracking-wider"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FFC800]" />
                    <span>ADMIN DASHBOARD</span>
                  </Link>
                )}
                {isStudent && (
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full py-2.5 bg-[#008CFF]/20 border border-[#008CFF]/40 rounded text-xs font-tech text-white tracking-wider"
                  >
                    <User className="w-4 h-4 text-[#00D9FF]" />
                    <span>STUDENT DASHBOARD</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 text-center text-xs font-tech text-[#FF4444] border border-[#FF4444]/30 rounded hover:bg-[#FF4444]/10"
                >
                  LOG OUT
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center space-x-1.5 w-full py-2.5 bg-[#000510] border border-[#00D9FF]/40 rounded text-xs font-tech text-[#00D9FF] hover:text-white"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FFC800]" />
                  <span>FACULTY & ADMIN LOGIN</span>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-center text-xs font-oswald tracking-widest text-[#D0D5DC] border border-[#00D9FF]/30 rounded hover:bg-white/5"
                  >
                    LOGIN
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-center text-xs font-anton tracking-wider text-[#010914] bg-[#FFC800] rounded shadow-neon-yellow"
                  >
                    REGISTER NOW
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
