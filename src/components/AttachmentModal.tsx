import { useEffect, useState } from 'react'
import { attachmentUrl, openAttachment } from '../lib/attachments'
import { ModalShell } from './Modal'

/** Vedlegget vist inne i appen.
 *
 *  En lenke rett til filen lastes ned i stedet for å vises, fordi filene i
 *  Storage mangler riktig innholdstype: nettleseren vet ikke at det er et bilde
 *  og lagrer det i stedet. Her tegner vi bildet selv, og da spiller det ingen
 *  rolle hva serveren kaller filen.
 *
 *  PDF-er kan ikke tegnes på samme måte, så de får en knapp som åpner dem. */
export function AttachmentModal({ paths, urls, onClose }: {
  paths: string[]
  urls: string[]
  onClose: () => void
}) {
  return (
    <ModalShell title={urls.length > 1 ? `Vedlegg (${urls.length})` : 'Vedlegg'} onClose={onClose}>
      <div className="px-5 py-4 space-y-4">
        {urls.map((url, i) => (
          <Vedlegg key={i} path={paths[i]} fallback={url} nummer={i + 1} antall={urls.length} />
        ))}
      </div>
    </ModalShell>
  )
}

function Vedlegg({ path, fallback, nummer, antall }: {
  path?: string
  fallback: string
  nummer: number
  antall: number
}) {
  const [url, setUrl] = useState(path ? '' : fallback)
  const [feilet, setFeilet] = useState(false)
  const erPdf = (path ?? fallback).toLowerCase().includes('.pdf')
  const filnavn = path?.split('/').pop()

  useEffect(() => {
    if (!path) return
    let levende = true
    attachmentUrl(path)
      .then(u => { if (levende) setUrl(u) })
      .catch(() => { if (levende) setUrl(fallback) })
    return () => { levende = false }
  }, [path, fallback])

  return (
    <div className="space-y-2">
      {antall > 1 && (
        <p className="text-xs font-semibold text-slate-400">
          {nummer} av {antall}{filnavn ? ` · ${filnavn}` : ''}
        </p>
      )}

      {!url ? (
        <div className="h-48 rounded-lg border border-slate-100 bg-slate-50 animate-pulse" />
      ) : erPdf || feilet ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center space-y-2">
          <p className="text-sm text-slate-500">
            {erPdf ? 'PDF-er vises ikke her.' : 'Kunne ikke vise vedlegget her.'}
          </p>
          <button type="button" onClick={() => openAttachment(path, fallback)}
            className="text-sm text-blue-600 hover:underline">
            Åpne i ny fane
          </button>
        </div>
      ) : (
        <>
          <img src={url} alt={`Vedlegg ${nummer}`} onError={() => setFeilet(true)}
            className="rounded-lg border border-slate-200 w-full object-contain max-h-[70vh]" />
          <button type="button" onClick={() => openAttachment(path, fallback)}
            className="text-xs text-blue-600 hover:underline">
            Åpne i full størrelse
          </button>
        </>
      )}
    </div>
  )
}
