import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stripUndefined } from './firestore-data.ts'

test('stripUndefined: fjerner felter som er undefined', () => {
  assert.deepEqual(stripUndefined({ a: 1, b: undefined }), { a: 1 })
})

test('stripUndefined: beholder tom streng, null, 0 og false', () => {
  // Disse betyr «tomt» og er gyldige verdier. Bare undefined betyr «ikke satt».
  assert.deepEqual(stripUndefined({ a: '', b: null, c: 0, d: false }),
    { a: '', b: null, c: 0, d: false })
})

test('stripUndefined: renser også nøstede objekter', () => {
  // Kunden ligger nøstet inne i fakturaen, og det var der feilen oppsto.
  const invoice = {
    total: 5000,
    customer: { name: 'Kari', address: 'Storgata 1', address2: undefined },
  }
  assert.deepEqual(stripUndefined(invoice), {
    total: 5000,
    customer: { name: 'Kari', address: 'Storgata 1' },
  })
})

test('stripUndefined: renser objekter inne i lister', () => {
  const lines = { lines: [{ description: 'Konsert', note: undefined }] }
  assert.deepEqual(stripUndefined(lines), { lines: [{ description: 'Konsert' }] })
})

test('stripUndefined: lar datoer være i fred', () => {
  const d = new Date('2026-08-09T00:00:00Z')
  assert.equal(stripUndefined({ when: d }).when, d)
})
