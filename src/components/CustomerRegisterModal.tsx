import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCustomers } from '../hooks/useInvoices'
import { type Customer, type InvoiceCustomer, addressLines, toInvoiceCustomer } from '../lib/invoice'
import { addCustomer, updateCustomer, deleteCustomer } from '../lib/customers'
import { ModalShell } from './Modal'
import { CustomerFields } from './CustomerFields'
import { IconPencil, IconPlus, IconTrash } from './icons'

/** Kunderegisteret: liste og redigering. */
export function CustomerRegisterModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const { customers, loading, error } = useCustomers(user)
  const [editing, setEditing] = useState<Customer | 'ny' | null>(null)

  if (editing) {
    return <CustomerEditor customer={editing === 'ny' ? null : editing} onDone={() => setEditing(null)} onClose={onClose} />
  }

  return (
    <ModalShell title="Kunderegister" onClose={onClose}>
      <div className="px-5 py-4 space-y-3">
        <button onClick={() => setEditing('ny')}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition">
          <IconPlus /> Ny kunde
        </button>

        {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Laster...</p>
        ) : customers.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Ingen kunder ennå. Kunder havner også her når du skriver dem inn på en faktura.</p>
        ) : (
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400">{customers.length} kunder</p>
            {customers.map(c => (
              <div key={c.id} className="flex items-start gap-2 border border-slate-200 rounded-lg px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400 truncate">{addressLines(c).join(', ') || c.email || '—'}</p>
                </div>
                <button onClick={() => setEditing(c)} title="Rediger" className="text-slate-300 hover:text-slate-600 shrink-0"><IconPencil /></button>
                <button onClick={async () => {
                  if (!c.id || !confirm(`Slett ${c.name} fra registeret?\n\nFakturaer som allerede er utstedt beholder kundeopplysningene sine.`)) return
                  try { await deleteCustomer(c.id) } catch (e) { alert('Kunne ikke slette: ' + (e instanceof Error ? e.message : String(e))) }
                }} title="Slett" className="text-slate-300 hover:text-red-400 shrink-0"><IconTrash /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  )
}

function CustomerEditor({ customer, onDone, onClose }: {
  customer: Customer | null
  onDone: () => void
  onClose: () => void
}) {
  const { user } = useAuth()
  const [value, setValue] = useState<InvoiceCustomer>(
    () => customer ? toInvoiceCustomer(customer) : { name: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (!user || !value.name.trim()) { setError('Kunden må ha et navn.'); return }
    setSaving(true); setError('')
    try {
      if (customer?.id) await updateCustomer(customer.id, value)
      else await addCustomer(user.uid, value)
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setSaving(false) }
  }

  return (
    <ModalShell
      title={customer ? 'Rediger kunde' : 'Ny kunde'}
      onClose={onClose}
      footer={
        <div className="px-5 pb-5 pt-3 flex gap-2">
          <button onClick={onDone} className="flex-1 border border-slate-300 text-slate-700 text-sm py-2.5 rounded-lg hover:bg-slate-50">Avbryt</button>
          <button onClick={save} disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold py-2.5 rounded-lg">
            {saving ? 'Lagrer...' : 'Lagre'}
          </button>
        </div>
      }
    >
      <div className="px-5 py-4 space-y-3">
        <CustomerFields value={value} onChange={setValue} customers={[]} saveToRegister={false} onToggleSave={() => {}} />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </ModalShell>
  )
}
