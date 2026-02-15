export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const VAULT_TOOLS: ToolDefinition[] = [
  {
    name: "search_vault",
    description:
      "Search for notes in the vault by keyword. Returns matching file paths and line content. Use this to find relevant notes before reading them.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The keyword or phrase to search for across all notes",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "read_note",
    description:
      "Read the full content of a specific note. Use this after search_vault to read relevant notes, or when you know the exact path.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The file path relative to vault root, e.g. 'ideas/side-projects/ai-tutor.md'",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "write_note",
    description:
      "Create a new note or overwrite an existing note. Creates parent folders automatically. Use [[wiki links]] to link to other notes. IMPORTANT: Always ask the user for confirmation before writing.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "File path relative to vault root, e.g. 'ideas/side-projects/ai-tutor.md'",
        },
        content: {
          type: "string",
          description: "The full markdown content to write. Use [[wiki links]] for cross-references.",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "move_note",
    description:
      "Move or rename a note to a new path. Creates target folders automatically. IMPORTANT: Always ask the user for confirmation before moving.",
    input_schema: {
      type: "object",
      properties: {
        from: { type: "string", description: "Current file path" },
        to: { type: "string", description: "New file path" },
      },
      required: ["from", "to"],
    },
  },
  {
    name: "list_folder",
    description:
      "List files and subfolders in a specific folder. Use this to explore vault structure.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Folder path relative to vault root, e.g. 'ideas/' or '' for root",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "get_recent_notes",
    description:
      "Get recently modified notes within a time period. Useful for reviews and understanding recent activity.",
    input_schema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Number of days to look back, e.g. 7 for last week",
        },
      },
      required: ["days"],
    },
  },
];

export const KNOWLEDGE_TOOLS: ToolDefinition[] = [
  {
    name: "append_note",
    description:
      "Append content to the end of an existing note. Use when adding to a note without overwriting. IMPORTANT: Always ask user first.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path relative to vault root" },
        content: { type: "string", description: "Markdown content to append at the end" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "read_properties",
    description:
      "Read YAML frontmatter properties of a note. Returns all key-value pairs from the --- block.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path relative to vault root" },
      },
      required: ["path"],
    },
  },
  {
    name: "update_properties",
    description:
      "Set or update YAML frontmatter properties on a note. Creates frontmatter if none exists. IMPORTANT: Always ask user first.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path relative to vault root" },
        properties: {
          type: "object",
          description: 'Key-value pairs to set, e.g. {"status": "done", "tags": ["project"]}',
        },
      },
      required: ["path", "properties"],
    },
  },
  {
    name: "get_tags",
    description:
      "List all tags used across the vault with their note counts. Useful for understanding vault organization.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "search_by_tag",
    description: "Find all notes that contain a specific tag. Returns file paths.",
    input_schema: {
      type: "object",
      properties: {
        tag: {
          type: "string",
          description: "Tag to search for (with or without #), e.g. 'project' or '#project'",
        },
      },
      required: ["tag"],
    },
  },
  {
    name: "get_vault_stats",
    description:
      "Get vault statistics: total notes, folders, tags, and recent activity summary.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

export const GRAPH_TOOLS: ToolDefinition[] = [
  {
    name: "get_backlinks",
    description:
      "Get all notes that link TO a given note (incoming links). Useful for understanding note connections.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path relative to vault root" },
      },
      required: ["path"],
    },
  },
  {
    name: "get_outgoing_links",
    description:
      "Get all wiki links FROM a given note (outgoing links) and whether the targets exist.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path relative to vault root" },
      },
      required: ["path"],
    },
  },
];

export const TASK_TOOLS: ToolDefinition[] = [
  {
    name: "get_tasks",
    description:
      "Extract all tasks (- [ ] and - [x] checkboxes) from a note or all notes in a folder. Returns task text, status, file path, and line number.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File or folder path. Use '' for entire vault." },
        includeCompleted: { type: "boolean", description: "Include completed tasks (default true)" },
      },
      required: ["path"],
    },
  },
  {
    name: "toggle_task",
    description:
      "Toggle a task checkbox between done and undone at a specific line in a note.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path relative to vault root" },
        line: { type: "number", description: "Line number (1-based) of the task to toggle" },
      },
      required: ["path", "line"],
    },
  },
];

export const DAILY_TOOLS: ToolDefinition[] = [
  {
    name: "get_daily_note",
    description:
      "Get the daily note for today or a specific date. Returns content or 'not found'.",
    input_schema: {
      type: "object",
      properties: {
        date: { type: "string", description: "Date in YYYY-MM-DD format. Omit or empty for today." },
      },
      required: [],
    },
  },
  {
    name: "create_daily_note",
    description:
      "Create a daily note for today or a specific date with optional content. Uses 'Daily Notes/' folder.",
    input_schema: {
      type: "object",
      properties: {
        date: { type: "string", description: "Date in YYYY-MM-DD format. Omit or empty for today." },
        content: { type: "string", description: "Initial content. If empty, creates with a date heading." },
      },
      required: [],
    },
  },
];

export const WEB_TOOLS: ToolDefinition[] = [
  {
    name: "web_search",
    description:
      "Search the web for information using DuckDuckGo. Returns top results with titles, URLs, and snippets. Use for research, fact-checking, or finding current information.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "web_fetch",
    description:
      "Fetch and read the text content of a web page. Use after web_search to read a specific result in detail.",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The full URL to fetch (must start with http:// or https://)",
        },
      },
      required: ["url"],
    },
  },
];
