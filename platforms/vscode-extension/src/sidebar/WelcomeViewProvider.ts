import * as vscode from "vscode";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { collectHealthPulse } from "../healthPulse.js";
import {
  sortByFrecency,
  recordUse,
  createEmptyData,
  type FrecencyData,
} from "../frecency.js";
import { getTagline, loadTaglineConfig } from "../taglines.js";
import { loadLoopGroups } from "./loopMenu.js";
import { loadScheduledTasks, toggleTask, deleteTask, addTaskWizard, renderScheduledTasks, getGitHubRepoUrl, hasWorkflow, generateWorkflow, removeWorkflow, recordTaskRun, dispatchAndMonitor, getRunInfo, clearRunInfo, setupCopilotPAT, SCHEDULE_CSS } from "./scheduledTasks.js";
import { renderAgentActivity, refreshAgentActivityAsync, AGENT_ACTIVITY_CSS } from "./agentActivity.js";
import { recordTaskStart, recordTaskEnd } from "./agentMetricsCollector.js";
import { escHtml, escAttr } from "./htmlUtils.js";

const VIEW_ID = "alex.welcomeView";

/**
 * Resolve the VS Code user data directory cross-platform.
 * Windows: %APPDATA%/Code/User
 * macOS:   ~/Library/Application Support/Code/User
 * Linux:   ~/.config/Code/User
 */
function vscodeUserDataPath(): string {
  const platform = os.platform();
  if (platform === "win32") {
    return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "Code", "User");
  }
  if (platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "Code", "User");
  }
  // Linux / other
  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "Code", "User");
}

// Read extension version from package.json
const extPkgPath = path.resolve(__dirname, "..", "package.json");
const extVersion: string = (() => {
  try {
    return JSON.parse(fs.readFileSync(extPkgPath, "utf-8")).version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
})();

// ── Data-driven button/group definitions ──────────────────────────

interface ActionButton {
  /** Unique ID for frecency tracking (defaults to lowercase label) */
  id?: string;
  icon: string;
  label: string;
  command: string;
  prompt?: string;
  file?: string;
  /** Visual hint for button behavior: chat opens Copilot, link opens URL, command runs directly */
  hint?: "chat" | "link" | "command";
  /** Tooltip text shown on hover */
  tooltip?: string;
}

interface ActionGroup {
  id: string;
  label: string;
  desc?: string;
  accent?: string;
  /** Icon for the group header (codicon name) */
  icon?: string;
  /** Whether the group is collapsed by default */
  collapsed?: boolean;
  buttons: ActionButton[];
}

// Loop tab — loaded from .github/config/loop-menu.json via loadLoopGroups()

const WIKI_BASE = "https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki";

// Setup tab — Workspace config, brain status, environment, learn, about
const SETUP_GROUPS: ActionGroup[] = [
  {
    id: "workspace",
    label: "WORKSPACE",
    icon: "folder",
    desc: "Initialize and upgrade your cognitive architecture",
    collapsed: false,
    buttons: [
      {
        icon: "sync",
        label: "Initialize Workspace",
        command: "initialize",
        tooltip: "Install Alex brain files in this workspace",
        hint: "command",
      },
      {
        icon: "arrow-up",
        label: "Upgrade Architecture",
        command: "upgrade",
        tooltip: "Update to the latest brain architecture",
        hint: "command",
      },
      {
        icon: "cloud",
        label: "Setup AI-Memory",
        command: "setupAIMemory",
        tooltip: "Find or create the shared AI-Memory knowledge store",
        hint: "command",
      },
    ],
  },
  {
    id: "brain-status",
    label: "BRAIN STATUS",
    icon: "symbol-structure",
    desc: "Cognitive architecture health and maintenance",
    collapsed: false,
    buttons: [
      {
        icon: "symbol-event",
        label: "Run Dream Protocol",
        command: "dream",
        tooltip: "Run brain health check then fix issues",
        hint: "command",
      },
      {
        icon: "shield",
        label: "Brain Health Check",
        command: "brainQA",
        tooltip: "Generate brain health quality grid",
        hint: "command",
      },
      {
        icon: "check-all",
        label: "Validate Skills",
        command: "validateSkills",
        tooltip: "Check all skills for compliance",
        hint: "command",
      },
      {
        icon: "dashboard",
        label: "Token Cost Report",
        command: "tokenCostReport",
        tooltip: "Measure brain file token costs",
        hint: "command",
      },
      {
        icon: "heart",
        label: "Meditate",
        command: "openChat",
        prompt: "Run a meditation session — consolidate knowledge, review recent changes, and strengthen architecture",
        tooltip: "Knowledge consolidation session",
        hint: "chat",
      },
      {
        icon: "graph",
        label: "Self-Actualize",
        command: "openChat",
        prompt: "Run a self-actualization assessment — evaluate architecture completeness, identify growth areas, and plan improvements",
        tooltip: "Deep self-assessment and growth",
        hint: "chat",
      },
    ],
  },
  {
    id: "tools",
    label: "TOOLS",
    icon: "tools",
    desc: "Muscle-backed development utilities",
    collapsed: true,
    buttons: [
      {
        icon: "add",
        label: "New Skill",
        command: "newSkill",
        tooltip: "Scaffold a new skill from template",
        hint: "command",
      },
      {
        icon: "person-add",
        label: "New Agent",
        command: "createCustomAgent",
        tooltip: "Scaffold a custom agent with frontmatter",
        hint: "command",
      },
      {
        icon: "warning",
        label: "Lint Markdown",
        command: "markdownLint",
        tooltip: "Validate current file for converter readiness",
        hint: "command",
      },
      {
        icon: "lightbulb",
        label: "Extract Insights",
        command: "insightPipeline",
        tooltip: "Extract cross-project insights",
        hint: "command",
      },
      {
        icon: "references",
        label: "Set Package Context",
        command: "setContext",
        tooltip: "Switch active package in monorepo projects",
        hint: "command",
      },
    ],
  },
  {
    id: "user-memory",
    label: "USER MEMORY",
    icon: "notebook",
    desc: "Access your persistent memory locations",
    collapsed: true,
    buttons: [
      {
        icon: "notebook",
        label: "Memories",
        command: "openMemories",
        tooltip: "Open VS Code user memories folder",
        hint: "command",
      },

      {
        icon: "edit",
        label: "User Prompts",
        command: "openPrompts",
        tooltip: "Reusable prompt templates",
        hint: "command",
      },
      {
        icon: "server",
        label: "MCP Config",
        command: "openMcpConfig",
        tooltip: "Model Context Protocol servers",
        hint: "command",
      },
      {
        icon: "cloud",
        label: "Copilot Memory (GitHub)",
        command: "openExternal",
        file: "https://github.com/settings/copilot",
        tooltip: "Manage cloud-synced Copilot memory",
        hint: "link",
      },
    ],
  },
  {
    id: "environment",
    label: "ENVIRONMENT",
    icon: "settings-gear",
    desc: "Extension settings",
    collapsed: true,
    buttons: [
      {
        icon: "settings-gear",
        label: "Open Extension Settings",
        command: "openSettings",
        tooltip: "Configure Alex extension behavior",
        hint: "command",
      },
    ],
  },
  {
    id: "learn",
    label: "LEARN",
    icon: "book",
    desc: "Documentation and support resources",
    collapsed: true,
    buttons: [
      {
        icon: "book",
        label: "Documentation",
        command: "openExternal",
        file: `${WIKI_BASE}`,
        tooltip: "Full documentation on GitHub Wiki",
        hint: "link",
      },
      {
        icon: "comment-discussion",
        label: "User Stories",
        command: "openExternal",
        file: `${WIKI_BASE}/blog/README`,
        tooltip: "Real-world examples of working with Alex",
        hint: "link",
      },
      {
        icon: "mortar-board",
        label: "Tutorials",
        command: "openExternal",
        file: `${WIKI_BASE}/tutorials/README`,
        tooltip: "Step-by-step guides for common tasks",
        hint: "link",
      },
      {
        icon: "lightbulb",
        label: "LearnAI Playbooks",
        command: "openExternal",
        file: "https://learnai.correax.com/",
        tooltip: "80 AI playbooks for professional disciplines",
        hint: "link",
      },
      {
        icon: "bug",
        label: "Report an Issue",
        command: "openExternal",
        file: "https://github.com/fabioc-aloha/alex-cognitive-architecture/issues",
        tooltip: "Found a bug? Let us know",
        hint: "link",
      },
    ],
  },
  {
    id: "about",
    label: "ABOUT",
    icon: "info",
    collapsed: true,
    buttons: [
      {
        icon: "tag",
        label: `Version ${extVersion}`,
        command: "noop",
        tooltip: "Installed extension version",
      },
      {
        icon: "person",
        label: "Publisher: fabioc-aloha",
        command: "openExternal",
        file: "https://github.com/fabioc-aloha",
        hint: "link",
        tooltip: "View publisher on GitHub",
      },
      {
        icon: "law",
        label: "PolyForm Noncommercial 1.0.0",
        command: "openExternal",
        file: "https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/LICENSE.md",
        hint: "link",
        tooltip: "View license",
      },
    ],
  },
];

// ── URL allowlist for openExternal ────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://github.com/",
  "https://marketplace.visualstudio.com/",
  "https://learnai.correax.com/",
];

// ── Provider class ────────────────────────────────────────────────

const FRECENCY_KEY = "alex.quickActionFrecency";

export class WelcomeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = VIEW_ID;

  private view?: vscode.WebviewView;
  private workspaceRoot: string;
  private frecencyData: FrecencyData;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly globalState: vscode.Memento,
  ) {
    this.workspaceRoot =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";
    this.frecencyData =
      globalState.get<FrecencyData>(FRECENCY_KEY) ?? createEmptyData();
  }

  dispose(): void {
    for (const d of this.disposables) d.dispose();
    this.disposables.length = 0;
  }

  /** Record a Quick Action use and persist */
  private recordActionUse(actionId: string): void {
    this.frecencyData = recordUse(this.frecencyData, actionId);
    this.globalState.update(FRECENCY_KEY, this.frecencyData);
  }

  /** Load Loop groups from config, caching the result for the session */
  private loopGroupsCache: ActionGroup[] | null = null;
  private getLoopGroups(): ActionGroup[] {
    if (!this.loopGroupsCache) {
      this.loopGroupsCache = this.workspaceRoot
        ? loadLoopGroups(this.workspaceRoot)
        : [];
    }
    return this.loopGroupsCache;
  }

  /** Render groups with frecency-sorted buttons (except creative-loop which has deliberate order) */
  private renderGroupsWithFrecency(groups: ActionGroup[]): string {
    const sortedGroups = groups.map((g) => {
      // Keep creative-loop in deliberate order (Ideate → Plan → Build → Test → Release → Improve)
      if (g.id === "creative-loop") return g;

      // Get action IDs and sort by frecency
      const buttonIds = g.buttons.map(
        (b) => b.id ?? b.label.toLowerCase().replace(/\s+/g, "-"),
      );
      const sortedIds = sortByFrecency(buttonIds, this.frecencyData);

      // Reorder buttons by sorted IDs
      const sortedButtons = sortedIds
        .map((id) =>
          g.buttons.find(
            (b) => (b.id ?? b.label.toLowerCase().replace(/\s+/g, "-")) === id,
          ),
        )
        .filter((b): b is ActionButton => b !== undefined);

      return { ...g, buttons: sortedButtons };
    });

    return renderGroups(sortedGroups);
  }

  /** Re-render the sidebar with fresh health data */
  public refresh(): void {
    this.loopGroupsCache = null;
    if (this.view) {
      this.view.webview.html = this.getHtml(this.view.webview);
    }
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    // Kick off async agent activity fetch — sidebar renders instantly from cache
    if (this.workspaceRoot) {
      void refreshAgentActivityAsync(this.workspaceRoot, () => this.refresh());
    }

    webviewView.webview.onDidReceiveMessage((msg) =>
      this.handleMessage(msg),
    );

    // Refresh on visibility change
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.refresh();
      }
    });
  }

  private async handleMessage(
    msg: { command: string; prompt?: string; file?: string; actionId?: string },
  ): Promise<void> {
    // Track frecency for Quick Actions
    if (msg.actionId) {
      this.recordActionUse(msg.actionId);
    }

    switch (msg.command) {
      case "openChat":
        if (msg.prompt) {
          // Prompts ending with ": " expect user to continue typing — use isPartialQuery
          // Complete prompts (like /commands) should auto-submit
          const needsUserInput = msg.prompt.endsWith(": ");
          await vscode.commands.executeCommand("workbench.action.chat.open", {
            query: msg.prompt,
            isPartialQuery: needsUserInput,
          });
        } else {
          await vscode.commands.executeCommand("workbench.action.chat.open");
        }
        break;

      case "initialize":
        await vscode.commands.executeCommand("alex.initialize");
        break;

      case "upgrade":
        await vscode.commands.executeCommand("alex.upgrade");
        break;

      case "setupAIMemory":
        await vscode.commands.executeCommand("alex.setupAIMemory");
        break;

      case "dream":
        await vscode.commands.executeCommand("alex.dream");
        break;

      case "brainQA":
        await vscode.commands.executeCommand("alex.brainQA");
        break;

      case "validateSkills":
        await vscode.commands.executeCommand("alex.validateSkills");
        break;

      case "tokenCostReport":
        await vscode.commands.executeCommand("alex.tokenCostReport");
        break;

      case "newSkill":
        await vscode.commands.executeCommand("alex.newSkill");
        break;

      case "createCustomAgent":
        await vscode.commands.executeCommand("alex.createCustomAgent");
        break;

      case "markdownLint":
        await vscode.commands.executeCommand("alex.markdownLint");
        break;

      case "insightPipeline":
        await vscode.commands.executeCommand("alex.insightPipeline");
        break;

      case "setContext":
        await vscode.commands.executeCommand("alex.setContext");
        break;

      case "openSettings":
        await vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "alex",
        );
        break;

      case "openMemories":
        // Open the Copilot memories folder in the file explorer
        {
          const memoriesPath = vscode.Uri.file(
            path.join(
              vscodeUserDataPath(),
              "globalStorage",
              "github.copilot-chat",
              "memory-tool",
              "memories",
            ),
          );
          // Try to reveal in file explorer, or open in VS Code if folder exists
          try {
            await vscode.commands.executeCommand("revealFileInOS", memoriesPath);
          } catch {
            // Fallback: try to open folder in VS Code
            await vscode.commands.executeCommand("vscode.openFolder", memoriesPath, { forceNewWindow: false });
          }
        }
        break;



      case "openPrompts":
        // Open the User prompts folder
        {
          const promptsPath = vscode.Uri.file(
            path.join(vscodeUserDataPath(), "prompts"),
          );
          try {
            await vscode.commands.executeCommand("revealFileInOS", promptsPath);
          } catch {
            await vscode.commands.executeCommand("vscode.openFolder", promptsPath, { forceNewWindow: false });
          }
        }
        break;

      case "openMcpConfig":
        // Open the MCP config file directly in VS Code
        {
          const mcpPath = vscode.Uri.file(
            path.join(vscodeUserDataPath(), "mcp.json"),
          );
          await vscode.commands.executeCommand("vscode.open", mcpPath);
        }
        break;

      case "openExternal":
        if (msg.file) {
          const url = String(msg.file);
          if (ALLOWED_ORIGINS.some((origin) => url.startsWith(origin))) {
            await vscode.env.openExternal(vscode.Uri.parse(url));
          }
        }
        break;

      case "refresh":
        this.refresh();
        break;

      case "toggleTask":
        if (this.workspaceRoot && msg.file) {
          const updated = toggleTask(this.workspaceRoot, msg.file);
          if (updated) {
            this.refresh();
            const task = updated.find((t) => t.id === msg.file);
            if (task) {
              const verb = task.enabled ? "enabled" : "disabled";
              const wfNote = task.enabled
                ? "Workflow created."
                : "Workflow removed.";
              vscode.window.showInformationMessage(
                `Task "${task.name}" ${verb}. ${wfNote} Commit & push to activate on GitHub.`,
              );
            }
          }
        }
        break;

      case "addTask":
        if (this.workspaceRoot) {
          const added = await addTaskWizard(this.workspaceRoot);
          if (added) this.refresh();
        }
        break;

      case "setupCopilotPAT":
        if (this.workspaceRoot) {
          await setupCopilotPAT(this.workspaceRoot);
          this.refresh();
        }
        break;

      case "deleteTask":
        if (this.workspaceRoot && msg.file) {
          const confirm = await vscode.window.showWarningMessage(
            `Delete task "${msg.file}"?`,
            { modal: true },
            "Delete",
          );
          if (confirm === "Delete") {
            const remaining = deleteTask(this.workspaceRoot, msg.file);
            if (remaining !== null) {
              this.refresh();
              vscode.window.showInformationMessage(
                `Task "${msg.file}" deleted. Commit & push to remove the workflow from GitHub.`,
              );
            }
          }
        }
        break;

      case "openPromptFile":
        if (this.workspaceRoot && msg.file) {
          const promptPath = path.resolve(this.workspaceRoot, msg.file);
          // Defense-in-depth: ensure resolved path stays within workspace (case-insensitive on Windows)
          if (!promptPath.toLowerCase().startsWith(this.workspaceRoot.toLowerCase() + path.sep) &&
              promptPath.toLowerCase() !== this.workspaceRoot.toLowerCase()) break;
          if (fs.existsSync(promptPath)) {
            await vscode.commands.executeCommand(
              "vscode.open",
              vscode.Uri.file(promptPath),
            );
          } else {
            vscode.window.showWarningMessage(
              `Prompt file not found: ${msg.file}`,
            );
          }
        }
        break;

      case "runTask":
        if (this.workspaceRoot && msg.file) {
          const repoUrl = getGitHubRepoUrl(this.workspaceRoot);
          const wfExists = hasWorkflow(this.workspaceRoot, msg.file);
          recordTaskRun(this.workspaceRoot, msg.file);
          this.refresh();
          if (repoUrl && wfExists) {
            // Cloud dispatch via GitHub API + poll for status
            try {
              const pollDisposable = await dispatchAndMonitor(repoUrl, msg.file, (_info) => {
                this.refresh(); // re-render card with updated status
              }, this.workspaceRoot);
              this.disposables.push(pollDisposable);
              vscode.window.showInformationMessage(
                `Workflow dispatched for "${msg.file}". Monitoring execution…`,
              );
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : String(err);
              vscode.window.showErrorMessage(`Failed to dispatch workflow: ${errMsg}`);
            }
          } else {
            // Local fallback — send prompt to Copilot Chat
            const localRunKey = recordTaskStart(msg.file);
            const tasks = loadScheduledTasks(this.workspaceRoot);
            const task = tasks.find((t) => t.id === msg.file);
            if (task?.promptFile) {
              const promptPath = path.resolve(this.workspaceRoot, task.promptFile);
              const wsLower = this.workspaceRoot.toLowerCase() + path.sep;
              if (!promptPath.toLowerCase().startsWith(wsLower)) break;
              if (fs.existsSync(promptPath)) {
                const promptContent = fs.readFileSync(promptPath, "utf-8")
                  .replace(/^---[\s\S]*?---\s*/, "").trim();
                await vscode.commands.executeCommand("workbench.action.chat.open", {
                  query: promptContent,
                  isPartialQuery: false,
                });
                // Record as success — we handed off successfully to Copilot
                recordTaskEnd(this.workspaceRoot, localRunKey, true);
              } else {
                vscode.window.showWarningMessage(
                  `Prompt file not found: ${task.promptFile}`,
                );
                recordTaskEnd(this.workspaceRoot, localRunKey, false);
              }
            } else {
              recordTaskEnd(this.workspaceRoot, localRunKey, false);
            }
          }
        }
        break;

      case "clearRunStatus":
        if (msg.file) {
          clearRunInfo(msg.file);
          this.refresh();
        }
        break;

      case "openScheduleConfig":
        if (this.workspaceRoot) {
          const configPath = path.join(
            this.workspaceRoot,
            ".github",
            "config",
            "scheduled-tasks.json",
          );
          if (fs.existsSync(configPath)) {
            await vscode.commands.executeCommand(
              "vscode.open",
              vscode.Uri.file(configPath),
            );
          }
        }
        break;

      case "noop":
        break;

      case "switchTab":
        // Tab switching is handled client-side
        break;
    }
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = getNonce();
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
        "dist",
        "codicon.css",
      ),
    );

    // Get health status for tagline selection
    const pulse = this.workspaceRoot ? collectHealthPulse(this.workspaceRoot) : null;
    const healthStatus = pulse?.status ?? "unknown";
    const taglineConfig = this.workspaceRoot
      ? loadTaglineConfig(this.workspaceRoot, fs, path)
      : null;
    const tagline = getTagline({ status: healthStatus, config: taglineConfig });

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'nonce-${nonce}'; font-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${codiconsUri}" rel="stylesheet">
  <style nonce="${nonce}">
    /* ═══ Design Tokens ═══ */
    :root {
      /* Spacing scale (8px base) */
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 12px;
      --spacing-lg: 16px;
      --spacing-xl: 24px;
      
      /* Touch targets (WCAG 2.1 AA 2.5.5) */
      --touch-target: 44px;
      --touch-target-sm: 36px;
      
      /* Typography */
      --font-xs: 10px;
      --font-sm: 11px;
      --font-md: 12px;
      --font-lg: 13px;
      --font-xl: 14px;
      
      /* Brand colors */
      --accent: #6366f1;
      --accent-light: #818cf8;
      --accent-subtle: color-mix(in srgb, var(--accent) 15%, transparent);
      
      /* Component tokens */
      --radius-sm: 4px;
      --radius-md: 6px;
      --radius-lg: 8px;
      --section-gap: var(--spacing-sm);
      --btn-radius: var(--radius-md);
      
      /* Focus ring */
      --focus-ring: 2px solid var(--accent);
      --focus-ring-offset: 2px;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      padding: var(--spacing-sm) var(--spacing-md);
      overflow-y: auto;
      scroll-behavior: smooth;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--accent) 40%, transparent) transparent;
      line-height: 1.5;
    }

    /* Header — branded banner (always dark, matches Alex banner SVGs) */
    .header {
      position: relative;
      background: #0f172a;
      border-left: 4px solid var(--accent);
      padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
      margin: calc(-1 * var(--spacing-sm)) calc(-1 * var(--spacing-md)) var(--spacing-sm);
      overflow: hidden;
    }
    .header-neural {
      position: absolute;
      right: 8px;
      top: 6px;
      width: 100px;
      height: 55px;
      pointer-events: none;
    }
    .header-ghost {
      position: absolute;
      right: -4px;
      bottom: -8px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 72px;
      font-weight: 800;
      color: #f1f5f9;
      opacity: 0.06;
      pointer-events: none;
      line-height: 1;
      user-select: none;
    }
    .header-series {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 7.5px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .header h1 {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 2px;
      line-height: 1.1;
    }
    .header .tagline {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      line-height: 1.35;
    }
    .header .version {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 9px;
      color: #64748b;
      margin-top: 3px;
    }



    /* Tabs — 44px touch target (WCAG 2.1 AA 2.5.5) */
    .tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid color-mix(in srgb, var(--accent) 25%, var(--vscode-panel-border));
      margin-bottom: var(--section-gap);
    }
    .tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      min-height: var(--touch-target);
      padding: var(--spacing-md) var(--spacing-sm);
      font-size: var(--font-sm);
      font-weight: 500;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      border: none;
      border-bottom: 2px solid transparent;
      background: none;
      transition: color 0.15s, border-color 0.15s, background 0.12s;
    }
    .tab .codicon { font-size: 15px; opacity: 0.6; transition: opacity 0.12s; }
    .tab:hover { color: var(--vscode-foreground); background: var(--vscode-list-hoverBackground); }
    .tab:hover .codicon { opacity: 1; }
    .tab:focus-visible {
      outline: var(--focus-ring);
      outline-offset: -2px;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    }
    .tab.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
      font-weight: 600;
      background: var(--accent-subtle);
    }
    .tab.active .codicon { opacity: 1; }
    .tab-panel {
      display: none;
      animation: panel-fade 0.15s ease-out;
    }
    .tab-panel.active { display: block; }
    @keyframes panel-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Action groups — collapsible sections */
    .group {
      margin-bottom: var(--spacing-sm);
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .group-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-foreground);
      min-height: var(--touch-target);
      padding: var(--spacing-md) var(--spacing-lg);
      margin: 0;
      cursor: pointer;
      background: var(--accent-subtle);
      border-bottom: 1px solid transparent;
      transition: background 0.15s, border-color 0.15s;
      user-select: none;
    }
    .group-header:hover {
      background: color-mix(in srgb, var(--accent) 18%, transparent);
    }
    .group-header:focus-visible {
      outline: var(--focus-ring);
      outline-offset: -2px;
    }
    .group-header .codicon {
      font-size: 14px;
      opacity: 0.8;
      transition: color 0.15s;
    }
    .group.expanded .group-header .codicon:first-child {
      color: var(--accent);
    }
    .group-header .chevron {
      margin-left: auto;
      font-size: 13px;
      opacity: 0.5;
      transition: transform 0.2s ease-out;
    }
    .group.expanded .group-header {
      border-bottom-color: var(--vscode-panel-border);
    }
    .group.expanded .group-header .chevron {
      transform: rotate(90deg);
    }
    .group-desc {
      font-size: var(--font-sm);
      color: var(--vscode-descriptionForeground);
      padding: 0 var(--spacing-lg);
      margin: 0;
      line-height: 1.45;
      opacity: 0;
      max-height: 0;
      overflow: hidden;
      transition: opacity 0.15s, max-height 0.2s, padding 0.15s;
    }
    .group.expanded .group-desc {
      opacity: 0.85;
      max-height: 60px;
      padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-xs);
    }
    .group-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .group.expanded .group-content {
      max-height: 2000px;
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .group-buttons {
      padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-sm);
    }

    /* Buttons — 44px touch target (WCAG 2.1 AA 2.5.5) */
    .action-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      width: 100%;
      min-height: var(--touch-target);
      padding: var(--spacing-sm) var(--spacing-md);
      padding-left: calc(var(--spacing-md) + 2px);
      margin-bottom: 2px;
      font-size: var(--font-md);
      color: var(--vscode-foreground);
      background: none;
      border: none;
      border-left: 2px solid transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-align: left;
      transition: background 0.12s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s;
      position: relative;
    }
    .action-btn:hover {
      background: var(--vscode-list-hoverBackground);
      border-left-color: color-mix(in srgb, var(--accent) 50%, transparent);
    }
    .action-btn:focus-visible {
      outline: var(--focus-ring);
      outline-offset: var(--focus-ring-offset);
      box-shadow: 0 0 0 4px var(--accent-subtle);
    }
    .action-btn:active {
      transform: scale(0.99);
    }
    /* Noop buttons — informational only, not interactive */
    .action-btn[data-command="noop"] {
      cursor: default;
      opacity: 0.7;
    }
    .action-btn[data-command="noop"]:hover {
      background: none;
      border-left-color: transparent;
    }
    .action-btn .codicon {
      font-size: 15px;
      opacity: 0.7;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
      transition: opacity 0.12s;
    }
    .action-btn:hover .codicon {
      opacity: 1;
    }
    .action-btn .btn-label {
      flex: 1;
      min-width: 0;
    }
    .action-btn.primary {
      background: var(--accent);
      color: #fff;
      font-weight: 600;
      justify-content: center;
      text-align: center;
      min-height: 48px;
      padding: var(--spacing-md) var(--spacing-lg);
      margin-bottom: var(--spacing-md);
      border-radius: var(--radius-md);
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    .action-btn.primary .codicon {
      width: auto;
      opacity: 1;
    }
    .action-btn.primary:hover {
      background: var(--accent-light);
      box-shadow: 0 2px 6px rgba(0,0,0,0.18);
      border-left-color: transparent;
    }

    /* Hint badges — show button behavior (chat/link/command) */
    .hint-badge {
      font-size: var(--font-sm);
      opacity: 0.35;
      flex-shrink: 0;
      padding: var(--spacing-xs);
      border-radius: var(--radius-sm);
      transition: opacity 0.12s, background 0.12s;
    }
    .hint-badge .codicon {
      font-size: 12px;
    }
    .action-btn:hover .hint-badge {
      opacity: 0.8;
      background: var(--vscode-toolbar-hoverBackground);
    }

    /* Tooltips — positioned below to fit narrow sidebar */
    .action-btn[data-tooltip]:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      left: var(--spacing-md);
      top: 100%;
      margin-top: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-sm);
      font-weight: normal;
      color: var(--vscode-editorWidget-foreground);
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-editorWidget-border);
      border-radius: var(--radius-sm);
      white-space: nowrap;
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      animation: tooltip-fade 0.15s ease-out;
    }
    @keyframes tooltip-fade {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    ${SCHEDULE_CSS}
    ${AGENT_ACTIVITY_CSS}
  </style>
</head>
<body>
  <!-- Header — branded banner -->
  <div class="header">
    <svg class="header-neural" viewBox="0 0 120 65" aria-hidden="true">
      <line x1="25" y1="10" x2="65" y2="30" stroke="#6366f1" stroke-width="1.5" opacity="0.30"/>
      <line x1="65" y1="30" x2="45" y2="55" stroke="#818cf8" stroke-width="1.5" opacity="0.22"/>
      <line x1="25" y1="10" x2="100" y2="8" stroke="#6366f1" stroke-width="1.5" opacity="0.22"/>
      <line x1="100" y1="8" x2="65" y2="30" stroke="#818cf8" stroke-width="1.5" opacity="0.18"/>
      <line x1="65" y1="30" x2="105" y2="48" stroke="#6366f1" stroke-width="1.5" opacity="0.18"/>
      <line x1="45" y1="55" x2="105" y2="48" stroke="#818cf8" stroke-width="1.5" opacity="0.15"/>
      <circle cx="25" cy="10" r="4.5" fill="none" stroke="#6366f1" stroke-width="1.5" opacity="0.40"/>
      <circle cx="65" cy="30" r="6" fill="none" stroke="#818cf8" stroke-width="1.5" opacity="0.35"/>
      <circle cx="100" cy="8" r="3.5" fill="none" stroke="#6366f1" stroke-width="1.5" opacity="0.30"/>
      <circle cx="45" cy="55" r="4.5" fill="none" stroke="#6366f1" stroke-width="1.5" opacity="0.30"/>
      <circle cx="105" cy="48" r="3" fill="none" stroke="#818cf8" stroke-width="1.5" opacity="0.25"/>
    </svg>
    <div class="header-ghost">ALEX</div>
    <div class="header-series">Alex Cognitive Architecture</div>
    <h1>Alex</h1>
    <div class="tagline">${escHtml(tagline)}</div>
    <div class="version">v${extVersion}</div>
  </div>

  <!-- Tabs -->
  <div class="tabs" role="tablist">
    <button class="tab active" role="tab" id="tab-btn-loop" data-tab="loop" aria-selected="true" aria-controls="tab-loop">
      <span class="codicon codicon-sync"></span> Loop
    </button>
    <button class="tab" role="tab" id="tab-btn-setup" data-tab="setup" aria-selected="false" aria-controls="tab-setup">
      <span class="codicon codicon-gear"></span> Setup
    </button>
  </div>

  <!-- Loop Tab -->
  <div id="tab-loop" class="tab-panel active" role="tabpanel" aria-labelledby="tab-btn-loop">
    <!-- Chat CTA -->
    ${renderButton({ icon: "comment-discussion", label: "Chat with Alex", command: "openChat", hint: "chat" }, true)}

    ${this.renderGroupsWithFrecency(this.getLoopGroups())}
  </div>

  <!-- Setup Tab -->
  <div id="tab-setup" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-setup">
    ${renderGroups(SETUP_GROUPS)}
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    // Tab switching with state persistence
    const savedTab = vscode.getState()?.activeTab || 'loop';
    if (savedTab !== 'loop') {
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      const activeTab = document.querySelector('.tab[data-tab="' + savedTab + '"]');
      if (activeTab) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
      }
      const activePanel = document.getElementById('tab-' + savedTab);
      if (activePanel) activePanel.classList.add('active');
    }

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
        vscode.setState({ activeTab: tab.dataset.tab });
      });
    });

    // Collapsible groups — persist state
    const savedGroupState = vscode.getState()?.collapsedGroups || {};
    document.querySelectorAll('.group').forEach(group => {
      const groupId = group.dataset.groupId;
      if (groupId && savedGroupState[groupId] === false) {
        group.classList.remove('expanded');
      } else if (groupId && savedGroupState[groupId] === true) {
        group.classList.add('expanded');
      }
    });

    document.querySelectorAll('.group-header').forEach(header => {
      header.addEventListener('click', () => {
        const group = header.closest('.group');
        if (!group) return;
        const isExpanded = group.classList.toggle('expanded');
        header.setAttribute('aria-expanded', isExpanded.toString());

        // Persist collapsed state
        const groupId = group.dataset.groupId;
        if (groupId) {
          const state = vscode.getState() || {};
          const collapsedGroups = state.collapsedGroups || {};
          collapsedGroups[groupId] = isExpanded;
          vscode.setState({ ...state, collapsedGroups });
        }
      });

      // Keyboard support
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });

    // Button clicks — event delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-command]');
      if (!btn) return;
      const command = btn.dataset.command;
      const prompt = btn.dataset.prompt;
      const file = btn.dataset.file;
      const actionId = btn.dataset.actionId;
      vscode.postMessage({ command, prompt, file, actionId });
    });

    // Keyboard support for interactive elements (Enter/Space)
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = e.target.closest('[data-command][role="button"]');
      if (!el) return;
      e.preventDefault();
      el.click();
    });


  </script>
</body>
</html>`;
  }
}

// ── Helpers ───────────────────────────────────────────────────────

function getNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

function renderGroups(groups: ActionGroup[]): string {
  return groups
    .map(
      (g) => {
        const expandedClass = g.collapsed === false ? "expanded" : "";
        const iconHtml = g.icon ? `<span class="codicon codicon-${escAttr(g.icon)}"></span>` : "";
        return `
    <div class="group ${expandedClass}" data-group-id="${escAttr(g.id)}">
      <div class="group-header" role="button" tabindex="0" aria-expanded="${g.collapsed === false}">
        ${iconHtml}
        <span>${escHtml(g.label)}</span>
        <span class="codicon codicon-chevron-right chevron" aria-hidden="true"></span>
      </div>
      ${g.desc ? `<div class="group-desc">${escHtml(g.desc)}</div>` : ""}
      <div class="group-content">
        <div class="group-buttons">
          ${g.buttons.map((b) => renderButton(b)).join("")}
        </div>
      </div>
    </div>`;
      },
    )
    .join("");
}

function renderButton(b: ActionButton, primary = false): string {
  const cls = primary ? "action-btn primary" : "action-btn";
  const actionId = b.id ?? b.label.toLowerCase().replace(/\s+/g, "-");
  const attrs = [
    `data-command="${escAttr(b.command)}"`,
    `data-action-id="${escAttr(actionId)}"`,
    b.prompt ? `data-prompt="${escAttr(b.prompt)}"` : "",
    b.file ? `data-file="${escAttr(b.file)}"` : "",
    b.tooltip ? `data-tooltip="${escAttr(b.tooltip)}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Hint badge: shows what the button does (chat/link/command)
  const hintIcons: Record<string, string> = {
    chat: "comment-discussion",
    link: "link-external",
    command: "zap",
  };
  const hint = b.hint ? `<span class="hint-badge" title="${b.hint}"><span class="codicon codicon-${hintIcons[b.hint]}"></span></span>` : "";

  return `<button class="${cls}" ${attrs}>
    <span class="codicon codicon-${escAttr(b.icon)}"></span>
    <span class="btn-label">${escHtml(b.label)}</span>
    ${hint}
  </button>`;
}


