import { useAuth } from '../context/AuthContext'
import { useInvoices } from '../hooks/useInvoices'
import { type Entry, type ReceiptEntry, getImageUrls } from '../types'
import { numberGaps, outstandingTotal } from '../lib/invoice'
import { kr, fmtDate } from '../lib/format'
import { ModalShell } from './Modal'
import { IconCheck } from './icons'

/** Årsavslutning: er året klart til å leveres?
 *
 *  Skjermen finner ikke feil i regnskapet. Den ser etter det som pleier å bli
 *  glemt, altså bilag som mangler, fakturaer som henger igjen og en backup som
 *  aldri ble tatt. Alt den viser finnes fra før i årsrapporten eller i lista;
 *  poenget er å samle det på ett sted mens du står og skal levere. */
export function YearEndModal({ year, entries, lastBackupAt, onOpenEntry, onOpenInvoices, onOpenBackup, onClose }: {
  year: number
  /** Årets oppføringer, uten de settings-styrte postene. */
  entries: Entry[]
  lastBackupAt?: number
  onOpenEntry: (id: string) => void
  onOpenInvoices: () => void
  onOpenBackup: () => void
  onClose: () => void
}) {
  const { user } = useAuth()
  const { invoices, loading } = useInvoices(user)

  // Kjøreturer har aldri vedlegg, så bare kvitteringer kan mangle et.
  const missingAttachment = entries
    .filter(e => e.entryType === 'receipt' && getImageUrls(e as ReceiptEntry).length === 0)

  const yearInvoices = invoices.filter(i => i.issueDate?.startsWith(String(year)))
  const drafts = yearInvoices.filter(i => i.status === 'kladd')
  const outstanding = yearInvoices.filter(i => i.status === 'utstedt')
  const outstandingSum = outstandingTotal(yearInvoices)

  // Nummerrekka følger utstedelsesrekkefølgen, så hull vurderes innenfor året,
  // slik årsrapporten også gjør det.
  const gaps = numberGaps(yearInvoices
    .filter(i => i.status !== 'kladd')
    .map(i => i.number)
    .filter((n): n is number => typeof n === 'number'))

  return (
    <ModalShell title={`Årsavslutning ${year}`} onClose={onClose}>
      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Laster...</p>
        ) : (
          <>
            <Check
              title="Kvitteringer uten vedlegg"
              count={missingAttachment.length}
              okText="Alle utgifter har bilag"
              problemText={`${missingAttachment.length} utgifter mangler bilde av kvitteringen`}
            >
              <div className="space-y-1 pt-2">
                {missingAttachment.slice(0, 8).map(e => (
                  <button key={e.id} onClick={() => e.id && onOpenEntry(e.id)}
                    className="w-full text-left text-xs text-slate-600 hover:text-slate-900 hover:underline truncate">
                    {fmtDate(e.date, 'd. MMM')} · {e.description || e.category.label}
                  </button>
                ))}
                {missingAttachment.length > 8 && (
                  <p className="text-xs text-slate-400">… og {missingAttachment.length - 8} til</p>
                )}
              </div>
            </Check>

            <Check
              title="Kladder som aldri ble utstedt"
              count={drafts.length}
              okText="Ingen kladder ligger igjen"
              problemText={`${drafts.length} fakturaer står som kladd og er ikke bilag`}
            >
              <div className="space-y-1 pt-2">
                {drafts.map(i => (
                  <p key={i.id} className="text-xs text-slate-600 truncate">
                    {fmtDate(i.issueDate, 'd. MMM')} · {i.customer.name} · {kr(i.total)}
                  </p>
                ))}
                <button onClick={onOpenInvoices} className="text-xs text-blue-600 hover:underline">
                  Gå til fakturaene
                </button>
              </div>
            </Check>

            <Check
              title="Hull i fakturanummerrekka"
              count={gaps.length}
              okText="Rekka er sammenhengende"
              problemText={`Nummer ${gaps.join(', ')} mangler i rekka`}
            />

            <Check
              title="Utestående fakturaer"
              count={outstanding.length}
              okText="Alt fakturert er betalt"
              problemText={`${outstanding.length} fakturaer venter på betaling, til sammen ${kr(outstandingSum)}`}
            >
              <button onClick={onOpenInvoices} className="text-xs text-blue-600 hover:underline pt-2">
                Gå til fakturaene
              </button>
            </Check>

            <Check
              title="Backup"
              count={backupMissing(lastBackupAt, year) ? 1 : 0}
              okText={`Sist tatt ${lastBackupAt ? fmtDate(new Date(lastBackupAt).toISOString().slice(0, 10)) : ''}`}
              problemText={lastBackupAt
                ? `Siste backup er fra ${fmtDate(new Date(lastBackupAt).toISOString().slice(0, 10))} og dekker ikke hele ${year}`
                : 'Du har aldri tatt en full backup'}
            >
              <button onClick={onOpenBackup} className="text-xs text-blue-600 hover:underline pt-2">
                Ta backup nå
              </button>
            </Check>
          </>
        )}
      </div>
    </ModalShell>
  )
}

/** En backup regnes som god nok når den er tatt etter at året var omme, for da
 *  inneholder den hele året. Står du i inneværende år, finnes ikke et slikt
 *  tidspunkt ennå, og vi ber i stedet om at det ikke er for lenge siden sist. */
function backupMissing(lastBackupAt: number | undefined, year: number): boolean {
  if (!lastBackupAt) return true
  if (year < new Date().getFullYear()) return lastBackupAt < Date.UTC(year + 1, 0, 1)
  return Date.now() - lastBackupAt > 30 * 24 * 60 * 60 * 1000
}

function Check({ title, count, okText, problemText, children }: {
  title: string
  count: number
  okText: string
  problemText: string
  children?: React.ReactNode
}) {
  const ok = count === 0
  return (
    <div className={`border rounded-xl px-4 py-3 ${ok ? 'border-slate-100 bg-white' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex items-start gap-2">
        {ok
          ? <span className="shrink-0 mt-0.5"><IconCheck /></span>
          : <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center">!</span>}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800">{title}</p>
          <p className={`text-xs mt-0.5 ${ok ? 'text-slate-400' : 'text-amber-700'}`}>
            {ok ? okText : problemText}
          </p>
          {!ok && children}
        </div>
      </div>
    </div>
  )
}
