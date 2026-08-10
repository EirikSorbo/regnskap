// ---------------------------------------------------------------------------
//  FILTYPE FRA FILNAVN
// ---------------------------------------------------------------------------
//  Ren tabell, uten Firebase, så den kan testes. Avgjør om et vedlegg VISES
//  eller LASTES NED: er innholdstypen feil eller ukjent, lagrer nettleseren
//  filen i stedet for å åpne den.
// ---------------------------------------------------------------------------

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  heic: 'image/heic',
  heif: 'image/heif',
  webp: 'image/webp',
  gif: 'image/gif',
}

/** Innholdstypen filnavnet tilsier, eller null hvis endelsen er ukjent.
 *
 *  Returnerer null framfor å gjette: en fil merket med feil type er verre enn
 *  en umerket, for da tolker nettleseren innholdet som noe det ikke er. */
export function contentTypeFor(navnEllerSti: string): string | null {
  const ext = navnEllerSti.split('.').pop()?.toLowerCase() ?? ''
  return MIME[ext] ?? null
}
