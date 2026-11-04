/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 포스트잇 색상
        note: {
          yellow: '#FFF59D',
          orange: '#FFCC80',
          green: '#A5D6A7',
          blue: '#90CAF9',
          pink: '#F48FB1',
          purple: '#CE93D8',
          paper: '#FFF9C4',
        },
        accent: {
          DEFAULT: '#F9A825',
          dark: '#F57F17',
        },
      },
    },
  },
  plugins: [],
};
