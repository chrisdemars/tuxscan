import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

export function QRScanner({ onScan, onError, onClose, scanned }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)
  const activeRef = useRef(false)
  const intervalRef = useRef(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  // Keep callback refs current on every render — no stale closures
  useEffect(() => { onScanRef.current = onScan }, [onScan])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    activeRef.current = true

    function tick() {
      if (!activeRef.current) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return
      if (video.readyState < 2 || video.videoWidth === 0) return

      // Scale down to 640 wide max — faster jsQR, same detection rate
      const scale = Math.min(1, 640 / video.videoWidth)
      const w = Math.floor(video.videoWidth * scale)
      const h = Math.floor(video.videoHeight * scale)

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }

      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, w, h)
      const imageData = ctx.getImageData(0, 0, w, h)
      const code = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' })

      if (code?.data) {
        onScanRef.current([{ rawValue: code.data }])
      }
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })

        if (!activeRef.current) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        const video = videoRef.current
        if (!video) return

        video.srcObject = stream
        video.playsInline = true
        video.muted = true

        await video.play().catch((err) => {
          throw new Error('Video play failed: ' + err.message)
        })

        setCameraReady(true)
        // Poll at ~15fps — reliable across all mobile browsers
        intervalRef.current = setInterval(tick, 67)
      } catch (err) {
        if (!activeRef.current) return
        const msg =
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in your browser settings.'
            : err.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : 'Camera error: ' + err.message
        setCameraError(msg)
        onErrorRef.current(err)
      }
    }

    startCamera()

    return () => {
      activeRef.current = false
      clearInterval(intervalRef.current)
      const video = videoRef.current
      if (video?.srcObject) {
        video.srcObject.getTracks().forEach((t) => t.stop())
        video.srcObject = null
      }
    }
  }, [])

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
          autoPlay
        />

        {/*
          Canvas must NOT be display:none — drawImage() silently produces blank
          frames on some browsers when the canvas is hidden. Position off-screen.
        */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
        />

        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="bg-slate-800 rounded-2xl p-5 text-center">
              <p className="text-red-400 text-sm">{cameraError}</p>
              <button onClick={onClose} className="mt-3 text-indigo-400 text-sm touch-manipulation">
                Go back
              </button>
            </div>
          </div>
        ) : scanned ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white text-2xl font-bold tracking-tight">Badge Scanned!</p>
          </div>
        ) : !cameraReady ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          </div>
        ) : (
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

      {/* Footer */}
      <div className="px-4 py-4 bg-black/60 backdrop-blur-sm text-center">
        <p className="text-white/50 text-sm">
          {scanned ? 'Saving contact…' : 'Point camera at the QR code on the badge'}
        </p>
      </div>
    </div>
  )
}
