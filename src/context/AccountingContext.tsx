import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useSettings } from './SettingsContext'
import {
  type Entry, type IncomeEntry, type DrivingEntry, type ReceiptEntry, type Category, type PostGroup,
  CATEGORIES, SETTINGS_MANAGED_POSTS, entryAmount, postSums, getImageUrls,
} from '../types'
import { useAccountingData } from '../hooks/useAccountingData'

const YEAR_KEY = 'selected_year'

/** Regnskapet for det valgte året, ett sted for hele appen.
 *
 *  Lå før i dashbordet, som dermed var det eneste stedet panelene kunne åpnes
 *  fra: alt de viser regnes ut her. Nå som toppen er lik på alle sider, må
 *  tallene være tilgjengelige alle steder toppen finnes.
 *
 *  Årsvalget bor her av samme grunn, og skrives fortsatt til localStorage slik
 *  at appen husker året mellom besøk. */
interface AccountingContextType {
  entries: Entry[]
  incomeEntries: IncomeEntry[]
  loading: boolean
  selectedYear: number
  setSelectedYear: (y: number) => void
  /** Årene brukeren har data i, nyeste først, alltid med de tre siste. */
  years: number[]
  categories: Category[]
  amountOf: (e: Entry) => number
  /** Årets utgifter UTEN de settings-styrte postene. Se kommentaren under. */
  yearEntries: Entry[]
  yearIncome: IncomeEntry[]
  groups: PostGroup[]
  totalIncome: number
  totalExpenses: number
  /** Årsbeløpene uten måned (EKOM, hjemmekontor, avskrivninger). */
  managedExpenses: number
  trips: DrivingEntry[]
  totalKm: number
  attachmentCount: number
  usedPosts: Set<string>
}

const AccountingContext = createContext<AccountingContextType | null>(null)

export function AccountingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { settings } = useSettings()
  const { entries, incomeEntries, loading } = useAccountingData(user)

  const [selectedYear, setSelectedYear] = useState(() =>
    parseInt(localStorage.getItem(YEAR_KEY) || String(new Date().getFullYear())))

  useEffect(() => { localStorage.setItem(YEAR_KEY, String(selectedYear)) }, [selectedYear])

  const value = useMemo<AccountingContextType>(() => {
    const categories = settings.categories ?? CATEGORIES
    const amountOf = (e: Entry) =>
      entryAmount(e, settings.drivingRatePerKm, settings.drivingRatePerPassengerKm)

    // Kvitteringer for året, UTEN de settings-styrte postene (EKOM/hjemmekontor/
    // avskrivninger). Deres årsbeløp beregnes fra innstillinger, så eventuelle
    // gjenværende skyggedokumenter verken vises i lista eller telles dobbelt.
    const yearEntries = entries.filter(e =>
      e.date.startsWith(String(selectedYear)) && !SETTINGS_MANAGED_POSTS.includes(e.category.post))
    const yearIncome = incomeEntries.filter(e => e.date.startsWith(String(selectedYear)))

    const groups = postSums(categories, yearEntries, settings, selectedYear, amountOf)
    const totalExpenses = groups.reduce((s, g) => s + g.sum, 0)
    // Årsbeløpene som ikke har en måned. Grafen trenger dem for seg, siden de
    // ikke kan tegnes som søyler.
    const managedExpenses = groups.filter(g => g.managed).reduce((s, g) => s + g.sum, 0)
    const totalIncome = yearIncome.reduce((s, e) => s + e.amount, 0)

    const trips = yearEntries.filter(e => e.entryType === 'driving') as DrivingEntry[]
    const totalKm = trips.reduce((s, d) => s + (d.tripType === 'return' ? d.distance * 2 : d.distance), 0)

    const currentYear = new Date().getFullYear()
    const years = [...new Set([
      ...entries.map(e => parseInt(e.date.slice(0, 4))),
      ...incomeEntries.map(e => parseInt(e.date.slice(0, 4))),
      currentYear, currentYear - 1, currentYear - 2, selectedYear,
    ])].filter(Number.isFinite).sort((a, b) => b - a)

    const attachmentCount = entries.reduce((s, e) =>
      s + (e.entryType === 'receipt' ? getImageUrls(e as ReceiptEntry).length : 0), 0)

    return {
      entries, incomeEntries, loading,
      selectedYear, setSelectedYear, years,
      categories, amountOf,
      yearEntries, yearIncome, groups,
      totalIncome, totalExpenses, managedExpenses,
      trips, totalKm, attachmentCount,
      usedPosts: new Set(entries.map(e => e.category.post)),
    }
  }, [entries, incomeEntries, loading, selectedYear, settings])

  return <AccountingContext.Provider value={value}>{children}</AccountingContext.Provider>
}

export function useAccounting() {
  const ctx = useContext(AccountingContext)
  if (!ctx) throw new Error('useAccounting må brukes innenfor AccountingProvider')
  return ctx
}
