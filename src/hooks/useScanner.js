import { useState, useRef } from 'react'
import { parseQR } from '../utils/parseQR.js'

export function useScanner({ onContact }) {
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [error, setError] = useState(null)
  const lastRawRef = useRef(null)
  const lastTimeRef = useRef(0)

  function startScan() {
    setError(null)
    setScanned(false)
    setScanning(true)
  }

  function stopScan() {
    setScanning(false)
    setScanned(false)
  }

  function handleScan(results) {
    if (scanned) return // already showing success, ignore until closed

    const raw = Array.isArray(results) ? results[0]?.rawValue : results
    if (!raw) return

    // Debounce: skip same code within 3 seconds
    const now = Date.now()
    if (raw === lastRawRef.current && now - lastTimeRef.current < 3000) return
    lastRawRef.current = raw
    lastTimeRef.current = now

    const contact = parseQR(raw)
    if (contact) {
      setScanned(true)
      onContact(contact)
      setTimeout(() => {
        setScanning(false)
        setScanned(false)
      }, 1500)
    }
  }

  function handleError(err) {
    console.error('Scanner error', err)
    setError('Camera unavailable. Please check permissions.')
    setScanning(false)
  }

  return { scanning, scanned, error, startScan, stopScan, handleScan, handleError }
}
