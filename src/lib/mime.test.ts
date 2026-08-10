import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contentTypeFor } from './mime.ts'

test('kjenner igjen de filtypene appen faktisk laster opp', () => {
  assert.equal(contentTypeFor('kvittering.pdf'), 'application/pdf')
  assert.equal(contentTypeFor('bilde.png'), 'image/png')
  assert.equal(contentTypeFor('bilde.jpg'), 'image/jpeg')
  assert.equal(contentTypeFor('bilde.jpeg'), 'image/jpeg')
  assert.equal(contentTypeFor('fra-iphone.heic'), 'image/heic')
})

test('endelsen leses uansett store bokstaver og full sti', () => {
  assert.equal(contentTypeFor('receipts/uid/6500-2026-02-16-001.PDF'), 'application/pdf')
  assert.equal(contentTypeFor('IMG_0042.JPG'), 'image/jpeg')
})

// Å gjette ville merket filen som noe den ikke er, og det er verre enn å la den
// være umerket: da tolker nettleseren innholdet feil.
test('ukjent eller manglende endelse gir null, ikke en gjetning', () => {
  assert.equal(contentTypeFor('vedlegg.xyz'), null)
  assert.equal(contentTypeFor('uten-endelse'), null)
  assert.equal(contentTypeFor(''), null)
})
