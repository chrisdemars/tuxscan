import { useEffect, useState } from 'react'

export function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false)
  const [imgReady, setImgReady] = useState(false)

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
        width="192"
        height="192"
        onLoad={() => setImgReady(true)}
        style={{ opacity: imgReady ? 1 : 0 }}
        className="w-48 h-48"
      />
    </div>
  )
}
