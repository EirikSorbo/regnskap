import { test } from 'node:test'
import assert from 'node:assert/strict'
import { effectiveIncome } from './income.ts'
import type { IncomeEntry } from '../types.ts'
import type { Invoice } from './invoice.ts'

function faktura(partial: Partial<Invoice>): Invoice {
  return {
    id: 'f1', userId: 'u', kind: 'faktura', status: 'utstedt', customer: { name: 'Kari' },
    lines: [], issueDate: '2015-06-01', dueDate: '2015-06-15', total: 5000, createdAt: 0,
    ...partial,
  } as Invoice
}

function inntekt(partial: Partial<IncomeEntry>): IncomeEntry {
  return { userId: 'u', amount: 1000, date: '2026-05-01', createdAt: 0, ...partial }
}

const sum = (l: IncomeEntry[]) => l.reduce((s, i) => s + i.amount, 0)

// Kjernen i saken: fakturaene fra det gamle systemet har ingen inntektsrad, og
// før dette viste oversikten null for de årene.
test('en faktura uten inntektsrad blir til inntekt', () => {
  const r = effectiveIncome([], [faktura({ total: 5000 })])
  assert.equal(r.length, 1)
  assert.equal(r[0].amount, 5000)
  assert.equal(r[0].date, '2015-06-01')
})

test('en faktura som allerede har inntektsrad telles ikke to ganger', () => {
  const r = effectiveIncome(
    [inntekt({ id: 'i1', amount: 5000, date: '2015-06-01', invoiceId: 'f1' })],
    [faktura({ id: 'f1', total: 5000 })])
  assert.equal(r.length, 1)
  assert.equal(sum(r), 5000)
})

test('kladder er ikke bilag og gir ingen inntekt', () => {
  assert.equal(effectiveIncome([], [faktura({ status: 'kladd' })]).length, 0)
})

test('kreditnota uten inntektsrad trekker fra', () => {
  const r = effectiveIncome([], [faktura({ id: 'k1', kind: 'kreditnota', total: 1200 })])
  assert.equal(r[0].amount, -1200)
})

test('utledet inntekt har invoiceId, så årsavslutningen ikke flagger den som inntekt uten faktura', () => {
  const r = effectiveIncome([], [faktura({ id: 'f9' })])
  assert.equal(r[0].invoiceId, 'f9')
})

test('manuell inntekt uten faktura beholdes urørt', () => {
  const manuell = inntekt({ id: 'i2', amount: 4500 })
  const r = effectiveIncome([manuell], [])
  assert.deepEqual(r, [manuell])
})

test('blandet år: rad for den ene fakturaen, utledet for den andre', () => {
  const r = effectiveIncome(
    [inntekt({ id: 'i1', amount: 5000, date: '2026-02-01', invoiceId: 'f1' })],
    [faktura({ id: 'f1', issueDate: '2026-02-01', total: 5000 }),
     faktura({ id: 'f2', issueDate: '2026-03-01', total: 2500 })])
  assert.equal(r.length, 2)
  assert.equal(sum(r), 7500)
})
