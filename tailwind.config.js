/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          darkest: '#091833',
          dark: '#0f2b5c',
          navy: '#143875',
          primary: '#1a468e',
          royal: '#2563eb',
          light: '#e0edff',
          lighter: '#f0f6ff',
        },
        accent: {
          dark: '#b91c1c',
          DEFAULT: '#dc2626',
          light: '#ef4444',
          soft: '#f87171',
          bg: '#fef2f2',
          border: '#fecaca',
        },
        gold: {
          dark: '#d97706',
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          soft: '#fef3c7',
        },
        phdark: {
          950: '#070c18',
          900: '#0c1427',
          850: '#111d38',
          800: '#172445',
          700: '#22345e',
          600: '#324a82',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px 0 rgba(15, 43, 92, 0.06)',
        'card-dark': '0 4px 20px 0 rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}