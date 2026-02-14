import { Plugin } from "obsidian";
import { ChatView, VIEW_TYPE_CHAT } from "./ChatView";
import { LifeCompanionSettingTab } from "./settings";
import { DEFAULT_SETTINGS, type ChatMode, type LifeCompanionSettings } from "./types";

export default class LifeCompanionPlugin extends Plugin {
  settings: LifeCompanionSettings;

  async onload() {
    await this.loadSettings();

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
  }

  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CHAT);
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
    // Placeholder — will be implemented in Task 7
    view.addAssistantMessage("(Claude API chưa kết nối — sẽ implement ở bước tiếp)");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
