import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PactPeriodicity } from './schema'
import { toLocalDateString, addMonths } from './schema'

export interface PactFormValues {
  action: string
  endDate: string
  periodicity: PactPeriodicity
}

interface Props {
  initialValues?: Partial<PactFormValues>
  onConfirm: (values: PactFormValues) => void
  onCancel?: () => void
}

// 0=Sun,1=Mon,…,6=Sat — but we display Mon-first
const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 0] // Mon…Sun

export default function CreatePactForm({ initialValues, onConfirm, onCancel }: Props) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const [action, setAction] = useState(initialValues?.action ?? '')
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? '')
  const [periodicityType, setPeriodicityType] = useState<'daily' | 'weekly'>(
    initialValues?.periodicity?.type ?? 'daily'
  )
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialValues?.periodicity?.days ?? [1, 2, 3, 4, 5] // Mon–Fri default
  )

  const minEnd = toLocalDateString(addMonths(new Date(), 0)) // at least today
  const maxEnd = toLocalDateString(addMonths(new Date(), 4))

  function toggleDay(dow: number) {
    setSelectedDays(prev =>
      prev.includes(dow)
        ? prev.length > 1 ? prev.filter(d => d !== dow) : prev // keep at least one
        : [...prev, dow]
    )
  }

  function getDayLabel(dow: number): string {
    // dow 0=Sun,1=Mon…; use a known date for each
    // 2024-01-01 is Mon; offset from Mon (dow 1)
    const offset = dow === 0 ? 6 : dow - 1
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 1 + offset))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!action.trim() || !endDate) return

    // Normalize: all 7 days selected = daily
    const periodicity: PactPeriodicity =
      periodicityType === 'daily' || selectedDays.length === 7
        ? { type: 'daily' }
        : { type: 'weekly', days: selectedDays }

    onConfirm({ action: action.trim(), endDate, periodicity })
  }

  const isValid = action.trim().length > 0 && endDate.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Action */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          {t('tiny_experiments.i_will')}
        </label>
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
            {t('tiny_experiments.i_will')}
          </span>
          <input
            type="text"
            value={action}
            onChange={e => setAction(e.target.value)}
            placeholder={t('tiny_experiments.action_placeholder')}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text)' }}
            autoFocus
            maxLength={120}
          />
        </div>
      </div>

      {/* End date */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          {t('tiny_experiments.end_date_label')}
        </label>
        <input
          type="date"
          value={endDate}
          min={minEnd}
          max={maxEnd}
          onChange={e => setEndDate(e.target.value)}
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

      {/* Periodicity */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          {t('tiny_experiments.frequency')}
        </label>
        <div className="flex gap-2 mb-3">
          {(['daily', 'weekly'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setPeriodicityType(type)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: periodicityType === type ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: periodicityType === type ? 'white' : 'var(--color-text)',
                border: '1px solid',
                borderColor: periodicityType === type ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              {t(`tiny_experiments.${type}`)}
            </button>
          ))}
        </div>

        {periodicityType === 'weekly' && (
          <div className="flex gap-1.5 flex-wrap">
            {WEEK_DAYS.map(dow => (
              <button
                key={dow}
                type="button"
                onClick={() => toggleDay(dow)}
                className="flex-1 min-w-[36px] py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background: selectedDays.includes(dow) ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                  color: selectedDays.includes(dow) ? 'white' : 'var(--color-text-muted)',
                  border: '1px solid',
                  borderColor: selectedDays.includes(dow) ? 'var(--color-primary)' : 'var(--color-border)',
                }}
              >
                {getDayLabel(dow)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
          >
            {t('tiny_experiments.btn_cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: 'var(--color-primary)' }}
        >
          {t('tiny_experiments.btn_start')}
        </button>
      </div>
    </form>
  )
}
