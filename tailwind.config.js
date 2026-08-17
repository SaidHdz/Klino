/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        papel: {
          DEFAULT: '#F4F1EA',
          hondo: '#EDE8DE',
        },
        tinta: '#16191B',
        verde: '#1F5F4B',
        ambar: {
          DEFAULT: '#E0913A',
          tinta: '#8A5311',
        },
        gris: '#63635B',
        error: '#B0311F',
      },
      fontFamily: {
        display: ['"FamiljenGrotesk-SemiBold"', 'system-ui', 'sans-serif'],
        body: ['"Spectral-Regular"', 'Georgia', 'serif'],
        'body-medium': ['"Spectral-Medium"', 'Georgia', 'serif'],
      },
      fontSize: {
        h1: ['52px', { lineHeight: '1.05', letterSpacing: '-0.015em', fontWeight: '600' }],
        h2: ['34px', { lineHeight: '1.12', fontWeight: '600' }],
        h3: ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        subtitle: ['22px', { lineHeight: '1.45' }],
        body: ['17px', { lineHeight: '1.62' }],
        small: ['15px', { lineHeight: '1.55' }],
        label: ['13px', { lineHeight: '1', letterSpacing: '0.24em' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '24px',
        6: '32px',
        7: '44px',
        8: '56px',
        9: '72px',
      },
      borderRadius: {
        none: '0px',
        app: '22%',
      },
      boxShadow: {
        none: 'none',
      },
      borderColor: {
        hairline: 'rgba(22,25,27,0.16)',
        strong: 'rgba(22,25,27,0.32)',
      },
      maxWidth: {
        measure: '72ch',
      },
    },
  },
  plugins: [],
}