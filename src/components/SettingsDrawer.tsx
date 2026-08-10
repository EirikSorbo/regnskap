import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { usePanels } from '../context/PanelsContext'
import { CATEGORIES, TAX_TERMS, calcEkom, taxPaidSummary } from '../types'
import { kr } from '../lib/format'
import { Drawer, Section } from './Modal'
import { CategoryEditor } from './CategoryEditor'
import { AssetEditor } from './AssetEditor'
import { CompanySection } from './CompanySection'

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const numberClass = `${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`

/** Innstillingsskuffen. Eier sin egen skjemastate og skriver selv til Firestore.
 *
 *  Regnskapsåret velges her, og gjelder hele appen: både regnskapsfanen og
 *  fakturafanen viser det året som står øverst i denne skuffen. */
export function SettingsDrawer({ selectedYear, setSelectedYear, years, usedPosts, onClose }: {
  selectedYear: number
  setSelectedYear: (y: number) => void
  years: number[]
  usedPosts: Set<string>
  onClose: () => void
}) {
  const { user } = useAuth()
  const { settings, updateSettings } = useSettings()
  const { openPanel } = usePanels()
  const ys = String(selectedYear)

  const { net: ekomNet } = calcEkom(
    settings.ekomPhone[ys] || Array(12).fill(0),
    settings.ekomInternet[ys] || Array(4).fill(0),
    settings.ekomPrivateAmt,
  )

  const { paid: taxPaid } = taxPaidSummary(settings.forskuddsskatt?.[ys], 0)

  // Seksjonene er uavhengige: flere kan stå åpne samtidig, som før.
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (name: string) => setOpen(o => ({ ...o, [name]: !o[name] }))

  const [ratePerKm, setRatePerKm] = useState(settings.drivingRatePerKm)
  const [ratePerPassengerKm, setRatePerPassengerKm] = useState(settings.drivingRatePerPassengerKm)

  const [taxTerms, setTaxTerms] = useState<string[]>(Array(TAX_TERMS).fill(''))
  const [savingTax, setSavingTax] = useState(false)

  const [hjemmekontorAmt, setHjemmekontorAmt] = useState('')
  const [savingHjemmekontor, setSavingHjemmekontor] = useState(false)
  const [avskrivningerAmt, setAvskrivningerAmt] = useState('')
  const [savingAvskrivninger, setSavingAvskrivninger] = useState(false)

  // Årsvalget bor i denne skuffen, så feltene må følge med når året endres.
  useEffect(() => {
    setHjemmekontorAmt(String(settings.hjemmekontorAmounts[ys] || ''))
    setAvskrivningerAmt(String(settings.avskrivningerAmounts[ys] || ''))
    const paid = settings.forskuddsskatt?.[ys] ?? []
    setTaxTerms(Array.from({ length: TAX_TERMS }, (_, i) => String(paid[i] || '')))
  }, [ys, settings.hjemmekontorAmounts, settings.avskrivningerAmounts, settings.forskuddsskatt])

  /** Satsene skrives rett til innstillingene når brukeren endrer dem. Dette lå
   *  før i to effekter som speilet state begge veier og måtte holdes utenfor
   *  hverandres avhengighetslister for ikke å gå i skriveløkke. */
  function saveRate(field: 'drivingRatePerKm' | 'drivingRatePerPassengerKm', raw: string) {
    const v = parseFloat(raw)
    const safe = Number.isFinite(v) ? v : 0
    if (field === 'drivingRatePerKm') setRatePerKm(safe)
    else setRatePerPassengerKm(safe)
    void updateSettings({ [field]: safe })
  }

  async function saveTax() {
    setSavingTax(true)
    try {
      await updateSettings({
        forskuddsskatt: {
          ...settings.forskuddsskatt,
          [ys]: taxTerms.map(t => parseFloat(t) || 0),
        },
      })
    } catch (err) {
      alert('Kunne ikke lagre: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSavingTax(false)
    }
  }

  async function saveYearAmount(
    field: 'hjemmekontorAmounts' | 'avskrivningerAmounts',
    raw: string,
    setSaving: (b: boolean) => void,
  ) {
    setSaving(true)
    try {
      await updateSettings({ [field]: { ...settings[field], [ys]: parseFloat(raw) || 0 } })
    } catch (err) {
      alert('Kunne ikke lagre: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer title="Innstillinger" onClose={onClose}>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Regnskapsår</label>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
          className={`${inputClass} bg-white`}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <Section title="Kjøresatser" open={!!open.driving} onToggle={() => toggle('driving')}
        summary={<span>{ratePerKm.toFixed(2)} kr/km</span>}>
        <div className="space-y-3 mt-2">
          <p className="text-xs text-slate-400">Kjøring registreres på post 7080</p>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Kr per km</label>
            <input type="number" value={ratePerKm} min="0" step="0.01"
              onChange={e => saveRate('drivingRatePerKm', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Kr per passasjer per km</label>
            <input type="number" value={ratePerPassengerKm} min="0" step="0.01"
              onChange={e => saveRate('drivingRatePerPassengerKm', e.target.value)} className={inputClass} />
          </div>
        </div>
      </Section>

      {/* EKOM lå før bak et eget symbol i toppen. Den hører hjemme her: den er
          en kalkulator som ikke gjør annet enn å skrive til innstillingene. */}
      <Section title="EKOM" open={!!open.ekom} onToggle={() => toggle('ekom')}
        summary={ekomNet > 0 ? <span>{kr(ekomNet)}</span> : null}>
        <div className="mt-2">
          <p className="text-xs text-slate-400 mb-2">Telefon og internett, årsbeløp på post 7500</p>
          <button onClick={() => openPanel('ekom')}
            className="w-full flex items-center justify-between text-sm font-medium text-slate-700 border border-slate-200 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition">
            <span>Åpne kalkulatoren</span>
            <span className="text-slate-400 text-base">→</span>
          </button>
        </div>
      </Section>

      {/* Forskuddsskatt er ikke en kostnad i foretaket, så beløpene her rører
          ikke resultatet. De brukes bare til å vise hvor stor andel av det du
          har tjent som allerede er innbetalt. */}
      <Section title="Forskuddsskatt" open={!!open.tax} onToggle={() => toggle('tax')}
        summary={taxPaid > 0 ? <span>{kr(taxPaid)}</span> : null}>
        <div className="mt-2 space-y-2">
          <p className="text-xs text-slate-400">Innbetalt per termin i {selectedYear}</p>
          <div className="grid grid-cols-2 gap-2">
            {taxTerms.map((t, i) => (
              <div key={i}>
                <label className="block text-xs text-slate-500 mb-0.5">{i + 1}. termin</label>
                <input type="number" value={t} inputMode="decimal" min="0" step="1" placeholder="0"
                  onChange={e => setTaxTerms(ts => ts.map((v, j) => j === i ? e.target.value : v))}
                  className={numberClass} />
              </div>
            ))}
          </div>
          <button onClick={saveTax} disabled={savingTax}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm px-4 py-2 rounded-lg transition">
            {savingTax ? '...' : 'Lagre'}
          </button>
        </div>
      </Section>

      <Section title="Hjemmekontor" open={!!open.hk} onToggle={() => toggle('hk')}
        summary={parseFloat(hjemmekontorAmt) > 0 ? <span>{kr(parseFloat(hjemmekontorAmt))}</span> : null}>
        <div className="mt-2">
          <p className="text-xs text-slate-400 mb-2">Årsbeløp registreres på post 7770</p>
          <div className="flex gap-2">
            <input type="number" value={hjemmekontorAmt} onChange={e => setHjemmekontorAmt(e.target.value)}
              inputMode="decimal" min="0" step="1" placeholder="0" className={`flex-1 ${numberClass}`} />
            <button onClick={() => saveYearAmount('hjemmekontorAmounts', hjemmekontorAmt, setSavingHjemmekontor)}
              disabled={savingHjemmekontor}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm px-4 py-2 rounded-lg transition whitespace-nowrap">
              {savingHjemmekontor ? '...' : 'Lagre'}
            </button>
          </div>
        </div>
      </Section>

      <Section title="Avskrivninger" open={!!open.avskr} onToggle={() => toggle('avskr')}
        summary={parseFloat(avskrivningerAmt) > 0 ? <span>{kr(parseFloat(avskrivningerAmt))}</span> : null}>
        <div className="mt-2">
          <p className="text-xs text-slate-400 mb-2">Årsbeløp registreres på post 6000</p>
          <div className="flex gap-2">
            <input type="number" value={avskrivningerAmt} onChange={e => setAvskrivningerAmt(e.target.value)}
              inputMode="decimal" min="0" step="1" placeholder="0" className={`flex-1 ${numberClass}`} />
            <button onClick={() => saveYearAmount('avskrivningerAmounts', avskrivningerAmt, setSavingAvskrivninger)}
              disabled={savingAvskrivninger}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm px-4 py-2 rounded-lg transition whitespace-nowrap">
              {savingAvskrivninger ? '...' : 'Lagre'}
            </button>
          </div>
          {(settings.assets?.length ?? 0) > 0 && (
            <p className="text-xs text-amber-600 mt-2">Driftsmiddel-registeret nedenfor styrer post 6000. Det manuelle beløpet over brukes bare hvis registeret er tomt.</p>
          )}
          <AssetEditor assets={settings.assets ?? []} year={selectedYear} onSave={(a) => updateSettings({ assets: a })} />
        </div>
      </Section>

      <Section title="Foretaksopplysninger" open={!!open.company} onToggle={() => toggle('company')}
        summary={<span>{settings.company?.name ? 'Utfylt' : 'Mangler'}</span>}>
        <CompanySection />
      </Section>

      <Section title="Kategorier" open={!!open.cats} onToggle={() => toggle('cats')}
        summary={<span>{(settings.categories ?? CATEGORIES).length}</span>}>
        <CategoryEditor
          categories={settings.categories ?? CATEGORIES}
          usedPosts={usedPosts}
          onSave={(cats) => updateSettings({ categories: cats })}
        />
      </Section>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400 mb-2">
          Logget inn som: <span className="font-medium text-slate-600">{user?.email}</span>
        </p>
        <button onClick={() => signOut(auth)}
          className="w-full text-sm text-red-500 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition">
          Logg ut
        </button>
      </div>
    </Drawer>
  )
}
