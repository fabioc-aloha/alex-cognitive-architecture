/**
 * Typed message router for sidebar webview messages.
 *
 * Maps command strings to handler functions, making each handler
 * independently testable without the full WelcomeViewProvider.
 */
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

/** Message shape from the webview. */
export interface WebviewMessage {
  command: string;
  prompt?: string;
  file?: string;
  actionId?: string;
}

/** Dependencies injected by WelcomeViewProvider. */
export interface RouterContext {
  workspaceRoot: string | undefined;
  refresh: () => void;
  disposables: vscode.Disposable[];
  vscodeUserDataPath: () => string;
}

/** A single message handler. */
type MessageHandler = (
  msg: WebviewMessage,
  ctx: RouterContext,
) => Promise<void> | void;

/** The route table — maps command names to handlers. */
const routes: Record<string, MessageHandler> = {};

/** Register a route. */
function route(command: string, handler: MessageHandler): void {
  routes[command] = handler;
}

/**
 * Dispatch a webview message to the registered handler.
 * Returns true if a handler was found.
 */
export function dispatchMessage(
  msg: WebviewMessage,
  ctx: RouterContext,
): boolean {
  const handler = routes[msg.command];
  if (!handler) return false;
  // Fire-and-forget — errors are caught by the caller
  void handler(msg, ctx);
  return true;
}

/** Get all registered command names (for testing). */
export function getRegisteredCommands(): string[] {
  return Object.keys(routes);
}

// ── Route Registrations ───────────────────────────────────────────

// Import scheduledTasks lazily to avoid circular dependency
import {
  loadScheduledTasks,
  toggleTask,
  deleteTask,
  addTaskWizard,
  getGitHubRepoUrl,
  hasWorkflow,
  recordTaskRun,
  dispatchAndMonitor,
  clearRunInfo,
  setupCopilotPAT,
} from "./scheduledTasks.js";
import { recordTaskStart, recordTaskEnd } from "./agentMetricsCollector.js";

// ── Chat ──────────────────────────────────────────────────────────

route("openChat", async (msg) => {
  if (msg.prompt) {
    const needsUserInput = msg.prompt.endsWith(": ");
    await vscode.commands.executeCommand("workbench.action.chat.open", {
      query: msg.prompt,
      isPartialQuery: needsUserInput,
    });
  } else {
    await vscode.commands.executeCommand("workbench.action.chat.open");
  }
});

// ── Simple Command Proxies ────────────────────────────────────────

const COMMAND_PROXIES: Record<string, string> = {
  initialize: "alex.initialize",
  upgrade: "alex.upgrade",
  setupAIMemory: "alex.setupAIMemory",
  dream: "alex.dream",
  brainQA: "alex.brainQA",
  validateSkills: "alex.validateSkills",
  tokenCostReport: "alex.tokenCostReport",
  newSkill: "alex.newSkill",
  createCustomAgent: "alex.createCustomAgent",
  markdownLint: "alex.markdownLint",
  insightPipeline: "alex.insightPipeline",
  setContext: "alex.setContext",
};

for (const [cmd, vsCmd] of Object.entries(COMMAND_PROXIES)) {
  route(cmd, async () => {
    await vscode.commands.executeCommand(vsCmd);
  });
}

// ── Settings & Folders ────────────────────────────────────────────

route("openSettings", async () => {
  await vscode.commands.executeCommand(
    "workbench.action.openSettings",
    "alex",
  );
});

const ALLOWED_ORIGINS = [
  "https://github.com/",
  "https://marketplace.visualstudio.com/",
  "https://learnai.correax.com/",
];

route("openExternal", async (msg) => {
  if (msg.file) {
    const url = String(msg.file);
    if (ALLOWED_ORIGINS.some((origin) => url.startsWith(origin))) {
      await vscode.env.openExternal(vscode.Uri.parse(url));
    }
  }
});

route("openMemories", async (_msg, ctx) => {
  const memoriesPath = vscode.Uri.file(
    path.join(
      ctx.vscodeUserDataPath(),
      "globalStorage",
      "github.copilot-chat",
      "memory-tool",
      "memories",
    ),
  );
  try {
    await vscode.commands.executeCommand("revealFileInOS", memoriesPath);
  } catch {
    await vscode.commands.executeCommand("vscode.openFolder", memoriesPath, {
      forceNewWindow: false,
    });
  }
});

route("openPrompts", async (_msg, ctx) => {
  const promptsPath = vscode.Uri.file(
    path.join(ctx.vscodeUserDataPath(), "prompts"),
  );
  try {
    await vscode.commands.executeCommand("revealFileInOS", promptsPath);
  } catch {
    await vscode.commands.executeCommand("vscode.openFolder", promptsPath, {
      forceNewWindow: false,
    });
  }
});

route("openMcpConfig", async (_msg, ctx) => {
  const mcpPath = vscode.Uri.file(
    path.join(ctx.vscodeUserDataPath(), "mcp.json"),
  );
  await vscode.commands.executeCommand("vscode.open", mcpPath);
});

// ── Refresh & No-ops ──────────────────────────────────────────────

route("refresh", (_msg, ctx) => {
  ctx.refresh();
});

route("noop", () => {});
route("switchTab", () => {}); // Handled client-side

// ── Scheduled Tasks ───────────────────────────────────────────────

route("toggleTask", (_msg, ctx) => {
  if (ctx.workspaceRoot && _msg.file) {
    const updated = toggleTask(ctx.workspaceRoot, _msg.file);
    if (updated) {
      ctx.refresh();
      const task = updated.find((t) => t.id === _msg.file);
      if (task) {
        const verb = task.enabled ? "enabled" : "disabled";
        const wfNote = task.enabled ? "Workflow created." : "Workflow removed.";
        vscode.window.showInformationMessage(
          `Task "${task.name}" ${verb}. ${wfNote} Commit & push to activate on GitHub.`,
        );
      }
    }
  }
});

route("addTask", async (_msg, ctx) => {
  if (ctx.workspaceRoot) {
    const added = await addTaskWizard(ctx.workspaceRoot);
    if (added) ctx.refresh();
  }
});

route("setupCopilotPAT", async (_msg, ctx) => {
  if (ctx.workspaceRoot) {
    await setupCopilotPAT(ctx.workspaceRoot);
    ctx.refresh();
  }
});

route("deleteTask", async (msg, ctx) => {
  if (ctx.workspaceRoot && msg.file) {
    const confirm = await vscode.window.showWarningMessage(
      `Delete task "${msg.file}"?`,
      { modal: true },
      "Delete",
    );
    if (confirm === "Delete") {
      const remaining = deleteTask(ctx.workspaceRoot, msg.file);
      if (remaining !== null) {
        ctx.refresh();
        vscode.window.showInformationMessage(
          `Task "${msg.file}" deleted. Commit & push to remove the workflow from GitHub.`,
        );
      }
    }
  }
});

route("openPromptFile", async (msg, ctx) => {
  if (ctx.workspaceRoot && msg.file) {
    const promptPath = path.resolve(ctx.workspaceRoot, msg.file);
    // Defense-in-depth: path traversal guard
    if (
      !promptPath
        .toLowerCase()
        .startsWith(ctx.workspaceRoot.toLowerCase() + path.sep) &&
      promptPath.toLowerCase() !== ctx.workspaceRoot.toLowerCase()
    )
      return;
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
});

route("runTask", async (msg, ctx) => {
  if (ctx.workspaceRoot && msg.file) {
    const repoUrl = getGitHubRepoUrl(ctx.workspaceRoot);
    const wfExists = hasWorkflow(ctx.workspaceRoot, msg.file);
    recordTaskRun(ctx.workspaceRoot, msg.file);
    ctx.refresh();
    if (repoUrl && wfExists) {
      try {
        const pollDisposable = await dispatchAndMonitor(
          repoUrl,
          msg.file,
          () => ctx.refresh(),
          ctx.workspaceRoot,
        );
        ctx.disposables.push(pollDisposable);
        vscode.window.showInformationMessage(
          `Workflow dispatched for "${msg.file}". Monitoring execution…`,
        );
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(
          `Failed to dispatch workflow: ${errMsg}`,
        );
      }
    } else {
      const localRunKey = recordTaskStart(msg.file);
      const tasks = loadScheduledTasks(ctx.workspaceRoot);
      const task = tasks.find((t) => t.id === msg.file);
      if (task?.promptFile) {
        const promptPath = path.resolve(ctx.workspaceRoot, task.promptFile);
        const wsLower = ctx.workspaceRoot.toLowerCase() + path.sep;
        if (!promptPath.toLowerCase().startsWith(wsLower)) return;
        if (fs.existsSync(promptPath)) {
          const promptContent = fs
            .readFileSync(promptPath, "utf-8")
            .replace(/^---[\s\S]*?---\s*/, "")
            .trim();
          await vscode.commands.executeCommand(
            "workbench.action.chat.open",
            { query: promptContent, isPartialQuery: false },
          );
          recordTaskEnd(ctx.workspaceRoot, localRunKey, true);
        } else {
          vscode.window.showWarningMessage(
            `Prompt file not found: ${task.promptFile}`,
          );
          recordTaskEnd(ctx.workspaceRoot, localRunKey, false);
        }
      } else {
        recordTaskEnd(ctx.workspaceRoot, localRunKey, false);
      }
    }
  }
});

route("clearRunStatus", (msg, ctx) => {
  if (msg.file) {
    clearRunInfo(msg.file);
    ctx.refresh();
  }
});

route("openScheduleConfig", async (_msg, ctx) => {
  if (ctx.workspaceRoot) {
    const configPath = path.join(
      ctx.workspaceRoot,
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
});
