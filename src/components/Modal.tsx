import type { ReactNode } from 'react'
import { IconChevron, IconX } from './icons'

// Skallene rundt modaler og skuffer. Den samme overlay-markupen var skrevet av
// sju ganger i dashbordet, med små avvik som ikke var tilsiktet.

/** Modal: bunnark på mobil, sentrert kort på desktop. */
export function ModalShell({ title, onClose, header, footer, overlayClass, children }: {
  title?: string
  onClose: () => void
  /** Erstatter standardhodet helt (brukes av resultatmodalen, som har mørkt hode). */
  header?: ReactNode
  footer?: ReactNode
  overlayClass?: string
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className={`absolute inset-0 ${overlayClass ?? 'bg-black/40'}`} onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {header ?? (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
            <h2 className="text-base font-semibold text-slate-800">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><IconX /></button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="shrink-0 border-t border-slate-100">{footer}</div>}
      </div>
    </div>
  )
}

/** Skuff som glir inn fra høyre. */
export function Drawer({ title, onClose, aside, contentClass = 'space-y-6', children }: {
  title: string
  onClose: () => void
  /** Liten tekst i hodet, rett til venstre for lukkekrysset. */
  aside?: ReactNode
  contentClass?: string
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-80 bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <div className="flex items-center gap-2">
            {aside}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><IconX /></button>
          </div>
        </div>
        <div className={`flex-1 overflow-y-auto px-5 py-5 ${contentClass}`}>{children}</div>
      </div>
    </div>
  )
}

/** Sammenleggbar seksjon i innstillingsskuffen: tittel til venstre, en kort
 *  status til høyre, innholdet under når den er åpen. */
export function Section({ title, summary, open, onToggle, children }: {
  title: string
  summary?: ReactNode
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div>
      <button onClick={onToggle}
        className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 mb-1">
        <span>{title}</span>
        <span className="flex items-center gap-1 text-slate-400 font-normal text-xs">
          {summary}
          <IconChevron open={open} />
        </span>
      </button>
      {open && children}
    </div>
  )
}
