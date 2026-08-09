import { useState } from 'react'
import { type Category, SYSTEM_POSTS } from '../types'
import { IconPlus, IconTrash } from './icons'

// Redigerbar kontoplan. Brukeren kan omdøpe kategorier og legge til/fjerne egne.
// Systemposter (SYSTEM_POSTS) og poster som har oppføringer kan ikke slettes —
// ellers ville oppføringene mistet gruppering i rapporten. Postnr på eksisterende
// kategorier er låst (endring ville foreldreløst-gjort tidligere oppføringer).
export function CategoryEditor({ categories, usedPosts, onSave }: {
  categories: Category[]
  usedPosts: Set<string>
  onSave: (cats: Category[]) => Promise<void>
}) {
  const [draft, setDraft] = useState<Category[]>(categories)
  const [newPost, setNewPost] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const isError = /^Feil|må|finnes|Fyll/.test(msg)

  const dirty = JSON.stringify(draft) !== JSON.stringify(categories)
  const canDelete = (post: string) => !SYSTEM_POSTS.includes(post) && !usedPosts.has(post)

  function add() {
    const post = newPost.trim().replace(/\s/g, ''), label = newLabel.trim()
    if (!post || !label) { setMsg('Fyll inn både postnr og navn.'); return }
    if (draft.some(c => c.post === post)) { setMsg(`Post ${post} finnes allerede.`); return }
    setDraft(d => [...d, { post, label }]); setNewPost(''); setNewLabel(''); setMsg('')
  }
  async function save() {
    const trimmed = draft.map(c => ({ post: c.post, label: c.label.trim() }))
    if (trimmed.some(c => !c.label)) { setMsg('Alle kategorier må ha et navn.'); return }
    setSaving(true)
    try { await onSave(trimmed); setMsg('Lagret ✓'); setTimeout(() => setMsg(''), 2000) }
    catch (e) { setMsg('Feil: ' + (e instanceof Error ? e.message : String(e))) }
    finally { setSaving(false) }
  }

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs text-slate-400">Omdøp poster eller legg til egne. Systemposter og poster med oppføringer kan ikke slettes.</p>
      <div className="space-y-1.5">
        {draft.map((c, i) => (
          <div key={c.post} className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 w-9 shrink-0">{c.post}</span>
            <input value={c.label} onChange={e => setDraft(d => d.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
              className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={() => setDraft(d => d.filter((_, j) => j !== i))} disabled={!canDelete(c.post)}
              title={canDelete(c.post) ? 'Fjern' : 'Kan ikke slettes (systempost eller har oppføringer)'}
              className="text-slate-300 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-300 shrink-0"><IconTrash /></button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <input value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Postnr" inputMode="numeric"
          className="w-16 border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Nytt kategorinavn"
          className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="button" onClick={add} title="Legg til" className="text-blue-600 hover:text-blue-700 shrink-0"><IconPlus /></button>
      </div>
      {msg && <p className={`text-xs ${isError ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
      <button onClick={save} disabled={saving || !dirty}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm py-2 rounded-lg transition">
        {saving ? 'Lagrer…' : 'Lagre kategorier'}
      </button>
    </div>
  )
}
