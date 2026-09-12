import type { JournalTool } from '../tool.types'
import description from './description'
import exporters from './exporters'
import TinyExperimentsPage from './TinyExperimentsPage'
import schema, { type TinyExperimentsStore } from './schema'

const tinyExperimentsTool: JournalTool<TinyExperimentsStore> = {
  id: 'tiny-experiments',
  name: 'tools.tiny_experiments.name',
  icon: '🧪',
  route: '/tiny-experiments',
  periodicity: 'ongoing',
  description,
  component: TinyExperimentsPage,
  schema,
  exporters,
}

export default tinyExperimentsTool
