/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — neon purple/pink/yellow
        brand: {
          50:  '#FFFDF0', 
          100: '#FAEB92', // Yellow
          200: '#FDE461',
          300: '#FFA5E1', 
          400: '#FF5FCF', // Pink
          500: '#9929EA', // Purple (Primary)
          600: '#771BCB',
          700: '#5D11A3',
          800: '#45097E',
          900: '#2E0557',
          950: '#1C0237',
        },
        surface: {
          DEFAULT: '#000000', // Pure Pitch Black
          card:    '#0d0d0d',
          border:  '#222222',
          input:   '#161616',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #000000 0%, #2E0557 50%, #000000 100%)',
        'card-gradient': 'linear-gradient(145deg, #0d0d0d, #141414)',
        'brand-gradient': 'linear-gradient(135deg, #FF5FCF 0%, #9929EA 100%)',
      },
      boxShadow: {
        'glow-brand': '0 0 24px rgba(153, 41, 234, 0.5)', // Neon purple glow
        'card': '0 4px 24px rgba(0,0,0,0.8)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 16px rgba(153, 41, 234, 0.3)' },
          '50%': { boxShadow: '0 0 32px rgba(255, 95, 207, 0.7)' }, // Pulses between purple and pink
        },
        'typing': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'typing-1': 'typing 1.2s ease-in-out infinite',
        'typing-2': 'typing 1.2s ease-in-out 0.2s infinite',
        'typing-3': 'typing 1.2s ease-in-out 0.4s infinite',
      },
    },
  },
  plugins: [],
};
