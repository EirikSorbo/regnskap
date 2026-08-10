// ---------------------------------------------------------------------------
//  SEND FAKTURA PÅ E-POST
// ---------------------------------------------------------------------------
//  To veier, fordi ingen av dem gjør hele jobben alene:
//
//  mailto:  fyller ut mottaker, emne og tekst, men kan ALDRI ha vedlegg. Det er
//           en begrensning i selve mailto-standarden, ikke i nettleseren.
//
//  snarvei: sender de samme opplysningene, pluss filnavnet, videre til en
//           snarvei i Snarveier på Mac. Den kan finne den lagrede PDF-en og
//           legge den ved. Snarveien må lages én gang av brukeren; oppskriften
//           står i SHORTCUT_RECIPE nederst.
//
//  Rent og uten Firestore, så det kan testes.
// ---------------------------------------------------------------------------

import type { Invoice } from './invoice.ts'
import { kr, fmtDate } from './format.ts'

export const DEFAULT_SHORTCUT_NAME = 'Send faktura'

export function invoiceEmailSubject(
  inv: Pick<Invoice, 'kind' | 'number'>,
  companyName?: string,
): string {
  const label = inv.kind === 'kreditnota' ? 'Kreditnota' : 'Faktura'
  const nummer = inv.number ? ` ${inv.number}` : ''
  const fra = companyName?.trim() ? ` fra ${companyName.trim()}` : ''
  return `${label}${nummer}${fra}`
}

export function invoiceEmailBody(
  inv: Pick<Invoice, 'kind' | 'number' | 'total' | 'dueDate'>,
  companyName?: string,
): string {
  const isCredit = inv.kind === 'kreditnota'
  const label = isCredit ? 'kreditnota' : 'faktura'
  const nummer = inv.number ? ` ${inv.number}` : ''
  const forfall = !isCredit && inv.dueDate ? `, med forfall ${fmtDate(inv.dueDate, 'd. MMMM yyyy')}` : ''
  const hilsen = companyName?.trim() ? `\n\nVennlig hilsen\n${companyName.trim()}` : ''
  return `Hei,\n\nVedlagt følger ${label}${nummer} på ${kr(inv.total)}${forfall}.${hilsen}`
}

/** mailto-lenke. Mellomrom må bli %20 og ikke +, ellers viser noen e-postklienter
 *  plusstegn midt i emnefeltet. */
export function mailtoUrl(input: { to?: string; subject: string; body: string }): string {
  const q = new URLSearchParams({ subject: input.subject, body: input.body })
  return `mailto:${encodeURIComponent(input.to ?? '')}?${q.toString().replace(/\+/g, '%20')}`
}

/** Lenke som kjører en snarvei og sender med det den trenger.
 *
 *  Teksten er tre linjer: mottaker, emne, filnavn. Linjeskift er valgt som
 *  skilletegn fordi Snarveier har «Del opp tekst etter linjeskift» som
 *  standardvalg, og fordi ingen av de tre feltene kan inneholde et linjeskift. */
export function shortcutUrl(input: {
  name: string
  to?: string
  subject: string
  fileName: string
}): string {
  const text = [input.to ?? '', input.subject, input.fileName].join('\n')
  const q = new URLSearchParams({ name: input.name, input: 'text', text })
  return `shortcuts://run-shortcut?${q.toString().replace(/\+/g, '%20')}`
}

/** Oppskriften på snarveien, som teksten i innstillingene viser til. Ligger her
 *  fordi den må holdes i synk med formatet shortcutUrl sender. */
export const SHORTCUT_RECIPE = [
  'Motta tekst fra snarveier',
  'Del opp tekst (etter linjeskift) → gir mottaker, emne og filnavn',
  'Hent fil fra Nedlastinger med navnet fra linje 3',
  'Ny e-post: mottaker fra linje 1, emne fra linje 2, filen som vedlegg',
] as const
