/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#67734F',
          dark: '#4e563b',
          light: '#7f8c62',
        },
        success: '#919A6C',
        warning: '#D5C7AC',
        danger: '#A84A4A',
        background: '#F4EDDB',
        card: '#FFFCF6',
        text: {
          DEFAULT: '#3E4630',
          muted: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
