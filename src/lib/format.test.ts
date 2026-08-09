import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fmtDate, kr, krInt, kr2 } from './format.ts'

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
