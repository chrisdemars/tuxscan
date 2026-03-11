import { useState } from 'react'
import { useContacts } from './hooks/useContacts.js'
import { useScanner } from './hooks/useScanner.js'
import { ScanButton } from './components/ScanButton.jsx'
import { QRScanner } from './components/QRScanner.jsx'
import { ContactList } from './components/ContactList.jsx'
import { ExportModal } from './components/ExportModal.jsx'

export default function App() {
  const { contacts, loading, addContact, deleteContact } = useContacts()
  const [showExport, setShowExport] = useState(false)
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

  const { scanning, error: scanError, startScan, stopScan, handleScan, handleError } = useScanner({
    onContact: handleContact,
  })

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <div>
          <h1 className="text-white font-bold text-xl tracking-tight">TuxScan</h1>
          {!loading && (
            <p className="text-slate-500 text-xs mt-0.5">
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''} scanned
            </p>
          )}
        </div>
        {contacts.length > 0 && (
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-sm font-medium rounded-xl px-3 py-2 transition-colors touch-manipulation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
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
      <div className="px-4 py-4 pb-safe border-t border-slate-800 bg-slate-900">
        <ScanButton onPress={startScan} />
      </div>

      {/* QR scanner overlay */}
      {scanning && (
        <QRScanner onScan={handleScan} onError={handleError} onClose={stopScan} />
      )}

      {/* Export modal */}
      {showExport && (
        <ExportModal contacts={contacts} onClose={() => setShowExport(false)} />
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
