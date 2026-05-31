import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { type Entry, type ReceiptEntry, type DrivingEntry, CATEGORIES, calcDrivingAmount } from '../types'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { signOut } from 'firebase/auth'

const RATE_KEY = 'driving_rate_per_km'
const RATE_PASS_KEY = 'driving_rate_per_passenger_km'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [activeTab, setActiveTab] = useState<'list' | 'report'>('list')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [ratePerKm, setRatePerKm] = useState(() => parseFloat(localStorage.getItem(RATE_KEY) || '3.50'))
  const [ratePerPassengerKm, setRatePerPassengerKm] = useState(() => parseFloat(localStorage.getItem(RATE_PASS_KEY) || '1.00'))
  const [showRates, setShowRates] = useState(false)

  useEffect(() => { localStorage.setItem(RATE_KEY, String(ratePerKm)) }, [ratePerKm])
  useEffect(() => { localStorage.setItem(RATE_PASS_KEY, String(ratePerPassengerKm)) }, [ratePerPassengerKm])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'receipts'), where('userId', '==', user.uid))
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Entry))
      data.sort((a, b) => b.date.localeCompare(a.date))
      setEntries(data)
      setLoading(false)
    }, err => {
      console.error('Firestore error:', err)
      setLoading(false)
    })
    return unsub
  }, [user])

  function getAmount(entry: Entry): number {
    if (entry.entryType === 'receipt') return (entry as ReceiptEntry).amount
    const d = entry as DrivingEntry
    return calcDrivingAmount(d.distance, d.tripType, d.passengers, ratePerKm, ratePerPassengerKm)
  }

  const yearEntries = entries.filter(r => r.date.startsWith(String(selectedYear)))
  const total = yearEntries.reduce((sum, e) => sum + getAmount(e), 0)

  const byCategory = CATEGORIES.map(cat => {
    const items = yearEntries.filter(e => e.category.post === cat.post)
    const sum = items.reduce((s, e) => s + getAmount(e), 0)
    return { ...cat, items, sum }
  }).filter(c => c.sum > 0)

  async function handleDelete(entry: Entry) {
    if (!entry.id) return
    if (!confirm('Slett denne oppføringen?')) return
    try {
      await deleteDoc(doc(db, 'receipts', entry.id))
    } catch (e) { console.error(e) }
  }

  const years = Array.from(new Set(entries.map(e => parseInt(e.date.slice(0, 4))))).sort((a, b) => b - a)
  if (!years.includes(selectedYear)) years.push(selectedYear)

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/regnskap/logo.png" alt="logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-base font-bold text-slate-800">Sørbø Musikk</h1>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => signOut(auth)}
            className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5">
            Logg ut
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        {/* Year selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 font-medium">År:</label>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-2 py-1 text-sm bg-white">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Summary card */}
        <div className="bg-blue-600 text-white rounded-2xl p-5">
          <p className="text-sm text-blue-100">Totale utgifter {selectedYear}</p>
          <p className="text-3xl font-bold mt-1">{total.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</p>
          <p className="text-xs text-blue-200 mt-1">{yearEntries.length} oppføringer</p>
        </div>

        {/* Driving rates */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm">
          <button onClick={() => setShowRates(!showRates)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700">
            <span>🚗 Kjøresatser</span>
            <span className="text-slate-400 text-xs">{showRates ? '▲ Skjul' : '▼ Vis'}</span>
          </button>
          {showRates && (
            <div className="border-t border-slate-100 px-4 pb-4 pt-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Kr per km</label>
                <input type="number" value={ratePerKm} onChange={e => setRatePerKm(parseFloat(e.target.value))}
                  min="0" step="0.01"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Kr per passasjer per km</label>
                <input type="number" value={ratePerPassengerKm} onChange={e => setRatePerPassengerKm(parseFloat(e.target.value))}
                  min="0" step="0.01"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button onClick={() => setActiveTab('list')}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition ${activeTab === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
            Oppføringer
          </button>
          <button onClick={() => setActiveTab('report')}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition ${activeTab === 'report' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
            Årsrapport
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Laster...</div>
        ) : activeTab === 'list' ? (
          <EntryList entries={yearEntries} expandedId={expandedId} setExpandedId={setExpandedId}
            onDelete={handleDelete} getAmount={getAmount} />
        ) : (
          <TaxReport byCategory={byCategory} total={total} year={selectedYear}
            ratePerKm={ratePerKm} ratePerPassengerKm={ratePerPassengerKm} />
        )}
      </div>

      <button onClick={() => navigate('/add')}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition">
        +
      </button>
    </div>
  )
}

function EntryList({ entries, expandedId, setExpandedId, onDelete, getAmount }: {
  entries: Entry[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  onDelete: (e: Entry) => void
  getAmount: (e: Entry) => number
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-sm">Ingen oppføringer dette året ennå.</p>
        <p className="text-xs mt-1">Trykk + for å legge til.</p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {entries.map(e => {
        const isDriving = e.entryType === 'driving'
        const d = isDriving ? (e as DrivingEntry) : null
        return (
          <div key={e.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            <button className="w-full text-left px-4 py-3 flex items-center justify-between"
              onClick={() => setExpandedId(expandedId === e.id ? null : e.id!)}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{isDriving ? '🚗' : '🧾'}</span>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {isDriving ? `${d!.from} → ${d!.to}${d!.tripType === 'return' ? ' (t/r)' : ''}` : (e.description || e.category.label)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Post {e.category.post} • {format(new Date(e.date), 'd. MMM yyyy', { locale: nb })}
                    {isDriving && ` • ${d!.tripType === 'return' ? d!.distance * 2 : d!.distance} km`}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {getAmount(e).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
              </span>
            </button>
            {expandedId === e.id && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-2">
                {isDriving ? (
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><span className="font-medium">Fra:</span> {d!.from}</p>
                    <p><span className="font-medium">Til:</span> {d!.to}</p>
                    <p><span className="font-medium">Type:</span> {d!.tripType === 'return' ? 'Tur/retur' : 'Enveis'}</p>
                    <p><span className="font-medium">Avstand:</span> {d!.tripType === 'return' ? d!.distance * 2 : d!.distance} km</p>
                    {d!.passengers > 0 && <p><span className="font-medium">Passasjerer:</span> {d!.passengers}</p>}
                    {e.description && <p><span className="font-medium">Beskrivelse:</span> {e.description}</p>}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><span className="font-medium">Beløp:</span> {(e as ReceiptEntry).amount?.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</p>
                    <p><span className="font-medium">Kategori:</span> {e.category.label}</p>
                    {e.description && <p><span className="font-medium">Beskrivelse:</span> {e.description}</p>}
                  </div>
                )}
                <div className="flex justify-end">
                  <button onClick={() => onDelete(e)}
                    className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">
                    🗑 Slett
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TaxReport({ byCategory, total, year, ratePerKm, ratePerPassengerKm }: {
  byCategory: { post: string; label: string; sum: number; items: Entry[] }[]
  total: number
  year: number
  ratePerKm: number
  ratePerPassengerKm: number
}) {
  if (byCategory.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-5xl mb-3">📊</div>
        <p className="text-sm">Ingen data for {year} ennå.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800">📋 Altinn-sammendrag {year}</p>
        <p className="text-xs text-amber-600 mt-1">
          Kjøresats: {ratePerKm} kr/km • Passasjertillegg: {ratePerPassengerKm} kr/passasjer/km
        </p>
      </div>
      {byCategory.map(cat => (
        <div key={cat.post} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">Post {cat.post}</p>
              <p className="text-sm font-medium text-slate-800 mt-1">{cat.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{cat.items.length} oppføring{cat.items.length !== 1 ? 'er' : ''}</p>
            </div>
            <p className="text-base font-bold text-slate-800">
              {cat.sum.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
            </p>
          </div>
        </div>
      ))}
      <div className="bg-slate-800 text-white rounded-xl p-4 flex justify-between items-center">
        <span className="font-semibold">Totale fradrag</span>
        <span className="text-xl font-bold">{total.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>
      </div>
    </div>
  )
}
