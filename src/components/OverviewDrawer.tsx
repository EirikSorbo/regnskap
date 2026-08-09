import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { readBackupFile, runImport, describeParsedBackup, type ParsedBackup } from '../lib/backup'
import { Drawer } from './Modal'
import { IconUpload } from './icons'

/** Oversiktsskuffen: inngangene til rapport, vedlegg og backup, pluss import.
 *  Importen bor her fordi den er en skjermflyt (les fil → vis hva som ble
 *  funnet → velg metode); selve skrivingen ligger i lib/backup. */
export function OverviewDrawer({ selectedYear, attachmentCount, onOpenResult, onOpenChart, onOpenReport, onOpenReceipts, onOpenBackup, onClose }: {
  selectedYear: number
  attachmentCount: number
  onOpenResult: () => void
  onOpenChart: () => void
  onOpenReport: () => void
  onOpenReceipts: () => void
  onOpenBackup: () => void
  onClose: () => void
}) {
  const { user } = useAuth()
  const { updateSettings } = useSettings()
  const [status, setStatus] = useState('')
  const [pending, setPending] = useState<ParsedBackup | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    e.target.value = ''
    setStatus('Leser fil...')
    try {
      const parsed = await readBackupFile(file)
      setStatus(describeParsedBackup(parsed, user.uid))
      setPending(parsed)
    } catch (err) {
      setStatus('Feil: ' + (err instanceof Error ? err.message : String(err)))
      setPending(null)
    }
  }

  async function execute(mode: 'merge' | 'restore') {
    if (!user || !pending) return
    const parsed = pending
    setPending(null)
    try {
      setStatus(await runImport({
        uid: user.uid, parsed, mode,
        onStatus: setStatus,
        applySettings: updateSettings,
      }))
    } catch (err) {
      setStatus('Feil: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  function close() {
    setStatus(''); setPending(null); onClose()
  }

  return (
    <Drawer title="Oversikt" onClose={close} contentClass="space-y-4">
      <button onClick={onOpenResult}
        className="w-full flex items-center justify-between text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-3 transition">
        <span>Oversikt {selectedYear}</span>
        <span className="text-white/70 text-base">→</span>
      </button>

      <button onClick={onOpenChart}
        className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition">
        <span>Inntekter og kostnader</span>
        <span className="text-slate-400 text-xs font-normal">Graf →</span>
      </button>

      <button onClick={onOpenReport}
        className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition">
        <span>Årsrapport {selectedYear}</span>
        <span className="text-slate-400 text-xs font-normal">PDF →</span>
      </button>

      <button onClick={onOpenReceipts}
        className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition">
        <span>Kvitteringer</span>
        <span className="text-slate-400 text-xs font-normal">{attachmentCount} vedlegg →</span>
      </button>

      <div className="border-t border-slate-100 pt-4">
        <button onClick={onOpenBackup}
          className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition">
          <span>Backup &amp; nedlasting</span>
          <span className="text-slate-400 text-base">→</span>
        </button>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Import</p>
        <p className="text-xs text-slate-400 mb-3">Importer en tidligere backup-fil (JSON eller ZIP).</p>
        <label className="w-full flex items-center gap-2 text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer">
          <IconUpload />
          <span>Velg backup-fil</span>
          <input type="file" accept=".json,.zip,application/json,application/zip" className="hidden" onChange={handleFile} />
        </label>
        {status && (
          <p className={`text-xs mt-2 px-1 ${status.startsWith('✓') ? 'text-green-600' : status.startsWith('Feil') ? 'text-red-500' : 'text-slate-400'}`}>
            {status}
          </p>
        )}
        {pending && (
          <div className="flex gap-2 mt-3">
            <button onClick={() => execute('merge')}
              className="flex-1 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition">
              Slå sammen
            </button>
            <button onClick={() => { if (confirm('Dette sletter ALL eksisterende data og erstatter med backup. Er du sikker?')) execute('restore') }}
              className="flex-1 text-sm font-medium text-red-600 border border-red-300 rounded-lg px-3 py-2.5 hover:bg-red-50 transition">
              Gjenopprett
            </button>
          </div>
        )}
      </div>
    </Drawer>
  )
}
