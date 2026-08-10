import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import {
  type Entry, type ReceiptEntry, type DrivingEntry,
  CATEGORIES, SETTINGS_MANAGED_POSTS, entryAmount, filterEntries, postSums, getImageUrls,
} from '../types'
import { useAccountingData } from '../hooks/useAccountingData'
import { useMigrations } from '../hooks/useMigrations'
import { deleteEntry } from '../lib/entries'
import { downloadJsonBackup, downloadAttachmentZip, downloadFullBackup, downloadCsv } from '../lib/backup'
import { kr } from '../lib/format'
import { EntryList } from '../components/EntryList'
import { SettingsDrawer } from '../components/SettingsDrawer'
import { OverviewDrawer } from '../components/OverviewDrawer'
import { BackupModal } from '../components/BackupModal'
import { BackupReminder } from '../components/BackupReminder'
import { EkomModal } from '../components/EkomModal'
import { DrivingModal } from '../components/DrivingModal'
import { ResultModal } from '../components/ResultModal'
import { ReceiptListModal } from '../components/ReceiptListModal'
import { YearChartModal } from '../components/YearChartModal'
import { IconCar, IconGear, IconInvoice, IconOverview, IconPhone } from '../components/icons'

const YEAR_KEY = 'selected_year'
const VERSION = 'v1.64'

// De to lagene over forsiden. Erstatter sju uavhengige boolske flagg. Skuff og
// modal er skilt fordi modalene åpnes OPPÅ oversiktsskuffen: lukker du modalen,
// skal du tilbake til skuffen, ikke helt ut.
type DrawerName = 'settings' | 'overview' | null
type ModalName = 'ekom' | 'driving' | 'result' | 'receipts' | 'backup' | 'chart' | null

export default function DashboardPage() {
  const { user } = useAuth()
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()

  const { entries, incomeEntries, loading } = useAccountingData(user)
  useMigrations(user, settings, updateSettings)

  const [selectedYear, setSelectedYear] = useState(() =>
    parseInt(localStorage.getItem(YEAR_KEY) || String(new Date().getFullYear())))
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [drawer, setDrawer] = useState<DrawerName>(null)
  const [modal, setModal] = useState<ModalName>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { localStorage.setItem(YEAR_KEY, String(selectedYear)) }, [selectedYear])

  const categories = settings.categories ?? CATEGORIES
  const amountOf = (e: Entry) =>
    entryAmount(e, settings.drivingRatePerKm, settings.drivingRatePerPassengerKm)

  // Kvitteringer for året, UTEN de settings-styrte postene (EKOM/hjemmekontor/
  // avskrivninger). Deres årsbeløp beregnes fra innstillinger, så eventuelle
  // gjenværende skyggedokumenter verken vises i lista eller telles dobbelt.
  const yearEntries = entries.filter(e =>
    e.date.startsWith(String(selectedYear)) && !SETTINGS_MANAGED_POSTS.includes(e.category.post))
  const yearIncome = incomeEntries.filter(e => e.date.startsWith(String(selectedYear)))

  const groups = postSums(categories, yearEntries, settings, selectedYear, amountOf)
  const totalExpenses = groups.reduce((s, g) => s + g.sum, 0)
  // Årsbeløpene som ikke har en måned (EKOM, hjemmekontor, avskrivninger).
  // Grafen trenger dem for seg, siden de ikke kan tegnes som søyler.
  const managedExpenses = groups.filter(g => g.managed).reduce((s, g) => s + g.sum, 0)
  const totalIncome = yearIncome.reduce((s, e) => s + e.amount, 0)

  const trips = yearEntries.filter(e => e.entryType === 'driving') as DrivingEntry[]
  const totalKm = trips.reduce((s, d) => s + (d.tripType === 'return' ? d.distance * 2 : d.distance), 0)

  const currentYear = new Date().getFullYear()
  const years = [...new Set([
    ...entries.map(e => parseInt(e.date.slice(0, 4))),
    ...incomeEntries.map(e => parseInt(e.date.slice(0, 4))),
    currentYear, currentYear - 1, currentYear - 2, selectedYear,
  ])].filter(Number.isFinite).sort((a, b) => b - a)

  async function handleDelete(entry: Entry) {
    if (!confirm('Slett denne oppføringen?')) return
    try { await deleteEntry(entry) } catch (e) { console.error(e) }
  }

  /** Kjører en nedlasting med opptatt-flagg og én felles feilmelding, slik at en
   *  feilet backup aldri etterlater knappene låst. */
  async function run(fn: () => Promise<void>) {
    if (!user || busy) return
    setBusy(true)
    try { await fn() }
    catch (err) { alert('Feil: ' + (err instanceof Error ? err.message : String(err))) }
    finally { setBusy(false) }
  }

  const handleBackup = (year?: number) => run(() => downloadJsonBackup(user!.uid, settings, categories, year))

  const handleZip = (year?: number) => run(async () => {
    const res = await downloadAttachmentZip(user!.uid, categories, year)
    if (!res) { alert('Ingen vedlegg funnet.'); return }
    if (res.added === 0) alert(`Ingen filer lastet ned.\n\nFeil:\n${res.errors.join('\n')}`)
    else if (res.errors.length) alert(`${res.added} lastet ned. ${res.errors.length} feilet:\n${res.errors.join('\n')}`)
  })

  const handleFullBackup = (year?: number) => run(async () => {
    const res = await downloadFullBackup(user!.uid, settings, categories, year)
    if (res.errors.length) alert(`${res.added} vedlegg lastet ned. ${res.errors.length} feilet:\n${res.errors.join('\n')}`)
    await updateSettings({ lastBackupAt: Date.now() })
  })

  function handleCsv(year?: number) {
    const list = entries
      .filter(e => (!year || e.date.startsWith(String(year))) && !SETTINGS_MANAGED_POSTS.includes(e.category.post))
      .sort((a, b) => a.date.localeCompare(b.date))
    if (!list.length) { alert('Ingen utgiftsoppføringer å eksportere.'); return }
    downloadCsv(list, amountOf, year)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-800">Sørbø Musikk</h1>
            <p className="text-xs text-slate-400">{user?.email} <span className="text-slate-300">{VERSION}</span></p>
          </div>
          <div className="flex items-center gap-1">
            <HeaderButton title="Fakturaer" onClick={() => navigate('/fakturaer')}><IconInvoice /></HeaderButton>
            <HeaderButton title="Kjøring" onClick={() => setModal('driving')}><IconCar /></HeaderButton>
            <HeaderButton title="EKOM-kalkulator" onClick={() => setModal('ekom')}><IconPhone /></HeaderButton>
            <HeaderButton title="Oversikt" onClick={() => setDrawer('overview')}><IconOverview /></HeaderButton>
            <HeaderButton title="Innstillinger" onClick={() => setDrawer('settings')}><IconGear /></HeaderButton>
          </div>
        </div>
      </header>

      {drawer === 'settings' && (
        <SettingsDrawer
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          years={years}
          yearIncome={yearIncome}
          usedPosts={new Set(entries.map(e => e.category.post))}
          onClose={() => setDrawer(null)}
        />
      )}

      {drawer === 'overview' && (
        <OverviewDrawer
          selectedYear={selectedYear}
          attachmentCount={entries.reduce((s, e) =>
            s + (e.entryType === 'receipt' ? getImageUrls(e as ReceiptEntry).length : 0), 0)}
          onOpenResult={() => setModal('result')}
          onOpenChart={() => setModal('chart')}
          onOpenReport={() => { setDrawer(null); navigate(`/rapport?year=${selectedYear}`) }}
          onOpenReceipts={() => setModal('receipts')}
          onOpenBackup={() => setModal('backup')}
          onClose={() => setDrawer(null)}
        />
      )}

      {modal === 'ekom' && user && (
        <EkomModal year={selectedYear} onClose={() => setModal(null)} />
      )}

      {modal === 'backup' && (
        <BackupModal
          years={years}
          busy={busy}
          onBackup={handleBackup}
          onZip={handleZip}
          onFullBackup={handleFullBackup}
          onCsv={handleCsv}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'driving' && (
        <DrivingModal
          year={selectedYear}
          entries={yearEntries}
          getAmount={amountOf}
          onAdd={() => { setModal(null); navigate('/add?type=driving') }}
          onEdit={d => { setModal(null); navigate(`/add?edit=${d.id}`) }}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'result' && (
        <ResultModal
          year={selectedYear}
          groups={groups}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          entryCount={yearEntries.length}
          tripCount={trips.length}
          totalKm={totalKm}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'receipts' && (
        <ReceiptListModal entries={entries} onClose={() => setModal(null)} />
      )}

      {modal === 'chart' && (
        <YearChartModal
          year={selectedYear}
          entries={yearEntries}
          incomeEntries={yearIncome}
          amountOf={amountOf}
          managedExpenses={managedExpenses}
          onClose={() => setModal(null)}
        />
      )}

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

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

        <BackupReminder lastBackupAt={settings.lastBackupAt} busy={busy} onBackup={() => handleFullBackup()} />

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
    </div>
  )
}

function HeaderButton({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition">
      {children}
    </button>
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
