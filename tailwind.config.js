/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-black': '#000000',
        'spotify-dark': '#121212',
        'spotify-card': '#181818',
        'spotify-elevated': '#282828',
        'spotify-green': '#1DB954',
      },
    },
  },
  plugins: [],
}
