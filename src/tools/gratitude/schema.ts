import type { ToolSchema } from '../tool.types'

export interface GratitudeEntry {
  id: string
  date: string // YYYY-MM-DD
  items: string[]
}

export interface GratitudeStore {
  entries: GratitudeEntry[]
}

const schema: ToolSchema<GratitudeStore> = {
  defaultData: { entries: [] },
  serialize: (data) => JSON.stringify(data),
  deserialize: (raw) => {
    const parsed = JSON.parse(raw) as GratitudeStore
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    }
  },
}

export default schema
