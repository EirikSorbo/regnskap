import { useSettings } from '../context/SettingsContext'
import { useAccounting } from '../context/AccountingContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  type Entry, type ReceiptEntry, type DrivingEntry,
  CATEGORIES, SETTINGS_MANAGED_POSTS, entryAmount, calcEkom, postSums, getImagePaths,
} from '../types'
import { statusLabel } from '../lib/invoice'
import { incomeWithoutInvoice, invoiceNumberGaps, sumIncome } from '../lib/year-end'
import { kr2 as fmt, krInt as fmtInt, fmtDate, MONTHS, QUARTERS } from '../lib/format'
import { IconArrowLeft, IconPrint } from '../components/icons'
import { format } from 'date-fns'

/** Generate standardized attachment reference: Post XXXX – YYYY-MM-DD – NNN */
function attachmentRef(post: string, date: string, index: number, ext: string) {
  return `${post}-${date}-${String(index).padStart(3, '0')}.${ext}`
}

export default function ReportPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { settings } = useSettings()
  // Regnskapet kommer fra den felles tilstanden, ikke fra en egen henting. Før
  // hentet denne siden de samme dokumentene en gang til, og året ble lest rett
  // fra localStorage: to kilder til de samme tallene, som kunne sprike.
  const {
    entries, incomeEntries, invoices, loading: accLoading, error: accError,
    invoicesLoading: invLoading, invoicesError: invError, selectedYear,
  } = useAccounting()
  const year = parseInt(searchParams.get('year') || String(selectedYear))
  const ys = String(year)
  const ratePerKm = settings.drivingRatePerKm
  const ratePerPassengerKm = settings.drivingRatePerPassengerKm

  // EKOM data from Firestore settings
  const phoneMonths = settings.ekomPhone[ys] || Array(12).fill(0)
  const internetQuarters = settings.ekomInternet[ys] || Array(4).fill(0)
  const privateAmt = settings.ekomPrivateAmt
  const { totalPhone, totalInternet, totalGross, deduction: ekomDeduction, net: ekomNet } =
    calcEkom(phoneMonths, internetQuarters, privateAmt)

  const loading = accLoading || invLoading
  const error = accError

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Laster rapport...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center text-sm">
        <p className="text-red-500">Kunne ikke laste rapporten: {error}</p>
        <button onClick={() => navigate('/')} className="text-slate-500 underline">Tilbake</button>
      </div>
    )
  }

  const yearEntries = entries.filter(e => e.date.startsWith(String(year)))
  const yearIncome = incomeEntries.filter(e => e.date.startsWith(String(year)))
  const totalIncome = yearIncome.reduce((s, e) => s + e.amount, 0)

  // Fakturajournal: alt som er utstedt i året, i nummerrekkefølge. Kladder er
  // ikke bilag og hører ikke hjemme her.
  const todayIso = format(new Date(), 'yyyy-MM-dd')
  const yearInvoices = invoices
    .filter(i => i.issueDate?.startsWith(String(year)) && i.status !== 'kladd')
    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
  const invoicedTotal = yearInvoices
    .filter(i => !i.historical)
    .reduce((s, i) => s + (i.kind === 'kreditnota' ? -i.total : i.total), 0)
  const gapsInSeries = invoiceNumberGaps(yearInvoices)

  // Avstemming: inntekt som ikke har en faktura bak seg. Uten denne kunne
  // rapportens inntekt være høyere enn fakturajournalens sum, uten at noe på
  // arket forklarte forskjellen.
  const utenFaktura = incomeWithoutInvoice(yearIncome)
  const utenFakturaSum = sumIncome(utenFaktura)

  const getAmount = (entry: Entry) => entryAmount(entry, ratePerKm, ratePerPassengerKm)

  // Grupper per post i kontoplan-rekkefølge. Settings-styrte poster (EKOM/
  // hjemmekontor/avskrivninger) henter årsbeløpet fra innstillinger; resten
  // summeres fra kvitteringer. Delt med oversiktsmodalen på forsiden.
  const postGroups = postSums(settings.categories ?? CATEGORIES, yearEntries, settings, year, getAmount)
    .filter(g => g.managed ? g.sum !== 0 : g.entries.length > 0)

  const totalExpenses = postGroups.reduce((s, g) => s + g.sum, 0)
  const result = totalIncome - totalExpenses

  // Build attachment reference map: entryId -> [{ ref, originalPath }]
  let globalAttIdx = 1
  const attachmentMap = new Map<string, { ref: string; path: string }[]>()
  for (const group of postGroups) {
    for (const entry of group.entries) {
      if (entry.entryType !== 'receipt') continue
      const r = entry as ReceiptEntry
      const paths = getImagePaths(r)
      if (paths.length === 0) continue
      const refs = paths.map(p => {
        const ext = p.split('.').pop()?.toLowerCase() || 'jpg'
        const refName = attachmentRef(group.cat.post, entry.date, globalAttIdx++, ext)
        return { ref: refName, path: p }
      })
      attachmentMap.set(entry.id!, refs)
    }
  }

  return (
    <div className="report-page bg-white min-h-screen">
      {/* Screen-only toolbar */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
            <IconArrowLeft className="w-4 h-4" />
            Tilbake
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2">
              <IconPrint />
              Eksporter til PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 print:px-0 print:py-0 print:max-w-none">

        {/* === COVER PAGE === */}
        <div className="page-break-after">
          <div className="pt-24 pb-16 print:pt-40">
            <div className="border-t-4 border-slate-800 pt-8">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-[0.2em]">Resultatrapport</p>
              <h1 className="text-5xl font-bold text-slate-800 mt-3">Sørbø Musikk</h1>
              <p className="text-2xl text-slate-500 mt-2 font-light">Regnskapsår {year}</p>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8">
              <div className="border-t-2 border-slate-200 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inntekter</p>
                <p className="text-2xl font-bold text-slate-800 mt-1 tabular-nums">{fmtInt(totalIncome)} kr</p>
              </div>
              <div className="border-t-2 border-slate-200 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Driftskostnader</p>
                <p className="text-2xl font-bold text-slate-800 mt-1 tabular-nums">{fmtInt(totalExpenses)} kr</p>
              </div>
              <div className={`border-t-2 pt-4 ${result >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Driftsresultat</p>
                <p className={`text-2xl font-bold mt-1 tabular-nums ${result >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmtInt(result)} kr</p>
              </div>
            </div>

            {/* Summary table */}
            <div className="mt-16">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Oversikt per post</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 font-semibold text-slate-600">Post</th>
                    <th className="text-left py-2 font-semibold text-slate-600">Kategori</th>
                    <th className="text-right py-2 font-semibold text-slate-600">Antall</th>
                    <th className="text-right py-2 font-semibold text-slate-600">Beløp</th>
                  </tr>
                </thead>
                <tbody>
                  {totalIncome > 0 && (
                    <tr className="border-b border-slate-100">
                      <td className="py-2 font-mono text-slate-400">3000</td>
                      <td className="py-2 text-slate-700">Salgsinntekter</td>
                      <td className="py-2 text-right tabular-nums text-slate-500">{yearIncome.length}</td>
                      <td className="py-2 text-right tabular-nums font-medium text-green-700">{fmt(totalIncome)}</td>
                    </tr>
                  )}
                  {/* Inntekt uten faktura bak seg står oppført for seg, slik at
                      summen her og fakturajournalen nedenfor kan avstemmes mot
                      hverandre uten å regne i hodet. */}
                  {utenFakturaSum !== 0 && (
                    <tr className="border-b border-slate-100">
                      <td className="py-2"></td>
                      <td className="py-2 text-slate-500 pl-4">herav uten faktura</td>
                      <td className="py-2 text-right tabular-nums text-slate-500">{utenFaktura.length}</td>
                      <td className="py-2 text-right tabular-nums text-slate-500">{fmt(utenFakturaSum)}</td>
                    </tr>
                  )}
                  {postGroups.map(g => (
                    <tr key={g.cat.post} className="border-b border-slate-100">
                      <td className="py-2 font-mono text-slate-400">{g.cat.post}</td>
                      <td className="py-2 text-slate-700">{g.cat.label}</td>
                      <td className="py-2 text-right tabular-nums text-slate-500">{g.entries.length}</td>
                      <td className="py-2 text-right tabular-nums font-medium text-slate-800">{fmt(g.sum)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300">
                    <td colSpan={3} className="py-3 font-semibold text-slate-600">Sum driftskostnader</td>
                    <td className="py-3 text-right tabular-nums font-bold text-slate-800">{fmt(totalExpenses)}</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td colSpan={3} className="py-3 font-semibold text-slate-600">Driftsresultat</td>
                    <td className={`py-3 text-right tabular-nums font-bold ${result >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(result)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-12 text-xs text-slate-300">
              Generert {fmtDate(new Date().toISOString(), 'd. MMMM yyyy')} · Sørbø Musikk Regnskapsapp
            </div>
          </div>
        </div>

        {/* === POST DETAIL PAGES === */}
        {postGroups.map(group => {
          const isDriving = group.cat.post === '7080'
          const isEkom = group.cat.post === '7500'
          const isManaged = SETTINGS_MANAGED_POSTS.includes(group.cat.post)
          return (
            <div key={group.cat.post} className="page-break-after">
              <div className="pt-8 pb-8">
                {/* Post header */}
                <div className="border-t-4 border-slate-800 pt-6 mb-8">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.15em]">Post {group.cat.post}</p>
                      <h2 className="text-2xl font-bold text-slate-800 mt-1">{group.cat.label}</h2>
                    </div>
                    <div className="text-right">
                      {!isManaged && <p className="text-xs text-slate-400">{group.entries.length} oppføring{group.entries.length !== 1 ? 'er' : ''}</p>}
                      <p className="text-xl font-bold text-slate-800 tabular-nums mt-0.5">{fmt(group.sum)} kr</p>
                    </div>
                  </div>
                </div>

                {/* EKOM detail */}
                {isEkom ? (
                  <>
                    {/* Phone per month */}
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Telefon — månedlige kostnader</h3>
                    <table className="w-full text-sm mb-6">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-2 font-semibold text-slate-600">Måned</th>
                          <th className="text-right py-2 font-semibold text-slate-600">Beløp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MONTHS.map((m, i) => (
                          <tr key={i} className={`border-b border-slate-100 ${phoneMonths[i] === 0 ? 'opacity-30' : ''}`}>
                            <td className="py-1.5 text-slate-700">{m}</td>
                            <td className="py-1.5 text-right tabular-nums text-slate-800">{fmt(phoneMonths[i] || 0)} kr</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-300">
                          <td className="py-2 font-semibold text-slate-600">Sum telefon</td>
                          <td className="py-2 text-right tabular-nums font-bold text-slate-800">{fmt(totalPhone)} kr</td>
                        </tr>
                      </tfoot>
                    </table>

                    {/* Internet per quarter */}
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Internett — kvartalsvise kostnader</h3>
                    <table className="w-full text-sm mb-6">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-2 font-semibold text-slate-600">Kvartal</th>
                          <th className="text-right py-2 font-semibold text-slate-600">Beløp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {QUARTERS.map((q, i) => (
                          <tr key={i} className={`border-b border-slate-100 ${internetQuarters[i] === 0 ? 'opacity-30' : ''}`}>
                            <td className="py-1.5 text-slate-700">{q}</td>
                            <td className="py-1.5 text-right tabular-nums text-slate-800">{fmt(internetQuarters[i] || 0)} kr</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-300">
                          <td className="py-2 font-semibold text-slate-600">Sum internett</td>
                          <td className="py-2 text-right tabular-nums font-bold text-slate-800">{fmt(totalInternet)} kr</td>
                        </tr>
                      </tfoot>
                    </table>

                    {/* EKOM summary */}
                    <div className="bg-slate-50 rounded-lg px-5 py-4 text-sm space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sum telefon + internett</span>
                        <span className="tabular-nums font-medium text-slate-800">{fmt(totalGross)} kr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Privatandel (fratrekk)</span>
                        <span className="tabular-nums font-medium text-red-600">−{fmt(ekomDeduction)} kr</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5">
                        <span className="font-semibold text-slate-700">Fradrag post 7500</span>
                        <span className="tabular-nums font-bold text-slate-800">{fmt(ekomNet)} kr</span>
                      </div>
                    </div>
                  </>
                ) : isDriving ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-2 font-semibold text-slate-600">#</th>
                        <th className="text-left py-2 font-semibold text-slate-600">Dato</th>
                        <th className="text-left py-2 font-semibold text-slate-600">Strekning</th>
                        <th className="text-left py-2 font-semibold text-slate-600">Beskrivelse</th>
                        <th className="text-right py-2 font-semibold text-slate-600">Km</th>
                        <th className="text-right py-2 font-semibold text-slate-600">Beløp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.entries.map((entry, i) => {
                        const d = entry as DrivingEntry
                        const totalKm = d.tripType === 'return' ? d.distance * 2 : d.distance
                        return (
                          <tr key={entry.id} className="border-b border-slate-100">
                            <td className="py-2 text-slate-400 tabular-nums">{i + 1}</td>
                            <td className="py-2 text-slate-600 tabular-nums">{fmtDate(entry.date, 'dd.MM.yyyy')}</td>
                            <td className="py-2 text-slate-700">{d.from} → {d.to}{d.tripType === 'return' ? ' (t/r)' : ''}</td>
                            <td className="py-2 text-slate-500">{entry.description || '—'}</td>
                            <td className="py-2 text-right tabular-nums text-slate-600">{fmtInt(totalKm)}</td>
                            <td className="py-2 text-right tabular-nums font-medium text-slate-800">{fmt(getAmount(entry))}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300">
                        <td colSpan={4} className="py-3 font-semibold text-slate-600">Sum {group.cat.label.toLowerCase()}</td>
                        <td className="py-3 text-right tabular-nums font-semibold text-slate-600">
                          {fmtInt(group.entries.reduce((s, e) => {
                            const d = e as DrivingEntry
                            return s + (d.tripType === 'return' ? d.distance * 2 : d.distance)
                          }, 0))}
                        </td>
                        <td className="py-3 text-right tabular-nums font-bold text-slate-800">{fmt(group.sum)}</td>
                      </tr>
                    </tfoot>
                  </table>
                ) : isManaged ? (
                  <p className="text-sm text-slate-500">Beregnet automatisk fra innstillinger (se {group.cat.label.toLowerCase()} i appen).</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-2 font-semibold text-slate-600">#</th>
                        <th className="text-left py-2 font-semibold text-slate-600">Dato</th>
                        <th className="text-left py-2 font-semibold text-slate-600">Beskrivelse</th>
                        <th className="text-left py-2 font-semibold text-slate-600">Vedlegg</th>
                        <th className="text-right py-2 font-semibold text-slate-600">Beløp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.entries.map((entry, i) => {
                        const r = entry as ReceiptEntry
                        const refs = attachmentMap.get(entry.id!) || []
                        return (
                          <tr key={entry.id} className="border-b border-slate-100">
                            <td className="py-2 text-slate-400 tabular-nums">{i + 1}</td>
                            <td className="py-2 text-slate-600 tabular-nums whitespace-nowrap">{fmtDate(entry.date, 'dd.MM.yyyy')}</td>
                            <td className="py-2 text-slate-700">{entry.description || '—'}</td>
                            <td className="py-2 text-slate-400 text-xs">
                              {refs.length > 0
                                ? refs.map(a => a.ref).join(', ')
                                : <span className="text-slate-300">—</span>
                              }
                            </td>
                            <td className="py-2 text-right tabular-nums font-medium text-slate-800">{fmt(r.amount)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300">
                        <td colSpan={4} className="py-3 font-semibold text-slate-600">Sum {group.cat.label.toLowerCase()}</td>
                        <td className="py-3 text-right tabular-nums font-bold text-slate-800">{fmt(group.sum)}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                {/* Driving rate footnote */}
                {isDriving && (
                  <p className="text-xs text-slate-400 mt-4">
                    Sats: {ratePerKm.toFixed(2)} kr/km · Passasjertillegg: {ratePerPassengerKm.toFixed(2)} kr/km
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {/* === ATTACHMENT INDEX === */}
        {attachmentMap.size > 0 && (
          <div className="page-break-after">
            <div className="pt-8 pb-8">
              <div className="border-t-4 border-slate-800 pt-6 mb-8">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.15em]">Vedleggsregister</p>
                <h2 className="text-2xl font-bold text-slate-800 mt-1">Vedlegg</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 font-semibold text-slate-600">Referanse</th>
                    <th className="text-left py-2 font-semibold text-slate-600">Post</th>
                    <th className="text-left py-2 font-semibold text-slate-600">Dato</th>
                    <th className="text-left py-2 font-semibold text-slate-600">Beskrivelse</th>
                  </tr>
                </thead>
                <tbody>
                  {postGroups.flatMap(g =>
                    g.entries.flatMap(entry => {
                      const refs = attachmentMap.get(entry.id!) || []
                      return refs.map((a, i) => (
                        <tr key={`${entry.id}-${i}`} className="border-b border-slate-100">
                          <td className="py-1.5 font-mono text-xs text-slate-600">{a.ref}</td>
                          <td className="py-1.5 text-slate-500">{g.cat.post}</td>
                          <td className="py-1.5 text-slate-500 tabular-nums">{fmtDate(entry.date, 'dd.MM.yyyy')}</td>
                          <td className="py-1.5 text-slate-500">{entry.description || g.cat.label}</td>
                        </tr>
                      ))
                    })
                  )}
                </tbody>
              </table>
              <p className="text-xs text-slate-300 mt-6">
                Totalt {Array.from(attachmentMap.values()).reduce((s, a) => s + a.length, 0)} vedlegg
              </p>
            </div>
          </div>
        )}

        {/* Uten denne ser en journal som ikke lot seg lese helt lik ut som et år
            uten fakturaer. */}
        {invError && (
          <p className="print:hidden max-w-4xl mx-auto text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 my-6">
            {invError} Fakturajournalen mangler derfor i rapporten.
          </p>
        )}

        {/* === FAKTURAJOURNAL === */}
        {yearInvoices.length > 0 && (
          <div className="page-break-after">
            <div className="pt-8 pb-8">
              <div className="border-t-4 border-slate-800 pt-6 mb-8">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.15em]">Salgsdokumentasjon</p>
                <h2 className="text-2xl font-bold text-slate-800 mt-1">Fakturajournal {year}</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 font-semibold text-slate-600">Nr.</th>
                    <th className="text-left py-2 font-semibold text-slate-600">Dato</th>
                    <th className="text-left py-2 font-semibold text-slate-600">Kunde</th>
                    <th className="text-left py-2 font-semibold text-slate-600">Status</th>
                    <th className="text-right py-2 font-semibold text-slate-600">Beløp</th>
                  </tr>
                </thead>
                <tbody>
                  {yearInvoices.map(inv => (
                    <tr key={inv.id} className="border-b border-slate-100">
                      <td className="py-2 font-mono text-slate-500 tabular-nums">{inv.number ?? '—'}</td>
                      <td className="py-2 text-slate-600 tabular-nums whitespace-nowrap">{fmtDate(inv.issueDate, 'dd.MM.yyyy')}</td>
                      <td className="py-2 text-slate-700">{inv.customer?.name}</td>
                      <td className="py-2 text-slate-500">{statusLabel(inv, todayIso)}</td>
                      <td className="py-2 text-right tabular-nums font-medium text-slate-800">
                        {inv.kind === 'kreditnota' ? `−${fmt(inv.total)}` : fmt(inv.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300">
                    <td colSpan={4} className="py-3 font-semibold text-slate-600">Sum fakturert {year}</td>
                    <td className="py-3 text-right tabular-nums font-bold text-slate-800">{fmt(invoicedTotal)}</td>
                  </tr>
                </tfoot>
              </table>
              {gapsInSeries.length > 0 && (
                <p className="text-xs text-amber-700 mt-4">
                  Merk: nummerrekken har hull ved {gapsInSeries.join(', ')}. Fakturaer kan være utstedt i et annet år.
                </p>
              )}
              {utenFakturaSum !== 0 && (
                <p className="text-xs text-slate-500 mt-4">
                  Avstemming: årets inntekt er {fmt(totalIncome)} kr, hvorav {fmt(invoicedTotal)} kr
                  kommer fra fakturaene over og {fmt(utenFakturaSum)} kr er ført uten faktura.
                </p>
              )}
              <p className="text-xs text-slate-300 mt-6">
                Fakturaene er ført som inntekt på fakturadatoen. Kladder har ikke nummer og er ikke ført.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
