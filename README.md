# Life Companion — Your AI Assistant Inside Obsidian

Turn your Obsidian vault into a personal life management system. Life Companion is an AI-powered plugin that lives right inside your notes — it can read, search, organize your vault, manage your calendar, and have meaningful conversations that actually understand your life context.

## What Can It Do?

**Chat naturally with your notes**
Ask questions about your vault, brainstorm ideas, or just have a conversation. The AI reads your notes, understands your structure, and responds with context — not generic answers.

**Manage your calendar**
Create events, set up recurring schedules (daily, weekly, monthly, or custom intervals), and see everything in a built-in calendar view. Works seamlessly with the Full Calendar plugin.

**Organize your vault**
Search notes, create new ones, move files around, manage tags and properties, extract tasks — all through natural conversation.

**Two conversation modes**
- **Quick** — Fast, lightweight replies for quick questions and note capture
- **Deep Dive** — Thorough research mode with web search, deep analysis, and multi-step reasoning

**Multiple AI providers**
Use whichever AI you prefer: Claude, OpenAI (ChatGPT), Gemini, or Groq. Switch models anytime.

**Chrome-style tabs**
Run multiple conversations in parallel. Each tab remembers its own history.

**Attach files**
Drop in images, PDFs, or text files — the AI can read and discuss them.

**Bilingual**
Full English and Vietnamese support.

## Getting Started

### Install

1. Clone this repo and build:
   ```bash
   git clone https://github.com/tranvuongquocdat/life-companition-AI.git
   cd life-companition-AI
   npm install && npm run build
   ```

2. Copy `main.js`, `manifest.json`, and `styles.css` into your vault:
   ```
   your-vault/.obsidian/plugins/life-companion/
   ```

3. In Obsidian, go to **Settings → Community Plugins** and enable **Life Companion**.

### Set Up an AI Provider

Go to **Settings → Life Companion** and add at least one API key:

| Provider | Where to get a key |
|----------|-------------------|
| Claude | [console.anthropic.com](https://console.anthropic.com) |
| OpenAI | [platform.openai.com](https://platform.openai.com) |
| Gemini | [aistudio.google.com](https://aistudio.google.com) |
| Groq | [console.groq.com](https://console.groq.com) |

> **macOS users with Claude Code**: You can log in without an API key using the Claude Code OAuth option in settings.

### Start Chatting

Click the Life Companion icon in the sidebar (or use the command palette). That's it — start typing and the AI will respond with full awareness of your vault.

## What Gets Created in Your Vault

The plugin creates a few helper folders on first run:

```
_life/
├── profile.md     ← The AI learns about you over time and saves context here
├── index.md       ← A guide to your vault structure
└── retro/         ← Space for reflections and retrospectives
_inbox/            ← Quick capture inbox
_chats/            ← Your conversation history (auto-saved daily)
```

## Available AI Tools

The AI can perform **20+ actions** on your vault, all toggleable in settings:

- **Notes** — Search, read, create, edit, move, list folders, recent notes
- **Knowledge** — Append content, manage frontmatter properties, tags, vault stats
- **Connections** — View backlinks and outgoing links
- **Tasks** — Find tasks across notes, toggle checkboxes
- **Daily Notes** — Read or create today's daily note
- **Calendar** — Create, update, delete events with recurring support
- **Web** — Search the web and fetch pages (in Deep Dive mode)

## Development

```bash
npm run dev    # Watch mode — auto-rebuilds on changes
```

Reload Obsidian (Cmd+R / Ctrl+R) to pick up changes.

## License

MIT