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
        soc: {
          bg: '#0A0E1A',          // Deep dark navy
          panel: '#111827',       // Dark panel surface
          panelLight: '#1E293B',  // Elevated surface
          border: '#1F2937',      // Subtle border
          borderLight: '#374151', // Hover border
          text: '#F3F4F6',        // Primary text
          muted: '#9CA3AF',       // Subdued text
          dim: '#6B7280',         // Dim text
          cyan: '#06B6D4',        // Informational cyan
          cyanGlow: '#0891B2',
          purple: '#8B5CF6',      // AI accent purple
          blue: '#3B82F6',        // Network blue
          green: '#10B981',       // Healthy green
          orange: '#F59E0B',      // Warning orange
          red: '#EF4444',         // Critical red
          redDark: '#991B1B',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
