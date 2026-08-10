// ---------------------------------------------------------------------------
//  INNTEKT — DET REGNSKAPET FAKTISK SKAL VISE
// ---------------------------------------------------------------------------
//  Inntekt oppstår to steder:
//
//   1. Som en rad i income-samlingen. Slik blir det når du utsteder en faktura
//      i appen: utstedelsen skriver raden i samme transaksjon som nummeret.
//
//   2. Som en faktura UTEN en slik rad. Fakturaer hentet inn fra det gamle
//      systemet fikk aldri inntektsføring, fordi de allerede var bokført et
//      annet sted. Velger du et av de årene, hadde appen ingenting å vise: alle
//      fakturaene sto i fakturafanen, mens oversikten og rapporten viste null.
//
//  Her slås de to sammen. Koblingen går på invoiceId, så en faktura som ALLEREDE
//  har en inntektsrad aldri kan telles to ganger.
// ---------------------------------------------------------------------------

import type { IncomeEntry } from '../types.ts'
import { type Invoice, incomeAmount, incomeDescription } from './invoice.ts'

/** Inntekten for regnskapet: radene som finnes, pluss de utstedte fakturaene
 *  som mangler en.
 *
 *  De tilførte radene er utledet, ikke lagret. Ingenting skrives til Firestore,
 *  og en backup inneholder fortsatt bare de ekte radene. */
export function effectiveIncome(incomeEntries: IncomeEntry[], invoices: Invoice[]): IncomeEntry[] {
  const harRad = new Set(
    incomeEntries.map((i) => i.invoiceId).filter((id): id is string => !!id))

  const utledet: IncomeEntry[] = invoices
    .filter((inv) => inv.status !== 'kladd' && inv.id && !harRad.has(inv.id))
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
