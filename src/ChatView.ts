import { ItemView, WorkspaceLeaf } from "obsidian";
import type LifeCompanionPlugin from "./main";
import type { ChatMessage, ChatMode } from "./types";

export const VIEW_TYPE_CHAT = "life-companion-chat";

export class ChatView extends ItemView {
  plugin: LifeCompanionPlugin;
  private messagesContainer: HTMLElement;
  private inputEl: HTMLTextAreaElement;
  private sendBtn: HTMLButtonElement;
  private modeToggle: HTMLButtonElement;
  private mode: ChatMode = "quick";
  private messages: ChatMessage[] = [];

  constructor(leaf: WorkspaceLeaf, plugin: LifeCompanionPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_CHAT;
  }

  getDisplayText(): string {
    return "Life Companion";
  }

  getIcon(): string {
    return "message-circle";
  }

  async onOpen() {
    const container = this.contentEl;
    container.empty();
    container.addClass("life-companion-container");

    // Header
    const header = container.createDiv({ cls: "lc-header" });
    header.createEl("h4", { text: "Life Companion" });

    this.modeToggle = header.createEl("button", {
      cls: "lc-mode-toggle",
      text: "Quick",
    });
    this.modeToggle.addEventListener("click", () => this.toggleMode());

    // Messages area
    this.messagesContainer = container.createDiv({ cls: "lc-messages" });

    // Welcome message
    this.addAssistantMessage("Chào bạn! Mình là Life Companion. Hãy nhắn gì đó, hoặc gõ `/dive` để vào chế độ deep dive.");

    // Input area
    const inputArea = container.createDiv({ cls: "lc-input-area" });

    this.inputEl = inputArea.createEl("textarea", {
      cls: "lc-input",
      placeholder: "Nhắn gì đó...",
      attr: { rows: "3" },
    });

    this.inputEl.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    this.sendBtn = inputArea.createEl("button", {
      cls: "lc-send-btn",
      text: "Gửi",
    });
    this.sendBtn.addEventListener("click", () => this.handleSend());
  }

  async onClose() {
    this.contentEl.empty();
  }

  private toggleMode() {
    this.mode = this.mode === "quick" ? "dive" : "quick";
    this.modeToggle.textContent = this.mode === "quick" ? "Quick" : "Deep Dive";
    this.modeToggle.toggleClass("lc-mode-dive", this.mode === "dive");
  }

  private async handleSend() {
    const text = this.inputEl.value.trim();
    if (!text) return;

    // Check for /dive command
    if (text === "/dive") {
      this.mode = "dive";
      this.modeToggle.textContent = "Deep Dive";
      this.modeToggle.addClass("lc-mode-dive");
      this.addAssistantMessage("Đã chuyển sang chế độ Deep Dive. Mình sẽ cùng bạn brainstorm, research và challenge ý tưởng trước khi ghi note.");
      this.inputEl.value = "";
      return;
    }

    if (text === "/quick") {
      this.mode = "quick";
      this.modeToggle.textContent = "Quick";
      this.modeToggle.removeClass("lc-mode-dive");
      this.addAssistantMessage("Đã chuyển sang chế độ Quick Capture.");
      this.inputEl.value = "";
      return;
    }

    this.inputEl.value = "";
    this.addUserMessage(text);

    // Disable input while processing
    this.inputEl.disabled = true;
    this.sendBtn.disabled = true;

    // Show loading indicator
    const loadingEl = this.messagesContainer.createDiv({ cls: "lc-msg lc-msg-assistant lc-loading" });
    loadingEl.textContent = "Đang suy nghĩ...";
    this.scrollToBottom();

    try {
      loadingEl.remove();
      await this.plugin.handleMessage(text, this.mode, this);
    } finally {
      loadingEl.remove();
      this.inputEl.disabled = false;
      this.sendBtn.disabled = false;
      this.inputEl.focus();
    }
  }

  addUserMessage(text: string) {
    const msg: ChatMessage = { role: "user", content: text, timestamp: Date.now() };
    this.messages.push(msg);
    const el = this.messagesContainer.createDiv({ cls: "lc-msg lc-msg-user" });
    el.textContent = text;
    this.scrollToBottom();
  }

  addAssistantMessage(text: string) {
    const msg: ChatMessage = { role: "assistant", content: text, timestamp: Date.now() };
    this.messages.push(msg);
    const el = this.messagesContainer.createDiv({ cls: "lc-msg lc-msg-assistant" });
    el.textContent = text;
    this.scrollToBottom();
  }

  createStreamingMessage(): HTMLElement {
    const el = this.messagesContainer.createDiv({ cls: "lc-msg lc-msg-assistant" });
    this.scrollToBottom();
    return el;
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}
