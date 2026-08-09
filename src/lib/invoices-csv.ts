// ---------------------------------------------------------------------------
//  FAKTURAIMPORT FRA CSV — REN PARSING
// ---------------------------------------------------------------------------
//  Leser en fakturaeksport fra det tidligere systemet. Ingen Firestore her.
//
//  Tre ting som ikke er åpenbare i eksportfilen:
//
//  1. Fakturanumrene er på formen 20150271. De fire første sifrene er et fast
//     prefiks fra det gamle systemet og skal bort, så rekken blir 1–271.
//  2. Radene med status «Faktura opprettet» har NEGATIVT beløp. Det er
//     kreditnotaer, ikke fakturaer. Motparten deres har status «Kreditert».
//  3. Filen har ingen linjedetaljer, bare et totalbeløp, så hver faktura får
//     én linje med hele beløpet.
// ---------------------------------------------------------------------------

import type { InvoiceCustomer, InvoiceKind, InvoiceStatus } from './invoice.ts'

/** Antall sifre foran i fakturanummeret som er årsprefiks fra det gamle
 *  systemet, og som fjernes ved import. */
const NUMBER_PREFIX_LENGTH = 4

export interface ParsedInvoice {
  number: number
  kind: InvoiceKind
  status: InvoiceStatus
  customer: InvoiceCustomer
  issueDate: string
  dueDate: string
  total: number
  /** Nummeret på fakturaen denne kreditnotaen retter, når vi finner den. */
  creditsNumber?: number
}

export interface ParsedInvoices {
  invoices: ParsedInvoice[]
  ignoredColumns: string[]
  skippedRows: number
  /** Numre som mangler i rekken. Skal normalt være tom. */
  gaps: number[]
}

function splitRows(text: string, delimiter = ';'): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  // Fjern eventuell BOM, ellers blir første overskrift ulesbar.
  const clean = text.replace(/^\uFEFF/, '')

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i]
    if (inQuotes) {
      if (c === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
      continue
    }
    if (c === '"') { inQuotes = true; continue }
    if (c === delimiter) { row.push(field); field = ''; continue }
    if (c === '\r') continue
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue }
    field += c
  }
  row.push(field)
  if (row.some((f) => f !== '')) rows.push(row)
  return rows
}

/** «31.05.2026» → «2026-05-31». Tomt eller uforståelig gir tom streng, som
 *  kalleren håndterer, framfor en oppdiktet dato. */
export function parseNorwegianDate(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (!m) return /^\d{4}-\d{2}-\d{2}$/.test(raw.trim()) ? raw.trim() : ''
  const [, d, mo, y] = m
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
}

/** Fjerner årsprefikset foran fakturanummeret: 20150271 → 271. Korte numre
 *  står urørt, så en fil uten prefiks ikke blir ødelagt. */
export function stripNumberPrefix(raw: string): number | null {
  const digits = raw.trim().replace(/\D/g, '')
  if (!digits) return null
  const rest = digits.length > NUMBER_PREFIX_LENGTH ? digits.slice(NUMBER_PREFIX_LENGTH) : digits
  const n = parseInt(rest, 10)
  return Number.isFinite(n) ? n : null
}

function parseAmount(raw: string): number {
  const v = raw.trim().replace(/\s/g, '').replace(',', '.')
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

const USED_COLUMNS = new Set([
  'Fakturanummer', 'Status', 'Fakturadato', 'Forfallsdato', 'Kunde', 'E-postadresse',
  'Org.nr.', 'Adresse', 'Adresse 2', 'Postnummer', 'Sted', 'Fakturabeløp',
])

/** Kobler hver kreditnota til fakturaen den retter: samme kunde og samme beløp,
 *  blant fakturaene som er merket «Kreditert». Har en kunde flere krediterte
 *  fakturaer, skiller beløpet dem. */
function linkCreditNotes(invoices: ParsedInvoice[]): void {
  const credited = invoices.filter((i) => i.status === 'kreditert')
  const taken = new Set<number>()
  for (const note of invoices.filter((i) => i.kind === 'kreditnota')) {
    const match = credited.find((c) =>
      !taken.has(c.number)
      && c.customer.name === note.customer.name
      && Math.abs(c.total - note.total) < 0.005)
    if (match) {
      note.creditsNumber = match.number
      taken.add(match.number)
    }
  }
}

export function parseInvoiceCsv(text: string): ParsedInvoices {
  const rows = splitRows(text)
  if (rows.length === 0) return { invoices: [], ignoredColumns: [], skippedRows: 0, gaps: [] }

  const headers = rows[0].map((h) => h.trim())
  const col = (name: string) => headers.indexOf(name)
  const idx = {
    number: col('Fakturanummer'), status: col('Status'),
    issueDate: col('Fakturadato'), dueDate: col('Forfallsdato'),
    name: col('Kunde'), email: col('E-postadresse'), orgNumber: col('Org.nr.'),
    address: col('Adresse'), address2: col('Adresse 2'),
    postalCode: col('Postnummer'), city: col('Sted'), total: col('Fakturabeløp'),
  }
  const ignoredColumns = headers.filter((h) => h !== '' && !USED_COLUMNS.has(h))

  const invoices: ParsedInvoice[] = []
  let skippedRows = 0

  for (const row of rows.slice(1)) {
    if (row.every((f) => f.trim() === '')) continue
    const at = (i: number) => (i >= 0 ? (row[i] ?? '').trim() : '')

    const number = stripNumberPrefix(at(idx.number))
    const issueDate = parseNorwegianDate(at(idx.issueDate))
    const name = at(idx.name)
    const rawTotal = parseAmount(at(idx.total))
    if (number === null || !issueDate || !name) { skippedRows++; continue }

    // Negativt beløp = kreditnota, uansett hva statusfeltet kaller den.
    const isCredit = rawTotal < 0
    const rawStatus = at(idx.status).toLowerCase()
    const status: InvoiceStatus =
      isCredit ? 'utstedt'
      : rawStatus.startsWith('betalt') ? 'betalt'
      : rawStatus.startsWith('kreditert') ? 'kreditert'
      : 'utstedt'

    const customer: InvoiceCustomer = { name }
    const put = (key: keyof InvoiceCustomer, v: string) => { if (v) customer[key] = v }
    put('email', at(idx.email))
    put('orgNumber', at(idx.orgNumber))
    put('address', at(idx.address))
    put('address2', at(idx.address2))
    put('postalCode', at(idx.postalCode))
    put('city', at(idx.city))

    invoices.push({
      number,
      kind: isCredit ? 'kreditnota' : 'faktura',
      status,
      customer,
      issueDate,
      dueDate: parseNorwegianDate(at(idx.dueDate)) || issueDate,
      total: Math.abs(rawTotal),
    })
  }

  invoices.sort((a, b) => a.number - b.number)
  linkCreditNotes(invoices)

  const numbers = invoices.map((i) => i.number)
  const gaps: number[] = []
  for (let n = Math.min(...numbers); n <= Math.max(...numbers); n++) {
    if (numbers.length > 0 && !numbers.includes(n)) gaps.push(n)
  }

  return { invoices, ignoredColumns, skippedRows, gaps }
}
