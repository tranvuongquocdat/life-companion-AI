import { Plugin } from "obsidian";

export default class LifeCompanionPlugin extends Plugin {
  async onload() {
    console.log("Life Companion loaded");
  }

  async onunload() {
    console.log("Life Companion unloaded");
  }
}
