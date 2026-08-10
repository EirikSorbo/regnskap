import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '../firebase'
import type { Invoice, Customer } from '../lib/invoice'

/** Live-abonnement på fakturaene, nyeste fakturadato først. */
export function useInvoices(user: User | null) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Uten bruker er det ingenting å vente på. Sto `loading` igjen som true,
    // ville enhver skjerm som venter på den blitt stående på «Laster...» for
    // alltid i stedet for å vise en tom liste.
    if (!user) { setLoading(false); return }
    const q = query(collection(db, 'invoices'), where('userId', '==', user.uid))
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Invoice)
      // Sorter på dato, men tåle et dokument uten dato: uten vakten kaster
      // sammenlikningen, og da blir hele lista stående tom.
      data.sort((a, b) =>
        (b.issueDate ?? '').localeCompare(a.issueDate ?? '') || (b.number ?? 0) - (a.number ?? 0))
      setInvoices(data)
      setError('')
      setLoading(false)
    }, (err) => {
      // Feilen skal SES, ikke bare logges. En tom liste uten forklaring er
      // umulig å skille fra «du har ingen fakturaer ennå».
      console.error('Firestore error (invoices):', err)
      setError(err.code === 'permission-denied'
        ? 'Fikk ikke lese fakturaene. Sjekk at sikkerhetsreglene for «invoices» er publisert i Firebase Console.'
        : `Kunne ikke laste fakturaene: ${err.message}`)
      setLoading(false)
    })
  }, [user])

  return { invoices, loading, error }
}

/** Live-abonnement på kunderegisteret, alfabetisk. */
export function useCustomers(user: User | null) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const q = query(collection(db, 'customers'), where('userId', '==', user.uid))
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Customer)
      data.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'nb'))
      setCustomers(data)
      setError('')
      setLoading(false)
    }, (err) => {
      console.error('Firestore error (customers):', err)
      setError(err.code === 'permission-denied'
        ? 'Fikk ikke lese kunderegisteret. Sjekk at sikkerhetsreglene for «customers» er publisert.'
        : `Kunne ikke laste kunderegisteret: ${err.message}`)
      setLoading(false)
    })
  }, [user])

  return { customers, loading, error }
}
