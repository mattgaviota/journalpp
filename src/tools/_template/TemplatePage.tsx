// import { useToolData } from '../../store/journal'
import type { ToolProps } from '../tool.types'
// import templateTool from './index'
// import type { TemplateStore } from './schema'

/**
 * Your tool's UI component.
 *
 * - periodKey: the active period key (e.g. "2026-09-09" for daily, "2026-W37" for weekly).
 *   Use it to filter entries for the current period.
 *   It's null for 'ongoing' tools.
 *
 * - useToolData: reads/writes your tool's encrypted data from localStorage.
 *   The hook returns [data, save]. Call save(newData) to persist.
 *   It re-renders whenever key changes.
 *
 * - Auto-save pattern: call save() onBlur or on explicit button press.
 */
export default function TemplatePage({ periodKey }: ToolProps) {
  // Uncomment when your tool is set up:
  // const [data, save] = useToolData<TemplateStore>(templateTool)

  return (
    <div className="max-w-lg mx-auto">
      <p style={{ color: 'var(--color-text-muted)' }}>
        Replace this with your tool UI. Active period: {periodKey ?? 'N/A'}
      </p>
    </div>
  )
}
