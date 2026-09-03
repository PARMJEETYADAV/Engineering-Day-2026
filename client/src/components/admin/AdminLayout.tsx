import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  Users,
  Calendar,
  Settings,
  Download,
  FileText,
  LogOut,
  ExternalLink,
  Cpu,
  Gamepad2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="py-24 text-center text-[#00D9FF] font-tech text-xs bg-[#010914] min-h-screen">
        VERIFYING ADMINISTRATIVE ACCESS...
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  const navItems = [
    { name: 'DASHBOARD', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'E-SPORTS TEAMS', path: '/admin/esports/teams', icon: Gamepad2 },
    { name: 'PAYMENT VERIFICATION', path: '/admin/payments', icon: CreditCard },
    { name: 'ALL REGISTRATIONS', path: '/admin/registrations', icon: FileText },
    { name: 'STUDENTS', path: '/admin/students', icon: Users },
    { name: 'EVENTS', path: '/admin/events', icon: Calendar },
    { name: 'PAYMENT & QR SETTINGS', path: '/admin/settings', icon: Settings },
    { name: 'EXPORT DATA', path: '/admin/export', icon: Download },
    { name: 'AUDIT LOGS', path: '/admin/audit-logs', icon: ShieldCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="bg-[#000510] min-h-screen text-[#FFFFFF] flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-[#010914] border-b border-[#00D9FF]/30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded bg-[#000510] border border-[#FFC800] flex items-center justify-center text-[#FFC800] shadow-neon-yellow">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-anton text-lg tracking-wider text-white">
              ENGINEER'S DAY 2026 <span className="text-[#FFC800]">ADMIN CONSOLE</span>
            </span>
            <span className="block font-tech text-[10px] text-[#00D9FF]">
              FACULTY OF ENGINEERING & TECHNOLOGY
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center space-x-1 text-xs font-tech text-[#8594A6] hover:text-[#00D9FF] transition-colors"
          >
            <span>Public Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          <div className="text-right hidden md:block">
            <span className="font-tech text-xs text-white block">{user?.email}</span>
            <span className="font-tech text-[10px] text-[#FFC800] uppercase font-bold">
              ROLE: {user?.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-[#8594A6] hover:text-[#FF4444] transition-colors rounded hover:bg-white/5"
            title="Log Out Administrator"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Subnav Navigation Tabs */}
      <nav className="bg-[#010914]/80 border-b border-white/10 px-4 sm:px-8 overflow-x-auto">
        <div className="flex items-center space-x-1 sm:space-x-2 py-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3.5 py-2 rounded font-oswald text-xs tracking-wider flex items-center space-x-2 transition-all ${
                  isActive
                    ? 'bg-[#00D9FF]/15 text-[#00D9FF] border border-[#00D9FF]/50 shadow-[0_0_10px_rgba(0,217,255,0.2)] font-bold'
                    : 'text-[#8594A6] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FFC800]' : ''}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
