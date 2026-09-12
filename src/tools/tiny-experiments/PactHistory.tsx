import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Pact } from './schema'
import { getPactStats } from './schema'

interface Props {
  pacts: Pact[] // only non-active pacts
  hasActivePact: boolean
  onResume?: (pactId: string) => void
}

function OutcomeBadge({ outcome }: { outcome: Pact['outcome'] }) {
  const { t } = useTranslation()
  const label =
    outcome === 'paused'
      ? t('tiny_experiments.outcome_paused')
      : outcome === 'pivoted'
        ? t('tiny_experiments.outcome_pivoted')
        : t('tiny_experiments.outcome_completed')

  const color =
    outcome === 'paused'
      ? 'var(--color-text-muted)'
      : outcome === 'pivoted'
        ? 'var(--color-primary)'
        : 'var(--color-success)'

  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ color, background: 'var(--color-bg-secondary)', border: `1px solid ${color}` }}
    >
      {label}
    </span>
  )
}

function PastPactRow({
  pact,
  allPacts,
  canResume,
  onResume,
}: {
  pact: Pact
  allPacts: Pact[]
  canResume: boolean
  onResume?: (id: string) => void
}) {
  const { t, i18n } = useTranslation()
  const stats = getPactStats(pact)
  const pct = stats.total > 0 ? Math.round((stats.accomplished / stats.total) * 100) : 0
  const locale = i18n.language

  const parentPact = pact.parentId ? allPacts.find(p => p.id === pact.parentId) : null

  function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(
      new Date(dateStr + 'T00:00:00')
    )
  }

  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
            {t('tiny_experiments.i_will')} {pact.action}
          </p>
          {parentPact && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              ↳ {t('tiny_experiments.pivoted_from', { action: parentPact.action })}
            </p>
          )}
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {formatDate(pact.startDate)} → {formatDate(pact.endDate)}
          </p>
        </div>
        <OutcomeBadge outcome={pact.outcome} />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>{stats.accomplished}/{stats.total} {t('tiny_experiments.legend_done').toLowerCase()}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: 'var(--color-success)' }}
          />
        </div>
      </div>

      {/* Resume button — only for paused pacts whose end date hasn't passed */}
      {canResume && pact.status === 'paused' && (
        <button
          onClick={() => onResume?.(pact.id)}
          className="w-full py-2 rounded-lg text-xs font-semibold mt-1"
          style={{ background: 'var(--color-primary)', color: 'white' }}
        >
          {t('tiny_experiments.btn_resume')}
        </button>
      )}
    </div>
  )
}

export default function PactHistory({ pacts, hasActivePact, onResume }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  if (pacts.length === 0) return null

  const today = new Date().toLocaleDateString('en-CA')

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full text-left py-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        <span className="text-sm font-semibold">
          {t('tiny_experiments.history_title')} ({pacts.length})
        </span>
      </button>

      {open && (
        <div className="space-y-3 mt-2">
          {pacts.map(p => (
            <PastPactRow
              key={p.id}
              pact={p}
              allPacts={pacts}
              canResume={!hasActivePact && p.endDate >= today}
              onResume={onResume}
            />
          ))}
        </div>
      )}
    </div>
  )
}
