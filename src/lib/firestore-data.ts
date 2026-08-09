/** Firestore avviser `undefined` som feltverdi og kaster «Unsupported field
 *  value: undefined». Det er lett å komme i skade for: et objekt bygget med
 *  faste nøkler får `undefined` på feltene som ikke er fylt ut, og feilen
 *  dukker først opp i det du lagrer.
 *
 *  Denne fjerner slike felter, også nedover i nøstede objekter, og brukes rett
 *  før skriving. Tomme strenger og null beholdes: de betyr «tomt», mens
 *  undefined betyr «ikke satt».
 *
 *  .ts-endelse på importen andre steder fordi testene kjører rett på node. */
export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => stripUndefined(v)) as unknown as T
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue
      out[k] = stripUndefined(v)
    }
    return out as T
  }
  return value
}
