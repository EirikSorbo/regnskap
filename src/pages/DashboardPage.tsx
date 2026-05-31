import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage, auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { type Receipt, CATEGORIES } from '../types'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { signOut } from 'firebase/auth'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [activeTab, setActiveTab] = useState<'list' | 'report'>('list')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'receipts'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Receipt))
      setReceipts(data)
      setLoading(false)
    })
    return unsub
  }, [user])

  const yearReceipts = receipts.filter(r => r.date.startsWith(String(selectedYear)))
  const total = yearReceipts.reduce((sum, r) => sum + r.amount, 0)

  // Group by category
  const byCategory = CATEGORIES.map(cat => {
    const items = yearReceipts.filter(r => r.category.post === cat.post)
    const sum = items.reduce((s, r) => s + r.amount, 0)
    return { ...cat, items, sum }
  }).filter(c => c.sum > 0)

  async function handleDelete(receipt: Receipt) {
    if (!receipt.id) return
    if (!confirm('Slett denne kvitteringen?')) return
    try {
      await deleteDoc(doc(db, 'receipts', receipt.id))
      const storageRef = ref(storage, receipt.imagePath)
      await deleteObject(storageRef)
    } catch (e) {
      console.error(e)
    }
  }

  const years = Array.from(new Set(receipts.map(r => parseInt(r.date.slice(0, 4))))).sort((a, b) => b - a)
  if (!years.includes(selectedYear)) years.push(selectedYear)

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/regnskap/logo.png" alt="logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-base font-bold text-slate-800">Sørbø Musikk</h1>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5"
          >
            Logg ut
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        {/* Year selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 font-medium">År:</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-2 py-1 text-sm bg-white"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Summary card */}
        <div className="bg-blue-600 text-white rounded-2xl p-5">
          <p className="text-sm text-blue-100">Totale utgifter {selectedYear}</p>
          <p className="text-3xl font-bold mt-1">{total.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</p>
          <p className="text-xs text-blue-200 mt-1">{yearReceipts.length} kvitteringer</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition ${activeTab === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
          >
            Kvitteringer
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition ${activeTab === 'report' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
          >
            Årsrapport
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Laster...</div>
        ) : activeTab === 'list' ? (
          <ReceiptList
            receipts={yearReceipts}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onDelete={handleDelete}
          />
        ) : (
          <TaxReport byCategory={byCategory} total={total} year={selectedYear} />
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/add')}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition"
        title="Legg til kvittering"
      >
        +
      </button>
    </div>
  )
}

function ReceiptList({
  receipts,
  expandedId,
  setExpandedId,
  onDelete,
}: {
  receipts: Receipt[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  onDelete: (r: Receipt) => void
}) {
  if (receipts.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-sm">Ingen kvitteringer dette året ennå.</p>
        <p className="text-xs mt-1">Trykk + for å legge til.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {receipts.map(r => (
        <div key={r.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
          <button
            className="w-full text-left px-4 py-3 flex items-center justify-between"
            onClick={() => setExpandedId(expandedId === r.id ? null : r.id!)}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🧾</span>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {r.description || r.category.label}
                </p>
                <p className="text-xs text-slate-400">
                  Post {r.category.post} • {format(new Date(r.date), 'd. MMM yyyy', { locale: nb })}
                </p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-800">
              {r.amount.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
            </span>
          </button>

          {expandedId === r.id && (
            <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
              <img
                src={r.imageUrl}
                alt="kvittering"
                className="w-full max-h-72 object-contain rounded-lg border border-slate-200"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => onDelete(r)}
                  className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
                >
                  🗑 Slett kvittering
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TaxReport({
  byCategory,
  total,
  year,
}: {
  byCategory: { post: string; label: string; sum: number; items: Receipt[] }[]
  total: number
  year: number
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
        <p className="text-xs text-amber-600 mt-1">Disse beløpene fylles inn på de tilsvarende postene i skattemeldingen.</p>
      </div>

      {byCategory.map(cat => (
        <div key={cat.post} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">Post {cat.post}</p>
              <p className="text-sm font-medium text-slate-800 mt-1">{cat.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{cat.items.length} kvittering{cat.items.length !== 1 ? 'er' : ''}</p>
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
