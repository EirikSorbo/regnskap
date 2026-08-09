// ---------------------------------------------------------------------------
//  SKRIVEOPERASJONER PÅ OPPFØRINGER OG INNTEKTER
// ---------------------------------------------------------------------------
//  Lå tidligere som lukkede funksjoner inne i DashboardPage, der ingen andre kom
//  til dem. Inntektsføring er det stedet en framtidig fakturamodul må skrive til
//  når en faktura merkes betalt, så den må være delt kode.
// ---------------------------------------------------------------------------

import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import { type Entry, type ReceiptEntry, getImagePaths } from '../types'

/** Fører en inntekt på post 3000. Returnerer dokument-id-en. */
export async function addIncome(
  uid: string,
  input: { amount: number; date: string; description?: string },
): Promise<string> {
  const docRef = await addDoc(collection(db, 'income'), {
    userId: uid,
    amount: input.amount,
    date: input.date,
    description: input.description ?? '',
    createdAt: Date.now(),
  })
  return docRef.id
}

export async function deleteIncome(id: string): Promise<void> {
  await deleteDoc(doc(db, 'income', id))
}

/** Sletter en utgiftsoppføring og vedleggene dens. Filer som allerede er borte
 *  ignoreres, slik at en halvveis slettet oppføring alltid kan ryddes bort. */
export async function deleteEntry(entry: Entry): Promise<void> {
  if (!entry.id) return
  if (entry.entryType === 'receipt') {
    for (const path of getImagePaths(entry as ReceiptEntry)) {
      try { await deleteObject(ref(storage, path)) } catch { /* finnes ikke — ignorer */ }
    }
  }
  await deleteDoc(doc(db, 'receipts', entry.id))
}
