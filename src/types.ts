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

/** En inntektsføring (post 3000). Bodde tidligere som to ulike lokale
 *  interfacer i DashboardPage og ReportPage — den ene lovet en `description`
 *  appen aldri skrev. Ett sted nå, og feltet er valgfritt slik dataene faktisk
 *  er. */
export interface IncomeEntry {
  id?: string
  userId: string
  amount: number
  date: string
  description?: string
  /** Satt når inntekten kommer fra en utstedt faktura. Da eies raden av
   *  fakturaen og skal ikke slettes for seg: retting skjer med kreditnota. */
  invoiceId?: string
  createdAt: number
}

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

/** Beløpet for én utgiftsoppføring, uansett type. Dashbordet og rapporten hadde
 *  hver sin identiske `getAmount` — dette er den ene. Ikke-tall behandles som 0
 *  så en korrupt importert rad ikke gjør hele årssummen til NaN. */
export function entryAmount(e: Entry, ratePerKm: number, ratePerPassengerKm: number): number {
  if (e.entryType === 'driving') return drivingAmount(e, ratePerKm, ratePerPassengerKm)
  return Number(e.amount) || 0
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

/** Antall terminer forskuddsskatten betales over i året. */
export const TAX_TERMS = 4

/** Innbetalt forskuddsskatt målt mot resultatet så langt i år.
 *
 *  Satsen er ren måling, ikke en beregning av hva du skylder: den sier hvor
 *  stor andel av det du har tjent som allerede er innbetalt. Går resultatet i
 *  null eller minus, finnes ingen meningsfull andel, og satsen er null. Det er
 *  forskjellig fra 0 %, som ville betydd at ingenting er betalt. */
export function taxPaidSummary(
  paidTerms: number[] | undefined,
  result: number,
): { paid: number; rate: number | null } {
  const paid = (paidTerms ?? []).reduce((s, v) => s + (Number(v) || 0), 0)
  return { paid, rate: result > 0 ? paid / result : null }
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

/** Én post i resultatoppstillingen: kategorien, oppføringene bak den (tom for
 *  settings-styrte poster, som ikke har kvitteringer) og årssummen. */
export interface PostGroup {
  cat: Category
  entries: Entry[]
  sum: number
  managed: boolean
}

/** Summerer årets utgifter per post, i kontoplanens rekkefølge. Delt av
 *  rapporten og oversiktsmodalen, som tidligere hadde hver sin kopi av logikken.
 *
 *  Poster som IKKE står i kontoplanen lenger (brukeren har slettet kategorien,
 *  eller dataene er importert fra en eldre kontoplan) legges til på slutten med
 *  navnet oppføringen selv bærer. Uten dette forsvant slike oppføringer stille
 *  fra rapporten samtidig som de talte med i totalen, så oppstillingen ikke
 *  summerte seg til sin egen sluttsum. */
export function postSums(
  categories: Category[],
  yearEntries: Entry[],
  settings: ManagedSettings,
  year: number,
  amountOf: (e: Entry) => number,
): PostGroup[] {
  const forPost = (post: string) =>
    yearEntries.filter((e) => e.category.post === post).sort((a, b) => a.date.localeCompare(b.date))

  const groups: PostGroup[] = categories.map((cat) => {
    const managed = managedPostAmount(cat.post, settings, year)
    if (managed !== null) return { cat, entries: [], sum: managed, managed: true }
    const entries = forPost(cat.post)
    return { cat, entries, sum: entries.reduce((s, e) => s + amountOf(e), 0), managed: false }
  })

  const known = new Set(categories.map((c) => c.post))
  const orphanPosts = [...new Set(
    yearEntries
      .map((e) => e.category.post)
      .filter((p) => !known.has(p) && !SETTINGS_MANAGED_POSTS.includes(p)),
  )].sort()
  for (const post of orphanPosts) {
    const entries = forPost(post)
    groups.push({
      cat: { post, label: entries[0]?.category.label || post },
      entries,
      sum: entries.reduce((s, e) => s + amountOf(e), 0),
      managed: false,
    })
  }
  return groups
}

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
