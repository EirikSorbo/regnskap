import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAttachmentMap, buildBackupData, backupFileName, matchesYear,
  importableEntries, findAttachmentPath,
} from './backup-format.ts'
import type { Entry, Category } from '../types.ts'

const CATS: Category[] = [
  { post: '6500', label: 'Utstyr' },
  { post: '7140', label: 'Reise og mat' },
]

function receipt(p: Partial<Entry> & { imagePaths?: string[] }): Entry {
  return {
    entryType: 'receipt', userId: 'u', date: '2025-03-01', createdAt: 0, description: '',
    category: { post: '6500', label: 'Utstyr' }, amount: 100,
    imageUrl: '', imagePath: '',
    ...p,
  } as Entry
}

// --- buildAttachmentMap ---

test('buildAttachmentMap: navngir etter post, dato og løpenummer i kontoplanens rekkefølge', () => {
  const entries = [
    receipt({ id: 'b', category: { post: '7140', label: 'Reise og mat' }, date: '2025-01-05', imagePaths: ['x/b.jpg'] }),
    receipt({ id: 'a', date: '2025-02-02', imagePaths: ['x/a.png'] }),
  ]
  assert.deepEqual(buildAttachmentMap(entries, CATS), [
    { path: 'x/a.png', stdName: '6500-2025-02-02-001.png' },
    { path: 'x/b.jpg', stdName: '7140-2025-01-05-002.jpg' },
  ])
})

test('buildAttachmentMap: alle vedleggene på en kvittering blir med', () => {
  const entries = [receipt({ id: 'a', imagePaths: ['x/1.jpg', 'x/2.jpg'] })]
  assert.deepEqual(buildAttachmentMap(entries, CATS).map(a => a.stdName), [
    '6500-2025-03-01-001.jpg', '6500-2025-03-01-002.jpg',
  ])
})

test('buildAttachmentMap: kvittering på en egen kategori faller ikke ut av backupen', () => {
  // Regresjon: kartet gikk tidligere gjennom den hardkodede kontoplanen, så
  // vedlegg på brukerens egne poster kom aldri med i ZIP-en eller fullbackupen.
  const entries = [receipt({ id: 'c', category: { post: '9999', label: 'Egen post' }, imagePaths: ['x/c.pdf'] })]
  assert.deepEqual(buildAttachmentMap(entries, CATS), [
    { path: 'x/c.pdf', stdName: '9999-2025-03-01-001.pdf' },
  ])
})

test('buildAttachmentMap: kjøreturer har ingen vedlegg', () => {
  const drive = { entryType: 'driving', userId: 'u', date: '2025-01-01', createdAt: 0, description: '',
    category: { post: '7080', label: 'Kjøring' }, from: 'A', to: 'B', tripType: 'one-way',
    distance: 10, passengers: 0 } as Entry
  assert.deepEqual(buildAttachmentMap([drive], CATS), [])
})

// --- årsfilter og payload ---

test('matchesYear: uten årsfilter tas alt med, også rader uten dato', () => {
  assert.equal(matchesYear({ date: '2024-01-01' }), true)
  assert.equal(matchesYear({}), true)
  assert.equal(matchesYear({ date: '2024-01-01' }, 2025), false)
  assert.equal(matchesYear({}, 2025), false)
})

test('buildBackupData: årsfilter gjelder både utgifter og inntekter', () => {
  const data = buildBackupData({
    receipts: [{ id: 'a', date: '2025-01-01' }, { id: 'b', date: '2024-06-01' }],
    income: [{ id: 'i', date: '2024-02-02' }],
    settings: { drivingRatePerKm: 3.5 },
    yearFilter: 2025,
    now: new Date('2025-05-05T00:00:00Z'),
  })
  assert.deepEqual(data.receipts?.map(r => r.id), ['a'])
  assert.deepEqual(data.income, [])
  assert.equal(data.year, 2025)
})

test('buildBackupData: innstillingene er bare med i en backup uten årsfilter', () => {
  const args = { receipts: [], income: [], settings: { drivingRatePerKm: 3.5 } }
  assert.equal(buildBackupData({ ...args, yearFilter: 2025 }).settings, undefined)
  assert.deepEqual(buildBackupData(args).settings, { drivingRatePerKm: 3.5 })
})

test('backupFileName: år eller «alle» i navnet', () => {
  assert.equal(backupFileName('data', 2025, '2025-05-05'), 'regnskap_backup_2025_2025-05-05.json')
  assert.equal(backupFileName('full', undefined, '2025-05-05'), 'regnskap_full_backup_alle_2025-05-05.zip')
  assert.equal(backupFileName('vedlegg', 2024, '2025-05-05'), 'kvitteringer_2024.zip')
})

// --- import ---

test('importableEntries: egne rader og rader uten eier, aldri andres', () => {
  const rows = [{ id: 'a', userId: 'meg' }, { id: 'b' }, { id: 'c', userId: 'noen-andre' }]
  assert.deepEqual(importableEntries(rows, 'meg').map(r => r.id), ['a', 'b'])
  assert.deepEqual(importableEntries(undefined, 'meg'), [])
})

test('findAttachmentPath: vedleggsregisteret fører ZIP-navnet tilbake til Storage-stien', () => {
  // Kjernen i saken: filen i ZIP-en heter post-dato-løpenummer, mens stien i
  // Storage slutter på et tilfeldig unikt ledd. Uten registeret finnes det
  // ingen vei tilbake, og vedleggene ble stille hoppet over ved import.
  const data = {
    attachments: [
      { stdName: '6500-2025-03-01-001.jpg', path: 'receipts/u/6500-2025-03-01-mc4k2b0-a1b2c3.jpg' },
      { stdName: '6500-2025-03-01-002.jpg', path: 'receipts/u/6500-2025-03-01-mc4k2b1-d4e5f6.jpg' },
    ],
    receipts: [{ id: 'a' }],
  }
  assert.equal(findAttachmentPath(data, '6500-2025-03-01-002.jpg'), 'receipts/u/6500-2025-03-01-mc4k2b1-d4e5f6.jpg')
})

test('findAttachmentPath: med register er ukjent navn null, ikke et heuristisk treff', () => {
  // Registeret er fasit. Faller vi tilbake til navnematching her, risikerer vi
  // å laste opp én kvitterings bilde til en annen kvitterings sti.
  const data = {
    attachments: [{ stdName: '6500-2025-03-01-001.jpg', path: 'receipts/u/unik.jpg' }],
    receipts: [{ id: 'a', imagePath: 'receipts/u/6500-2025-03-01-002.jpg' }],
  }
  assert.equal(findAttachmentPath(data, '6500-2025-03-01-002.jpg'), null)
})

test('findAttachmentPath: eldre backup uten register matcher fortsatt på filnavn', () => {
  const data = { receipts: [{ id: 'a', imagePath: 'receipts/u/en.jpg', imagePaths: ['receipts/u/en.jpg', 'receipts/u/to.jpg'] }] }
  assert.equal(findAttachmentPath(data, 'to.jpg'), 'receipts/u/to.jpg')
  assert.equal(findAttachmentPath(data, 'en.jpg'), 'receipts/u/en.jpg')
})

test('findAttachmentPath: ukjent filnavn gir null i stedet for feil sti', () => {
  assert.equal(findAttachmentPath({ receipts: [{ id: 'a', imagePath: 'x/en.jpg' }] }, 'ukjent.jpg'), null)
})

test('buildBackupData: vedleggsregisteret blir med i backupen', () => {
  const attachments = [{ stdName: '6500-2025-03-01-001.jpg', path: 'receipts/u/unik.jpg' }]
  const data = buildBackupData({ receipts: [], income: [], attachments })
  assert.deepEqual(data.attachments, attachments)
})
