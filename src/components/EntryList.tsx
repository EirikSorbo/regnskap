import { type Entry, type ReceiptEntry, type DrivingEntry, getImageUrls, getImagePaths } from '../types'
import { kr, fmtDate } from '../lib/format'
import { IconPaperclip, IconPencil, IconTrash } from './icons'

/** Lista over årets oppføringer på forsiden. Én rad utvides om gangen. */
export function EntryList({ entries, expandedId, setExpandedId, onDelete, onEdit, getAmount, emptyText }: {
  entries: Entry[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  onDelete: (e: Entry) => void
  onEdit: (e: Entry) => void
  getAmount: (e: Entry) => number
  emptyText?: string
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">{emptyText ?? 'Ingen oppføringer dette året ennå.'}</p>
        {!emptyText && <p className="text-xs mt-1">Trykk + for å legge til.</p>}
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {entries.map(e => {
        const isDriving = e.entryType === 'driving'
        const d = isDriving ? (e as DrivingEntry) : null
        // Kjøreturer har aldri vedlegg; bare kvitteringer kan vise bindersen.
        const vedlegg = isDriving ? [] : getImageUrls(e as ReceiptEntry)
        return (
          <div key={e.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            {/* Bindersen ligger UTENFOR rad-knappen. En lenke inni en knapp er
                ugyldig markup, og et trykk på den ville dessuten foldet ut raden
                i tillegg til å åpne vedlegget. */}
            <div className="flex items-stretch">
              <button className="flex-1 min-w-0 text-left pl-4 pr-1 py-3 flex items-center justify-between"
                onClick={() => setExpandedId(expandedId === e.id ? null : e.id!)}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {isDriving ? `${d!.from} → ${d!.to}${d!.tripType === 'return' ? ' (t/r)' : ''}` : (e.description || e.category.label)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Post {e.category.post} · {fmtDate(e.date)}
                    {isDriving && ` · ${d!.tripType === 'return' ? d!.distance * 2 : d!.distance} km`}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-800 ml-3 shrink-0">{kr(getAmount(e))}</span>
              </button>
              {/* Plassen holdes av på ALLE rader, også de uten vedlegg. Ellers
                  skyves beløpet innover bare på radene med binders, og
                  kolonnen med kroner slutter å stå på linje nedover. */}
              {vedlegg.length > 0 ? (
                <a href={vedlegg[0]} target="_blank" rel="noopener noreferrer"
                  title={vedlegg.length > 1
                    ? `Åpne vedlegget (${vedlegg.length} i alt, resten ligger i raden)`
                    : 'Åpne vedlegget'}
                  className="w-10 shrink-0 flex items-center justify-center gap-0.5 text-slate-400 hover:text-blue-600 transition">
                  <IconPaperclip />
                  {vedlegg.length > 1 && <span className="text-[10px] font-semibold">{vedlegg.length}</span>}
                </a>
              ) : (
                <span className="w-10 shrink-0" aria-hidden="true" />
              )}
            </div>
            {expandedId === e.id && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-2">
                {isDriving ? (
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><span className="font-medium">Fra:</span> {d!.from}</p>
                    <p><span className="font-medium">Til:</span> {d!.to}</p>
                    <p><span className="font-medium">Type:</span> {d!.tripType === 'return' ? 'Tur/retur' : 'Enveis'}</p>
                    <p><span className="font-medium">Avstand:</span> {d!.tripType === 'return' ? d!.distance * 2 : d!.distance} km</p>
                    {d!.passengers > 0 && <p><span className="font-medium">Passasjerer:</span> {d!.passengers}</p>}
                    {e.description && <p><span className="font-medium">Beskrivelse:</span> {e.description}</p>}
                  </div>
                ) : (
                  <ReceiptDetails entry={e as ReceiptEntry} />
                )}
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(e)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
                    <IconPencil /> Rediger
                  </button>
                  <button onClick={() => onDelete(e)}
                    className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">
                    <IconTrash /> Slett
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ReceiptDetails({ entry }: { entry: ReceiptEntry }) {
  const urls = getImageUrls(entry)
  const paths = getImagePaths(entry)
  return (
    <div className="text-sm text-slate-600 space-y-1">
      <p><span className="font-medium">Beløp:</span> {kr(Number(entry.amount) || 0)}</p>
      <p><span className="font-medium">Kategori:</span> {entry.category.label}</p>
      {entry.description && <p><span className="font-medium">Beskrivelse:</span> {entry.description}</p>}
      {urls.map((url, i) => paths[i]?.endsWith('.pdf') ? (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs mt-1 mr-3">
          Åpne PDF {urls.length > 1 ? `(${i + 1})` : ''}
        </a>
      ) : (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt={`Kvittering ${i + 1}`}
            className="mt-2 rounded-lg border border-slate-200 max-h-48 object-contain w-full" />
        </a>
      ))}
    </div>
  )
}
