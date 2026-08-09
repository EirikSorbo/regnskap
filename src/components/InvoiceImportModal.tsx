import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { parseInvoiceCsv, type ParsedInvoices } from '../lib/invoices-csv'
import { importInvoices } from '../lib/invoice-import'
import type { Invoice } from '../lib/invoice'
import { kr } from '../lib/format'
import { ModalShell } from './Modal'
import { IconUpload } from './icons'

/** Import av fakturaer fra et tidligere system.
 *
 *  Det viktige valget her er årsgrensen: fakturaer eldre enn den legges inn som
 *  dokumentasjon uten å røre regnskapet, fordi de allerede er bokført et annet
 *  sted. Uten det skillet ville gamle beløp blitt talt en gang til. */
export function InvoiceImportModal({ existing, onClose }: { existing: Invoice[]; onClose: () => void }) {
  const { user } = useAuth()
  const { settings, updateSettings } = useSettings()
  const [parsed, setParsed] = useState<ParsedInvoices | null>(null)
  const [bookFromYear, setBookFromYear] = useState(new Date().getFullYear())
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setStatus('Leser fil...')
    try {
      const result = parseInvoiceCsv(await file.text())
      if (result.invoices.length === 0) { setStatus('Fant ingen fakturaer i fila.'); return }
      setParsed(result)
      setStatus('')
    } catch (err) {
      setStatus('Feil: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  async function execute() {
    if (!user || !parsed) return
    setBusy(true)
    try {
      const res = await importInvoices({
        uid: user.uid,
        parsed: parsed.invoices,
        existing,
        bookFromYear,
        updateSettings,
        currentNextNumber: settings.nextInvoiceNumber ?? 1,
        onProgress: (done, total) => setStatus(`Importerer ${done} av ${total} …`),
      })
      setStatus(
        `✓ ${res.added} fakturaer lagt inn`
        + (res.skipped > 0 ? `, ${res.skipped} fantes fra før` : '')
        + `. ${res.booked} ført som inntekt. Neste fakturanummer er nå ${res.nextInvoiceNumber}.`)
      setParsed(null)
    } catch (err) {
      setStatus('Feil: ' + (err instanceof Error ? err.message : String(err)))
    } finally { setBusy(false) }
  }

  const numbers = parsed?.invoices.map(i => i.number) ?? []
  const alreadyThere = parsed?.invoices.filter(i =>
    existing.some(e => e.number === i.number)).length ?? 0
  const willBook = parsed?.invoices.filter(i => Number(i.issueDate.slice(0, 4)) >= bookFromYear) ?? []
  const bookedTotal = willBook.reduce((s, i) => s + (i.kind === 'kreditnota' ? -i.total : i.total), 0)
  const creditNotes = parsed?.invoices.filter(i => i.kind === 'kreditnota').length ?? 0
  const years = parsed
    ? [...new Set(parsed.invoices.map(i => Number(i.issueDate.slice(0, 4))))].sort((a, b) => b - a)
    : []

  return (
    <ModalShell title="Importer fakturaer" onClose={onClose}
      footer={parsed ? (
        <div className="px-5 pb-5 pt-3 flex gap-2">
          <button onClick={() => setParsed(null)} className="flex-1 border border-slate-300 text-slate-700 text-sm py-2.5 rounded-lg hover:bg-slate-50">Avbryt</button>
          <button onClick={execute} disabled={busy || parsed.invoices.length === alreadyThere}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold py-2.5 rounded-lg">
            Importer
          </button>
        </div>
      ) : undefined}
    >
      <div className="px-5 py-4 space-y-3">
        {!parsed && (
          <>
            <p className="text-xs text-slate-500">
              Velg CSV-fila med fakturaer fra det gamle systemet. Årsprefikset i fakturanumrene fjernes,
              og kreditnotaer kobles til fakturaen de retter.
            </p>
            <label className="w-full flex items-center gap-2 text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer">
              <IconUpload />
              <span>Velg CSV-fil</span>
              <input type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={handleFile} />
            </label>
          </>
        )}

        {status && (
          <p className={`text-xs ${status.startsWith('✓') ? 'text-green-600' : status.startsWith('Feil') ? 'text-red-500' : 'text-slate-400'}`}>
            {status}
          </p>
        )}

        {parsed && (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm space-y-1">
              <p className="text-slate-700"><span className="font-semibold">{parsed.invoices.length}</span> fakturaer, nummer {Math.min(...numbers)}–{Math.max(...numbers)}</p>
              {creditNotes > 0 && <p className="text-xs text-slate-500">{creditNotes} av dem er kreditnotaer</p>}
              {alreadyThere > 0 && <p className="text-xs text-amber-600">{alreadyThere} har et nummer som finnes fra før og hoppes over</p>}
              {parsed.gaps.length > 0 && <p className="text-xs text-amber-600">Hull i nummerrekken: {parsed.gaps.slice(0, 10).join(', ')}{parsed.gaps.length > 10 ? ' …' : ''}</p>}
              {parsed.skippedRows > 0 && <p className="text-xs text-slate-500">{parsed.skippedRows} rader manglet nummer, dato eller kunde og hoppes over</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Før som inntekt fra og med år</label>
              <select value={bookFromYear} onChange={e => setBookFromYear(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
                <option value={Math.max(...years) + 1}>Ingen (bare dokumentasjon)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Eldre fakturaer legges inn som dokumentasjon uten å røre regnskapet, fordi de allerede er bokført i det gamle systemet.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 text-sm">
              <p className="text-slate-700">
                <span className="font-semibold">{willBook.length}</span> fakturaer føres som inntekt, til sammen <span className="font-semibold">{kr(bookedTotal)}</span>.
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {parsed.invoices.length - willBook.length} legges inn som historisk dokumentasjon.
              </p>
              {willBook.length > 0 && (
                <ul className="mt-2 space-y-0.5 max-h-32 overflow-y-auto">
                  {willBook.map(i => (
                    <li key={i.number} className="text-xs text-slate-500">
                      {i.kind === 'kreditnota' ? 'Kreditnota' : 'Faktura'} {i.number} · {i.issueDate} · {i.customer.name} · {i.kind === 'kreditnota' ? '−' : ''}{kr(i.total)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {parsed.ignoredColumns.length > 0 && (
              <p className="text-xs text-slate-400">Kolonner som ikke importeres: {parsed.ignoredColumns.join(', ')}.</p>
            )}
          </div>
        )}
      </div>
    </ModalShell>
  )
}
