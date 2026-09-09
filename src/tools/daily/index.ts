import type { JournalTool } from '../tool.types'
import description from './description'
import exporters from './exporters'
import DailyPage from './DailyPage'
import schema, { type DailyStore } from './schema'

const dailyTool: JournalTool<DailyStore> = {
  id: 'daily',
  name: 'tools.daily.name',
  icon: '📖',
  route: '/daily',
  periodicity: 'daily',
  description,
  component: DailyPage,
  schema,
  exporters,
}

export default dailyTool
