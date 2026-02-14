import { App, TFile, TFolder, TAbstractFile, Vault } from "obsidian";

export class VaultTools {
  constructor(private app: App) {}

  async searchVault(query: string): Promise<string> {
    const files = this.app.vault.getMarkdownFiles();
    const results: { path: string; matches: string[] }[] = [];
    const queryLower = query.toLowerCase();

    for (const file of files) {
      const content = await this.app.vault.cachedRead(file);
      const lines = content.split("\n");
      const matches: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(queryLower)) {
          matches.push(`L${i + 1}: ${lines[i].trim()}`);
        }
      }

      if (file.path.toLowerCase().includes(queryLower)) {
        matches.unshift(`[filename match]`);
      }

      if (matches.length > 0) {
        results.push({ path: file.path, matches: matches.slice(0, 5) });
      }
    }

    if (results.length === 0) {
      return `No results found for "${query}".`;
    }

    return results
      .slice(0, 20)
      .map((r) => `## ${r.path}\n${r.matches.join("\n")}`)
      .join("\n\n");
  }

  async readNote(path: string): Promise<string> {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file || !(file instanceof TFile)) {
      return `File not found: ${path}`;
    }
    const content = await this.app.vault.read(file);
    return content;
  }

  async writeNote(path: string, content: string): Promise<string> {
    const existing = this.app.vault.getAbstractFileByPath(path);

    if (existing && existing instanceof TFile) {
      await this.app.vault.modify(existing, content);
      return `Updated: ${path}`;
    }

    const folderPath = path.substring(0, path.lastIndexOf("/"));
    if (folderPath) {
      const folder = this.app.vault.getAbstractFileByPath(folderPath);
      if (!folder) {
        await this.app.vault.createFolder(folderPath);
      }
    }

    await this.app.vault.create(path, content);
    return `Created: ${path}`;
  }

  async moveNote(from: string, to: string): Promise<string> {
    const file = this.app.vault.getAbstractFileByPath(from);
    if (!file) {
      return `File not found: ${from}`;
    }

    const folderPath = to.substring(0, to.lastIndexOf("/"));
    if (folderPath) {
      const folder = this.app.vault.getAbstractFileByPath(folderPath);
      if (!folder) {
        await this.app.vault.createFolder(folderPath);
      }
    }

    await this.app.vault.rename(file, to);
    return `Moved: ${from} → ${to}`;
  }

  async listFolder(path: string): Promise<string> {
    const targetPath = path || "/";
    const folder = targetPath === "/"
      ? this.app.vault.getRoot()
      : this.app.vault.getAbstractFileByPath(targetPath);

    if (!folder || !(folder instanceof TFolder)) {
      return `Folder not found: ${path}`;
    }

    const items: string[] = [];
    for (const child of folder.children) {
      if (child instanceof TFolder) {
        items.push(`📁 ${child.name}/`);
      } else if (child instanceof TFile) {
        items.push(`📄 ${child.name}`);
      }
    }

    return items.length > 0 ? items.join("\n") : "(empty folder)";
  }

  async getRecentNotes(days: number): Promise<string> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const files = this.app.vault.getMarkdownFiles();

    const recent = files
      .filter((f) => f.stat.mtime > cutoff)
      .sort((a, b) => b.stat.mtime - a.stat.mtime)
      .slice(0, 30);

    if (recent.length === 0) {
      return `No notes modified in the last ${days} days.`;
    }

    return recent
      .map((f) => {
        const date = new Date(f.stat.mtime).toISOString().split("T")[0];
        return `${date} — ${f.path}`;
      })
      .join("\n");
  }
}
