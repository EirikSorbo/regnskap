import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  invoiceEmailSubject, invoiceEmailBody, mailtoUrl, shortcutUrl,
} from './invoice-email.ts'

const faktura = { kind: 'faktura' as const, number: 272, total: 13000, dueDate: '2026-08-23' }
const kreditnota = { kind: 'kreditnota' as const, number: 273, total: 6500, dueDate: '2026-08-23' }

test('invoiceEmailSubject: type, nummer og avsender', () => {
  assert.equal(invoiceEmailSubject(faktura, 'Sørbø Musikk'), 'Faktura 272 fra Sørbø Musikk')
  assert.equal(invoiceEmailSubject(kreditnota, 'Sørbø Musikk'), 'Kreditnota 273 fra Sørbø Musikk')
})

test('invoiceEmailSubject: uten nummer og uten foretaksnavn', () => {
  assert.equal(invoiceEmailSubject({ kind: 'faktura', number: undefined }, ''), 'Faktura')
})

test('invoiceEmailBody: hele teksten, ord for ord', () => {
  const body = invoiceEmailBody(
    { kind: 'faktura', number: 273, total: 2000, dueDate: '2026-08-24' },
    { companyName: 'Sørbø Musikk', senderName: 'Eirik Sørbø', bankAccount: '63201126217' })
  const belop = (2000).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 })
  assert.equal(body, [
    'Hei.',
    '',
    'Vedlagt følger faktura nr. 273 fra Sørbø Musikk.',
    '',
    'Forfallsdato: 24. august 2026',
    'Fakturanr.: 273',
    `Beløp: ${belop}`,
    'Kontonummer: 63201126217',
    '',
    'Takk for hyggelig oppdrag!',
    '',
    'Vennlig hilsen',
    'Eirik Sørbø',
  ].join('\n'))
})

test('invoiceEmailBody: innledningen gjentar ikke beløp og forfall', () => {
  // De står i blokken rett under. Å ha dem begge steder gjorde bare teksten
  // lengre uten å si noe nytt.
  const linjer = invoiceEmailBody(faktura, { companyName: 'Sørbø Musikk' }).split('\n')
  assert.equal(linjer[2], 'Vedlagt følger faktura nr. 272 fra Sørbø Musikk.')
})

test('invoiceEmailBody: beløpet er i hele kroner, uten ører', () => {
  const body = invoiceEmailBody(faktura, { companyName: 'Sørbø Musikk' })
  assert.ok(!body.includes(',00'))
})

test('invoiceEmailBody: ører tas med hvis de finnes', () => {
  const body = invoiceEmailBody({ ...faktura, total: 6500.5 }, { companyName: 'Sørbø Musikk' })
  assert.ok(body.includes(',50'))
})

test('invoiceEmailBody: uten eget signaturnavn brukes foretaksnavnet', () => {
  const body = invoiceEmailBody(faktura, { companyName: 'Sørbø Musikk' })
  assert.ok(body.endsWith('Vennlig hilsen\nSørbø Musikk'))
})

test('invoiceEmailBody: uten kontonummer faller den linja bort', () => {
  const body = invoiceEmailBody(faktura, { companyName: 'Sørbø Musikk' })
  assert.ok(!body.includes('Kontonummer'))
  assert.ok(body.includes('Fakturanr.: 272'))
})

test('invoiceEmailBody: en kreditnota har verken forfall, kontonummer eller takk', () => {
  const body = invoiceEmailBody(kreditnota, { companyName: 'Sørbø Musikk', bankAccount: '63201126217' })
  assert.ok(body.includes('Kreditnotanr.: 273'))
  assert.ok(!body.includes('Forfallsdato'))
  assert.ok(!body.includes('Kontonummer'))
  assert.ok(!body.includes('Takk for'))
})

test('mailtoUrl: mottaker, emne og tekst kodes riktig', () => {
  const url = mailtoUrl({ to: 'post@eksempel.no', subject: 'Faktura 272 fra Sørbø Musikk', body: 'Hei,\n\nTest.' })
  assert.ok(url.startsWith('mailto:post%40eksempel.no?'))
  assert.ok(url.includes('subject=Faktura%20272%20fra%20S'))
  // Mellomrom skal være %20, ikke plusstegn: noen e-postklienter viser + i emnet.
  assert.ok(!url.includes('+'))
  assert.ok(url.includes('body=Hei%2C%0A%0ATest.'))
})

test('mailtoUrl: tåler at kunden mangler e-postadresse', () => {
  const url = mailtoUrl({ to: undefined, subject: 'Faktura', body: 'Hei' })
  assert.ok(url.startsWith('mailto:?'))
})

test('shortcutUrl: sender mottaker, emne og filnavn som tre linjer', () => {
  const url = shortcutUrl({
    name: 'Send faktura',
    to: 'post@eksempel.no',
    subject: 'Faktura 272 fra Sørbø Musikk',
    fileName: 'Faktura nr. 272 fra Sørbø Musikk.pdf',
  })
  assert.ok(url.startsWith('shortcuts://run-shortcut?'))
  assert.ok(url.includes('name=Send%20faktura'))
  assert.ok(url.includes('input=text'))
  const text = new URL(url).searchParams.get('text')
  assert.deepEqual(text?.split('\n'), [
    'post@eksempel.no',
    'Faktura 272 fra Sørbø Musikk',
    'Faktura nr. 272 fra Sørbø Musikk.pdf',
  ])
})

test('shortcutUrl: linjene holder seg atskilt selv uten e-postadresse', () => {
  const url = shortcutUrl({ name: 'Send faktura', subject: 'Faktura', fileName: 'Faktura.pdf' })
  const text = new URL(url).searchParams.get('text')
  assert.deepEqual(text?.split('\n'), ['', 'Faktura', 'Faktura.pdf'])
})
