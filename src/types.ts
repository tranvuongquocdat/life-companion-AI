export type ClaudeModel = "claude-haiku-4-5" | "claude-sonnet-4-5" | "claude-opus-4-6";

export type ChatMode = "quick" | "dive";

export type AuthMode = "none" | "oauth" | "apikey";

export interface LifeCompanionSettings {
  authMode: AuthMode;
  apiKey: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number;
  defaultModel: ClaudeModel;
  quickModel: ClaudeModel;
  diveModel: ClaudeModel;
}

export const DEFAULT_SETTINGS: LifeCompanionSettings = {
  authMode: "none",
  apiKey: "",
  accessToken: "",
  refreshToken: "",
  tokenExpiresAt: 0,
  defaultModel: "claude-sonnet-4-5",
  quickModel: "claude-haiku-4-5",
  diveModel: "claude-sonnet-4-5",
};

export const MODEL_DISPLAY_NAMES: Record<ClaudeModel, string> = {
  "claude-haiku-4-5": "Haiku 4.5 (Fast, cheap)",
  "claude-sonnet-4-5": "Sonnet 4.5 (Balanced)",
  "claude-opus-4-6": "Opus 4.6 (Most capable)",
};

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
