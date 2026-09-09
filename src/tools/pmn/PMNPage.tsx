import { useTranslation } from 'react-i18next'
import { useToolData } from '../../store/journal'
import type { ToolProps } from '../tool.types'
import Column from './components/Column'
import pmnTool from './index'
import type { PMNCard, PMNStore, PMNWeek } from './schema'

function randomId() { return Math.random().toString(36).slice(2) }

function currentWeekStart(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function weekKeyToMonday(weekKey: string): string {
  const [yearStr, wStr] = weekKey.split('-W')
  const year = Number(yearStr)
  const week = Number(wStr)
  const jan4 = new Date(year, 0, 4)
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - jan4.getDay() + 1 + (week - 1) * 7)
  return monday.toISOString().slice(0, 10)
}

export default function PMNPage({ periodKey }: ToolProps) {
  const { t } = useTranslation()
  const [data, save] = useToolData<PMNStore>(pmnTool)

  const weekStart = periodKey ? weekKeyToMonday(periodKey) : currentWeekStart()
  const week: PMNWeek = data.weeks.find((w) => w.weekStart === weekStart) ?? {
    weekStart,
    plus: [],
    minus: [],
    next: [],
  }

  async function updateWeek(updated: PMNWeek) {
    const exists = data.weeks.some((w) => w.weekStart === weekStart)
    const weeks = exists
      ? data.weeks.map((w) => (w.weekStart === weekStart ? updated : w))
      : [updated, ...data.weeks]
    await save({ weeks })
  }

  function addCard(column: keyof Pick<PMNWeek, 'plus' | 'minus' | 'next'>, text: string) {
    const card: PMNCard = { id: randomId(), text }
    updateWeek({ ...week, [column]: [...week[column], card] })
  }

  function deleteCard(column: keyof Pick<PMNWeek, 'plus' | 'minus' | 'next'>, id: string) {
    updateWeek({ ...week, [column]: week[column].filter((c) => c.id !== id) })
  }

  const columns = [
    { key: 'plus' as const, label: t('pmn.col_plus'), emoji: '➕', color: 'var(--color-success)' },
    { key: 'minus' as const, label: t('pmn.col_minus'), emoji: '➖', color: 'var(--color-danger)' },
    { key: 'next' as const, label: t('pmn.col_next'), emoji: '➡️', color: 'var(--color-primary)' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <Column key={col.key} label={col.label} emoji={col.emoji} color={col.color}
            cards={week[col.key]}
            onAdd={(text) => addCard(col.key, text)}
            onDelete={(id) => deleteCard(col.key, id)} />
        ))}
      </div>
    </div>
  )
}
