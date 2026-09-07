export type Direction = 'long' | 'short'

export interface Trade {
  id: string
  symbol: string
  direction: Direction
  /** Trade date, YYYY-MM-DD */
  date: string
  entry: number
  /** null while the position is still open */
  exit: number | null
  qty: number
  fees: number
  setup: string
  /** The idea/edge behind the entry — free text, optional */
  concept: string
  notes: string
  /** Key of this trade's screenshot blob in IndexedDB; null when absent */
  screenshotId: string | null
  createdAt: number
}

export type TradeDraft = Omit<Trade, 'id' | 'createdAt' | 'screenshotId'>

export const SETUPS = [
  'Breakout',
  'Pullback',
  'Reversal',
  'Earnings / News',
  'Range',
  'Other',
] as const
