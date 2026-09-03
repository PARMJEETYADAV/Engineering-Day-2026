import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I register for Engineer's Day 2026?",
      a: 'First, create a student account using your email and mobile number. Once logged in, select the events you wish to participate in, scan the official university UPI QR code to complete your payment, and upload your payment screenshot along with the 12-digit UTR number.',
    },
    {
      q: 'What is the registration fee for BGMI and Free Fire?',
      a: 'The entry fee for both BGMI and Free Fire is ₹49 per participant/member slot.',
    },
    {
      q: 'What is the registration fee for Blind Coding?',
      a: 'The entry fee for the Blind Coding Competition is ₹49 per participant.',
    },
    {
      q: 'How do I make the payment?',
      a: 'During the registration process on the payment screen, you will find the official event UPI QR Code and UPI ID. You can scan it directly using Google Pay, PhonePe, Paytm, BHIM, or any UPI app on your mobile device.',
    },
    {
      q: 'Where do I upload the payment screenshot?',
      a: 'The payment page includes an instant upload section supporting JPG, JPEG, PNG, and WEBP formats up to 5MB. You must also enter the Transaction ID / UTR number from your payment receipt.',
    },
    {
      q: 'How long does payment verification take?',
      a: 'Payment proofs are manually verified by our university administration team. Most payments are verified within 2 to 6 hours. You will receive an immediate in-app status update in your Student Dashboard.',
    },
    {
      q: 'Can I register for multiple events?',
      a: 'Yes! A single student can register for multiple different events (e.g. BGMI + Blind Coding + Quiz). Each event has an independent registration record, unique registration ID, and payment verification.',
    },
    {
      q: 'What happens if my payment is rejected?',
      a: 'If a payment screenshot is unclear or the UTR number is mismatched, the admin will reject it with a mandatory reason. Your Student Dashboard will clearly display this reason and provide a one-click button to re-upload the correct proof.',
    },
    {
      q: 'How do I contact the organizers if I face an issue?',
      a: 'You can use the Contact page on this portal, email engday2026@university.edu, or visit the student coordination helpdesk located in the Computer Science department foyer.',
    },
  ];

  return (
    <section className="py-20 bg-[#010914] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center space-x-2 text-[#00D9FF] font-tech text-xs tracking-widest uppercase font-bold">
            <HelpCircle className="w-4 h-4 text-[#FFC800]" />
            <span>CLARIFICATIONS & FAQ</span>
          </div>
          <h2 className="font-anton text-4xl sm:text-5xl text-white tracking-wide">
            FREQUENTLY ASKED <span className="text-[#FFC800]">QUESTIONS</span>
          </h2>
          <p className="font-oswald text-sm sm:text-base text-[#8594A6] tracking-wider uppercase">
            EVERYTHING YOU NEED TO KNOW ABOUT REGISTRATION AND PAYMENTS
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="hud-card rounded overflow-hidden transition-all border border-[#00D9FF]/20"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between space-x-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-oswald text-base sm:text-lg text-white tracking-wide">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#00D9FF] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#FFC800]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#D0D5DC] leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
