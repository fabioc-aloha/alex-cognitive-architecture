/**
 * Task CRUD, file I/O, state management, and dependency resolution.
 */

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import type {
  ScheduledTask,
  ScheduledTasksConfig,
  TaskStateMap,
  RunInfo,
} from "./scheduledTasksTypes.js";
import { generateWorkflow, removeWorkflow } from "./workflowGenerator.js";

// ── Task State (last-run tracking) ────────────────────────────────

const STATE_FILE = path.join(".github", "config", ".scheduled-tasks-state.json");

function statePath(workspaceRoot: string): string {
  return path.join(workspaceRoot, STATE_FILE);
}

/** Read all task state entries. Returns empty map on missing/corrupt file. */
export function getTaskState(workspaceRoot: string): TaskStateMap {
  try {
    return JSON.parse(fs.readFileSync(statePath(workspaceRoot), "utf-8")) as TaskStateMap;
  } catch {
    return {};
  }
}

/** Record a task execution timestamp. */
export function recordTaskRun(workspaceRoot: string, taskId: string): void {
  const state = getTaskState(workspaceRoot);
  state[taskId] = { lastRun: new Date().toISOString() };
  const fp = statePath(workspaceRoot);
  const dir = path.dirname(fp);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

// ── Workflow Run Tracking ─────────────────────────────────────────

/** Backing store for run state — persists across reloads when initialized. */
let runStore: vscode.Memento | null = null;
const RUNS_KEY = "alex.scheduledRuns";

/** Initialize persistent run store. Call from activate(). */
export function initRunStore(state: vscode.Memento): void {
  runStore = state;
}

function getRunMap(): Record<string, RunInfo> {
  return runStore?.get<Record<string, RunInfo>>(RUNS_KEY) ?? {};
}

function setRunMap(map: Record<string, RunInfo>): void {
  if (runStore) void runStore.update(RUNS_KEY, map);
}

export function getRunInfo(taskId: string): RunInfo | undefined {
  return getRunMap()[taskId];
}

export function clearRunInfo(taskId: string): void {
  const map = getRunMap();
  delete map[taskId];
  setRunMap(map);
}

/** Update run info (used by dispatchAndMonitor). */
export function setRunInfo(taskId: string, info: RunInfo): void {
  const map = getRunMap();
  map[taskId] = info;
  setRunMap(map);
}

// ── Dependency Resolution ─────────────────────────────────────────

/**
 * Check whether a task's dependencies are satisfied.
 * A dependency is satisfied if its last run completed successfully.
 */
export function checkDependencies(
  task: ScheduledTask,
  allTasks: ScheduledTask[],
  workspaceRoot: string,
): { satisfied: boolean; blocking: string[] } {
  if (!task.dependsOn || task.dependsOn.length === 0) {
    return { satisfied: true, blocking: [] };
  }

  const state = getTaskState(workspaceRoot);
  const blocking: string[] = [];

  for (const depId of task.dependsOn) {
    const depTask = allTasks.find((t) => t.id === depId);
    if (!depTask) {
      blocking.push(`${depId} (not found)`);
      continue;
    }

    // Check persisted run status first
    const runInfo = getRunInfo(depId);
    if (runInfo) {
      if (runInfo.status === "failure" || runInfo.status === "error" || runInfo.status === "cancelled") {
        blocking.push(`${depId} (${runInfo.status})`);
      } else if (runInfo.status !== "completed") {
        blocking.push(`${depId} (${runInfo.status})`);
      }
      // "completed" means satisfied — continue
      continue;
    }

    // Fall back to persisted state — if never run, it's blocking
    if (!state[depId]?.lastRun) {
      blocking.push(`${depId} (never run)`);
    }
  }

  return { satisfied: blocking.length === 0, blocking };
}

/**
 * Topological sort of tasks respecting dependsOn.
 * Returns tasks in safe execution order. Cycles are detected and
 * offending tasks are appended at the end.
 */
export function topologicalSort(tasks: ScheduledTask[]): ScheduledTask[] {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const visited = new Set<string>();
  const visiting = new Set<string>(); // cycle detection
  const sorted: ScheduledTask[] = [];

  function visit(id: string): void {
    if (visited.has(id)) return;
    if (visiting.has(id)) return; // cycle — skip
    visiting.add(id);

    const task = taskMap.get(id);
    if (task?.dependsOn) {
      for (const depId of task.dependsOn) {
        if (taskMap.has(depId)) visit(depId);
      }
    }

    visiting.delete(id);
    visited.add(id);
    if (task) sorted.push(task);
  }

  for (const task of tasks) visit(task.id);

  // Append any unvisited (cycle participants) at the end
  for (const task of tasks) {
    if (!visited.has(task.id)) sorted.push(task);
  }

  return sorted;
}

// ── CRUD ──────────────────────────────────────────────────────────

/**
 * Load scheduled tasks from the config file.
 */
export function loadScheduledTasks(workspaceRoot: string): ScheduledTask[] {
  const configPath = path.join(
    workspaceRoot,
    ".github",
    "config",
    "scheduled-tasks.json",
  );

  if (!fs.existsSync(configPath)) {
    return [];
  }

  try {
    const config = JSON.parse(
      fs.readFileSync(configPath, "utf-8"),
    ) as ScheduledTasksConfig;
    return config.tasks ?? [];
  } catch {
    return [];
  }
}

/**
 * Toggle a task's enabled state in the config file.
 *
 * @returns The updated task list, or null on error.
 */
export function toggleTask(
  workspaceRoot: string,
  taskId: string,
): ScheduledTask[] | null {
  const configPath = path.join(
    workspaceRoot,
    ".github",
    "config",
    "scheduled-tasks.json",
  );

  if (!fs.existsSync(configPath)) return null;

  try {
    const config = JSON.parse(
      fs.readFileSync(configPath, "utf-8"),
    ) as ScheduledTasksConfig;

    const task = config.tasks?.find((t) => t.id === taskId);
    if (!task) return null;

    task.enabled = !task.enabled;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");

    // Auto-manage workflow file
    if (task.enabled) {
      generateWorkflow(workspaceRoot, task);
    } else {
      removeWorkflow(workspaceRoot, task.id);
    }

    return config.tasks;
  } catch {
    return null;
  }
}

/**
 * Delete a task from the config file.
 *
 * @returns The updated task list, or null on error.
 */
export function deleteTask(
  workspaceRoot: string,
  taskId: string,
): ScheduledTask[] | null {
  const configPath = path.join(
    workspaceRoot,
    ".github",
    "config",
    "scheduled-tasks.json",
  );

  if (!fs.existsSync(configPath)) return null;

  try {
    const config = JSON.parse(
      fs.readFileSync(configPath, "utf-8"),
    ) as ScheduledTasksConfig;

    const idx = config.tasks?.findIndex((t) => t.id === taskId);
    if (idx === undefined || idx < 0) return null;

    config.tasks.splice(idx, 1);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");

    // Clean up workflow file
    removeWorkflow(workspaceRoot, taskId);

    return config.tasks;
  } catch {
    return null;
  }
}

/** Add a new task to the config file. */
export function addTask(workspaceRoot: string, task: ScheduledTask): boolean {
  const configPath = path.join(
    workspaceRoot,
    ".github",
    "config",
    "scheduled-tasks.json",
  );

  try {
    let config: ScheduledTasksConfig;
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8")) as ScheduledTasksConfig;
    } else {
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      config = { version: "1.0.0", tasks: [] };
    }

    if (config.tasks.some((t) => t.id === task.id)) {
      vscode.window.showWarningMessage(`Task "${task.id}" already exists.`);
      return false;
    }

    config.tasks.push(task);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
    return true;
  } catch {
    return false;
  }
}
