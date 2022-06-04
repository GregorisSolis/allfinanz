module.exports = {
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        brand:{
          800: '#121212',
          200: '#12121270',
          600: '#12121210',
          100: '#00000040'
        },
        moon:{
          300: '#01051230',
          500: '#010511'
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}
