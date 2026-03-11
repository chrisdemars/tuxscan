export function ContactCard({ contact, onDelete }) {
  const time = new Date(contact.scannedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  const date = new Date(contact.scannedAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex items-start gap-3 bg-slate-800 rounded-2xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold truncate">{contact.name || '—'}</p>
        {contact.title ? (
          <p className="text-slate-400 text-sm truncate">{contact.title}</p>
        ) : null}
        {contact.email ? (
          <p className="text-indigo-400 text-sm truncate">{contact.email}</p>
        ) : null}
        <p className="text-slate-600 text-xs mt-1">
          {date} · {time}
        </p>
      </div>
      <button
        onClick={() => onDelete(contact)}
        className="mt-0.5 p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-700 active:bg-slate-600 transition-colors touch-manipulation"
        aria-label="Delete contact"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
