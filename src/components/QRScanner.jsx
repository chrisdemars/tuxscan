import { useEffect, useRef, useState } from 'react'
import {
  MultiFormatReader,
  BinaryBitmap,
  HybridBinarizer,
  RGBLuminanceSource,
  DecodeHintType,
  NotFoundException,
} from '@zxing/library'

const hints = new Map([[DecodeHintType.TRY_HARDER, true]])
const zxingReader = new MultiFormatReader()
zxingReader.setHints(hints)

// Convert RGBA Uint8ClampedArray (from getImageData) to grayscale Uint8ClampedArray
// RGBLuminanceSource requires 1-byte-per-pixel luminance, NOT 4-byte RGBA
function rgbaToLuminance(rgba, w, h) {
  const out = new Uint8ClampedArray(w * h)
  for (let i = 0; i < w * h; i++) {
    const r = rgba[i * 4]
    const g = rgba[i * 4 + 1]
    const b = rgba[i * 4 + 2]
    out[i] = ((r * 306) + (g * 601) + (b * 117)) >>> 10
  }
  return out
}

// Cross-browser getUserMedia (handles webkit prefix in older Chrome/Safari)
function getUserMedia(constraints) {
  if (navigator.mediaDevices?.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(constraints)
  }
  const legacy = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  if (legacy) {
    return new Promise((resolve, reject) => legacy.call(navigator, constraints, resolve, reject))
  }
  return Promise.reject(new Error('Camera not supported'))
}

export function QRScanner({ onScan, onError, onClose, scanned }) {
  const videoRef = useRef(null)
  const canvas = useRef(document.createElement('canvas'))
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)
  const activeRef = useRef(false)
  const rafRef = useRef(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [debug, setDebug] = useState('Starting…')

  useEffect(() => { onScanRef.current = onScan }, [onScan])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    activeRef.current = true
    let frameCount = 0

    function tick() {
      if (!activeRef.current) return

      const video = videoRef.current
      if (!video || video.readyState < 2 || video.videoWidth === 0) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const cvs = canvas.current
      const w = video.videoWidth
      const h = video.videoHeight

      if (cvs.width !== w || cvs.height !== h) {
        cvs.width = w
        cvs.height = h
      }

      const ctx = cvs.getContext('2d')
      ctx.drawImage(video, 0, 0, w, h)
      const imageData = ctx.getImageData(0, 0, w, h)

      frameCount++
      if (frameCount % 30 === 0) {
        const cx = Math.floor(w / 2)
        const cy = Math.floor(h / 2)
        const i = (cy * w + cx) * 4
        const d = imageData.data
        setDebug(`frames=${frameCount} ${w}x${h} center=${d[i]},${d[i+1]},${d[i+2]}`)
      }

      try {
        // Convert RGBA → grayscale for ZXing
        const luminance = rgbaToLuminance(imageData.data, w, h)
        const src = new RGBLuminanceSource(luminance, w, h)
        const bitmap = new BinaryBitmap(new HybridBinarizer(src))
        const result = zxingReader.decode(bitmap)
        const raw = result.getText()
        setDebug(`DETECTED: ${raw.slice(0, 60)}`)
        onScanRef.current([{ rawValue: raw }])
        return // stop loop
      } catch (e) {
        if (!(e instanceof NotFoundException)) {
          setDebug(`err: ${e.name}: ${e.message}`)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    async function startCamera() {
      try {
        let stream
        // Try rear camera first, then fall back to any camera
        try {
          stream = await getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
          })
        } catch {
          stream = await getUserMedia({ video: true, audio: false })
        }

        if (!activeRef.current) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        const video = videoRef.current
        if (!video) return

        video.setAttribute('playsinline', '')
        video.setAttribute('webkit-playsinline', '')
        video.srcObject = stream
        video.muted = true

        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve
          video.onerror = reject
          setTimeout(resolve, 3000) // safety timeout
        })
        await video.play()

        setCameraReady(true)
        setDebug('Scanning… point at QR code')
        rafRef.current = requestAnimationFrame(tick)
      } catch (err) {
        if (!activeRef.current) return
        const msg =
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in your browser settings.'
            : err.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : 'Camera not supported. Please use Safari on iOS or Chrome on Android over HTTPS.'
        setCameraError(msg)
        onErrorRef.current(err)
      }
    }

    startCamera()

    return () => {
      activeRef.current = false
      cancelAnimationFrame(rafRef.current)
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

      {/*
        Video element must exist and be playing for drawImage() to capture frames,
        but it does not need to be visible. Positioned off-screen via fixed so no
        parent overflow:hidden can clip it.
      */}
      <video
        ref={videoRef}
        style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}
        playsInline
        webkit-playsinline=""
        muted
        autoPlay
      />

      {/* Camera UI — dark background + targeting box, no video preview */}
      <div className="flex-1 relative bg-slate-950">
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

        {/* Debug overlay */}
        {!scanned && !cameraError && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded px-2 py-1 pointer-events-none">
            <p className="text-yellow-300 text-xs font-mono break-all">{debug}</p>
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
