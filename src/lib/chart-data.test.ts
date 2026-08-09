import { test } from 'node:test'
import assert from 'node:assert/strict'
import { monthIndex, monthlySeries, niceScale, tickLabel } from './chart-data.ts'
import type { Entry, IncomeEntry } from '../types.ts'

const amountOf = (e: Entry) => (e.entryType === 'receipt' ? e.amount : 0)

function receipt(date: string, amount: number): Entry {
  return {
    entryType: 'receipt', userId: 'u', date, amount, createdAt: 0, description: '',
    category: { post: '6500', label: 'Utstyr' }, imageUrl: '', imagePath: '',
  }
}
function income(date: string, amount: number): IncomeEntry {
  return { userId: 'u', date, amount, createdAt: 0 }
}

test('monthIndex: leser måneden, og avviser ubrukelige datoer', () => {
  assert.equal(monthIndex('2026-01-15'), 0)
  assert.equal(monthIndex('2026-12-01'), 11)
  assert.equal(monthIndex('2026-13-01'), null)
  assert.equal(monthIndex('tull'), null)
  assert.equal(monthIndex(''), null)
})

test('monthlySeries: fordeler inntekter og utgifter på riktig måned', () => {
  const s = monthlySeries(
    [receipt('2026-03-10', 1000), receipt('2026-03-20', 500)],
    [income('2026-03-01', 11750), income('2026-05-31', 5000)],
    2026, amountOf)
  assert.equal(s.income[2], 11750)
  assert.equal(s.income[4], 5000)
  assert.equal(s.expenses[2], 1500)
  assert.equal(s.result[2], 10250)
  assert.equal(s.result[4], 5000)
})

test('monthlySeries: andre år holdes utenfor', () => {
  const s = monthlySeries([receipt('2025-03-10', 999)], [income('2025-03-01', 999)], 2026, amountOf)
  assert.deepEqual(s.income, Array(12).fill(0))
  assert.deepEqual(s.expenses, Array(12).fill(0))
})

test('monthlySeries: en rad med ødelagt dato havner ikke i januar', () => {
  const s = monthlySeries([], [{ ...income('2026-00-01', 5000) }], 2026, amountOf)
  assert.equal(s.income[0], 0)
})

test('niceScale: runde trinn, og null alltid med', () => {
  const s = niceScale([0, 11750, 5000])
  assert.equal(s.lo, 0)
  assert.ok(s.hi >= 11750)
  assert.equal(s.ticks[0], 0)
  assert.equal(s.ticks[s.ticks.length - 1], s.hi)
})

test('niceScale: aksen legger seg tett på tallene, ikke langt over', () => {
  // Regresjon: med toppverdi 11 750 og bunn −8 400 valgte skalaen 20 000 som
  // tak, og halve grafen ble tom luft.
  const s = niceScale([11750, -8400, 5000])
  assert.equal(s.hi, 15000)
  assert.equal(s.lo, -10000)
  assert.ok(s.ticks.length >= 4 && s.ticks.length <= 7)
})

test('niceScale: små tall får små trinn', () => {
  const s = niceScale([0, 42])
  assert.ok(s.hi <= 50, `forventet tak under 50, fikk ${s.hi}`)
})

test('niceScale: negative verdier får plass under null-linja', () => {
  const s = niceScale([-4000, 8000])
  assert.ok(s.lo <= -4000)
  assert.ok(s.hi >= 8000)
  assert.ok(s.ticks.includes(0))
})

test('niceScale: bare nuller gir en brukbar akse i stedet for å kollapse', () => {
  assert.deepEqual(niceScale([0, 0, 0]), { lo: 0, hi: 1, ticks: [0, 1] })
})

test('tickLabel: tusen forkortes med k og norsk desimalkomma', () => {
  assert.equal(tickLabel(0), '0')
  assert.equal(tickLabel(10000), '10k')
  assert.equal(tickLabel(2500), '2,5k')
  assert.equal(tickLabel(750), '750')
  assert.equal(tickLabel(-3000), '-3k')
})
