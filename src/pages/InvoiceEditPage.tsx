import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { format } from 'date-fns'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { useCustomers } from '../hooks/useInvoices'
import {
  type Invoice, type InvoiceCustomer, type InvoiceLine,
  lineTotal, invoiceTotal, addDays, validateForIssue, canEdit, DEFAULT_PAYMENT_TERMS_DAYS,
} from '../lib/invoice'
import { createDraft, updateDraft, issueInvoice } from '../lib/invoice-store'
import { addCustomer } from '../lib/customers'
import { krExact } from '../lib/format'
import { CustomerFields } from '../components/CustomerFields'
import { IconArrowLeft, IconPlus, IconTrash } from '../components/icons'

const inp = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const EMPTY_LINE: InvoiceLine = { description: '', quantity: 1, unitPrice: 0 }

/** Skjemaet for en fakturakladd. Utstedte fakturaer kommer aldri hit: de kan
 *  ikke redigeres, og siden sender deg videre til visningen hvis du prøver. */
export default function InvoiceEditPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const { id } = useParams()
  const { customers } = useCustomers(user)

  const [customer, setCustomer] = useState<InvoiceCustomer>({ name: '' })
  const [saveToRegister, setSaveToRegister] = useState(true)
  const [lines, setLines] = useState<InvoiceLine[]>([{ ...EMPTY_LINE }])
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const termsDays = settings.paymentTermsDays ?? DEFAULT_PAYMENT_TERMS_DAYS
  const effectiveDue = dueDate || addDays(issueDate, termsDays)
  const total = invoiceTotal(lines)
  const problems = validateForIssue({ customer, lines, issueDate })

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'invoices', id)).then(snap => {
      if (!snap.exists()) { navigate('/fakturaer'); return }
      const inv = { id, ...snap.data() } as Invoice
      if (!canEdit(inv)) { navigate(`/faktura/${id}`, { replace: true }); return }
      setCustomer(inv.customer)
      setSaveToRegister(false)
      setLines(inv.lines.length ? inv.lines : [{ ...EMPTY_LINE }])
      setIssueDate(inv.issueDate)
      setDueDate(inv.dueDate)
      setNote(inv.note ?? '')
      setLoading(false)
    }).catch(err => {
      setError('Kunne ikke laste fakturaen: ' + (err instanceof Error ? err.message : String(err)))
      setLoading(false)
    })
  }, [id, navigate])

  function setLine(i: number, patch: Partial<InvoiceLine>) {
    setLines(ls => ls.map((l, j) => j === i ? { ...l, ...patch } : l))
  }

  /** Lagrer kladden og returnerer id-en, slik at «utsted» kan bygge videre på
   *  den uten å lagre to ganger. */
  async function persist(): Promise<string | null> {
    if (!user) return null
    const input = { customer, lines, issueDate, dueDate: effectiveDue, note }
    if (saveToRegister && customer.name.trim()) {
      const exists = customers.some(c =>
        c.name.trim().toLowerCase() === customer.name.trim().toLowerCase()
        && (c.postalCode ?? '') === (customer.postalCode ?? ''))
      if (!exists) await addCustomer(user.uid, customer)
    }
    if (id) { await updateDraft(user.uid, id, input); return id }
    return await createDraft(user.uid, input)
  }

  async function handleSaveDraft() {
    setSaving(true); setError('')
    try {
      const newId = await persist()
      if (newId) navigate(`/faktura/${newId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally { setSaving(false) }
  }

  async function handleIssue() {
    if (!user) return
    if (problems.length > 0) { setError(problems.join(' ')); return }
    if (!confirm(`Utsted fakturaen på ${krExact(total)}?\n\nDen får et fakturanummer, kan ikke redigeres etterpå, og føres som inntekt på ${issueDate}.`)) return
    setSaving(true); setError('')
    try {
      const invoiceId = await persist()
      if (!invoiceId) return
      await issueInvoice(user.uid, invoiceId)
      navigate(`/faktura/${invoiceId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally { setSaving(false) }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Laster...</div>
  }

  return (
    <>
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/fakturaer')} title="Tilbake til fakturaene"
            className="text-slate-500 hover:text-slate-800 p-1 -ml-1 rounded-lg hover:bg-slate-100 transition">
            <IconArrowLeft />
          </button>
          <h2 className="text-lg font-semibold text-slate-800">{id ? 'Rediger kladd' : 'Ny faktura'}</h2>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Kunde</h2>
          <CustomerFields value={customer} onChange={setCustomer} customers={customers}
            saveToRegister={saveToRegister} onToggleSave={setSaveToRegister} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Linjer</h2>
          <div className="space-y-3">
            {lines.map((l, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <input value={l.description} onChange={e => setLine(i, { description: e.target.value })}
                    className={`flex-1 ${inp}`} placeholder="Beskrivelse (f.eks. konsert 12. mai)" />
                  <button type="button" onClick={() => setLines(ls => ls.filter((_, j) => j !== i))}
                    disabled={lines.length === 1} title="Fjern linje"
                    className="text-slate-300 hover:text-red-400 disabled:opacity-30 p-2 shrink-0"><IconTrash /></button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20">
                    <label className="block text-xs text-slate-400 mb-0.5">Antall</label>
                    <input type="number" value={l.quantity} onChange={e => setLine(i, { quantity: parseFloat(e.target.value) || 0 })}
                      min="0" step="0.5" className={inp} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-0.5">Pris</label>
                    <input type="number" value={l.unitPrice} onChange={e => setLine(i, { unitPrice: parseFloat(e.target.value) || 0 })}
                      min="0" step="0.01" className={inp} />
                  </div>
                  <div className="text-right shrink-0">
                    <label className="block text-xs text-slate-400 mb-0.5">Sum</label>
                    <p className="text-sm font-semibold text-slate-800 py-2">{krExact(lineTotal(l))}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setLines(ls => [...ls, { ...EMPTY_LINE }])}
            className="mt-2 w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg py-2.5 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500 transition">
            <IconPlus /> Legg til linje
          </button>
          <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-slate-200">
            <span className="text-sm font-semibold text-slate-600">Total</span>
            <span className="text-xl font-bold text-slate-800">{krExact(total)}</span>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">Datoer</h2>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Fakturadato (styrer hvilket år inntekten føres på)</label>
            <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Forfallsdato</label>
            <input type="date" value={effectiveDue} onChange={e => setDueDate(e.target.value)} className={inp} />
            {!dueDate && <p className="text-xs text-slate-400 mt-1">Satt automatisk til {termsDays} dager etter fakturadato.</p>}
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Merknad på fakturaen (valgfritt)</label>
            <input value={note} onChange={e => setNote(e.target.value)} className={inp} placeholder="F.eks. avtalt honorar" />
          </div>
        </section>

        {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded p-2">{error}</p>}

        {problems.length > 0 && (
          <ul className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
            {problems.map(p => <li key={p}>{p}</li>)}
          </ul>
        )}

        <div className="flex gap-2">
          <button onClick={handleSaveDraft} disabled={saving}
            className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl transition text-sm hover:bg-white disabled:opacity-50">
            {saving ? 'Lagrer...' : 'Lagre kladd'}
          </button>
          <button onClick={handleIssue} disabled={saving || problems.length > 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition text-sm">
            Utsted faktura
          </button>
        </div>
      </div>
    </>
  )
}
