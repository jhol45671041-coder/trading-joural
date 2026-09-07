import { useEffect, useState } from 'react'
import { loadScreenshotBlob } from '../lib/images'

/**
 * Loads a trade's screenshot blob from IndexedDB as a revocable object URL.
 * State is only set from the async completion (never synchronously in the
 * effect body); `loading` is derived until that lands.
 */
export function useShotUrl(shotId: string | null): { url: string | null; loading: boolean } {
  const [entry, setEntry] = useState<{ forId: string; url: string | null } | null>(null)

  useEffect(() => {
    if (!shotId) return
    let live = true
    let created: string | null = null
    void loadScreenshotBlob(shotId).then((blob) => {
      if (!live) return
      if (blob) {
        created = URL.createObjectURL(blob)
        setEntry({ forId: shotId, url: created })
      } else {
        setEntry({ forId: shotId, url: null })
      }
    })
    return () => {
      live = false
      if (created) URL.revokeObjectURL(created)
    }
  }, [shotId])

  if (!shotId) return { url: null, loading: false }
  const settled = entry !== null && entry.forId === shotId
  return { url: settled ? entry.url : null, loading: !settled }
}
