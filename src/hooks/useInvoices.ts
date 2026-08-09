import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '../firebase'
import type { Invoice, Customer } from '../lib/invoice'

/** Live-abonnement på fakturaene, nyeste fakturadato først. */
export function useInvoices(user: User | null) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'invoices'), where('userId', '==', user.uid))
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Invoice)
      data.sort((a, b) => b.issueDate.localeCompare(a.issueDate) || (b.number ?? 0) - (a.number ?? 0))
      setInvoices(data)
      setLoading(false)
    }, (err) => {
      console.error('Firestore error (invoices):', err)
      setLoading(false)
    })
  }, [user])

  return { invoices, loading }
}

/** Live-abonnement på kunderegisteret, alfabetisk. */
export function useCustomers(user: User | null) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'customers'), where('userId', '==', user.uid))
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Customer)
      data.sort((a, b) => a.name.localeCompare(b.name, 'nb'))
      setCustomers(data)
      setLoading(false)
    }, (err) => {
      console.error('Firestore error (customers):', err)
      setLoading(false)
    })
  }, [user])

  return { customers, loading }
}
