import type { Trade } from '../types'

export const isClosed = (t: Trade): boolean => t.exit !== null

export function costOf(t: Trade): number {
  return t.entry * t.qty
}

/** Net profit/loss in cash for a closed trade; null for open ones. */
export function pnlOf(t: Trade): number | null {
  if (t.exit === null) return null
  const sign = t.direction === 'long' ? 1 : -1
  return (t.exit - t.entry) * t.qty * sign - t.fees
}

/** P&L as a percentage of the position's cost basis. */
export function returnPctOf(t: Trade): number | null {
  if (t.exit === null) return null
  const pnl = pnlOf(t)
  const cost = costOf(t)
  if (pnl === null || cost <= 0) return null
  return (pnl / cost) * 100
}

export interface JournalStats {
  total: number
  closed: number
  open: number
  wins: number
  losses: number
  /** 0–100, null when nothing is closed yet */
  winRate: number | null
  totalPnl: number
  /** average return % across closed trades */
  avgReturn: number | null
  bestReturn: number | null
  worstReturn: number | null
}

export function computeStats(trades: Trade[]): JournalStats {
  let wins = 0
  let losses = 0
  let totalPnl = 0
  let returnSum = 0
  let bestReturn: number | null = null
  let worstReturn: number | null = null
  let open = 0

  for (const t of trades) {
    if (t.exit === null) {
      open++
      continue
    }
    const pnl = pnlOf(t) ?? 0
    const ret = returnPctOf(t) ?? 0
    totalPnl += pnl
    returnSum += ret
    bestReturn = bestReturn === null ? ret : Math.max(bestReturn, ret)
    worstReturn = worstReturn === null ? ret : Math.min(worstReturn, ret)
    if (pnl > 0) wins++
    else losses++
  }

  const closed = wins + losses
  return {
    total: trades.length,
    closed,
    open,
    wins,
    losses,
    winRate: closed > 0 ? (wins / closed) * 100 : null,
    totalPnl,
    avgReturn: closed > 0 ? returnSum / closed : null,
    bestReturn,
    worstReturn,
  }
}

const usd0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const usd2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const price = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

const qty = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
})

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/** "+$1,234.56" / "−$89.00" style, colored via class at the call site. */
export function fmtSignedUsd(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}${usd2.format(Math.abs(n))}`
}

export function fmtUsd(n: number): string {
  return Math.abs(n) >= 1000 ? usd0.format(n) : usd2.format(n)
}

export function fmtSignedPct(n: number): string {
  return `${n >= 0 ? '+' : n < 0 ? '-' : ''}${Math.abs(n).toFixed(2)}%`
}

export function fmtPrice(n: number): string {
  return `$${price.format(n)}`
}

export function fmtQty(n: number): string {
  return qty.format(n)
}

export function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d)
}
