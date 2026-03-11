export function ScanButton({ onPress }) {
  return (
    <button
      onClick={onPress}
      className="flex items-center justify-center gap-3 w-full max-w-sm mx-auto bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xl font-semibold rounded-2xl py-5 px-8 shadow-lg shadow-indigo-900/40 transition-colors touch-manipulation select-none"
      style={{ minHeight: '64px' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
        <rect x="7" y="7" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" />
        <rect x="13" y="7" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" />
        <rect x="7" y="13" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" />
        <rect x="13" y="13" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" />
      </svg>
      Scan Badge
    </button>
  )
}
