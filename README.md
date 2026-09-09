# journalpp

A privacy-first journaling PWA built around a plugin system. Every tool is a self-contained module — add a new journaling technique from a book, a course, or your own practice by creating one folder and registering it. Your data never leaves your device.

**Live:** [journalpp.app](https://journalpp.app) &nbsp;·&nbsp; **Contributions welcome** — see [Adding a Tool](#adding-a-tool) below.

---

## Features

- **Plugin-based tools** — each journaling technique is an isolated module; adding one requires zero framework changes
- **End-to-end encryption** — all journals are encrypted with AES-256-GCM before being written to `localStorage`; your passphrase never leaves the browser
- **Offline-first PWA** — installable, works without a network connection
- **Period navigation** — daily, weekly, monthly, yearly, or ongoing cadence, with automatic ← → arrows and streak tracking
- **Export / import** — every tool supports plain JSON and encrypted JSON export out of the box
- **i18n** — English and Spanish included; adding a language is one file

## Built-in tools

| Tool | Cadence | Source |
|------|---------|--------|
| Gratitude Journal | Daily | Robert Emmons |
| Daily Journal | Daily | Morning Pages tradition |
| Plus / Minus / Next | Weekly | Anne-Laure Le Cunff — *Tiny Experiments* |
| 5 Types of Wealth Quiz | Ongoing | Sahil Bloom — *The 5 Types of Wealth* |

---

## Getting started

```bash
npm install
npm run dev        # development server at http://localhost:5173
npm run build      # production build → dist/
```

### Docker

```bash
docker compose up  # production build served on port 3000
```

---

## Adding a Tool

This is the main way to contribute. Adding a tool means creating one folder with five files and adding one line to `registry.ts`. The framework handles routes, navigation, encryption, and export automatically.

### 1. Copy the template

```bash
cp -r src/tools/_template src/tools/my-tool
```

### 2. Fill in the five files

#### `index.ts` — wires everything together

```ts
import type { JournalTool } from '../tool.types'
import description from './description'
import exporters from './exporters'
import MyToolPage from './MyToolPage'
import schema, { type MyStore } from './schema'

const myTool: JournalTool<MyStore> = {
  id: 'my-tool',           // unique; becomes the localStorage key: jrnl_my-tool
  name: 'My Tool',
  icon: '🌟',
  route: '/my-tool',
  periodicity: 'daily',    // 'daily' | 'weekly' | 'monthly' | 'yearly' | 'ongoing'
  description,
  component: MyToolPage,
  schema,
  exporters,
}

export default myTool
```

#### `schema.ts` — data shape and serialization

```ts
import type { ToolSchema } from '../tool.types'

export interface MyEntry {
  id: string
  date: string   // matches periodicity format: "2026-09-09" for daily
  content: string
}

export interface MyStore {
  entries: MyEntry[]
}

const schema: ToolSchema<MyStore> = {
  defaultData: { entries: [] },
  serialize: (data) => JSON.stringify(data),
  deserialize: (raw) => {
    try {
      const parsed = JSON.parse(raw) as MyStore
      return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] }
    } catch {
      return { entries: [] }
    }
  },
}

export default schema
```

#### `MyToolPage.tsx` — the UI component

Your component receives one prop: `periodKey` (the active period string, or `null` for `ongoing` tools).

```tsx
import { useToolData } from '../../store/journal'
import type { ToolProps } from '../tool.types'
import myTool from './index'
import type { MyStore } from './schema'

export default function MyToolPage({ periodKey }: ToolProps) {
  const [data, save] = useToolData<MyStore>(myTool)

  const entry = data.entries.find(e => e.date === periodKey)

  async function handleSave(content: string) {
    const updated = entry
      ? data.entries.map(e => e.date === periodKey ? { ...e, content } : e)
      : [{ id: crypto.randomUUID(), date: periodKey!, content }, ...data.entries]
    await save({ entries: updated })
  }

  return <div className="max-w-lg mx-auto">...</div>
}
```

**Layout conventions:**
- Max width: `max-w-lg mx-auto` for forms, `max-w-4xl mx-auto` for boards
- Cards: `rounded-2xl border p-4` with CSS variable colors (`var(--color-surface)`, `var(--color-border)`)
- Buttons: `py-2.5 rounded-xl font-semibold text-white` with `var(--color-primary)` background
- Never hardcode colors — always use the CSS variables defined in `src/index.css`
- Call `save()` on blur or on an explicit Save button, not on every keystroke

#### `description.ts` — card summary and how-to content

```ts
import type { ToolDescription } from '../tool.types'

const description: ToolDescription = {
  summary: 'One sentence shown on the tool card.',
  sourceBook: 'Book Title',           // optional
  sourceLink: 'https://example.com',  // optional
  howToUse: `## My Tool

What it is and why it helps.

### How to use it

1. Step one
2. Step two

### Tips

- Keep entries short.

### Source

Attribution here.`,
}

export default description
```

#### `exporters.ts` — at minimum, use the shared helper

```ts
import { makeJsonExporters } from '../exporters.helpers'

const exporters = makeJsonExporters('my-tool')
export default exporters
```

This gives the user two download buttons in Settings: plain JSON and encrypted JSON. You can add more exporters (PDF, CSV, etc.) by extending the array.

### 3. Register the tool

In `src/tools/registry.ts`, add one import and one line:

```ts
import myTool from './my-tool'

export const registry: JournalTool<any>[] = [
  gratitudeTool,
  dailyTool,
  pmnTool,
  myTool,   // ← add here
]
```

That's it. The tool now appears on the home screen, in the nav, and in the settings export panel — with period navigation arrows, a status dot, and export/import support.

### Periodicity reference

| Value | `periodKey` format | Nav label example | Use when |
|-------|--------------------|-------------------|----------|
| `daily` | `"2026-09-09"` | Tue, Sep 9 | One entry per day |
| `weekly` | `"2026-W37"` | Week 37 | One board per week |
| `monthly` | `"2026-09"` | September 2026 | One entry per month |
| `yearly` | `"2026"` | 2026 | Annual reflection |
| `ongoing` | `null` | — | No fixed period, timestamped entries |

### Schema versioning

When you change your data shape in a later version, handle the migration in `deserialize`:

```ts
deserialize: (raw) => {
  const parsed = JSON.parse(raw)
  if (parsed.version === 1) {
    return {
      version: 2,
      entries: parsed.entries.map((e: any) => ({ ...e, content: e.text ?? '' })),
    }
  }
  return parsed as MyStore
},
```

Always fall back to `defaultData` if parsing fails — users should never see a crash on startup.

### Pre-contribution checklist

Before opening a pull request:

- [ ] `id` is unique and kebab-case; `route` is unique and starts with `/`
- [ ] `icon` is a single emoji
- [ ] `schema.defaultData` is set and non-null
- [ ] `schema.deserialize` falls back gracefully on malformed input
- [ ] `periodicity` matches how the tool is used; component filters by `periodKey`
- [ ] Exporters include at least the two JSON exporters from `makeJsonExporters`
- [ ] `description.summary` is one sentence
- [ ] `description.howToUse` covers what the tool is, how to use it, and its source
- [ ] Colors use CSS variables, never hardcoded values
- [ ] Build passes: `npm run build`

---

## Project structure

```
src/
├── tools/
│   ├── tool.types.ts          # JournalTool, ToolSchema, Exporter interfaces
│   ├── registry.ts            # add your tool here
│   ├── exporters.helpers.ts   # makeJsonExporters shared helper
│   ├── periodicity.ts         # period key helpers
│   ├── _template/             # copy this to start a new tool
│   ├── gratitude/
│   ├── daily/
│   ├── pmn/
│   └── wealth-quiz/
├── store/
│   └── journal.tsx            # useToolData<T> hook, encryption context
├── crypto/
│   └── vault.ts               # AES-GCM encrypt/decrypt via Web Crypto API
├── components/                # Layout, nav, drawers
├── pages/                     # ToolsHome, Settings, Welcome, LockScreen
└── i18n/
    └── locales/               # en.ts, es.ts
```

## Security model

All data is encrypted with **AES-256-GCM** before being written to `localStorage`. The key is derived from the user's passphrase using **PBKDF2** (200 000 iterations, SHA-256). The key lives only in React context (in-memory) and is never persisted. A sentinel value in `localStorage` lets the app verify the passphrase without storing it.

Encryption and decryption happen in the browser via the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — no server is involved.

## Contributing

Pull requests are welcome. The easiest contribution is a new tool — if you've found a journaling technique from a book, podcast, or your own practice that isn't here yet, add it following the guide above and open a PR.

For bugs or framework improvements, open an issue first to discuss the approach.

## License

GPL-3.0 — see [LICENSE](LICENSE).
