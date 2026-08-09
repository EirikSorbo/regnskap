import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInvoiceCsv, parseNorwegianDate, stripNumberPrefix } from './invoices-csv.ts'

// Overskriftene er de samme som eksporten fra det gamle systemet har. Beløp,
// datoer og statuser er ekte format; navn og adresser er oppdiktede.
const HEADER = '"Fakturanummer";"KID";"Status";"Fakturadato";"Forfallsdato";"Kunde";"E-postadresse";"Org.nr.";"KundeID";"Adresse";"Adresse 2";"Postnummer";"Sted";"Bankkonto";"Nettobeløp";"Mva";"Fakturabeløp";"Restbeløp";"Purregebyr";"Renter";"Purringsdato";"Inkasso status"'

function row(number: string, status: string, date: string, kunde: string, belop: string) {
  return `${number};;"${status}";"${date}";"14.06.2026";"${kunde}";"post@eksempel.no";"983690602";8430649;"Gata 12";;"4610";"KRISTIANSAND S";63201126217;${belop};0;${belop};0;;;;`
}

test('stripNumberPrefix: fjerner årsprefikset foran nummeret', () => {
  assert.equal(stripNumberPrefix('20150271'), 271)
  assert.equal(stripNumberPrefix('20150001'), 1)
  // Kortere numre står urørt, så en fil uten prefiks ikke blir ødelagt.
  assert.equal(stripNumberPrefix('42'), 42)
  assert.equal(stripNumberPrefix(''), null)
})

test('parseNorwegianDate: dd.mm.åååå blir ISO', () => {
  assert.equal(parseNorwegianDate('31.05.2026'), '2026-05-31')
  assert.equal(parseNorwegianDate('1.3.2015'), '2015-03-01')
  assert.equal(parseNorwegianDate('2026-05-31'), '2026-05-31')
  // Uforståelig dato gir tom streng, ikke en oppdiktet dato.
  assert.equal(parseNorwegianDate('mai 2026'), '')
})

test('parseInvoiceCsv: leser faktura med kunde, datoer og beløp', () => {
  const csv = `${HEADER}\n${row('20150271', 'Betalt', '31.05.2026', 'Eksempel AS', '5000')}`
  const { invoices } = parseInvoiceCsv(csv)
  assert.equal(invoices.length, 1)
  assert.deepEqual(invoices[0], {
    number: 271,
    kind: 'faktura',
    status: 'betalt',
    customer: {
      name: 'Eksempel AS', email: 'post@eksempel.no', orgNumber: '983690602',
      address: 'Gata 12', postalCode: '4610', city: 'KRISTIANSAND S',
    },
    issueDate: '2026-05-31',
    dueDate: '2026-06-14',
    total: 5000,
  })
})

test('parseInvoiceCsv: negativt beløp er en kreditnota, uansett hva status heter', () => {
  // I eksporten heter kreditnotaene «Faktura opprettet» og har negativt beløp.
  const csv = [HEADER,
    row('20150176', 'Kreditert', '01.08.2020', 'Tysland Musikk', '5700'),
    row('20150179', 'Faktura opprettet', '18.08.2020', 'Tysland Musikk', '-5700'),
  ].join('\n')
  const { invoices } = parseInvoiceCsv(csv)
  const original = invoices.find(i => i.number === 176)!
  const note = invoices.find(i => i.number === 179)!
  assert.equal(original.kind, 'faktura')
  assert.equal(original.status, 'kreditert')
  assert.equal(note.kind, 'kreditnota')
  assert.equal(note.total, 5700)          // lagres positivt, trekkes fra ved føring
  assert.equal(note.creditsNumber, 176)   // koblet til fakturaen den retter
})

test('parseInvoiceCsv: to krediterte fakturaer hos samme kunde skilles på beløp', () => {
  const csv = [HEADER,
    row('20150165', 'Kreditert', '20.12.2019', 'Hunsfos AS', '4000'),
    row('20150166', 'Kreditert', '20.12.2019', 'Hunsfos AS', '7500'),
    row('20150167', 'Faktura opprettet', '20.12.2019', 'Hunsfos AS', '-7500'),
    row('20150168', 'Faktura opprettet', '20.12.2019', 'Hunsfos AS', '-4000'),
  ].join('\n')
  const { invoices } = parseInvoiceCsv(csv)
  assert.equal(invoices.find(i => i.number === 167)!.creditsNumber, 166)
  assert.equal(invoices.find(i => i.number === 168)!.creditsNumber, 165)
})

test('parseInvoiceCsv: sorterer på nummer og finner hull i rekken', () => {
  const csv = [HEADER,
    row('20150003', 'Betalt', '01.03.2015', 'A', '100'),
    row('20150001', 'Betalt', '01.01.2015', 'B', '200'),
  ].join('\n')
  const r = parseInvoiceCsv(csv)
  assert.deepEqual(r.invoices.map(i => i.number), [1, 3])
  assert.deepEqual(r.gaps, [2])
})

test('parseInvoiceCsv: rader uten nummer, dato eller kunde hoppes over', () => {
  const csv = [HEADER,
    row('', 'Betalt', '01.03.2015', 'A', '100'),
    row('20150002', 'Betalt', '', 'B', '100'),
    row('20150003', 'Betalt', '01.03.2015', '', '100'),
  ].join('\n')
  const r = parseInvoiceCsv(csv)
  assert.equal(r.invoices.length, 0)
  assert.equal(r.skippedRows, 3)
})

test('parseInvoiceCsv: kolonner vi ikke bruker rapporteres', () => {
  const csv = `${HEADER}\n${row('20150271', 'Betalt', '31.05.2026', 'Eksempel AS', '5000')}`
  const { ignoredColumns } = parseInvoiceCsv(csv)
  assert.ok(ignoredColumns.includes('KID'))
  assert.ok(ignoredColumns.includes('Bankkonto'))
  assert.ok(ignoredColumns.includes('Restbeløp'))
  assert.ok(!ignoredColumns.includes('Fakturabeløp'))
})

test('parseInvoiceCsv: BOM foran første overskrift ødelegger ikke lesingen', () => {
  const csv = `\uFEFF${HEADER}\n${row('20150271', 'Betalt', '31.05.2026', 'Eksempel AS', '5000')}`
  assert.equal(parseInvoiceCsv(csv).invoices.length, 1)
})

test('parseInvoiceCsv: tom fil gir tomt resultat', () => {
  assert.deepEqual(parseInvoiceCsv(''), { invoices: [], ignoredColumns: [], skippedRows: 0, gaps: [] })
})
