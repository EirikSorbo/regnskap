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
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
}
function IconArchive() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
}
function IconUpload() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
}
function IconPhone() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
}
function IconCar() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16H11V6l-4 1-2 4H3a1 1 0 00-1 1v2a1 1 0 001 1h1m9-9h4l2 4h1a1 1 0 011 1v2a1 1 0 01-1 1h-1m-9 0h4" /></svg>
}

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc, updateDoc, getDocs } from 'firebase/firestore'
import { ref, deleteObject, getBlob } from 'firebase/storage'
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
const AV_AMOUNT_KEY = (y: number) => `avskrivninger_amount_${y}`
const AV_ID_KEY = (y: number) => `avskrivninger_entry_id_${y}`

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

function BackupModal({ years, downloadingZip, onBackup, onZip, onClose }: {
  years: number[]
  downloadingZip: boolean
  onBackup: (year?: number) => void
  onZip: (year?: number) => void
  onClose: () => void
}) {
  const [backupYear, setBackupYear] = useState<number | 'alle'>('alle')

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-semibold text-slate-800">Backup &amp; nedlasting</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><IconX /></button>
        </div>
        <div className="px-5 py-5 space-y-5">
          {/* Year selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">År</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setBackupYear('alle')}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${backupYear === 'alle' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                Alle år
              </button>
              {years.map(y => (
                <button key={y} onClick={() => setBackupYear(y)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition ${backupYear === y ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Last ned</p>
            <button onClick={() => onBackup(backupYear === 'alle' ? undefined : backupYear)}
              className="w-full flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition text-left">
              <IconUpload />
              <div>
                <p className="text-sm font-medium text-slate-700">Data (JSON)</p>
                <p className="text-xs text-slate-400">Alle oppføringer og inntekter{backupYear !== 'alle' ? ` for ${backupYear}` : ''}</p>
              </div>
            </button>
            <button onClick={() => onZip(backupYear === 'alle' ? undefined : backupYear)} disabled={downloadingZip}
              className="w-full flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 disabled:opacity-50 transition text-left">
              <IconArchive />
              <div>
                <p className="text-sm font-medium text-slate-700">{downloadingZip ? 'Laster ned...' : 'Filer (ZIP)'}</p>
                <p className="text-xs text-slate-400">Alle kvitteringsvedlegg{backupYear !== 'alle' ? ` for ${backupYear}` : ''}</p>
              </div>
            </button>
            <button
              onClick={async () => {
                await onBackup(backupYear === 'alle' ? undefined : backupYear)
                await onZip(backupYear === 'alle' ? undefined : backupYear)
              }}
              disabled={downloadingZip}
              className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl px-4 py-3 transition text-left">
              <IconArchive />
              <div>
                <p className="text-sm font-medium">Full backup (JSON + ZIP)</p>
                <p className="text-xs text-white/60">Data og filer{backupYear !== 'alle' ? ` for ${backupYear}` : ''}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [ratePerKm, setRatePerKm] = useState(() => parseFloat(localStorage.getItem(RATE_KEY) || '3.50'))
  const [ratePerPassengerKm, setRatePerPassengerKm] = useState(() => parseFloat(localStorage.getItem(RATE_PASS_KEY) || '1.00'))
  const [showSettings, setShowSettings] = useState(false)
  const [showEkomModal, setShowEkomModal] = useState(false)
  const [showIncome, setShowIncome] = useState(false)
  const [showDriving, setShowDriving] = useState(false)
  const [showHjemmekontor, setShowHjemmekontor] = useState(false)
  const [showAvskrivninger, setShowAvskrivninger] = useState(false)
  const [hjemmekontorAmt, setHjemmekontorAmt] = useState('')
  const [savingHjemmekontor, setSavingHjemmekontor] = useState(false)
  const [avskrivningerAmt, setAvskrivningerAmt] = useState('')
  const [savingAvskrivninger, setSavingAvskrivninger] = useState(false)

  // Income form
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeDate, setIncomeDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [savingIncome, setSavingIncome] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [showAltinn, setShowAltinn] = useState(false)
  const [showReceiptList, setShowReceiptList] = useState(false)
  const [showDrivingModal, setShowDrivingModal] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [importStatus, setImportStatus] = useState('')
  const [downloadingZip, setDownloadingZip] = useState(false)

  useEffect(() => { localStorage.setItem(RATE_KEY, String(ratePerKm)) }, [ratePerKm])
  useEffect(() => { localStorage.setItem(RATE_PASS_KEY, String(ratePerPassengerKm)) }, [ratePerPassengerKm])
  useEffect(() => { localStorage.setItem(YEAR_KEY, String(selectedYear)) }, [selectedYear])
  useEffect(() => {
    setHjemmekontorAmt(localStorage.getItem(HK_AMOUNT_KEY(selectedYear)) || '')
    setAvskrivningerAmt(localStorage.getItem(AV_AMOUNT_KEY(selectedYear)) || '')
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
        createdAt: Date.now(),
      })
      setIncomeAmount('')
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

  async function handleSaveAvskrivninger() {
    if (!user) return
    setSavingAvskrivninger(true)
    const amount = parseFloat(avskrivningerAmt) || 0
    localStorage.setItem(AV_AMOUNT_KEY(selectedYear), String(amount))
    const category = CATEGORIES.find(c => c.post === '6000')!
    const updateData = { amount, category, description: 'Avskrivninger (automatisk)' }
    const existingId = localStorage.getItem(AV_ID_KEY(selectedYear))
    if (existingId) {
      try { await updateDoc(doc(db, 'receipts', existingId), updateData) }
      catch {
        if (amount > 0) {
          const d = await addDoc(collection(db, 'receipts'), { userId: user.uid, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${selectedYear}-12-31`, createdAt: Date.now(), ...updateData })
          localStorage.setItem(AV_ID_KEY(selectedYear), d.id)
        }
      }
    } else if (amount > 0) {
      const d = await addDoc(collection(db, 'receipts'), { userId: user.uid, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${selectedYear}-12-31`, createdAt: Date.now(), ...updateData })
      localStorage.setItem(AV_ID_KEY(selectedYear), d.id)
    }
    setSavingAvskrivninger(false)
  }

  async function handleDownloadZip(yearFilter?: number) {
    if (!user || downloadingZip) return
    setDownloadingZip(true)
    try {
      const snap = await getDocs(collection(db, 'receipts'))
      const withFiles = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ReceiptEntry & { id: string }))
        .filter(e => e.userId === user.uid && e.imagePath &&
          (!yearFilter || e.date?.startsWith(String(yearFilter))))
      if (withFiles.length === 0) { alert('Ingen vedlegg funnet.'); return }
      const zip = new JSZip()
      let added = 0
      const errors: string[] = []
      for (const e of withFiles) {
        const name = e.imagePath.split('/').pop()!
        try {
          const blob = await Promise.race([
            getBlob(ref(storage, e.imagePath)),
            new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000))
          ])
          zip.file(name, blob)
          added++
        } catch (err) {
          console.warn('Feil:', name, err)
          errors.push(name)
        }
      }
      if (added === 0) { alert(`Ingen filer lastet ned.\n\nFeil:\n${errors.join('\n')}`); return }
      const content = await zip.generateAsync({ type: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(content)
      a.download = `kvitteringer_${yearFilter ?? 'alle'}.zip`
      a.click()
      URL.revokeObjectURL(a.href)
      if (errors.length > 0) alert(`${added} lastet ned. ${errors.length} feilet:\n${errors.join('\n')}`)
    } catch (err) {
      alert('Feil: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setDownloadingZip(false)
    }
  }

  async function handleBackup(yearFilter?: number) {
    if (!user) return
    const [receiptSnap, incomeSnap] = await Promise.all([
      getDocs(query(collection(db, 'receipts'), where('userId', '==', user.uid))),
      getDocs(query(collection(db, 'income'), where('userId', '==', user.uid))),
    ])
    const filterFn = (d: { date?: string }) => !yearFilter || d.date?.startsWith(String(yearFilter))
    const data = {
      exportedAt: new Date().toISOString(),
      year: yearFilter ?? 'alle',
      receipts: receiptSnap.docs.map(d => ({ id: d.id, ...d.data() } as { date?: string })).filter(filterFn),
      income: incomeSnap.docs.map(d => ({ id: d.id, ...d.data() } as { date?: string })).filter(filterFn),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `regnskap_backup_${yearFilter ?? 'alle'}_${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function handleImportBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setImportStatus('Leser fil...')
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data.receipts || !data.income) { setImportStatus('Ugyldig backup-fil.'); return }
      setImportStatus('Importerer...')
      let count = 0
      for (const r of data.receipts) {
        const { id: _id, ...fields } = r
        if (fields.userId !== user.uid) continue
        await addDoc(collection(db, 'receipts'), fields)
        count++
      }
      for (const inc of data.income) {
        const { id: _id, ...fields } = inc
        if (fields.userId !== user.uid) continue
        await addDoc(collection(db, 'income'), fields)
        count++
      }
      setImportStatus(`✓ ${count} oppføringer importert.`)
    } catch (err) {
      setImportStatus('Feil: ' + (err instanceof Error ? err.message : String(err)))
    }
    e.target.value = ''
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from(new Set([
    ...entries.map(e => parseInt(e.date.slice(0, 4))),
    ...incomeEntries.map(e => parseInt(e.date.slice(0, 4))),
    currentYear,
    currentYear - 1,
    currentYear - 2,
  ])).sort((a, b) => b - a)
  if (!years.includes(selectedYear)) years.push(selectedYear)

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-base font-bold text-slate-800">Sørbø Musikk</h1>
              <p className="text-xs text-slate-400">{user?.email} <span className="text-slate-300">v1.19</span></p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowDrivingModal(true)}
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"
              title="Kjøring">
              <IconCar />
            </button>
            <button onClick={() => setShowEkomModal(true)}
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"
              title="EKOM-kalkulator">
              <IconPhone />
            </button>
            <button onClick={() => setShowArchive(true)}
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"
              title="Arkiv">
              <IconArchive />
            </button>
            <button onClick={() => setShowSettings(true)}
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"
              title="Innstillinger">
              <IconGear />
            </button>
          </div>
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
                  <span>Inntekter</span>
                  <span className="flex items-center gap-1 text-slate-400 font-normal text-xs">
                    {totalIncome > 0 && <span>{totalIncome.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>}
                    <IconChevron open={showIncome} />
                  </span>
                </button>
                {showIncome && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs text-slate-400 mb-1">Inntekter registreres på post 3000</p>
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
                    </form>
                    {yearIncome.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        {yearIncome.map(inc => (
                          <div key={inc.id} className="flex items-center justify-between text-xs py-1">
                            <div className="text-slate-600 flex-1 min-w-0">
                              <span className="font-medium">{inc.amount.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>
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
                <button onClick={() => setShowDriving(!showDriving)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 mb-1">
                  <span>Kjøresatser</span>
                  <span className="flex items-center gap-1 text-slate-400 font-normal text-xs">
                    <span>{ratePerKm.toFixed(2)} kr/km</span>
                    <IconChevron open={showDriving} />
                  </span>
                </button>
                {showDriving && (
                  <div className="space-y-3 mt-2">
                    <p className="text-xs text-slate-400">Kjøring registreres på post 7080</p>
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
                )}
              </div>

              {/* Hjemmekontor */}
              <div>
                <button onClick={() => setShowHjemmekontor(!showHjemmekontor)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 mb-1">
                  <span>Hjemmekontor</span>
                  <span className="flex items-center gap-1 text-slate-400 font-normal text-xs">
                    {hjemmekontorAmt && parseFloat(hjemmekontorAmt) > 0 && (
                      <span>{parseFloat(hjemmekontorAmt).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>
                    )}
                    <IconChevron open={showHjemmekontor} />
                  </span>
                </button>
                {showHjemmekontor && (
                  <div className="mt-2">
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
                )}
              </div>

              {/* Avskrivninger */}
              <div>
                <button onClick={() => setShowAvskrivninger(!showAvskrivninger)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 mb-1">
                  <span>Avskrivninger</span>
                  <span className="flex items-center gap-1 text-slate-400 font-normal text-xs">
                    {avskrivningerAmt && parseFloat(avskrivningerAmt) > 0 && (
                      <span>{parseFloat(avskrivningerAmt).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>
                    )}
                    <IconChevron open={showAvskrivninger} />
                  </span>
                </button>
                {showAvskrivninger && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-400 mb-2">Årsbeløp registreres på post 6000</p>
                    <div className="flex gap-2">
                      <input type="number" value={avskrivningerAmt} onChange={e => setAvskrivningerAmt(e.target.value)}
                        inputMode="decimal" min="0" step="1" placeholder="0"
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      <button onClick={handleSaveAvskrivninger} disabled={savingAvskrivninger}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm px-4 py-2 rounded-lg transition whitespace-nowrap">
                        {savingAvskrivninger ? '...' : 'Lagre'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <button onClick={() => signOut(auth)}
                  className="w-full text-sm text-red-500 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition">
                  Logg ut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive drawer */}
      {showArchive && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => { setShowArchive(false); setImportStatus('') }} />
          <div className="w-80 bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Arkiv</h2>
              <button onClick={() => { setShowArchive(false); setImportStatus('') }} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><IconX /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              {/* Altinn button */}
              <div>
                <button onClick={() => setShowAltinn(true)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition">
                  <span>Altinn-oversikt {selectedYear}</span>
                  <span className="text-slate-400 text-base">→</span>
                </button>
              </div>

              {/* Kvitteringer button */}
              <div>
                <button onClick={() => setShowReceiptList(true)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition">
                  <span>Kvitteringer</span>
                  <span className="text-slate-400 text-xs font-normal">{entries.filter(e => e.entryType === 'receipt' && (e as ReceiptEntry).imageUrl).length} vedlegg →</span>
                </button>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <button onClick={() => setShowBackupModal(true)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition">
                  <span>Backup &amp; nedlasting</span>
                  <span className="text-slate-400 text-base">→</span>
                </button>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Import</p>
                <p className="text-xs text-slate-400 mb-3">Importer en tidligere backup-fil. Eksisterende data beholdes.</p>
                <label className="w-full flex items-center gap-2 text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer">
                  <IconUpload />
                  <span>Importer backup (JSON)</span>
                  <input type="file" accept=".json,application/json" className="hidden" onChange={handleImportBackup} />
                </label>
                {importStatus && (
                  <p className={`text-xs mt-2 px-1 ${importStatus.startsWith('✓') ? 'text-green-600' : importStatus.startsWith('Feil') ? 'text-red-500' : 'text-slate-400'}`}>
                    {importStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showEkomModal && user && (
        <EkomModal userId={user.uid} year={selectedYear} onClose={() => setShowEkomModal(false)} />
      )}

      {/* Backup modal */}
      {showBackupModal && (
        <BackupModal
          years={years}
          downloadingZip={downloadingZip}
          onBackup={handleBackup}
          onZip={handleDownloadZip}
          onClose={() => setShowBackupModal(false)}
        />
      )}

      {/* Driving overview modal */}
      {showDrivingModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDrivingModal(false)} />
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-semibold text-slate-800">Kjøring {selectedYear}</h2>
              <button onClick={() => setShowDrivingModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><IconX /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {(() => {
                const drivingEntries = yearEntries.filter(e => e.entryType === 'driving') as DrivingEntry[]
                const totalKm = drivingEntries.reduce((s, d) => s + (d.tripType === 'return' ? d.distance * 2 : d.distance), 0)
                const totalAmt = drivingEntries.reduce((s, e) => s + getAmount(e), 0)
                if (drivingEntries.length === 0) {
                  return <p className="text-sm text-slate-400 py-8 text-center">Ingen kjøreturer registrert for {selectedYear}.</p>
                }
                return (
                  <>
                    <div className="flex gap-3 text-xs">
                      <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-slate-400">Antall turer</p>
                        <p className="font-semibold text-slate-800 text-sm">{drivingEntries.length}</p>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-slate-400">Totalt km</p>
                        <p className="font-semibold text-slate-800 text-sm">{totalKm.toLocaleString('nb-NO')} km</p>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-slate-400">Fradrag</p>
                        <p className="font-semibold text-slate-800 text-sm">{totalAmt.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {drivingEntries.sort((a, b) => b.date.localeCompare(a.date)).map(d => (
                        <div key={d.id} className="border border-slate-200 rounded-lg px-3 py-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 truncate">{d.from} → {d.to}{d.tripType === 'return' ? ' (t/r)' : ''}</p>
                              <p className="text-xs text-slate-400">{format(new Date(d.date), 'd. MMM yyyy', { locale: nb })} · {d.tripType === 'return' ? d.distance * 2 : d.distance} km{d.passengers > 0 ? ` · ${d.passengers} pass.` : ''}</p>
                              {d.description && <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>}
                            </div>
                            <span className="text-sm font-semibold text-slate-700 shrink-0">{getAmount(d).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-slate-100 shrink-0">
              <button onClick={() => { setShowDrivingModal(false); navigate('/add?type=driving') }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm">
                <IconPlus /> Legg til kjøring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Altinn modal */}
      {showAltinn && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAltinn(false)} />
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-semibold text-slate-800">Altinn-oversikt {selectedYear}</h2>
              <button onClick={() => setShowAltinn(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><IconX /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="rounded-none overflow-hidden text-sm">
                {/* Income */}
                <div className="flex items-center justify-between px-5 py-3 bg-green-50 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-700">Post 3000</span>
                    <span className="text-slate-400 text-xs ml-2">Salgsinntekter</span>
                  </div>
                  <span className={`font-semibold tabular-nums ${totalIncome > 0 ? 'text-green-700' : 'text-slate-300'}`}>
                    {totalIncome.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
                  </span>
                </div>
                {/* All expense categories — always shown */}
                {[...CATEGORIES].filter(cat => cat.post !== '6000' && cat.post !== '7100').map(cat => {
                  const sum = yearEntries.filter(e => e.category.post === cat.post).reduce((s, e) => s + getAmount(e), 0)
                  return (
                    <div key={cat.post} className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-700">Post {cat.post}</span>
                        <span className="text-slate-400 text-xs ml-2">{cat.label}</span>
                      </div>
                      <span className={`font-semibold tabular-nums ${sum > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                        {sum.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
                      </span>
                    </div>
                  )
                })}
                {/* Hjemmekontor */}
                {(() => {
                  const sum = yearEntries.filter(e => e.category.post === '7100').reduce((s, e) => s + getAmount(e), 0)
                  return (
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-700">Post 7100</span>
                        <span className="text-slate-400 text-xs ml-2">Hjemmekontor</span>
                      </div>
                      <span className={`font-semibold tabular-nums ${sum > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                        {sum.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
                      </span>
                    </div>
                  )
                })()}
                {/* Avskrivninger */}
                {(() => {
                  const sum = yearEntries.filter(e => e.category.post === '6000').reduce((s, e) => s + getAmount(e), 0)
                  return (
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-700">Post 6000</span>
                        <span className="text-slate-400 text-xs ml-2">Avskrivninger (saldometoden 30%)</span>
                      </div>
                      <span className={`font-semibold tabular-nums ${sum > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                        {sum.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
                      </span>
                    </div>
                  )
                })()}
                {/* Result */}
                <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-t border-slate-200">
                  <span className="text-sm font-semibold text-slate-600">Resultat (inntekt − utgifter)</span>
                  <span className={`font-bold tabular-nums text-base ${totalIncome - totalExpenses >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {(totalIncome - totalExpenses).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt list modal */}
      {showReceiptList && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReceiptList(false)} />
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-semibold text-slate-800">Kvitteringer</h2>
              <button onClick={() => setShowReceiptList(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><IconX /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {(() => {
                const files = entries
                  .filter(e => e.entryType === 'receipt' && (e as ReceiptEntry).imageUrl)
                  .sort((a, b) => b.date.localeCompare(a.date))
                if (files.length === 0) return <p className="text-sm text-slate-400 py-8 text-center">Ingen vedlegg lastet opp.</p>
                return (
                  <div className="space-y-2">
                    {files.map(e => {
                      const r = e as ReceiptEntry
                      const filename = r.imagePath?.split('/').pop() ?? 'vedlegg'
                      const isPdf = filename.toLowerCase().endsWith('.pdf') || r.imageUrl?.includes('.pdf')
                      return (
                        <a key={e.id} href={r.imageUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-2 border border-slate-200 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition">
                          <span className="text-xs font-mono text-slate-400 mt-0.5 shrink-0">{isPdf ? 'PDF' : 'IMG'}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-blue-600 truncate">{filename}</p>
                            <p className="text-xs text-slate-400">{e.category.label} · {format(new Date(e.date), 'd. MMM yyyy', { locale: nb })}</p>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Summary card */}
        <div className="bg-blue-600 text-white rounded-2xl p-5">
          <p className="text-sm text-blue-100">Totale utgifter {selectedYear}</p>
          <p className="text-3xl font-bold mt-1">{totalExpenses.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-blue-200">{yearEntries.length} oppføringer</p>
            <button onClick={() => navigate('/add')}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
              <IconPlus />
              Legg til utgift
            </button>
          </div>
        </div>

        {/* Quick-add shortcuts */}
        <div className="flex gap-2">
          <button onClick={() => navigate('/add?post=6500')}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition">
            <span>Utstyr</span>
          </button>
          <button onClick={() => navigate('/add?post=6800')}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition">
            <span>Mat og drikke</span>
          </button>
          <button onClick={() => navigate('/add?type=driving')}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition">
            <span>Kjøring</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Laster...</div>
        ) : (
          <EntryList entries={yearEntries} expandedId={expandedId} setExpandedId={setExpandedId}
            onDelete={handleDelete} onEdit={e => navigate(`/add?edit=${e.id}`)} getAmount={getAmount} />
        )}
      </div>

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

