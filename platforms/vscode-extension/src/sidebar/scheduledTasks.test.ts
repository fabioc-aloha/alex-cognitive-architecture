import { describe, it, expect, vi, beforeEach } from "vitest";
import * as path from "path";

// Mock vscode
vi.mock("vscode", () => ({
  window: {
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    createTerminal: vi.fn(),
  },
  workspace: { workspaceFolders: [{ uri: { fsPath: "/test" } }] },
  authentication: { getSession: vi.fn() },
  env: { openExternal: vi.fn() },
  Uri: { parse: vi.fn() },
  commands: { executeCommand: vi.fn() },
}));

// Mock agentMetricsCollector
vi.mock("./agentMetricsCollector.js", () => ({
  recordTaskStart: vi.fn(() => "metrics-key"),
  recordTaskEnd: vi.fn(),
}));

// Mock fs
vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return {
    ...actual,
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(() => {
      throw new Error("ENOENT");
    }),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

// Mock child_process
vi.mock("child_process", () => ({
  execFileSync: vi.fn(),
}));

import * as fs from "fs";
import {
  topologicalSort,
  checkDependencies,
  getGitHubRepoUrl,
  getTaskState,
  recordTaskRun,
  type ScheduledTask,
} from "./scheduledTasks.js";

// Access private functions via module internals isn't possible directly,
// so we test them through exported functions where they're used.

describe("topologicalSort", () => {
  it("returns tasks in dependency order", () => {
    const tasks: ScheduledTask[] = [
      { id: "c", name: "C", description: "", mode: "agent", schedule: "", enabled: true, dependsOn: ["b"] },
      { id: "a", name: "A", description: "", mode: "agent", schedule: "", enabled: true },
      { id: "b", name: "B", description: "", mode: "agent", schedule: "", enabled: true, dependsOn: ["a"] },
    ];
    const sorted = topologicalSort(tasks);
    const ids = sorted.map((t) => t.id);
    expect(ids.indexOf("a")).toBeLessThan(ids.indexOf("b"));
    expect(ids.indexOf("b")).toBeLessThan(ids.indexOf("c"));
  });

  it("handles tasks with no dependencies", () => {
    const tasks: ScheduledTask[] = [
      { id: "x", name: "X", description: "", mode: "agent", schedule: "", enabled: true },
      { id: "y", name: "Y", description: "", mode: "agent", schedule: "", enabled: true },
    ];
    const sorted = topologicalSort(tasks);
    expect(sorted).toHaveLength(2);
  });

  it("handles empty task list", () => {
    expect(topologicalSort([])).toEqual([]);
  });

  it("handles circular dependencies without crashing", () => {
    const tasks: ScheduledTask[] = [
      { id: "a", name: "A", description: "", mode: "agent", schedule: "", enabled: true, dependsOn: ["b"] },
      { id: "b", name: "B", description: "", mode: "agent", schedule: "", enabled: true, dependsOn: ["a"] },
    ];
    const sorted = topologicalSort(tasks);
    // Should still return all tasks (cycle participants appended)
    expect(sorted).toHaveLength(2);
  });

  it("handles diamond dependencies", () => {
    const tasks: ScheduledTask[] = [
      { id: "d", name: "D", description: "", mode: "agent", schedule: "", enabled: true, dependsOn: ["b", "c"] },
      { id: "b", name: "B", description: "", mode: "agent", schedule: "", enabled: true, dependsOn: ["a"] },
      { id: "c", name: "C", description: "", mode: "agent", schedule: "", enabled: true, dependsOn: ["a"] },
      { id: "a", name: "A", description: "", mode: "agent", schedule: "", enabled: true },
    ];
    const sorted = topologicalSort(tasks);
    const ids = sorted.map((t) => t.id);
    expect(ids.indexOf("a")).toBeLessThan(ids.indexOf("b"));
    expect(ids.indexOf("a")).toBeLessThan(ids.indexOf("c"));
    expect(ids.indexOf("b")).toBeLessThan(ids.indexOf("d"));
    expect(ids.indexOf("c")).toBeLessThan(ids.indexOf("d"));
  });

  it("ignores dependsOn referencing non-existent tasks", () => {
    const tasks: ScheduledTask[] = [
      { id: "a", name: "A", description: "", mode: "agent", schedule: "", enabled: true, dependsOn: ["missing"] },
    ];
    const sorted = topologicalSort(tasks);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe("a");
  });
});

describe("checkDependencies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns satisfied for tasks with no dependencies", () => {
    const task: ScheduledTask = {
      id: "a", name: "A", description: "", mode: "agent",
      schedule: "", enabled: true,
    };
    const result = checkDependencies(task, [], "/ws");
    expect(result.satisfied).toBe(true);
    expect(result.blocking).toEqual([]);
  });

  it("returns satisfied for empty dependsOn array", () => {
    const task: ScheduledTask = {
      id: "a", name: "A", description: "", mode: "agent",
      schedule: "", enabled: true, dependsOn: [],
    };
    const result = checkDependencies(task, [], "/ws");
    expect(result.satisfied).toBe(true);
  });

  it("reports missing dependency tasks", () => {
    const task: ScheduledTask = {
      id: "a", name: "A", description: "", mode: "agent",
      schedule: "", enabled: true, dependsOn: ["missing"],
    };
    const result = checkDependencies(task, [task], "/ws");
    expect(result.satisfied).toBe(false);
    expect(result.blocking).toContain("missing (not found)");
  });

  it("reports never-run dependencies as blocking", () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });
    const depTask: ScheduledTask = {
      id: "dep", name: "Dep", description: "", mode: "agent",
      schedule: "", enabled: true,
    };
    const task: ScheduledTask = {
      id: "a", name: "A", description: "", mode: "agent",
      schedule: "", enabled: true, dependsOn: ["dep"],
    };
    const result = checkDependencies(task, [task, depTask], "/ws");
    expect(result.satisfied).toBe(false);
    expect(result.blocking).toContain("dep (never run)");
  });

  it("returns satisfied when dependency has lastRun state", () => {
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ dep: { lastRun: "2026-04-22T10:00:00Z" } }),
    );
    const depTask: ScheduledTask = {
      id: "dep", name: "Dep", description: "", mode: "agent",
      schedule: "", enabled: true,
    };
    const task: ScheduledTask = {
      id: "a", name: "A", description: "", mode: "agent",
      schedule: "", enabled: true, dependsOn: ["dep"],
    };
    const result = checkDependencies(task, [task, depTask], "/ws");
    expect(result.satisfied).toBe(true);
  });
});

describe("getGitHubRepoUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns undefined when no .git/config exists", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(getGitHubRepoUrl("/ws")).toBeUndefined();
  });

  it("parses HTTPS remote URL", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      '[remote "origin"]\n\turl = https://github.com/owner/repo.git\n',
    );
    expect(getGitHubRepoUrl("/ws")).toBe("https://github.com/owner/repo");
  });

  it("parses SSH remote URL", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      '[remote "origin"]\n\turl = git@github.com:owner/repo.git\n',
    );
    expect(getGitHubRepoUrl("/ws")).toBe("https://github.com/owner/repo");
  });

  it("returns undefined for non-GitHub remote", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      '[remote "origin"]\n\turl = https://gitlab.com/owner/repo.git\n',
    );
    expect(getGitHubRepoUrl("/ws")).toBeUndefined();
  });

  it("handles read error gracefully", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("EACCES");
    });
    expect(getGitHubRepoUrl("/ws")).toBeUndefined();
  });
});

describe("getTaskState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty map when state file missing", () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });
    expect(getTaskState("/ws")).toEqual({});
  });

  it("parses valid state file", () => {
    const state = { "task-1": { lastRun: "2026-04-22T10:00:00Z" } };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(state));
    expect(getTaskState("/ws")).toEqual(state);
  });

  it("returns empty map on corrupt JSON", () => {
    vi.mocked(fs.readFileSync).mockReturnValue("{bad json");
    expect(getTaskState("/ws")).toEqual({});
  });
});

describe("recordTaskRun", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes state file with task timestamp", () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });
    vi.mocked(fs.existsSync).mockReturnValue(true);

    recordTaskRun("/ws", "task-1");

    expect(vi.mocked(fs.writeFileSync)).toHaveBeenCalledWith(
      expect.stringContaining(".scheduled-tasks-state.json"),
      expect.stringContaining("task-1"),
      "utf-8",
    );
  });

  it("creates directory if missing", () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });
    vi.mocked(fs.existsSync).mockReturnValue(false);

    recordTaskRun("/ws", "task-1");

    expect(vi.mocked(fs.mkdirSync)).toHaveBeenCalledWith(
      expect.any(String),
      { recursive: true },
    );
  });

  it("preserves existing task state entries", () => {
    const existing = { "old-task": { lastRun: "2026-01-01T00:00:00Z" } };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));
    vi.mocked(fs.existsSync).mockReturnValue(true);

    recordTaskRun("/ws", "new-task");

    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    const parsed = JSON.parse(written);
    expect(parsed["old-task"]).toBeDefined();
    expect(parsed["new-task"]).toBeDefined();
  });
});
