/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#F8FAFC',          // Light gray slate background (#F8FAFC)
          panel: '#FFFFFF',       // Clean white panel surface
          panelLight: '#F1F5F9',  // Subtle slate tint for table headers & cards
          border: '#E2E8F0',      // Crisp light border (slate-200)
          borderLight: '#CBD5E1', // Hover border (slate-300)
          text: '#0F172A',        // Primary text (slate-900)
          muted: '#475569',       // Secondary text (slate-600)
          dim: '#64748B',         // Dim text / metadata (slate-500)
          cyan: '#0284C7',        // Ocean blue accent (sky-600)
          cyanGlow: '#0369A1',
          purple: '#7C3AED',      // Violet accent
          blue: '#2563EB',        // Enterprise primary blue
          blueLight: '#EFF6FF',   // Subtle blue tint for active elements
          green: '#16A34A',       // Healthy green (emerald-600)
          orange: '#D97706',      // Warning amber
          red: '#DC2626',         // Critical red
          redLight: '#FEF2F2',    // Subtle red surface
          redDark: '#B91C1C',
        }
      },
      fontFamily: {
        mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
