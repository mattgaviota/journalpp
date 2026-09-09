import type { JournalTool } from '../tool.types'
import description from './description'
import exporters from './exporters'
import WealthQuizPage from './WealthQuizPage'
import schema, { type WealthQuizStore } from './schema'

const wealthQuizTool: JournalTool<WealthQuizStore> = {
  id: 'wealth-quiz',
  name: 'tools.wealth_quiz.name',
  icon: '💎',
  route: '/wealth-quiz',
  periodicity: 'ongoing',
  description,
  component: WealthQuizPage,
  schema,
  exporters,
}

export default wealthQuizTool
