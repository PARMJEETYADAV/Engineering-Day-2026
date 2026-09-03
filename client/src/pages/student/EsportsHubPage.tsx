import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Users, Trophy, ShieldCheck, ArrowRight, Flame, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const EsportsHubPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectGame = (game: 'BGMI' | 'FREE_FIRE') => {
    if (!user) {
      navigate(`/login?redirect=/student/esports/create?game=${game}`);
    } else {
      navigate(`/student/esports/create?game=${game}`);
    }
  };

  return (
    <div className="py-16 bg-[#010914] min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF] font-tech text-xs tracking-widest uppercase">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>CHAMPIONSHIP ARENA</span>
          </div>
          <h1 className="font-anton text-4xl sm:text-6xl text-white tracking-wide">
            E-SPORTS <span className="text-[#FFC800]">TEAM REGISTRATION</span>
          </h1>
          <p className="font-oswald text-base sm:text-lg text-[#00D9FF] tracking-wider uppercase max-w-xl mx-auto font-bold">
            BUILD YOUR TEAM. COMPETE. CONQUER.
          </p>
          <p className="text-xs text-[#8594A6] max-w-lg mx-auto font-tech">
            Assemble a squad of 1 to 4 players. You become the Team Captain. Pay ₹49 per participating member.
          </p>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* BGMI Card */}
          <div className="hud-card p-8 rounded-lg border-2 border-[#00D9FF]/40 hover:border-[#00D9FF] transition-all flex flex-col justify-between space-y-6 group hover:shadow-neon-cyan relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
              <Target className="w-64 h-64 text-[#00D9FF]" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded bg-[#008CFF]/20 text-[#00D9FF] font-tech text-xs font-bold border border-[#008CFF]/40">
                  DAY 1 • 14 SEPTEMBER 2026
                </span>
                <span className="font-anton text-lg text-[#FFC800]">₹49 / MEMBER</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded bg-[#00D9FF]/20 flex items-center justify-center border border-[#00D9FF]/50 text-[#00D9FF]">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-anton text-3xl text-white tracking-wide">BGMI TOURNAMENT</h2>
                  <span className="font-tech text-xs text-[#8594A6]">BATTLEGROUNDS MOBILE INDIA</span>
                </div>
              </div>

              <p className="text-xs text-[#D0D5DC] leading-relaxed">
                Drop into the battlegrounds, coordinate tactical rotations, and secure the Winner Winner Chicken Dinner.
                Squad format allows 1, 2, 3, or 4 players.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-tech">
                <div className="p-2.5 bg-[#000510] rounded border border-white/5 space-y-0.5">
                  <span className="text-[#8594A6] text-[10px] block uppercase">SQUAD COMPOSITION</span>
                  <span className="text-white font-bold">1 – 4 Players</span>
                </div>
                <div className="p-2.5 bg-[#000510] rounded border border-white/5 space-y-0.5">
                  <span className="text-[#8594A6] text-[10px] block uppercase">REQUIRED FIELDS</span>
                  <span className="text-[#00D9FF] font-bold">IGN & BGMI Player ID</span>
                </div>
              </div>

              <div className="p-3 bg-[#010914] rounded border border-white/10 text-xs font-tech space-y-1">
                <span className="text-[#FFC800] font-bold uppercase block text-[11px]">Fee Tier (₹49/Player):</span>
                <div className="grid grid-cols-4 gap-1 text-[11px] text-[#D0D5DC] text-center">
                  <div className="p-1 bg-white/5 rounded">1: ₹49</div>
                  <div className="p-1 bg-white/5 rounded">2: ₹98</div>
                  <div className="p-1 bg-white/5 rounded">3: ₹147</div>
                  <div className="p-1 bg-white/5 rounded font-bold text-[#00D9FF]">4: ₹196</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectGame('BGMI')}
              className="w-full py-3.5 bg-[#00D9FF] hover:bg-[#00BFFF] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-cyan transition-all flex items-center justify-center space-x-2 relative z-10"
            >
              <span>CREATE BGMI TEAM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Free Fire Card */}
          <div className="hud-card p-8 rounded-lg border-2 border-[#FFC800]/40 hover:border-[#FFC800] transition-all flex flex-col justify-between space-y-6 group hover:shadow-neon-yellow relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
              <Flame className="w-64 h-64 text-[#FFC800]" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded bg-[#FFC800]/20 text-[#FFC800] font-tech text-xs font-bold border border-[#FFC800]/40">
                  DAY 1 • 14 SEPTEMBER 2026
                </span>
                <span className="font-anton text-lg text-[#FFC800]">₹49 / MEMBER</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded bg-[#FFC800]/20 flex items-center justify-center border border-[#FFC800]/50 text-[#FFC800]">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-anton text-3xl text-white tracking-wide">FREE FIRE TOURNAMENT</h2>
                  <span className="font-tech text-xs text-[#8594A6]">FREE FIRE MAX CLASH</span>
                </div>
              </div>

              <p className="text-xs text-[#D0D5DC] leading-relaxed">
                Fast-paced survival combat. Unleash character abilities, gloo walls, and intense gunfights to emerge as the last squad standing.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-tech">
                <div className="p-2.5 bg-[#000510] rounded border border-white/5 space-y-0.5">
                  <span className="text-[#8594A6] text-[10px] block uppercase">SQUAD COMPOSITION</span>
                  <span className="text-white font-bold">1 – 4 Players</span>
                </div>
                <div className="p-2.5 bg-[#000510] rounded border border-white/5 space-y-0.5">
                  <span className="text-[#8594A6] text-[10px] block uppercase">REQUIRED FIELDS</span>
                  <span className="text-[#FFC800] font-bold">IGN & Free Fire UID</span>
                </div>
              </div>

              <div className="p-3 bg-[#010914] rounded border border-white/10 text-xs font-tech space-y-1">
                <span className="text-[#FFC800] font-bold uppercase block text-[11px]">Fee Tier (₹49/Player):</span>
                <div className="grid grid-cols-4 gap-1 text-[11px] text-[#D0D5DC] text-center">
                  <div className="p-1 bg-white/5 rounded">1: ₹49</div>
                  <div className="p-1 bg-white/5 rounded">2: ₹98</div>
                  <div className="p-1 bg-white/5 rounded">3: ₹147</div>
                  <div className="p-1 bg-white/5 rounded font-bold text-[#FFC800]">4: ₹196</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectGame('FREE_FIRE')}
              className="w-full py-3.5 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-yellow transition-all flex items-center justify-center space-x-2 relative z-10"
            >
              <span>CREATE FREE FIRE TEAM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rules Card */}
        <div className="hud-card p-6 rounded-lg border border-white/10 space-y-3 text-xs font-tech">
          <div className="flex items-center space-x-2 text-[#FFC800]">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-oswald text-sm text-white uppercase font-bold">
              TOURNAMENT PROTOCOLS & CAPTAIN GUIDELINES
            </span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[#8594A6] leading-relaxed">
            <li>The student who initiates the team registration automatically becomes the <strong>Team Captain</strong>.</li>
            <li>Captain academic details are auto-populated from your student account.</li>
            <li>You can register 1, 2, 3, or 4 members. The captain is always Member #1.</li>
            <li>Each member must have a valid In-Game Name (IGN) and Player ID / UID.</li>
            <li>Payment is strictly calculated as <strong>Number of Members × ₹49</strong>.</li>
            <li>Submit payment proof (screenshot + UTR) for the full squad amount. Once approved by the administrator, squad details are locked.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
