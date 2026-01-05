/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#faf6f1',
          100: '#f0e6d8',
          200: '#e2d0b8',
          300: '#d0b48e',
          400: '#bf9665',
          500: '#a67c4a',
          600: '#8b6340',
          700: '#6f4e35',
          800: '#5a402e',
          900: '#4a3628',
        }
      },
      fontFamily: {
        heading: ['Merriweather', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        '160': '160ms',
        '240': '240ms',
      }
    },
  },
  plugins: [],
};
