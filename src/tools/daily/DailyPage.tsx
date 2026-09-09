import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSaveConfirmation } from '../../hooks/useSaveConfirmation'
import { useToolData } from '../../store/journal'
import type { ToolProps } from '../tool.types'
import dailyTool from './index'
import type { DailyEntry, DailyStore } from './schema'

function randomId() { return Math.random().toString(36).slice(2) }
function todayDate() { return new Date().toISOString().slice(0, 10) }

function PastEntry({ entry }: { entry: DailyEntry }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const d = new Date(entry.date + 'T12:00:00')
  const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  const preview = entry.content.trim().slice(0, 80) + (entry.content.length > 80 ? '…' : '')

  return (
    <div className="rounded-xl border overflow-hidden"
         style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <button onClick={() => setOpen(!open)} className="w-full text-left px-4 py-3"
        style={{ color: 'var(--color-text)' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{open ? '▲' : '▼'}</span>
        </div>
        {!open && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
            {preview || t('daily.no_content')}
          </p>
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-sm whitespace-pre-wrap mt-3" style={{ color: 'var(--color-text)' }}>
            {entry.content || <span style={{ color: 'var(--color-text-muted)' }}>{t('daily.empty_entry')}</span>}
          </p>
        </div>
      )}
    </div>
  )
}

export default function DailyPage({ periodKey }: ToolProps) {
  const { t } = useTranslation()
  const [data, save] = useToolData<DailyStore>(dailyTool)
  const dateKey = periodKey ?? todayDate()
  const todayEntry = data.entries.find((e) => e.date === dateKey)
  const [content, setContent] = useState('')
  const { saved, withConfirmation } = useSaveConfirmation()

  useEffect(() => {
    setContent(todayEntry?.content ?? '')
  }, [dateKey, todayEntry?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    const id = todayEntry?.id ?? randomId()
    const newEntry: DailyEntry = { id, date: dateKey, content }
    const entries = todayEntry
      ? data.entries.map((e) => (e.date === dateKey ? newEntry : e))
      : [newEntry, ...data.entries]
    await save({ entries })
  }

  const pastEntries = data.entries
    .filter((e) => e.date !== dateKey)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="rounded-2xl border p-4"
           style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} onBlur={handleSave}
          placeholder={t('daily.placeholder')}
          className="w-full text-sm outline-none resize-none bg-transparent"
          style={{ color: 'var(--color-text)', minHeight: '160px' }} />
        <button onClick={() => withConfirmation(handleSave)}
          className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{
            background: saved ? 'var(--color-success)' : 'var(--color-primary)',
            transition: 'background-color 250ms ease',
          }}>
          {saved ? <><Check className="w-4 h-4" />{t('common.saved')}</> : t('daily.btn_save')}
        </button>
      </div>

      {pastEntries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>
            {t('daily.past_entries')}
          </h2>
          {pastEntries.map((e) => <PastEntry key={e.id} entry={e} />)}
        </div>
      )}
    </div>
  )
}
