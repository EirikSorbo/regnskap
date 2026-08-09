import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import {
  type Invoice, lineTotal, addressLines, statusLabel, canEdit, canDelete, canCredit,
} from '../lib/invoice'
import { issueInvoice, markPaid, markUnpaid, deleteDraft, createCreditNote } from '../lib/invoice-store'
import { kr } from '../lib/format'
import { IconArrowLeft, IconPrint } from '../components/icons'
import { Logo } from '../components/Logo'

/** Selve fakturaen, i utskriftsvennlig form. «Last ned PDF» åpner utskrifts-
 *  dialogen, samme mønster som årsrapporten: velg «Lagre som PDF» der. */
export default function InvoiceViewPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const { id } = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    if (!id) return
    return onSnapshot(doc(db, 'invoices', id), snap => {
      if (!snap.exists()) { navigate('/fakturaer'); return }
      setInvoice({ id, ...snap.data() } as Invoice)
      setLoading(false)
    }, err => {
      setError('Kunne ikke laste fakturaen: ' + err.message)
      setLoading(false)
    })
  }, [id, navigate])

  async function run(fn: () => Promise<void>) {
    setBusy(true); setError('')
    try { await fn() }
    catch (err) { setError(err instanceof Error ? err.message : String(err)) }
    finally { setBusy(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Laster...</div>
  if (!invoice) return null

  const company = settings.company ?? {}
  const isCredit = invoice.kind === 'kreditnota'
  const title = isCredit ? 'Kreditnota' : 'Faktura'
  const missingCompany = !company.name?.trim() || !company.orgNumber?.trim()

  return (
    <div className="report-page bg-white min-h-screen">
      {/* Verktøylinje, kun på skjerm */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <button onClick={() => navigate('/fakturaer')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
            <IconArrowLeft className="w-4 h-4" /> Tilbake
          </button>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {canEdit(invoice) && (
              <button onClick={() => navigate(`/faktura/${invoice.id}/rediger`)}
                className="text-sm text-slate-700 border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50">Rediger</button>
            )}
            {invoice.status === 'kladd' && (
              <button onClick={() => run(async () => { await issueInvoice(user!.uid, invoice.id!) })} disabled={busy}
                className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-2 rounded-lg">
                Utsted
              </button>
            )}
            {invoice.status === 'utstedt' && (
              <button onClick={() => run(() => markPaid(invoice.id!, today))} disabled={busy}
                className="text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg">
                Marker betalt
              </button>
            )}
            {invoice.status === 'betalt' && (
              <button onClick={() => run(() => markUnpaid(invoice.id!))} disabled={busy}
                className="text-sm text-slate-700 border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50">
                Angre betalt
              </button>
            )}
            {canCredit(invoice) && (
              <button onClick={() => run(async () => {
                const newId = await createCreditNote(user!.uid, invoice, today)
                navigate(`/faktura/${newId}/rediger`)
              })} disabled={busy}
                className="text-sm text-amber-700 border border-amber-300 px-3 py-2 rounded-lg hover:bg-amber-50">
                Kreditnota
              </button>
            )}
            {canDelete(invoice) && (
              <button onClick={() => run(async () => {
                if (!confirm('Slett kladden?')) return
                await deleteDraft(invoice.id!)
                navigate('/fakturaer')
              })} disabled={busy}
                className="text-sm text-red-600 border border-red-300 px-3 py-2 rounded-lg hover:bg-red-50">Slett</button>
            )}
            <button onClick={() => window.print()}
              className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
              <IconPrint /> Last ned PDF
            </button>
          </div>
        </div>
      </div>

      <div className="print:hidden max-w-3xl mx-auto px-6 pt-4 space-y-2">
        {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded p-2">{error}</p>}
        {invoice.status === 'kladd' && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Dette er en kladd. Den har ikke fakturanummer og er ikke ført som inntekt ennå.
          </p>
        )}
        {missingCompany && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Foretaksnavn og organisasjonsnummer mangler. En salgsfaktura skal ha begge.
            Fyll dem inn under Innstillinger → Foretaksopplysninger før du sender denne.
          </p>
        )}
        {invoice.historical && (
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
            Importert fra et tidligere system. Den er ikke ført som inntekt her, fordi beløpet allerede er bokført der.
          </p>
        )}
      </div>

      {/* Selve fakturaen */}
      <div className="invoice-sheet max-w-3xl mx-auto px-8 py-10 print:px-0 print:py-0 print:max-w-none">
        <div className="flex items-start justify-between border-t-4 border-slate-800 pt-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">{title}</p>
            <h1 className="text-3xl font-bold text-slate-800 mt-1">
              {invoice.number ? `${title} ${invoice.number}` : 'Uten nummer (kladd)'}
            </h1>
            <p className="text-sm text-slate-500 mt-1 print:hidden">Status: {statusLabel(invoice, today)}</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-semibold text-slate-800">{company.name || 'Foretaksnavn mangler'}</p>
            {company.address && <p>{company.address}</p>}
            {(company.postalCode || company.city) && <p>{[company.postalCode, company.city].filter(Boolean).join(' ')}</p>}
            {company.orgNumber && <p className="mt-1">Org.nr. {company.orgNumber}</p>}
            {company.email && <p>{company.email}</p>}
            {company.phone && <p>{company.phone}</p>}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Faktureres til</p>
            <p className="text-sm font-semibold text-slate-800">{invoice.customer.name}</p>
            {addressLines(invoice.customer).map((l, i) => <p key={i} className="text-sm text-slate-600">{l}</p>)}
            {invoice.customer.orgNumber && <p className="text-sm text-slate-500 mt-1">Org.nr. {invoice.customer.orgNumber}</p>}
          </div>
          <div className="text-sm">
            <Row label={isCredit ? 'Kreditnotadato' : 'Fakturadato'} value={fmtDate(invoice.issueDate)} />
            {!isCredit && <Row label="Forfallsdato" value={fmtDate(invoice.dueDate)} />}
            {invoice.paidDate && <Row label="Betalt" value={fmtDate(invoice.paidDate)} />}
            {company.bankAccount && <Row label="Kontonummer" value={company.bankAccount} />}
          </div>
        </div>

        <table className="w-full text-sm mt-16">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-3 font-semibold text-slate-600">Beskrivelse</th>
              <th className="text-right py-3 font-semibold text-slate-600 w-20">Antall</th>
              <th className="text-right py-3 font-semibold text-slate-600 w-28">Pris</th>
              <th className="text-right py-3 font-semibold text-slate-600 w-32">Sum</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((l, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-3 text-slate-700">{l.description}</td>
                <td className="py-3 text-right tabular-nums text-slate-600">{l.quantity}</td>
                <td className="py-3 text-right tabular-nums text-slate-600">{kr(l.unitPrice)}</td>
                <td className="py-3 text-right tabular-nums font-medium text-slate-800">{kr(lineTotal(l))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300">
              <td colSpan={3} className="py-4 font-semibold text-slate-600">{isCredit ? 'Å godskrive' : 'Å betale'}</td>
              <td className="py-4 text-right tabular-nums font-bold text-slate-800 text-lg">{kr(invoice.total)}</td>
            </tr>
          </tfoot>
        </table>

        {invoice.note && <p className="text-sm text-slate-600 mt-8">{invoice.note}</p>}

        {/* Bunnfeltet skyves ned til bunnen av arket ved utskrift, se
            .invoice-footer i index.css. Logoen står diskret til venstre, i
            samme dempede tone som resten av småteksten. */}
        <div className="invoice-footer mt-16 pt-5 border-t border-slate-200 flex items-end justify-between gap-6">
          <Logo className="w-12 h-12 text-slate-400 shrink-0" />
          <div className="text-xs text-slate-500 space-y-1 text-right">
            {!isCredit && company.bankAccount && (
              <p>Betales til konto {company.bankAccount} innen {fmtDate(invoice.dueDate)}.</p>
            )}
            {isCredit && invoice.creditsInvoiceId && <p>Denne kreditnotaen gjelder en tidligere utstedt faktura.</p>}
            {company.name && <p>{company.name}{company.orgNumber ? ` · Org.nr. ${company.orgNumber}` : ''}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-slate-100">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium tabular-nums">{value}</span>
    </div>
  )
}

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : format(d, 'd. MMMM yyyy', { locale: nb })
}
