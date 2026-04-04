/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        obsidian: {
          base: '#0C0C0C',
          surface: '#141414',
          raised: '#1C1C1C',
          'border-subtle': '#2A2A2A',
          'border-strong': '#3A3A3A',
        },
        gulf: {
          green: '#126209',
          'green-hover': '#1A8A0C',
          gold: '#B5810A',
          'gold-hover': '#D09A12',
        },
        text: {
          primary: '#F0EDE8',
          muted: '#8A8A8A',
          placeholder: '#555555',
        },
        status: {
          destructive: '#C0392B',
          success: '#2ECC71',
          warning: '#F39C12',
          info: '#3498DB',
        },
      },
      letterSpacing: {
        heading: '-0.02em',
        caps: '0.06em',
      },
      lineHeight: {
        body: '1.6',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(18, 98, 9, 0.25)',
        'glow-gold': '0 0 20px rgba(181, 129, 10, 0.2)',
        'glow-green-sm': '0 0 10px rgba(18, 98, 9, 0.15)',
        'glow-gold-sm': '0 0 10px rgba(181, 129, 10, 0.12)',
        'elevated': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'elevated-lg': '0 8px 40px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(18, 98, 9, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(18, 98, 9, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}