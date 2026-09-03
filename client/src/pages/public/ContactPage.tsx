import React from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, ShieldCheck, ExternalLink } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="py-16 bg-[#010914] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFC800]/10 text-[#FFC800] font-tech text-xs tracking-widest uppercase">
            <span>HELPDESK & SUPPORT</span>
          </div>
          <h1 className="font-anton text-4xl sm:text-6xl text-white tracking-wide">
            CONTACT <span className="text-[#00D9FF]">COORDINATORS</span>
          </h1>
          <p className="font-oswald text-base text-[#8594A6] tracking-wider uppercase max-w-lg mx-auto">
            REACH OUT FOR REGISTRATION QUERIES, PAYMENT VERIFICATION, OR VENUE DIRECTIONS
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Support Channels */}
          <div className="space-y-6">
            <div className="hud-card p-6 rounded space-y-3 border border-[#00D9FF]/30">
              <div className="w-10 h-10 rounded bg-[#008CFF]/15 text-[#00D9FF] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-oswald text-lg text-white uppercase font-bold">EMAIL HELPDESK</h3>
              <p className="text-xs text-[#8594A6]">
                For payment verification discrepancies and general enquiries.
              </p>
              <div className="font-tech text-xs text-[#FFC800] font-bold">
                parmjeetyadav1230@gmail.com
              </div>
            </div>

            <div className="hud-card p-6 rounded space-y-3 border border-[#FFC800]/30">
              <div className="w-10 h-10 rounded bg-[#FFC800]/15 text-[#FFC800] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-oswald text-lg text-white uppercase font-bold">EVENT COORDINATORS</h3>
              <p className="text-xs text-[#8594A6]">
                For any query regarding events, teams, and payment receipts:
              </p>
              <div className="font-tech text-xs space-y-1">
                <div className="text-[#00D9FF] font-bold">Parmjeet Yadav : 9467843851</div>
                <div className="text-[#FFC800] font-bold">Priyanshu Sharma : 7541841303</div>
              </div>
            </div>

            <div className="hud-card p-6 rounded space-y-3 border border-[#008CFF]/30">
              <div className="w-10 h-10 rounded bg-[#008CFF]/15 text-[#008CFF] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-oswald text-lg text-white uppercase font-bold">VENUE & LOCATION</h3>
              <p className="text-xs text-[#8594A6] leading-relaxed">
                Apex University Auditorium, VT Road, Mansarovar
              </p>
            </div>
          </div>

          {/* Quick Query Form */}
          <div className="lg:col-span-2">
            <div className="hud-card p-8 rounded-lg border border-[#00D9FF]/30 space-y-6">
              <div>
                <h2 className="font-anton text-2xl text-white tracking-wide">
                  SEND AN INSTANT INQUIRY
                </h2>
                <p className="text-xs text-[#8594A6] font-tech mt-1">
                  Our coordinator team responds to inquiries within 24 hours.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you. Your message has been routed to the student coordination committee.');
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                      YOUR NAME
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aryan Sharma"
                      className="w-full px-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>
                  <div>
                    <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@university.edu"
                      className="w-full px-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                    SUBJECT / TOPIC
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Payment proof query for BGMI registration"
                    className="w-full px-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs text-white focus:outline-none focus:border-[#00D9FF]"
                  />
                </div>

                <div>
                  <label className="block font-tech text-xs text-[#D0D5DC] uppercase mb-1">
                    MESSAGE CONTENT
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide detailed information regarding your inquiry..."
                    className="w-full px-4 py-2.5 bg-[#000510] border border-[#00D9FF]/20 rounded text-xs text-white focus:outline-none focus:border-[#00D9FF]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3 bg-[#FFC800] hover:bg-[#E5B400] text-[#010914] font-anton text-sm tracking-wider rounded shadow-neon-yellow transition-all"
                >
                  DISPATCH INQUIRY
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
