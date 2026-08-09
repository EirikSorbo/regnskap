import { type Customer, type InvoiceCustomer, toInvoiceCustomer } from '../lib/invoice'

const inp = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

/** Kunden på fakturaen. Du kan hente en fra registeret og så rette den for
 *  denne ene fakturaen: det som lagres på fakturaen er en frossen kopi, så
 *  registeret endres ikke av at du retter her. */
export function CustomerFields({ value, onChange, customers, saveToRegister, onToggleSave }: {
  value: InvoiceCustomer
  onChange: (c: InvoiceCustomer) => void
  customers: Customer[]
  saveToRegister: boolean
  onToggleSave: (v: boolean) => void
}) {
  const set = (patch: Partial<InvoiceCustomer>) => onChange({ ...value, ...patch })
  const known = customers.find(c => c.name === value.name && (c.postalCode ?? '') === (value.postalCode ?? ''))

  function pick(id: string) {
    const c = customers.find(x => x.id === id)
    if (c) onChange(toInvoiceCustomer(c))
  }

  return (
    <div className="space-y-3">
      {customers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hent fra kunderegisteret</label>
          <select value={known?.id ?? ''} onChange={e => pick(e.target.value)} className={`${inp} bg-white`}>
            <option value="">Velg kunde …</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.city ? ` — ${c.city}` : ''}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Kundenavn</label>
        <input value={value.name} onChange={e => set({ name: e.target.value })} required
          className={inp} placeholder="Navn eller foretak" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input value={value.address ?? ''} onChange={e => set({ address: e.target.value })}
          className={`col-span-2 ${inp}`} placeholder="Adresse" />
        <input value={value.address2 ?? ''} onChange={e => set({ address2: e.target.value })}
          className={`col-span-2 ${inp}`} placeholder="Adresse 2 (valgfritt)" />
        <input value={value.postalCode ?? ''} onChange={e => set({ postalCode: e.target.value })}
          className={inp} placeholder="Postnr" inputMode="numeric" />
        <input value={value.city ?? ''} onChange={e => set({ city: e.target.value })}
          className={inp} placeholder="Sted" />
        <input value={value.email ?? ''} onChange={e => set({ email: e.target.value })}
          className={inp} placeholder="E-post" type="email" />
        <input value={value.orgNumber ?? ''} onChange={e => set({ orgNumber: e.target.value })}
          className={inp} placeholder="Org.nr (valgfritt)" inputMode="numeric" />
      </div>

      {!known && value.name.trim() !== '' && (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={saveToRegister} onChange={e => onToggleSave(e.target.checked)}
            className="rounded border-slate-300" />
          Lagre denne kunden i registeret
        </label>
      )}
    </div>
  )
}
