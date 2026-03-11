import { useState } from 'react'
import { useExport } from '../hooks/useExport.js'

export function ExportModal({ contacts, onClose }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | fallback | error
  const { sendCSV, downloadCSV } = useExport()

  async function handleSend(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    try {
      const result = await sendCSV(contacts, email.trim())
      setStatus(result.success ? 'success' : 'fallback')
    } catch {
      setStatus('error')
    }
  }

  function handleDownload() {
    downloadCSV(contacts)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-800 rounded-3xl w-full max-w-sm p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Export Contacts</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 active:bg-slate-600 transition-colors touch-manipulation"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-slate-400 text-sm">
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''} will be exported as a CSV file.
        </p>

        {status === 'idle' || status === 'sending' ? (
          <form onSubmit={handleSend} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-slate-300 text-sm font-medium">Recipient email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </label>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl py-3 transition-colors touch-manipulation"
            >
              {status === 'sending' ? 'Sending…' : 'Send CSV'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="text-slate-400 hover:text-white text-sm text-center py-1 transition-colors touch-manipulation"
            >
              Download CSV instead
            </button>
          </form>
        ) : null}

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-green-900/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold">Sent!</p>
            <p className="text-slate-400 text-sm text-center">CSV delivered to {email}</p>
            <button onClick={onClose} className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm touch-manipulation">
              Done
            </button>
          </div>
        ) : null}

        {status === 'fallback' ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-yellow-900/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="text-white font-semibold">Email failed — file downloaded</p>
            <p className="text-slate-400 text-sm text-center">The CSV was saved to your device instead.</p>
            <button onClick={onClose} className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm touch-manipulation">
              Done
            </button>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>
            <button onClick={() => setStatus('idle')} className="text-indigo-400 hover:text-indigo-300 text-sm touch-manipulation">
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
