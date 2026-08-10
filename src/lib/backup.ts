// ---------------------------------------------------------------------------
//  BACKUP OG IMPORT — FIRESTORE/STORAGE-SIDEN
// ---------------------------------------------------------------------------
//  Selve inn- og utlesingen. Formatet (hva som er med, hva filene heter) ligger
//  i backup-format.ts og er enhetstestet; her er bare kallene mot Firebase og
//  nettleseren. Lå tidligere som ~300 linjer inne i DashboardPage.
// ---------------------------------------------------------------------------

import { collection, query, where, getDocs, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore'
import { ref, getBlob, uploadBytes } from 'firebase/storage'
import { format } from 'date-fns'
import { db, storage } from '../firebase'
import { convertLegacySettings, type UserSettings } from '../context/SettingsContext'
import { type Entry, type Category, entriesToCsv } from '../types'
import {
  buildAttachmentMap, buildBackupData, backupFileName, importableEntries, findAttachmentPath,
  type Attachment, type BackupData, type BackupEntry,
} from './backup-format'

export type { BackupData, BackupEntry } from './backup-format'

/** Hvor lenge vi venter på ett vedlegg før vi gir opp og går videre. Uten dette
 *  kunne én treg fil henge hele nedlastingen. */
const BLOB_TIMEOUT_MS = 15000

function today() {
  return format(new Date(), 'yyyy-MM-dd')
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

async function fetchBlob(path: string): Promise<Blob> {
  return Promise.race([
    getBlob(ref(storage, path)),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), BLOB_TIMEOUT_MS)),
  ])
}

/** Henter alle kvitteringer og inntekter for brukeren. Backupen leser alltid
 *  ferskt fra Firestore i stedet for fra det siden har i minnet, så en delvis
 *  lastet skjerm ikke kan gi en delvis backup. */
/** Henter alt som skal sikkerhetskopieres.
 *
 *  Feiler én samling, KASTER vi i stedet for å hoppe over den. En backup som ser
 *  vellykket ut, men mangler fakturaene fordi sikkerhetsreglene ikke er
 *  publisert, er nettopp den typen stille hull en backup ikke skal ha. */
async function fetchUserData(uid: string) {
  const forUser = async (name: string) => {
    try {
      return await getDocs(query(collection(db, name), where('userId', '==', uid)))
    } catch (err) {
      throw new Error(
        `Kunne ikke lese «${name}». Er de oppdaterte sikkerhetsreglene publisert i Firebase Console? ` +
        'Backupen er avbrutt, for den ville ellers blitt ufullstendig uten å si fra.',
        { cause: err },
      )
    }
  }
  const [receiptSnap, incomeSnap, invoiceSnap, customerSnap] = await Promise.all([
    forUser('receipts'), forUser('income'), forUser('invoices'), forUser('customers'),
  ])
  const rows = (snap: Awaited<ReturnType<typeof forUser>>) =>
    snap.docs.map((d) => ({ id: d.id, ...d.data() })) as BackupEntry[]
  return {
    receipts: receiptSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as (Entry & BackupEntry)[],
    income: rows(incomeSnap),
    invoices: rows(invoiceSnap),
    customers: rows(customerSnap),
  }
}

/** Legger vedleggene inn i en ZIP og rapporterer hva som ikke gikk. Et vedlegg
 *  som feiler stopper aldri de andre. */
async function addAttachments(
  zip: { file: (name: string, data: Blob) => void },
  attachments: Attachment[],
  prefix = '',
): Promise<{ added: number; errors: string[] }> {
  let added = 0
  const errors: string[] = []
  for (const att of attachments) {
    try {
      zip.file(prefix + att.stdName, await fetchBlob(att.path))
      added++
    } catch (err) {
      console.warn('Vedlegg feilet:', att.stdName, err)
      errors.push(att.stdName)
    }
  }
  return { added, errors }
}

/** Bare dataene, som JSON. Vedleggsregisteret er med selv om filene ikke er
 *  det, slik at en JSON-backup kan pares med en separat vedleggs-ZIP. */
export async function downloadJsonBackup(uid: string, settings: UserSettings, categories: Category[], yearFilter?: number) {
  const { receipts, income, invoices, customers } = await fetchUserData(uid)
  const entries = receipts.filter((e) => !yearFilter || e.date?.startsWith(String(yearFilter)))
  const data = buildBackupData({
    receipts, income, invoices, customers, settings: { ...settings },
    attachments: buildAttachmentMap(entries, categories),
    yearFilter,
  })
  downloadBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    backupFileName('data', yearFilter, today()),
  )
}

/** Bare vedleggene, som ZIP. */
export async function downloadAttachmentZip(
  uid: string,
  categories: Category[],
  yearFilter?: number,
): Promise<{ added: number; errors: string[] } | null> {
  const { receipts } = await fetchUserData(uid)
  const entries = receipts.filter((e) => !yearFilter || e.date?.startsWith(String(yearFilter)))
  const attachments = buildAttachmentMap(entries, categories)
  if (attachments.length === 0) return null
  // Lastes dynamisk: jszip trengs bare til backup/import, ikke ved oppstart.
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const result = await addAttachments(zip, attachments)
  if (result.added === 0) return result
  downloadBlob(await zip.generateAsync({ type: 'blob' }), backupFileName('vedlegg', yearFilter, today()))
  return result
}

/** Data + vedlegg i én ZIP. Dette er den som teller som «backup tatt». */
export async function downloadFullBackup(
  uid: string,
  settings: UserSettings,
  categories: Category[],
  yearFilter?: number,
): Promise<{ added: number; errors: string[] }> {
  const { receipts, income, invoices, customers } = await fetchUserData(uid)
  const entries = receipts.filter((e) => !yearFilter || e.date?.startsWith(String(yearFilter)))
  const attachments = buildAttachmentMap(entries, categories)
  const data = buildBackupData({ receipts, income, invoices, customers, settings: { ...settings }, attachments, yearFilter })
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  zip.file(backupFileName('data', yearFilter, today()), JSON.stringify(data, null, 2))
  const result = await addAttachments(zip, attachments, 'vedlegg/')
  downloadBlob(await zip.generateAsync({ type: 'blob' }), backupFileName('full', yearFilter, today()))
  return result
}

/** Utgiftene som regneark. Bruker oppføringene siden alt har i minnet — dette er
 *  en rapport til regnskapsfører, ikke en sikkerhetskopi. */
export function downloadCsv(entries: Entry[], amountOf: (e: Entry) => number, yearFilter?: number) {
  // BOM så Excel leser æøå riktig.
  const blob = new Blob(['﻿' + entriesToCsv(entries, amountOf)], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, backupFileName('csv', yearFilter, today()))
}

export interface ParsedBackup {
  data: BackupData
  attachmentFiles: { name: string; blob: Blob }[]
}

/** Leser en backup-fil (JSON eller ZIP) uten å skrive noe. Kaster ved ugyldig
 *  fil, så kalleren kan vise feilen før brukeren velger importmetode. */
export async function readBackupFile(file: File): Promise<ParsedBackup> {
  const attachmentFiles: { name: string; blob: Blob }[] = []
  let data: BackupData

  if (file.name.endsWith('.zip')) {
    const { default: JSZip } = await import('jszip')
    const zip = await JSZip.loadAsync(file)
    const jsonFile = Object.keys(zip.files).find((f) => f.endsWith('.json'))
    if (!jsonFile) throw new Error('Fant ingen JSON-fil i ZIP-filen.')
    data = JSON.parse(await zip.files[jsonFile].async('string'))
    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir || !path.startsWith('vedlegg/')) continue
      attachmentFiles.push({ name: path.replace('vedlegg/', ''), blob: await zipEntry.async('blob') })
    }
  } else {
    data = JSON.parse(await file.text())
  }

  if (!data.receipts || !data.income) throw new Error('Ugyldig backup-fil.')
  return { data, attachmentFiles }
}

export interface ImportOptions {
  uid: string
  parsed: ParsedBackup
  mode: 'merge' | 'restore'
  onStatus: (msg: string) => void
  applySettings: (partial: Partial<UserSettings>) => Promise<void>
  /** Nummeret som gjelder nå, så en gjenoppretting ikke kan sette det ned. */
  currentNextInvoiceNumber: number
}

/** Skriver en innlest backup til Firestore.
 *
 *  «restore» skriver backupen først og fjerner deretter det den ikke inneholdt,
 *  slik at et avbrudd underveis aldri kan etterlate et tomt regnskap. Den rører
 *  ALDRI filene i Storage: de importerte kvitteringene beholder sine opprinnelige stier, så
 *  bildene overlever en gjenoppretting fra en backup som bare inneholdt JSON.
 *  Å slette dem her ga permanent bildetap. Filer fra en helt annen backup blir
 *  liggende som ufarlige foreldreløse objekter i stedet. */
export async function runImport(opts: ImportOptions): Promise<string> {
  const { uid, parsed, mode, onStatus, applySettings, currentNextInvoiceNumber } = opts
  const { data, attachmentFiles } = parsed

  const COLLECTIONS = ['receipts', 'income', 'invoices', 'customers'] as const
  type CollectionName = typeof COLLECTIONS[number]

  // Hva som ligger der fra før, per samling. Leses FØR vi skriver, men brukes
  // ikke til å slette noe ennå: se rekkefølgen under.
  const existing = {} as Record<CollectionName, Set<string>>
  for (const name of COLLECTIONS) {
    const snap = await getDocs(query(collection(db, name), where('userId', '==', uid)))
    existing[name] = new Set(snap.docs.map((d) => d.id))
  }

  onStatus('Importerer...')
  let count = 0
  let skipped = 0
  const written = {} as Record<CollectionName, Set<string>>
  for (const name of COLLECTIONS) written[name] = new Set<string>()

  // Bevar dokument-id-en fra backupen (setDoc), så en ny import av samme fil ikke
  // lager duplikater — den id-baserte dedup-en treffer da faktisk. Oppføringer
  // uten id (eldre backup-format) faller tilbake til addDoc.
  async function writeAll(list: BackupEntry[], col: CollectionName) {
    for (const row of importableEntries(list, uid)) {
      const { id, ...fields } = row
      fields.userId = uid
      // Ved sammenslåing hoppes eksisterende id-er over. Ved gjenoppretting
      // skrives de over, for da er backupen fasit.
      if (id && mode === 'merge' && existing[col].has(id)) { skipped++; continue }
      if (id) {
        await setDoc(doc(db, col, String(id)), fields)
        written[col].add(String(id))
      } else {
        const ref = await addDoc(collection(db, col), fields)
        written[col].add(ref.id)
      }
      count++
    }
  }
  await writeAll(data.receipts ?? [], 'receipts')
  await writeAll(data.income ?? [], 'income')
  await writeAll(data.invoices ?? [], 'invoices')
  await writeAll(data.customers ?? [], 'customers')

  // Gjenoppretting sletter FØRST NÅ, og bare det backupen ikke inneholdt.
  //
  // Før slettet den alt i starten og skrev etterpå. Ryk nettet i mellomtiden,
  // sto du igjen med et tomt regnskap og en backup-fil som ennå ikke var
  // skrevet. Nå er verste utfall at noe gammelt blir liggende igjen, og det
  // kan ryddes; det motsatte kan ikke gjenskapes.
  let removed = 0
  if (mode === 'restore') {
    onStatus('Fjerner det som ikke var med i backupen...')
    for (const name of COLLECTIONS) {
      for (const id of existing[name]) {
        if (written[name].has(id)) continue
        await deleteDoc(doc(db, name, id))
        removed++
      }
    }
  }

  let filesUploaded = 0
  let filesUnmatched = 0
  if (attachmentFiles.length > 0) {
    onStatus(`Laster opp ${attachmentFiles.length} vedlegg...`)
    for (const af of attachmentFiles) {
      const path = findAttachmentPath(data, af.name)
      if (!path) { filesUnmatched++; continue }
      try {
        // Innholdstypen utledes av filnavnet: blobben fra ZIP-en har ingen, og
        // uten den blir filen liggende som «application/octet-stream». Da laster
        // nettleseren den ned i stedet for å vise den. Nettopp dette skjedde med
        // vedleggene som allerede lå der.
        await uploadBytes(ref(storage, path), af.blob, { contentType: contentTypeFor(af.name) })
        filesUploaded++
      } catch (err) {
        console.warn('Vedlegg-feil:', af.name, err)
        filesUnmatched++
      }
    }
  }

  if (data.settings && typeof data.settings === 'object') {
    // Import-grensen: her tar vi formen på tro. Gammel localStorage-backup har
    // strengverdier under snake_case-nøkler, ny backup har UserSettings-formen.
    const isLegacy = 'driving_rate_per_km' in data.settings
    await applySettings(isLegacy
      ? convertLegacySettings(data.settings as Record<string, string>)
      : (data.settings as Partial<UserSettings>))
  }

  // Nummerserien skal ALDRI gå bakover. En gammel backup bærer med seg sitt
  // eget «neste fakturanummer», og uten denne vakten kunne en gjenoppretting
  // sette telleren under fakturaer som allerede finnes, og neste faktura ville
  // fått et nummer som var brukt før.
  const highestNumber = [...(data.invoices ?? [])]
    .map((i) => Number(i.number))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => Math.max(max, n), 0)
  const restored = Number((data.settings as { nextInvoiceNumber?: unknown } | undefined)?.nextInvoiceNumber)
  const base = Number.isFinite(restored) && restored >= 1 ? restored : currentNextInvoiceNumber
  const safeNext = Math.max(base, highestNumber + 1, currentNextInvoiceNumber)
  if (safeNext !== base) await applySettings({ nextInvoiceNumber: safeNext })

  const parts = [`${count} importert`]
  if (skipped > 0) parts.push(`${skipped} duplikater hoppet over`)
  if (removed > 0) parts.push(`${removed} fjernet`)
  if (filesUploaded > 0) parts.push(`${filesUploaded} vedlegg lastet opp`)
  // Vedlegg som ikke lot seg plassere skal SIES fra om. Før ble de bare hoppet
  // over i stillhet, så en backup kunne se vellykket ut uten å ha ført bildene
  // tilbake i det hele tatt.
  if (filesUnmatched > 0) parts.push(`${filesUnmatched} vedlegg uten treff (gammel backup uten vedleggsregister)`)
  if (mode === 'restore') parts.unshift('Gjenopprettet')
  return `✓ ${parts.join(', ')}.`
}

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  heic: 'image/heic',
  webp: 'image/webp',
  gif: 'image/gif',
}

function contentTypeFor(filnavn: string): string {
  const ext = filnavn.split('.').pop()?.toLowerCase() ?? ''
  return MIME[ext] ?? 'application/octet-stream'
}

/** Teksten som vises når en fil er lest, men før brukeren har valgt
 *  importmetode. Teller med samme regel som importen faktisk bruker. */
export function describeParsedBackup(parsed: ParsedBackup, uid: string): string {
  const n = (list?: BackupEntry[]) => importableEntries(list, uid).length
  const parts = [`${n(parsed.data.receipts)} utgifter`, `${n(parsed.data.income)} inntekter`]
  if (n(parsed.data.invoices) > 0) parts.push(`${n(parsed.data.invoices)} fakturaer`)
  if (n(parsed.data.customers) > 0) parts.push(`${n(parsed.data.customers)} kunder`)
  if (parsed.attachmentFiles.length > 0) parts.push(`${parsed.attachmentFiles.length} vedlegg`)
  return `Fil lest: ${parts.join(', ')}. Velg importmetode:`
}
