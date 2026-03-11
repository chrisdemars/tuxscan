import { useState, useRef, useCallback } from 'react'
import { parseQR } from '../utils/parseQR.js'

export function useScanner({ onContact }) {
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [error, setError] = useState(null)

  // Refs avoid stale-closure issues inside the Scanner callback
  const scannedRef = useRef(false)
  const lastRawRef = useRef(null)
  const lastTimeRef = useRef(0)

  function startScan() {
    setError(null)
    scannedRef.current = false
    setScanned(false)
    setScanning(true)
  }

  function stopScan() {
    scannedRef.current = false
    setScanned(false)
    setScanning(false)
  }

  const handleScan = useCallback((results) => {
    // Guard via ref, not state — avoids stale closure
    if (scannedRef.current) return

    const raw = Array.isArray(results) ? results[0]?.rawValue : results
    if (!raw) return

    // Debounce: skip same raw value within 3 seconds
    const now = Date.now()
    if (raw === lastRawRef.current && now - lastTimeRef.current < 3000) return
    lastRawRef.current = raw
    lastTimeRef.current = now

    const contact = parseQR(raw)
    if (!contact) return

    scannedRef.current = true
    setScanned(true)
    onContact(contact)

    setTimeout(() => {
      scannedRef.current = false
      setScanned(false)
      setScanning(false)
    }, 1500)
  }, [onContact])

  function handleError(err) {
    console.error('Scanner error', err)
    setError('Camera unavailable. Please check permissions.')
    setScanning(false)
  }

  return { scanning, scanned, error, startScan, stopScan, handleScan, handleError }
}
