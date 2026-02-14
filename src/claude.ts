import Anthropic from "@anthropic-ai/sdk";
import type { ChatMode, ClaudeModel } from "./types";
import type { VaultTools } from "./vault-tools";
import { VAULT_TOOLS } from "./tool-definitions";

interface SendMessageOptions {
  userMessage: string;
  mode: ChatMode;
  model: ClaudeModel;
  systemPrompt: string;
  conversationHistory: Anthropic.MessageParam[];
  vaultTools: VaultTools;
  onText: (text: string) => void;
  onToolUse: (toolName: string, input: Record<string, unknown>) => void;
}

export class ClaudeClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }

  updateApiKey(apiKey: string) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }

  async sendMessage(options: SendMessageOptions): Promise<string> {
    const {
      userMessage,
      mode,
      model,
      systemPrompt,
      conversationHistory,
      vaultTools,
      onText,
      onToolUse,
    } = options;

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    let fullResponse = "";

    // Agentic loop — keep going while Claude wants to use tools
    while (true) {
      const response = await this.client.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        tools: VAULT_TOOLS,
        messages,
      });

      const textParts: string[] = [];
      const toolUseBlocks: Anthropic.ToolUseBlock[] = [];

      for (const block of response.content) {
        if (block.type === "text") {
          textParts.push(block.text);
          onText(block.text);
        } else if (block.type === "tool_use") {
          toolUseBlocks.push(block);
          onToolUse(block.name, block.input as Record<string, unknown>);
        }
      }

      fullResponse += textParts.join("");

      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason === "end_turn" || toolUseBlocks.length === 0) {
        break;
      }

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const result = await this.executeTool(toolUse, vaultTools);
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      messages.push({ role: "user", content: toolResults });
    }

    return fullResponse;
  }

  private async executeTool(
    toolUse: Anthropic.ToolUseBlock,
    vaultTools: VaultTools
  ): Promise<string> {
    const input = toolUse.input as Record<string, unknown>;

    try {
      switch (toolUse.name) {
        case "search_vault":
          return await vaultTools.searchVault(input.query as string);
        case "read_note":
          return await vaultTools.readNote(input.path as string);
        case "write_note":
          return await vaultTools.writeNote(
            input.path as string,
            input.content as string
          );
        case "move_note":
          return await vaultTools.moveNote(
            input.from as string,
            input.to as string
          );
        case "list_folder":
          return await vaultTools.listFolder(input.path as string);
        case "get_recent_notes":
          return await vaultTools.getRecentNotes(input.days as number);
        default:
          return `Unknown tool: ${toolUse.name}`;
      }
    } catch (error) {
      return `Error executing ${toolUse.name}: ${(error as Error).message}`;
    }
  }
}
