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
function IconOverview() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
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
import { ref, deleteObject, getBlob, uploadBytes } from 'firebase/storage'
import { db, auth, storage } from '../firebase'
import JSZip from 'jszip'
import { useAuth } from '../context/AuthContext'
import { useSettings, convertLegacySettings } from '../context/SettingsContext'
import { type Entry, type ReceiptEntry, type DrivingEntry, CATEGORIES, calcDrivingAmount, getImageUrls, getImagePaths } from '../types'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { signOut } from 'firebase/auth'

const YEAR_KEY = 'selected_year'

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

function BackupModal({ years, downloadingZip, onBackup, onZip, onFullBackup, onClose }: {
  years: number[]
  downloadingZip: boolean
  onBackup: (year?: number) => void
  onZip: (year?: number) => void
  onFullBackup: (year?: number) => void
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
                <p className="text-xs text-slate-400">Alle oppføringer og inntekter{backupYear !== 'alle' ? ` for ${backupYear}` : ' + innstillinger'}</p>
              </div>
            </button>
            <button onClick={() => onZip(backupYear === 'alle' ? undefined : backupYear)} disabled={downloadingZip}
              className="w-full flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 disabled:opacity-50 transition text-left">
              <IconOverview />
              <div>
                <p className="text-sm font-medium text-slate-700">{downloadingZip ? 'Laster ned...' : 'Filer (ZIP)'}</p>
                <p className="text-xs text-slate-400">Alle kvitteringsvedlegg{backupYear !== 'alle' ? ` for ${backupYear}` : ''}</p>
              </div>
            </button>
            <button
              onClick={() => onFullBackup(backupYear === 'alle' ? undefined : backupYear)}
              disabled={downloadingZip}
              className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl px-4 py-3 transition text-left">
              <IconOverview />
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
  const { settings, updateSettings } = useSettings()
  const ys = String(year)
  const [phoneMonths, setPhoneMonths] = useState<number[]>(settings.ekomPhone[ys] || Array(12).fill(0))
  const [internetQuarters, setInternetQuarters] = useState<number[]>(settings.ekomInternet[ys] || Array(4).fill(0))
  const [privateAmt, setPrivateAmt] = useState(settings.ekomPrivateAmt)
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
    const category = CATEGORIES.find(c => c.post === '7500')!
    const updateData = { amount: netAmount, category, description: 'EKOM-beregning (automatisk)' }
    const existingId = settings.ekomEntryIds[ys]
    let entryId = existingId
    if (existingId) {
      try { await updateDoc(doc(db, 'receipts', existingId), updateData) }
      catch {
        const d = await addDoc(collection(db, 'receipts'), { userId, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${year}-12-31`, createdAt: Date.now(), ...updateData })
        entryId = d.id
      }
    } else {
      const d = await addDoc(collection(db, 'receipts'), { userId, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${year}-12-31`, createdAt: Date.now(), ...updateData })
      entryId = d.id
    }
    await updateSettings({
      ekomPhone: { ...settings.ekomPhone, [ys]: phoneMonths },
      ekomInternet: { ...settings.ekomInternet, [ys]: internetQuarters },
      ekomPrivateAmt: parseFloat(String(privateAmt)) || 0,
      ekomEntryIds: { ...settings.ekomEntryIds, [ys]: entryId },
    })
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
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()
  const [entries, setEntries] = useState<Entry[]>([])
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(() => parseInt(localStorage.getItem(YEAR_KEY) || String(new Date().getFullYear())))
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [ratePerKm, setRatePerKm] = useState(settings.drivingRatePerKm)
  const [ratePerPassengerKm, setRatePerPassengerKm] = useState(settings.drivingRatePerPassengerKm)
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
  const [incomeDate, setIncomeDate] = useState(() => `${parseInt(localStorage.getItem(YEAR_KEY) || String(new Date().getFullYear()))}-${format(new Date(), 'MM-dd')}`)
  const [savingIncome, setSavingIncome] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [showAltinn, setShowAltinn] = useState(false)
  const [showReceiptList, setShowReceiptList] = useState(false)
  const [showDrivingModal, setShowDrivingModal] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [importStatus, setImportStatus] = useState('')
  const [importPending, setImportPending] = useState<{ file: File; data: any; attachmentFiles: { name: string; blob: Blob }[] } | null>(null)
  const [downloadingZip, setDownloadingZip] = useState(false)

  // Sync settings from Firestore → local state
  useEffect(() => { setRatePerKm(settings.drivingRatePerKm) }, [settings.drivingRatePerKm])
  useEffect(() => { setRatePerPassengerKm(settings.drivingRatePerPassengerKm) }, [settings.drivingRatePerPassengerKm])
  // Save rates to Firestore on change
  useEffect(() => { if (ratePerKm !== settings.drivingRatePerKm) updateSettings({ drivingRatePerKm: ratePerKm }) }, [ratePerKm])
  useEffect(() => { if (ratePerPassengerKm !== settings.drivingRatePerPassengerKm) updateSettings({ drivingRatePerPassengerKm: ratePerPassengerKm }) }, [ratePerPassengerKm])
  useEffect(() => { localStorage.setItem(YEAR_KEY, String(selectedYear)) }, [selectedYear])
  useEffect(() => {
    const ys = String(selectedYear)
    setHjemmekontorAmt(String(settings.hjemmekontorAmounts[ys] || ''))
    setAvskrivningerAmt(String(settings.avskrivningerAmounts[ys] || ''))
    setIncomeDate(`${selectedYear}-${format(new Date(), 'MM-dd')}`)
  }, [selectedYear, settings.hjemmekontorAmounts, settings.avskrivningerAmounts])

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
      if (entry.entryType === 'receipt') {
        for (const p of getImagePaths(entry as ReceiptEntry)) {
          try { await deleteObject(ref(storage, p)) } catch {}
        }
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
      setIncomeDate(`${selectedYear}-${format(new Date(), 'MM-dd')}`)
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
    const ys = String(selectedYear)
    const amount = parseFloat(hjemmekontorAmt) || 0
    const category = CATEGORIES.find(c => c.post === '7100')!
    const updateData = { amount, category, description: 'Hjemmekontor fradrag' }
    const existingId = settings.hjemmekontorEntryIds[ys]
    let entryId = existingId
    if (existingId) {
      try { await updateDoc(doc(db, 'receipts', existingId), updateData) }
      catch {
        if (amount > 0) {
          const d = await addDoc(collection(db, 'receipts'), { userId: user.uid, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${selectedYear}-12-31`, createdAt: Date.now(), ...updateData })
          entryId = d.id
        }
      }
    } else if (amount > 0) {
      const d = await addDoc(collection(db, 'receipts'), { userId: user.uid, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${selectedYear}-12-31`, createdAt: Date.now(), ...updateData })
      entryId = d.id
    }
    await updateSettings({
      hjemmekontorAmounts: { ...settings.hjemmekontorAmounts, [ys]: amount },
      hjemmekontorEntryIds: { ...settings.hjemmekontorEntryIds, [ys]: entryId || '' },
    })
    setSavingHjemmekontor(false)
  }

  async function handleSaveAvskrivninger() {
    if (!user) return
    setSavingAvskrivninger(true)
    const ys = String(selectedYear)
    const amount = parseFloat(avskrivningerAmt) || 0
    const category = CATEGORIES.find(c => c.post === '6000')!
    const updateData = { amount, category, description: 'Avskrivninger (automatisk)' }
    const existingId = settings.avskrivningerEntryIds[ys]
    let entryId = existingId
    if (existingId) {
      try { await updateDoc(doc(db, 'receipts', existingId), updateData) }
      catch {
        if (amount > 0) {
          const d = await addDoc(collection(db, 'receipts'), { userId: user.uid, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${selectedYear}-12-31`, createdAt: Date.now(), ...updateData })
          entryId = d.id
        }
      }
    } else if (amount > 0) {
      const d = await addDoc(collection(db, 'receipts'), { userId: user.uid, entryType: 'receipt', imageUrl: '', imagePath: '', date: `${selectedYear}-12-31`, createdAt: Date.now(), ...updateData })
      entryId = d.id
    }
    await updateSettings({
      avskrivningerAmounts: { ...settings.avskrivningerAmounts, [ys]: amount },
      avskrivningerEntryIds: { ...settings.avskrivningerEntryIds, [ys]: entryId || '' },
    })
    setSavingAvskrivninger(false)
  }

  function buildAttachmentMap(filteredEntries: Entry[]) {
    let idx = 1
    const map: { path: string; stdName: string }[] = []
    for (const cat of CATEGORIES) {
      const catEntries = filteredEntries
        .filter(e => e.category.post === cat.post && e.entryType === 'receipt')
        .sort((a, b) => a.date.localeCompare(b.date)) as ReceiptEntry[]
      for (const r of catEntries) {
        for (const p of getImagePaths(r)) {
          const ext = p.split('.').pop()?.toLowerCase() || 'jpg'
          map.push({ path: p, stdName: `${cat.post}-${r.date}-${String(idx++).padStart(3, '0')}.${ext}` })
        }
      }
    }
    return map
  }

  async function handleDownloadZip(yearFilter?: number) {
    if (!user || downloadingZip) return
    setDownloadingZip(true)
    try {
      const snap = await getDocs(query(collection(db, 'receipts'), where('userId', '==', user.uid)))
      const allEntries = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Entry))
        .filter(e => (!yearFilter || e.date?.startsWith(String(yearFilter))))
      const attMap = buildAttachmentMap(allEntries)
      if (attMap.length === 0) { alert('Ingen vedlegg funnet.'); return }
      const zip = new JSZip()
      let added = 0
      const errors: string[] = []
      for (const att of attMap) {
        try {
          const blob = await Promise.race([
            getBlob(ref(storage, att.path)),
            new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000))
          ])
          zip.file(att.stdName, blob)
          added++
        } catch (err) {
          console.warn('Feil:', att.stdName, err)
          errors.push(att.stdName)
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

  function exportSettings() {
    return { ...settings }
  }

  async function handleFullBackup(yearFilter?: number) {
    if (!user || downloadingZip) return
    setDownloadingZip(true)
    try {
      const [receiptSnap, incomeSnap] = await Promise.all([
        getDocs(query(collection(db, 'receipts'), where('userId', '==', user.uid))),
        getDocs(query(collection(db, 'income'), where('userId', '==', user.uid))),
      ])
      const filterFn = (d: { date?: string }) => !yearFilter || d.date?.startsWith(String(yearFilter))
      const receipts = receiptSnap.docs.map(d => ({ id: d.id, ...d.data() } as ReceiptEntry & { id: string; date?: string }))
      const jsonData = {
        exportedAt: new Date().toISOString(),
        year: yearFilter ?? 'alle',
        receipts: receipts.filter(filterFn),
        income: incomeSnap.docs.map(d => ({ id: d.id, ...d.data() } as { date?: string })).filter(filterFn),
        settings: yearFilter ? undefined : exportSettings(),
      }
      const zip = new JSZip()
      zip.file(`regnskap_backup_${yearFilter ?? 'alle'}_${format(new Date(), 'yyyy-MM-dd')}.json`, JSON.stringify(jsonData, null, 2))
      const filteredEntries = receiptSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as Entry))
        .filter(e => filterFn(e as { date?: string }))
      const attMap = buildAttachmentMap(filteredEntries)
      let added = 0
      const errors: string[] = []
      for (const att of attMap) {
        try {
          const blob = await Promise.race([
            getBlob(ref(storage, att.path)),
            new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000))
          ])
          zip.file(`vedlegg/${att.stdName}`, blob)
          added++
        } catch (err) {
          console.warn('Feil:', att.stdName, err)
          errors.push(att.stdName)
        }
      }
      const content = await zip.generateAsync({ type: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(content)
      a.download = `regnskap_full_backup_${yearFilter ?? 'alle'}_${format(new Date(), 'yyyy-MM-dd')}.zip`
      a.click()
      URL.revokeObjectURL(a.href)
      if (errors.length > 0) alert(`${added} vedlegg lastet ned. ${errors.length} feilet:\n${errors.join('\n')}`)
      await updateSettings({ lastBackupAt: Date.now() })
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
      settings: yearFilter ? undefined : exportSettings(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `regnskap_backup_${yearFilter ?? 'alle'}_${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    e.target.value = ''
    setImportStatus('Leser fil...')
    try {
      let data: any
      let attachmentFiles: { name: string; blob: Blob }[] = []

      if (file.name.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file)
        const jsonFile = Object.keys(zip.files).find(f => f.endsWith('.json'))
        if (!jsonFile) { setImportStatus('Fant ingen JSON-fil i ZIP-filen.'); return }
        const jsonText = await zip.files[jsonFile].async('string')
        data = JSON.parse(jsonText)
        for (const [path, zipEntry] of Object.entries(zip.files)) {
          if (zipEntry.dir) continue
          if (path.startsWith('vedlegg/')) {
            const blob = await zipEntry.async('blob')
            attachmentFiles.push({ name: path.replace('vedlegg/', ''), blob })
          }
        }
      } else {
        const text = await file.text()
        data = JSON.parse(text)
      }

      if (!data.receipts || !data.income) { setImportStatus('Ugyldig backup-fil.'); return }
      const receiptsCount = (data.receipts as any[]).filter((r: any) => r.userId === user.uid).length
      const incomeCount = (data.income as any[]).filter((r: any) => r.userId === user.uid).length
      setImportStatus(`Fil lest: ${receiptsCount} utgifter, ${incomeCount} inntekter${attachmentFiles.length > 0 ? `, ${attachmentFiles.length} vedlegg` : ''}. Velg importmetode:`)
      setImportPending({ file, data, attachmentFiles })
    } catch (err) {
      setImportStatus('Feil: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  async function handleImportExecute(mode: 'merge' | 'restore') {
    if (!user || !importPending) return
    const { data, attachmentFiles } = importPending
    setImportPending(null)
    try {
      const [existingReceipts, existingIncome] = await Promise.all([
        getDocs(query(collection(db, 'receipts'), where('userId', '==', user.uid))),
        getDocs(query(collection(db, 'income'), where('userId', '==', user.uid))),
      ])

      // In restore mode, delete all existing data first
      if (mode === 'restore') {
        setImportStatus('Sletter eksisterende data...')
        for (const d of existingReceipts.docs) {
          const entry = d.data() as ReceiptEntry
          for (const p of getImagePaths(entry)) {
            try { await deleteObject(ref(storage, p)) } catch {}
          }
          await deleteDoc(doc(db, 'receipts', d.id))
        }
        for (const d of existingIncome.docs) {
          await deleteDoc(doc(db, 'income', d.id))
        }
      }

      const existingReceiptIds = mode === 'merge' ? new Set(existingReceipts.docs.map(d => d.id)) : new Set<string>()
      const existingIncomeIds = mode === 'merge' ? new Set(existingIncome.docs.map(d => d.id)) : new Set<string>()

      setImportStatus('Importerer...')
      let count = 0
      let skipped = 0
      for (const r of data.receipts as any[]) {
        const { id, ...fields } = r
        if (fields.userId && fields.userId !== user.uid) continue
        fields.userId = user.uid
        if (id && existingReceiptIds.has(id)) { skipped++; continue }
        await addDoc(collection(db, 'receipts'), fields)
        count++
      }
      for (const inc of data.income as any[]) {
        const { id, ...fields } = inc
        if (fields.userId && fields.userId !== user.uid) continue
        fields.userId = user.uid
        if (id && existingIncomeIds.has(id)) { skipped++; continue }
        await addDoc(collection(db, 'income'), fields)
        count++
      }

      let filesUploaded = 0
      if (attachmentFiles.length > 0) {
        setImportStatus(`Laster opp ${attachmentFiles.length} vedlegg...`)
        for (const af of attachmentFiles) {
          const matchingReceipt = data.receipts?.find((r: any) => r.imagePath?.endsWith(af.name))
          if (matchingReceipt && matchingReceipt.imagePath) {
            try {
              const storageRef = ref(storage, matchingReceipt.imagePath)
              await uploadBytes(storageRef, af.blob)
              filesUploaded++
            } catch (err) { console.warn('Vedlegg-feil:', af.name, err) }
          }
        }
      }

      if (data.settings && typeof data.settings === 'object') {
        // Detect old localStorage format vs new Firestore format
        const isLegacy = 'driving_rate_per_km' in data.settings
        if (isLegacy) {
          await updateSettings(convertLegacySettings(data.settings))
        } else {
          await updateSettings(data.settings)
        }
      }

      const parts = [`${count} importert`]
      if (skipped > 0) parts.push(`${skipped} duplikater hoppet over`)
      if (filesUploaded > 0) parts.push(`${filesUploaded} vedlegg lastet opp`)
      if (mode === 'restore') parts.unshift('Gjenopprettet')
      setImportStatus(`✓ ${parts.join(', ')}.`)
    } catch (err) {
      setImportStatus('Feil: ' + (err instanceof Error ? err.message : String(err)))
    }
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
              <p className="text-xs text-slate-400">{user?.email} <span className="text-slate-300">v1.38</span></p>
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
              title="Oversikt">
              <IconOverview />
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
                      <input type="date" value={incomeDate} onChange={e => setIncomeDate(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

      {/* Overview drawer */}
      {showArchive && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => { setShowArchive(false); setImportStatus(''); setImportPending(null) }} />
          <div className="w-80 bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Oversikt</h2>
              <button onClick={() => { setShowArchive(false); setImportStatus(''); setImportPending(null) }} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><IconX /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              {/* Altinn button */}
              <div>
                <button onClick={() => setShowAltinn(true)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-3 transition">
                  <span>Oversikt {selectedYear}</span>
                  <span className="text-white/70 text-base">→</span>
                </button>
              </div>

              {/* Report button */}
              <div>
                <button onClick={() => { setShowArchive(false); navigate(`/rapport?year=${selectedYear}`) }}
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition">
                  <span>Årsrapport {selectedYear}</span>
                  <span className="text-slate-400 text-xs font-normal">PDF →</span>
                </button>
              </div>

              {/* Kvitteringer button */}
              <div>
                <button onClick={() => setShowReceiptList(true)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition">
                  <span>Kvitteringer</span>
                  <span className="text-slate-400 text-xs font-normal">{entries.filter(e => e.entryType === 'receipt').reduce((sum, e) => sum + getImageUrls(e as ReceiptEntry).length, 0)} vedlegg →</span>
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
                <p className="text-xs text-slate-400 mb-3">Importer en tidligere backup-fil (JSON eller ZIP).</p>
                <label className="w-full flex items-center gap-2 text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer">
                  <IconUpload />
                  <span>Velg backup-fil</span>
                  <input type="file" accept=".json,.zip,application/json,application/zip" className="hidden" onChange={handleImportFile} />
                </label>
                {importStatus && (
                  <p className={`text-xs mt-2 px-1 ${importStatus.startsWith('✓') ? 'text-green-600' : importStatus.startsWith('Feil') ? 'text-red-500' : 'text-slate-400'}`}>
                    {importStatus}
                  </p>
                )}
                {importPending && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleImportExecute('merge')}
                      className="flex-1 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition">
                      Slå sammen
                    </button>
                    <button onClick={() => { if (confirm('Dette sletter ALL eksisterende data og erstatter med backup. Er du sikker?')) handleImportExecute('restore') }}
                      className="flex-1 text-sm font-medium text-red-600 border border-red-300 rounded-lg px-3 py-2.5 hover:bg-red-50 transition">
                      Gjenopprett
                    </button>
                  </div>
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
          onFullBackup={handleFullBackup}
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
                    <button onClick={() => { setShowDrivingModal(false); navigate('/add?type=driving') }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm">
                      <IconPlus /> Legg til kjøring
                    </button>
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
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => { setShowDrivingModal(false); navigate(`/add?edit=${d.id}`) }}
                              className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
                              <IconPencil /> Rediger
                            </button>
                            <button onClick={() => handleDelete(d)}
                              className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">
                              <IconTrash /> Slett
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Oversikt modal */}
      {showAltinn && (() => {
        const result = totalIncome - totalExpenses
        const drivingEntries = yearEntries.filter(e => e.entryType === 'driving') as DrivingEntry[]
        const totalKm = drivingEntries.reduce((s, d) => s + (d.tripType === 'return' ? d.distance * 2 : d.distance), 0)
        const expenseCategories = [...CATEGORIES]
          .filter(cat => cat.post !== '6000' && cat.post !== '7100')
          .map(cat => ({ ...cat, sum: yearEntries.filter(e => e.category.post === cat.post).reduce((s, e) => s + getAmount(e), 0) }))
        const hkSum = yearEntries.filter(e => e.category.post === '7100').reduce((s, e) => s + getAmount(e), 0)
        const avSum = yearEntries.filter(e => e.category.post === '6000').reduce((s, e) => s + getAmount(e), 0)
        const allCosts = [...expenseCategories, { post: '7100', label: 'Hjemmekontor', sum: hkSum }, { post: '6000', label: 'Avskrivninger', sum: avSum }]
        const activeCosts = allCosts.filter(c => c.sum > 0)
        const topCost = activeCosts.length > 0 ? activeCosts.reduce((a, b) => a.sum > b.sum ? a : b) : null
        const fmt = (n: number) => n.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

        return (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAltinn(false)} />
            <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">

              {/* Header */}
              <div className="bg-slate-800 text-white px-6 py-5 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Resultatrapport</p>
                    <h2 className="text-xl font-bold mt-0.5">Sørbø Musikk — {selectedYear}</h2>
                  </div>
                  <button onClick={() => setShowAltinn(false)} className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition"><IconX /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">

                {/* KPI cards */}
                <div className="grid grid-cols-3 gap-px bg-slate-100">
                  <div className="bg-white px-4 py-4 text-center">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Inntekter</p>
                    <p className="text-lg font-bold text-slate-800 mt-1 tabular-nums">{fmt(totalIncome)}</p>
                  </div>
                  <div className="bg-white px-4 py-4 text-center">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Utgifter</p>
                    <p className="text-lg font-bold text-slate-800 mt-1 tabular-nums">{fmt(totalExpenses)}</p>
                  </div>
                  <div className="bg-white px-4 py-4 text-center">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Resultat</p>
                    <p className={`text-lg font-bold mt-1 tabular-nums ${result >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(result)}</p>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="px-6 py-4 bg-slate-50 border-y border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{yearEntries.length} oppføringer</span>
                  <span>{drivingEntries.length} kjøreturer · {totalKm.toLocaleString('nb-NO')} km</span>
                  {topCost && <span>Største post: {topCost.label}</span>}
                </div>

                {/* Income section */}
                <div className="px-6 pt-5 pb-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Inntekter</p>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-mono text-slate-300">3000</span>
                      <span className="text-sm text-slate-700">Salgsinntekter</span>
                    </div>
                    <span className={`text-sm font-semibold tabular-nums ${totalIncome > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                      {fmt(totalIncome)} kr
                    </span>
                  </div>
                </div>

                <div className="mx-6 border-t border-slate-100" />

                {/* Expenses section */}
                <div className="px-6 pt-4 pb-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Driftskostnader</p>
                  <div className="space-y-0.5">
                    {allCosts.map(cat => (
                      <div key={cat.post} className={`flex items-center justify-between py-1.5 ${cat.sum === 0 ? 'opacity-30' : ''}`}>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-mono text-slate-300">{cat.post}</span>
                          <span className="text-sm text-slate-700">{cat.label}</span>
                        </div>
                        <span className={`text-sm tabular-nums ${cat.sum > 0 ? 'font-semibold text-slate-700' : 'text-slate-300'}`}>
                          {fmt(cat.sum)} kr
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Sum expenses */}
                  <div className="flex items-center justify-between py-2.5 mt-2 border-t border-slate-200">
                    <span className="text-sm font-semibold text-slate-600">Sum driftskostnader</span>
                    <span className="text-sm font-bold tabular-nums text-slate-800">{fmt(totalExpenses)} kr</span>
                  </div>
                </div>

                {/* Result bar */}
                <div className={`mx-4 mb-4 rounded-xl px-5 py-4 ${result >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Driftsresultat {selectedYear}</p>
                      {totalIncome > 0 && (
                        <p className="text-[11px] text-slate-400 mt-0.5">Margin: {(result / totalIncome * 100).toFixed(0)} %</p>
                      )}
                    </div>
                    <span className={`text-2xl font-bold tabular-nums ${result >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {fmt(result)} kr
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )
      })()}

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
                const receiptFiles = entries
                  .filter(e => e.entryType === 'receipt')
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .flatMap(e => {
                    const r = e as ReceiptEntry
                    const urls = getImageUrls(r)
                    const paths = getImagePaths(r)
                    return urls.map((url, i) => ({ entry: e, url, path: paths[i] || '' }))
                  })
                if (receiptFiles.length === 0) return <p className="text-sm text-slate-400 py-8 text-center">Ingen vedlegg lastet opp.</p>
                return (
                  <div className="space-y-2">
                    {receiptFiles.map((f, i) => {
                      const filename = f.path?.split('/').pop() ?? 'vedlegg'
                      const isPdf = filename.toLowerCase().endsWith('.pdf') || f.url?.includes('.pdf')
                      return (
                        <a key={`${f.entry.id}-${i}`} href={f.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-2 border border-slate-200 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition">
                          <span className="text-xs font-mono text-slate-400 mt-0.5 shrink-0">{isPdf ? 'PDF' : 'IMG'}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-blue-600 truncate">{filename}</p>
                            <p className="text-xs text-slate-400">{f.entry.category.label} · {format(new Date(f.entry.date), 'd. MMM yyyy', { locale: nb })}</p>
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
          {totalIncome > 0 ? (
            <>
              <p className="text-sm text-blue-100">Regnskap {selectedYear}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-100">Inntekter</span>
                  <span className="text-sm font-semibold">{totalIncome.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-100">Utgifter</span>
                  <span className="text-sm font-semibold">−{totalExpenses.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>
                </div>
                <div className="border-t border-white/20 pt-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-100">Resultat</span>
                  <span className="text-xl font-bold">{(totalIncome - totalExpenses).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-blue-100">Totale utgifter {selectedYear}</p>
              <p className="text-3xl font-bold mt-1">{totalExpenses.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}</p>
            </>
          )}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-blue-200">{yearEntries.length} oppføringer</p>
            <button onClick={() => navigate('/add')}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
              <IconPlus />
              Legg til utgift
            </button>
          </div>
        </div>

        {/* Backup reminder */}
        {(() => {
          const lastBackup = settings.lastBackupAt
          const daysSince = lastBackup ? Math.floor((Date.now() - lastBackup) / (1000 * 60 * 60 * 24)) : null
          const needsBackup = !lastBackup || daysSince! >= 30
          if (!needsBackup) return null
          return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-amber-800">
                  {lastBackup ? `${daysSince} dager siden siste backup` : 'Ingen backup registrert'}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">Anbefalt: månedlig full backup</p>
              </div>
              <button onClick={() => { setShowArchive(true); setShowBackupModal(true) }}
                className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                Backup nå
              </button>
            </div>
          )
        })()}

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
                    {getImageUrls(e as ReceiptEntry).map((url, i) => {
                      const paths = getImagePaths(e as ReceiptEntry)
                      const isPdf = paths[i]?.endsWith('.pdf')
                      return isPdf ? (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs mt-1 mr-3">
                          Åpne PDF {getImageUrls(e as ReceiptEntry).length > 1 ? `(${i + 1})` : ''}
                        </a>
                      ) : (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Kvittering ${i + 1}`}
                            className="mt-2 rounded-lg border border-slate-200 max-h-48 object-contain w-full" />
                        </a>
                      )
                    })}
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

