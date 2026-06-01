// Icons
function IconGear() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}
function IconTrash() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
}
function IconPencil() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
}
function IconChevron({ open }: { open: boolean }) {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={open ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} /></svg>
}
function IconX() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
}
function IconPlus() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
}

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc, updateDoc, getDocs } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, auth, storage } from '../firebase'
import JSZip from 'jszip'
import { useAuth } from '../context/AuthContext'
import { type Entry, type ReceiptEntry, type DrivingEntry, CATEGORIES, calcDrivingAmount } from '../types'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { signOut } from 'firebase/auth'

const RATE_KEY = 'driving_rate_per_km'
const RATE_PASS_KEY = 'driving_rate_per_passenger_km'
const YEAR_KEY = 'selected_year'
const EKOM_PHONE_KEY = (y: number) => `ekom_phone_${y}`
const EKOM_INTERNET_KEY = (y: number) => `ekom_internet_${y}`
const EKOM_PRIVATE_AMT_KEY = 'ekom_private_amt'
const EKOM_ID_KEY = (y: number) => `ekom_entry_id_${y}`
const HK_AMOUNT_KEY = (y: number) => `hjemmekontor_amount_${y}`
const HK_ID_KEY = (y: number) => `hjemmekontor_entry_id_${y}`

const MONTHS = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember']
const QUARTERS = ['Q1 (jan–mar)', 'Q2 (apr–jun)', 'Q3 (jul–sep)', 'Q4 (okt–des)']

interface IncomeEntry {
  id?: string
  userId: string
  amount: number
  date: string
  description: string
  createdAt: number
}

function EkomModal({ userId, year, onClose }: { userId: string; year: number; onClose: () => void }) {
  const [phoneMonths, setPhoneMonths] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(EKOM_PHONE_KEY(year)) || 'null') || Array(12).fill(0) } catch { return Array(12).fill(0) }
  })
  const [internetQuarters, setInternetQuarters] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(EKOM_INTERNET_KEY(year)) || 'null') || Array(4).fill(0) } catch { return Array(4).fill(0) }
  })
  const [privateAmt, setPrivateAmt] = useState(() => parseFloat(localStorage.getItem(EKOM_PRIVATE_AMT_KEY) || '0'))
  const [saving, setSaving] = useState(false)

  const totalPhone = phoneMonths.reduce((s, v) => s + (Number(v) || 0), 0)
  const totalInternet = internetQuarters.reduce((s, v) => s + (Number(v) || 0), 0)
  const totalGross = totalPhone + totalInternet
  const deductionAmount = Math.min(parseFloat(String(privateAmt)) || 0, totalGross)
  const netAmount = Math.round((totalGross - deductionAmount) * 100) / 100

  function updatePhone(i: number, val: string) {
    const next = [...phoneMonths]; next[i] = parseFloat(val) || 0; setPhoneMonths(next)
  }
  function updateInternet(i: number, val: string) {
    const next = [...internetQuarters]; next[i] = parseFloat(val) || 0; setInternetQuarters(next)
  }

  async function handleSave() {
    setSaving(true)
    localStorage.setItem(EKOM_PHONE_KEY(year), JSON.stringify(phoneMonths))
    localStorage.setItem(EKOM_INTERNET_KEY(year), JSON.stringify(internetQuarters))
    localStorage.setItem(EKOM_PRIVATE_AMT_KEY, String(privateAmt))
    const category = CATEGORIES.find(c => c.post === '7500')!
    const updateData = { amount: netAmount, category, description: 'EKOM-beregning (automatisk)' }
    const existingId = localStorage.getItem(EKOM_ID_KEY(year))
    if (existingId) {
      try { await updateDoc(doc(db, 'receipts', existingId), updateData) }
      catch {
        const d = await addDoc(collection(db, 'receipts'), { userId, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${year}-12-31`, createdAt: Date.now(), ...updateData })
        localStorage.setItem(EKOM_ID_KEY(year), d.id)
      }
    } else {
      const d = await addDoc(collection(db, 'receipts'), { userId, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${year}-12-31`, createdAt: Date.now(), ...updateData })
      localStorage.setItem(EKOM_ID_KEY(year), d.id)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-semibold text-slate-800">EKOM-kalkulator {year}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><IconX /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Telefon — månedlige utgifter</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {MONTHS.map((m, i) => (
                <div key={m} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-8 shrink-0">{m.slice(0, 3)}</span>
                  <input type="number" value={phoneMonths[i] || ''} onChange={e => updatePhone(i, e.target.value)}
                    min="0" step="1" placeholder="0"
                    className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">Sum: {totalPhone.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Internett — kvartalsvise utgifter</p>
            <div className="space-y-2">
              {QUARTERS.map((q, i) => (
                <div key={q} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-24 shrink-0">{q}</span>
                  <input type="number" value={internetQuarters[i] || ''} onChange={e => updateInternet(i, e.target.value)}
                    min="0" step="1" placeholder="0"
                    className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">Sum: {totalInternet.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</p>
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
            <div className="flex justify-between text-slate-600"><span>Telefon totalt</span><span>{totalPhone.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span></div>
            <div className="flex justify-between text-slate-600"><span>Internett totalt</span><span>{totalInternet.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span></div>
            <div className="flex justify-between text-slate-400 text-xs"><span>Brutto</span><span>{totalGross.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span></div>
            <div className="flex justify-between text-red-500 text-xs"><span>− Privat bruk</span><span>−{deductionAmount.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span></div>
            <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-1.5">
              <span>Post 7500 fradrag</span><span>{netAmount.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 shrink-0">
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition text-sm">
            {saving ? 'Lagrer...' : 'Lagre EKOM-beregning'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState<Entry[]>([])
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(() => parseInt(localStorage.getItem(YEAR_KEY) || String(new Date().getFullYear())))
  const [activeTab, setActiveTab] = useState<'list' | 'report'>('list')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [ratePerKm, setRatePerKm] = useState(() => parseFloat(localStorage.getItem(RATE_KEY) || '3.50'))
  const [ratePerPassengerKm, setRatePerPassengerKm] = useState(() => parseFloat(localStorage.getItem(RATE_PASS_KEY) || '1.00'))
  const [showSettings, setShowSettings] = useState(false)
  const [showEkomModal, setShowEkomModal] = useState(false)
  const [showIncome, setShowIncome] = useState(false)
  const [hjemmekontorAmt, setHjemmekontorAmt] = useState('')
  const [savingHjemmekontor, setSavingHjemmekontor] = useState(false)

  // Income form
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeDate, setIncomeDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [incomeDesc, setIncomeDesc] = useState('')
  const [savingIncome, setSavingIncome] = useState(false)

  useEffect(() => { localStorage.setItem(RATE_KEY, String(ratePerKm)) }, [ratePerKm])
  useEffect(() => { localStorage.setItem(RATE_PASS_KEY, String(ratePerPassengerKm)) }, [ratePerPassengerKm])
  useEffect(() => { localStorage.setItem(YEAR_KEY, String(selectedYear)) }, [selectedYear])
  useEffect(() => {
    setHjemmekontorAmt(localStorage.getItem(HK_AMOUNT_KEY(selectedYear)) || '')
  }, [selectedYear])

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

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'income'), where('userId', '==', user.uid))
    return onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as IncomeEntry))
      data.sort((a, b) => b.date.localeCompare(a.date))
      setIncomeEntries(data)
    })
  }, [user])

  function getAmount(entry: Entry): number {
    if (entry.entryType === 'receipt') return (entry as ReceiptEntry).amount
    const d = entry as DrivingEntry
    return calcDrivingAmount(d.distance, d.tripType, d.passengers, ratePerKm, ratePerPassengerKm)
  }

  const yearEntries = entries.filter(r => r.date.startsWith(String(selectedYear)))
  const yearIncome = incomeEntries.filter(r => r.date.startsWith(String(selectedYear)))
  const totalExpenses = yearEntries.reduce((sum, e) => sum + getAmount(e), 0)
  const totalIncome = yearIncome.reduce((sum, e) => sum + e.amount, 0)

  const byCategory = CATEGORIES.map(cat => {
    const items = yearEntries.filter(e => e.category.post === cat.post)
    const sum = items.reduce((s, e) => s + getAmount(e), 0)
    return { ...cat, items, sum }
  }).filter(c => c.sum > 0)

  async function handleDelete(entry: Entry) {
    if (!entry.id) return
    if (!confirm('Slett denne oppføringen?')) return
    try {
      if (entry.entryType === 'receipt' && (entry as ReceiptEntry).imagePath) {
        try { await deleteObject(ref(storage, (entry as ReceiptEntry).imagePath)) } catch {}
      }
      await deleteDoc(doc(db, 'receipts', entry.id))
    } catch (e) { console.error(e) }
  }

  async function handleAddIncome(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !incomeAmount) return
    setSavingIncome(true)
    try {
      await addDoc(collection(db, 'income'), {
        userId: user.uid,
        amount: parseFloat(incomeAmount),
        date: incomeDate,
        description: incomeDesc,
        createdAt: Date.now(),
      })
      setIncomeAmount('')
      setIncomeDesc('')
      setIncomeDate(format(new Date(), 'yyyy-MM-dd'))
    } catch (err) { console.error(err) }
    finally { setSavingIncome(false) }
  }

  async function handleDeleteIncome(entry: IncomeEntry) {
    if (!entry.id) return
    if (!confirm('Slett inntekt?')) return
    try { await deleteDoc(doc(db, 'income', entry.id)) } catch (e) { console.error(e) }
  }

  async function handleSaveHjemmekontor() {
    if (!user) return
    setSavingHjemmekontor(true)
    const amount = parseFloat(hjemmekontorAmt) || 0
    localStorage.setItem(HK_AMOUNT_KEY(selectedYear), String(amount))
    const category = CATEGORIES.find(c => c.post === '7100')!
    const updateData = { amount, category, description: 'Hjemmekontor fradrag' }
    const existingId = localStorage.getItem(HK_ID_KEY(selectedYear))
    if (existingId) {
      try { await updateDoc(doc(db, 'receipts', existingId), updateData) }
      catch {
        if (amount > 0) {
          const d = await addDoc(collection(db, 'receipts'), { userId: user.uid, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${selectedYear}-12-31`, createdAt: Date.now(), ...updateData })
          localStorage.setItem(HK_ID_KEY(selectedYear), d.id)
        }
      }
    } else if (amount > 0) {
      const d = await addDoc(collection(db, 'receipts'), { userId: user.uid, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${selectedYear}-12-31`, createdAt: Date.now(), ...updateData })
      localStorage.setItem(HK_ID_KEY(selectedYear), d.id)
    }
    setSavingHjemmekontor(false)
  }

  async function handleDownloadReceipts() {
    if (!user) return
    const snap = await getDocs(query(collection(db, 'receipts'), where('userId', '==', user.uid)))
    const withFiles = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as ReceiptEntry & { id: string }))
      .filter(e => e.imageUrl)
    if (withFiles.length === 0) { alert('Ingen vedlegg funnet.'); return }
    const zip = new JSZip()
    await Promise.all(withFiles.map(async (e) => {
      try {
        const resp = await fetch(e.imageUrl)
        const blob = await resp.blob()
        const ext = blob.type === 'application/pdf' ? 'pdf' : blob.type.split('/')[1] || 'jpg'
        const name = e.imagePath ? e.imagePath.split('/').pop()! : `${e.id}.${ext}`
        zip.file(name, blob)
      } catch { /* skip if fetch fails */ }
    }))
    const content = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(content)
    a.download = `kvitteringer_${selectedYear}.zip`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function handleBackup() {
    if (!user) return
    const [receiptSnap, incomeSnap] = await Promise.all([
      getDocs(query(collection(db, 'receipts'), where('userId', '==', user.uid))),
      getDocs(query(collection(db, 'income'), where('userId', '==', user.uid))),
    ])
    const data = {
      exportedAt: new Date().toISOString(),
      receipts: receiptSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      income: incomeSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `regnskap_backup_${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const years = Array.from(new Set([
    ...entries.map(e => parseInt(e.date.slice(0, 4))),
    ...incomeEntries.map(e => parseInt(e.date.slice(0, 4))),
  ])).sort((a, b) => b - a)
  if (!years.includes(selectedYear)) years.push(selectedYear)

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/regnskap/logo.png" alt="logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-base font-bold text-slate-800">Sørbø Musikk</h1>
              <p className="text-xs text-slate-400">{user?.email} <span className="text-slate-300">v1.00</span></p>
            </div>
          </div>
          <button onClick={() => setShowSettings(true)}
            className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"
            title="Innstillinger">
            <IconGear />
          </button>
        </div>
      </header>

      {/* Settings drawer */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setShowSettings(false)} />
          <div className="w-80 bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Innstillinger</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><IconX /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

              {/* Year */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Regnskapsår</label>
                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Income */}
              <div>
                <button onClick={() => setShowIncome(!showIncome)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 mb-1">
                  <span>Inntekter {selectedYear}</span>
                  <span className="flex items-center gap-1 text-slate-400 font-normal text-xs">
                    {totalIncome > 0 && <span>{totalIncome.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>}
                    <IconChevron open={showIncome} />
                  </span>
                </button>
                {showIncome && (
                  <div className="space-y-2 mt-2">
                    <form onSubmit={handleAddIncome} className="space-y-2">
                      <div className="flex gap-2">
                        <input type="number" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)}
                          inputMode="decimal" min="0" step="0.01" placeholder="Beløp" required
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <button type="submit" disabled={savingIncome}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm px-3 py-2 rounded-lg transition whitespace-nowrap">
                          Legg til
                        </button>
                      </div>
                      <input type="text" value={incomeDesc} onChange={e => setIncomeDesc(e.target.value)}
                        placeholder="Beskrivelse (valgfritt)"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </form>
                    {yearIncome.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        {yearIncome.map(inc => (
                          <div key={inc.id} className="flex items-center justify-between text-xs py-1">
                            <div className="text-slate-600 flex-1 min-w-0">
                              <span className="font-medium">{inc.amount.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>
                              {inc.description && <span className="text-slate-400 ml-1">{inc.description}</span>}
                              <span className="text-slate-300 ml-1">{format(new Date(inc.date), 'd. MMM', { locale: nb })}</span>
                            </div>
                            <button onClick={() => handleDeleteIncome(inc)} className="text-slate-300 hover:text-red-400 ml-2 shrink-0"><IconTrash /></button>
                          </div>
                        ))}
                        <p className="text-xs font-semibold text-slate-700 pt-1 border-t border-slate-100">
                          Total: {totalIncome.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Driving rates */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kjøresatser</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Kr per km</label>
                    <input type="number" value={ratePerKm} onChange={e => setRatePerKm(parseFloat(e.target.value))}
                      min="0" step="0.01"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Kr per passasjer per km</label>
                    <input type="number" value={ratePerPassengerKm} onChange={e => setRatePerPassengerKm(parseFloat(e.target.value))}
                      min="0" step="0.01"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* EKOM */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">EKOM (Telefon & internett)</label>
                <button onClick={() => { setShowSettings(false); setShowEkomModal(true) }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 text-left transition flex items-center justify-between">
                  <span>Åpne EKOM-kalkulator for {selectedYear}</span>
                  <span className="text-slate-400">→</span>
                </button>
                {localStorage.getItem(EKOM_ID_KEY(selectedYear)) && (
                  <p className="text-xs text-green-600 mt-1">Beregning lagret for {selectedYear}</p>
                )}
              </div>

              {/* Hjemmekontor */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Hjemmekontor</label>
                <p className="text-xs text-slate-400 mb-2">Årsbeløp registreres på post 7100</p>
                <div className="flex gap-2">
                  <input type="number" value={hjemmekontorAmt} onChange={e => setHjemmekontorAmt(e.target.value)}
                    inputMode="decimal" min="0" step="1" placeholder="0"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <button onClick={handleSaveHjemmekontor} disabled={savingHjemmekontor}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm px-4 py-2 rounded-lg transition whitespace-nowrap">
                    {savingHjemmekontor ? '...' : 'Lagre'}
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <button onClick={handleDownloadReceipts}
                  className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg py-2 hover:bg-slate-50 transition">
                  Last ned alle kvitteringer (ZIP)
                </button>
                <button onClick={handleBackup}
                  className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg py-2 hover:bg-slate-50 transition">
                  Last ned backup (JSON)
                </button>
                <button onClick={() => signOut(auth)}
                  className="w-full text-sm text-red-500 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition">
                  Logg ut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEkomModal && user && (
        <EkomModal userId={user.uid} year={selectedYear} onClose={() => setShowEkomModal(false)} />
      )}

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Summary card */}
        <div className="bg-blue-600 text-white rounded-2xl p-5">
          <p className="text-sm text-blue-100">Totale utgifter {selectedYear}</p>
          <p className="text-3xl font-bold mt-1">{totalExpenses.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</p>
          <p className="text-xs text-blue-200 mt-1">{yearEntries.length} oppføringer</p>
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
            onDelete={handleDelete} onEdit={e => navigate(`/add?edit=${e.id}`)} getAmount={getAmount} />
        ) : (
          <TaxReport byCategory={byCategory} total={totalExpenses} year={selectedYear}
            ratePerKm={ratePerKm} ratePerPassengerKm={ratePerPassengerKm} />
        )}
      </div>

      <button onClick={() => navigate('/add')}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition">
        <IconPlus />
      </button>
    </div>
  )
}

function EntryList({ entries, expandedId, setExpandedId, onDelete, onEdit, getAmount }: {
  entries: Entry[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  onDelete: (e: Entry) => void
  onEdit: (e: Entry) => void
  getAmount: (e: Entry) => number
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {isDriving ? `${d!.from} → ${d!.to}${d!.tripType === 'return' ? ' (t/r)' : ''}` : (e.description || e.category.label)}
                </p>
                <p className="text-xs text-slate-400">
                  Post {e.category.post} · {format(new Date(e.date), 'd. MMM yyyy', { locale: nb })}
                  {isDriving && ` · ${d!.tripType === 'return' ? d!.distance * 2 : d!.distance} km`}
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-800 ml-3 shrink-0">
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
                    {(e as ReceiptEntry).imageUrl && (
                      (e as ReceiptEntry).imagePath?.endsWith('.pdf') ? (
                        <a href={(e as ReceiptEntry).imageUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs mt-1">
                          Åpne PDF-kvittering
                        </a>
                      ) : (
                        <a href={(e as ReceiptEntry).imageUrl} target="_blank" rel="noopener noreferrer">
                          <img src={(e as ReceiptEntry).imageUrl} alt="Kvittering"
                            className="mt-2 rounded-lg border border-slate-200 max-h-48 object-contain w-full" />
                        </a>
                      )
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(e)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
                    <IconPencil /> Rediger
                  </button>
                  <button onClick={() => onDelete(e)}
                    className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">
                    <IconTrash /> Slett
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
        <p className="text-sm">Ingen data for {year} ennå.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800">Altinn-sammendrag {year}</p>
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
