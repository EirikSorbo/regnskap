// ---------------------------------------------------------------------------
//  KUNDEREGISTER — SKRIVING MOT FIRESTORE
// ---------------------------------------------------------------------------

import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { stripUndefined } from './firestore-data'
import type { Customer, InvoiceCustomer } from './invoice'

export async function addCustomer(uid: string, c: InvoiceCustomer): Promise<string> {
  const ref = await addDoc(collection(db, 'customers'),
    stripUndefined({ ...c, userId: uid, createdAt: Date.now() }))
  return ref.id
}

export async function updateCustomer(id: string, c: InvoiceCustomer): Promise<void> {
  await updateDoc(doc(db, 'customers', id), stripUndefined({ ...c }))
}

export async function deleteCustomer(id: string): Promise<void> {
  await deleteDoc(doc(db, 'customers', id))
}

/** Nøkkelen vi regner to kunder som «samme» på: navn og postnummer. Nok til å
 *  hindre at en ny import lager dublett av hele registeret, uten å slå sammen
 *  to virkelig ulike kunder som tilfeldigvis heter det samme. */
export function customerKey(c: InvoiceCustomer): string {
  return `${c.name.trim().toLowerCase()}|${(c.postalCode ?? '').trim()}`
}

/** Legger inn kunder fra en import. Kunder som allerede finnes hoppes over i
 *  stedet for å overskrives, så importen aldri kan viske ut opplysninger du har
 *  rettet i appen. Oppretter ingen fakturaer og ingen inntektsføringer. */
export async function importCustomers(
  uid: string,
  incoming: InvoiceCustomer[],
  existing: Customer[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ added: number; skipped: number }> {
  const known = new Set(existing.map(customerKey))
  let added = 0
  let skipped = 0
  let done = 0
  for (const c of incoming) {
    if (known.has(customerKey(c))) { skipped++; done++; continue }
    await addCustomer(uid, c)
    known.add(customerKey(c))
    added++
    done++
    onProgress?.(done, incoming.length)
  }
  return { added, skipped }
}
