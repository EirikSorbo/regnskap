import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

export interface UserSettings {
  drivingRatePerKm: number
  drivingRatePerPassengerKm: number
  ekomPrivateAmt: number
  ekomPhone: Record<string, number[]>
  ekomInternet: Record<string, number[]>
  ekomEntryIds: Record<string, string>
  hjemmekontorAmounts: Record<string, number>
  hjemmekontorEntryIds: Record<string, string>
  avskrivningerAmounts: Record<string, number>
  avskrivningerEntryIds: Record<string, string>
  lastBackupAt?: number  // timestamp of last full backup
  postNumbersMigrated?: boolean
}

export const DEFAULT_SETTINGS: UserSettings = {
  drivingRatePerKm: 3.5,
  drivingRatePerPassengerKm: 1.0,
  ekomPrivateAmt: 0,
  ekomPhone: {},
  ekomInternet: {},
  ekomEntryIds: {},
  hjemmekontorAmounts: {},
  hjemmekontorEntryIds: {},
  avskrivningerAmounts: {},
  avskrivningerEntryIds: {},
}

interface SettingsContextValue {
  settings: UserSettings
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>
  loading: boolean
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  loading: true,
})

export function useSettings() {
  return useContext(SettingsContext)
}

/** Migrate old localStorage keys to new Firestore format */
function migrateFromLocalStorage(): Partial<UserSettings> | null {
  const hasAny = localStorage.getItem('driving_rate_per_km') ||
    localStorage.getItem('ekom_private_amt')
  if (!hasAny) return null

  const migrated: Partial<UserSettings> = {}
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = currentYear - 5; y <= currentYear + 1; y++) years.push(y)

  const rate = parseFloat(localStorage.getItem('driving_rate_per_km') || '')
  if (!isNaN(rate)) migrated.drivingRatePerKm = rate

  const passRate = parseFloat(localStorage.getItem('driving_rate_per_passenger_km') || '')
  if (!isNaN(passRate)) migrated.drivingRatePerPassengerKm = passRate

  const privateAmt = parseFloat(localStorage.getItem('ekom_private_amt') || '')
  if (!isNaN(privateAmt)) migrated.ekomPrivateAmt = privateAmt

  const ekomPhone: Record<string, number[]> = {}
  const ekomInternet: Record<string, number[]> = {}
  const ekomEntryIds: Record<string, string> = {}
  const hkAmounts: Record<string, number> = {}
  const hkEntryIds: Record<string, string> = {}
  const avAmounts: Record<string, number> = {}
  const avEntryIds: Record<string, string> = {}

  for (const y of years) {
    const ys = String(y)
    try { const p = JSON.parse(localStorage.getItem(`ekom_phone_${y}`) || 'null'); if (p) ekomPhone[ys] = p } catch { /* skip */ }
    try { const i = JSON.parse(localStorage.getItem(`ekom_internet_${y}`) || 'null'); if (i) ekomInternet[ys] = i } catch { /* skip */ }
    const eid = localStorage.getItem(`ekom_entry_id_${y}`); if (eid) ekomEntryIds[ys] = eid
    const hka = localStorage.getItem(`hjemmekontor_amount_${y}`); if (hka) hkAmounts[ys] = parseFloat(hka) || 0
    const hki = localStorage.getItem(`hjemmekontor_entry_id_${y}`); if (hki) hkEntryIds[ys] = hki
    const ava = localStorage.getItem(`avskrivninger_amount_${y}`); if (ava) avAmounts[ys] = parseFloat(ava) || 0
    const avi = localStorage.getItem(`avskrivninger_entry_id_${y}`); if (avi) avEntryIds[ys] = avi
  }

  if (Object.keys(ekomPhone).length) migrated.ekomPhone = ekomPhone
  if (Object.keys(ekomInternet).length) migrated.ekomInternet = ekomInternet
  if (Object.keys(ekomEntryIds).length) migrated.ekomEntryIds = ekomEntryIds
  if (Object.keys(hkAmounts).length) migrated.hjemmekontorAmounts = hkAmounts
  if (Object.keys(hkEntryIds).length) migrated.hjemmekontorEntryIds = hkEntryIds
  if (Object.keys(avAmounts).length) migrated.avskrivningerAmounts = avAmounts
  if (Object.keys(avEntryIds).length) migrated.avskrivningerEntryIds = avEntryIds

  return Object.keys(migrated).length > 0 ? migrated : null
}

function cleanupLocalStorage() {
  const keysToRemove = ['driving_rate_per_km', 'driving_rate_per_passenger_km', 'ekom_private_amt']
  const currentYear = new Date().getFullYear()
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    keysToRemove.push(
      `ekom_phone_${y}`, `ekom_internet_${y}`, `ekom_entry_id_${y}`,
      `hjemmekontor_amount_${y}`, `hjemmekontor_entry_id_${y}`,
      `avskrivninger_amount_${y}`, `avskrivninger_entry_id_${y}`,
    )
  }
  for (const k of keysToRemove) localStorage.removeItem(k)
}

/** Convert old localStorage backup format to new Firestore format */
export function convertLegacySettings(legacy: Record<string, string>): Partial<UserSettings> {
  const result: Partial<UserSettings> = {}
  if (legacy['driving_rate_per_km']) result.drivingRatePerKm = parseFloat(legacy['driving_rate_per_km'])
  if (legacy['driving_rate_per_passenger_km']) result.drivingRatePerPassengerKm = parseFloat(legacy['driving_rate_per_passenger_km'])
  if (legacy['ekom_private_amt']) result.ekomPrivateAmt = parseFloat(legacy['ekom_private_amt'])

  const ekomPhone: Record<string, number[]> = {}
  const ekomInternet: Record<string, number[]> = {}
  const ekomEntryIds: Record<string, string> = {}
  const hkAmounts: Record<string, number> = {}
  const hkEntryIds: Record<string, string> = {}
  const avAmounts: Record<string, number> = {}
  const avEntryIds: Record<string, string> = {}

  for (const [k, v] of Object.entries(legacy)) {
    const phoneMatch = k.match(/^ekom_phone_(\d+)$/)
    if (phoneMatch) { try { ekomPhone[phoneMatch[1]] = JSON.parse(v) } catch { /* skip */ } continue }
    const internetMatch = k.match(/^ekom_internet_(\d+)$/)
    if (internetMatch) { try { ekomInternet[internetMatch[1]] = JSON.parse(v) } catch { /* skip */ } continue }
    const ekomIdMatch = k.match(/^ekom_entry_id_(\d+)$/)
    if (ekomIdMatch) { ekomEntryIds[ekomIdMatch[1]] = v; continue }
    const hkAmtMatch = k.match(/^hjemmekontor_amount_(\d+)$/)
    if (hkAmtMatch) { hkAmounts[hkAmtMatch[1]] = parseFloat(v) || 0; continue }
    const hkIdMatch = k.match(/^hjemmekontor_entry_id_(\d+)$/)
    if (hkIdMatch) { hkEntryIds[hkIdMatch[1]] = v; continue }
    const avAmtMatch = k.match(/^avskrivninger_amount_(\d+)$/)
    if (avAmtMatch) { avAmounts[avAmtMatch[1]] = parseFloat(v) || 0; continue }
    const avIdMatch = k.match(/^avskrivninger_entry_id_(\d+)$/)
    if (avIdMatch) { avEntryIds[avIdMatch[1]] = v; continue }
  }

  if (Object.keys(ekomPhone).length) result.ekomPhone = ekomPhone
  if (Object.keys(ekomInternet).length) result.ekomInternet = ekomInternet
  if (Object.keys(ekomEntryIds).length) result.ekomEntryIds = ekomEntryIds
  if (Object.keys(hkAmounts).length) result.hjemmekontorAmounts = hkAmounts
  if (Object.keys(hkEntryIds).length) result.hjemmekontorEntryIds = hkEntryIds
  if (Object.keys(avAmounts).length) result.avskrivningerAmounts = avAmounts
  if (Object.keys(avEntryIds).length) result.avskrivningerEntryIds = avEntryIds

  return result
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const updateSettings = useCallback(async (partial: Partial<UserSettings>) => {
    if (!user) return
    setSettings(prev => ({ ...prev, ...partial }))
    await setDoc(doc(db, 'userSettings', user.uid), partial, { merge: true })
  }, [user])

  useEffect(() => {
    if (!user) { setLoading(false); return }

    let migrationDone = false
    const unsub = onSnapshot(doc(db, 'userSettings', user.uid), async (snap) => {
      if (snap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...snap.data() as Partial<UserSettings> })
        setLoading(false)
      } else if (!migrationDone) {
        migrationDone = true
        const migrated = migrateFromLocalStorage()
        if (migrated) {
          await setDoc(doc(db, 'userSettings', user.uid), { ...DEFAULT_SETTINGS, ...migrated })
          cleanupLocalStorage()
        } else {
          await setDoc(doc(db, 'userSettings', user.uid), DEFAULT_SETTINGS)
        }
        // onSnapshot will fire again with the new data
      }
    })

    return unsub
  }, [user])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}
