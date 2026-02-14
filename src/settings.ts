import { App, PluginSettingTab, Setting } from "obsidian";
import type LifeCompanionPlugin from "./main";
import { MODEL_DISPLAY_NAMES, type ClaudeModel } from "./types";

export class LifeCompanionSettingTab extends PluginSettingTab {
  plugin: LifeCompanionPlugin;

  constructor(app: App, plugin: LifeCompanionPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Life Companion Settings" });

    // API Key
    new Setting(containerEl)
      .setName("Anthropic API Key")
      .setDesc("Get your key from console.anthropic.com")
      .addText((text) =>
        text
          .setPlaceholder("sk-ant-...")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          })
      );

    // Quick capture model
    new Setting(containerEl)
      .setName("Quick Capture Model")
      .setDesc("Model for quick note-taking (fast & cheap recommended)")
      .addDropdown((dropdown) => {
        for (const [id, name] of Object.entries(MODEL_DISPLAY_NAMES)) {
          dropdown.addOption(id, name);
        }
        dropdown.setValue(this.plugin.settings.quickModel);
        dropdown.onChange(async (value) => {
          this.plugin.settings.quickModel = value as ClaudeModel;
          await this.plugin.saveSettings();
        });
      });

    // Deep dive model
    new Setting(containerEl)
      .setName("Deep Dive Model")
      .setDesc("Model for brainstorming & deep thinking (more capable recommended)")
      .addDropdown((dropdown) => {
        for (const [id, name] of Object.entries(MODEL_DISPLAY_NAMES)) {
          dropdown.addOption(id, name);
        }
        dropdown.setValue(this.plugin.settings.diveModel);
        dropdown.onChange(async (value) => {
          this.plugin.settings.diveModel = value as ClaudeModel;
          await this.plugin.saveSettings();
        });
      });
  }
}
