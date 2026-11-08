/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          navy: '#0F172A',
          blue: '#2563EB',
          teal: '#0D9488',
          amber: '#F59E0B',
          dark: '#0B132B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'Outfit', 'sans-serif'],
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.72rem + 0.1vw, 0.8125rem)', // 12px - 13px
        'fluid-sm': 'clamp(0.875rem, 0.825rem + 0.15vw, 0.95rem)', // 14px - 15.2px
        'fluid-base': 'clamp(0.9375rem, 0.9rem + 0.2vw, 1.05rem)', // 15px - 16.8px
        'fluid-md': 'clamp(1.05rem, 0.98rem + 0.35vw, 1.25rem)', // 16.8px - 20px
        'fluid-lg': 'clamp(1.2rem, 1.05rem + 0.6vw, 1.5rem)', // 19.2px - 24px
        'fluid-xl': 'clamp(1.4rem, 1.15rem + 1.1vw, 2rem)', // 22.4px - 32px
        'fluid-2xl': 'clamp(1.75rem, 1.3rem + 1.8vw, 2.5rem)', // 28px - 40px
        'fluid-3xl': 'clamp(2.1rem, 1.6rem + 2.5vw, 3.5rem)', // 33.6px - 56px
      },
      spacing: {
        'fluid-gap': 'clamp(0.75rem, 2vw, 1.75rem)',
        'fluid-pad': 'clamp(1rem, 3vw, 2.5rem)',
        'fluid-card': 'clamp(1rem, 2.5vw, 2rem)',
      },
      borderRadius: {
        'fluid-card': 'clamp(0.75rem, 1.5vw, 1.5rem)',
      }
    },
  },
  plugins: [],
}
