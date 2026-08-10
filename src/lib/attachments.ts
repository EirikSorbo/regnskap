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

import { ref, getDownloadURL } from 'firebase/storage'
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
