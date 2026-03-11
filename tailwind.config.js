/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.pb-safe': { paddingBottom: 'env(safe-area-inset-bottom, 0px)' },
        '.pt-safe': { paddingTop: 'env(safe-area-inset-top, 0px)' },
        '.pl-safe': { paddingLeft: 'env(safe-area-inset-left, 0px)' },
        '.pr-safe': { paddingRight: 'env(safe-area-inset-right, 0px)' },
        '.mb-safe': { marginBottom: 'env(safe-area-inset-bottom, 0px)' },
        '.h-screen-safe': { height: ['100vh', '100dvh'] },
        '.min-h-screen-safe': { minHeight: ['100vh', '100dvh'] },
      })
    },
  ],
}
