import { type Entry, type ReceiptEntry, getImageUrls, getImagePaths } from '../types'
import { fmtDate } from '../lib/format'
import { openAttachment } from '../lib/attachments'
import { ModalShell } from './Modal'

/** Alle opplastede vedlegg som en flat liste med lenker, nyeste først. */
export function ReceiptListModal({ entries, onClose }: { entries: Entry[]; onClose: () => void }) {
  const files = entries
    .filter(e => e.entryType === 'receipt')
    .sort((a, b) => b.date.localeCompare(a.date))
    .flatMap(e => {
      const r = e as ReceiptEntry
      const paths = getImagePaths(r)
      return getImageUrls(r).map((url, i) => ({ entry: e, url, path: paths[i] || '' }))
    })

  return (
    <ModalShell title="Kvitteringer" onClose={onClose}>
      <div className="px-5 py-4">
        {files.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Ingen vedlegg lastet opp.</p>
        ) : (
          <div className="space-y-2">
            {files.map((f, i) => {
              const filename = f.path?.split('/').pop() ?? 'vedlegg'
              const isPdf = filename.toLowerCase().endsWith('.pdf') || f.url?.includes('.pdf')
              return (
                <button key={`${f.entry.id}-${i}`} type="button"
                  onClick={() => openAttachment(f.path, f.url)}
                  className="w-full text-left flex items-start gap-2 border border-slate-200 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition">
                  <span className="text-xs font-mono text-slate-400 mt-0.5 shrink-0">{isPdf ? 'PDF' : 'IMG'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-blue-600 truncate">{filename}</p>
                    <p className="text-xs text-slate-400">{f.entry.category.label} · {fmtDate(f.entry.date)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </ModalShell>
  )
}
