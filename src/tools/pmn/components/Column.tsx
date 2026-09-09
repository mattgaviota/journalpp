import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PMNCard } from '../schema'

interface ColumnProps {
  label: string
  emoji: string
  color: string
  cards: PMNCard[]
  onAdd: (text: string) => void
  onDelete: (id: string) => void
}

export default function Column({ label, emoji, color, cards, onAdd, onDelete }: ColumnProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  function submit() {
    const text = input.trim()
    if (!text) return
    onAdd(text)
    setInput('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border overflow-hidden"
         style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <div className="px-4 py-3 flex items-center gap-2 border-b"
           style={{ borderColor: 'var(--color-border)', background: color + '18' }}>
        <span className="text-xl leading-none flex-shrink-0">{emoji}</span>
        <span className="font-semibold text-sm" style={{ color }}>{label}</span>
        {cards.length > 0 && (
          <span className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{ background: color + '22', color }}>
            {cards.length}
          </span>
        )}
      </div>

      <div className="flex-1 p-3 space-y-2 min-h-[120px]">
        {cards.map((card) => (
          <div key={card.id}
            className="flex items-start gap-2 group rounded-xl px-3 py-2 text-sm"
            style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}>
            <span className="flex-1 break-words">{card.text}</span>
            <button onClick={() => onDelete(card.id)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 rounded"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label={t('aria.delete_card')}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {cards.length === 0 && (
          <p className="text-xs px-1" style={{ color: 'var(--color-text-muted)' }}>
            {t('pmn.card_empty_hint')}
          </p>
        )}
      </div>

      <div className="p-3 pt-0 flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey} placeholder={t('pmn.card_placeholder')}
          className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
        <button onClick={submit}
          className="px-3 py-2 rounded-xl text-white flex items-center"
          style={{ background: 'var(--color-primary)' }}
          aria-label={t('aria.add_card')}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
