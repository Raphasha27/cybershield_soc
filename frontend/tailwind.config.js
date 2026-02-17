/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cyberBg: '#0a0f1c',
        cyberPanel: '#101827',
        neon: '#22d3ee',
      },
    },
  },
  plugins: [],
}
