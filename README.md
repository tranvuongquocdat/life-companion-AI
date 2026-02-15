# Life Companion — AI Obsidian Plugin

An AI-powered companion inside Obsidian that helps you brainstorm, organize notes, manage tasks, and reflect on your life. Supports multiple AI providers: **Claude**, **OpenAI**, **Gemini**, and **Groq**.

## Features

- **Multi-provider AI chat** — Claude, OpenAI, Gemini, Groq with dynamic model fetching
- **Chrome-style tabs** — Multiple parallel conversations with persistent tabs
- **20 AI tools** across 6 categories:
  - **Vault** — Search, read, write, move notes, list folders, recent notes
  - **Knowledge** — Append to notes, read/update frontmatter properties, tags, vault stats
  - **Graph** — Get backlinks, outgoing links
  - **Tasks** — Extract tasks from notes, toggle checkboxes
  - **Daily Notes** — Read/create daily notes
  - **Web** — Search (DuckDuckGo) and fetch web pages
- **Quick / Deep Dive modes** — Fast note capture vs deep brainstorm & research
- **File attachments** — Images, PDFs, markdown, text files (paste or attach)
- **Wiki links** — `[[note]]` links in AI responses are clickable
- **Bilingual UI** — English & Vietnamese
- **Claude Code OAuth** — Login via macOS Keychain (no API key needed if you have Claude Code)
- **Chat history** — Auto-saved to `_chats/` folder, persistent across sessions

## Project Structure

```
src/
├── main.ts              # Plugin entry point, message handling, tool selection
├── ChatView.ts          # Full chat UI (tabs, messages, toolbar, attachments)
├── ai-client.ts         # Multi-provider API client (Claude, OpenAI, Gemini, Groq)
├── vault-tools.ts       # 20 tool implementations (vault, knowledge, graph, tasks, daily, web)
├── tool-definitions.ts  # Tool schemas (JSON Schema for each tool)
├── types.ts             # TypeScript types, model definitions, settings
├── settings.ts          # Plugin settings UI (providers, models, tools)
├── prompts.ts           # System prompts for Quick and Deep Dive modes
├── i18n.ts              # Internationalization (English + Vietnamese)
├── auth.ts              # Claude Code OAuth (macOS Keychain)
├── chat-history.ts      # Daily chat log persistence
└── profile.ts           # User profile & vault index manager
```

## How It Works

### Architecture

```
User Message
    │
    ▼
ChatView.ts (UI) ──► main.ts (handleMessage)
                         │
                         ├── profileManager.getProfile()   → system prompt context
                         ├── buildSystemPrompt()            → mode-specific prompt
                         ├── selectTools()                  → filter tools by mode & message
                         │
                         ▼
                    ai-client.ts (sendMessage)
                         │
                         ├── sendClaude()            → Anthropic Messages API
                         ├── sendOpenAICompatible()   → OpenAI / Groq Chat Completions
                         └── sendGemini()             → Google Generative Language API
                              │
                              ▼
                         Tool Use Loop
                              │
                              ├── executeTool() → vault-tools.ts methods
                              └── Loop until no more tool calls
```

### Tool Selection

- **Quick mode**: All non-web tools are available. Web tools only activate when the message contains web-related keywords.
- **Dive mode**: All enabled tools are always available.
- Users can toggle individual tools on/off in Settings.

### Provider Routing

Models are routed to the correct provider by:
1. Checking `getEffectiveModelGroups()` (handles dynamic models fetched from APIs)
2. Falling back to prefix pattern matching (`claude-*` → Claude, `gpt-*` → OpenAI, etc.)

## Installation

### From Source (Development)

1. **Prerequisites**: Node.js 18+, npm

2. **Clone the repo**:
   ```bash
   git clone https://github.com/tranvuongquocdat/life-companition-AI.git
   cd life-companition-AI
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Build**:
   ```bash
   npm run build
   ```
   This runs TypeScript type checking then produces `main.js`.

5. **Link to your Obsidian vault**:
   ```bash
   # Create plugins directory if it doesn't exist
   mkdir -p /path/to/your/vault/.obsidian/plugins/life-companion

   # Copy the required files
   cp main.js manifest.json styles.css /path/to/your/vault/.obsidian/plugins/life-companion/
   ```

   Or create a symlink for development:
   ```bash
   ln -s "$(pwd)" /path/to/your/vault/.obsidian/plugins/life-companion
   ```

6. **Enable the plugin**:
   - Open Obsidian → Settings → Community Plugins
   - Enable "Life Companion"

7. **Configure API keys**:
   - Settings → Life Companion → API Providers
   - Add at least one provider key (Claude, OpenAI, Gemini, or Groq)

### Development Mode

```bash
npm run dev
```

This starts esbuild in watch mode — `main.js` is rebuilt automatically on file changes. Reload Obsidian (Cmd+R / Ctrl+R) to pick up changes.

## Configuration

### API Providers

| Provider | Key Format | Where to get |
|----------|-----------|--------------|
| Claude (Anthropic) | `sk-ant-...` or Claude Code OAuth | [console.anthropic.com](https://console.anthropic.com) |
| OpenAI | `sk-...` | [platform.openai.com](https://platform.openai.com) |
| Gemini (Google) | `AIza...` | [aistudio.google.com](https://aistudio.google.com) |
| Groq | `gsk_...` | [console.groq.com](https://console.groq.com) |

### Claude Code Login (macOS only)

If you have [Claude Code](https://claude.ai/claude-code) installed, you can login without an API key:
1. Run `claude` in your terminal first (to ensure tokens exist)
2. Settings → Life Companion → Claude → "Claude Code Login"
3. macOS will prompt you to allow Obsidian to access the Keychain

### Tools

All 20 tools are enabled by default. You can toggle them individually in Settings → Available Tools:

| Category | Tools |
|----------|-------|
| Vault | search_vault, read_note, write_note, move_note, list_folder, get_recent_notes |
| Knowledge | append_note, read_properties, update_properties, get_tags, search_by_tag, get_vault_stats |
| Graph | get_backlinks, get_outgoing_links |
| Tasks | get_tasks, toggle_task |
| Daily Notes | get_daily_note, create_daily_note |
| Web | web_search, web_fetch |

## Vault Structure

On first run, the plugin creates:

```
_life/
├── profile.md     # User profile (AI learns about you over time)
├── index.md       # Vault structure guide for the AI
└── retro/         # Weekly/monthly retrospective notes
_inbox/            # Quick capture inbox
_chats/            # Daily chat logs
```

## License

MIT
