import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcDrivingAmount, drivingAmount, calcEkom, filterEntries, managedPostAmount,
  parseReceiptText, saldoDepreciation, saldoBalance, entriesToCsv,
  type DrivingEntry, type Entry, type Asset,
} from './types.ts'

// Bygger en komplett DrivingEntry med fornuftige standardverdier; testene
// overstyrer bare feltene de bryr seg om.
function driving(partial: Partial<DrivingEntry>): DrivingEntry {
  return {
    entryType: 'driving', userId: 'u', date: '2025-01-01',
    category: { post: '7080', label: 'Kjøring' }, description: '', createdAt: 0,
    from: 'A', to: 'B', tripType: 'one-way', distance: 10, passengers: 0,
    ...partial,
  }
}

test('calcDrivingAmount: enveis uten passasjerer = km * sats', () => {
  assert.equal(calcDrivingAmount(10, 'one-way', 0, 3.5, 1), 35)
})

test('calcDrivingAmount: tur/retur dobler kilometerne', () => {
  assert.equal(calcDrivingAmount(10, 'return', 0, 3.5, 1), 70)
})

test('calcDrivingAmount: passasjertillegg regnes på total-km', () => {
  // 20 km * 3.5 + 20 km * 2 passasjerer * 1 = 70 + 40 = 110
  assert.equal(calcDrivingAmount(10, 'return', 2, 3.5, 1), 110)
})

test('drivingAmount: bruker den fryste satsen på oppføringen når den finnes', () => {
  const d = driving({ ratePerKm: 5, ratePerPassengerKm: 2 })
  assert.equal(drivingAmount(d, 3.5, 1), 50) // 10 * 5, fallback 3.5 ignoreres
})

test('drivingAmount: faller tilbake til gjeldende sats for eldre oppføring uten fryst sats', () => {
  const d = driving({})
  assert.equal(drivingAmount(d, 4, 1), 40) // 10 * 4
})

test('drivingAmount: en fryst sats på 0 respekteres (ikke behandlet som «mangler»)', () => {
  const d = driving({ ratePerKm: 0, ratePerPassengerKm: 0 })
  assert.equal(drivingAmount(d, 3.5, 1), 0)
})

test('calcEkom: netto = brutto minus privatandel', () => {
  const r = calcEkom([100, 100], [300], 50)
  assert.deepEqual(
    { p: r.totalPhone, i: r.totalInternet, g: r.totalGross, d: r.deduction, n: r.net },
    { p: 200, i: 300, g: 500, d: 50, n: 450 },
  )
})

test('calcEkom: privatandel kappes til brutto (netto blir aldri negativ)', () => {
  const r = calcEkom([100], [], 500)
  assert.equal(r.deduction, 100)
  assert.equal(r.net, 0)
})

test('calcEkom: ikke-tall (NaN) behandles som 0', () => {
  const r = calcEkom([NaN, 100], [], 0)
  assert.equal(r.totalPhone, 100)
  assert.equal(r.net, 100)
})

// --- filterEntries ---
const receipt: Entry = {
  id: '1', entryType: 'receipt', userId: 'u', date: '2025-01-01',
  category: { post: '6500', label: 'Utstyr' }, description: 'Mikrofon', createdAt: 0,
  amount: 1500, imageUrl: '', imagePath: '',
}
const drive: Entry = {
  ...driving({ from: 'Oslo', to: 'Bergen', tripType: 'return', distance: 100 }),
  id: '2', date: '2025-02-01',
}
const both = [receipt, drive]

test('filterEntries: tomt søk gir alle', () => {
  assert.equal(filterEntries(both, '').length, 2)
  assert.equal(filterEntries(both, '   ').length, 2)
})
test('filterEntries: matcher beskrivelse, sted, beløp og postnr', () => {
  assert.deepEqual(filterEntries(both, 'mikrofon').map(e => e.id), ['1'])
  assert.deepEqual(filterEntries(both, 'bergen').map(e => e.id), ['2'])
  assert.deepEqual(filterEntries(both, '1500').map(e => e.id), ['1'])
  assert.deepEqual(filterEntries(both, '6500').map(e => e.id), ['1'])
})
test('filterEntries: er case-insensitiv', () => {
  assert.deepEqual(filterEntries(both, 'UTSTYR').map(e => e.id), ['1'])
})

// --- managedPostAmount ---
const ms = {
  ekomPhone: { '2025': [100, 100] }, ekomInternet: { '2025': [300] }, ekomPrivateAmt: 50,
  hjemmekontorAmounts: { '2025': 2000 }, avskrivningerAmounts: { '2025': 500 },
}
test('managedPostAmount: 7500 = EKOM-netto, 7770/6000 fra settings', () => {
  assert.equal(managedPostAmount('7500', ms, 2025), 450) // brutto 500 − privat 50
  assert.equal(managedPostAmount('7770', ms, 2025), 2000)
  assert.equal(managedPostAmount('6000', ms, 2025), 500)
})
test('managedPostAmount: null for ikke-styrte poster; 0 for år uten data', () => {
  assert.equal(managedPostAmount('6500', ms, 2025), null)
  assert.equal(managedPostAmount('7770', ms, 2024), 0)
  assert.equal(managedPostAmount('7500', ms, 2024), 0)
})

// --- parseReceiptText ---
test('parseReceiptText: foretrekker beløp på «totalt»-linje og leser dd.mm.åååå', () => {
  const t = 'Kiwi Storgata\n12.05.2025\nBrød 25,00\nMelk 20,50\nTotalt 45,50'
  assert.deepEqual(parseReceiptText(t), { amount: 45.5, date: '2025-05-12' })
})
test('parseReceiptText: leser åååå-mm-dd og «SUM» med kr-suffiks', () => {
  const t = 'REMA 1000\nDato 2025-11-03\nSUM 199,90 kr'
  assert.deepEqual(parseReceiptText(t), { amount: 199.9, date: '2025-11-03' })
})
test('parseReceiptText: tusenskille og 2-sifret år', () => {
  const t = 'Kvittering 03/01/24\nBeløp NOK 1 234,50'
  assert.deepEqual(parseReceiptText(t), { amount: 1234.5, date: '2024-01-03' })
})
test('parseReceiptText: uten nøkkelord tas største pengetall', () => {
  assert.equal(parseReceiptText('Butikk\n10,00\n250,00\n5,50').amount, 250)
})
test('parseReceiptText: heltall uten desimaler (org.nr) plukkes ikke som beløp', () => {
  assert.deepEqual(parseReceiptText('Org 123456789\nTakk'), {})
})

// --- saldoavskrivning (#2) ---
const asset = (p: Partial<Asset>): Asset => ({ id: 'a', name: 'Gitar', year: 2023, cost: 100000, rate: 0.30, ...p })
test('saldoDepreciation: degressiv 30 % saldo per år', () => {
  const a = [asset({})]
  assert.equal(saldoDepreciation(a, 2022), 0)      // før anskaffelse
  assert.equal(saldoDepreciation(a, 2023), 30000)  // 100000 · 0,3
  assert.equal(saldoDepreciation(a, 2024), 21000)  // · 0,7
  assert.equal(saldoDepreciation(a, 2025), 14700)  // · 0,49
})
test('saldoDepreciation: summerer flere driftsmidler; ugyldig sats → 30 %', () => {
  const a = [asset({ id: '1' }), asset({ id: '2', cost: 50000, rate: 0 })]
  assert.equal(saldoDepreciation(a, 2023), 45000)  // 30000 + 50000·0,3
})
test('saldoBalance: restsaldo ved årsslutt', () => {
  const a = [asset({})]
  assert.equal(saldoBalance(a, 2023), 70000)
  assert.equal(saldoBalance(a, 2024), 49000)
})
test('managedPostAmount: post 6000 bruker saldoregister når det finnes', () => {
  const s = {
    ekomPhone: {}, ekomInternet: {}, ekomPrivateAmt: 0,
    hjemmekontorAmounts: {}, avskrivningerAmounts: { '2023': 9999 },
    assets: [asset({})],
  }
  assert.equal(managedPostAmount('6000', s, 2023), 30000)  // register vinner over manuell 9999
})

// --- CSV (#8) ---
test('entriesToCsv: header, semikolon, desimalkomma', () => {
  const lines = entriesToCsv([receipt], () => 1500).split('\r\n')
  assert.equal(lines[0], 'Dato;Post;Kategori;Beskrivelse;Detaljer;Beløp')
  assert.equal(lines[1], '2025-01-01;6500;Utstyr;Mikrofon;;1500,00')
})
test('entriesToCsv: felt med semikolon/anførselstegn escapes', () => {
  const r2: Entry = { ...receipt, id: '9', description: 'Kabel; 2 m "pro"', amount: 200 }
  const line = entriesToCsv([r2], (e) => (e.entryType === 'receipt' ? e.amount : 0)).split('\r\n')[1]
  assert.ok(line.includes('"Kabel; 2 m ""pro"""'))
})
