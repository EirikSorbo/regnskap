import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '../firebase'
import type { Entry, IncomeEntry } from '../types'

/** Live-abonnement på brukerens utgifter og inntekter, sortert nyest først.
 *  Begge listene kommer fra samme sted slik at ingen skjerm kan vise et halvt
 *  regnskap: `loading` slår først av når utgiftene har svart. */
export function useAccountingData(user: User | null) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'receipts'), where('userId', '==', user.uid))
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Entry)
      data.sort((a, b) => b.date.localeCompare(a.date))
      setEntries(data)
      setLoading(false)
    }, (err) => {
      console.error('Firestore error (receipts):', err)
      setLoading(false)
    })
  }, [user])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'income'), where('userId', '==', user.uid))
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as IncomeEntry)
      data.sort((a, b) => b.date.localeCompare(a.date))
      setIncomeEntries(data)
    }, (err) => {
      // Uten denne ble en regelfeil på income-samlingen liggende stille i
      // konsollen mens skjermen viste 0 kr i inntekt.
      console.error('Firestore error (income):', err)
    })
  }, [user])

  return { entries, incomeEntries, loading }
}
