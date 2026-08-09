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

/** Sletter filer fra Storage. Filer som allerede er borte ignoreres, så en
 *  halvveis opprydding alltid kan fullføres. */
export async function deleteStoragePaths(paths: string[]): Promise<void> {
  for (const path of paths) {
    if (!path) continue
    try { await deleteObject(ref(storage, path)) } catch { /* finnes ikke — ignorer */ }
  }
}

/** Sletter en utgiftsoppføring og vedleggene dens. */
export async function deleteEntry(entry: Entry): Promise<void> {
  if (!entry.id) return
  if (entry.entryType === 'receipt') {
    await deleteStoragePaths(getImagePaths(entry as ReceiptEntry))
  }
  await deleteDoc(doc(db, 'receipts', entry.id))
}
