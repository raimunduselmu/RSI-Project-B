/**
 * Design token — tema TERANG: krem hangat + aksen oranye menyala.
 * night : skala navy (dipakai untuk aksen gelap kecil)
 * brand : biru listrik (fokus, tautan, aksen dingin)
 * ember : oranye menyala (aksen utama, menu aktif, sorotan)
 * ink   : warna teks utama (navy gelap, di atas latar terang)
 * merah : pakai rose-* (error/hapus)
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#141A3A',
        night: {
          50: '#E8EBF7',
          100: '#C9CFEA',
          200: '#9AA3CF',
          300: '#6B76AE',
          400: '#47508A',
          500: '#2C346B',
          600: '#1E2453',
          700: '#151A40',
          800: '#0E1230',
          900: '#090C22',
          950: '#05071A',
        },
        brand: {
          50: '#EAF5FF',
          100: '#D2EAFF',
          200: '#A6D4FF',
          300: '#72B8FF',
          400: '#3F97FF',
          500: '#1F77F5',
          600: '#155BD6',
          700: '#1447AA',
          800: '#163D86',
          900: '#18366B',
        },
        ember: {
          50: '#FFF4EC',
          100: '#FFE3CC',
          200: '#FFC499',
          300: '#FFA05C',
          400: '#FF7F2A',
          500: '#FF6410',
          600: '#E84D00',
          700: '#B83C05',
          800: '#922F0A',
          900: '#76290C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', '"Crimson Text"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Anonymous Pro"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glass: '0 1px 2px rgba(20,26,58,0.04), 0 12px 32px -14px rgba(20,26,58,0.18)',
        glow: '0 0 0 1px rgba(114,184,255,0.35), 0 8px 30px -6px rgba(63,151,255,0.65)',
        ember: '0 0 0 1px rgba(255,160,92,0.35), 0 10px 32px -6px rgba(255,100,16,0.7)',
        soft: '0 6px 20px -6px rgba(255,127,42,0.75)',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
};
