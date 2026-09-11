import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToolData } from '../../store/journal'
import type { ToolProps } from '../tool.types'
import gratitudeTool from './index'
import type { GratitudeEntry, GratitudeStore } from './schema'

function randomId() { return Math.random().toString(36).slice(2) }
function todayDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function EntryEditor({ entry, onChange }: { entry: GratitudeEntry; onChange: (e: GratitudeEntry) => void }) {
  const { t } = useTranslation()

  function updateItem(idx: number, value: string) {
    const items = [...entry.items]
    items[idx] = value
    onChange({ ...entry, items })
  }
  function addItem() {
    if (entry.items.length >= 5) return
    onChange({ ...entry, items: [...entry.items, ''] })
  }
  function removeItem(idx: number) {
    if (entry.items.length <= 3) return
    onChange({ ...entry, items: entry.items.filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-3">
      {entry.items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <span className="mt-3 text-sm font-medium w-5 text-center flex-shrink-0"
                style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</span>
          <textarea value={item} onChange={(e) => updateItem(idx, e.target.value)}
            placeholder={t('gratitude.placeholder')}
            className="flex-1 px-3 py-2 rounded-xl border text-sm resize-none outline-none"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            rows={2} />
          {entry.items.length > 3 && (
            <button onClick={() => removeItem(idx)} className="mt-2 p-1.5 rounded-lg"
              style={{ color: 'var(--color-text-muted)' }} aria-label={t('aria.remove_item')}>
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {entry.items.length < 5 && (
        <button onClick={addItem} className="flex items-center gap-1.5 text-sm font-medium ml-7"
          style={{ color: 'var(--color-primary)' }}>
          <Plus className="w-4 h-4" />{t('gratitude.add_another')}
        </button>
      )}
    </div>
  )
}

function PastEntry({ entry }: { entry: GratitudeEntry }) {
  const [open, setOpen] = useState(false)
  const d = new Date(entry.date + 'T12:00:00')
  const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="rounded-xl border overflow-hidden"
         style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
        style={{ color: 'var(--color-text)' }}>
        <span>{label}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {entry.items.map((item, i) => (
            <p key={i} className="text-sm flex gap-2" style={{ color: 'var(--color-text)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>{i + 1}.</span>{item}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default function GratitudePage({ periodKey, onSave }: ToolProps) {
  const { t } = useTranslation()
  const [data, save] = useToolData<GratitudeStore>(gratitudeTool)
  const dateKey = periodKey ?? todayDate()
  const todayEntry = data.entries.find((e) => e.date === dateKey)
  const [draft, setDraft] = useState<GratitudeEntry | null>(null)
  useEffect(() => {
    setDraft(todayEntry ?? { id: randomId(), date: dateKey, items: ['', '', ''] })
  }, [dateKey, todayEntry?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!draft) return
    const withFiltered = { ...draft, items: draft.items }
    const entries = todayEntry
      ? data.entries.map((e) => (e.date === dateKey ? withFiltered : e))
      : [withFiltered, ...data.entries]
    await save({ entries })
  }

  const pastEntries = data.entries
    .filter((e) => e.date !== dateKey)
    .sort((a, b) => b.date.localeCompare(a.date))

  if (!draft) return null

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="rounded-2xl border p-4 space-y-4"
           style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div onBlur={handleSave}>
          <EntryEditor entry={draft} onChange={setDraft} />
        </div>
        <button onClick={async () => { await handleSave(); onSave?.() }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--color-primary)' }}>
          {t('gratitude.btn_save')}
        </button>
      </div>

      {pastEntries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>
            {t('gratitude.past_entries')}
          </h2>
          {pastEntries.map((e) => <PastEntry key={e.id} entry={e} />)}
        </div>
      )}
    </div>
  )
}
