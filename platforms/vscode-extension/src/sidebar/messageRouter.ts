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
  showDiagnostics: "alex.showDiagnostics",
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
