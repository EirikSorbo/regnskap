import { useState } from 'react'
import { useSettings, type CompanyInfo } from '../context/SettingsContext'
import { DEFAULT_PAYMENT_TERMS_DAYS } from '../lib/invoice'
import { DEFAULT_SHORTCUT_NAME, SHORTCUT_RECIPE } from '../lib/invoice-email'

const inp = 'w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

/** Avsenderopplysningene som står øverst på fakturaen, pluss nummerserien.
 *  Ingen MVA-felter: foretaket er ikke registrert i Merverdiavgiftsregisteret. */
export function CompanySection() {
  const { settings, updateSettings } = useSettings()
  const [draft, setDraft] = useState<CompanyInfo>(settings.company ?? {})
  // Fakturanummeret skrives KUN hvis du faktisk har rørt feltet. Verdien
  // fanges når skuffen åpnes, og uten denne vakten ville det å lagre en endret
  // adresse skrive tilbake et foreldet nummer: åpne innstillinger, utsted en
  // faktura, lagre adressen, og telleren sto plutselig ett hakk tilbake.
  const [nextNumber, setNextNumber] = useState(String(settings.nextInvoiceNumber ?? 1))
  const [numberTouched, setNumberTouched] = useState(false)
  const [terms, setTerms] = useState(String(settings.paymentTermsDays ?? DEFAULT_PAYMENT_TERMS_DAYS))
  const [emailMethod, setEmailMethod] = useState(settings.emailMethod ?? 'mailto')
  const [shortcutName, setShortcutName] = useState(settings.shortcutName ?? DEFAULT_SHORTCUT_NAME)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const set = (patch: Partial<CompanyInfo>) => setDraft(d => ({ ...d, ...patch }))
  const storedNumber = settings.nextInvoiceNumber ?? 1
  const parsedNumber = parseInt(nextNumber, 10)
  const lowering = numberTouched && Number.isFinite(parsedNumber) && parsedNumber < storedNumber

  async function save() {
    if (lowering && !confirm(
      `Du setter neste fakturanummer ned fra ${storedNumber} til ${parsedNumber}.\n\n` +
      'Da kan du få to fakturaer med samme nummer. Er du sikker?')) return
    setSaving(true)
    try {
      await updateSettings({
        company: draft,
        paymentTermsDays: Math.max(0, parseInt(terms, 10) || DEFAULT_PAYMENT_TERMS_DAYS),
        emailMethod,
        shortcutName: shortcutName.trim() || DEFAULT_SHORTCUT_NAME,
        ...(numberTouched && Number.isFinite(parsedNumber) && parsedNumber >= 1
          ? { nextInvoiceNumber: parsedNumber }
          : {}),
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
      <input value={draft.contactName ?? ''} onChange={e => set({ contactName: e.target.value })}
        placeholder="Ditt navn (signatur i e-post)" className={inp} />
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
          <input value={nextNumber} onChange={e => { setNextNumber(e.target.value); setNumberTouched(true) }}
            inputMode="numeric" className={inp} />
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

      <div className="border-t border-slate-100 pt-2 space-y-2">
        <label className="block text-xs text-slate-500">Send på e-post</label>
        <select value={emailMethod} onChange={e => setEmailMethod(e.target.value as 'mailto' | 'shortcut')}
          className={`${inp} bg-white`}>
          <option value="mailto">Åpne e-post (uten vedlegg)</option>
          <option value="shortcut">Via snarvei på Mac (med vedlegg)</option>
        </select>
        {emailMethod === 'mailto' ? (
          <p className="text-xs text-slate-400">
            E-posten åpnes med mottaker, emne og tekst utfylt. PDF-en må du legge ved selv:
            en mailto-lenke kan ikke ha vedlegg.
          </p>
        ) : (
          <>
            <input value={shortcutName} onChange={e => setShortcutName(e.target.value)}
              placeholder={DEFAULT_SHORTCUT_NAME} className={inp} />
            <p className="text-xs text-slate-400">
              Navnet på snarveien i Snarveier, skrevet helt likt. Lagre PDF-en først,
              trykk så «Send på e-post». Snarveien trenger disse trinnene:
            </p>
            <ol className="text-xs text-slate-400 list-decimal pl-4 space-y-0.5">
              {SHORTCUT_RECIPE.map(t => <li key={t}>{t}</li>)}
            </ol>
          </>
        )}
      </div>

      {msg && <p className={`text-xs ${msg.startsWith('Feil') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
      <button onClick={save} disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm py-2 rounded-lg transition">
        {saving ? 'Lagrer…' : 'Lagre foretaksopplysninger'}
      </button>
    </div>
  )
}
