# trading-journal

A single-page trading journal: log trades (symbol, direction, entry/exit, size, fees,
setup, concept, notes), and the app computes P&L, return %, win rate, and running stats
for you. Trades persist in `localStorage`, so your journal survives refreshes — no
account or backend required.

Built with Vite + React + TypeScript. No other runtime dependencies.

## Features

- **Log-a-trade form** with validation, long/short toggle, and a live estimated-P&L preview
- **Concept field** — capture the idea behind every entry (e.g. "higher-low into bull flag");
  shown as a chip on each trade and included in search
- **Chart screenshots** — attach one per trade by file picker, drag & drop, or paste
  (Ctrl/Cmd+V); stored as blobs in IndexedDB, shown as a thumbnail in the log with a
  click-to-zoom lightbox, and cleaned up automatically when a trade is deleted
- **Open positions** — leave the exit price blank to track an unclosed trade
- **Trade log** with filters (All / Open / Wins / Losses), search, and per-trade delete
- **History view** — trades grouped by day: how many trades you took, dollars traded
  (volume), W/L record, net P&L with a scaled bar, and an expandable per-day trade list;
  plus trading-days, avg trades/day, best day and worst day summaries
- **Stats bar** — net P&L, win rate, average return (with best/worst), trade counts
- **Light & dark themes** — toggle in the header; follows your OS until you pick one,
  and your choice persists across visits
- **Local persistence** via `localStorage` (seeded with sample trades on first visit)

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # oxlint
```

## Layout

```
src/
  App.tsx                  page shell: header, stats, form + tabbed panel (log / history)
  types.ts                 Trade model + setup tags
  index.css                light "fintech" design system (Inter + IBM Plex Mono)
  hooks/useTrades.ts       state + localStorage persistence (+ schema migration)
  hooks/useShotUrl.ts      IndexedDB blob → object-URL loader
  lib/calc.ts              P&L / return / stats / daily grouping + formatting helpers
  lib/images.ts            screenshot storage (IndexedDB) + validation
  lib/sample.ts            seed data for first visit
  components/
    StatsBar.tsx           summary cards
    TradeForm.tsx          new-trade entry form
    TradeList.tsx          filterable log with delete
    HistoryPanel.tsx       day-by-day activity with expandable trade lists
    Screenshots.tsx        thumbnails + click-to-zoom lightbox
    ThemeToggle.tsx        light/dark switch
```
