import type { ToolSchema } from '../tool.types'

// Define the shape of your tool's data
export interface TemplateEntry {
  id: string
  date: string // YYYY-MM-DD for daily tools; weekStart for weekly tools; etc.
  // Add your fields here
  content: string
}

export interface TemplateStore {
  entries: TemplateEntry[]
}

// Schema handles serialization and migration
const schema: ToolSchema<TemplateStore> = {
  defaultData: { entries: [] },

  serialize: (data) => JSON.stringify(data),

  // deserialize is also where you handle data migrations between versions
  deserialize: (raw) => {
    const parsed = JSON.parse(raw) as TemplateStore
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    }
  },
}

export default schema
