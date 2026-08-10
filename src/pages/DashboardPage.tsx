import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useAccounting } from '../context/AccountingContext'
import { usePanels } from '../context/PanelsContext'
import { type Entry, filterEntries } from '../types'
import { deleteEntry } from '../lib/entries'
import { kr } from '../lib/format'
import { EntryList } from '../components/EntryList'
import { BackupReminder } from '../components/BackupReminder'

export default function DashboardPage() {
  const { settings } = useSettings()
  const navigate = useNavigate()

  // Regnskapet regnes ut i AccountingContext, og panelene bor i PanelsContext.
  // Forsiden er en av flere sider som viser dem, ikke eieren.
  const {
    loading, error, selectedYear, yearEntries, totalIncome, totalExpenses, amountOf,
  } = useAccounting()
  const { busy, runFullBackup } = usePanels()

  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function handleDelete(entry: Entry) {
    if (!confirm('Slett denne oppføringen?')) return
    try { await deleteEntry(entry) } catch (e) { console.error(e) }
  }

  return (
    <>
      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* En leseferil skal SES. Uten dette viste appen 0 kr i inntekt og et
            flott overskudd når reglene slo til på inntektssamlingen. */}
        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
        )}

        {/* Årets regnskap i tre tall. Inntekten er den regnskapet fører, altså
            fakturaer på fakturadato pluss inntekt ført manuelt — samme tall som
            årsrapporten viser, slik at ingen skjerm i appen sier noe annet. */}
        <div className="bg-blue-600 text-white rounded-2xl p-5">
          <p className="text-sm text-blue-100">Regnskap {selectedYear}</p>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-100">Inntekter</span>
              <span className="text-sm font-semibold">{kr(totalIncome)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-100">Utgifter</span>
              <span className="text-sm font-semibold">−{kr(totalExpenses)}</span>
            </div>
            <div className="border-t border-white/20 pt-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-100">Resultat</span>
              <span className="text-xl font-bold">{kr(totalIncome - totalExpenses)}</span>
            </div>
          </div>
        </div>

        <BackupReminder lastBackupAt={settings.lastBackupAt} busy={busy} onBackup={() => runFullBackup()} />

        <div className="flex gap-2">
          <QuickAdd label="Utstyr" onClick={() => navigate('/add?post=6500')} />
          <QuickAdd label="Mat og drikke" onClick={() => navigate('/add?post=7140')} />
          <QuickAdd label="Kjøring" onClick={() => navigate('/add?type=driving')} />
          <QuickAdd label="Annet" primary onClick={() => navigate('/add')} />
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Laster...</div>
        ) : (
          <>
            {yearEntries.length > 0 && (
              <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Søk i oppføringer (beskrivelse, post, beløp, sted)…"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            )}
            <EntryList entries={filterEntries(yearEntries, search)} expandedId={expandedId} setExpandedId={setExpandedId}
              onDelete={handleDelete} onEdit={e => navigate(`/add?edit=${e.id}`)} getAmount={amountOf}
              emptyText={search ? 'Ingen oppføringer matcher søket.' : undefined} />
          </>
        )}
      </div>
    </>
  )
}

/** Snarvei til ny utgift. Fire på rad, så de er smale: teksten får bryte
 *  framfor å flyte utenfor knappen. «Annet» er blå fordi den er den generelle
 *  inngangen, de tre andre er forhåndsvalgte kategorier. */
function QuickAdd({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) {
  const style = primary
    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
  return (
    <button onClick={onClick}
      className={`flex-1 basis-0 min-w-0 border rounded-xl px-2 py-2.5 text-xs font-medium leading-tight shadow-sm transition ${style}`}>
      {label}
    </button>
  )
}
