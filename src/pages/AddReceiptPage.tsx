import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, DRIVING_CATEGORY } from '../types'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

export default function AddReceiptPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [categoryPost, setCategoryPost] = useState(CATEGORIES[0].post)
  const isDriving = categoryPost === DRIVING_CATEGORY.post

  // Receipt fields
  const [amount, setAmount] = useState('')

  // Driving fields
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [tripType, setTripType] = useState<'one-way' | 'return'>('one-way')
  const [distance, setDistance] = useState('')
  const [passengers, setPassengers] = useState('')

  // Shared
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSaving(true)

    try {
      const category = CATEGORIES.find(c => c.post === categoryPost)!

      if (isDriving) {
        if (!from || !to || !distance) { setError('Fyll inn fra, til og avstand.'); setSaving(false); return }
        await addDoc(collection(db, 'receipts'), {
          userId: user.uid,
          entryType: 'driving',
          date,
          category,
          description,
          from,
          to,
          tripType,
          distance: parseFloat(distance),
          passengers: passengers ? parseInt(passengers) : 0,
          createdAt: Date.now(),
        })
      } else {
        if (!amount || isNaN(Number(amount))) { setError('Ugyldig beløp.'); setSaving(false); return }
        await addDoc(collection(db, 'receipts'), {
          userId: user.uid,
          entryType: 'receipt',
          amount: parseFloat(amount),
          date,
          category,
          description,
          createdAt: Date.now(),
        })
      }
      navigate('/')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800 text-xl">←</button>
        <h1 className="text-lg font-semibold text-slate-800">
          {isDriving ? 'Legg til kjøring' : 'Legg til utgift'}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 pt-6 space-y-5">

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
          <select
            value={categoryPost}
            onChange={e => setCategoryPost(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {CATEGORIES.map(c => (
              <option key={c.post} value={c.post}>Post {c.post} – {c.label}</option>
            ))}
          </select>
        </div>

        {isDriving ? (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fra</label>
              <input type="text" value={from} onChange={e => setFrom(e.target.value)} required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="F.eks. Oslo" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Til</label>
              <input type="text" value={to} onChange={e => setTo(e.target.value)} required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="F.eks. Bergen" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tur/retur</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setTripType('one-way')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition
                    ${tripType === 'one-way' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}>
                  Enveis
                </button>
                <button type="button" onClick={() => setTripType('return')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition
                    ${tripType === 'return' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}>
                  Tur/retur
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Avstand (km){tripType === 'return' ? ' — én vei' : ''}
              </label>
              <input type="number" value={distance} onChange={e => setDistance(e.target.value)} required
                min="0" step="0.1"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0" />
              {distance && !isNaN(parseFloat(distance)) && (
                <p className="text-xs text-slate-400 mt-1">
                  Totalt: {tripType === 'return' ? parseFloat(distance) * 2 : parseFloat(distance)} km
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Antall passasjerer (valgfritt)</label>
              <input type="number" value={passengers} onChange={e => setPassengers(e.target.value)}
                min="0" step="1"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0" />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Beløp (kr)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required
              min="0" step="0.01"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00" />
            <p className="text-xs text-slate-400 mt-1">💡 Ta bilde av kvitteringen og lagre den i kamerarullen din.</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dato</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Beskrivelse {isDriving ? '' : '(valgfritt)'}</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={isDriving ? 'F.eks. konsert i Bergen' : 'F.eks. mikrofon til studio'} />
        </div>

        {error && (
          <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded p-2">{error}</p>
        )}

        <button type="submit" disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition text-base">
          {saving ? 'Lagrer...' : '💾 Lagre'}
        </button>
      </form>
    </div>
  )
}
