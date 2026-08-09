// ---------------------------------------------------------------------------
//  FAKTURA — DOMENE OG RENE BEREGNINGER
// ---------------------------------------------------------------------------
//  Ingen Firestore her, bare formen på en faktura og reglene som gjelder for
//  den. Skrivingen ligger i invoice-store.ts.
//
//  Grunnprinsippet: inntekten føres på FAKTURADATOEN, ikke når pengene kommer.
//  «Marker som betalt» er derfor bare oppfølging og rører ikke regnskapet.
//
//  Ingen MVA: foretaket er ikke registrert i Merverdiavgiftsregisteret, så
//  fakturaen har verken avgiftslinjer eller «MVA» etter organisasjonsnummeret.
//
//  .ts-endelse på importen fordi testene kjører rett på node.
// ---------------------------------------------------------------------------

export type InvoiceKind = 'faktura' | 'kreditnota'

/** kladd → utstedt → betalt. «kreditert» er endestasjon for en faktura som er
 *  gjort opp med kreditnota. En utstedt faktura går aldri tilbake til kladd. */
export type InvoiceStatus = 'kladd' | 'utstedt' | 'betalt' | 'kreditert'

export interface InvoiceLine {
  description: string
  quantity: number
  unitPrice: number
}

export interface InvoiceCustomer {
  name: string
  address?: string
  address2?: string
  postalCode?: string
  city?: string
  country?: string
  email?: string
  phone?: string
  orgNumber?: string
}

/** En kunde i registeret. Samme form som kunden på fakturaen, pluss id. */
export interface Customer extends InvoiceCustomer {
  id?: string
  userId: string
  createdAt: number
}

export interface Invoice {
  id?: string
  userId: string
  kind: InvoiceKind
  status: InvoiceStatus
  /** Tildeles først ved utstedelse, i en transaksjon. Kladder har ikke nummer,
   *  nettopp for at en forkastet kladd ikke skal lage hull i rekken. */
  number?: number
  /** Kunden slik hun så ut da fakturaen ble utstedt. En frossen KOPI, ikke en
   *  peker: retter du adressen i kunderegisteret i morgen, skal ikke fjorårets
   *  faktura endre seg. */
  customer: InvoiceCustomer
  lines: InvoiceLine[]
  /** Fakturadatoen. Denne styrer hvilket år inntekten havner i. */
  issueDate: string
  dueDate: string
  paidDate?: string
  note?: string
  total: number
  /** Inntektsføringen denne fakturaen opprettet, så den kan ryddes med. */
  incomeId?: string
  /** For kreditnota: fakturaen som krediteres. */
  creditsInvoiceId?: string
  /** Importert fra et tidligere system. Fører ALDRI inntekt, fordi de tallene
   *  allerede er bokført et annet sted. Ren dokumentasjon. */
  historical?: boolean
  createdAt: number
}

/** Standard betalingsfrist i dager når kunden ikke har sin egen. */
export const DEFAULT_PAYMENT_TERMS_DAYS = 14

export function lineTotal(line: InvoiceLine): number {
  const q = Number(line.quantity) || 0
  const p = Number(line.unitPrice) || 0
  return Math.round(q * p * 100) / 100
}

export function invoiceTotal(lines: InvoiceLine[]): number {
  return Math.round(lines.reduce((s, l) => s + lineTotal(l), 0) * 100) / 100
}

/** Forfallsdato = fakturadato + antall dager. Ren datoregning på ISO-strenger,
 *  uten tidssoner å gå seg vill i. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return isoDate
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

/** Er fakturaen forfalt? Kun utstedte fakturaer kan forfalle; betalte og
 *  krediterte er gjort opp, og kladder er ikke sendt. */
export function isOverdue(inv: Invoice, today: string): boolean {
  return inv.status === 'utstedt' && inv.dueDate < today
}

/** Utestående beløp: det som er utstedt og ikke gjort opp. */
export function outstandingTotal(invoices: Invoice[]): number {
  return Math.round(invoices
    .filter((i) => i.status === 'utstedt' && i.kind === 'faktura')
    .reduce((s, i) => s + i.total, 0) * 100) / 100
}

/** En utstedt faktura kan ikke redigeres. Retting skjer med kreditnota, ellers
 *  ville bilaget kunne endres etter at kunden har fått det. */
export function canEdit(inv: Invoice): boolean {
  return inv.status === 'kladd'
}

export function canDelete(inv: Invoice): boolean {
  // Bare kladder. Et tildelt nummer skal aldri forsvinne ut av rekken.
  return inv.status === 'kladd'
}

export function canCredit(inv: Invoice): boolean {
  return inv.kind === 'faktura' && (inv.status === 'utstedt' || inv.status === 'betalt') && !inv.historical
}

export function statusLabel(inv: Invoice, today: string): string {
  if (inv.kind === 'kreditnota') return 'Kreditnota'
  if (inv.historical) return 'Historisk'
  if (inv.status === 'kladd') return 'Kladd'
  if (inv.status === 'betalt') return 'Betalt'
  if (inv.status === 'kreditert') return 'Kreditert'
  return isOverdue(inv, today) ? 'Forfalt' : 'Utstedt'
}

/** Hva som mangler før fakturaen kan utstedes. Tom liste = klar. */
export function validateForIssue(inv: Pick<Invoice, 'customer' | 'lines' | 'issueDate'>): string[] {
  const problems: string[] = []
  if (!inv.customer?.name?.trim()) problems.push('Fakturaen mangler kunde.')
  const lines = inv.lines?.filter((l) => l.description.trim() || lineTotal(l) !== 0) ?? []
  if (lines.length === 0) problems.push('Fakturaen må ha minst én linje.')
  if (lines.some((l) => !l.description.trim())) problems.push('Alle linjer må ha en beskrivelse.')
  if (invoiceTotal(lines) <= 0) problems.push('Fakturabeløpet må være større enn null.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(inv.issueDate || '')) problems.push('Ugyldig fakturadato.')
  return problems
}

/** Teksten inntektsføringen får, så du ser i regnskapet hvor beløpet kommer
 *  fra uten å slå opp fakturaen. */
export function incomeDescription(inv: Pick<Invoice, 'kind' | 'number' | 'customer'>): string {
  const label = inv.kind === 'kreditnota' ? 'Kreditnota' : 'Faktura'
  return `${label} ${inv.number ?? ''} – ${inv.customer.name}`.replace(/\s+/g, ' ').trim()
}

/** Beløpet som skal føres som inntekt. En kreditnota trekker fra. */
export function incomeAmount(inv: Pick<Invoice, 'kind' | 'total'>): number {
  return inv.kind === 'kreditnota' ? -Math.abs(inv.total) : inv.total
}

/** Navnet PDF-en foreslås lagret som.
 *
 *  Nettleseren henter filnavnet fra sidens tittel når du velger «Lagre som
 *  PDF», så det er tittelen vi setter. Skråstrek og kolon fjernes, siden de
 *  ikke kan stå i et filnavn og ellers ville blitt til noe uleselig. */
export function invoiceFileName(
  inv: Pick<Invoice, 'kind' | 'number'>,
  companyName?: string,
): string {
  const label = inv.kind === 'kreditnota' ? 'Kreditnota' : 'Faktura'
  const base = inv.number ? `${label} nr. ${inv.number}` : `${label} uten nummer`
  const from = companyName?.trim() ? ` fra ${companyName.trim()}` : ''
  return `${base}${from}`.replace(/[/\\:*?"<>|]/g, '-')
}

/** Kunden uten registermetadata (id, eier, opprettet), klar til å fryses på en
 *  faktura. Feltene plukkes eksplisitt: da kan ikke et nytt registerfelt havne
 *  på fakturaen ved et uhell. */
export function toInvoiceCustomer(c: InvoiceCustomer): InvoiceCustomer {
  return {
    name: c.name,
    address: c.address,
    address2: c.address2,
    postalCode: c.postalCode,
    city: c.city,
    country: c.country,
    email: c.email,
    phone: c.phone,
    orgNumber: c.orgNumber,
  }
}

/** Numrene som mangler i en fakturarekke. Bokføringsreglene krever en
 *  fortløpende rekke uten hull, og journalen skal kunne vise at den er det.
 *  Et hull betyr som regel bare at fakturaen er utstedt i et annet år, men det
 *  er verdt å få øye på. */
export function numberGaps(numbers: number[]): number[] {
  const sorted = [...new Set(numbers.filter((n) => Number.isFinite(n)))].sort((a, b) => a - b)
  const gaps: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    for (let n = sorted[i - 1] + 1; n < sorted[i]; n++) gaps.push(n)
  }
  return gaps
}

/** Adressen som én blokk linjer, klar for fakturaen. Norge utelates, slik man
 *  gjør på innenlandske fakturaer. */
export function addressLines(c: InvoiceCustomer): string[] {
  const isNorway = !c.country || /^(norge|norway|no)$/i.test(c.country.trim())
  return [
    c.address,
    c.address2,
    [c.postalCode, c.city].filter(Boolean).join(' '),
    isNorway ? undefined : c.country,
  ].map((l) => (l || '').trim()).filter(Boolean)
}
