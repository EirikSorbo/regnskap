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
