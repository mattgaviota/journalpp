import type { ToolDescription } from '../tool.types'

// Replace all placeholder text with your tool's actual content.
const description: ToolDescription = {
  // One-liner shown on the tool card
  summary: 'Short description of what this tool does.',

  // Markdown string shown in the "How to use" drawer
  howToUse: `## Tool Name

Brief intro paragraph explaining what the tool is and why it's valuable.

### How to use it

1. Step one
2. Step two
3. Step three

### Tips

- Tip one
- Tip two

### Source

Where this technique comes from.
`,

  // Optional — shown on the tool card as a link
  sourceBook: 'Book Title',
  sourceLink: 'https://example.com',

  // Optional — additional reference links shown in the drawer
  references: [
    { label: 'Reference label', url: 'https://example.com' },
  ],
}

export default description
