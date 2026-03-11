export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-20 px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-200">No contacts yet</h2>
      <p className="text-slate-500 text-sm max-w-xs">
        Tap <span className="text-indigo-400 font-medium">Scan Badge</span> to scan an attendee's QR code and capture their contact info.
      </p>
    </div>
  )
}
