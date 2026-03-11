import { Scanner } from '@yudiel/react-qr-scanner'

export function QRScanner({ onScan, onError, onClose, scanned }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-black/60 backdrop-blur-sm">
        <h2 className="text-white font-semibold text-lg">Scan Badge</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation"
          aria-label="Close scanner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Camera feed */}
      <div className="flex-1 relative overflow-hidden">
        <Scanner
          onScan={onScan}
          onError={onError}
          constraints={{ facingMode: 'environment' }}
          styles={{
            container: { width: '100%', height: '100%' },
            video: { width: '100%', height: '100%', objectFit: 'cover' },
          }}
          components={{ audio: false }}
        />

        {scanned ? (
          /* Success overlay */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-5 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white text-2xl font-bold tracking-tight">Badge Scanned!</p>
          </div>
        ) : (
          /* Targeting overlay */
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 relative">
              <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-4 bg-black/60 backdrop-blur-sm text-center">
        <p className="text-white/50 text-sm">
          {scanned ? 'Saving contact…' : 'Point camera at the QR code on the badge'}
        </p>
      </div>
    </div>
  )
}
