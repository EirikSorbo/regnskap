import { test } from 'node:test'
import assert from 'node:assert/strict'
import { needsDeliveryCleanup, cleanedLines } from './invoice-cleanup.ts'

const line = (extra: Record<string, unknown> = {}) => ({
  description: 'Spilte med Bryggebandet', quantity: 1, unitPrice: 6500, ...extra,
})

test('needsDeliveryCleanup: fakturaer uten leveringsfelter lar vi være i fred', () => {
  assert.equal(needsDeliveryCleanup({ total: 6500, lines: [line()] }), false)
  assert.equal(needsDeliveryCleanup({ total: 6500 }), false)
  assert.equal(needsDeliveryCleanup({ lines: 'noe rart' }), false)
})

test('needsDeliveryCleanup: kjenner igjen feltene på fakturaen', () => {
  assert.equal(needsDeliveryCleanup({ deliveryDate: '2026-08-09', lines: [line()] }), true)
  assert.equal(needsDeliveryCleanup({ deliveryPlace: 'Fiskebrygga', lines: [line()] }), true)
})

test('needsDeliveryCleanup: kjenner igjen feltene på en linje', () => {
  assert.equal(needsDeliveryCleanup({ lines: [line(), line({ date: '2026-06-30' })] }), true)
  assert.equal(needsDeliveryCleanup({ lines: [line({ place: 'Fiskebrygga' })] }), true)
})

test('cleanedLines: fjerner dato og sted, og beholder resten', () => {
  const { lines, changed } = cleanedLines([line({ date: '2026-06-30', place: 'Fiskebrygga' })])
  assert.equal(changed, true)
  assert.deepEqual(lines, [{ description: 'Spilte med Bryggebandet', quantity: 1, unitPrice: 6500 }])
})

test('cleanedLines: ukjente felter blir med videre', () => {
  // En opprydding skal fjerne det den er bedt om, ikke alt den ikke kjenner.
  const { lines } = cleanedLines([line({ date: '2026-06-30', rabatt: 10 })])
  assert.deepEqual(lines, [{ description: 'Spilte med Bryggebandet', quantity: 1, unitPrice: 6500, rabatt: 10 }])
})

test('cleanedLines: uten noe å fjerne meldes ingen endring', () => {
  const { lines, changed } = cleanedLines([line(), line()])
  assert.equal(changed, false)
  assert.equal(lines.length, 2)
})

test('cleanedLines: tåler at lines mangler eller er noe annet enn en liste', () => {
  assert.deepEqual(cleanedLines(undefined), { lines: [], changed: false })
  assert.deepEqual(cleanedLines('tull'), { lines: [], changed: false })
})
