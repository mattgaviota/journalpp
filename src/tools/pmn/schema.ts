import type { ToolSchema } from '../tool.types'

export interface PMNCard {
  id: string
  text: string
}

export interface PMNWeek {
  weekStart: string // ISO Monday "YYYY-MM-DD"
  plus: PMNCard[]
  minus: PMNCard[]
  next: PMNCard[]
}

export interface PMNStore {
  weeks: PMNWeek[]
}

const schema: ToolSchema<PMNStore> = {
  defaultData: { weeks: [] },
  serialize: (data) => JSON.stringify(data),
  deserialize: (raw) => {
    const parsed = JSON.parse(raw) as PMNStore
    return {
      weeks: Array.isArray(parsed.weeks) ? parsed.weeks : [],
    }
  },
}

export default schema
