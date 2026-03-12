import { useEffect, useState } from 'react'

// Inline base64 icon — zero network latency, renders at full size instantly
import iconUrl from '/icons/icon-512.png?url'

// Kick off decode before the component even mounts
const decoded = new Promise((resolve) => {
  const img = new Image()
  img.onload = resolve
  img.onerror = resolve
  img.src = iconUrl
})

export function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    decoded.then(() => setReady(true))
  }, [])

  useEffect(() => {
    const showTimer = setTimeout(() => setFading(true), 2000)
    const doneTimer = setTimeout(() => onDone(), 2600)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900"
      style={{
        transition: 'opacity 600ms ease',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      {ready && (
        <img
          src={iconUrl}
          alt="TuxScan"
          width="192"
          height="192"
          style={{ display: 'block', width: 192, height: 192 }}
        />
      )}
    </div>
  )
}
