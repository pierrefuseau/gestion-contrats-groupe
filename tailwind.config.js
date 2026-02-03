/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FDF6E3',
        surface: '#FFFFFF',
        'surface-alt': '#FAF5EB',
        primary: '#1E3A5F',
        accent: '#E07850',
        'accent-hover': '#C86840',
        success: '#2E7D32',
        warning: '#F57C00',
        danger: '#C62828',
        muted: '#8B9CAB',
        'text-secondary': '#5A6978',
        border: '#E8E0D5',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
