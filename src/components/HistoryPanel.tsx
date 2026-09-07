import { useMemo, useState } from 'react'
import type { Trade } from '../types'
import { fmtDate, fmtPrice, fmtQty, fmtSignedUsd, fmtUsd, groupByDay, pnlOf } from '../lib/calc'

interface Props {
  trades: Trade[]
}

function Mini({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: 'pos' | 'neg' }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value${tone ? ` ${tone}` : ''}`}>{value}</span>
      <span className="stat-hint">{hint}</span>
    </div>
  )
}

export function HistoryPanel({ trades }: Props) {
  const days = useMemo(() => groupByDay(trades), [trades])
  const [expanded, setExpanded] = useState<string | null>(null)

  const summary = useMemo(() => {
    if (days.length === 0) return null
    let best = days[0]
    let worst = days[0]
    for (const d of days) {
      if (d.netPnl > best.netPnl) best = d
      if (d.netPnl < worst.netPnl) worst = d
    }
    const active = days.filter((d) => d.count > 1).length
    return { avg: trades.length / days.length, best, worst, active }
  }, [days, trades.length])

  const maxAbs = Math.max(1, ...days.map((d) => Math.abs(d.netPnl)))

  if (days.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">No history yet</p>
        <p className="empty-sub">Log a few trades and your day-by-day activity will show up here.</p>
      </div>
    )
  }

  return (
    <div className="history">
      {summary && (
        <section className="stats mini" aria-label="Daily activity summary">
          <Mini
            label="Trading days"
            value={String(days.length)}
            hint={`${trades.length} ${trades.length === 1 ? 'trade' : 'trades'} logged`}
          />
          <Mini
            label="Avg trades / day"
            value={summary.avg.toFixed(1)}
            hint={`${summary.active} ${summary.active === 1 ? 'day' : 'days'} with 2+ trades`}
          />
          <Mini
            label="Best day"
            value={fmtSignedUsd(summary.best.netPnl)}
            tone={summary.best.netPnl > 0 ? 'pos' : summary.best.netPnl < 0 ? 'neg' : undefined}
            hint={fmtDate(summary.best.date)}
          />
          <Mini
            label="Worst day"
            value={fmtSignedUsd(summary.worst.netPnl)}
            tone={summary.worst.netPnl < 0 ? 'neg' : summary.worst.netPnl > 0 ? 'pos' : undefined}
            hint={fmtDate(summary.worst.date)}
          />
        </section>
      )}

      <ul className="day-list">
        {days.map((d) => {
          const isOpen = expanded === d.date
          const width = Math.max(3, (Math.abs(d.netPnl) / maxAbs) * 100)
          const tone = d.netPnl > 0 ? 'pos' : d.netPnl < 0 ? 'neg' : 'flat'
          return (
            <li key={d.date} className={`day-card${isOpen ? ' expanded' : ''}`}>
              <button
                type="button"
                className="day-head"
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : d.date)}
              >
                <span className="day-left">
                  <span className="day-date">{fmtDate(d.date)}</span>
                  <span className="day-meta mono">
                    <strong>{d.count}</strong>
                    <span>{d.count === 1 ? 'trade' : 'trades'}</span>
                    <span className="dot" />
                    <span>
                      <span className="pos">{d.wins}W</span> · <span className={d.losses > 0 ? 'neg' : ''}>{d.losses}L</span>
                    </span>
                    {d.open > 0 && (
                      <>
                        <span className="dot" />
                        <span className="day-open">{d.open} open</span>
                      </>
                    )}
                    <span className="dot" />
                    <span title="Sum of entry price × size for the day">{fmtUsd(d.volume)} traded</span>
                  </span>
                </span>
                <span className={`day-pnl mono ${tone}`}>{fmtSignedUsd(d.netPnl)}</span>
                <span className={`chev${isOpen ? ' up' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>
              <div className="day-bar" role="img" aria-label={`Net day P&L: ${fmtSignedUsd(d.netPnl)}`}>
                <i className={tone} style={{ width: `${width}%` }} />
              </div>
              {isOpen && (
                <ul className="day-trades">
                  {d.trades.map((t) => {
                    const closed = t.exit !== null
                    const pnl = pnlOf(t)
                    return (
                      <li key={t.id} className="mini-row">
                        <span className={`mini-dir ${t.direction}`}>{t.direction === 'long' ? '▲' : '▼'}</span>
                        <span className="mini-sym">{t.symbol}</span>
                        <span className="mini-prices mono">
                          {fmtPrice(t.entry)} → {t.exit === null ? '—' : fmtPrice(t.exit)} × {fmtQty(t.qty)}
                        </span>
                        <span className="mini-setup">
                          {t.setup}
                          {t.concept ? ` · ${t.concept}` : ''}
                        </span>
                        {t.screenshotId && <span className="mini-shot" title="Has chart screenshot">📷</span>}
                        {closed && pnl !== null ? (
                          <span className={`mini-pnl mono ${pnl >= 0 ? 'pos' : 'neg'}`}>{fmtSignedUsd(pnl)}</span>
                        ) : (
                          <span className="mini-pnl mini-open">open</span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
      <p className="history-note">Click a day to expand its trades. Bars are scaled to the biggest winning or losing day.</p>
    </div>
  )
}
