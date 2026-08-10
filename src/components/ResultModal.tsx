import { type PostGroup, taxPaidSummary } from '../types'
import { krInt } from '../lib/format'
import { ModalShell } from './Modal'
import { IconX } from './icons'

/** Resultatoppstillingen for året, slik den ser ut i Altinn: inntekt, hver post,
 *  og driftsresultatet nederst. */
export function ResultModal({ year, groups, totalIncome, totalExpenses, entryCount, tripCount, totalKm, taxPaidTerms, incomeDerived, onClose }: {
  year: number
  groups: PostGroup[]
  totalIncome: number
  totalExpenses: number
  entryCount: number
  tripCount: number
  totalKm: number
  /** Innbetalt forskuddsskatt per termin for året, hvis noe er registrert. */
  taxPaidTerms?: number[]
  /** Sann når årets inntekt er utledet fra fakturaene framfor ført som egne
   *  rader. Da bør det stå, så tallet ikke ser ut som et bilag det ikke er. */
  incomeDerived?: boolean
  onClose: () => void
}) {
  const result = totalIncome - totalExpenses
  const { paid, rate } = taxPaidSummary(taxPaidTerms, result)
  const active = groups.filter(g => g.sum > 0)
  const topCost = active.length > 0 ? active.reduce((a, b) => a.sum > b.sum ? a : b) : null

  return (
    <ModalShell
      onClose={onClose}
      overlayClass="bg-black/50 backdrop-blur-sm"
      header={
        <div className="bg-slate-800 text-white px-6 py-5 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Resultatrapport</p>
              <h2 className="text-xl font-bold mt-0.5">Sørbø Musikk — {year}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition"><IconX /></button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-px bg-slate-100">
        <Kpi label="Inntekter" value={krInt(totalIncome)} />
        <Kpi label="Utgifter" value={krInt(totalExpenses)} />
        <Kpi label="Resultat" value={krInt(result)} tone={result >= 0 ? 'text-green-600' : 'text-red-600'} />
      </div>

      <div className="px-6 py-4 bg-slate-50 border-y border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{entryCount} oppføringer</span>
        <span>{tripCount} kjøreturer · {totalKm.toLocaleString('nb-NO')} km</span>
        {topCost && <span>Største post: {topCost.cat.label}</span>}
      </div>

      <div className="px-6 pt-5 pb-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Inntekter</p>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-slate-300">3000</span>
            <span className="text-sm text-slate-700">Salgsinntekter</span>
          </div>
          <span className={`text-sm font-semibold tabular-nums ${totalIncome > 0 ? 'text-green-600' : 'text-slate-300'}`}>
            {krInt(totalIncome)} kr
          </span>
        </div>
        {incomeDerived && (
          <p className="text-[11px] text-slate-400 mt-1">
            Regnet ut fra fakturaene for {year}. Året har ingen egne inntektsføringer.
          </p>
        )}
      </div>

      <div className="mx-6 border-t border-slate-100" />

      <div className="px-6 pt-4 pb-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Driftskostnader</p>
        <div className="space-y-0.5">
          {groups.map(g => (
            <div key={g.cat.post} className={`flex items-center justify-between py-1.5 ${g.sum === 0 ? 'opacity-30' : ''}`}>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-slate-300">{g.cat.post}</span>
                <span className="text-sm text-slate-700">{g.cat.label}</span>
              </div>
              <span className={`text-sm tabular-nums ${g.sum > 0 ? 'font-semibold text-slate-700' : 'text-slate-300'}`}>
                {krInt(g.sum)} kr
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between py-2.5 mt-2 border-t border-slate-200">
          <span className="text-sm font-semibold text-slate-600">Sum driftskostnader</span>
          <span className="text-sm font-bold tabular-nums text-slate-800">{krInt(totalExpenses)} kr</span>
        </div>
      </div>

      <div className={`mx-4 mb-4 rounded-xl px-5 py-4 ${result >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Driftsresultat {year}</p>
            {totalIncome > 0 && (
              <p className="text-[11px] text-slate-400 mt-0.5">Margin: {(result / totalIncome * 100).toFixed(0)} %</p>
            )}
          </div>
          <span className={`text-2xl font-bold tabular-nums ${result >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {krInt(result)} kr
          </span>
        </div>
      </div>

      {/* Forskuddsskatten står utenfor driftsresultatet, med en strek imellom:
          den er ikke en kostnad i foretaket og skal ikke leses som en del av
          regnskapet. Linja måler bare hvor stor andel av det du har tjent som
          allerede er innbetalt, og sier ingenting om hva du skylder. */}
      {paid > 0 && (
        <div className="mx-4 mb-4 rounded-xl border border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Forskuddsskatt {year}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {krInt(paid)} kr innbetalt
                {rate === null && `. Resultatet er ikke positivt, så andelen kan ikke regnes ut.`}
              </p>
            </div>
            {rate !== null && (
              <span className="text-2xl font-bold tabular-nums text-slate-700">
                {(rate * 100).toFixed(1).replace('.', ',')} %
              </span>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  )
}

function Kpi({ label, value, tone = 'text-slate-800' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-white px-4 py-4 text-center">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold mt-1 tabular-nums ${tone}`}>{value}</p>
    </div>
  )
}
