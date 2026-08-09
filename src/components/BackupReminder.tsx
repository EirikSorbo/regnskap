/** Banner som minner om backup. Eskalerer fra gult til rødt når det er lenge
 *  siden, eller aldri er tatt en. Bilagene er den eneste sikringen brukeren har,
 *  så dette skal være påtrengende. */
export function BackupReminder({ lastBackupAt, busy, onBackup }: {
  lastBackupAt?: number
  busy: boolean
  onBackup: () => void
}) {
  // Date.now() i render er trygt her: banneret trenger bare et omtrentlig «dager
  // siden backup», og verdien inngår ikke i noen memo eller likhetssjekk.
  // eslint-disable-next-line react-hooks/purity
  const daysSince = lastBackupAt ? Math.floor((Date.now() - lastBackupAt) / (1000 * 60 * 60 * 24)) : null
  if (daysSince !== null && daysSince < 30) return null

  const urgent = daysSince === null || daysSince >= 60
  const c = urgent
    ? { box: 'bg-red-50 border-red-200', title: 'text-red-800', sub: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700' }
    : { box: 'bg-amber-50 border-amber-200', title: 'text-amber-800', sub: 'text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700' }

  return (
    <div className={`${c.box} border rounded-xl px-4 py-3 flex items-center justify-between gap-3`}>
      <div className="min-w-0">
        <p className={`text-sm font-medium ${c.title}`}>
          {daysSince !== null ? `${daysSince} dager siden siste backup` : 'Ingen backup registrert'}
        </p>
        <p className={`text-xs ${c.sub} mt-0.5`}>
          {urgent ? 'Ta en full backup nå. Bilagene er din eneste sikring.' : 'Anbefalt: månedlig full backup'}
        </p>
      </div>
      <button onClick={onBackup} disabled={busy}
        className={`shrink-0 ${c.btn} disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-lg transition`}>
        {busy ? 'Laster…' : 'Backup nå'}
      </button>
    </div>
  )
}
