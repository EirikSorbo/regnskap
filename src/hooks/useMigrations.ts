import { useEffect } from 'react'
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '../firebase'
import type { UserSettings } from '../context/SettingsContext'
import { needsDeliveryCleanup, cleanedLines, INVOICE_DELIVERY_KEYS } from '../lib/invoice-cleanup'

/** Gamle postnumre → nye. Kjøres én gang per bruker, styrt av flagget
 *  postNumbersMigrated i innstillingene. */
const POST_MAP: Record<string, { post: string; label: string }> = {
  '7400': { post: '7490', label: 'Kontingenter / fagforeninger' },
  '6800': { post: '7140', label: 'Reise og mat' },
  '7100': { post: '7770', label: 'Hjemmekontor' },
}

/** De to engangs-migreringene appen fortsatt bærer på. De lå inne i dashbordet
 *  og fyrte som en bieffekt av å tegne forsiden; her er de i det minste samlet
 *  og navngitt. Begge er idempotente og styrt av et flagg i innstillingene. */
export function useMigrations(
  user: User | null,
  settings: UserSettings,
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>,
) {
  // 1) Skriv om gamle postnumre på eksisterende oppføringer.
  useEffect(() => {
    if (!user || settings.postNumbersMigrated) return
    void (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'receipts'), where('userId', '==', user.uid)))
        let migrated = 0
        for (const d of snap.docs) {
          const oldPost = d.data().category?.post
          if (oldPost && POST_MAP[oldPost]) {
            await updateDoc(doc(db, 'receipts', d.id), { category: POST_MAP[oldPost] })
            migrated++
          }
        }
        await updateSettings({ postNumbersMigrated: true })
        if (migrated > 0) console.log(`Migrert ${migrated} oppføringer til nye postnumre`)
      } catch (e) {
        // Feiler den, står flagget urørt og migreringen prøver igjen neste gang.
        console.error('Postnummer-migrering feilet:', e)
      }
    })()
    // updateSettings bevisst utelatt fra deps: engangsjobb styrt av flagget.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, settings.postNumbersMigrated])

  // 2) Slett de skjulte «skygge»-kvitteringene for EKOM/hjemmekontor/
  //    avskrivninger. Postene beregnes nå fra innstillingene. Sletter KUN de
  //    eksakt sporede dokument-id-ene fra *EntryIds-kartene, ingen brede treff.
  //    Trygt uansett rekkefølge: totalene teller aldri disse som kvitteringer,
  //    så ingenting dobbelttelles før eller etter slettingen.
  useEffect(() => {
    if (!user || settings.shadowReceiptsRemoved) return
    const ids = [
      ...Object.values(settings.ekomEntryIds || {}),
      ...Object.values(settings.hjemmekontorEntryIds || {}),
      ...Object.values(settings.avskrivningerEntryIds || {}),
    ].filter(Boolean)
    void (async () => {
      try {
        for (const id of ids) {
          try { await deleteDoc(doc(db, 'receipts', id)) } catch { /* alt slettet — ignorer */ }
        }
        await updateSettings({
          shadowReceiptsRemoved: true,
          ekomEntryIds: {}, hjemmekontorEntryIds: {}, avskrivningerEntryIds: {},
        })
      } catch (e) {
        console.error('Skygge-migrering feilet:', e)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, settings.shadowReceiptsRemoved])

  // 3) Rydd vekk leveringsdato og leveringssted fra fakturaer som rakk å få
  //    dem mens feltene fantes i appen (v1.56–v1.59). Rører KUN de to feltene,
  //    og kun de fakturaene som faktisk har noe å rydde: resten skrives det
  //    ikke til i det hele tatt.
  useEffect(() => {
    if (!user || settings.deliveryFieldsRemoved) return
    void (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'invoices'), where('userId', '==', user.uid)))
        let cleaned = 0
        for (const d of snap.docs) {
          const data = d.data()
          if (!needsDeliveryCleanup(data)) continue
          const patch: Record<string, unknown> = {}
          for (const key of INVOICE_DELIVERY_KEYS) {
            if (key in data) patch[key] = deleteField()
          }
          const { lines, changed } = cleanedLines(data.lines)
          if (changed) patch.lines = lines
          await updateDoc(doc(db, 'invoices', d.id), patch)
          cleaned++
        }
        await updateSettings({ deliveryFieldsRemoved: true })
        if (cleaned > 0) console.log(`Ryddet leveringsfelter fra ${cleaned} fakturaer`)
      } catch (e) {
        // Feiler den, står flagget urørt og oppryddingen prøver igjen neste gang.
        console.error('Leveringsfelt-opprydding feilet:', e)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, settings.deliveryFieldsRemoved])
}
