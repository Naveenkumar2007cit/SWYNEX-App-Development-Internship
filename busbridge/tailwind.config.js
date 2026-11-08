/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#dce8f5',
          200: '#b9d2eb',
          300: '#8ab3d8',
          400: '#5d8ec2',
          500: '#3d70ad',
          600: '#2e5893',
          700: '#264778',
          800: '#1e3a5f',
          900: '#152843',
          950: '#0d1a2e',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px 0 rgba(30, 58, 95, 0.08)',
        'card-hover': '0 4px 16px 0 rgba(30, 58, 95, 0.14)',
      },
    },
  },
  plugins: [],
}
