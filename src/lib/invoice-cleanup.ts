// ---------------------------------------------------------------------------
//  ENGANGS-OPPRYDDING: LEVERINGSFELTER
// ---------------------------------------------------------------------------
//  Leveringsdato og leveringssted fantes i appen en kort periode (v1.56–v1.59)
//  og ble så fjernet igjen. Fakturaer som rakk å bli lagret i mellomtiden bærer
//  fortsatt feltene. Her er logikken for å avgjøre hva som må ryddes; selve
//  skrivingen skjer i hooks/useMigrations.ts.
//
//  Rent og uten Firestore, så det kan testes: en migrering som skriver i ekte
//  fakturaer bør ikke være det eneste stedet i appen ingen har sett etter.
// ---------------------------------------------------------------------------

/** Feltene som skal bort fra selve fakturaen. */
export const INVOICE_DELIVERY_KEYS = ['deliveryDate', 'deliveryPlace'] as const

/** Feltene som skal bort fra hver linje. */
export const LINE_DELIVERY_KEYS = ['date', 'place'] as const

/** Har dokumentet noe å rydde? Brukes for å la de aller fleste fakturaene være
 *  helt i fred, i stedet for å skrive til alle 271. */
export function needsDeliveryCleanup(data: Record<string, unknown>): boolean {
  if (INVOICE_DELIVERY_KEYS.some((k) => k in data)) return true
  const lines = data.lines
  if (!Array.isArray(lines)) return false
  return lines.some((l) =>
    l && typeof l === 'object' && LINE_DELIVERY_KEYS.some((k) => k in (l as object)))
}

/** Linjene uten leveringsfeltene.
 *
 *  Fjerner KUN de to nøklene og lar alt annet stå urørt, i stedet for å bygge
 *  linjen på nytt av felter vi kjenner. Skulle en linje bære noe uventet, blir
 *  det med videre framfor å forsvinne i en opprydding. */
export function cleanedLines(lines: unknown): { lines: unknown[]; changed: boolean } {
  if (!Array.isArray(lines)) return { lines: [], changed: false }
  let changed = false
  const out = lines.map((line) => {
    if (!line || typeof line !== 'object') return line
    const rest: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(line as Record<string, unknown>)) {
      if ((LINE_DELIVERY_KEYS as readonly string[]).includes(k)) { changed = true; continue }
      rest[k] = v
    }
    return rest
  })
  return { lines: out, changed }
}
