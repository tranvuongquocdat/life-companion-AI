import type Anthropic from "@anthropic-ai/sdk";

export const VAULT_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_vault",
    description:
      "Search for notes in the vault by keyword. Returns matching file paths and line content. Use this to find relevant notes before reading them.",
    input_schema: {
      type: "object" as const,
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
      type: "object" as const,
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
      type: "object" as const,
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
      type: "object" as const,
      properties: {
        from: {
          type: "string",
          description: "Current file path",
        },
        to: {
          type: "string",
          description: "New file path",
        },
      },
      required: ["from", "to"],
    },
  },
  {
    name: "list_folder",
    description:
      "List files and subfolders in a specific folder. Use this to explore vault structure.",
    input_schema: {
      type: "object" as const,
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
      type: "object" as const,
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
