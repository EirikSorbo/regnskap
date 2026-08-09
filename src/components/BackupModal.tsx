import { useState } from 'react'
import { ModalShell } from './Modal'
import { IconOverview, IconUpload } from './icons'

/** Valg av år + hva som skal lastes ned. Selve nedlastingen skjer i lib/backup. */
export function BackupModal({ years, busy, onBackup, onZip, onFullBackup, onCsv, onClose }: {
  years: number[]
  busy: boolean
  onBackup: (year?: number) => void
  onZip: (year?: number) => void
  onFullBackup: (year?: number) => void
  onCsv: (year?: number) => void
  onClose: () => void
}) {
  const [backupYear, setBackupYear] = useState<number | 'alle'>('alle')
  const y = backupYear === 'alle' ? undefined : backupYear
  const suffix = backupYear !== 'alle' ? ` for ${backupYear}` : ''

  return (
    <ModalShell title="Backup & nedlasting" onClose={onClose}>
      <div className="px-5 py-5 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">År</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setBackupYear('alle')}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${backupYear === 'alle' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              Alle år
            </button>
            {years.map(yr => (
              <button key={yr} onClick={() => setBackupYear(yr)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${backupYear === yr ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                {yr}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Last ned</p>

          <Choice icon={<IconUpload />} title="Data (JSON)"
            sub={`Alle oppføringer og inntekter${backupYear !== 'alle' ? suffix : ' + innstillinger'}`}
            onClick={() => onBackup(y)} />

          <Choice icon={<IconOverview />} title={busy ? 'Laster ned...' : 'Filer (ZIP)'}
            sub={`Alle kvitteringsvedlegg${suffix}`} disabled={busy} onClick={() => onZip(y)} />

          <Choice icon={<IconUpload />} title="Utgifter (CSV)"
            sub={`Regneark for regnskapsfører${suffix}`} onClick={() => onCsv(y)} />

          <button onClick={() => onFullBackup(y)} disabled={busy}
            className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl px-4 py-3 transition text-left">
            <IconOverview />
            <div>
              <p className="text-sm font-medium">Full backup (JSON + ZIP)</p>
              <p className="text-xs text-white/60">Data og filer{suffix}</p>
            </div>
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

function Choice({ icon, title, sub, onClick, disabled }: {
  icon: React.ReactNode
  title: string
  sub: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 disabled:opacity-50 transition text-left">
      {icon}
      <div>
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </button>
  )
}
