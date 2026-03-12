import { useEffect, useState } from 'react'

export function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false)

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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900"
      style={{
        transition: 'opacity 600ms ease',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <img
        src="/icons/icon-512.png"
        alt="TuxScan"
        className="w-48 h-48"
      />
    </div>
  )
}
