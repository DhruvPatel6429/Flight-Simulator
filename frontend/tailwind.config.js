/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aviation: {
          bg: '#0B1120',
          surface: '#151E32',
          'surface-highlight': '#1E293B',
          primary: '#0EA5E9',
          'primary-hover': '#0284C7',
          secondary: '#64748B',
          accent: '#F59E0B',
          success: '#10B981',
          danger: '#EF4444',
          'text-primary': '#F8FAFC',
          'text-secondary': '#94A3B8',
          border: '#334155',
        },
        dsa: {
          graph: '#0EA5E9',
          'graph-edge': '#475569',
          'graph-highlight': '#F59E0B',
          queue: '#10B981',
          stack: '#EF4444',
          heap: '#8B5CF6',
        },
      },
      fontFamily: {
        heading: ['Rajdhani', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
