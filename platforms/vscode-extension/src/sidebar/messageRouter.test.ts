import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock vscode
vi.mock("vscode", () => ({
  commands: { executeCommand: vi.fn() },
  window: {
    showInformationMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    showErrorMessage: vi.fn(),
  },
  env: { openExternal: vi.fn() },
  Uri: { file: vi.fn((p: string) => ({ fsPath: p })), parse: vi.fn((u: string) => ({ url: u })) },
  workspace: { workspaceFolders: [{ uri: { fsPath: "/ws" } }] },
  authentication: { getSession: vi.fn() },
}));

// Mock scheduledTasks
vi.mock("./scheduledTasks.js", () => ({
  loadScheduledTasks: vi.fn(() => []),
  toggleTask: vi.fn(),
  deleteTask: vi.fn(),
  addTaskWizard: vi.fn(),
  getGitHubRepoUrl: vi.fn(),
  hasWorkflow: vi.fn(),
  recordTaskRun: vi.fn(),
  dispatchAndMonitor: vi.fn(),
  clearRunInfo: vi.fn(),
  setupCopilotPAT: vi.fn(),
}));

// Mock agentMetricsCollector
vi.mock("./agentMetricsCollector.js", () => ({
  recordTaskStart: vi.fn(() => "key"),
  recordTaskEnd: vi.fn(),
}));

// Mock fs
vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return { ...actual, existsSync: vi.fn(() => false), readFileSync: vi.fn() };
});

import * as vscode from "vscode";
import {
  dispatchMessage,
  getRegisteredCommands,
  type RouterContext,
} from "./messageRouter.js";

function makeCtx(overrides?: Partial<RouterContext>): RouterContext {
  return {
    workspaceRoot: "/test/workspace",
    refresh: vi.fn(),
    disposables: [],
    vscodeUserDataPath: () => "/user/data",
    ...overrides,
  };
}

describe("messageRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers all expected commands", () => {
    const cmds = getRegisteredCommands();
    expect(cmds).toContain("openChat");
    expect(cmds).toContain("initialize");
    expect(cmds).toContain("refresh");
    expect(cmds).toContain("toggleTask");
    expect(cmds).toContain("runTask");
    expect(cmds).toContain("openExternal");
    expect(cmds).toContain("noop");
    expect(cmds).toContain("switchTab");
    expect(cmds.length).toBeGreaterThanOrEqual(25);
  });

  it("returns false for unknown commands", () => {
    const result = dispatchMessage(
      { command: "nonexistent" },
      makeCtx(),
    );
    expect(result).toBe(false);
  });

  it("returns true for known commands", () => {
    const result = dispatchMessage({ command: "noop" }, makeCtx());
    expect(result).toBe(true);
  });

  it("openChat with prompt opens chat with query", async () => {
    dispatchMessage(
      { command: "openChat", prompt: "Hello Alex" },
      makeCtx(),
    );
    // Allow async handler to settle
    await vi.waitFor(() => {
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        "workbench.action.chat.open",
        expect.objectContaining({ query: "Hello Alex" }),
      );
    });
  });

  it("openChat with trailing colon-space sets isPartialQuery", async () => {
    dispatchMessage(
      { command: "openChat", prompt: "Ask about: " },
      makeCtx(),
    );
    await vi.waitFor(() => {
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        "workbench.action.chat.open",
        { query: "Ask about: ", isPartialQuery: true },
      );
    });
  });

  it("command proxies dispatch to VS Code commands", async () => {
    const proxies = ["initialize", "upgrade", "dream", "brainQA"];
    for (const cmd of proxies) {
      vi.mocked(vscode.commands.executeCommand).mockClear();
      dispatchMessage({ command: cmd }, makeCtx());
    }
    await vi.waitFor(() => {
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        "alex.brainQA",
      );
    });
  });

  it("openExternal blocks non-allowlisted URLs", () => {
    dispatchMessage(
      { command: "openExternal", file: "https://evil.com/phish" },
      makeCtx(),
    );
    expect(vscode.env.openExternal).not.toHaveBeenCalled();
  });

  it("openExternal allows GitHub URLs", async () => {
    dispatchMessage(
      { command: "openExternal", file: "https://github.com/owner/repo" },
      makeCtx(),
    );
    await vi.waitFor(() => {
      expect(vscode.env.openExternal).toHaveBeenCalled();
    });
  });

  it("refresh calls ctx.refresh", () => {
    const ctx = makeCtx();
    dispatchMessage({ command: "refresh" }, ctx);
    expect(ctx.refresh).toHaveBeenCalled();
  });

  it("clearRunStatus calls refresh", async () => {
    const ctx = makeCtx();
    dispatchMessage({ command: "clearRunStatus", file: "task-1" }, ctx);
    await vi.waitFor(() => {
      expect(ctx.refresh).toHaveBeenCalled();
    });
  });
});
