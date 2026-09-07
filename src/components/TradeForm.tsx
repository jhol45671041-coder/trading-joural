import { type FormEvent, useMemo, useState } from 'react'
import type { Direction, TradeDraft } from '../types'
import { SETUPS } from '../types'
import { fmtSignedPct, fmtSignedUsd } from '../lib/calc'

interface Props {
  onAdd: (draft: TradeDraft) => void
}

interface FormState {
  symbol: string
  direction: Direction
  date: string
  entry: string
  exit: string
  qty: string
  fees: string
  setup: string
  concept: string
  notes: string
}

type Errors = Partial<Record<keyof FormState, string>>

const todayISO = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const initialState = (): FormState => ({
  symbol: '',
  direction: 'long',
  date: todayISO(),
  entry: '',
  exit: '',
  qty: '',
  fees: '0',
  setup: SETUPS[0],
  concept: '',
  notes: '',
})

const parseNum = (s: string): number => {
  const trimmed = s.trim()
  if (trimmed === '') return NaN
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : NaN
}

export function TradeForm({ onAdd }: Props) {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Errors>({})

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const entryN = parseNum(form.entry)
  const exitN = parseNum(form.exit)
  const qtyN = parseNum(form.qty)
  const feesN = form.fees.trim() === '' ? 0 : parseNum(form.fees)

  const preview = useMemo(() => {
    if (!(entryN > 0) || !(qtyN > 0) || !(exitN > 0) || !(feesN >= 0)) return null
    const sign = form.direction === 'long' ? 1 : -1
    const pnl = (exitN - entryN) * qtyN * sign - feesN
    const ret = (pnl / (entryN * qtyN)) * 100
    return { pnl, ret }
  }, [entryN, exitN, qtyN, feesN, form.direction])

  const validate = (): Errors => {
    const next: Errors = {}
    if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(form.symbol.trim().toUpperCase())) {
      next.symbol = '1–10 chars, letters/digits/./-'
    }
    if (!form.date) next.date = 'Pick a date'
    if (!(entryN > 0)) next.entry = 'Must be greater than 0'
    if (form.exit.trim() !== '' && !(exitN > 0)) next.exit = 'Must be greater than 0'
    if (!(qtyN > 0)) next.qty = 'Must be greater than 0'
    if (form.fees.trim() !== '' && !(feesN >= 0)) next.fees = 'Enter 0 or more'
    return next
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next = validate()
    if (Object.values(next).some(Boolean)) {
      setErrors(next)
      return
    }
    onAdd({
      symbol: form.symbol.trim().toUpperCase(),
      direction: form.direction,
      date: form.date,
      entry: entryN,
      exit: form.exit.trim() === '' ? null : exitN,
      qty: qtyN,
      fees: feesN,
      setup: form.setup,
      concept: form.concept.trim(),
      notes: form.notes.trim(),
    })
    setErrors({})
    setForm({ ...initialState(), date: form.date, setup: form.setup, concept: form.concept })
  }

  return (
    <form className="trade-form" onSubmit={submit} noValidate>
      <div className="field-row two">
        <div className="field">
          <label htmlFor="f-symbol">Symbol</label>
          <input
            id="f-symbol"
            value={form.symbol}
            onChange={(e) => set('symbol', e.target.value.toUpperCase())}
            placeholder="NVDA"
            maxLength={10}
            autoComplete="off"
            spellCheck={false}
            className={errors.symbol ? 'invalid' : ''}
          />
          {errors.symbol && <p className="field-error">{errors.symbol}</p>}
        </div>
        <div className="field">
          <span className="field-label" id="f-direction-label">
            Direction
          </span>
          <div className="segmented" role="radiogroup" aria-labelledby="f-direction-label">
            <button
              type="button"
              role="radio"
              aria-checked={form.direction === 'long'}
              className={`seg long${form.direction === 'long' ? ' active' : ''}`}
              onClick={() => set('direction', 'long')}
            >
              Long
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={form.direction === 'short'}
              className={`seg short${form.direction === 'short' ? ' active' : ''}`}
              onClick={() => set('direction', 'short')}
            >
              Short
            </button>
          </div>
        </div>
      </div>

      <div className="field-row two">
        <div className="field">
          <label htmlFor="f-entry">Entry price</label>
          <input
            id="f-entry"
            inputMode="decimal"
            value={form.entry}
            onChange={(e) => set('entry', e.target.value)}
            placeholder="172.40"
            className={errors.entry ? 'invalid' : ''}
          />
          {errors.entry && <p className="field-error">{errors.entry}</p>}
        </div>
        <div className="field">
          <label htmlFor="f-exit">
            Exit price <span className="optional">— blank = still open</span>
          </label>
          <input
            id="f-exit"
            inputMode="decimal"
            value={form.exit}
            onChange={(e) => set('exit', e.target.value)}
            placeholder="181.05"
            className={errors.exit ? 'invalid' : ''}
          />
          {errors.exit && <p className="field-error">{errors.exit}</p>}
        </div>
      </div>

      <div className="field-row three">
        <div className="field">
          <label htmlFor="f-qty">Quantity</label>
          <input
            id="f-qty"
            inputMode="decimal"
            value={form.qty}
            onChange={(e) => set('qty', e.target.value)}
            placeholder="50"
            className={errors.qty ? 'invalid' : ''}
          />
          {errors.qty && <p className="field-error">{errors.qty}</p>}
        </div>
        <div className="field">
          <label htmlFor="f-fees">Fees ($)</label>
          <input
            id="f-fees"
            inputMode="decimal"
            value={form.fees}
            onChange={(e) => set('fees', e.target.value)}
            placeholder="0"
            className={errors.fees ? 'invalid' : ''}
          />
          {errors.fees && <p className="field-error">{errors.fees}</p>}
        </div>
        <div className="field">
          <label htmlFor="f-date">Date</label>
          <input
            id="f-date"
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className={errors.date ? 'invalid' : ''}
          />
          {errors.date && <p className="field-error">{errors.date}</p>}
        </div>
      </div>

      <div className="field-row two">
        <div className="field">
          <label htmlFor="f-setup">Setup</label>
          <select id="f-setup" value={form.setup} onChange={(e) => set('setup', e.target.value)}>
            {SETUPS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-concept">
            Concept <span className="optional">— the idea behind the entry</span>
          </label>
          <input
            id="f-concept"
            value={form.concept}
            onChange={(e) => set('concept', e.target.value)}
            placeholder="e.g. higher-low into bull flag"
            maxLength={80}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="f-notes">Notes</label>
        <textarea
          id="f-notes"
          rows={3}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="What did the plan say? What did you actually do?"
        />
      </div>

      <div className="form-actions">
        {preview ? (
          <p className="pnl-preview" aria-live="polite">
            Est. P&L{' '}
            <strong className={preview.pnl >= 0 ? 'pos' : 'neg'}>{fmtSignedUsd(preview.pnl)}</strong>
            <span className={`ret ${preview.ret >= 0 ? 'pos' : 'neg'}`}>{fmtSignedPct(preview.ret)}</span>
          </p>
        ) : (
          <p className="pnl-preview muted">Fill entry, exit &amp; qty to preview P&amp;L</p>
        )}
        <button type="submit" className="btn-primary">
          Save trade
        </button>
      </div>
    </form>
  )
}
