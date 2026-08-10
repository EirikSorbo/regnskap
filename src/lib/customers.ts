// ---------------------------------------------------------------------------
//  KUNDEREGISTER — SKRIVING MOT FIRESTORE
// ---------------------------------------------------------------------------

import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { stripUndefined } from './firestore-data'
import type { InvoiceCustomer } from './invoice'

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
