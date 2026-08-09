import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseCustomerCsv, detectDelimiter, normalizePostalCode } from './customers-csv.ts'

// Overskriftene er de samme som eksporten fra det gamle systemet har. Radene er
// oppdiktede: ekte kundedata hører ikke hjemme i et kodelager.
const HEADER = 'Navn\tAdresse\tAdresse 2\tPostnummer\tSted\tLand\tE-postadresse\tTelefon\tType\tOrg.nr.\tAntall fakturaer\tFakturert beløp\tUtestående beløp fakturaer'

test('detectDelimiter: kjenner igjen tab, semikolon og komma', () => {
  assert.equal(detectDelimiter('a\tb\tc\n1\t2\t3'), '\t')
  assert.equal(detectDelimiter('a;b;c\n1;2;3'), ';')
  assert.equal(detectDelimiter('a,b,c\n1,2,3'), ',')
})

test('normalizePostalCode: ledende null tilbake, fire sifre', () => {
  // Regneark spiser ledende nuller, så Oslo 0130 kommer ut som «130».
  assert.equal(normalizePostalCode('130'), '0130')
  assert.equal(normalizePostalCode('4623'), '4623')
  assert.equal(normalizePostalCode('7'), '0007')
  assert.equal(normalizePostalCode('SW1A 1AA'), 'SW1A 1AA')  // utenlandsk står urørt
})

test('parseCustomerCsv: leser navn, adresse og postnummer med ledende null', () => {
  const csv = `${HEADER}
Turid Eksempel\tPostboks 7153\tSt. Olavs plass\t130\tOSLO\tNORWAY\t\t\tPrivatkunde\t\t1\t5000\t0`
  const r = parseCustomerCsv(csv)
  assert.equal(r.customers.length, 1)
  assert.deepEqual(r.customers[0], {
    name: 'Turid Eksempel',
    address: 'Postboks 7153',
    address2: 'St. Olavs plass',
    postalCode: '0130',
    city: 'OSLO',
    country: 'Norge',
  })
})

test('parseCustomerCsv: aggregatkolonnene importeres ikke, men rapporteres', () => {
  // «Antall fakturaer» og «Fakturert beløp» er summer fra det gamle systemet.
  // Ble de gjort om til bilag her, ville inntekten blitt dobbeltført.
  const csv = `${HEADER}
Ola Eksempel\tLinnkjellvegen 6 E\t\t4623\tKRISTIANSAND S\tNORWAY\t\t\tPrivatkunde\t\t8\t31326,5\t0`
  const r = parseCustomerCsv(csv)
  assert.equal(Object.hasOwn(r.customers[0], 'total'), false)
  assert.ok(r.ignoredColumns.includes('Antall fakturaer'))
  assert.ok(r.ignoredColumns.includes('Fakturert beløp'))
  assert.ok(r.ignoredColumns.includes('Type'))  // upålitelig: organisasjoner står som «Privatkunde»
})

test('parseCustomerCsv: rader uten navn hoppes over', () => {
  const csv = `${HEADER}
\tGateveien 1\t\t0150\tOSLO\tNORWAY\t\t\t\t\t0\t0\t0`
  const r = parseCustomerCsv(csv)
  assert.equal(r.customers.length, 0)
  assert.equal(r.skippedRows, 1)
})

test('parseCustomerCsv: dubletter i fila slås sammen', () => {
  const csv = `${HEADER}
Kari Eksempel\tVeien 1\t\t0150\tOSLO\tNORWAY\t\t\t\t\t1\t100\t0
Kari Eksempel\tVeien 1\t\t0150\tOSLO\tNORWAY\t\t\t\t\t2\t200\t0`
  const r = parseCustomerCsv(csv)
  assert.equal(r.customers.length, 1)
  assert.equal(r.duplicateRows, 1)
})

test('parseCustomerCsv: semikolonfil med anførselstegn og komma i feltet', () => {
  const csv = 'Navn;Adresse;Postnr;Sted;E-post\n"Eksempel AS, avd. Vest";"Storgata 1, 2. etg";5003;BERGEN;post@eksempel.no'
  const r = parseCustomerCsv(csv)
  assert.equal(r.customers[0].name, 'Eksempel AS, avd. Vest')
  assert.equal(r.customers[0].address, 'Storgata 1, 2. etg')
  assert.equal(r.customers[0].email, 'post@eksempel.no')
  assert.equal(r.customers[0].postalCode, '5003')
})

test('parseCustomerCsv: org.nr og telefon leses når de finnes', () => {
  const csv = 'Navn;Org.nr.;Telefon\nEksempel AS;912345678;40012345'
  const r = parseCustomerCsv(csv)
  assert.equal(r.customers[0].orgNumber, '912345678')
  assert.equal(r.customers[0].phone, '40012345')
})

test('parseCustomerCsv: tom fil gir tomt resultat i stedet for å kaste', () => {
  assert.deepEqual(parseCustomerCsv(''), { customers: [], ignoredColumns: [], skippedRows: 0, duplicateRows: 0 })
})
