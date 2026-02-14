import { Plugin } from "obsidian";
import { LifeCompanionSettingTab } from "./settings";
import { DEFAULT_SETTINGS, type LifeCompanionSettings } from "./types";

export default class LifeCompanionPlugin extends Plugin {
  settings: LifeCompanionSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new LifeCompanionSettingTab(this.app, this));
    console.log("Life Companion loaded");
  }

  async onunload() {
    console.log("Life Companion unloaded");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
