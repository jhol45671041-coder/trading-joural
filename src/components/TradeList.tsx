import { useMemo, useState } from 'react'
import type { Trade } from '../types'
import {
  fmtDate,
  fmtPrice,
  fmtQty,
  fmtSignedPct,
  fmtSignedUsd,
  isClosed,
  pnlOf,
  returnPctOf,
} from '../lib/calc'
import { ShotLightbox, ShotThumb } from './Screenshots'

type Filter = 'all' | 'open' | 'wins' | 'losses'

interface Props {
  trades: Trade[]
  onDelete: (id: string) => void
  onClearAll: () => void
  onLoadSamples: () => void
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'wins', label: 'Wins' },
  { id: 'losses', label: 'Losses' },
]

function matchesFilter(t: Trade, filter: Filter): boolean {
  if (filter === 'all') return true
  const closed = isClosed(t)
  if (filter === 'open') return !closed
  const pnl = pnlOf(t) ?? 0
  if (filter === 'wins') return closed && pnl > 0
  return closed && pnl <= 0
}

export function TradeList({ trades, onDelete, onClearAll, onLoadSamples }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [lightbox, setLightbox] = useState<{ shotId: string; label: string } | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toUpperCase()
    return trades
      .filter((t) => {
        if (q && ![t.symbol, t.setup, t.concept, t.notes].some((s) => s.toUpperCase().includes(q))) return false
        return matchesFilter(t, filter)
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  }, [trades, filter, query])

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: trades.length, open: 0, wins: 0, losses: 0 }
    for (const t of trades) {
      if (matchesFilter(t, 'open')) c.open++
      else if ((pnlOf(t) ?? 0) > 0) c.wins++
      else c.losses++
    }
    return c
  }, [trades])

  return (
    <div className="trade-list-wrap">
      <div className="list-toolbar">
        <div className="segmented filters" role="tablist" aria-label="Filter trades">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`seg${filter === f.id ? ' active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className="count">{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <input
          className="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symbol, setup, notes…"
          aria-label="Search trades"
        />
      </div>

      {trades.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">Your journal is empty</p>
          <p className="empty-sub">Log your first trade on the left, or start from a few examples.</p>
          <button type="button" className="btn-ghost" onClick={onLoadSamples}>
            Load sample trades
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">Nothing here</p>
          <p className="empty-sub">No trades match this filter{query ? ' or search' : ''}.</p>
        </div>
      ) : (
        <ul className="trade-list">
          {visible.map((t) => {
            const closed = isClosed(t)
            const pnl = pnlOf(t) ?? 0
            const ret = returnPctOf(t)
            const tone = closed ? (pnl > 0 ? 'pos' : 'neg') : 'open'
            const label = `${t.symbol} · ${fmtDate(t.date)}`
            return (
              <li key={t.id} className={`trade-row ${tone}`}>
                <div className="trade-main">
                  <div className="trade-headline">
                    <span className="trade-symbol">{t.symbol}</span>
                    <span className={`dir ${t.direction}`}>{t.direction === 'long' ? '▲ LONG' : '▼ SHORT'}</span>
                    {!closed && <span className="badge-open">OPEN</span>}
                    <ShotThumb
                      shotId={t.screenshotId}
                      label={label}
                      onOpen={(shotId, l) => setLightbox({ shotId, label: l })}
                    />
                  </div>
                  <div className="trade-meta mono">
                    <span>{fmtDate(t.date)}</span>
                    <span className="dot" />
                    <span>{t.setup}</span>
                    {t.concept && (
                      <>
                        <span className="dot" />
                        <span className="concept-chip" title={t.concept}>
                          {t.concept}
                        </span>
                      </>
                    )}
                    <span className="dot" />
                    <span>
                      {fmtPrice(t.entry)} → {t.exit === null ? '—' : fmtPrice(t.exit)}
                    </span>
                    <span className="dot" />
                    <span>× {fmtQty(t.qty)}</span>
                  </div>
                  {t.notes && <p className="trade-notes">{t.notes}</p>}
                </div>
                <div className="trade-pnl mono">
                  {closed ? (
                    <>
                      <span className={`pnl ${tone}`}>{fmtSignedUsd(pnl)}</span>
                      {ret !== null && <span className={`ret ${ret >= 0 ? 'pos' : 'neg'}`}>{fmtSignedPct(ret)}</span>}
                    </>
                  ) : (
                    <span className="pnl awaiting">awaiting exit</span>
                  )}
                </div>
                <button
                  type="button"
                  className="delete"
                  aria-label={`Delete ${t.symbol} trade from ${t.date}`}
                  title="Delete trade"
                  onClick={() => onDelete(t.id)}
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {trades.length > 0 && (
        <div className="list-footer">
          <span className="list-count mono">
            {visible.length} of {trades.length} shown
          </span>
          <button
            type="button"
            className="btn-ghost danger"
            onClick={() => {
              if (window.confirm('Delete every trade in this journal?')) onClearAll()
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {lightbox && (
        <ShotLightbox shotId={lightbox.shotId} label={lightbox.label} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}
