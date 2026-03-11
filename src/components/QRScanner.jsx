import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

export function QRScanner({ onScan, onError, onClose, scanned }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraReady, setCameraReady] = useState(false)

  useEffect(() => {
    let active = true

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          video.onloadedmetadata = () => {
            video.play()
            setCameraReady(true)
            rafRef.current = requestAnimationFrame(tick)
          }
        }
      } catch (err) {
        if (active) onError(err)
      }
    }

    function tick() {
      if (!active) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const { videoWidth: w, videoHeight: h } = video
      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(video, 0, 0, w, h)
      const imageData = ctx.getImageData(0, 0, w, h)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })

      if (code?.data) {
        onScan([{ rawValue: code.data }])
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    startCamera()

    return () => {
      active = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* Camera */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        {/* Hidden canvas used for frame analysis */}
        <canvas ref={canvasRef} className="hidden" />

        {!cameraReady && !scanned && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          </div>
        )}

        {scanned ? (
          /* Success overlay */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white text-2xl font-bold tracking-tight">Badge Scanned!</p>
          </div>
        ) : cameraReady ? (
          /* Targeting overlay */
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 relative">
              <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 bg-black/60 backdrop-blur-sm text-center">
        <p className="text-white/50 text-sm">
          {scanned ? 'Saving contact…' : 'Point camera at the QR code on the badge'}
        </p>
      </div>
    </div>
  )
}
