import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { calcEkom } from '../types'
import { kr, MONTHS, QUARTERS } from '../lib/format'
import { ModalShell } from './Modal'

/** EKOM-kalkulatoren (post 7500): telefon per måned, internett per kvartal,
 *  minus privatandel. Lagrer kun til innstillingene — årsbeløpet utledes derfra
 *  av managedPostAmount, det finnes ingen skjult kvittering bak. */
export function EkomModal({ year, onClose }: { year: number; onClose: () => void }) {
  const { settings, updateSettings } = useSettings()
  const ys = String(year)
  const [phoneMonths, setPhoneMonths] = useState<number[]>(settings.ekomPhone[ys] || Array(12).fill(0))
  const [internetQuarters, setInternetQuarters] = useState<number[]>(settings.ekomInternet[ys] || Array(4).fill(0))
  const [privateAmt, setPrivateAmt] = useState(settings.ekomPrivateAmt)
  const [saving, setSaving] = useState(false)

  const { totalPhone, totalInternet, totalGross, deduction, net } =
    calcEkom(phoneMonths, internetQuarters, parseFloat(String(privateAmt)) || 0)

  function updatePhone(i: number, val: string) {
    const next = [...phoneMonths]; next[i] = parseFloat(val) || 0; setPhoneMonths(next)
  }
  function updateInternet(i: number, val: string) {
    const next = [...internetQuarters]; next[i] = parseFloat(val) || 0; setInternetQuarters(next)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateSettings({
        ekomPhone: { ...settings.ekomPhone, [ys]: phoneMonths },
        ekomInternet: { ...settings.ekomInternet, [ys]: internetQuarters },
        ekomPrivateAmt: parseFloat(String(privateAmt)) || 0,
      })
      onClose()
    } catch (err) {
      alert('Kunne ikke lagre EKOM-beregningen: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSaving(false)
    }
  }

  const inp = 'border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <ModalShell
      title={`EKOM-kalkulator ${year}`}
      onClose={onClose}
      footer={
        <div className="px-5 pb-5 pt-3">
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition text-sm">
            {saving ? 'Lagrer...' : 'Lagre EKOM-beregning'}
          </button>
        </div>
      }
    >
      <div className="px-5 py-4 space-y-5">
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Telefon — månedlige utgifter</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {MONTHS.map((m, i) => (
              <div key={m} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-8 shrink-0">{m.slice(0, 3)}</span>
                <input type="number" value={phoneMonths[i] || ''} onChange={e => updatePhone(i, e.target.value)}
                  min="0" step="1" placeholder="0" className={`flex-1 ${inp}`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Sum: {kr(totalPhone)}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Internett — kvartalsvise utgifter</p>
          <div className="space-y-2">
            {QUARTERS.map((q, i) => (
              <div key={q} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-24 shrink-0">{q}</span>
                <input type="number" value={internetQuarters[i] || ''} onChange={e => updateInternet(i, e.target.value)}
                  min="0" step="1" placeholder="0" className={`flex-1 ${inp}`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Sum: {kr(totalInternet)}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Privat bruksfradrag (kr)</label>
          <p className="text-xs text-slate-400 mb-2">Beløp som trekkes fra som privat bruk</p>
          <input type="number" value={privateAmt || ''} onChange={e => setPrivateAmt(parseFloat(e.target.value) || 0)}
            inputMode="decimal" min="0" step="1" placeholder="0"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-sm">
          <p className="font-semibold text-slate-700 mb-2">Oppsummering</p>
          <div className="flex justify-between text-slate-600"><span>Telefon totalt</span><span>{kr(totalPhone)}</span></div>
          <div className="flex justify-between text-slate-600"><span>Internett totalt</span><span>{kr(totalInternet)}</span></div>
          <div className="flex justify-between text-slate-400 text-xs"><span>Brutto</span><span>{kr(totalGross)}</span></div>
          <div className="flex justify-between text-red-500 text-xs"><span>− Privat bruk</span><span>−{kr(deduction)}</span></div>
          <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-1.5">
            <span>Post 7500 fradrag</span><span>{kr(net)}</span>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
