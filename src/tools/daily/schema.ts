import type { ToolSchema } from '../tool.types'

export interface DailyEntry {
  id: string
  date: string // YYYY-MM-DD
  content: string
}

export interface DailyStore {
  entries: DailyEntry[]
}

const schema: ToolSchema<DailyStore> = {
  defaultData: { entries: [] },
  serialize: (data) => JSON.stringify(data),
  deserialize: (raw) => {
    const parsed = JSON.parse(raw) as DailyStore
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    }
  },
}

export default schema
