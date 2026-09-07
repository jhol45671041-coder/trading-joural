import { useCallback, useEffect, useState } from 'react'
import type { Trade, TradeDraft } from '../types'
import { SAMPLE_TRADES } from '../lib/sample'
import { deleteScreenshot, saveScreenshot } from '../lib/images'

const STORAGE_KEY = 'trading-jo…s.v1'

/** Older saved rows may not have the newer fields yet. */
type StoredTrade = Omit<Trade, 'concept' | 'screenshotId'> & {
  concept?: string
  screenshotId?: string | null
}

function loadTrades(): Trade[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return SAMPLE_TRADES
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return (parsed as StoredTrade[]).map((t) => ({
      ...t,
      concept: t.concept ?? '',
      screenshotId: t.screenshotId ?? null,
    }))
  } catch {
    return []
  }
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(loadTrades)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trades))
    } catch {
      // storage unavailable (private mode, quota) — journal still works in-memory
    }
  }, [trades])

  /** `image` is stored in IndexedDB before the trade row is appended. */
  const addTrade = useCallback(async (draft: TradeDraft, image?: File | null) => {
    let screenshotId: string | null = null
    if (image) {
      try {
        screenshotId = await saveScreenshot(image)
      } catch {
        // persistence hiccup — still save the trade, just without the shot
      }
    }
    const trade: Trade = { ...draft, screenshotId, id: crypto.randomUUID(), createdAt: Date.now() }
    setTrades((ts) => [trade, ...ts])
  }, [])

  const removeTrade = useCallback((id: string) => {
    setTrades((ts) => {
      const shot = ts.find((t) => t.id === id)?.screenshotId
      if (shot) void deleteScreenshot(shot)
      return ts.filter((t) => t.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    setTrades((ts) => {
      for (const t of ts) if (t.screenshotId) void deleteScreenshot(t.screenshotId)
      return []
    })
  }, [])

  const loadSamples = useCallback(() => setTrades(SAMPLE_TRADES), [])

  return { trades, addTrade, removeTrade, clearAll, loadSamples }
}
