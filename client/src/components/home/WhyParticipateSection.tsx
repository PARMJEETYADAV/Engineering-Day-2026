import React from 'react';
import { Award, Zap, Network, Flame, Brain, Medal } from 'lucide-react';

export const WhyParticipateSection: React.FC = () => {
  const perks = [
    {
      title: 'CAMPUS BRAGGING RIGHTS',
      desc: 'Climb the leaderboard, dominate the esports lobby, and prove your squad is the indisputable best on campus.',
      icon: Flame,
      color: '#FFC800',
    },
    {
      title: 'TROPHIES & CASH PURSES',
      desc: 'Significant rewards, winner medallions, and institution-level felicitations during the Day 2 Valedictory.',
      icon: Award,
      color: '#00D9FF',
    },
    {
      title: 'SHARPEN PRACTICAL LOGIC',
      desc: 'Blind coding and technical quiz rounds test your intuition and rapid problem solving under tournament conditions.',
      icon: Brain,
      color: '#008CFF',
    },
    {
      title: 'INTER-BRANCH NETWORKING',
      desc: 'Connect with hundreds of passionate student developers, roboticists, gamers, and artists across all university departments.',
      icon: Network,
      color: '#FFC800',
    },
  ];

  return (
    <section className="py-20 bg-[#010914] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-16">
          <span className="font-tech text-xs text-[#00D9FF] tracking-widest uppercase font-bold">
            WHY YOU CANNOT MISS THIS
          </span>
          <h2 className="font-anton text-4xl sm:text-5xl text-white tracking-wide">
            WHY <span className="text-[#FFC800]">PARTICIPATE?</span>
          </h2>
          <p className="font-oswald text-sm sm:text-base text-[#8594A6] tracking-wider uppercase max-w-lg mx-auto">
            THE BIGGEST UNIVERSITY STAGE OF 2026 AWAITS YOUR TALENT
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className="hud-card p-6 rounded hover:border-[#FFC800] transition-all group"
              >
                <div
                  className="w-12 h-12 rounded bg-[#010914] border border-[#00D9FF]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ color: perk.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="font-oswald text-lg font-bold text-white tracking-wide uppercase mb-2">
                  {perk.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#8594A6] leading-relaxed">
                  {perk.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
