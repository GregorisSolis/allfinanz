module.exports = {
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        brand:{
          800: '#121212',
          200: '#12121270'
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}
