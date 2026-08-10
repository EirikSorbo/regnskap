// ---------------------------------------------------------------------------
//  FAKTURA — SKRIVING MOT FIRESTORE
// ---------------------------------------------------------------------------
//  Reglene bor i invoice.ts; her er kallene som gjør dem virkelige.
// ---------------------------------------------------------------------------

import { collection, doc, addDoc, updateDoc, deleteDoc, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'
import { stripUndefined } from './firestore-data'
import {
  type Invoice, type InvoiceCustomer, type InvoiceLine,
  invoiceTotal, validateForIssue, incomeAmount, incomeDescription, addDays,
  DEFAULT_PAYMENT_TERMS_DAYS,
} from './invoice'

export interface DraftInput {
  customer: InvoiceCustomer
  lines: InvoiceLine[]
  issueDate: string
  dueDate?: string
  note?: string
  kind?: Invoice['kind']
  creditsInvoiceId?: string
}

function draftFields(uid: string, input: DraftInput) {
  const lines = input.lines.map((l) => ({
    description: l.description,
    quantity: Number(l.quantity) || 0,
    unitPrice: Number(l.unitPrice) || 0,
  }))
  // Siste skanse mot undefined-felter: Firestore avviser dem, og feilen kommer
  // først når du trykker lagre. Kunden kan komme både fra registeret og fra
  // skjemaet, så vi renser her framfor å stole på hver enkelt kilde.
  return stripUndefined({
    userId: uid,
    kind: input.kind ?? 'faktura',
    status: 'kladd' as const,
    customer: input.customer,
    lines,
    issueDate: input.issueDate,
    dueDate: input.dueDate || addDays(input.issueDate, DEFAULT_PAYMENT_TERMS_DAYS),
    note: input.note ?? '',
    total: invoiceTotal(lines),
    ...(input.creditsInvoiceId ? { creditsInvoiceId: input.creditsInvoiceId } : {}),
  })
}

export async function createDraft(uid: string, input: DraftInput): Promise<string> {
  const ref = await addDoc(collection(db, 'invoices'), { ...draftFields(uid, input), createdAt: Date.now() })
  return ref.id
}

/** Lagrer endringer på en kladd. Utstedte fakturaer stoppes av utstedelses-
 *  transaksjonen og av at skjermbildet ikke tilbyr redigering. */
export async function updateDraft(uid: string, id: string, input: DraftInput): Promise<void> {
  await updateDoc(doc(db, 'invoices', id), draftFields(uid, input))
}

export async function deleteDraft(id: string): Promise<void> {
  await deleteDoc(doc(db, 'invoices', id))
}

/** Utsteder fakturaen: tildeler neste nummer, låser den, og fører inntekten på
 *  fakturadatoen. Alt i én transaksjon, slik at et nummer aldri kan bli delt ut
 *  to ganger og en faktura aldri kan bli stående utstedt uten inntektsføring.
 *
 *  Er det en kreditnota, settes den opprinnelige fakturaen samtidig til
 *  «kreditert», og inntekten føres med negativt fortegn. */
export async function issueInvoice(uid: string, invoiceId: string): Promise<number> {
  return await runTransaction(db, async (tx) => {
    const invRef = doc(db, 'invoices', invoiceId)
    const settingsRef = doc(db, 'userSettings', uid)

    const invSnap = await tx.get(invRef)
    if (!invSnap.exists()) throw new Error('Fakturaen finnes ikke.')
    const inv = { id: invoiceId, ...invSnap.data() } as Invoice
    if (inv.status !== 'kladd') throw new Error('Fakturaen er allerede utstedt.')
    const problems = validateForIssue(inv)
    if (problems.length > 0) throw new Error(problems.join(' '))

    const settingsSnap = await tx.get(settingsRef)
    const stored = Number(settingsSnap.data()?.nextInvoiceNumber)
    const number = Number.isFinite(stored) && stored >= 1 ? Math.floor(stored) : 1

    const numbered = { ...inv, number }
    const incomeRef = doc(collection(db, 'income'))
    tx.set(incomeRef, {
      userId: uid,
      amount: incomeAmount(numbered),
      date: inv.issueDate,
      description: incomeDescription(numbered),
      invoiceId,
      createdAt: Date.now(),
    })
    tx.update(invRef, { number, status: 'utstedt', incomeId: incomeRef.id })
    tx.set(settingsRef, { nextInvoiceNumber: number + 1 }, { merge: true })

    if (inv.kind === 'kreditnota' && inv.creditsInvoiceId) {
      tx.update(doc(db, 'invoices', inv.creditsInvoiceId), { status: 'kreditert' })
    }
    return number
  })
}

/** Betalingsoppfølging. Rører ikke regnskapet: inntekten ble ført da fakturaen
 *  ble utstedt, og skal ikke føres en gang til når pengene kommer. */
export async function markPaid(id: string, paidDate: string): Promise<void> {
  await updateDoc(doc(db, 'invoices', id), { status: 'betalt', paidDate })
}

export async function markUnpaid(id: string): Promise<void> {
  await updateDoc(doc(db, 'invoices', id), { status: 'utstedt', paidDate: '' })
}

/** Lager en kreditnota som kladd, med samme linjer som originalen. Den fører
 *  ingenting før du utsteder den. */
export async function createCreditNote(uid: string, original: Invoice, issueDate: string): Promise<string> {
  return await createDraft(uid, {
    kind: 'kreditnota',
    creditsInvoiceId: original.id,
    customer: original.customer,
    lines: original.lines,
    issueDate,
    note: `Kreditnota for faktura ${original.number ?? ''}`.trim(),
  })
}
