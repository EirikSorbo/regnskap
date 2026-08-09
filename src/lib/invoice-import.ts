// ---------------------------------------------------------------------------
//  FAKTURAIMPORT — SKRIVING
// ---------------------------------------------------------------------------
//  Legger inn fakturaer fra et tidligere system.
//
//  Fakturaer fra år som allerede er bokført et annet sted skal IKKE føre
//  inntekt her; de er dokumentasjon. Bare fakturaer fra og med det året du
//  oppgir føres som inntekt, på fakturadatoen sin. Uten det skillet ville
//  gamle beløp blitt talt en gang til.
// ---------------------------------------------------------------------------

import { collection, doc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { stripUndefined } from './firestore-data'
import { type Invoice, incomeAmount, incomeDescription } from './invoice'
import type { ParsedInvoice } from './invoices-csv'
import type { UserSettings } from '../context/SettingsContext'

/** Beskrivelsen på den ene linjen en importert faktura får. Eksportfilen har
 *  bare totalbeløp, så vi later ikke som om vi vet hva den besto av. */
export const IMPORTED_LINE_TEXT = 'Overført fra tidligere fakturasystem'

export interface InvoiceImportResult {
  added: number
  skipped: number
  booked: number
  nextInvoiceNumber: number
}

export async function importInvoices(opts: {
  uid: string
  parsed: ParsedInvoice[]
  existing: Invoice[]
  /** Fakturaer med fakturadato i dette året eller senere føres som inntekt. */
  bookFromYear: number
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>
  currentNextNumber: number
  onProgress?: (done: number, total: number) => void
}): Promise<InvoiceImportResult> {
  const { uid, parsed, existing, bookFromYear, updateSettings, currentNextNumber, onProgress } = opts

  const taken = new Set(existing.map((i) => i.number).filter((n): n is number => typeof n === 'number'))
  const toImport = parsed.filter((p) => !taken.has(p.number))
  const skipped = parsed.length - toImport.length

  // Dokument-id per fakturanummer, så kreditnotaene kan peke på originalen
  // etterpå — også når begge opprettes i samme kjøring.
  const idByNumber = new Map<number, string>()
  for (const p of toImport) idByNumber.set(p.number, doc(collection(db, 'invoices')).id)

  let booked = 0
  let done = 0

  // Firestore tar 500 skriveoperasjoner per batch. Én faktura er én eller to
  // (faktura + eventuell inntektsføring), så vi holder oss godt innenfor.
  const CHUNK = 150
  for (let i = 0; i < toImport.length; i += CHUNK) {
    const batch = writeBatch(db)
    for (const p of toImport.slice(i, i + CHUNK)) {
      const id = idByNumber.get(p.number)!
      const books = Number(p.issueDate.slice(0, 4)) >= bookFromYear
      const fields: Record<string, unknown> = {
        userId: uid,
        kind: p.kind,
        status: p.status,
        number: p.number,
        customer: p.customer,
        lines: [{ description: IMPORTED_LINE_TEXT, quantity: 1, unitPrice: p.total }],
        issueDate: p.issueDate,
        dueDate: p.dueDate,
        total: p.total,
        createdAt: Date.now(),
      }
      if (!books) fields.historical = true
      if (p.creditsNumber !== undefined) {
        const originalId = idByNumber.get(p.creditsNumber)
          ?? existing.find((e) => e.number === p.creditsNumber)?.id
        if (originalId) fields.creditsInvoiceId = originalId
      }

      if (books) {
        const incomeRef = doc(collection(db, 'income'))
        batch.set(incomeRef, {
          userId: uid,
          amount: incomeAmount({ kind: p.kind, total: p.total }),
          date: p.issueDate,
          description: incomeDescription({ kind: p.kind, number: p.number, customer: p.customer }),
          invoiceId: id,
          createdAt: Date.now(),
        })
        fields.incomeId = incomeRef.id
        booked++
      }

      batch.set(doc(db, 'invoices', id), stripUndefined(fields))
      done++
    }
    await batch.commit()
    onProgress?.(done, toImport.length)
  }

  // Nummerserien skal fortsette etter det høyeste importerte nummeret, aldri
  // settes ned.
  const highest = parsed.reduce((max, p) => Math.max(max, p.number), 0)
  const nextInvoiceNumber = Math.max(currentNextNumber, highest + 1)
  if (nextInvoiceNumber !== currentNextNumber) await updateSettings({ nextInvoiceNumber })

  return { added: toImport.length, skipped, booked, nextInvoiceNumber }
}
