// ---------------------------------------------------------------------------
//  VEDLEGG — FERSKE LENKER, HENTET FRA STIEN
// ---------------------------------------------------------------------------
//  Oppføringene bærer både en sti (imagePath/imagePaths) og en ferdig
//  nedlastingslenke (imageUrl/imageUrls). Lenken har et tilgangstoken i seg, og
//  det tokenet kan slutte å gjelde: lastes filen opp på nytt, for eksempel av en
//  gjenoppretting fra backup, får objektet et nytt token og alle lagrede lenker
//  svarer 403. Filen er der fortsatt, men lenken til den er død.
//
//  Stien er derimot stabil. Derfor hentes lenken herfra, når den trengs, og den
//  lagrede lenken brukes bare som reserve for oppføringer som er så gamle at de
//  mangler sti.
// ---------------------------------------------------------------------------

import { ref, getDownloadURL, updateMetadata } from 'firebase/storage'
import { storage } from '../firebase'

export async function attachmentUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, path))
}

/** Åpner et vedlegg i en ny fane.
 *
 *  Fanen åpnes FØR lenken hentes. Safari blokkerer window.open som skjer etter
 *  en await, siden den da ikke lenger regnes som utløst av et trykk. */
export function openAttachment(path?: string, fallbackUrl?: string): void {
  const fane = window.open('', '_blank')
  if (fane) fane.opener = null

  const vis = (url: string) => {
    if (fane) fane.location.href = url
    else window.location.href = url   // fane blokkert: bruk denne
  }
  const mislyktes = () => {
    fane?.close()
    alert('Kunne ikke åpne vedlegget. Er du på nett?')
  }

  if (!path) {
    if (fallbackUrl) vis(fallbackUrl)
    else mislyktes()
    return
  }
  attachmentUrl(path)
    .then(vis)
    .catch(() => {
      if (fallbackUrl) vis(fallbackUrl)
      else mislyktes()
    })
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

/** Innholdstypen filnavnet tilsier, eller null hvis endelsen er ukjent. */
export function contentTypeFor(path: string): string | null {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return MIME[ext] ?? null
}

/** Setter riktig innholdstype og «vis i nettleseren» på vedlegg som allerede
 *  ligger i Storage.
 *
 *  Filer lastet opp uten innholdstype ble liggende som
 *  «application/octet-stream». Nettleseren aner da ikke at det er en PDF eller
 *  et bilde, og laster filen ned i stedet for å vise den.
 *
 *  Innholdstypen alene er ikke alltid nok: er contentDisposition satt til
 *  «attachment», laster nettleseren ned uansett hva filen inneholder. Derfor
 *  settes den eksplisitt til «inline».
 *
 *  Dette endrer BARE metadataen. Filen røres ikke, og nedlastingstokenet består,
 *  i motsetning til en ny opplasting, som ville gitt filen et nytt token og
 *  drept alle lagrede lenker. */
export async function repairContentTypes(
  paths: string[],
  onProgress?: (ferdig: number, total: number) => void,
): Promise<{ rettet: number; hoppetOver: number; feilet: number }> {
  let rettet = 0, hoppetOver = 0, feilet = 0
  let ferdig = 0
  for (const path of paths) {
    const contentType = contentTypeFor(path)
    if (!contentType) { hoppetOver++; ferdig++; onProgress?.(ferdig, paths.length); continue }
    try {
      await updateMetadata(ref(storage, path), { contentType, contentDisposition: 'inline' })
      rettet++
    } catch (err) {
      console.warn('Kunne ikke rette innholdstype:', path, err)
      feilet++
    }
    ferdig++
    onProgress?.(ferdig, paths.length)
  }
  return { rettet, hoppetOver, feilet }
}
