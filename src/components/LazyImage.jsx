import { useState, useRef, useEffect } from 'react'

/**
 * LazyImage — loads only when within 200px of viewport.
 * Shows a pulsing skeleton while loading; fades in the image on load.
 * On error, shows a dark tile with the first letter of `fallbackLetter`.
 *
 * Props:
 *  src            — image URL
 *  alt            — alt text
 *  className      — classes on the outer wrapper div
 *  style          — inline styles on wrapper
 *  eager          — skip IntersectionObserver (above-the-fold images)
 *  fallbackLetter — single char shown when image fails (e.g. brand initial)
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  style,
  eager = false,
  fallbackLetter = '?',
}) {
  const [inView, setInView]   = useState(eager)
  const [loaded, setLoaded]   = useState(false)
  const [error, setError]     = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (eager || !wrapperRef.current) return
    const el = wrapperRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [eager])

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${className}`} style={style}>
      {/* Skeleton shown until image is loaded */}
      <div
        className={`absolute inset-0 bg-neutral-950 transition-opacity duration-500 ${
          loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {!error && (
          <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-4xl text-white/10 select-none">
              {fallbackLetter}
            </span>
          </div>
        )}
      </div>

      {/* Real image — only fetched once in view */}
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  )
}
