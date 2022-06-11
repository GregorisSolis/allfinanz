module.exports = {
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        brand:{
          800: '#121212',
          600: '#12121210',
          200: '#12121270',
          100: '#00000040'
        },
        moon:{
          300: '#01051230',
          500: '#010511',
          800: '#01051110'
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}
