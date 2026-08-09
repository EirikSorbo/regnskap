// Visningsformat: kroner og norske periodenavn. Kroneformateringen var skrevet
// ut i klartekst rundt 30 steder, og månedslistene fantes i to eksemplarer.

import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

export const MONTHS = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember']
export const QUARTERS = ['Q1 (jan–mar)', 'Q2 (apr–jun)', 'Q3 (jul–sep)', 'Q4 (okt–des)']

/** Datoformatering som ALDRI kaster.
 *
 *  `format(new Date(x))` kaster RangeError på en ugyldig dato. Appen gjorde det
 *  19 steder, og siden det skjer under rendring, tok én ødelagt dato fra en
 *  import med seg hele skjermen. Her får du en strek i stedet, og resten av
 *  siden står. */
export function fmtDate(iso: string | undefined | null, pattern = 'd. MMM yyyy'): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return format(d, pattern, { locale: nb })
}


export function kr(n: number): string {
  return n.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })
}

/** Tall uten valutasymbol, uten desimaler (oversikts- og rapportkolonner). */
export function krInt(n: number): string {
  return n.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

/** Tall uten valutasymbol, alltid to desimaler (rapportens beløpskolonner). */
export function kr2(n: number): string {
  return n.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
