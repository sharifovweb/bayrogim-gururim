/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tun: { DEFAULT: '#062B44', 900: '#041E30', 700: '#0A3D5C', 500: '#12597F' },
        moviy: '#0099B5',
        yashil: '#1EB53A',
        ormon: { DEFAULT: '#0B5D2A', 900: '#07421D' },
        qizil: '#CE1126',
        qogoz: '#F4F8F8',
        siyoh: '#0D2233',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Onest Variable"', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: { page: '72rem' },
    },
  },
  plugins: [],
}
