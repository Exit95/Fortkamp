/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Fortkamp Logo Green - extracted from #2A5F29
        green: {
          50: '#eaf5ea',
          100: '#d5ecd5',
          200: '#b1ddb0',
          300: '#8acc89',
          400: '#56b555',
          500: '#3b8639',
          600: '#2a5f29',
          700: '#235022',
          800: '#1d421c',
          900: '#173416',
          950: '#102610',
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
