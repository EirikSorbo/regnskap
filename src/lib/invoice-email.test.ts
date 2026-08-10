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

test('invoiceEmailBody: beløp og forfallsdato i teksten', () => {
  const body = invoiceEmailBody(faktura, 'Sørbø Musikk')
  assert.ok(body.includes('faktura 272'))
  assert.ok(body.includes('23. august 2026'))
  assert.ok(body.includes('Vennlig hilsen\nSørbø Musikk'))
})

test('invoiceEmailBody: en kreditnota har ingen forfallsdato', () => {
  const body = invoiceEmailBody(kreditnota, 'Sørbø Musikk')
  assert.ok(body.includes('kreditnota 273'))
  assert.ok(!body.includes('forfall'))
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
