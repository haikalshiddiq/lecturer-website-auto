import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Geist Fallback', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5567e8',
          600: '#4c51bf',
          700: '#3c3f9e',
          800: '#2d2f7a',
          900: '#1e2060'
        },
        ink: '#0f172a',
        mist: '#f1f5f9'
      },
      boxShadow: {
        soft: '0 2px 24px rgba(15, 23, 42, 0.06)',
        card: '0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 32px rgba(15, 23, 42, 0.06)',
        lift: '0 4px 12px rgba(15, 23, 42, 0.06), 0 16px 48px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)'
      }
    }
  },
  plugins: [forms]
};
