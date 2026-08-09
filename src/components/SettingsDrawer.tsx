import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { type IncomeEntry, CATEGORIES } from '../types'
import { addIncome, deleteIncome } from '../lib/entries'
import { kr } from '../lib/format'
import { Drawer, Section } from './Modal'
import { CategoryEditor } from './CategoryEditor'
import { AssetEditor } from './AssetEditor'
import { IconTrash } from './icons'

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const numberClass = `${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`

/** Innstillingsskuffen. Eier sin egen skjemastate og skriver selv til Firestore;
 *  dashbordet trenger bare å si hvilket år som er valgt. */
export function SettingsDrawer({ selectedYear, setSelectedYear, years, yearIncome, usedPosts, onClose }: {
  selectedYear: number
  setSelectedYear: (y: number) => void
  years: number[]
  yearIncome: IncomeEntry[]
  usedPosts: Set<string>
  onClose: () => void
}) {
  const { user } = useAuth()
  const { settings, updateSettings } = useSettings()
  const ys = String(selectedYear)

  // Seksjonene er uavhengige: flere kan stå åpne samtidig, som før.
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (name: string) => setOpen(o => ({ ...o, [name]: !o[name] }))

  const [ratePerKm, setRatePerKm] = useState(settings.drivingRatePerKm)
  const [ratePerPassengerKm, setRatePerPassengerKm] = useState(settings.drivingRatePerPassengerKm)

  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeDate, setIncomeDate] = useState(`${selectedYear}-${format(new Date(), 'MM-dd')}`)
  const [savingIncome, setSavingIncome] = useState(false)

  const [hjemmekontorAmt, setHjemmekontorAmt] = useState('')
  const [savingHjemmekontor, setSavingHjemmekontor] = useState(false)
  const [avskrivningerAmt, setAvskrivningerAmt] = useState('')
  const [savingAvskrivninger, setSavingAvskrivninger] = useState(false)

  // Årsvalget bor i denne skuffen, så feltene må følge med når året endres.
  useEffect(() => {
    setHjemmekontorAmt(String(settings.hjemmekontorAmounts[ys] || ''))
    setAvskrivningerAmt(String(settings.avskrivningerAmounts[ys] || ''))
    setIncomeDate(`${selectedYear}-${format(new Date(), 'MM-dd')}`)
  }, [selectedYear, ys, settings.hjemmekontorAmounts, settings.avskrivningerAmounts])

  const totalIncome = yearIncome.reduce((s, e) => s + e.amount, 0)

  async function handleAddIncome(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !incomeAmount) return
    setSavingIncome(true)
    try {
      await addIncome(user.uid, { amount: parseFloat(incomeAmount), date: incomeDate })
      setIncomeAmount('')
      setIncomeDate(`${selectedYear}-${format(new Date(), 'MM-dd')}`)
    } catch (err) {
      alert('Kunne ikke lagre inntekten: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSavingIncome(false)
    }
  }

  async function handleDeleteIncome(entry: IncomeEntry) {
    if (!entry.id || !confirm('Slett inntekt?')) return
    try { await deleteIncome(entry.id) } catch (e) { console.error(e) }
  }

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

      <Section title="Inntekter" open={!!open.income} onToggle={() => toggle('income')}
        summary={totalIncome > 0 ? <span>{kr(totalIncome)}</span> : null}>
        <div className="space-y-2 mt-2">
          <p className="text-xs text-slate-400 mb-1">Inntekter registreres på post 3000</p>
          <form onSubmit={handleAddIncome} className="space-y-2">
            <div className="flex gap-2">
              <input type="number" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)}
                inputMode="decimal" min="0" step="0.01" placeholder="Beløp" required className={`flex-1 ${numberClass}`} />
              <button type="submit" disabled={savingIncome}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm px-3 py-2 rounded-lg transition whitespace-nowrap">
                Legg til
              </button>
            </div>
            <input type="date" value={incomeDate} onChange={e => setIncomeDate(e.target.value)} className={inputClass} />
          </form>
          {yearIncome.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-100">
              {yearIncome.map(inc => (
                <div key={inc.id} className="flex items-center justify-between text-xs py-1">
                  <div className="text-slate-600 flex-1 min-w-0">
                    <span className="font-medium">{kr(inc.amount)}</span>
                    <span className="text-slate-300 ml-1">{format(new Date(inc.date), 'd. MMM', { locale: nb })}</span>
                  </div>
                  <button onClick={() => handleDeleteIncome(inc)} className="text-slate-300 hover:text-red-400 ml-2 shrink-0"><IconTrash /></button>
                </div>
              ))}
              <p className="text-xs font-semibold text-slate-700 pt-1 border-t border-slate-100">Total: {kr(totalIncome)}</p>
            </div>
          )}
        </div>
      </Section>

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

      <Section title="Kategorier" open={!!open.cats} onToggle={() => toggle('cats')}
        summary={<span>{(settings.categories ?? CATEGORIES).length}</span>}>
        <CategoryEditor
          categories={settings.categories ?? CATEGORIES}
          usedPosts={usedPosts}
          onSave={(cats) => updateSettings({ categories: cats })}
        />
      </Section>

      <div className="border-t border-slate-100 pt-4">
        <button onClick={() => signOut(auth)}
          className="w-full text-sm text-red-500 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition">
          Logg ut
        </button>
      </div>
    </Drawer>
  )
}
