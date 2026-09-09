import type { JournalTool } from '../tool.types'
import description from './description'
import exporters from './exporters'
import GratitudePage from './GratitudePage'
import schema, { type GratitudeStore } from './schema'

const gratitudeTool: JournalTool<GratitudeStore> = {
  id: 'gratitude',
  name: 'tools.gratitude.name',
  icon: '🙏',
  route: '/gratitude',
  periodicity: 'daily',
  description,
  component: GratitudePage,
  schema,
  exporters,
}

export default gratitudeTool
