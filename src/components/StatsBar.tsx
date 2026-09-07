import { fmtSignedPct, fmtSignedUsd } from '../lib/calc'
import type { JournalStats } from '../lib/calc'

interface Props {
  stats: JournalStats
}

function IconPnl() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  )
}

function IconWin() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  )
}

function IconAvg() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="7.4" cy="7.4" r="2.4" />
      <circle cx="16.6" cy="16.6" r="2.4" />
    </svg>
  )
}

function IconTrades() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <line x1="6" y1="20" x2="6" y2="11" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="18" y1="20" x2="18" y2="14" />
    </svg>
  )
}

function Stat({
  label,
  value,
  hint,
  tone,
  icon,
  valueTone,
}: {
  label: string
  value: string
  hint: string
  tone: 'indigo' | 'emerald' | 'violet' | 'sky'
  icon: React.ReactNode
  valueTone?: 'pos' | 'neg'
}) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <span className="stat-icon">{icon}</span>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className={`stat-value${valueTone ? ` ${valueTone}` : ''}`}>{value}</span>
        <span className="stat-hint">{hint}</span>
      </div>
    </div>
  )
}

export function StatsBar({ stats }: Props) {
  const pnlTone = stats.totalPnl > 0 ? 'pos' : stats.totalPnl < 0 ? 'neg' : undefined
  const avg = stats.avgReturn
  const avgTone = avg === null ? undefined : avg > 0 ? 'pos' : avg < 0 ? 'neg' : undefined

  return (
    <section className="stats" aria-label="Performance summary">
      <Stat
        label="Net P&L"
        value={fmtSignedUsd(stats.totalPnl)}
        valueTone={pnlTone}
        tone="indigo"
        icon={<IconPnl />}
        hint={`across ${stats.closed} closed ${stats.closed === 1 ? 'trade' : 'trades'}`}
      />
      <Stat
        label="Win rate"
        value={stats.winRate === null ? '—' : `${stats.winRate.toFixed(0)}%`}
        tone="emerald"
        icon={<IconWin />}
        hint={`${stats.wins}W · ${stats.losses}L`}
      />
      <Stat
        label="Avg return"
        value={avg === null ? '—' : fmtSignedPct(avg)}
        valueTone={avgTone}
        tone="violet"
        icon={<IconAvg />}
        hint={
          stats.bestReturn !== null && stats.worstReturn !== null
            ? `best ${fmtSignedPct(stats.bestReturn)} · worst ${fmtSignedPct(stats.worstReturn)}`
            : 'log closed trades to see'
        }
      />
      <Stat
        label="Trades"
        value={String(stats.total)}
        tone="sky"
        icon={<IconTrades />}
        hint={`${stats.open} open · ${stats.closed} closed`}
      />
    </section>
  )
}
