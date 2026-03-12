import { useState } from 'react'
import { useContacts } from './hooks/useContacts.js'
import { useScanner } from './hooks/useScanner.js'
import { ScanButton } from './components/ScanButton.jsx'
import { QRScanner } from './components/QRScanner.jsx'
import { ContactList } from './components/ContactList.jsx'
import { ExportModal } from './components/ExportModal.jsx'

export default function App() {
  const { contacts, loading, addContact, deleteContact, clearContacts } = useContacts()
  const [showExport, setShowExport] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [toast, setToast] = useState(null) // { message, type }

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  async function handleContact(contact) {
    const result = await addContact(contact)
    if (result.duplicate) {
      showToast('Already scanned', 'warn')
    } else if (result.success) {
      showToast(`Saved ${contact.name || contact.email}`)
    }
  }

  const { scanning, scanned, error: scanError, startScan, stopScan, handleScan, handleError } = useScanner({
    onContact: handleContact,
  })

  return (
    <div className="h-screen-safe bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 pb-4 border-b border-slate-800 bg-slate-900"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        <div>
          <h1 className="text-white font-bold text-xl tracking-tight">TuxScan</h1>
          {!loading && (
            <p className="text-slate-500 text-xs mt-0.5">
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''} scanned
            </p>
          )}
        </div>
        {contacts.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 bg-red-900/50 hover:bg-red-800 active:bg-red-700 text-red-300 text-sm font-medium rounded-xl px-3 py-2 transition-colors touch-manipulation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-sm font-medium rounded-xl px-3 py-2 transition-colors touch-manipulation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        )}
      </header>

      {/* Camera permission error banner */}
      {scanError && (
        <div className="mx-4 mt-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-xl px-4 py-3">
          {scanError}
        </div>
      )}

      {/* Contact list */}
      <main className="flex-1 overflow-y-auto pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <ContactList contacts={contacts} onDelete={deleteContact} />
        )}
      </main>

      {/* Sticky scan button */}
      <div className="px-4 pt-4 border-t border-slate-800 bg-slate-900" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <ScanButton onPress={startScan} />
      </div>

      {/* QR scanner overlay */}
      {scanning && (
        <QRScanner onScan={handleScan} onError={handleError} onClose={stopScan} scanned={scanned} />
      )}

      {/* Export modal */}
      {showExport && (
        <ExportModal contacts={contacts} onClose={() => setShowExport(false)} />
      )}

      {/* Clear all confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-white font-bold text-lg mb-2">Clear all scans?</h2>
            <p className="text-slate-400 text-sm mb-6">
              This will permanently delete all {contacts.length} scanned contact{contacts.length !== 1 ? 's' : ''}. Export first if you need to keep them.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-sm font-medium rounded-xl px-4 py-3 transition-colors touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await clearContacts()
                  setShowClearConfirm(false)
                  showToast('All scans cleared')
                }}
                className="flex-1 bg-red-700 hover:bg-red-600 active:bg-red-500 text-white text-sm font-medium rounded-xl px-4 py-3 transition-colors touch-manipulation"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-28 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg z-50 transition-all
            ${toast.type === 'warn' ? 'bg-yellow-800 text-yellow-200' : 'bg-green-800 text-green-200'}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
