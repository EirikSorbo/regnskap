import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fmtDate, kr, krInt, kr2, krExact } from './format.ts'

test('fmtDate: formaterer en gyldig dato på norsk', () => {
  assert.equal(fmtDate('2026-08-09'), '9. aug. 2026')
  assert.equal(fmtDate('2026-08-09', 'dd.MM.yyyy'), '09.08.2026')
})

test('fmtDate: en ugyldig dato KASTER IKKE, men vises som den er', () => {
  // Regresjon: format(new Date(x)) kaster RangeError under rendring, og siden
  // det skjer i JSX tok én ødelagt dato fra en import med seg hele skjermen.
  assert.doesNotThrow(() => fmtDate('tull'))
  assert.equal(fmtDate('tull'), 'tull')
  assert.equal(fmtDate('2026-13-45'), '2026-13-45')
})

test('fmtDate: tom dato gir en strek', () => {
  assert.equal(fmtDate(''), '—')
  assert.equal(fmtDate(undefined), '—')
  assert.equal(fmtDate(null), '—')
})

test('kr-formatering: norsk valuta og desimaler', () => {
  assert.ok(kr(1500).includes('1'))
  assert.equal(krInt(1500.6), '1 501'.replace(' ', ' '))
  assert.equal(kr2(1500.5), '1 500,50'.replace(' ', ' '))
})

test('krExact: hele beløp vises uten ører', () => {
  assert.equal(krExact(6500), kr(6500).replace(',00', ''))
  assert.ok(!krExact(13000).includes(','))
})

test('krExact: ører tas MED når de finnes', () => {
  // Å runde av her ville betydd at fakturaen oppga et annet beløp enn det som
  // faktisk kreves. Da er det bedre å vise ørene.
  assert.ok(krExact(6500.5).includes(',50'))
  assert.ok(krExact(0.99).includes(',99'))
})

test('krExact: null kroner vises som helt beløp', () => {
  assert.ok(!krExact(0).includes(','))
})
