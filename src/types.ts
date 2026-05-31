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
  amount: number
}

export interface DrivingEntry extends BaseEntry {
  entryType: 'driving'
  from: string
  to: string
  tripType: 'one-way' | 'return'
  distance: number
  passengers: number
}

export type Entry = ReceiptEntry | DrivingEntry

export const DRIVING_CATEGORY: Category = { post: '7080', label: 'Kjøring' }

export const CATEGORIES: Category[] = [
  { post: '6500', label: 'Utstyr & instrumenter' },
  DRIVING_CATEGORY,
  { post: '7166', label: 'Forsikringer' },
  { post: '7500', label: 'Telefon & internett / EKOM' },
  { post: '6800', label: 'Reise og mat' },
  { post: '4500', label: 'Lønn til andre' },
  { post: '7400', label: 'Kontingenter / fagforeninger' },
  { post: '6695', label: 'Reparasjoner' },
  { post: '6000', label: 'Avskrivninger (saldometoden 30%)' },
  { post: '6590', label: 'Leie av lokale / utstyr' },
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
