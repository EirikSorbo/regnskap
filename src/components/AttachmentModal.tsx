import { useEffect, useState } from 'react'
import { attachmentUrl, openAttachment } from '../lib/attachments'
import { ModalShell } from './Modal'

/** Vedlegget vist inne i appen.
 *
 *  Bildet tegnes her framfor å åpnes som en lenke. En del av vedleggene ble
 *  lastet opp uten innholdstype, og en lenke til en slik fil laster den ned i
 *  stedet for å vise den. Tegner vi bildet selv, spiller det ingen rolle hva
 *  serveren kaller filen.
 *
 *  PDF-er tegnes i en ramme. Den krever at filen faktisk er merket som PDF i
 *  Storage; er den ikke det, vises ingenting, og knappen under er utveien. */
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
      ) : erPdf ? (
        <>
          {/* Rammen viser PDF-en med nettleserens egen visning. På iPhone tegner
              Safari bare første side her, så knappen under er ikke pynt. */}
          <iframe src={url} title={`Vedlegg ${nummer}`}
            className="w-full h-[60vh] rounded-lg border border-slate-200 bg-white" />
          {/* Ikke alle nettlesere tegner PDF i en ramme. Blir den stående tom,
              skal det stå hvorfor, i stedet for et hvitt felt uten forklaring. */}
          <p className="text-xs text-slate-400">
            Står rammen tom, viser ikke nettleseren PDF her.{' '}
            <button type="button" onClick={() => openAttachment(path, fallback)}
              className="text-blue-600 hover:underline">
              Åpne i egen fane
            </button>
          </p>
        </>
      ) : feilet ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center space-y-2">
          <p className="text-sm text-slate-500">Kunne ikke vise vedlegget her.</p>
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
