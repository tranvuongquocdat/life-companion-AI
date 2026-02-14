import { Notice, Plugin } from "obsidian";
import { ChatView, VIEW_TYPE_CHAT } from "./ChatView";
import { ChatHistory } from "./chat-history";
import { ClaudeClient } from "./claude";
import { ProfileManager } from "./profile";
import { buildSystemPrompt } from "./prompts";
import { LifeCompanionSettingTab } from "./settings";
import { refreshAccessToken } from "./auth";
import {
  DEFAULT_SETTINGS,
  type ChatMode,
  type LifeCompanionSettings,
} from "./types";
import { VaultTools } from "./vault-tools";
import type Anthropic from "@anthropic-ai/sdk";

export default class LifeCompanionPlugin extends Plugin {
  settings: LifeCompanionSettings;
  claudeClient: ClaudeClient | null = null;
  vaultTools: VaultTools;
  profileManager: ProfileManager;
  conversationHistory: Anthropic.MessageParam[] = [];

  async onload() {
    await this.loadSettings();

    this.vaultTools = new VaultTools(this.app);
    this.profileManager = new ProfileManager(this.app);

    this.initClaudeClient();

    this.registerView(VIEW_TYPE_CHAT, (leaf) => new ChatView(leaf, this));

    this.addRibbonIcon("message-circle", "Life Companion", () => {
      this.activateView();
    });

    this.addCommand({
      id: "open-chat",
      name: "Open Life Companion",
      callback: () => this.activateView(),
    });

    this.addSettingTab(new LifeCompanionSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(async () => {
      await this.profileManager.ensureLifeFolder();
    });
  }

  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CHAT);
  }

  private initClaudeClient() {
    if (this.settings.authMode === "oauth" && this.settings.accessToken) {
      this.claudeClient = new ClaudeClient({ accessToken: this.settings.accessToken });
    } else if (this.settings.authMode === "apikey" && this.settings.apiKey) {
      this.claudeClient = new ClaudeClient({ apiKey: this.settings.apiKey });
    } else {
      this.claudeClient = null;
    }
  }

  private async ensureValidToken(): Promise<boolean> {
    if (this.settings.authMode !== "oauth") return true;

    // Refresh if token expires within 5 minutes
    if (Date.now() > this.settings.tokenExpiresAt - 5 * 60 * 1000) {
      try {
        const tokens = await refreshAccessToken(this.settings.refreshToken);
        this.settings.accessToken = tokens.accessToken;
        this.settings.refreshToken = tokens.refreshToken;
        this.settings.tokenExpiresAt = tokens.expiresAt;
        await this.saveData(this.settings);
        this.claudeClient = new ClaudeClient({ accessToken: tokens.accessToken });
      } catch (error) {
        new Notice("Token hết hạn. Vui lòng đăng nhập lại.");
        this.settings.authMode = "none";
        this.settings.accessToken = "";
        this.settings.refreshToken = "";
        await this.saveData(this.settings);
        return false;
      }
    }
    return true;
  }

  async activateView() {
    const { workspace } = this.app;
    workspace.detachLeavesOfType(VIEW_TYPE_CHAT);

    const leaf = workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: VIEW_TYPE_CHAT, active: true });
      workspace.revealLeaf(leaf);
    }
  }

  async handleMessage(text: string, mode: ChatMode, view: ChatView) {
    if (this.settings.authMode === "none") {
      view.addAssistantMessage(
        "Chưa đăng nhập. Vào Settings → Life Companion → Đăng nhập với Claude nhé."
      );
      return;
    }

    // Refresh OAuth token if needed
    if (!(await this.ensureValidToken())) {
      view.addAssistantMessage("Token hết hạn. Vui lòng đăng nhập lại trong Settings.");
      return;
    }

    if (!this.claudeClient) {
      this.initClaudeClient();
    }

    if (!this.claudeClient) {
      view.addAssistantMessage("Không thể kết nối với Claude. Vui lòng đăng nhập lại.");
      return;
    }

    const model = mode === "quick" ? this.settings.quickModel : this.settings.diveModel;

    try {
      const profile = await this.profileManager.getProfile();
      const index = await this.profileManager.getIndex();
      const systemPrompt = buildSystemPrompt(profile, index, mode);

      const streamEl = view.createStreamingMessage();
      let accumulatedText = "";

      const response = await this.claudeClient.sendMessage({
        userMessage: text,
        mode,
        model,
        systemPrompt,
        conversationHistory: this.conversationHistory,
        vaultTools: this.vaultTools,
        onText: (chunk) => {
          accumulatedText += chunk;
          streamEl.textContent = accumulatedText;
          view.scrollToBottom();
        },
        onToolUse: (name) => {
          const toolMsg = `🔧 ${name}...`;
          if (!accumulatedText.includes(toolMsg)) {
            accumulatedText += `\n${toolMsg}\n`;
            streamEl.textContent = accumulatedText;
          }
        },
      });

      this.conversationHistory.push(
        { role: "user", content: text },
        { role: "assistant", content: response }
      );

      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      const chatHistory = new ChatHistory(this.app);
      await chatHistory.saveMessage({ role: "user", content: text, timestamp: Date.now() });
      await chatHistory.saveMessage({ role: "assistant", content: response, timestamp: Date.now() });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      view.addAssistantMessage(`Lỗi: ${msg}`);
      new Notice(`Life Companion error: ${msg}`);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.initClaudeClient();
  }
}
