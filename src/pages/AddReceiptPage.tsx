import { useState, useRef, useEffect } from 'react'
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, DRIVING_CATEGORY, type ReceiptEntry, type DrivingEntry } from '../types'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'

function IconPaperclip() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
}
function IconCheck() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
}
function IconArrowLeft() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
}

export default function AddReceiptPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditing = !!editId

  const [categoryPost, setCategoryPost] = useState(CATEGORIES[0].post)
  const isDriving = categoryPost === DRIVING_CATEGORY.post

  // Receipt fields
  const [amount, setAmount] = useState('')
  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [existingImagePath, setExistingImagePath] = useState('')

  // Driving fields
  const [from, setFrom] = useState('Hjemme')
  const [to, setTo] = useState('')
  const [tripType, setTripType] = useState<'one-way' | 'return'>('return')
  const [distance, setDistance] = useState('')
  const [passengers, setPassengers] = useState('')

  // File attachment
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Shared
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadingEntry, setLoadingEntry] = useState(isEditing)

  // Load existing entry if editing
  useEffect(() => {
    if (!editId) return
    getDoc(doc(db, 'receipts', editId)).then(snap => {
      if (!snap.exists()) { navigate('/'); return }
      const data = snap.data()
      setCategoryPost(data.category.post)
      setDate(data.date)
      setDescription(data.description || '')
      if (data.entryType === 'driving') {
        const d = data as DrivingEntry
        setFrom(d.from)
        setTo(d.to)
        setTripType(d.tripType)
        setDistance(String(d.distance))
        setPassengers(d.passengers ? String(d.passengers) : '')
      } else {
        const r = data as ReceiptEntry
        setAmount(String(r.amount))
        setExistingImageUrl(r.imageUrl || '')
        setExistingImagePath(r.imagePath || '')
      }
      setLoadingEntry(false)
    })
  }, [editId, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSaving(true)

    try {
      const category = CATEGORIES.find(c => c.post === categoryPost)!

      if (isDriving) {
        if (!from || !to || !distance) { setError('Fyll inn fra, til og avstand.'); setSaving(false); return }
        const data = {
          entryType: 'driving' as const,
          date, category, description,
          from, to, tripType,
          distance: parseFloat(distance),
          passengers: passengers ? parseInt(passengers) : 0,
        }
        if (isEditing) {
          await updateDoc(doc(db, 'receipts', editId!), data)
        } else {
          await addDoc(collection(db, 'receipts'), { userId: user.uid, ...data, createdAt: Date.now() })
        }
      } else {
        if (!amount || isNaN(Number(amount))) { setError('Ugyldig beløp.'); setSaving(false); return }
        let imageUrl = existingImageUrl
        let imagePath = existingImagePath
        if (file) {
          imagePath = `receipts/${user.uid}/${Date.now()}_${file.name}`
          const storageRef = ref(storage, imagePath)
          await uploadBytes(storageRef, file)
          imageUrl = await getDownloadURL(storageRef)
        }
        const data = {
          entryType: 'receipt' as const,
          amount: parseFloat(amount),
          date, category, description,
          imageUrl, imagePath,
        }
        if (isEditing) {
          await updateDoc(doc(db, 'receipts', editId!), data)
        } else {
          await addDoc(collection(db, 'receipts'), { userId: user.uid, ...data, createdAt: Date.now() })
        }
      }
      navigate('/')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loadingEntry) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Laster...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition">
          <IconArrowLeft />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">
          {isEditing ? 'Rediger oppføring' : isDriving ? 'Legg til kjøring' : 'Legg til utgift'}
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
            {CATEGORIES.filter(c => !['7500', '7100'].includes(c.post) || ['7500', '7100'].includes(categoryPost)).map(c => (
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
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Vedlegg (bilde / PDF)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <IconCheck />
                  <span className="text-green-700 text-sm flex-1 truncate">{file.name}</span>
                  <button type="button" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="text-xs text-slate-400 hover:text-red-500">Fjern</button>
                </div>
              ) : existingImageUrl ? (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <IconPaperclip />
                  <span className="text-slate-600 text-sm flex-1 truncate">Eksisterende vedlegg</span>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-500 hover:text-blue-700">Bytt</button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 rounded-lg py-3 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500 transition flex items-center justify-center gap-2">
                  <IconPaperclip /> Legg ved kvittering (valgfritt)
                </button>
              )}
            </div>
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
          {saving ? 'Lagrer...' : isEditing ? 'Lagre endringer' : 'Lagre'}
        </button>
      </form>
    </div>
  )
}