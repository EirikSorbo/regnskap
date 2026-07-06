export interface Category {
  post: string
  label: string
}

export interface BaseEntry {
  id?: string
  userId: string
  date: string
  category: Category
  description: string
  createdAt: number
  entryType: 'receipt' | 'driving'
}

export interface ReceiptEntry extends BaseEntry {
  entryType: 'receipt'
  imageUrl: string
  imagePath: string
  imageUrls?: string[]
  imagePaths?: string[]
  amount: number
}

/** Get all image URLs for a receipt (handles both old single-field and new multi-field format) */
export function getImageUrls(r: ReceiptEntry): string[] {
  const urls = r.imageUrls?.length ? [...r.imageUrls] : []
  if (r.imageUrl && !urls.includes(r.imageUrl)) urls.unshift(r.imageUrl)
  return urls.filter(Boolean)
}

/** Get all image paths for a receipt (handles both old single-field and new multi-field format) */
export function getImagePaths(r: ReceiptEntry): string[] {
  const paths = r.imagePaths?.length ? [...r.imagePaths] : []
  if (r.imagePath && !paths.includes(r.imagePath)) paths.unshift(r.imagePath)
  return paths.filter(Boolean)
}

export interface DrivingEntry extends BaseEntry {
  entryType: 'driving'
  from: string
  to: string
  tripType: 'one-way' | 'return'
  distance: number
  passengers: number
  // Kjøresatsene som gjaldt da turen ble registrert, fryst per oppføring så
  // historiske tall ikke endrer seg når standardsatsen oppdateres for et nytt
  // år. Eldre oppføringer mangler feltene og faller tilbake til gjeldende sats.
  ratePerKm?: number
  ratePerPassengerKm?: number
}

export type Entry = ReceiptEntry | DrivingEntry

export const DRIVING_CATEGORY: Category = { post: '7080', label: 'Kjøring' }

export const CATEGORIES: Category[] = [
  { post: '6500', label: 'Utstyr & instrumenter' },
  DRIVING_CATEGORY,
  { post: '7166', label: 'Forsikringer' },
  { post: '7500', label: 'Telefon & internett / EKOM' },
  { post: '7140', label: 'Reise og mat' },
  { post: '4500', label: 'Lønn til andre' },
  { post: '7490', label: 'Kontingenter / fagforeninger' },
  { post: '6695', label: 'Reparasjoner' },
  { post: '6000', label: 'Avskrivninger (saldometoden 30%)' },
  { post: '6590', label: 'Leie av lokale / utstyr' },
  { post: '7770', label: 'Hjemmekontor' },
  { post: '7700', label: 'Annen driftskostnad' },
]

// Poster appen har innebygd logikk for og som derfor alltid må finnes: kjøring
// (7080), og de tre settings-styrte postene EKOM (7500), hjemmekontor (7770) og
// avskrivninger (6000). Kategori-editoren tillater ikke å slette disse.
export const SYSTEM_POSTS = ['7080', '7500', '7770', '6000']

// Postene hvis årsbeløp beregnes fra innstillinger (ikke fra kvitteringer):
// EKOM, hjemmekontor og avskrivninger. Rapporten og oversikten henter disse fra
// settings i stedet for å summere skjulte «skygge»-kvitteringer.
export const SETTINGS_MANAGED_POSTS = ['7500', '7770', '6000']

export function calcDrivingAmount(
  distance: number,
  tripType: 'one-way' | 'return',
  passengers: number,
  ratePerKm: number,
  ratePerPassengerKm: number
): number {
  const totalKm = tripType === 'return' ? distance * 2 : distance
  return totalKm * ratePerKm + totalKm * passengers * ratePerPassengerKm
}

/** Beløp for en kjøreoppføring. Bruker den fryste satsen som ble lagret på
 *  oppføringen hvis den finnes, ellers de gjeldende satsene (bakoverkompat for
 *  eldre oppføringer uten fryst sats). Ett sted, delt av dashbord og rapport. */
export function drivingAmount(
  d: DrivingEntry,
  fallbackPerKm: number,
  fallbackPerPassengerKm: number
): number {
  const perKm = Number.isFinite(d.ratePerKm) ? (d.ratePerKm as number) : fallbackPerKm
  const perPassengerKm = Number.isFinite(d.ratePerPassengerKm)
    ? (d.ratePerPassengerKm as number)
    : fallbackPerPassengerKm
  return calcDrivingAmount(d.distance, d.tripType, d.passengers, perKm, perPassengerKm)
}

/** Fritekstfilter for oppføringslista: matcher beskrivelse, kategori (navn +
 *  postnr), beløp, og fra/til for kjøreturer. Ren og testbar. */
export function filterEntries(entries: Entry[], query: string): Entry[] {
  const q = query.trim().toLowerCase()
  if (!q) return entries
  return entries.filter((e) => {
    const parts: (string | undefined)[] = [e.description, e.category.label, e.category.post]
    if (e.entryType === 'driving') {
      parts.push(e.from, e.to)
    } else {
      parts.push(String(e.amount))
    }
    return parts.some((p) => (p || '').toLowerCase().includes(q))
  })
}

/** EKOM-beregning (post 7500): sum telefon + internett, minus privatandel
 *  (aldri mer enn bruttobeløpet). Ren og delt av rapporten og EKOM-modalen, så
 *  de to ikke kan drive fra hverandre. Ikke-tall behandles som 0. */
export function calcEkom(
  phoneMonths: number[],
  internetQuarters: number[],
  privateAmt: number
): { totalPhone: number; totalInternet: number; totalGross: number; deduction: number; net: number } {
  const sum = (xs: number[]) => xs.reduce((s, v) => s + (Number(v) || 0), 0)
  const totalPhone = sum(phoneMonths)
  const totalInternet = sum(internetQuarters)
  const totalGross = totalPhone + totalInternet
  const deduction = Math.min(Number(privateAmt) || 0, totalGross)
  const net = Math.round((totalGross - deduction) * 100) / 100
  return { totalPhone, totalInternet, totalGross, deduction, net }
}

// Delmengden av innstillingene som styrer de tre postene EKOM/hjemmekontor/
// avskrivninger. UserSettings er strukturelt tilordnbar hit (unngår import-sykel
// mot SettingsContext).
export interface ManagedSettings {
  ekomPhone: Record<string, number[]>
  ekomInternet: Record<string, number[]>
  ekomPrivateAmt: number
  hjemmekontorAmounts: Record<string, number>
  avskrivningerAmounts: Record<string, number>
  assets?: Asset[]
}

/** Årsbeløpet for en settings-styrt post (SETTINGS_MANAGED_POSTS), utledet fra
 *  innstillingene i stedet for fra kvitteringer. Returnerer null for poster som
 *  IKKE er settings-styrte (de summeres fra kvitteringer som før). Verdien er per
 *  konstruksjon den samme som de gamle skjulte «skygge»-kvitteringene lagret, så
 *  totalene endrer seg ikke når skygge-mønsteret fjernes. */
export function managedPostAmount(post: string, s: ManagedSettings, year: number): number | null {
  const ys = String(year)
  if (post === '7500') return calcEkom(s.ekomPhone[ys] || [], s.ekomInternet[ys] || [], s.ekomPrivateAmt).net
  if (post === '7770') return s.hjemmekontorAmounts[ys] || 0
  if (post === '6000') {
    // Har brukeren et driftsmiddel-register, beregnes avskrivningen (saldometode)
    // fra det. Ellers faller vi tilbake til det manuelt inntastede årsbeløpet.
    const assets = s.assets ?? []
    return assets.length ? saldoDepreciation(assets, year) : (s.avskrivningerAmounts[ys] || 0)
  }
  return null
}

/** Trekker ut beløp og dato fra OCR-råtekst av en kvittering. Ren og testbar;
 *  selve tekstgjenkjenningen (Tesseract) skjer i AddReceiptPage. Heuristikk:
 *  dato som dd.mm.åååå / åååå-mm-dd; beløp = største «pengeaktige» tall (to
 *  desimaler), helst på en linje med «sum/totalt/å betale». Resultatet er et
 *  FORSLAG brukeren bekrefter/retter — aldri en stille sannhet. */
export function parseReceiptText(text: string): { amount?: number; date?: string } {
  const out: { amount?: number; date?: string } = {}

  // --- Dato ---
  const ymd = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/)
  const dmy = text.match(/\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})\b/)
  if (ymd) {
    out.date = `${ymd[1]}-${ymd[2]}-${ymd[3]}`
  } else if (dmy) {
    let y = dmy[3]
    if (y.length === 2) y = (Number(y) > 70 ? '19' : '20') + y
    const dd = dmy[1].padStart(2, '0'), mm = dmy[2].padStart(2, '0')
    if (Number(mm) >= 1 && Number(mm) <= 12 && Number(dd) >= 1 && Number(dd) <= 31) out.date = `${y}-${mm}-${dd}`
  }

  // --- Beløp ---
  const moneyRe = /\d{1,3}(?:[ .]\d{3})*[.,]\d{2}|\d+[.,]\d{2}/g
  const parseNum = (raw: string): number | null => {
    let s = raw.replace(/\s/g, '')
    if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.') // 1.234,50
    else if (s.includes(',')) s = s.replace(',', '.')                                  // 234,50
    const n = parseFloat(s)
    return Number.isFinite(n) ? n : null
  }
  const KEYWORDS = ['å betale', 'totalt', 'total', 'sum', 'beløp', 'to pay']
  const keyworded: number[] = []
  for (const line of text.split(/\r?\n/)) {
    if (KEYWORDS.some((k) => line.toLowerCase().includes(k))) {
      for (const t of line.match(moneyRe) || []) { const n = parseNum(t); if (n != null) keyworded.push(n) }
    }
  }
  const pool = keyworded.length
    ? keyworded
    : (text.match(moneyRe) || []).map(parseNum).filter((n): n is number => n != null)
  const candidate = pool.length ? Math.max(...pool) : undefined
  if (candidate != null && candidate > 0) out.amount = Math.round(candidate * 100) / 100
  return out
}

// ---------------------------------------------------------------------------
//  DRIFTSMIDLER / SALDOAVSKRIVNING (post 6000)
// ---------------------------------------------------------------------------

export interface Asset {
  id: string
  name: string
  year: number   // anskaffelsesår
  cost: number   // kostpris = avskrivningsgrunnlag ved anskaffelse
  rate: number   // saldosats (f.eks. 0.30 for saldogruppe d)
}

/** Årets saldoavskrivning summert over alle driftsmidler. Per driftsmiddel er
 *  avskrivningen i år Y = kostpris · sats · (1−sats)^(Y−anskaffelsesår) for
 *  Y ≥ anskaffelsesår (degressiv saldo). Uten avgang er dette identisk med å føre
 *  én felles gruppesaldo. Avrundet til hele kroner. */
export function saldoDepreciation(assets: Asset[], year: number): number {
  let total = 0
  for (const a of assets) {
    const rate = a.rate > 0 && a.rate < 1 ? a.rate : 0.30
    const cost = Number(a.cost) || 0
    if (!Number.isFinite(a.year) || year < a.year || cost <= 0) continue
    total += cost * rate * Math.pow(1 - rate, year - a.year)
  }
  return Math.round(total)
}

/** Bokført restsaldo ved UTGANGEN av et år, summert over driftsmidler. */
export function saldoBalance(assets: Asset[], year: number): number {
  let total = 0
  for (const a of assets) {
    const rate = a.rate > 0 && a.rate < 1 ? a.rate : 0.30
    const cost = Number(a.cost) || 0
    if (!Number.isFinite(a.year) || year < a.year || cost <= 0) continue
    total += cost * Math.pow(1 - rate, year - a.year + 1)
  }
  return Math.round(total)
}

// ---------------------------------------------------------------------------
//  CSV-EKSPORT
// ---------------------------------------------------------------------------

/** Bygger en semikolon-separert CSV (nb-NO: semikolon-skille, desimalkomma) av
 *  utgiftsoppføringene for regnskapsfører/regneark. amountOf injiseres fordi
 *  kjøresats-fallbacken lever i sidene. Ren og testbar. */
export function entriesToCsv(entries: Entry[], amountOf: (e: Entry) => number): string {
  const esc = (v: string) => /["\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
  const header = ['Dato', 'Post', 'Kategori', 'Beskrivelse', 'Detaljer', 'Beløp']
  const rows = entries.map((e) => {
    const details = e.entryType === 'driving'
      ? `${e.from}–${e.to}${e.tripType === 'return' ? ' t/r' : ''}, ${e.tripType === 'return' ? e.distance * 2 : e.distance} km`
      : ''
    return [e.date, e.category.post, e.category.label, e.description || '', details,
      amountOf(e).toFixed(2).replace('.', ',')].map((c) => esc(String(c))).join(';')
  })
  return [header.join(';'), ...rows].join('\r\n')
}
