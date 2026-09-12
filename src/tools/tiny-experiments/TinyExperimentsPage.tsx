import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlaskConical } from 'lucide-react'
import { useToolData } from '../../store/journal'
import type { ToolProps } from '../tool.types'
import tinyExperimentsTool from './index'
import type { TinyExperimentsStore, Pact, CheckIn } from './schema'
import {
  toLocalDateString,
  getPactStats,
  isExpired,
  canPersist,
} from './schema'
import type { PactFormValues } from './CreatePactForm'
import CreatePactForm from './CreatePactForm'
import PactCalendar from './PactCalendar'
import PactActionSheet from './PactActionSheet'
import PactHistory from './PactHistory'

type SheetMode = 'pause' | 'pivot' | 'persist' | null

export default function TinyExperimentsPage(_: ToolProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const [data, save] = useToolData<TinyExperimentsStore>(tinyExperimentsTool)
  const [sheetMode, setSheetMode] = useState<SheetMode>(null)

  const activePact = data.pacts.find(p => p.status === 'active') ?? null
  const pastPacts = data.pacts.filter(p => p.status !== 'active')

  // ── Mutations ────────────────────────────────────────────────────────────────

  async function handleCreate(values: PactFormValues) {
    const newPact: Pact = {
      id: crypto.randomUUID(),
      action: values.action,
      startDate: toLocalDateString(),
      endDate: values.endDate,
      periodicity: values.periodicity,
      status: 'active',
      outcome: null,
      parentId: null,
      checkIns: [],
    }
    await save({ pacts: [...data.pacts, newPact] })
  }

  async function handleToggleCheckIn(date: string) {
    if (!activePact) return
    const existing: CheckIn | undefined = activePact.checkIns.find(c => c.date === date)

    let newCheckIns: CheckIn[]
    if (!existing) {
      newCheckIns = [...activePact.checkIns, { date, accomplished: true }]
    } else if (existing.accomplished) {
      newCheckIns = activePact.checkIns.map(c => c.date === date ? { ...c, accomplished: false } : c)
    } else {
      newCheckIns = activePact.checkIns.filter(c => c.date !== date)
    }

    const updated = { ...activePact, checkIns: newCheckIns }
    await save({ pacts: data.pacts.map(p => p.id === updated.id ? updated : p) })
  }

  async function handlePause() {
    if (!activePact) return
    const updated = { ...activePact, status: 'paused' as const, outcome: 'paused' as const }
    await save({ pacts: data.pacts.map(p => p.id === updated.id ? updated : p) })
    setSheetMode(null)
  }

  async function handlePivot(values: PactFormValues) {
    if (!activePact) return
    const completed = { ...activePact, status: 'completed' as const, outcome: 'pivoted' as const }
    const newPact: Pact = {
      id: crypto.randomUUID(),
      action: values.action,
      startDate: toLocalDateString(),
      endDate: values.endDate,
      periodicity: values.periodicity,
      status: 'active',
      outcome: null,
      parentId: activePact.id,
      checkIns: [],
    }
    await save({ pacts: data.pacts.map(p => p.id === completed.id ? completed : p).concat(newPact) })
    setSheetMode(null)
  }

  async function handleResume(pactId: string) {
    const updated = data.pacts.map(p =>
      p.id === pactId ? { ...p, status: 'active' as const, outcome: null } : p
    )
    await save({ pacts: updated })
  }

  async function handlePersist(newEndDate: string) {
    if (!activePact) return
    const updated = { ...activePact, endDate: newEndDate }
    await save({ pacts: data.pacts.map(p => p.id === updated.id ? updated : p) })
    setSheetMode(null)
  }

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (!activePact) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--color-bg-secondary)' }}
            >
              <FlaskConical size={32} style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            {t('tiny_experiments.no_pact_title')}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {t('tiny_experiments.no_pact_body')}
          </p>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            {t('tiny_experiments.create_title')}
          </h3>
          <CreatePactForm onConfirm={handleCreate} />
        </div>

        <PactHistory pacts={pastPacts} hasActivePact={!!activePact} onResume={handleResume} />
      </div>
    )
  }

  // ── Active / Expired pact ───────────────────────────────────────────────────

  const stats = getPactStats(activePact)
  const expired = isExpired(activePact)
  const persistUnlocked = canPersist(activePact)
  const pct = stats.total > 0 ? Math.round((stats.accomplished / stats.total) * 100) : 0

  function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(
      new Date(dateStr + 'T00:00:00')
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid sm:grid-cols-2 gap-6 items-start">

        {/* ── Left column: pact info + actions ── */}
        <div className="space-y-4">
          {/* Pact header card */}
          <div
            className="rounded-2xl border p-5 space-y-3"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>
                {expired ? t('tiny_experiments.experiment_ended') : t('tiny_experiments.active_experiment')}
              </p>
              <p className="text-xl font-bold leading-snug" style={{ color: 'var(--color-text)' }}>
                {t('tiny_experiments.i_will')} {activePact.action}
              </p>
            </div>

            <div className="flex gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span>{formatDate(activePact.startDate)} → {formatDate(activePact.endDate)}</span>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                <span>
                  {t('tiny_experiments.progress_label', {
                    accomplished: stats.accomplished,
                    total: stats.total,
                  })}
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: 'var(--color-success)' }}
                />
              </div>
            </div>

            {/* Persist nudge */}
            {expired && !persistUnlocked && stats.unmarked > 0 && (
              <p className="text-xs rounded-lg px-3 py-2" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
                {t('tiny_experiments.mark_all_to_persist', { count: stats.unmarked })}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSheetMode('pause')}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            >
              {t('tiny_experiments.btn_pause')}
            </button>
            <button
              onClick={() => setSheetMode('pivot')}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
            >
              {t('tiny_experiments.btn_pivot')}
            </button>
            {expired && (
              <button
                onClick={() => persistUnlocked && setSheetMode('persist')}
                disabled={!persistUnlocked}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: 'var(--color-success)' }}
              >
                {t('tiny_experiments.btn_persist')}
              </button>
            )}
          </div>
        </div>

        {/* ── Right column: calendar ── */}
        <div>
          <PactCalendar pact={activePact} onToggleCheckIn={handleToggleCheckIn} />
        </div>
      </div>

      {/* History */}
      <PactHistory pacts={pastPacts} hasActivePact={!!activePact} onResume={handleResume} />

      {/* Action sheet */}
      {sheetMode && (
        <PactActionSheet
          mode={sheetMode}
          pact={activePact}
          onClose={() => setSheetMode(null)}
          onPause={handlePause}
          onPivot={handlePivot}
          onPersist={handlePersist}
        />
      )}
    </div>
  )
}
