import { fmtSignedPct, fmtSignedUsd } from '../lib/calc'
import type { JournalStats } from '../lib/calc'

interface Props {
  stats: JournalStats
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint: string
  tone?: 'pos' | 'neg'
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value${tone ? ` ${tone}` : ''}`}>{value}</span>
      <span className="stat-hint">{hint}</span>
    </div>
  )
}

export function StatsBar({ stats }: Props) {
  const pnlTone = stats.totalPnl > 0 ? 'pos' : stats.totalPnl < 0 ? 'neg' : undefined
  const avg = stats.avgReturn
  const avgTone = avg === undefined || avg === null ? undefined : avg > 0 ? 'pos' : avg < 0 ? 'neg' : undefined

  return (
    <section className="stats" aria-label="Performance summary">
      <Stat
        label="Net P&L"
        value={fmtSignedUsd(stats.totalPnl)}
        tone={pnlTone}
        hint={`across ${stats.closed} closed ${stats.closed === 1 ? 'trade' : 'trades'}`}
      />
      <Stat
        label="Win rate"
        value={stats.winRate === null ? '—' : `${stats.winRate.toFixed(0)}%`}
        hint={`${stats.wins}W · ${stats.losses}L`}
      />
      <Stat
        label="Avg return"
        value={avg === null ? '—' : fmtSignedPct(avg)}
        tone={avgTone}
        hint={
          stats.bestReturn !== null && stats.worstReturn !== null
            ? `best ${fmtSignedPct(stats.bestReturn)} · worst ${fmtSignedPct(stats.worstReturn)}`
            : 'log closed trades to see'
        }
      />
      <Stat
        label="Trades"
        value={String(stats.total)}
        hint={`${stats.open} open · ${stats.closed} closed`}
      />
    </section>
  )
}
