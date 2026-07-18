/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system','SF Pro Text','SF Pro Display','Helvetica Neue','Arial','sans-serif'],
        display: ['SF Pro Display','-apple-system','Helvetica Neue','Arial','sans-serif'],
      },
      colors: {
        ink: { DEFAULT: '#1d1d1f', secondary: '#6e6e73', tertiary: '#86868b' },
        surface: { DEFAULT: '#ffffff', secondary: '#f5f5f7', dark: '#272729', 'dark-2': '#2a2a2c' },
        border: { subtle: '#d2d2d7', strong: '#86868b' },
        action: { DEFAULT: '#0071e3', dark: '#2997ff', hover: '#0077ed' },
        stage: {
          intake: '#6e6e73', discovery: '#0071e3', shaping: '#9333ea',
          delivery: '#d97706', live: '#16a34a', retirement: '#dc2626',
        },
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4' }],
        xs:   ['12px', { lineHeight: '1.4' }],
        sm:   ['14px', { lineHeight: '1.29' }],
        base: ['17px', { lineHeight: '1.47' }],
        lg:   ['19px', { lineHeight: '1.42' }],
        xl:   ['24px', { lineHeight: '1.17' }],
        '2xl':['32px', { lineHeight: '1.10' }],
        '3xl':['40px', { lineHeight: '1.10' }],
      },
      borderRadius: {
        sm: '5px', DEFAULT: '8px', md: '10px', lg: '12px',
        xl: '16px', '2xl': '18px', '3xl': '28px', full: '9999px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.12)',
        overlay: '0 8px 32px rgba(0,0,0,0.16)',
        modal: '0 20px 60px rgba(0,0,0,0.22)',
      },
    },
  },
  plugins: [],
}


