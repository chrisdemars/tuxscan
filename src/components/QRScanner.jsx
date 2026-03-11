import { Scanner } from '@yudiel/react-qr-scanner'

export function QRScanner({ onScan, onError, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pb-3 pt-4 bg-black/60 backdrop-blur-sm">
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

        {/* Targeting overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 relative">
            {/* Corner brackets */}
            <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
            <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-4 pb-safe bg-black/60 backdrop-blur-sm text-center">
        <p className="text-white/50 text-sm">Point camera at the QR code on the badge</p>
      </div>
    </div>
  )
}
