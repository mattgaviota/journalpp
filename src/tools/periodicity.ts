import type { Periodicity } from './tool.types'

/** Returns the canonical period key for a given periodicity and date offset (0 = current). */
export function getPeriodKey(periodicity: Periodicity, date: Date = new Date(), offset = 0): string | null {
  if (periodicity === 'ongoing') return null

  const d = new Date(date)

  if (periodicity === 'daily') {
    d.setDate(d.getDate() + offset)
    return d.toISOString().slice(0, 10)
  }

  if (periodicity === 'weekly') {
    // Anchor to Monday
    const day = d.getDay()
    const diff = (day === 0 ? -6 : 1 - day)
    d.setDate(d.getDate() + diff + offset * 7)
    // ISO week: use year of Thursday of that week
    const thursday = new Date(d)
    thursday.setDate(d.getDate() + 3)
    const year = thursday.getFullYear()
    const jan4 = new Date(year, 0, 4)
    const weekNum = Math.ceil(((d.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7)
    return `${year}-W${String(weekNum).padStart(2, '0')}`
  }

  if (periodicity === 'monthly') {
    d.setMonth(d.getMonth() + offset)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  if (periodicity === 'yearly') {
    return String(d.getFullYear() + offset)
  }

  return null
}

export function getPeriodLabel(periodicity: Periodicity, periodKey: string | null): string {
  if (!periodKey) return ''

  if (periodicity === 'daily') {
    const d = new Date(periodKey + 'T12:00:00')
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (periodicity === 'weekly') {
    const [year, week] = periodKey.split('-W')
    const jan4 = new Date(Number(year), 0, 4)
    const weekStart = new Date(jan4)
    weekStart.setDate(jan4.getDate() - jan4.getDay() + 1 + (Number(week) - 1) * 7)
    return `Week of ${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  if (periodicity === 'monthly') {
    const [year, month] = periodKey.split('-')
    const d = new Date(Number(year), Number(month) - 1, 1)
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  }

  if (periodicity === 'yearly') {
    return periodKey
  }

  return periodKey
}

// Returns the i18n key for this periodicity's badge label.
// Resolve with t(periodicityBadgeKey(periodicity)) in components.
export function periodicityBadgeKey(periodicity: Periodicity): string {
  return `periodicity.${periodicity}`
}

/**
 * Returns true if there's at least one entry for the current period.
 * The data must have a `entries` or `weeks` array with items that have
 * a `date` or `weekStart` field matching the current period key.
 */
export function hasEntryForCurrentPeriod(
  periodicity: Periodicity,
  data: unknown,
): boolean {
  const key = getPeriodKey(periodicity)
  if (!key) return false

  const d = data as Record<string, unknown>

  // daily / monthly / yearly tools use { entries: [{ date: string }] }
  if (Array.isArray(d?.entries)) {
    return (d.entries as Array<{ date?: string }>).some((e) => e.date === key)
  }

  // weekly tools use { weeks: [{ weekStart: string }] }
  if (Array.isArray(d?.weeks)) {
    return (d.weeks as Array<{ weekStart?: string }>).some((w) => w.weekStart === key)
  }

  return false
}

/**
 * Counts consecutive completed periods going backwards from today.
 */
export function getStreakCount(periodicity: Periodicity, data: unknown): number {
  if (periodicity === 'ongoing') return 0

  let streak = 0
  let offset = 0

  while (true) {
    const key = getPeriodKey(periodicity, new Date(), offset)
    if (!key) break

    const d = data as Record<string, unknown>
    let found = false

    if (Array.isArray(d?.entries)) {
      found = (d.entries as Array<{ date?: string }>).some((e) => e.date === key)
    } else if (Array.isArray(d?.weeks)) {
      found = (d.weeks as Array<{ weekStart?: string }>).some((w) => w.weekStart === key)
    }

    if (!found) {
      // Allow current period to not be filled yet without breaking streak
      if (offset === 0) { offset--; continue }
      break
    }

    streak++
    offset--

    if (Math.abs(offset) > 365) break
  }

  return streak
}
