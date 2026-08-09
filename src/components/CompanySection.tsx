import { useState } from 'react'
import { useSettings, type CompanyInfo } from '../context/SettingsContext'
import { DEFAULT_PAYMENT_TERMS_DAYS } from '../lib/invoice'

const inp = 'w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

/** Avsenderopplysningene som står øverst på fakturaen, pluss nummerserien.
 *  Ingen MVA-felter: foretaket er ikke registrert i Merverdiavgiftsregisteret. */
export function CompanySection() {
  const { settings, updateSettings } = useSettings()
  const [draft, setDraft] = useState<CompanyInfo>(settings.company ?? {})
  const [nextNumber, setNextNumber] = useState(String(settings.nextInvoiceNumber ?? 1))
  const [terms, setTerms] = useState(String(settings.paymentTermsDays ?? DEFAULT_PAYMENT_TERMS_DAYS))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const set = (patch: Partial<CompanyInfo>) => setDraft(d => ({ ...d, ...patch }))
  const storedNumber = settings.nextInvoiceNumber ?? 1
  const parsedNumber = parseInt(nextNumber, 10)
  const lowering = Number.isFinite(parsedNumber) && parsedNumber < storedNumber

  async function save() {
    if (lowering && !confirm(
      `Du setter neste fakturanummer ned fra ${storedNumber} til ${parsedNumber}.\n\n` +
      'Da kan du få to fakturaer med samme nummer. Er du sikker?')) return
    setSaving(true)
    try {
      await updateSettings({
        company: draft,
        nextInvoiceNumber: Number.isFinite(parsedNumber) && parsedNumber >= 1 ? parsedNumber : 1,
        paymentTermsDays: Math.max(0, parseInt(terms, 10) || DEFAULT_PAYMENT_TERMS_DAYS),
      })
      setMsg('Lagret ✓'); setTimeout(() => setMsg(''), 2000)
    } catch (e) {
      setMsg('Feil: ' + (e instanceof Error ? e.message : String(e)))
    } finally { setSaving(false) }
  }

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs text-slate-400">Dette står øverst på fakturaene dine.</p>
      <input value={draft.name ?? ''} onChange={e => set({ name: e.target.value })} placeholder="Foretaksnavn" className={inp} />
      <input value={draft.orgNumber ?? ''} onChange={e => set({ orgNumber: e.target.value })} placeholder="Organisasjonsnummer" inputMode="numeric" className={inp} />
      <input value={draft.address ?? ''} onChange={e => set({ address: e.target.value })} placeholder="Adresse" className={inp} />
      <div className="flex gap-2">
        <input value={draft.postalCode ?? ''} onChange={e => set({ postalCode: e.target.value })} placeholder="Postnr" inputMode="numeric" className={`w-20 ${inp}`} />
        <input value={draft.city ?? ''} onChange={e => set({ city: e.target.value })} placeholder="Sted" className={`flex-1 ${inp}`} />
      </div>
      <input value={draft.email ?? ''} onChange={e => set({ email: e.target.value })} placeholder="E-post" type="email" className={inp} />
      <input value={draft.phone ?? ''} onChange={e => set({ phone: e.target.value })} placeholder="Telefon" className={inp} />
      <input value={draft.bankAccount ?? ''} onChange={e => set({ bankAccount: e.target.value })} placeholder="Kontonummer" inputMode="numeric" className={inp} />

      <div className="border-t border-slate-100 pt-2 space-y-2">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Neste fakturanummer</label>
          <input value={nextNumber} onChange={e => setNextNumber(e.target.value)} inputMode="numeric" className={inp} />
          <p className="text-xs text-slate-400 mt-1">
            Kommer du fra et annet system, sett dette over det høyeste nummeret du brukte der. Nummeret tildeles først når en faktura utstedes.
          </p>
          {lowering && (
            <p className="text-xs text-red-500 mt-1">Lavere enn dagens {storedNumber}. Det kan gi to fakturaer med samme nummer.</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Betalingsfrist (dager)</label>
          <input value={terms} onChange={e => setTerms(e.target.value)} inputMode="numeric" className={inp} />
        </div>
      </div>

      {msg && <p className={`text-xs ${msg.startsWith('Feil') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
      <button onClick={save} disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm py-2 rounded-lg transition">
        {saving ? 'Lagrer…' : 'Lagre foretaksopplysninger'}
      </button>
    </div>
  )
}
