import type { JournalTool } from './tool.types'
import gratitudeTool from './gratitude'
import dailyTool from './daily'
import pmnTool from './pmn'
import wealthQuizTool from './wealth-quiz'

// Add new tools here — routes and UI are generated automatically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registry: JournalTool<any>[] = [
  gratitudeTool,
  dailyTool,
  pmnTool,
  wealthQuizTool,
]
