import { useCallback, useEffect, useState } from 'react'
import type { Trade, TradeDraft } from '../types'
import { SAMPLE_TRADES } from '../lib/sample'

const STORAGE_KEY = 'trading-jo…s.v1'

function loadTrades(): Trade[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return SAMPLE_TRADES
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Trade[]) : []
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

  const addTrade = useCallback((draft: TradeDraft) => {
    const trade: Trade = { ...draft, id: crypto.randomUUID(), createdAt: Date.now() }
    setTrades((ts) => [trade, ...ts])
  }, [])

  const removeTrade = useCallback((id: string) => {
    setTrades((ts) => ts.filter((t) => t.id !== id))
  }, [])

  const clearAll = useCallback(() => setTrades([]), [])

  const loadSamples = useCallback(() => setTrades(SAMPLE_TRADES), [])

  return { trades, addTrade, removeTrade, clearAll, loadSamples }
}
