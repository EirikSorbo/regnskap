// Visningsformat: kroner og norske periodenavn. Kroneformateringen var skrevet
// ut i klartekst rundt 30 steder, og månedslistene fantes i to eksemplarer.

export const MONTHS = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember']
export const QUARTERS = ['Q1 (jan–mar)', 'Q2 (apr–jun)', 'Q3 (jul–sep)', 'Q4 (okt–des)']


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
