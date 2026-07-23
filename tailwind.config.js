/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F5FAF8',
        surface: '#FCFEFD',
        ink: '#18352F',
        muted: '#607B75',
        subtle: '#DFEAE6',
        line: '#CFDFDA',
        accent: '#E65C32',
        'accent-dark': '#B83C1E',
        success: '#238A58',
        warning: '#D98A16',
        danger: '#CF3F36',
        info: '#287C9E',
      },
      fontFamily: {
        body: ['"Noto Sans SC"', '"PingFang SC"', 'sans-serif'],
        display: ['"LXGW WenKai"', 'STKaiti', 'serif'],
        mono: ['"IBM Plex Mono"', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sm: '6px', md: '10px', lg: '14px', xl: '20px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(24,53,47,.06)',
        float: '0 8px 24px rgba(24,53,47,.10)',
        lift: '0 18px 48px rgba(24,53,47,.16)',
      },
      transitionTimingFunction: {
        expressive: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
