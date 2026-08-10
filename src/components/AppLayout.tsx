import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'

/** Skallet rundt sidene som deler topp: forsiden og faktura-delen.
 *
 *  Lå før som en <AppHeader /> gjentatt i hver enkelt side, sammen med den
 *  samme ytre div-en tre steder. Nå står den ett sted, og en ny side arver
 *  toppen ved å bli lagt under denne ruta.
 *
 *  Utskriftssidene (årsrapport og fakturavisning) ligger bevisst UTENFOR: de
 *  viser et dokument som skal ut på papir og har sin egen verktøylinje. Det
 *  samme gjelder skjemaet for ny utgift, som er en flyt du går inn i og ut av. */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <AppHeader />
      <Outlet />
    </div>
  )
}
