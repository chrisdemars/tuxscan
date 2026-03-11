import { useState } from 'react'
import { parseQR } from '../utils/parseQR.js'

export function useScanner({ onContact }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)

  function startScan() {
    setError(null)
    setScanning(true)
  }

  function stopScan() {
    setScanning(false)
  }

  function handleScan(results) {
    // @yudiel/react-qr-scanner v2 returns an array of DetectedBarcode
    const raw = Array.isArray(results) ? results[0]?.rawValue : results
    if (!raw) return

    const contact = parseQR(raw)
    if (contact) {
      setScanning(false)
      onContact(contact)
    }
    // if parseQR returns null, keep scanning — unrecognised QR
  }

  function handleError(err) {
    console.error('Scanner error', err)
    setError('Camera unavailable. Please check permissions.')
    setScanning(false)
  }

  return { scanning, error, startScan, stopScan, handleScan, handleError }
}
