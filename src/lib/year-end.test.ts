import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  receiptsMissingAttachment, draftInvoices, invoiceNumberGaps, incomeWithoutInvoice,
  backupMissing, yearEndChecks,
} from './year-end.ts'
import type { Entry, ReceiptEntry, IncomeEntry } from '../types.ts'
import type { Invoice } from './invoice.ts'

function kvittering(partial: Partial<ReceiptEntry>): Entry {
  return {
    entryType: 'receipt', userId: 'u', date: '2026-05-01', amount: 500,
    category: { post: '6500', label: 'Utstyr' }, description: '', createdAt: 0,
    ...partial,
  } as Entry
}

function faktura(partial: Partial<Invoice>): Invoice {
  return {
    userId: 'u', kind: 'faktura', status: 'utstedt', customer: { name: 'Kari' },
    lines: [], issueDate: '2026-05-01', dueDate: '2026-05-15', total: 1000, createdAt: 0,
    ...partial,
  } as Invoice
}

function inntekt(partial: Partial<IncomeEntry>): IncomeEntry {
  return { userId: 'u', amount: 1000, date: '2026-05-01', createdAt: 0, ...partial }
}

test('kvitteringer uten vedlegg finnes, kjøreturer flagges ikke', () => {
  const list = [
    kvittering({ imageUrls: ['https://x/1.jpg'] }),
    kvittering({ imageUrls: [] }),
    { entryType: 'driving', userId: 'u', date: '2026-05-02', category: { post: '7080', label: 'Kjøring' },
      description: '', createdAt: 0, from: 'A', to: 'B', tripType: 'one-way', distance: 10, passengers: 0 } as Entry,
  ]
  assert.equal(receiptsMissingAttachment(list).length, 1)
})

test('kvittering med gammelt enkeltbilde-felt teller som dokumentert', () => {
  assert.equal(receiptsMissingAttachment([kvittering({ imageUrl: 'https://x/1.jpg' })]).length, 0)
})

test('kladder plukkes ut, utstedte ikke', () => {
  const list = [faktura({ status: 'kladd' }), faktura({}), faktura({ status: 'betalt' })]
  assert.equal(draftInvoices(list).length, 1)
})

test('hull i nummerrekka finnes, og kladder uten nummer forstyrrer ikke', () => {
  const list = [
    faktura({ number: 10 }), faktura({ number: 12 }), faktura({ status: 'kladd' }),
  ]
  assert.deepEqual(invoiceNumberGaps(list), [11])
})

test('inntekt uten faktura skilles fra inntekt som kom fra en faktura', () => {
  const list = [inntekt({ invoiceId: 'abc' }), inntekt({ amount: 2500 })]
  const uten = incomeWithoutInvoice(list)
  assert.equal(uten.length, 1)
  assert.equal(uten[0].amount, 2500)
})

// Uten dette skillet ville en backup tatt i november blitt godkjent som
// årsavslutning for det samme året, selv om desember ikke er med i den.
test('backup: et avsluttet år krever en backup tatt etter nyttår', () => {
  const nov = Date.UTC(2025, 10, 15)
  const feb = Date.UTC(2026, 1, 15)
  const naa = Date.UTC(2026, 7, 10)
  assert.equal(backupMissing(nov, 2025, naa), true)
  assert.equal(backupMissing(feb, 2025, naa), false)
})

test('backup: inneværende år godtar en fersk backup, men ikke en gammel', () => {
  const naa = Date.UTC(2026, 7, 10)
  assert.equal(backupMissing(naa - 5 * 24 * 3600 * 1000, 2026, naa), false)
  assert.equal(backupMissing(naa - 45 * 24 * 3600 * 1000, 2026, naa), true)
})

test('backup: aldri tatt er alltid en mangel', () => {
  assert.equal(backupMissing(undefined, 2026), true)
})

test('yearEndChecks: bare årets fakturaer vurderes', () => {
  const r = yearEndChecks({
    year: 2026,
    entries: [],
    yearIncome: [],
    invoices: [faktura({ issueDate: '2025-06-01', status: 'kladd' }), faktura({ status: 'kladd' })],
    lastBackupAt: Date.now(),
  })
  assert.equal(r.drafts.length, 1)
})

// Regelen som sprakk før: en utstedt kreditnota har status «utstedt», men er
// ikke et betalingskrav. Antall og sum må være enige.
test('yearEndChecks: kreditnota verken telles eller summeres som utestående', () => {
  const r = yearEndChecks({
    year: 2026,
    entries: [],
    yearIncome: [],
    invoices: [faktura({ total: 5000 }), faktura({ kind: 'kreditnota', total: 1000 })],
    lastBackupAt: Date.now(),
  })
  assert.equal(r.outstanding.length, 1)
  assert.equal(r.outstandingSum, 5000)
})
