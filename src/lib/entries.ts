// ---------------------------------------------------------------------------
//  SKRIVEOPERASJONER PÅ OPPFØRINGER
// ---------------------------------------------------------------------------
//  Lå tidligere som lukkede funksjoner inne i DashboardPage, der ingen andre kom
//  til dem. Inntekt føres ikke herfra: den oppstår når en faktura utstedes, og
//  skrives av lib/invoice-store i samme transaksjon som fakturanummeret.
// ---------------------------------------------------------------------------

import { deleteDoc, doc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import { type Entry, type ReceiptEntry, getImagePaths } from '../types'

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
