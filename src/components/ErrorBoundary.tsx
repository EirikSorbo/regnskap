import { Component, type ReactNode } from 'react'

/** Feilgrense rundt hele appen.
 *
 *  Uten denne gir enhver feil under rendring en helt blank side, uten et ord om
 *  hva som skjedde. Det er den verste utgangen for en app som holder regnskapet
 *  ditt: du vet ikke om dataene er borte eller om det bare er skjermen som
 *  streiket. (De er ikke borte. Ingenting her rører Firestore.)
 *
 *  Må være en klassekomponent. React tilbyr ingen hook-variant av
 *  componentDidCatch. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('Ufanget feil i grensesnittet:', error, info)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md space-y-4">
          <h1 className="text-lg font-bold text-slate-800">Noe gikk galt i visningen</h1>
          <p className="text-sm text-slate-600">
            Regnskapet ditt er trygt. Dette er en feil i skjermbildet, ikke i dataene:
            ingenting ble endret eller slettet.
          </p>
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono break-words">
            {error.message || String(error)}
          </p>
          <div className="flex gap-2">
            <button onClick={() => { this.setState({ error: null }) }}
              className="flex-1 border border-slate-300 text-slate-700 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50">
              Prøv igjen
            </button>
            <button onClick={() => { window.location.href = import.meta.env.BASE_URL }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg">
              Til forsiden
            </button>
          </div>
        </div>
      </div>
    )
  }
}
