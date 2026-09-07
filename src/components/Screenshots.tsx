import { useEffect } from 'react'
import { useShotUrl } from '../hooks/useShotUrl'

interface ThumbProps {
  shotId: string | null
  label: string
  onOpen: (shotId: string, label: string) => void
}

export function ShotThumb({ shotId, label, onOpen }: ThumbProps) {
  const { url } = useShotUrl(shotId)
  if (!shotId || !url) return null
  return (
    <button
      type="button"
      className="shot-thumb"
      title="View screenshot"
      aria-label={`View screenshot for ${label}`}
      onClick={() => shotId && onOpen(shotId, label)}
    >
      <img src={url} alt="" loading="lazy" />
    </button>
  )
}

interface LightboxProps {
  shotId: string
  label: string
  onClose: () => void
}

export function ShotLightbox({ shotId, label, onClose }: LightboxProps) {
  const { url, loading } = useShotUrl(shotId)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Screenshot for ${label}`}
      onClick={onClose}
    >
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-bar">
          <span className="mono">{label}</span>
          <button type="button" className="lightbox-close" aria-label="Close screenshot viewer" onClick={onClose}>
            ✕
          </button>
        </div>
        {url ? (
          <img className="lightbox-img" src={url} alt={`Chart screenshot for ${label}`} />
        ) : (
          <p className="lightbox-msg">{loading ? 'Loading…' : 'Screenshot is no longer available.'}</p>
        )}
      </div>
    </div>
  )
}
