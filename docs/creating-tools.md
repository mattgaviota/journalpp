# Creating a New Journaling Tool

This guide explains how to add a new journaling technique to the app. The tool system is designed so that adding a new tool requires **zero changes to framework files** — you create one folder, fill in five files, and register the tool.

---

## 1. Overview

Each tool is a self-contained module in `src/tools/<your-tool-id>/`. The framework reads the `registry` array to auto-generate routes, the tools home page, the settings export panel, and the bottom nav.

The framework provides:
- Encrypted localStorage persistence via `useToolData<T>`
- Period navigation (← current week →) based on `periodicity`
- Status dot (green = logged this period)
- Export/import UI for every `Exporter` you define

You provide:
- A data schema (`schema.ts`)
- A UI component (`YourToolPage.tsx`)
- A description with how-to instructions (`description.ts`)
- Exporters (`exporters.ts`)
- A tool definition that wires them together (`index.ts`)

---

## 2. Quickstart

### Step 1 — Copy the template

```bash
cp -r src/tools/_template src/tools/my-tool
```

### Step 2 — Fill in `index.ts`

```ts
const myTool: JournalTool<MyStore> = {
  id: 'my-tool',           // unique; used as localStorage key jrnl_my-tool
  name: 'My Tool',
  icon: '🌟',
  route: '/my-tool',
  periodicity: 'weekly',   // 'daily' | 'weekly' | 'monthly' | 'yearly' | 'ongoing'
  description,
  component: MyToolPage,
  schema,
  exporters,
}
```

### Step 3 — Register the tool

In `src/tools/registry.ts`, add one line:

```ts
import myTool from './my-tool'

export const registry: JournalTool<any>[] = [
  gratitudeTool,
  dailyTool,
  pmnTool,
  myTool,  // ← add here
]
```

That's it. The tool now appears in the tool list, the nav, and the settings export panel.

---

## 3. Interface Reference

```ts
// tool.types.ts

export type Periodicity = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'ongoing'

export interface JournalTool<T = unknown> {
  id: string               // unique, snake-case. Used as localStorage key suffix: jrnl_<id>
  name: string             // displayed in nav and tool card
  icon: string             // emoji shown in nav and tool card
  route: string            // hash route e.g. "/my-tool"
  periodicity: Periodicity // controls nav arrows, status dot, and streak logic
  description: ToolDescription
  component: React.ComponentType<ToolProps>  // your page UI
  schema: ToolSchema<T>
  exporters: Exporter[]
}

export interface ToolDescription {
  summary: string          // one-liner on tool card
  howToUse: string         // markdown, shown in "How to use" drawer
  sourceBook?: string      // e.g. "Tiny Experiments"
  sourceLink?: string      // link to book/article, shown on tool card
  references?: Array<{ label: string; url: string }>
}

export interface ToolSchema<T> {
  defaultData: T           // returned when no data is stored yet
  serialize: (data: T) => string      // usually JSON.stringify
  deserialize: (raw: string) => T     // JSON.parse + validation + migrations
}

export interface Exporter {
  id: string               // unique within the tool
  label: string            // shown in Settings UI, e.g. "Export JSON (plain)"
  export: (data: unknown, ctx?: ExporterContext) => Promise<void>  // triggers download
}

export interface ExporterContext {
  key: CryptoKey
  encrypt: (plaintext: string, key: CryptoKey) => Promise<string>
}

export interface ToolProps {
  periodKey: string | null  // the active period key; null for 'ongoing' tools
}
```

---

## 4. Writing the UI Component

Your component receives one prop: `periodKey`. Use it to filter entries for the active period.

```tsx
import { useToolData } from '../../store/journal'
import type { ToolProps } from '../tool.types'
import myTool from './index'
import type { MyStore } from './schema'

export default function MyToolPage({ periodKey }: ToolProps) {
  const [data, save] = useToolData<MyStore>(myTool)

  // Filter entries to the active period
  const activeEntry = data.entries.find(e => e.date === periodKey)

  async function handleSave(newEntry: ...) {
    const entries = activeEntry
      ? data.entries.map(e => e.date === periodKey ? newEntry : e)
      : [newEntry, ...data.entries]
    await save({ entries })
  }

  return <div>...</div>
}
```

### Mobile-first layout conventions

- Max width: `max-w-lg mx-auto` for form tools, `max-w-4xl mx-auto` for board-style tools
- Card containers: `rounded-2xl border p-4` with CSS variable colors
- Buttons: `py-2.5 rounded-xl font-semibold text-white` with `var(--color-primary)` background
- Always use CSS variables for colors (see `src/index.css`), never hardcoded hex values

### Auto-save pattern

Call `save()` on blur (when the user leaves the field) and/or on an explicit Save button. Avoid saving on every keystroke — it triggers encryption on each character.

---

## 5. Writing the Description

The `howToUse` field is markdown rendered in a bottom sheet drawer. Use this structure:

```md
## Tool Name

One-paragraph intro: what it is, why it matters.

### How to use it

1. Step one
2. Step two
3. Step three

### Tips

- Tip A
- Tip B

### Source

Book/article attribution.
```

Keep it scannable. Use tables for structured comparisons (like PMN's column descriptions).

---

## 6. Setting Periodicity

| Value | Use when | periodKey format | Example |
|-------|----------|-----------------|---------|
| `daily` | Tool has one entry per day | `"2026-09-09"` | Gratitude, Daily journal |
| `weekly` | Tool has one board/entry per week | `"2026-W37"` | Plus/Minus/Next |
| `monthly` | Tool has one entry per month | `"2026-09"` | Monthly review |
| `yearly` | Tool has one entry per year | `"2026"` | Annual goals |
| `ongoing` | No fixed period | `null` | Open-ended tracker |

When `periodicity` is anything other than `ongoing`, the framework:
- Shows `← Period label →` navigation arrows above the tool
- Shows a green status dot on the tool card when the current period has data
- Calculates a streak count (displayed in future stats views)

**In your component**: filter entries by `periodKey`. If `periodKey` is `null`, show all entries.

**In your schema**: structure your data so entries have a field that matches the period key format:
- Daily: `{ date: "2026-09-09" }`
- Weekly: `{ weekStart: "2026-09-08" }` (Monday's date, not the week key string — see PMN for conversion)
- Monthly: `{ month: "2026-09" }`
- Yearly: `{ year: "2026" }`

The `hasEntryForCurrentPeriod` helper in `src/tools/periodicity.ts` checks `entries[].date` or `weeks[].weekStart` automatically.

---

## 7. Writing Exporters

The simplest case — use the shared helper:

```ts
// exporters.ts
import { makeJsonExporters } from '../exporters.helpers'

const exporters = makeJsonExporters('my-tool-id')
export default exporters
```

This gives you two exporters: "Export JSON (plain)" and "Export JSON (encrypted)".

### Adding a PDF exporter

Install a PDF library:
```bash
npm install jspdf
```

Add a new exporter to your tool's `exporters.ts`:

```ts
import { makeJsonExporters } from '../exporters.helpers'
import type { Exporter } from '../tool.types'
import type { MyStore } from './schema'

const pdfExporter: Exporter = {
  id: 'pdf',
  label: 'Export PDF',
  export: async (rawData) => {
    const { jsPDF } = await import('jspdf')
    const data = rawData as MyStore
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text('My Tool Export', 20, 20)

    let y = 35
    for (const entry of data.entries) {
      doc.setFontSize(12)
      doc.text(entry.date, 20, y)
      y += 8
      doc.setFontSize(10)
      doc.text(entry.content, 20, y, { maxWidth: 170 })
      y += 20
      if (y > 270) { doc.addPage(); y = 20 }
    }

    doc.save('my-tool-export.pdf')
  },
}

const exporters = [...makeJsonExporters('my-tool-id'), pdfExporter]
export default exporters
```

No other files need to change — the Settings page renders all exporters from the registry automatically.

---

## 8. Schema Versioning

When your data shape changes between app versions, handle migrations in `deserialize`:

```ts
deserialize: (raw) => {
  const parsed = JSON.parse(raw)

  // Version 1 → 2: entries had 'text' field; renamed to 'content'
  if (parsed.version === 1) {
    return {
      version: 2,
      entries: parsed.entries.map((e: any) => ({
        ...e,
        content: e.text ?? '',
        text: undefined,
      })),
    }
  }

  return parsed as MyStore
},
```

Always return valid data from `deserialize` even when `raw` is malformed — fall back to `defaultData` if parsing fails.

---

## 9. Pre-contribution Checklist

Before adding a tool to the registry:

- [ ] `schema.defaultData` is set and non-null
- [ ] `schema.deserialize` handles missing/malformed data gracefully
- [ ] `periodicity` is set correctly; component uses `periodKey` to filter entries
- [ ] Exporters include at least "Export JSON (plain)" and "Export JSON (encrypted)"
- [ ] `description.summary` is one sentence
- [ ] `description.howToUse` follows the recommended markdown structure
- [ ] `icon` is a single emoji
- [ ] `route` is unique and starts with "/"
- [ ] `id` is unique and kebab-case
- [ ] Build passes: `npm run build`

---

## 10. Example: Wheel of Life Tool (Annotated)

The Wheel of Life is a monthly tool where users rate 8 life areas (health, career, finances, relationships, etc.) from 1–10.

### `schema.ts`

```ts
export interface WheelArea {
  name: string
  score: number  // 1-10
}

export interface WheelEntry {
  id: string
  month: string  // "2026-09"
  areas: WheelArea[]
}

export interface WheelStore {
  entries: WheelEntry[]
}

const DEFAULT_AREAS = [
  'Health', 'Career', 'Finances', 'Relationships',
  'Personal growth', 'Fun & recreation', 'Physical environment', 'Family & friends',
]

const schema: ToolSchema<WheelStore> = {
  defaultData: { entries: [] },
  serialize: (data) => JSON.stringify(data),
  deserialize: (raw) => {
    try {
      const parsed = JSON.parse(raw) as WheelStore
      return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] }
    } catch {
      return { entries: [] }
    }
  },
}
```

### `WheelPage.tsx` (sketch)

```tsx
export default function WheelPage({ periodKey }: ToolProps) {
  const [data, save] = useToolData<WheelStore>(wheelTool)
  const month = periodKey ?? new Date().toISOString().slice(0, 7)

  const entry = data.entries.find(e => e.month === month)
    ?? { id: randomId(), month, areas: DEFAULT_AREAS.map(name => ({ name, score: 5 })) }

  async function handleScoreChange(name: string, score: number) {
    const areas = entry.areas.map(a => a.name === name ? { ...a, score } : a)
    const newEntry = { ...entry, areas }
    const entries = data.entries.some(e => e.month === month)
      ? data.entries.map(e => e.month === month ? newEntry : e)
      : [newEntry, ...data.entries]
    await save({ entries })
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {entry.areas.map(area => (
        <div key={area.name} className="flex items-center gap-4">
          <span className="w-40 text-sm">{area.name}</span>
          <input
            type="range" min={1} max={10} value={area.score}
            onChange={e => handleScoreChange(area.name, Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-6 text-sm text-right">{area.score}</span>
        </div>
      ))}
    </div>
  )
}
```

### `index.ts`

```ts
const wheelTool: JournalTool<WheelStore> = {
  id: 'wheel-of-life',
  name: 'Wheel of Life',
  icon: '☯️',
  route: '/wheel',
  periodicity: 'monthly',       // ← one entry per month, nav arrows show months
  description,
  component: WheelPage,
  schema,
  exporters: makeJsonExporters('wheel-of-life'),
}
```

Add `wheelTool` to `registry.ts` and the tool is live — with month navigation, a status dot, and export/import — with no changes to any framework file.
