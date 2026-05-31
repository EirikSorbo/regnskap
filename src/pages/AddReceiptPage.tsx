import { useState, useRef } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'
import { storage, db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../types'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

export default function AddReceiptPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isPdf, setIsPdf] = useState(false)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [categoryPost, setCategoryPost] = useState(CATEGORIES[0].post)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setIsPdf(file.type === 'application/pdf')
    setPreview(URL.createObjectURL(file))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    setImageFile(file)
    setIsPdf(file.type === 'application/pdf')
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!imageFile) { setError('Du må velge et bilde av kvitteringen.'); return }
    if (!amount || isNaN(Number(amount))) { setError('Ugyldig beløp.'); return }

    setError('')
    setUploading(true)
    try {
      const imagePath = `receipts/${user.uid}/${Date.now()}_${imageFile.name}`
      const storageRef = ref(storage, imagePath)
      await uploadBytes(storageRef, imageFile)
      const imageUrl = await getDownloadURL(storageRef)

      const category = CATEGORIES.find(c => c.post === categoryPost)!

      await addDoc(collection(db, 'receipts'), {
        userId: user.uid,
        imageUrl,
        imagePath,
        amount: parseFloat(amount),
        date,
        category,
        description,
        createdAt: Date.now(),
      })

      navigate('/')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800 text-xl">←</button>
        <h1 className="text-lg font-semibold text-slate-800">Legg til kvittering</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 pt-6 space-y-5">

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Kvittering / bilde</label>
          <div
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition
              ${preview ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50'}`}
            style={{ minHeight: 160 }}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            {preview ? (
              isPdf ? (
                <div className="flex flex-col items-center justify-center p-6 text-blue-600">
                  <div className="text-5xl mb-2">📄</div>
                  <p className="text-sm font-medium">{imageFile?.name}</p>
                  <p className="text-xs text-slate-400 mt-1">PDF klar for opplasting</p>
                </div>
              ) : (
                <img src={preview} alt="preview" className="max-h-48 rounded-lg object-contain p-2" />
              )
            ) : (
              <div className="text-center p-6">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm text-slate-500">Trykk for å ta bilde eller velge fil</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          {preview && (
            <button type="button" onClick={() => { setImageFile(null); setPreview(null); setIsPdf(false) }}
              className="mt-2 text-xs text-red-500 hover:underline">
              Fjern bilde
            </button>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Beløp (kr)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dato</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kategori (post)</label>
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Beskrivelse (valgfritt)</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="F.eks. mikrofon til studio"
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded p-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition text-base"
        >
          {uploading ? 'Laster opp...' : '💾 Lagre kvittering'}
        </button>
      </form>
    </div>
  )
}
