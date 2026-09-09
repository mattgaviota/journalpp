import type { ToolSchema } from '../tool.types'

export type WealthCategory = 'time' | 'social' | 'mental' | 'physical' | 'financial'

export interface WealthScores {
  time: number       // 1–5 average
  social: number
  mental: number
  physical: number
  financial: number
}

export interface WealthQuizResult {
  id: string
  date: string       // ISO date "YYYY-MM-DD"
  answers: number[]  // 25 answers, index 0–24, values 1–5
  scores: WealthScores
}

export interface WealthQuizStore {
  results: WealthQuizResult[]
}

export function computeScores(answers: number[]): WealthScores {
  const avg = (start: number) =>
    answers.slice(start, start + 5).reduce((s, v) => s + v, 0) / 5
  return {
    time: avg(0),
    social: avg(5),
    mental: avg(10),
    physical: avg(15),
    financial: avg(20),
  }
}

const schema: ToolSchema<WealthQuizStore> = {
  defaultData: { results: [] },
  serialize: (data) => JSON.stringify(data),
  deserialize: (raw) => {
    try {
      const parsed = JSON.parse(raw) as WealthQuizStore
      return { results: Array.isArray(parsed.results) ? parsed.results : [] }
    } catch {
      return { results: [] }
    }
  },
}

export default schema
