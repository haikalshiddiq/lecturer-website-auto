import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f6ff',
          100: '#e5edff',
          200: '#bed1ff',
          300: '#95b3ff',
          400: '#6690ff',
          500: '#3e6bf4',
          600: '#2d52d8',
          700: '#243fb0',
          800: '#22378d',
          900: '#1f306f'
        },
        ink: '#0b1220',
        mist: '#eef2ff'
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.12)'
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)'
      }
    }
  },
  plugins: [forms]
};
