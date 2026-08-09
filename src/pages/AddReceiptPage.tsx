import { useState, useRef, useEffect } from 'react'
import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc, deleteField } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { CATEGORIES, DRIVING_CATEGORY, SETTINGS_MANAGED_POSTS, parseReceiptText, type ReceiptEntry, type DrivingEntry, getImageUrls, getImagePaths } from '../types'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { deleteStoragePaths } from '../lib/entries'
import { IconArrowLeft, IconCamera, IconCheck, IconPaperclip } from '../components/icons'

export default function AddReceiptPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditing = !!editId

  const [categoryPost, setCategoryPost] = useState(() => {
    if (searchParams.get('type') === 'driving') return DRIVING_CATEGORY.post
    const postParam = searchParams.get('post')
    if (postParam && CATEGORIES.find(c => c.post === postParam)) return postParam
    return CATEGORIES[0].post
  })
  const isDriving = categoryPost === DRIVING_CATEGORY.post

  // Receipt fields
  const [amount, setAmount] = useState('')
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
  const [existingImagePaths, setExistingImagePaths] = useState<string[]>([])
  // Stiene oppføringen hadde da den ble åpnet. Trengs for å kunne slette fra
  // Storage det du fjerner: uten dette forsvant stien fra dokumentet, mens
  // filen ble liggende igjen og fortsatt var nåbar via nedlastingslenken sin.
  const [originalImagePaths, setOriginalImagePaths] = useState<string[]>([])

  // Driving fields
  const [from, setFrom] = useState('Hjemme')
  const [to, setTo] = useState('')
  const [tripType, setTripType] = useState<'one-way' | 'return'>('return')
  const [distance, setDistance] = useState('')
  const [passengers, setPassengers] = useState('')

  // File attachments
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // OCR-skanning (on-device via Tesseract, lastet fra CDN kun ved bruk)
  const scanInputRef = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)
  const [scanMsg, setScanMsg] = useState('')

  async function handleScan(file: File) {
    setScanning(true)
    setScanMsg('Skanner … (laster ned tekstgjenkjenning første gang)')
    try {
      // Tesseract.js kjører helt on-device (WASM i nettleseren); vi laster kun
      // biblioteket + språkdata fra CDN ved første skann. @vite-ignore holder den
      // utenfor bunten. Feiler noe, faller vi tilbake til manuell utfylling.
      const url = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.esm.min.js'
      const mod = await import(/* @vite-ignore */ url)
      const recognize = mod.recognize ?? mod.default?.recognize
      if (typeof recognize !== 'function') throw new Error('Tesseract utilgjengelig')
      const { data } = await recognize(file, 'nor+eng')
      const { amount: amt, date: dt } = parseReceiptText(String(data?.text || ''))
      const found: string[] = []
      if (amt != null) { setAmount(String(amt)); found.push(`beløp ${amt.toLocaleString('nb-NO')}`) }
      if (dt) { setDate(dt); found.push(`dato ${dt}`) }
      setFiles(prev => [...prev, file])   // legg bildet ved som vedlegg
      setScanMsg(found.length
        ? `Foreslo ${found.join(' og ')} — kontrollér at det stemmer.`
        : 'Fant ikke beløp/dato automatisk. Bildet er lagt ved; fyll inn manuelt.')
    } catch {
      setScanMsg('Kunne ikke skanne (nettverk eller filformat). Fyll inn manuelt.')
    } finally {
      setScanning(false)
    }
  }

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
      setCategoryPost(data.category?.post ?? CATEGORIES[0].post)
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
        setExistingImageUrls(getImageUrls(r))
        setExistingImagePaths(getImagePaths(r))
        setOriginalImagePaths(getImagePaths(r))
      }
      setLoadingEntry(false)
    }).catch(err => {
      // Uten dette ble redigeringssiden stående på «Laster...» for alltid ved feil.
      setError('Kunne ikke laste oppføringen: ' + (err instanceof Error ? err.message : String(err)))
      setLoadingEntry(false)
    })
  }, [editId, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSaving(true)

    try {
      const cats = settings.categories ?? CATEGORIES
      const category = cats.find(c => c.post === categoryPost) ?? { post: categoryPost, label: categoryPost }

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
          // Ikke rør ratePerKm/ratePerPassengerKm ved redigering — den fryste
          // satsen fra da turen ble registrert skal bli stående (updateDoc lar
          // felter som ikke sendes med være urørt).
          //
          // Kvitteringsfeltene fjernes derimot eksplisitt. Bytter du en
          // kvittering til kjøring, ble beløp og vedlegg ellers liggende igjen
          // på dokumentet: usynlige i appen, men de falt samtidig ut av
          // backup-ZIP-en, som bare ser på kvitteringer.
          await updateDoc(doc(db, 'receipts', editId!), {
            ...data,
            amount: deleteField(), imageUrl: deleteField(), imagePath: deleteField(),
            imageUrls: deleteField(), imagePaths: deleteField(),
          })
          await deleteStoragePaths(originalImagePaths)
        } else {
          await addDoc(collection(db, 'receipts'), {
            userId: user.uid, ...data, createdAt: Date.now(),
            ratePerKm: settings.drivingRatePerKm,
            ratePerPassengerKm: settings.drivingRatePerPassengerKm,
          })
        }
      } else {
        if (!amount || isNaN(Number(amount))) { setError('Ugyldig beløp.'); setSaving(false); return }
        // Duplikatvarsel (kun ny oppføring): finnes samme beløp på samme dato alt?
        // Sjekkes FØR opplasting, så vi ikke laster opp bilder ved avbrudd. Egen
        // try/catch så en feilet sjekk aldri BLOKKERER lagring.
        if (!isEditing) {
          try {
            const amt = parseFloat(amount)
            const dupSnap = await getDocs(query(collection(db, 'receipts'),
              where('userId', '==', user.uid), where('date', '==', date)))
            const dup = dupSnap.docs.some(d => {
              const r = d.data()
              return r.entryType === 'receipt' && Math.abs((Number(r.amount) || 0) - amt) < 0.005
            })
            if (dup && !confirm(`Det finnes allerede en utgift på ${amt.toLocaleString('nb-NO')} kr datert ${date}. Lagre likevel?`)) {
              setSaving(false); return
            }
          } catch { /* duplikatsjekk feilet — hopp over, ikke blokker lagring */ }
        }
        const imageUrls = [...existingImageUrls]
        const imagePaths = [...existingImagePaths]
        if (files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            const f = files[i]
            const ext = f.name.split('.').pop()?.toLowerCase() || 'jpg'
            // Unik sti per opplasting. Tidligere ble stien avledet av post+dato+
            // løpenummer, så to ulike kvitteringer med samme post og dato skrev
            // begge til «…-001» og overskrev hverandres bilde stille i Storage.
            const unique = `${Date.now().toString(36)}${i}-${Math.random().toString(36).slice(2, 8)}`
            const path = `receipts/${user.uid}/${categoryPost}-${date}-${unique}.${ext}`
            const storageRef = ref(storage, path)
            await uploadBytes(storageRef, f)
            const url = await getDownloadURL(storageRef)
            imagePaths.push(path)
            imageUrls.push(url)
          }
        }
        const data = {
          entryType: 'receipt' as const,
          amount: parseFloat(amount),
          date, category, description,
          imageUrl: imageUrls[0] || '',
          imagePath: imagePaths[0] || '',
          imageUrls,
          imagePaths,
        }
        if (isEditing) {
          await updateDoc(doc(db, 'receipts', editId!), {
            ...data,
            // Motsatt vei: kjørefeltene skal ikke bli stående på en kvittering.
            from: deleteField(), to: deleteField(), tripType: deleteField(),
            distance: deleteField(), passengers: deleteField(),
            ratePerKm: deleteField(), ratePerPassengerKm: deleteField(),
          })
          // Vedlegg du fjernet i skjemaet slettes nå også fra Storage.
          await deleteStoragePaths(originalImagePaths.filter(p => !imagePaths.includes(p)))
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
            {(settings.categories ?? CATEGORIES).filter(c => !SETTINGS_MANAGED_POSTS.includes(c.post) || SETTINGS_MANAGED_POSTS.includes(categoryPost)).map(c => (
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
            {/* OCR: skann kvittering og fyll inn beløp/dato automatisk */}
            <div className="mb-4">
              <input ref={scanInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleScan(f); if (scanInputRef.current) scanInputRef.current.value = '' }} />
              <button type="button" onClick={() => scanInputRef.current?.click()} disabled={scanning}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg py-2.5 text-sm font-medium hover:bg-blue-100 disabled:opacity-60 transition">
                <IconCamera />
                {scanning ? 'Skanner …' : 'Skann kvittering – fyll inn automatisk'}
              </button>
              {scanMsg && <p className="text-xs text-slate-500 mt-1.5">{scanMsg}</p>}
            </div>
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
                multiple
                className="hidden"
                onChange={e => {
                  const selected = e.target.files ? Array.from(e.target.files) : []
                  if (selected.length > 0) setFiles(prev => [...prev, ...selected])
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              />
              {/* Existing attachments */}
              {existingImageUrls.map((_url, i) => (
                <div key={`existing-${i}`} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-1.5">
                  <IconPaperclip />
                  <span className="text-slate-600 text-sm flex-1 truncate">{existingImagePaths[i]?.split('/').pop() || 'Vedlegg'}</span>
                  <button type="button" onClick={() => {
                    setExistingImageUrls(prev => prev.filter((_, j) => j !== i))
                    setExistingImagePaths(prev => prev.filter((_, j) => j !== i))
                  }} className="text-xs text-slate-400 hover:text-red-500">Fjern</button>
                </div>
              ))}
              {/* New files */}
              {files.map((f, i) => (
                <div key={`new-${i}`} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-1.5">
                  <IconCheck />
                  <span className="text-green-700 text-sm flex-1 truncate">{f.name}</span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                    className="text-xs text-slate-400 hover:text-red-500">Fjern</button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 rounded-lg py-3 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500 transition flex items-center justify-center gap-2">
                <IconPaperclip /> {existingImageUrls.length + files.length > 0 ? 'Legg til flere vedlegg' : 'Legg ved kvittering (valgfritt)'}
              </button>
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