
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Outfit', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F5D76E',
          dark: '#9A7B1A',
        },
      },
      boxShadow: {
        gold: '0 0 32px rgba(212, 175, 55, 0.22)',
        'gold-lg': '0 20px 50px rgba(212, 175, 55, 0.18)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.28)',
      },
      animation: {
        'aurora-1': 'aurora1 14s ease-in-out infinite',
        'aurora-2': 'aurora2 18s ease-in-out infinite',
        'aurora-3': 'aurora3 16s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'float-phone': 'floatPhone 8s ease-in-out infinite',
        'pulse-slow': 'pulse 5s ease-in-out infinite',
        'shine': 'shine 3s ease-in-out infinite',
        'border-spin': 'borderSpin 4s linear infinite',
        'hero-in': 'heroIn 0.8s ease-out forwards',
      },
      keyframes: {
        aurora1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, 20px) scale(1.08)' },
        },
        aurora2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-25px, 30px) scale(1.05)' },
        },
        aurora3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(20px, -20px) scale(1.06)' },
        },
        floatPhone: {
          '0%, 100%': { transform: 'translateY(0) rotate(-1deg)' },
          '50%': { transform: 'translateY(-18px) rotate(1deg)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        borderSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        heroIn: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
