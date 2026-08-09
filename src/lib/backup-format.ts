// ---------------------------------------------------------------------------
//  BACKUP — REN FORMAT-LOGIKK
// ---------------------------------------------------------------------------
//  Alt som handler om HVA en backup inneholder og hva filene heter, uten et
//  eneste kall til Firestore eller Storage. Selve nedlastingen og importen bor i
//  backup.ts. Skillet er ikke kosmetisk: det er dette laget som avgjør om et
//  bilag havner i sikkerhetskopien, og det er den eneste delen av appen der en
//  feil koster deg data du ikke får tilbake. Derfor skal det kunne enhetstestes.
//
//  Importene bruker eksplisitt .ts-endelse fordi testene kjører rett på node
//  (node --test), som krever full filsti i ESM. tsconfig har
//  allowImportingTsExtensions, og Vite bryr seg ikke.
// ---------------------------------------------------------------------------

import { type Entry, type ReceiptEntry, type Category, getImagePaths } from '../types.ts'

/** Ett vedlegg klart for eksport: hvor filen ligger i Storage, og hvilket
 *  standardiserte navn den får i ZIP-en (samme navn som rapporten viser i
 *  vedleggsregisteret, så bilag og rapport kan leses sammen). */
export interface Attachment {
  path: string
  stdName: string
}

/** Formen på en importert backup-fil (JSON, eller JSON-en inne i en ZIP). Alt er
 *  valgfritt fordi eldre backup-formater kan mangle felter. Vi leser bare
 *  id/userId/imagePath(s) eksplisitt; resten skrives videre uendret. */
export interface BackupEntry {
  id?: string
  userId?: string
  date?: string
  imagePath?: string
  imagePaths?: string[]
  [key: string]: unknown
}

export interface BackupData {
  receipts?: BackupEntry[]
  income?: BackupEntry[]
  settings?: Record<string, unknown>
  exportedAt?: string
  year?: number | string
}

/** Alle vedlegg i eksportrekkefølge: kontoplanens rekkefølge, og innenfor hver
 *  post kronologisk. Løpenummeret går på tvers av poster, som i rapporten.
 *
 *  Kategorilista må komme fra brukerens egen kontoplan. Tidligere gikk denne
 *  gjennom den hardkodede CATEGORIES-konstanten, slik at kvitteringer på egne
 *  kategorier aldri kom med i ZIP-en eller fullbackupen — de forsvant lydløst.
 *  Poster som ikke står i kontoplanen (slettet kategori, eldre data) tas med til
 *  slutt, nettopp for at ingenting skal kunne falle ut. */
export function buildAttachmentMap(entries: Entry[], categories: Category[]): Attachment[] {
  const receiptsFor = (post: string) =>
    entries
      .filter((e) => e.category.post === post && e.entryType === 'receipt')
      .sort((a, b) => a.date.localeCompare(b.date)) as ReceiptEntry[]

  const known = new Set(categories.map((c) => c.post))
  const orphanPosts = [...new Set(
    entries.map((e) => e.category.post).filter((p) => !known.has(p)),
  )].sort()
  const order = [...categories.map((c) => c.post), ...orphanPosts]

  const map: Attachment[] = []
  let idx = 1
  for (const post of order) {
    for (const r of receiptsFor(post)) {
      for (const p of getImagePaths(r)) {
        const ext = p.split('.').pop()?.toLowerCase() || 'jpg'
        map.push({ path: p, stdName: `${post}-${r.date}-${String(idx++).padStart(3, '0')}.${ext}` })
      }
    }
  }
  return map
}

/** Årsfilter for backup. Oppføringer uten dato tas MED når det ikke er filtrert
 *  på år, slik at en rad med ødelagt dato ikke stilltiende utelates fra en
 *  fullbackup. */
export function matchesYear(d: { date?: string }, yearFilter?: number): boolean {
  if (!yearFilter) return true
  return !!d.date?.startsWith(String(yearFilter))
}

/** JSON-innholdet i en backup. Innstillingene tas bare med i en full backup
 *  (uten årsfilter) — en delvis backup skal ikke kunne overskrive hele
 *  oppsettet ditt ved gjenoppretting. */
export function buildBackupData(input: {
  receipts: BackupEntry[]
  income: BackupEntry[]
  settings?: Record<string, unknown>
  yearFilter?: number
  now?: Date
}): BackupData {
  const { receipts, income, settings, yearFilter, now = new Date() } = input
  return {
    exportedAt: now.toISOString(),
    year: yearFilter ?? 'alle',
    receipts: receipts.filter((r) => matchesYear(r, yearFilter)),
    income: income.filter((i) => matchesYear(i, yearFilter)),
    settings: yearFilter ? undefined : settings,
  }
}

/** Filnavn for nedlastingene. Ett sted, så navnene ikke driver fra hverandre. */
export function backupFileName(
  kind: 'data' | 'full' | 'vedlegg' | 'csv',
  yearFilter: number | undefined,
  dateStr: string,
): string {
  const y = yearFilter ?? 'alle'
  switch (kind) {
    case 'data': return `regnskap_backup_${y}_${dateStr}.json`
    case 'full': return `regnskap_full_backup_${y}_${dateStr}.zip`
    case 'vedlegg': return `kvitteringer_${y}.zip`
    case 'csv': return `regnskap_utgifter_${y}_${dateStr}.csv`
  }
}

/** Oppføringene i en backup som skal importeres til denne brukeren: egne rader,
 *  pluss rader uten eier (eldre backup-format). Brukes både når vi teller opp
 *  filen for brukeren og når vi faktisk importerer — de to reglene var før
 *  ulike, så forhåndsvisningen kunne love færre rader enn importen skrev. */
export function importableEntries(list: BackupEntry[] | undefined, uid: string): BackupEntry[] {
  return (list ?? []).filter((r) => !r.userId || r.userId === uid)
}

/** Storage-stien et vedlegg fra ZIP-en hører hjemme på, funnet ved å matche
 *  filnavnet mot kvitteringenes stier.
 *
 *  Ser på HELE imagePaths-lista, ikke bare det gamle enkeltfeltet imagePath.
 *  Med bare imagePath ble vedlegg nummer to og utover på en kvittering aldri
 *  lastet opp igjen ved gjenoppretting: bildene lå i ZIP-en, men havnet aldri
 *  tilbake i Storage. */
export function findAttachmentPath(
  receipts: BackupEntry[] | undefined,
  fileName: string,
): string | null {
  for (const r of receipts ?? []) {
    const paths = [
      ...(Array.isArray(r.imagePaths) ? r.imagePaths : []),
      ...(typeof r.imagePath === 'string' ? [r.imagePath] : []),
    ]
    const hit = paths.find((p) => typeof p === 'string' && p.endsWith(fileName))
    if (hit) return hit
  }
  return null
}
