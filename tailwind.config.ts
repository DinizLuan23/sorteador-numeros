import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta da marca do usuário
        brand: {
          50:  '#eaf0f4',
          100: '#cfdde6',
          200: '#a5c0d0',
          300: '#79a2ba',
          400: '#4e85a4',
          500: '#102C41', // primária
          600: '#0E2739',
          700: '#0D2332',
          800: '#0A1B26',
          900: '#08141C',
        },
        accent: {
          500: '#E13B2D', // brand2-500
        },
        paper: {
          50:  '#F4F3F0', // brand3-500 (claro)
          900: '#1A1A1A', // brand3-500 (escuro)
        }
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0,0,0,0.06)',
      },
      fontFamily: {
        sans: ['ui-sans-serif','system-ui','-apple-system','Segoe UI','Roboto','Inter','Arial','Noto Sans','sans-serif'],
      }
    },
  },
  plugins: [],
} satisfies Config
