import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { type Entry, type DrivingEntry } from '../types'
import { kr } from '../lib/format'
import { ModalShell } from './Modal'
import { IconPencil, IconPlus, IconTrash } from './icons'

/** Årets kjøreturer samlet: nøkkeltall øverst, så lista med rediger/slett. */
export function DrivingModal({ year, entries, getAmount, onAdd, onEdit, onDelete, onClose }: {
  year: number
  entries: Entry[]
  getAmount: (e: Entry) => number
  onAdd: () => void
  onEdit: (e: DrivingEntry) => void
  onDelete: (e: Entry) => void
  onClose: () => void
}) {
  const trips = entries.filter(e => e.entryType === 'driving') as DrivingEntry[]
  const totalKm = trips.reduce((s, d) => s + (d.tripType === 'return' ? d.distance * 2 : d.distance), 0)
  const totalAmt = trips.reduce((s, e) => s + getAmount(e), 0)

  return (
    <ModalShell title={`Kjøring ${year}`} onClose={onClose}>
      <div className="px-5 py-4 space-y-3">
        {trips.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Ingen kjøreturer registrert for {year}.</p>
        ) : (
          <>
            <div className="flex gap-3 text-xs">
              <Stat label="Antall turer" value={String(trips.length)} />
              <Stat label="Totalt km" value={`${totalKm.toLocaleString('nb-NO')} km`} />
              <Stat label="Fradrag" value={kr(totalAmt)} />
            </div>
            <button onClick={onAdd}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm">
              <IconPlus /> Legg til kjøring
            </button>
            <div className="space-y-2">
              {[...trips].sort((a, b) => b.date.localeCompare(a.date)).map(d => (
                <div key={d.id} className="border border-slate-200 rounded-lg px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{d.from} → {d.to}{d.tripType === 'return' ? ' (t/r)' : ''}</p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(d.date), 'd. MMM yyyy', { locale: nb })} · {d.tripType === 'return' ? d.distance * 2 : d.distance} km
                        {d.passengers > 0 ? ` · ${d.passengers} pass.` : ''}
                      </p>
                      {d.description && <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 shrink-0">{kr(getAmount(d))}</span>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => onEdit(d)}
                      className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
                      <IconPencil /> Rediger
                    </button>
                    <button onClick={() => onDelete(d)}
                      className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">
                      <IconTrash /> Slett
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ModalShell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
      <p className="text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800 text-sm">{value}</p>
    </div>
  )
}
