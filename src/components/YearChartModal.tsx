import { type Entry, type IncomeEntry } from '../types'
import { monthlySeries, niceScale, tickLabel } from '../lib/chart-data'
import { krInt, MONTHS } from '../lib/format'
import { ModalShell } from './Modal'

// Tegnet som ren SVG. Et diagrambibliotek ville lagt hundrevis av kilobyte til
// oppstarten for én graf, og appen har klart seg uten så langt.
const W = 640
const H = 300
const PAD = { top: 12, right: 10, bottom: 26, left: 46 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

const COLORS = {
  income: '#16a34a',   // green-600
  expense: '#f87171',  // red-400, dempet så inntektssøylene dominerer
  result: '#3b82f6',   // blue-500
}

/** Årets inntekter og utgifter måned for måned: søyler for hver av dem, og en
 *  linje for resultatet. */
export function YearChartModal({ year, entries, incomeEntries, amountOf, managedExpenses, onClose }: {
  year: number
  /** Årets utgifter UTEN de settings-styrte postene, som ikke har en måned. */
  entries: Entry[]
  incomeEntries: IncomeEntry[]
  amountOf: (e: Entry) => number
  /** Årsbeløpene for EKOM, hjemmekontor og avskrivninger, som ikke kan
   *  plasseres i en måned, men som hører med i totalen. */
  managedExpenses: number
  onClose: () => void
}) {
  const series = monthlySeries(entries, incomeEntries, year, amountOf)
  const scale = niceScale([...series.income, ...series.expenses, ...series.result])

  const totalIncome = series.income.reduce((s, v) => s + v, 0)
  const totalExpenses = series.expenses.reduce((s, v) => s + v, 0) + managedExpenses
  const result = totalIncome - totalExpenses

  const y = (v: number) => PAD.top + PLOT_H - ((v - scale.lo) / (scale.hi - scale.lo)) * PLOT_H
  const slot = PLOT_W / 12
  const barW = Math.min(14, slot / 3)
  const centerX = (i: number) => PAD.left + slot * i + slot / 2

  const zeroY = y(0)
  const linePoints = series.result.map((v, i) => `${centerX(i)},${y(v)}`).join(' ')

  return (
    <ModalShell title={`Inntekter og kostnader ${year}`} onClose={onClose}>
      <div className="px-5 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Kpi label="Inntekt" value={krInt(totalIncome)} tone="text-green-600" />
          <Kpi label="Kostnader" value={krInt(totalExpenses)} tone="text-red-600" />
          <Kpi label="Driftsresultat" value={krInt(result)} tone={result >= 0 ? 'text-blue-600' : 'text-red-600'} />
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
          aria-label={`Inntekter og kostnader per måned i ${year}`}>
          {/* Rutenett og aksemerkelapper */}
          {scale.ticks.map(t => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)}
                stroke={t === 0 ? '#94a3b8' : '#e2e8f0'} strokeWidth={t === 0 ? 1 : 1} />
              <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
                {tickLabel(t)}
              </text>
            </g>
          ))}

          {/* Søyler: inntekt til venstre, utgift til høyre i hver måned */}
          {series.income.map((v, i) => (
            <rect key={`i${i}`} x={centerX(i) - barW - 1} width={barW}
              y={Math.min(y(v), zeroY)} height={Math.abs(zeroY - y(v))}
              fill={COLORS.income} rx="1" />
          ))}
          {series.expenses.map((v, i) => (
            <rect key={`e${i}`} x={centerX(i) + 1} width={barW}
              y={Math.min(y(v), zeroY)} height={Math.abs(zeroY - y(v))}
              fill={COLORS.expense} rx="1" />
          ))}

          {/* Resultatlinje med punkter */}
          <polyline points={linePoints} fill="none" stroke={COLORS.result} strokeWidth="1.5" />
          {series.result.map((v, i) => (
            <circle key={`p${i}`} cx={centerX(i)} cy={y(v)} r="3.5"
              fill="#fff" stroke={COLORS.result} strokeWidth="1.5" />
          ))}

          {/* Månedsnavn */}
          {MONTHS.map((m, i) => (
            <text key={m} x={centerX(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#64748b">
              {m.slice(0, 3)}
            </text>
          ))}
        </svg>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <Legend color={COLORS.income} label="Inntekt" />
          <Legend color={COLORS.expense} label="Utgift" />
          <Legend color={COLORS.result} label="Resultat" line />
        </div>

        {managedExpenses > 0 && (
          <p className="text-xs text-slate-400">
            EKOM, hjemmekontor og avskrivninger er årsbeløp uten måned, og er derfor med i
            kostnadstallet over, men ikke i søylene. De utgjør {krInt(managedExpenses)} kr i {year}.
          </p>
        )}
      </div>
    </ModalShell>
  )
}

function Kpi({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold mt-0.5 tabular-nums ${tone}`}>{value}</p>
    </div>
  )
}

function Legend({ color, label, line }: { color: string; label: string; line?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block rounded-sm" style={line
        ? { width: 14, height: 2, background: color }
        : { width: 10, height: 10, background: color }} />
      {label}
    </span>
  )
}
