import type { JournalTool } from '../tool.types'
import description from './description'
import exporters from './exporters'
import PMNPage from './PMNPage'
import schema, { type PMNStore } from './schema'

const pmnTool: JournalTool<PMNStore> = {
  id: 'pmn',
  name: 'tools.pmn.name',
  icon: '⚡',
  route: '/pmn',
  periodicity: 'weekly',
  description,
  component: PMNPage,
  schema,
  exporters,
}

export default pmnTool
