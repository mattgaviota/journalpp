import { useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Pact } from './schema'
import { getPactStats, toLocalDateString, addMonths } from './schema'
import CreatePactForm, { type PactFormValues } from './CreatePactForm'

type Mode = 'pause' | 'pivot' | 'persist'

interface Props {
  mode: Mode
  pact: Pact
  onClose: () => void
  onPause: () => void
  onPivot: (values: PactFormValues) => void
  onPersist: (newEndDate: string) => void
}

function Sheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div
          className="relative rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
          style={{ background: 'var(--color-surface)' }}
        >
          {/* Handle (mobile only) */}
          <div className="sm:hidden w-8 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--color-border)' }} />
          {children}
        </div>
      </div>
    </>
  )
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute top-4 right-4 p-1.5 rounded-lg"
      style={{ color: 'var(--color-text-muted)' }}
      aria-label="Close"
    >
      <X size={18} />
    </button>
  )
}

export default function PactActionSheet({ mode, pact, onClose, onPause, onPivot, onPersist }: Props) {
  const { t } = useTranslation()

  if (mode === 'pause') {
    return (
      <Sheet onClose={onClose}>
        <CloseButton onClose={onClose} />
        <h2 className="text-lg font-bold mb-2 pr-8" style={{ color: 'var(--color-text)' }}>
          {t('tiny_experiments.pause_title')}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {t('tiny_experiments.pause_body')}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
          >
            {t('tiny_experiments.btn_cancel')}
          </button>
          <button
            onClick={onPause}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--color-danger)' }}
          >
            {t('tiny_experiments.btn_confirm_pause')}
          </button>
        </div>
      </Sheet>
    )
  }

  if (mode === 'pivot') {
    return (
      <Sheet onClose={onClose}>
        <CloseButton onClose={onClose} />
        <h2 className="text-lg font-bold mb-1 pr-8" style={{ color: 'var(--color-text)' }}>
          {t('tiny_experiments.pivot_title')}
        </h2>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
          {t('tiny_experiments.pivot_body')}
        </p>
        <CreatePactForm
          initialValues={{
            action: pact.action,
            periodicity: pact.periodicity,
          }}
          onConfirm={onPivot}
          onCancel={onClose}
        />
      </Sheet>
    )
  }

  // persist
  return <PersistSheet pact={pact} onClose={onClose} onPersist={onPersist} />
}

function PersistSheet({
  pact,
  onClose,
  onPersist,
}: {
  pact: Pact
  onClose: () => void
  onPersist: (newEndDate: string) => void
}) {
  const { t } = useTranslation()
  const stats = getPactStats(pact)
  const pct = stats.total > 0 ? Math.round((stats.accomplished / stats.total) * 100) : 0

  const minDate = toLocalDateString() // at least today
  const maxDate = toLocalDateString(addMonths(new Date(), 4))
  const [newEndDate, setNewEndDate] = useState('')

  return (
    <Sheet onClose={onClose}>
      <CloseButton onClose={onClose} />
      <h2 className="text-lg font-bold mb-1 pr-8" style={{ color: 'var(--color-text)' }}>
        {t('tiny_experiments.persist_title')}
      </h2>

      {/* Stats summary */}
      <div className="flex gap-3 my-4">
        {[
          [stats.accomplished, t('tiny_experiments.legend_done'), 'var(--color-success)'],
          [stats.missed, t('tiny_experiments.legend_missed'), 'var(--color-danger)'],
          [`${pct}%`, t('tiny_experiments.completion'), 'var(--color-primary)'],
        ].map(([val, label, color]) => (
          <div
            key={String(label)}
            className="flex-1 rounded-xl p-3 text-center"
            style={{ background: 'var(--color-bg-secondary)' }}
          >
            <div className="text-xl font-bold" style={{ color: String(color) }}>{val}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
        {t('tiny_experiments.persist_body')}
      </p>

      <div className="mb-2">
        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          {t('tiny_experiments.new_end_date')}
        </label>
        <input
          type="date"
          value={newEndDate}
          min={minDate}
          max={maxDate}
          onChange={e => setNewEndDate(e.target.value)}
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text)',
          }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {t('tiny_experiments.max_duration_note')}
        </p>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
        >
          {t('tiny_experiments.btn_cancel')}
        </button>
        <button
          onClick={() => newEndDate && onPersist(newEndDate)}
          disabled={!newEndDate}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'var(--color-primary)' }}
        >
          {t('tiny_experiments.btn_confirm_persist')}
        </button>
      </div>
    </Sheet>
  )
}
