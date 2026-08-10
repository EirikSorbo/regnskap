// ---------------------------------------------------------------------------
//  ÅRSAVSLUTNING — HVA SOM MANGLER FØR ÅRET KAN LEVERES
// ---------------------------------------------------------------------------
//  Rene funksjoner, uten Firestore og uten JSX. Lå tidligere inne i
//  YearEndModal, der de ikke kunne testes. Sjekklista er det siste som ser på
//  regnskapet ditt før det går til Altinn, så den bør være det best dekkede
//  stedet i appen, ikke det minst dekkede.
// ---------------------------------------------------------------------------

import { type Entry, type ReceiptEntry, type IncomeEntry, getImageUrls } from '../types.ts'
import { type Invoice, numberGaps, outstandingInvoices, outstandingTotal } from './invoice.ts'

/** Kvitteringer uten bilde av bilaget.
 *
 *  Kjøreturer har aldri vedlegg og skal ikke flagges: kjøregodtgjørelse
 *  dokumenteres av turen selv, ikke av en kvittering. */
export function receiptsMissingAttachment(entries: Entry[]): Entry[] {
  return entries.filter((e) =>
    e.entryType === 'receipt' && getImageUrls(e as ReceiptEntry).length === 0)
}

/** Kladder er ikke bilag. Ligger de igjen ved årsslutt, er det som regel arbeid
 *  som aldri ble fakturert. */
export function draftInvoices(yearInvoices: Invoice[]): Invoice[] {
  return yearInvoices.filter((i) => i.status === 'kladd')
}

/** Hull i nummerrekka blant årets utstedte bilag. Kladder har ikke nummer og
 *  teller ikke med. */
export function invoiceNumberGaps(yearInvoices: Invoice[]): number[] {
  return numberGaps(yearInvoices
    .filter((i) => i.status !== 'kladd')
    .map((i) => i.number)
    .filter((n): n is number => typeof n === 'number'))
}

/** Inntekt som ikke kommer fra en faktura i appen.
 *
 *  Slike rader teller i resultatet, men har ingen faktura bak seg og vises ikke
 *  i fakturajournalen. De stammer som regel fra tiden før fakturamodulen. Uten
 *  denne sjekken kan årsrapportens inntekt være høyere enn journalen viser,
 *  uten at noe forklarer forskjellen. */
export function incomeWithoutInvoice(yearIncome: IncomeEntry[]): IncomeEntry[] {
  return yearIncome.filter((i) => !i.invoiceId)
}

export function sumIncome(list: IncomeEntry[]): number {
  return Math.round(list.reduce((s, i) => s + (Number(i.amount) || 0), 0) * 100) / 100
}

/** Er backupen god nok for dette året?
 *
 *  For et år som er omme kreves en backup tatt etter nyttår, for først da
 *  inneholder den hele året. Står du i inneværende år, finnes ikke et slikt
 *  tidspunkt ennå, og vi ber i stedet om at det ikke er for lenge siden sist. */
export function backupMissing(lastBackupAt: number | undefined, year: number, now = Date.now()): boolean {
  if (!lastBackupAt) return true
  if (year < new Date(now).getFullYear()) return lastBackupAt < Date.UTC(year + 1, 0, 1)
  return now - lastBackupAt > 30 * 24 * 60 * 60 * 1000
}

export interface YearEndChecks {
  missingAttachment: Entry[]
  drafts: Invoice[]
  gaps: number[]
  outstanding: Invoice[]
  outstandingSum: number
  incomeWithoutInvoice: IncomeEntry[]
  incomeWithoutInvoiceSum: number
  backupMissing: boolean
}

/** Hele sjekklista i ett kall, slik at skjermen bare tegner resultatet. */
export function yearEndChecks(input: {
  year: number
  entries: Entry[]
  yearIncome: IncomeEntry[]
  invoices: Invoice[]
  lastBackupAt?: number
  now?: number
}): YearEndChecks {
  const { year, entries, yearIncome, invoices, lastBackupAt, now } = input
  const yearInvoices = invoices.filter((i) => i.issueDate?.startsWith(String(year)))
  const utenFaktura = incomeWithoutInvoice(yearIncome)

  return {
    missingAttachment: receiptsMissingAttachment(entries),
    drafts: draftInvoices(yearInvoices),
    gaps: invoiceNumberGaps(yearInvoices),
    // Samme regel som summen under: en kreditnota venter ikke på betaling.
    outstanding: outstandingInvoices(yearInvoices),
    outstandingSum: outstandingTotal(yearInvoices),
    incomeWithoutInvoice: utenFaktura,
    incomeWithoutInvoiceSum: sumIncome(utenFaktura),
    backupMissing: backupMissing(lastBackupAt, year, now),
  }
}
