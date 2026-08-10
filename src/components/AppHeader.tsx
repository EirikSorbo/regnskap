import { useLocation, useNavigate } from 'react-router-dom'
import { usePanels } from '../context/PanelsContext'
import { IconGear, IconReport } from './icons'

export const VERSION = 'v1.87'

/** Toppen, lik på alle sidene den brukes: de to hovedfanene til venstre,
 *  rapportering og innstillinger som symboler til høyre.
 *
 *  Fanene er ruter, symbolene er paneler. Panelene ligger i PanelsContext, over
 *  rutene, nettopp for at de to symbolene skal virke likt uansett hvilken fane
 *  du står i.
 *
 *  Utskriftssidene (årsrapport og fakturavisning) har fortsatt sin egen
 *  verktøylinje. De viser et dokument som skal ut på papir, ikke en skjerm du
 *  navigerer i. */
export function AppHeader() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { openPanel } = usePanels()

  const onInvoices = pathname.startsWith('/faktura')

  return (
    <header className="bg-white border-b border-slate-200 px-4 pt-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-slate-800">
            Sørbø Musikk <span className="text-xs font-normal text-slate-300 align-middle">{VERSION}</span>
          </h1>
          <div className="flex items-center gap-1">
            <HeaderButton title="Rapportering" onClick={() => openPanel('overview')}><IconReport /></HeaderButton>
            <HeaderButton title="Innstillinger" onClick={() => openPanel('settings')}><IconGear /></HeaderButton>
          </div>
        </div>

        <nav className="flex gap-6 -mb-px mt-3">
          <Tab label="Regnskap" active={!onInvoices} onClick={() => navigate('/')} />
          <Tab label="Fakturering" active={onInvoices} onClick={() => navigate('/fakturaer')} />
        </nav>
      </div>
    </header>
  )
}

/** Fanen markeres med en strek som ligger oppå kanten under headeren, så den
 *  aktive fanen henger sammen med innholdet under. Fanene har ingen sideluft:
 *  da starter den første streken i samme kant som foretaksnavnet over. */
function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-current={active ? 'page' : undefined}
      className={`pb-2.5 text-sm font-semibold border-b-2 transition ${
        active
          ? 'border-blue-600 text-blue-700'
          : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200'
      }`}>
      {label}
    </button>
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
