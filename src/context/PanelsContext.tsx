import { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useSettings } from './SettingsContext'
import { useAccounting } from './AccountingContext'
import { SETTINGS_MANAGED_POSTS } from '../types'
import { downloadJsonBackup, downloadAttachmentZip, downloadFullBackup, downloadCsv } from '../lib/backup'
import { SettingsDrawer } from '../components/SettingsDrawer'
import { OverviewDrawer } from '../components/OverviewDrawer'
import { BackupModal } from '../components/BackupModal'
import { EkomModal } from '../components/EkomModal'
import { ResultModal } from '../components/ResultModal'
import { ReceiptListModal } from '../components/ReceiptListModal'
import { YearChartModal } from '../components/YearChartModal'

/** Skuffene og modalene som ligger over sidene, med staten som styrer dem.
 *
 *  Lå før i dashbordet. De var derfor låst til forsiden: sto du i faktura-delen,
 *  fantes de ikke. Nå henger de over rutene, slik at samme topp kan åpne dem
 *  uansett hvor du er.
 *
 *  Skuff og modal er fortsatt to atskilte tilstander, fordi modalene åpnes OPPÅ
 *  oversiktsskuffen: lukker du modalen, skal du tilbake til skuffen, ikke helt
 *  ut. */
type DrawerName = 'settings' | 'overview'
type ModalName = 'ekom' | 'result' | 'receipts' | 'backup' | 'chart'
export type PanelName = DrawerName | ModalName

interface PanelsContextType {
  openPanel: (name: PanelName) => void
  /** Sann mens en nedlasting pågår, slik at knappene som starter en kan låses. */
  busy: boolean
  runFullBackup: (year?: number) => void
}

const PanelsContext = createContext<PanelsContextType | null>(null)

const DRAWERS: PanelName[] = ['settings', 'overview']

export function PanelsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { settings, updateSettings } = useSettings()
  const acc = useAccounting()
  const navigate = useNavigate()

  const [drawer, setDrawer] = useState<DrawerName | null>(null)
  const [modal, setModal] = useState<ModalName | null>(null)
  const [busy, setBusy] = useState(false)

  const openPanel = (name: PanelName) => {
    if (DRAWERS.includes(name)) setDrawer(name as DrawerName)
    else setModal(name as ModalName)
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

  const handleBackup = (year?: number) =>
    run(() => downloadJsonBackup(user!.uid, settings, acc.categories, year))

  const handleZip = (year?: number) => run(async () => {
    const res = await downloadAttachmentZip(user!.uid, acc.categories, year)
    if (!res) { alert('Ingen vedlegg funnet.'); return }
    if (res.added === 0) alert(`Ingen filer lastet ned.\n\nFeil:\n${res.errors.join('\n')}`)
    else if (res.errors.length) alert(`${res.added} lastet ned. ${res.errors.length} feilet:\n${res.errors.join('\n')}`)
  })

  const handleFullBackup = (year?: number) => run(async () => {
    const res = await downloadFullBackup(user!.uid, settings, acc.categories, year)
    if (res.errors.length) alert(`${res.added} vedlegg lastet ned. ${res.errors.length} feilet:\n${res.errors.join('\n')}`)
    await updateSettings({ lastBackupAt: Date.now() })
  })

  function handleCsv(year?: number) {
    const list = acc.entries
      .filter(e => (!year || e.date.startsWith(String(year))) && !SETTINGS_MANAGED_POSTS.includes(e.category.post))
      .sort((a, b) => a.date.localeCompare(b.date))
    if (!list.length) { alert('Ingen utgiftsoppføringer å eksportere.'); return }
    downloadCsv(list, acc.amountOf, year)
  }

  return (
    <PanelsContext.Provider value={{ openPanel, busy, runFullBackup: handleFullBackup }}>
      {children}

      {drawer === 'settings' && (
        <SettingsDrawer
          selectedYear={acc.selectedYear}
          setSelectedYear={acc.setSelectedYear}
          years={acc.years}
          usedPosts={acc.usedPosts}
          onClose={() => setDrawer(null)}
        />
      )}

      {drawer === 'overview' && (
        <OverviewDrawer
          selectedYear={acc.selectedYear}
          attachmentCount={acc.attachmentCount}
          onOpenResult={() => setModal('result')}
          onOpenChart={() => setModal('chart')}
          onOpenReport={() => { setDrawer(null); navigate(`/rapport?year=${acc.selectedYear}`) }}
          onOpenReceipts={() => setModal('receipts')}
          onOpenBackup={() => setModal('backup')}
          onClose={() => setDrawer(null)}
        />
      )}

      {modal === 'ekom' && user && (
        <EkomModal year={acc.selectedYear} onClose={() => setModal(null)} />
      )}

      {modal === 'backup' && (
        <BackupModal
          years={acc.years}
          busy={busy}
          onBackup={handleBackup}
          onZip={handleZip}
          onFullBackup={handleFullBackup}
          onCsv={handleCsv}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'result' && (
        <ResultModal
          year={acc.selectedYear}
          groups={acc.groups}
          totalIncome={acc.totalIncome}
          totalExpenses={acc.totalExpenses}
          entryCount={acc.yearEntries.length}
          tripCount={acc.trips.length}
          totalKm={acc.totalKm}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'receipts' && (
        <ReceiptListModal entries={acc.entries} onClose={() => setModal(null)} />
      )}

      {modal === 'chart' && (
        <YearChartModal
          year={acc.selectedYear}
          entries={acc.yearEntries}
          incomeEntries={acc.yearIncome}
          amountOf={acc.amountOf}
          managedExpenses={acc.managedExpenses}
          onClose={() => setModal(null)}
        />
      )}
    </PanelsContext.Provider>
  )
}

export function usePanels() {
  const ctx = useContext(PanelsContext)
  if (!ctx) throw new Error('usePanels må brukes innenfor PanelsProvider')
  return ctx
}
