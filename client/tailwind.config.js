/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tech: {
          bg: '#010914',
          deep: '#000510',
          card: 'rgba(2, 14, 28, 0.85)',
          cardLight: 'rgba(5, 23, 44, 0.95)',
          border: 'rgba(0, 217, 255, 0.25)',
          borderGlow: '#00D9FF',
          yellow: '#FFC800',
          yellowHover: '#E5B400',
          blue: '#008CFF',
          cyan: '#00BFFF',
          neon: '#00D9FF',
          offwhite: '#F2F2F2',
          grey: '#D0D5DC',
          muted: '#8594A6',
        },
      },
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        tech: ['"Space Grotesk"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 217, 255, 0.4)',
        'neon-yellow': '0 0 15px rgba(255, 200, 0, 0.4)',
        'hud-border': '0 0 20px -3px rgba(0, 140, 255, 0.3)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-glow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
