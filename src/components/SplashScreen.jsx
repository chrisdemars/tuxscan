import { useEffect, useState } from 'react'

export function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false)
  const [imgReady, setImgReady] = useState(false)

  useEffect(() => {
    // Preload image in JS — fires instantly if already cached via <link rel="preload">
    const img = new Image()
    img.onload = () => setImgReady(true)
    img.src = '/icons/icon-512.png'
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
      <div
        style={{
          width: 192,
          height: 192,
          flexShrink: 0,
          opacity: imgReady ? 1 : 0,
          backgroundImage: imgReady ? 'url(/icons/icon-512.png)' : 'none',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
    </div>
  )
}
