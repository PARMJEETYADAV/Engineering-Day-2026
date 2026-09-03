import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasStarted: boolean;
}

export const CountdownSection: React.FC = () => {
  const targetDate = new Date('2026-09-14T09:00:00+05:30').getTime();

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, hasStarted: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      hasStarted: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  return (
    <section className="bg-[#000510] border-y border-[#00D9FF]/20 py-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Header info */}
          <div className="text-center lg:text-left space-y-1">
            <div className="flex items-center justify-center lg:justify-start space-x-2 text-[#FFC800]">
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="font-tech text-xs tracking-widest uppercase font-bold">
                OFFICIAL COUNTDOWN
              </span>
            </div>
            <h3 className="font-anton text-2xl sm:text-3xl text-white tracking-wider">
              {timeLeft.hasStarted ? "ENGINEER'S DAY 2026 IS LIVE!" : 'COUNTDOWN TO KICKOFF'}
            </h3>
            <p className="font-tech text-xs text-[#8594A6]">
              Commencing on Monday, 14th September 2026 at 09:00 AM IST
            </p>
          </div>

          {/* Countdown Boxes */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-xl">
            {timeUnits.map((unit) => (
              <div
                key={unit.label}
                className="hud-card p-3 sm:p-4 rounded text-center border border-[#00D9FF]/30 shadow-neon-cyan"
              >
                <div className="font-anton text-2xl sm:text-4xl md:text-5xl text-[#FFC800] leading-tight">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="font-tech text-[10px] sm:text-xs text-[#00D9FF] tracking-widest mt-1 font-semibold">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
