// ---------------------------------------------------------------------------
//  INNTEKT — DET REGNSKAPET FAKTISK SKAL VISE
// ---------------------------------------------------------------------------
//  Inntekt oppstår på tre måter i denne appen, og de tre kan ikke summeres uten
//  videre:
//
//   1. Som en rad i income-samlingen, skrevet av utstedelsen av en faktura.
//      Raden peker på fakturaen med invoiceId.
//
//   2. Som en rad UTEN invoiceId. Slik ser de gamle årene ut: én årssum ført
//      for hånd, gjerne datert 31. desember, fra den tiden regnskapet ble holdt
//      et annet sted.
//
//   3. Som en faktura uten noen rad i det hele tatt. Fakturaene hentet inn fra
//      det gamle systemet fikk aldri inntektsføring.
//
//  Reglene under er valgt for at ingen krone skal telles to ganger. Det er
//  viktigere enn at hvert år får et tall: et for høyt driftsresultat er verre
//  enn et manglende.
// ---------------------------------------------------------------------------

import type { IncomeEntry } from '../types.ts'
import { type Invoice, incomeAmount, incomeDescription } from './invoice.ts'

const aaret = (dato: string | undefined) => (dato ?? '').slice(0, 4)

/** Inntekten for regnskapet.
 *
 *  Fakturaer gjøres om til inntekt BARE for år der ingenting er ført som
 *  inntekt fra før. Har året allerede en håndført årssum, er den fasit, og
 *  fakturaene fra samme år er dokumentasjonen bak den. Å legge dem oppå ville
 *  doblet året.
 *
 *  Radene som utledes er ikke lagret. Ingenting skrives til Firestore, og en
 *  backup inneholder fortsatt bare de ekte radene. */
export function effectiveIncome(incomeEntries: IncomeEntry[], invoices: Invoice[]): IncomeEntry[] {
  // År som har minst én inntektsrad uten kobling til en faktura. Der er
  // regnskapet ført på gamlemåten, og appen skal ikke legge noe oppå.
  const aarMedEgenFoering = new Set(
    incomeEntries.filter((i) => !i.invoiceId).map((i) => aaret(i.date)))

  const fakturaerMedRad = new Set(
    incomeEntries.map((i) => i.invoiceId).filter((id): id is string => !!id))

  const utledet: IncomeEntry[] = invoices
    .filter((inv) =>
      inv.status !== 'kladd'
      && inv.id
      && !fakturaerMedRad.has(inv.id)
      && !aarMedEgenFoering.has(aaret(inv.issueDate)))
    .map((inv) => ({
      // Id-en er merket, så den aldri forveksles med et ekte dokument.
      id: `utledet-${inv.id}`,
      userId: inv.userId,
      amount: incomeAmount(inv),
      date: inv.issueDate,
      description: incomeDescription(inv),
      // Settes, slik at årsavslutningens «inntekt uten faktura» ikke flagger
      // disse: de har jo nettopp en faktura bak seg.
      invoiceId: inv.id,
      createdAt: inv.createdAt ?? 0,
    }))

  return [...incomeEntries, ...utledet]
}

/** Er årets inntekt utledet fra fakturaene, framfor ført som egne rader?
 *
 *  Brukes til å si fra på skjermen, slik at et tall som ikke finnes som bilag
 *  i appen ikke ser ut som om det gjør det. */
export function incomeIsDerived(yearIncome: IncomeEntry[]): boolean {
  return yearIncome.length > 0 && yearIncome.every((i) => i.id?.startsWith('utledet-'))
}
