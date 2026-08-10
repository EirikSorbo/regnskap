import { test } from 'node:test'
import assert from 'node:assert/strict'
import { effectiveIncome, incomeIsDerived } from './income.ts'
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

// Slik ser de gamle årene ut: én årssum ført for hånd 31. desember, uten
// kobling til noen faktura, pluss fakturaene som dokumenterer den. Legges de
// oppå hverandre, dobles hele året.
test('år med håndført årssum får IKKE inntekt utledet fra fakturaene', () => {
  const r = effectiveIncome([inntekt({ id: 'i1', amount: 91207, date: '2025-12-31' })], [
    faktura({ id: 'f1', issueDate: '2025-03-04', total: 40000 }),
    faktura({ id: 'f2', issueDate: '2025-09-20', total: 51207 }),
  ])
  assert.equal(r.length, 1)
  assert.equal(sum(r), 91207)
})

test('håndført årssum i ett år stopper ikke utledning i et annet', () => {
  const r = effectiveIncome(
    [inntekt({ id: 'i1', amount: 91207, date: '2025-12-31' })],
    [faktura({ id: 'f1', issueDate: '2015-06-01', total: 4500 })])
  assert.equal(sum(r.filter(i => i.date.startsWith('2015'))), 4500)
  assert.equal(sum(r.filter(i => i.date.startsWith('2025'))), 91207)
})

test('incomeIsDerived skiller utledet inntekt fra ført inntekt', () => {
  const utledet = effectiveIncome([], [faktura({ id: 'f1', issueDate: '2015-06-01' })])
  assert.equal(incomeIsDerived(utledet), true)
  assert.equal(incomeIsDerived([inntekt({ id: 'i1' })]), false)
  assert.equal(incomeIsDerived([]), false)
})
