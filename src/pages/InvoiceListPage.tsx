import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAccounting } from '../context/AccountingContext'
import { type Invoice, statusLabel, isOverdue, outstandingTotal } from '../lib/invoice'
import { krExact, fmtDate } from '../lib/format'
import { CustomerRegisterModal } from '../components/CustomerRegisterModal'
import { IconPlus } from '../components/icons'

type Filter = 'alle' | 'kladd' | 'utestående' | 'betalt'

export default function InvoiceListPage() {
  const navigate = useNavigate()
  // Både fakturaene og regnskapsåret kommer fra den felles tilstanden, så de to
  // fanene aldri kan vise hvert sitt år eller hvert sitt sett fakturaer.
  const { selectedYear: year, invoices, invoicesLoading: loading, invoicesError: error } = useAccounting()
  const [filter, setFilter] = useState<Filter>('alle')
  const [showCustomers, setShowCustomers] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')

  const yearInvoices = invoices.filter(i => i.issueDate.startsWith(String(year)))

  const shown = yearInvoices.filter(i => {
    if (filter === 'kladd') return i.status === 'kladd'
    if (filter === 'utestående') return i.status === 'utstedt'
    if (filter === 'betalt') return i.status === 'betalt'
    return true
  })

  // Fakturert = utstedte fakturaer og kreditnotaer, altså det som faktisk er
  // ført som inntekt. Kladder teller ikke, de er ikke bilag ennå.
  const invoiced = yearInvoices
    .filter(i => i.status !== 'kladd' && !i.historical)
    .reduce((s, i) => s + (i.kind === 'kreditnota' ? -i.total : i.total), 0)
  const outstanding = outstandingTotal(yearInvoices)
  const overdueCount = yearInvoices.filter(i => isOverdue(i, today)).length

  return (
    <>
      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        <h2 className="text-lg font-semibold text-slate-800">Fakturaer {year}</h2>

        <div className="grid grid-cols-3 gap-2">
          <Kpi label="Fakturert" value={krExact(invoiced)} />
          <Kpi label="Utestående" value={krExact(outstanding)} tone={outstanding > 0 ? 'text-amber-600' : undefined} />
          <Kpi label="Forfalt" value={String(overdueCount)} tone={overdueCount > 0 ? 'text-red-600' : undefined} />
        </div>

        <div className="flex gap-2">
          <button onClick={() => navigate('/faktura/ny')}
            className="flex-1 basis-0 min-w-0 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-xs">
            <IconPlus /> Ny faktura
          </button>
          <button onClick={() => setShowCustomers(true)}
            className="flex-1 basis-0 min-w-0 bg-white border border-slate-200 rounded-xl py-3 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition">
            Kunderegister
          </button>
        </div>

        <div className="flex gap-2">
          {(['alle', 'kladd', 'utestående', 'betalt'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 basis-0 min-w-0 px-2 py-1.5 rounded-lg text-xs font-medium border transition capitalize ${filter === f ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600 hover:bg-white'}`}>
              {f}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
        )}

        {loading ? (
          <div className="text-center text-slate-400 py-12">Laster...</div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-1">
            <p className="text-sm">
              {yearInvoices.length === 0 ? `Ingen fakturaer i ${year}.` : 'Ingen fakturaer i dette filteret.'}
            </p>
            {/* Uten denne linja ser en tom liste helt lik ut enten du mangler
                fakturaer eller bare har valgt feil år. */}
            {yearInvoices.length === 0 && invoices.length > 0 && (
              <p className="text-xs">
                Du har {invoices.length} fakturaer i andre år. Bytt regnskapsår i innstillingene.
              </p>
            )}
            {invoices.length === 0 && !error && (
              <p className="text-xs">Lag en ny faktura for å komme i gang.</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {shown.map(inv => <InvoiceRow key={inv.id} inv={inv} today={today} onClick={() => navigate(`/faktura/${inv.id}`)} />)}
          </div>
        )}
      </div>

      {showCustomers && <CustomerRegisterModal onClose={() => setShowCustomers(false)} />}
    </>
  )
}

function InvoiceRow({ inv, today, onClick }: { inv: Invoice; today: string; onClick: () => void }) {
  const label = statusLabel(inv, today)
  const tone =
    label === 'Forfalt' ? 'bg-red-50 text-red-700 border-red-200'
    : label === 'Betalt' ? 'bg-green-50 text-green-700 border-green-200'
    : label === 'Kladd' ? 'bg-slate-100 text-slate-500 border-slate-200'
    : label === 'Kreditnota' || label === 'Kreditert' ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-blue-50 text-blue-700 border-blue-200'

  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 hover:bg-slate-50 transition">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 truncate">
            {inv.number ? `${inv.kind === 'kreditnota' ? 'Kreditnota' : 'Faktura'} ${inv.number}` : 'Kladd'} · {inv.customer.name}
          </p>
          <p className="text-xs text-slate-400">
            {fmtDate(inv.issueDate)}
            {inv.status === 'utstedt' && ` · forfaller ${fmtDate(inv.dueDate, 'd. MMM')}`}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-slate-800">{inv.kind === 'kreditnota' ? `−${krExact(inv.total)}` : krExact(inv.total)}</p>
          <span className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tone}`}>{label}</span>
        </div>
      </div>
    </button>
  )
}

function Kpi({ label, value, tone = 'text-slate-800' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-3 text-center shadow-sm">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold mt-1 tabular-nums ${tone}`}>{value}</p>
    </div>
  )
}
