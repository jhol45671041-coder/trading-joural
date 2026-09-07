import { useMemo, useState } from 'react'
import { useTrades } from './hooks/useTrades'
import { computeStats } from './lib/calc'
import { StatsBar } from './components/StatsBar'
import { TradeForm } from './components/TradeForm'
import { TradeList } from './components/TradeList'
import { HistoryPanel } from './components/HistoryPanel'

type View = 'log' | 'history'

function Logo() {
  return (
    <svg className="logo" viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="url(#logo-grad)" />
      <g stroke-linecap="round">
        <line x1="21" y1="12" x2="21" y2="52" stroke="#16c784" strokeWidth="3" />
        <rect x="15" y="22" width="12" height="18" rx="2" fill="#16c784" />
        <line x1="43" y1="14" x2="43" y2="54" stroke="#ea3943" strokeWidth="3" />
        <rect x="37" y="26" width="12" height="16" rx="2" fill="#ea3943" />
      </g>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#141a2a" />
          <stop offset="1" stopColor="#0b0e14" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function App() {
  const { trades, addTrade, removeTrade, clearAll, loadSamples } = useTrades()
  const stats = useMemo(() => computeStats(trades), [trades])
  const [view, setView] = useState<View>('log')
  const dayCount = useMemo(() => new Set(trades.map((t) => t.date)).size, [trades])

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="app">
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div className="brand">
            <Logo />
            <div className="brand-text">
              <h1>Trading Journal</h1>
              <p>Log the trade. Track the edge.</p>
            </div>
          </div>
          <span className="today mono">{today}</span>
        </div>
      </header>

      <main className="wrap">
        <StatsBar stats={stats} />
        <div className="columns">
          <section className="panel form-panel" aria-label="Log a new trade">
            <div className="panel-head">
              <h2>Log a trade</h2>
            </div>
            <TradeForm onAdd={addTrade} />
          </section>

          <section className="panel list-panel" aria-label="Journal">
            <div className="panel-head">
              <h2 className="sr-only">Journal views</h2>
              <div className="segmented tabs" role="tablist" aria-label="Switch between trade log and history">
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === 'log'}
                  className={`seg${view === 'log' ? ' active' : ''}`}
                  onClick={() => setView('log')}
                >
                  Trade log <span className="count mono">{trades.length}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === 'history'}
                  className={`seg${view === 'history' ? ' active' : ''}`}
                  onClick={() => setView('history')}
                >
                  History <span className="count mono">{dayCount}</span>
                </button>
              </div>
            </div>
            {view === 'log' ? (
              <TradeList
                trades={trades}
                onDelete={removeTrade}
                onClearAll={clearAll}
                onLoadSamples={loadSamples}
              />
            ) : (
              <HistoryPanel trades={trades} />
            )}
          </section>
        </div>
      </main>

      <footer className="footwrap">
        <p>Everything is stored locally in your browser — no account, no server.</p>
      </footer>
    </div>
  )
}
