export interface Receipt {
  id?: string
  userId: string
  imageUrl: string
  imagePath: string
  amount: number
  date: string        // ISO date string
  category: Category
  description: string
  createdAt: number   // timestamp
}

export interface Category {
  post: string        // accounting post number e.g. "6500"
  label: string       // Norwegian label e.g. "Utstyr & instrumenter"
}

export const CATEGORIES: Category[] = [
  { post: '6500', label: 'Utstyr & instrumenter' },
  { post: '7080', label: 'Bil / kjøregodtgjørelse' },
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
