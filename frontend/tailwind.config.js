/** Palet brand #997E67 (sama dengan mockup FSD) */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F8F4F0',
          100: '#EFE7DF',
          200: '#DFCFC0',
          300: '#C9B29D',
          400: '#B1977F',
          500: '#997E67',
          600: '#7F6754',
          700: '#665344',
          800: '#4F4036',
          900: '#3D3028',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
