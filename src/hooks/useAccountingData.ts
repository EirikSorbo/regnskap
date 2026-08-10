import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, type FirestoreError } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '../firebase'
import type { Entry, IncomeEntry } from '../types'

/** Live-abonnement på brukerens utgifter og inntekter, sortert nyest først.
 *
 *  Begge listene kommer fra samme sted slik at ingen skjerm kan vise et halvt
 *  regnskap: `loading` slår først av når utgiftene har svart.
 *
 *  Feil på en av strømmene MÅ ut i grensesnittet. Slår sikkerhetsreglene til på
 *  inntektene, ville appen ellers vist 0 kr i inntekt og et flott overskudd,
 *  uten et ord om at halve regnskapet manglet. En feilmelding er ubehagelig;
 *  et stille galt resultat er verre. */
export function useAccountingData(user: User | null) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [entriesError, setEntriesError] = useState('')
  const [incomeError, setIncomeError] = useState('')

  useEffect(() => {
    // Se kommentaren i useInvoices: uten bruker skal ventingen avsluttes, ikke
    // henge.
    if (!user) { setLoading(false); return }
    const q = query(collection(db, 'receipts'), where('userId', '==', user.uid))
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Entry)
      data.sort((a, b) => b.date.localeCompare(a.date))
      setEntries(data)
      setEntriesError('')
      setLoading(false)
    }, (err) => {
      console.error('Firestore error (receipts):', err)
      setEntriesError(describe(err, 'utgiftene', 'receipts'))
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
      setIncomeError('')
    }, (err) => {
      console.error('Firestore error (income):', err)
      setIncomeError(describe(err, 'inntektene', 'income'))
    })
  }, [user])

  // Feiler begge, sier vi det med én setning framfor to like.
  const error = entriesError && incomeError
    ? 'Fikk ikke lest regnskapet fra databasen. Tallene på skjermen er ikke fullstendige.'
    : entriesError || incomeError

  return { entries, incomeEntries, loading, error }
}

function describe(err: FirestoreError, hva: string, samling: string): string {
  return err.code === 'permission-denied'
    ? `Fikk ikke lese ${hva}. Sjekk at sikkerhetsreglene for «${samling}» er publisert i Firebase Console. Tallene under er ufullstendige.`
    : `Kunne ikke laste ${hva}: ${err.message}. Tallene under er ufullstendige.`
}
