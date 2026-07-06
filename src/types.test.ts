import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcDrivingAmount, drivingAmount, calcEkom, type DrivingEntry } from './types.ts'

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
