/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px'
    },
    extend: {
      spacing: {
        ...(() => {
          const result = {};
          for (let i = 1; i <= 480; i++) {
            result[i / 4] = `${i / 16}rem`;
          }
          return result;
        })()
      },
      fontSize: {
        ...(() => {
          const result = {};
          for (let i = 12; i <= 160; i++) {
            result[i / 4] = `${i / 16}rem`;
          }
          return result;
        })()
      }
    }
  },
  plugins: []
};