import { useAccounting } from '../context/AccountingContext'
import { type Entry, type IncomeEntry } from '../types'
import { yearEndChecks } from '../lib/year-end'
import { kr, fmtDate } from '../lib/format'
import { ModalShell } from './Modal'
import { IconCheck } from './icons'

/** «1 utgift», ikke «1 utgifter». */
function antall(n: number, ental: string, flertall: string): string {
  return `${n} ${n === 1 ? ental : flertall}`
}

/** Årsavslutning: er året klart til å leveres?
 *
 *  Skjermen finner ikke feil i regnskapet. Den ser etter det som pleier å bli
 *  glemt, altså bilag som mangler, fakturaer som henger igjen og en backup som
 *  aldri ble tatt. Alt den viser finnes fra før i årsrapporten eller i lista;
 *  poenget er å samle det på ett sted mens du står og skal levere.
 *
 *  Selve reglene ligger i lib/year-end.ts og er testet der. Her tegnes bare
 *  svaret. */
export function YearEndModal({ year, entries, yearIncome, lastBackupAt, onOpenEntry, onOpenInvoices, onOpenBackup, onClose }: {
  year: number
  /** Årets oppføringer, uten de settings-styrte postene. */
  entries: Entry[]
  yearIncome: IncomeEntry[]
  lastBackupAt?: number
  onOpenEntry: (id: string) => void
  onOpenInvoices: () => void
  onOpenBackup: () => void
  onClose: () => void
}) {
  const { invoices, invoicesLoading: loading, invoicesError: error } = useAccounting()

  const sjekk = yearEndChecks({ year, entries, yearIncome, invoices, lastBackupAt })

  return (
    <ModalShell title={`Årsavslutning ${year}`} onClose={onClose}>
      <div className="px-5 py-4 space-y-3">
        {/* Uten denne ville en leseferil på fakturaene sett ut som et rent
            regnskap: alle fakturasjekkene ville vist grønn hake. */}
        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error} Sjekkene som gjelder fakturaer er derfor ikke til å stole på.
          </p>
        )}

        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Laster...</p>
        ) : (
          <>
            <Check
              title="Kvitteringer uten vedlegg"
              count={sjekk.missingAttachment.length}
              okText="Alle utgifter har bilag"
              problemText={`${antall(sjekk.missingAttachment.length, 'utgift mangler', 'utgifter mangler')} bilde av kvitteringen`}
            >
              <div className="space-y-1 pt-2">
                {sjekk.missingAttachment.slice(0, 8).map(e => (
                  <button key={e.id} onClick={() => e.id && onOpenEntry(e.id)}
                    className="w-full text-left text-xs text-slate-600 hover:text-slate-900 hover:underline truncate">
                    {fmtDate(e.date, 'd. MMM')} · {e.description || e.category.label}
                  </button>
                ))}
                {sjekk.missingAttachment.length > 8 && (
                  <p className="text-xs text-slate-400">… og {sjekk.missingAttachment.length - 8} til</p>
                )}
              </div>
            </Check>

            <Check
              title="Kladder som aldri ble utstedt"
              count={sjekk.drafts.length}
              okText="Ingen kladder ligger igjen"
              problemText={`${antall(sjekk.drafts.length, 'faktura står', 'fakturaer står')} som kladd og er ikke bilag`}
            >
              <div className="space-y-1 pt-2">
                {sjekk.drafts.map(i => (
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
              count={sjekk.gaps.length}
              okText="Rekka er sammenhengende"
              problemText={sjekk.gaps.length === 1
                ? `Nummer ${sjekk.gaps[0]} mangler i rekka`
                : `Numrene ${sjekk.gaps.join(', ')} mangler i rekka`}
            />

            <Check
              title="Utestående fakturaer"
              count={sjekk.outstanding.length}
              okText="Alt fakturert er betalt"
              problemText={`${antall(sjekk.outstanding.length, 'faktura venter', 'fakturaer venter')} på betaling, til sammen ${kr(sjekk.outstandingSum)}`}
            >
              <button onClick={onOpenInvoices} className="text-xs text-blue-600 hover:underline pt-2">
                Gå til fakturaene
              </button>
            </Check>

            {/* Inntekt uten en faktura bak seg teller i resultatet, men står
                ikke i fakturajournalen. Uten denne sjekken kan rapportens
                inntekt være høyere enn journalen, uten at noe forklarer det. */}
            <Check
              title="Inntekt uten faktura"
              count={sjekk.incomeWithoutInvoice.length}
              okText="All inntekt kommer fra en faktura"
              problemText={`${kr(sjekk.incomeWithoutInvoiceSum)} er ført som inntekt uten en faktura bak seg`}
            >
              <div className="space-y-1 pt-2">
                {sjekk.incomeWithoutInvoice.slice(0, 8).map(i => (
                  <p key={i.id} className="text-xs text-slate-600 truncate">
                    {fmtDate(i.date, 'd. MMM')} · {kr(i.amount)}{i.description ? ` · ${i.description}` : ''}
                  </p>
                ))}
                {sjekk.incomeWithoutInvoice.length > 8 && (
                  <p className="text-xs text-slate-400">… og {sjekk.incomeWithoutInvoice.length - 8} til</p>
                )}
                <p className="text-xs text-slate-400 pt-1">
                  Som regel inntekt ført før fakturamodulen fantes. Den teller i regnskapet,
                  men har ikke noe bilag i appen.
                </p>
              </div>
            </Check>

            <Check
              title="Backup"
              count={sjekk.backupMissing ? 1 : 0}
              okText={`Sist tatt ${lastBackupAt ? fmtDate(new Date(lastBackupAt).toISOString().slice(0, 10)) : ''}`}
              problemText={!lastBackupAt
                ? 'Du har aldri tatt en full backup'
                : year < new Date().getFullYear()
                  ? `Siste backup er fra ${fmtDate(new Date(lastBackupAt).toISOString().slice(0, 10))} og dekker ikke hele ${year}`
                  : `Det er en stund siden sist, ${fmtDate(new Date(lastBackupAt).toISOString().slice(0, 10))}`}
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
