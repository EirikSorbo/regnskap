import { useState } from 'react'
import { type Asset, saldoDepreciation, saldoBalance } from '../types'
import { IconPlus, IconTrash } from './icons'

// Driftsmiddel-register for saldoavskrivning (post 6000). Registrer instrumenter/
// utstyr som avskrives; appen regner ut årets saldoavskrivning automatisk. Har du
// minst ett driftsmiddel, styrer registeret post 6000 (ellers det manuelle beløpet).
export function AssetEditor({ assets, year, onSave }: {
  assets: Asset[]
  year: number
  onSave: (a: Asset[]) => Promise<void>
}) {
  const [draft, setDraft] = useState<Asset[]>(assets)
  const [nName, setNName] = useState('')
  const [nYear, setNYear] = useState(String(year))
  const [nCost, setNCost] = useState('')
  const [nRate, setNRate] = useState('30')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const dirty = JSON.stringify(draft) !== JSON.stringify(assets)
  const inp = 'border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  function add() {
    const name = nName.trim(), yr = parseInt(nYear, 10), cost = parseFloat(nCost) || 0
    const rate = (parseFloat(nRate) || 0) / 100
    if (!name || !Number.isFinite(yr) || cost <= 0) { setMsg('Fyll inn navn, år og kostpris (> 0).'); return }
    setDraft(d => [...d, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, year: yr, cost, rate: rate > 0 && rate < 1 ? rate : 0.30 }])
    setNName(''); setNCost(''); setMsg('')
  }
  async function save() {
    setSaving(true)
    try { await onSave(draft); setMsg('Lagret ✓'); setTimeout(() => setMsg(''), 2000) }
    catch (e) { setMsg('Feil: ' + (e instanceof Error ? e.message : String(e))) }
    finally { setSaving(false) }
  }

  return (
    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
      <p className="text-xs font-medium text-slate-500">Driftsmiddel-register</p>
      <p className="text-xs text-slate-400">Registrer instrumenter/utstyr som avskrives. Appen regner saldoavskrivningen automatisk og styrer da post 6000.</p>
      {draft.length > 0 && (
        <div className="space-y-1.5">
          {draft.map((a, i) => (
            <div key={a.id} className="flex items-center gap-2 text-sm">
              <div className="flex-1 min-w-0">
                <p className="text-slate-700 truncate">{a.name}</p>
                <p className="text-xs text-slate-400">{a.year} · {a.cost.toLocaleString('nb-NO')} kr · {Math.round(a.rate * 100)} %</p>
              </div>
              <button type="button" onClick={() => setDraft(d => d.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-400 shrink-0"><IconTrash /></button>
            </div>
          ))}
          <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs flex justify-between">
            <span className="text-slate-500">Avskrivning {year} · restsaldo</span>
            <span className="font-semibold text-slate-700">{saldoDepreciation(draft, year).toLocaleString('nb-NO')} · {saldoBalance(draft, year).toLocaleString('nb-NO')} kr</span>
          </div>
        </div>
      )}
      <input value={nName} onChange={e => setNName(e.target.value)} placeholder="Navn (f.eks. gitar)" className={`w-full ${inp}`} />
      <div className="flex items-center gap-2">
        <input value={nYear} onChange={e => setNYear(e.target.value)} placeholder="År" inputMode="numeric" className={`w-16 ${inp}`} />
        <input value={nCost} onChange={e => setNCost(e.target.value)} placeholder="Kostpris" inputMode="decimal" className={`flex-1 ${inp}`} />
        <input value={nRate} onChange={e => setNRate(e.target.value)} placeholder="Sats %" inputMode="numeric" title="Saldosats i prosent (gruppe d = 30)" className={`w-16 ${inp}`} />
        <button type="button" onClick={add} title="Legg til driftsmiddel" className="text-blue-600 hover:text-blue-700 shrink-0"><IconPlus /></button>
      </div>
      {msg && <p className={`text-xs ${/Feil|Fyll/.test(msg) ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
      <button onClick={save} disabled={saving || !dirty}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm py-2 rounded-lg transition">
        {saving ? 'Lagrer…' : 'Lagre driftsmidler'}
      </button>
    </div>
  )
}
