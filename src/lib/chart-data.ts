// ---------------------------------------------------------------------------
//  TALLGRUNNLAG FOR ÅRSGRAFEN
// ---------------------------------------------------------------------------
//  Rene funksjoner, uten Firestore og uten SVG, så de kan testes rett fram.
//  Tegningen skjer i components/YearChartModal.tsx.
// ---------------------------------------------------------------------------

import type { Entry, IncomeEntry } from '../types.ts'

export interface MonthlySeries {
  /** Tolv tall, januar til desember. */
  income: number[]
  expenses: number[]
  result: number[]
}

/** Månedsnummeret (0–11) en ISO-dato hører til, eller null hvis datoen er
 *  ubrukelig. En korrupt rad skal ikke havne i januar ved et uhell. */
export function monthIndex(isoDate: string): number | null {
  const m = /^\d{4}-(\d{2})/.exec(isoDate ?? '')
  if (!m) return null
  const i = Number(m[1]) - 1
  return i >= 0 && i <= 11 ? i : null
}

/** Inntekter og utgifter fordelt på årets tolv måneder.
 *
 *  `entries` skal være årets utgifter UTEN de settings-styrte postene (EKOM,
 *  hjemmekontor, avskrivninger). De er årsbeløp uten måned, og å fordele dem
 *  utover året ville vært å finne på tall. De håndteres derfor for seg, og
 *  grafen sier fra om at de ikke er med i søylene. */
export function monthlySeries(
  entries: Entry[],
  incomeEntries: IncomeEntry[],
  year: number,
  amountOf: (e: Entry) => number,
): MonthlySeries {
  const income = Array(12).fill(0) as number[]
  const expenses = Array(12).fill(0) as number[]
  const ys = String(year)

  for (const e of incomeEntries) {
    if (!e.date?.startsWith(ys)) continue
    const i = monthIndex(e.date)
    if (i !== null) income[i] += Number(e.amount) || 0
  }
  for (const e of entries) {
    if (!e.date?.startsWith(ys)) continue
    const i = monthIndex(e.date)
    if (i !== null) expenses[i] += amountOf(e)
  }

  const round = (n: number) => Math.round(n * 100) / 100
  return {
    income: income.map(round),
    expenses: expenses.map(round),
    result: income.map((v, i) => round(v - expenses[i])),
  }
}

export interface Scale {
  lo: number
  hi: number
  ticks: number[]
}

/** Et lesbart tallområde for y-aksen: runde trinn, og alltid med null-linja
 *  med. Uten dette får aksen verdier som 4713 og 9426. */
export function niceScale(values: number[], tickCount = 5): Scale {
  const max = Math.max(0, ...values)
  const min = Math.min(0, ...values)
  if (max === 0 && min === 0) return { lo: 0, hi: 1, ticks: [0, 1] }

  const step = chooseStep(min, max, tickCount)
  const hi = Math.ceil(max / step) * step
  const lo = Math.floor(min / step) * step
  const ticks: number[] = []
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 100) / 100)
  return { lo, hi, ticks }
}

/** Minste «pene» trinn som holder antall streker nede.
 *
 *  Å regne trinnet direkte ut fra rekkevidden delt på ønsket antall gir lett et
 *  altfor grovt trinn: med toppverdi 11 750 landet aksen på 20 000, og halve
 *  grafen ble tom luft. Her prøver vi trinnene i stigende rekkefølge og tar det
 *  første som gir få nok streker, slik at aksen ligger tett på tallene. */
function chooseStep(min: number, max: number, tickCount: number): number {
  const range = (max - min) || 1
  const exp = Math.floor(Math.log10(range))
  for (const p of [exp - 2, exp - 1, exp, exp + 1]) {
    for (const m of [1, 2, 2.5, 5]) {
      const step = m * Math.pow(10, p)
      if (step <= 0 || !Number.isFinite(step)) continue
      const lo = Math.floor(min / step) * step
      const hi = Math.ceil(max / step) * step
      if ((hi - lo) / step <= tickCount + 1) return step
    }
  }
  return range / tickCount
}

/** Kort aksemerkelapp: 10 000 blir «10k», 2500 blir «2,5k». */
export function tickLabel(n: number): string {
  if (n === 0) return '0'
  const abs = Math.abs(n)
  if (abs >= 1000) {
    const k = n / 1000
    const s = Number.isInteger(k) ? String(k) : k.toFixed(1).replace('.', ',')
    return `${s}k`
  }
  return String(Math.round(n))
}
