import type { JournalTool } from '../tool.types'
import description from './description'
import exporters from './exporters'
import TemplatePage from './TemplatePage'
import schema, { type TemplateStore } from './schema'

// 1. Fill in all fields below
// 2. Add this tool to src/tools/registry.ts
const templateTool: JournalTool<TemplateStore> = {
  id: 'my-tool-id',            // must be unique; used as localStorage key suffix
  name: 'My Tool Name',
  icon: '✨',                  // emoji shown in nav and tool card
  route: '/my-tool',           // hash route, must be unique
  periodicity: 'daily',        // 'daily' | 'weekly' | 'monthly' | 'yearly' | 'ongoing'
  description,
  component: TemplatePage,
  schema,
  exporters,
}

export default templateTool
