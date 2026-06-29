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
        background: 'var(--bg-color)',
        surface: 'var(--surface-color)',
        card: 'var(--card-color)',
        'glass-border': 'var(--border-color)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1f1f23',
          900: '#18181b',
          950: '#09090b',
        },
        brand: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
          hover: '#e5e5e5',
        },
        success: {
          DEFAULT: '#22C55E',
          hover: '#16a34a',
          bg: '#14532d',
        },
        warning: {
          DEFAULT: '#F59E0B',
          hover: '#d97706',
          bg: '#78350f',
        },
        danger: {
          DEFAULT: '#EF4444',
          hover: '#dc2626',
          bg: '#7f1d1d',
        },
        info: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          bg: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'fine-border': '0 0 0 1px var(--border-color)',
        'elevated': '0 0 0 1px var(--border-color), var(--card-shadow)',
        'glass': '0 0 0 1px var(--border-color), 0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
