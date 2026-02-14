import { App, Modal, Notice, PluginSettingTab, Setting } from "obsidian";
import type LifeCompanionPlugin from "./main";
import { MODEL_DISPLAY_NAMES, type ClaudeModel } from "./types";
import { startOAuthFlow, exchangeCodeForTokens, type OAuthState } from "./auth";

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

    // Auth section
    containerEl.createEl("h3", { text: "Authentication" });

    if (this.plugin.settings.authMode !== "none") {
      new Setting(containerEl)
        .setName("Status")
        .setDesc(this.plugin.settings.authMode === "oauth" ? "Đã kết nối qua Claude (OAuth)" : "Đã kết nối qua API Key")
        .addButton((btn) =>
          btn.setButtonText("Đăng xuất").onClick(async () => {
            this.plugin.settings.authMode = "none";
            this.plugin.settings.apiKey = "";
            this.plugin.settings.accessToken = "";
            this.plugin.settings.refreshToken = "";
            this.plugin.settings.tokenExpiresAt = 0;
            await this.plugin.saveSettings();
            this.display();
          })
        );
    } else {
      new Setting(containerEl)
        .setName("Đăng nhập")
        .setDesc("Đăng nhập bằng tài khoản Anthropic (giống Claude Code)")
        .addButton((btn) =>
          btn
            .setButtonText("Đăng nhập với Claude")
            .setCta()
            .onClick(async () => {
              try {
                const { url, oauthState } = await startOAuthFlow();
                window.open(url);
                new OAuthCodeModal(this.app, this.plugin, oauthState, () =>
                  this.display()
                ).open();
              } catch (e) {
                new Notice(`Lỗi: ${(e as Error).message}`);
              }
            })
        );

      // Fallback: manual API key
      new Setting(containerEl)
        .setName("Hoặc nhập API Key thủ công")
        .setDesc("Lấy key từ console.anthropic.com")
        .addText((text) =>
          text
            .setPlaceholder("sk-ant-...")
            .setValue(this.plugin.settings.apiKey)
            .onChange(async (value) => {
              this.plugin.settings.apiKey = value;
              this.plugin.settings.authMode = value ? "apikey" : "none";
              await this.plugin.saveSettings();
            })
        );
    }

    // Model section
    containerEl.createEl("h3", { text: "Models" });

    new Setting(containerEl)
      .setName("Quick Capture Model")
      .setDesc("Model cho ghi chú nhanh (nên dùng fast & cheap)")
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

    new Setting(containerEl)
      .setName("Deep Dive Model")
      .setDesc("Model cho brainstorm & suy nghĩ sâu (nên dùng capable)")
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

class OAuthCodeModal extends Modal {
  private plugin: LifeCompanionPlugin;
  private oauthState: OAuthState;
  private onSuccess: () => void;

  constructor(
    app: App,
    plugin: LifeCompanionPlugin,
    oauthState: OAuthState,
    onSuccess: () => void
  ) {
    super(app);
    this.plugin = plugin;
    this.oauthState = oauthState;
    this.onSuccess = onSuccess;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Đăng nhập với Claude" });
    contentEl.createEl("p", {
      text: "1. Trình duyệt đã mở trang đăng nhập Anthropic",
    });
    contentEl.createEl("p", {
      text: "2. Đăng nhập và cho phép truy cập",
    });
    contentEl.createEl("p", {
      text: "3. Copy code từ trang web và paste vào đây:",
    });

    const inputEl = contentEl.createEl("input", {
      type: "text",
      placeholder: "Paste authorization code...",
      cls: "lc-oauth-input",
    });
    inputEl.style.cssText = "width:100%; padding:8px; margin:8px 0; font-size:14px;";

    const statusEl = contentEl.createDiv({ cls: "lc-oauth-status" });
    statusEl.style.cssText = "margin:8px 0; font-size:13px;";

    const btnContainer = contentEl.createDiv();
    btnContainer.style.cssText = "display:flex; gap:8px; margin-top:12px;";

    const submitBtn = btnContainer.createEl("button", { text: "Xác nhận" });
    submitBtn.style.cssText = "flex:1;";

    const cancelBtn = btnContainer.createEl("button", { text: "Huỷ" });

    submitBtn.addEventListener("click", async () => {
      const code = inputEl.value.trim();
      if (!code) {
        statusEl.textContent = "Vui lòng nhập code.";
        return;
      }

      submitBtn.disabled = true;
      statusEl.textContent = "Đang xác thực...";

      try {
        const tokens = await exchangeCodeForTokens(code, this.oauthState);
        this.plugin.settings.authMode = "oauth";
        this.plugin.settings.accessToken = tokens.accessToken;
        this.plugin.settings.refreshToken = tokens.refreshToken;
        this.plugin.settings.tokenExpiresAt = tokens.expiresAt;
        await this.plugin.saveSettings();
        new Notice("Đăng nhập thành công!");
        this.close();
        this.onSuccess();
      } catch (e) {
        statusEl.textContent = `Lỗi: ${(e as Error).message}`;
        submitBtn.disabled = false;
      }
    });

    cancelBtn.addEventListener("click", () => this.close());
  }

  onClose() {
    this.contentEl.empty();
  }
}
