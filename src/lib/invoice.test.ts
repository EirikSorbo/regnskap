import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  type Invoice, lineTotal, invoiceTotal, addDays, isOverdue, outstandingTotal,
  canEdit, canDelete, canCredit, statusLabel, validateForIssue,
  incomeAmount, incomeDescription, addressLines, numberGaps, invoiceFileName, toInvoiceCustomer,
} from './invoice.ts'

function invoice(p: Partial<Invoice> = {}): Invoice {
  return {
    userId: 'u', kind: 'faktura', status: 'utstedt', number: 1,
    customer: { name: 'Kari Nordmann' },
    lines: [{ description: 'Konsert', quantity: 1, unitPrice: 5000 }],
    issueDate: '2026-03-01', dueDate: '2026-03-15', total: 5000, createdAt: 0,
    ...p,
  }
}

// --- beløp ---

test('lineTotal og invoiceTotal: antall ganger pris, avrundet til øre', () => {
  assert.equal(lineTotal({ description: 'x', quantity: 2.5, unitPrice: 1200 }), 3000)
  assert.equal(invoiceTotal([
    { description: 'a', quantity: 1, unitPrice: 1000.555 },
    { description: 'b', quantity: 2, unitPrice: 10 },
  ]), 1020.56)
})

test('invoiceTotal: tomme og ugyldige tall teller som 0', () => {
  assert.equal(invoiceTotal([{ description: 'x', quantity: NaN, unitPrice: 100 }]), 0)
  assert.equal(invoiceTotal([]), 0)
})

// --- datoer ---

test('addDays: forfallsdato uten tidssonetrøbbel, også over månedsskifte', () => {
  assert.equal(addDays('2026-03-01', 14), '2026-03-15')
  assert.equal(addDays('2026-12-28', 14), '2027-01-11')
  assert.equal(addDays('2028-02-28', 1), '2028-02-29')  // skuddår
})

test('isOverdue: bare utstedte fakturaer kan forfalle', () => {
  assert.equal(isOverdue(invoice({ dueDate: '2026-03-15' }), '2026-04-01'), true)
  assert.equal(isOverdue(invoice({ dueDate: '2026-03-15' }), '2026-03-01'), false)
  assert.equal(isOverdue(invoice({ status: 'betalt', dueDate: '2026-03-15' }), '2026-04-01'), false)
  assert.equal(isOverdue(invoice({ status: 'kladd', dueDate: '2026-03-15' }), '2026-04-01'), false)
})

// --- utestående ---

test('outstandingTotal: teller kun utstedte fakturaer, ikke kladder eller betalte', () => {
  const list = [
    invoice({ total: 5000 }),
    invoice({ status: 'betalt', total: 3000 }),
    invoice({ status: 'kladd', total: 9000 }),
    invoice({ kind: 'kreditnota', total: 1000 }),
  ]
  assert.equal(outstandingTotal(list), 5000)
})

// --- låsing ---

test('en utstedt faktura kan verken redigeres eller slettes', () => {
  const issued = invoice()
  assert.equal(canEdit(issued), false)
  assert.equal(canDelete(issued), false)
  const draft = invoice({ status: 'kladd', number: undefined })
  assert.equal(canEdit(draft), true)
  assert.equal(canDelete(draft), true)
})

test('kreditnota kan lages av utstedt og betalt faktura, ikke av kladd eller historisk', () => {
  assert.equal(canCredit(invoice()), true)
  assert.equal(canCredit(invoice({ status: 'betalt' })), true)
  assert.equal(canCredit(invoice({ status: 'kladd' })), false)
  assert.equal(canCredit(invoice({ historical: true })), false)
  assert.equal(canCredit(invoice({ kind: 'kreditnota' })), false)
})

test('statusLabel: forfalt vises bare når fristen er passert', () => {
  assert.equal(statusLabel(invoice(), '2026-03-10'), 'Utstedt')
  assert.equal(statusLabel(invoice(), '2026-04-10'), 'Forfalt')
  assert.equal(statusLabel(invoice({ status: 'betalt' }), '2026-04-10'), 'Betalt')
  assert.equal(statusLabel(invoice({ kind: 'kreditnota' }), '2026-04-10'), 'Kreditnota')
  assert.equal(statusLabel(invoice({ historical: true }), '2026-04-10'), 'Historisk')
})

// --- validering ---

test('validateForIssue: godtar en komplett faktura', () => {
  assert.deepEqual(validateForIssue(invoice()), [])
})

test('validateForIssue: fanger manglende kunde, tomme linjer og null beløp', () => {
  assert.ok(validateForIssue(invoice({ customer: { name: '  ' } })).some(p => p.includes('kunde')))
  assert.ok(validateForIssue(invoice({ lines: [] })).some(p => p.includes('minst én linje')))
  assert.ok(validateForIssue(invoice({
    lines: [{ description: 'Gratis', quantity: 1, unitPrice: 0 }],
  })).some(p => p.includes('større enn null')))
  assert.ok(validateForIssue(invoice({ issueDate: '01.03.2026' })).some(p => p.includes('fakturadato')))
})

test('validateForIssue: en linje uten beskrivelse må fylles ut', () => {
  const problems = validateForIssue(invoice({
    lines: [{ description: '', quantity: 1, unitPrice: 500 }],
  }))
  assert.ok(problems.some(p => p.includes('beskrivelse')))
})

// --- inntektsføring ---

test('incomeAmount: kreditnota trekker fra', () => {
  assert.equal(incomeAmount({ kind: 'faktura', total: 5000 }), 5000)
  assert.equal(incomeAmount({ kind: 'kreditnota', total: 5000 }), -5000)
})

test('incomeDescription: viser type, nummer og kunde', () => {
  assert.equal(incomeDescription({ kind: 'faktura', number: 12, customer: { name: 'Kari' } }), 'Faktura 12 – Kari')
  assert.equal(incomeDescription({ kind: 'kreditnota', number: 13, customer: { name: 'Kari' } }), 'Kreditnota 13 – Kari')
})

// --- adresse ---

test('addressLines: postnummer og sted på én linje, Norge utelates', () => {
  assert.deepEqual(addressLines({
    name: 'Kari', address: 'Storgata 1', postalCode: '0130', city: 'OSLO', country: 'Norge',
  }), ['Storgata 1', '0130 OSLO'])
})

test('addressLines: utenlandsk land tas med', () => {
  assert.deepEqual(addressLines({ name: 'Anna', address: 'Kungsgatan 2', postalCode: '11135', city: 'Stockholm', country: 'Sverige' }),
    ['Kungsgatan 2', '11135 Stockholm', 'Sverige'])
})

// --- kunde fryst på faktura ---

test('toInvoiceCustomer: felter som ikke er fylt ut UTELATES, ikke satt til undefined', () => {
  // Regresjon: en kunde uten «Adresse 2» ga address2: undefined, og Firestore
  // avviste hele fakturaen med «Unsupported field value: undefined».
  const picked = toInvoiceCustomer({ name: 'Kari', address: 'Storgata 1' })
  assert.deepEqual(picked, { name: 'Kari', address: 'Storgata 1' })
  assert.equal(Object.hasOwn(picked, 'address2'), false)
})

test('toInvoiceCustomer: tar med alle utfylte felter, men ikke registermetadata', () => {
  const picked = toInvoiceCustomer({
    name: 'Eksempel AS', address: 'Gata 1', address2: 'Inngang B', postalCode: '4610',
    city: 'KRISTIANSAND S', country: 'Norge', email: 'post@eksempel.no',
    phone: '40012345', orgNumber: '912345678',
    // Felter registeret har, men fakturaen ikke skal bære:
    ...{ id: 'abc', userId: 'u', createdAt: 1 },
  })
  assert.equal(Object.hasOwn(picked, 'id'), false)
  assert.equal(Object.hasOwn(picked, 'userId'), false)
  assert.equal(picked.address2, 'Inngang B')
  assert.equal(picked.orgNumber, '912345678')
})

// --- filnavn på PDF-en ---

test('invoiceFileName: «Faktura nr. 272 fra Sørbø Musikk»', () => {
  assert.equal(invoiceFileName({ kind: 'faktura', number: 272 }, 'Sørbø Musikk'),
    'Faktura nr. 272 fra Sørbø Musikk')
})

test('invoiceFileName: kreditnota og kladd får sine egne navn', () => {
  assert.equal(invoiceFileName({ kind: 'kreditnota', number: 273 }, 'Sørbø Musikk'),
    'Kreditnota nr. 273 fra Sørbø Musikk')
  assert.equal(invoiceFileName({ kind: 'faktura', number: undefined }, 'Sørbø Musikk'),
    'Faktura uten nummer fra Sørbø Musikk')
})

test('invoiceFileName: uten foretaksnavn faller «fra …» bort', () => {
  assert.equal(invoiceFileName({ kind: 'faktura', number: 5 }, ''), 'Faktura nr. 5')
  assert.equal(invoiceFileName({ kind: 'faktura', number: 5 }, undefined), 'Faktura nr. 5')
})

test('invoiceFileName: tegn som ikke kan stå i et filnavn byttes ut', () => {
  assert.equal(invoiceFileName({ kind: 'faktura', number: 5 }, 'Lyd/Bilde AS'),
    'Faktura nr. 5 fra Lyd-Bilde AS')
})

// --- nummerrekke ---

test('numberGaps: finner hull i fakturarekken', () => {
  assert.deepEqual(numberGaps([1, 2, 3]), [])
  assert.deepEqual(numberGaps([1, 4, 5]), [2, 3])
  assert.deepEqual(numberGaps([]), [])
})
