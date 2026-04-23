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
import { loadLoopGroups, loadActivePackage } from "./loopMenu.js";
import { escHtml, escAttr } from "./htmlUtils.js";
import { dispatchMessage, type RouterContext } from "./messageRouter.js";

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
// Resolved via VS Code extension API in the constructor; falls back to
// "0.0.0" if the host did not pass a version.

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
      {
        icon: "paintcan",
        label: "Customize for This Project",
        command: "openChat",
        prompt: "Customize the welcome experience for this project — detect the project type, generate taglines, configure the loop menu, set identity and North Star. Use the welcome-experience-customization skill.",
        tooltip: "Personalize sidebar, taglines, loop menu, and identity",
        hint: "chat",
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
        label: "Version",
        command: "openExternal",
        file: "https://marketplace.visualstudio.com/items?itemName=fabioc-aloha.alex-cognitive-architecture",
        tooltip: "View extension on the VS Code Marketplace",
        hint: "link",
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

// ── Provider class ────────────────────────────────────────────────

const FRECENCY_KEY = "alex.quickActionFrecency";

export class WelcomeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = VIEW_ID;

  private view?: vscode.WebviewView;
  private workspaceRoot: string;
  private frecencyData: FrecencyData;
  private readonly disposables: vscode.Disposable[] = [];
  private refreshTimer: NodeJS.Timeout | undefined;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly globalState: vscode.Memento,
    private readonly extensionVersion: string = "0.0.0",
  ) {
    this.workspaceRoot =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";
    this.frecencyData =
      globalState.get<FrecencyData>(FRECENCY_KEY) ?? createEmptyData();
  }

  dispose(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
    for (const d of this.disposables) d.dispose();
    this.disposables.length = 0;
  }

  /** Record a Quick Action use and persist with error-aware promise. */
  private recordActionUse(actionId: string): void {
    this.frecencyData = recordUse(this.frecencyData, actionId);
    Promise.resolve(this.globalState.update(FRECENCY_KEY, this.frecencyData))
      .then(undefined, (err) => {
        console.error("Alex: frecency persist failed:", err);
      });
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

  /** Re-render the sidebar with fresh health data (debounced). */
  public refresh(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = undefined;
      this.refreshNow();
    }, 100);
  }

  /** Re-render immediately, bypassing debounce. */
  private refreshNow(): void {
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

    webviewView.webview.onDidReceiveMessage((msg) =>
      this.handleMessage(msg),
    );

    // Refresh on visibility change
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.refreshNow();
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

    const ctx: RouterContext = {
      workspaceRoot: this.workspaceRoot,
      refresh: () => this.refresh(),
      vscodeUserDataPath,
    };

    dispatchMessage(msg, ctx);
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
    const sidebarCssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "sidebar.css"),
    );

    // Get health status for tagline selection
    const pulse = this.workspaceRoot ? collectHealthPulse(this.workspaceRoot) : null;
    const healthStatus = pulse?.status ?? "unknown";
    const taglineConfig = this.workspaceRoot
      ? loadTaglineConfig(this.workspaceRoot, fs, path)
      : null;
    const tagline = getTagline({ status: healthStatus, config: taglineConfig });

    // Surface active package context in the header (set via alex.setContext)
    const activePackage = this.workspaceRoot ? loadActivePackage(this.workspaceRoot) : null;
    const contextBadge = activePackage
      ? `<div class="context-badge" title="${escAttr(activePackage.path ?? "")}">
           <span class="codicon codicon-package"></span>
           <span>${escHtml(activePackage.name)}</span>
         </div>`
      : "";

    // Inject About "Version" button label dynamically (avoids reading package.json from disk)
    const setupGroups = SETUP_GROUPS.map((g) =>
      g.id === "about"
        ? {
            ...g,
            buttons: g.buttons.map((b) =>
              b.icon === "tag" && b.label === "Version"
                ? { ...b, label: `Version ${this.extensionVersion}` }
                : b,
            ),
          }
        : g,
    );

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; font-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${codiconsUri}" rel="stylesheet">
  <link href="${sidebarCssUri}" rel="stylesheet">
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
    <div class="version">v${escHtml(this.extensionVersion)}</div>
    ${contextBadge}
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
    ${renderGroups(setupGroups)}
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

    // Collapsible groups — persist expansion state per group ID.
    // The map stores the *expanded* boolean (true = open, false = collapsed),
    // matching the .expanded CSS class semantics.
    const savedGroupState = vscode.getState()?.expandedGroups || {};
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

        // Persist expansion state
        const groupId = group.dataset.groupId;
        if (groupId) {
          const state = vscode.getState() || {};
          const expandedGroups = state.expandedGroups || {};
          expandedGroups[groupId] = isExpanded;
          vscode.setState({ ...state, expandedGroups });
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

  // Friendly hint text — shown both as the hint badge tooltip and as the
  // button title fallback when no explicit tooltip is set.
  const hintText: Record<string, string> = {
    chat: "Opens Copilot Chat with this prompt",
    link: "Opens an external link in your browser",
    command: "Runs this command immediately",
  };
  const tooltipText = b.tooltip ?? (b.hint ? hintText[b.hint] : "");

  const attrs = [
    `data-command="${escAttr(b.command)}"`,
    `data-action-id="${escAttr(actionId)}"`,
    b.prompt ? `data-prompt="${escAttr(b.prompt)}"` : "",
    b.file ? `data-file="${escAttr(b.file)}"` : "",
    tooltipText ? `title="${escAttr(tooltipText)}"` : "",
    tooltipText ? `aria-label="${escAttr(b.label)} \u2014 ${escAttr(tooltipText)}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Hint badge: shows what the button does (chat/link/command)
  const hintIcons: Record<string, string> = {
    chat: "comment-discussion",
    link: "link-external",
    command: "zap",
  };
  const hint = b.hint
    ? `<span class="hint-badge" title="${escAttr(hintText[b.hint] ?? b.hint)}" aria-hidden="true"><span class="codicon codicon-${escAttr(hintIcons[b.hint])}"></span></span>`
    : "";

  return `<button class="${cls}" ${attrs}>
    <span class="codicon codicon-${escAttr(b.icon)}"></span>
    <span class="btn-label">${escHtml(b.label)}</span>
    ${hint}
  </button>`;
}


