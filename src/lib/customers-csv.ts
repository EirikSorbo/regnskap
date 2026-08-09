// ---------------------------------------------------------------------------
//  KUNDEIMPORT FRA CSV — REN PARSING
// ---------------------------------------------------------------------------
//  Leser en kundeeksport fra et tidligere system. Ingen Firestore her, så den
//  kan testes rett fram; skrivingen skjer i customers.ts.
//
//  Importen oppretter ALDRI fakturaer eller inntektsføringer. Kolonner som
//  «Antall fakturaer» og «Fakturert beløp» er oppsummeringer fra det gamle
//  systemet, og å gjøre dem om til bilag her ville dobbeltført inntekten.
// ---------------------------------------------------------------------------

import type { InvoiceCustomer } from './invoice.ts'

const DELIMITERS = ['\t', ';', ','] as const

/** Kolonnenavn vi kjenner igjen. Nøkkelen er overskriften normalisert: små
 *  bokstaver, uten mellomrom, punktum og bindestrek. */
const HEADER_ALIASES: Record<string, keyof InvoiceCustomer> = {
  navn: 'name', kundenavn: 'name', kunde: 'name', name: 'name',
  adresse: 'address', adresse1: 'address', gateadresse: 'address', address: 'address',
  adresse2: 'address2', address2: 'address2',
  postnummer: 'postalCode', postnr: 'postalCode', postalcode: 'postalCode', zip: 'postalCode',
  sted: 'city', poststed: 'city', by: 'city', city: 'city',
  land: 'country', country: 'country',
  epostadresse: 'email', epost: 'email', email: 'email', mail: 'email',
  telefon: 'phone', tlf: 'phone', mobil: 'phone', phone: 'phone',
  orgnr: 'orgNumber', organisasjonsnummer: 'orgNumber', orgnummer: 'orgNumber',
}

export interface ParsedCustomers {
  customers: InvoiceCustomer[]
  /** Overskrifter vi ikke bruker, så brukeren ser hva som blir liggende igjen. */
  ignoredColumns: string[]
  /** Rader uten navn. En kunde uten navn kan ikke faktureres. */
  skippedRows: number
  /** Rader som var samme kunde som en tidligere rad i fila. */
  duplicateRows: number
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[\s.\-_]/g, '').replace(/^"|"$/g, '')
}

/** Deler hele teksten i rader og felter. Håndterer anførselstegn, doble
 *  anførselstegn som escape, og linjeskift inne i et felt. */
function parseRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
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

/** Gjetter skilletegnet ut fra overskriftslinja: det som forekommer flest
 *  ganger utenfor anførselstegn vinner. Eksportfiler bruker tab, semikolon
 *  eller komma om hverandre. */
export function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim() !== '') ?? ''
  let best = ';'
  let bestCount = -1
  for (const d of DELIMITERS) {
    let count = 0
    let inQuotes = false
    for (const c of firstLine) {
      if (c === '"') inQuotes = !inQuotes
      else if (c === d && !inQuotes) count++
    }
    if (count > bestCount) { best = d; bestCount = count }
  }
  return best
}

/** Postnummer med ledende null tilbake. Eksporten vi fikk hadde skrevet Oslo
 *  0130 som «130», fordi tallet var innom et regneark på veien. Fire sifre er
 *  fasit i Norge, så alt kortere fylles ut. */
export function normalizePostalCode(raw: string): string {
  const v = raw.trim()
  return /^\d{1,4}$/.test(v) ? v.padStart(4, '0') : v
}

/** «NORWAY» og «NORGE» blir til Norge; alt annet står som det står. */
function normalizeCountry(raw: string): string {
  const v = raw.trim()
  return /^(norge|norway|no)$/i.test(v) ? 'Norge' : v
}

function customerKey(c: InvoiceCustomer): string {
  return `${c.name.trim().toLowerCase()}|${(c.postalCode ?? '').trim()}`
}

export function parseCustomerCsv(text: string): ParsedCustomers {
  const delimiter = detectDelimiter(text)
  const rows = parseRows(text, delimiter)
  if (rows.length === 0) return { customers: [], ignoredColumns: [], skippedRows: 0, duplicateRows: 0 }

  const headers = rows[0].map((h) => h.trim())
  const mapping = headers.map((h) => HEADER_ALIASES[normalizeHeader(h)])
  const ignoredColumns = headers.filter((h, i) => !mapping[i] && h !== '')

  const customers: InvoiceCustomer[] = []
  const seen = new Set<string>()
  let skippedRows = 0
  let duplicateRows = 0

  for (const row of rows.slice(1)) {
    if (row.every((f) => f.trim() === '')) continue
    const c: InvoiceCustomer = { name: '' }
    row.forEach((value, i) => {
      const field = mapping[i]
      if (!field) return
      const v = value.trim()
      if (!v) return
      if (field === 'postalCode') c.postalCode = normalizePostalCode(v)
      else if (field === 'country') c.country = normalizeCountry(v)
      else c[field] = v
    })
    if (!c.name.trim()) { skippedRows++; continue }
    const key = customerKey(c)
    if (seen.has(key)) { duplicateRows++; continue }
    seen.add(key)
    customers.push(c)
  }

  return { customers, ignoredColumns, skippedRows, duplicateRows }
}
