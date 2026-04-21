/**
 * Config-driven Scheduled Tasks loader for the sidebar Schedule tab.
 *
 * Reads task definitions from .github/config/scheduled-tasks.json
 * and provides rendering and toggle capabilities.
 */

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { escHtml, escAttr } from "./htmlUtils.js";

// ── Types ─────────────────────────────────────────────────────────

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  skill?: string;
  mode: "agent" | "direct";
  schedule: string;
  enabled: boolean;
  promptFile?: string;
  muscle?: string;
  muscleArgs?: string[];
  target?: string;
  dependsOn?: string[];
}

interface ScheduledTasksConfig {
  version: string;
  tasks: ScheduledTask[];
}

// ── Helpers ───────────────────────────────────────────────────────

/** Translate cron expression to human-readable text. */
function cronToHuman(cron: string): string {
  const parts = cron.split(/\s+/);
  if (parts.length !== 5) return cron;

  const [min, hour, dayOfMonth, month, dayOfWeek] = parts;
  const time = `${hour.padStart(2, "0")}:${min.padStart(2, "0")} UTC`;

  // Every N days at specific time (e.g., 0 8 */2 * * = Every 2 days at 08:00)
  if (dayOfMonth.startsWith("*/") && month === "*" && dayOfWeek === "*") {
    const n = dayOfMonth.slice(2);
    return `Every ${n} days at ${time}`;
  }

  // Every N hours
  if (hour.startsWith("*/")) {
    const n = hour.slice(2);
    return `Every ${n} hours`;
  }

  // Daily at specific hour
  if (
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*" &&
    !hour.includes("/") &&
    !hour.includes(",")
  ) {
    return `Daily at ${time}`;
  }

  // Weekly
  if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
    const days: Record<string, string> = {
      "0": "Sun", "1": "Mon", "2": "Tue", "3": "Wed",
      "4": "Thu", "5": "Fri", "6": "Sat",
    };
    const dayName = days[dayOfWeek] ?? dayOfWeek;
    return `${dayName} at ${time}`;
  }

  return cron;
}

// ── Git Helpers ───────────────────────────────────────────────────

/** Relative time label from an ISO 8601 timestamp. */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}


/**
 * Detect the GitHub repo URL from the workspace git remote.
 * Returns e.g. "https://github.com/owner/repo" or undefined.
 */
export function getGitHubRepoUrl(workspaceRoot: string): string | undefined {
  const gitConfigPath = path.join(workspaceRoot, ".git", "config");
  if (!fs.existsSync(gitConfigPath)) return undefined;

  try {
    const config = fs.readFileSync(gitConfigPath, "utf-8");
    // https://github.com/owner/repo.git
    const httpsMatch = config.match(
      /url\s*=\s*https:\/\/github\.com\/([^/\s]+\/[^/\s.]+)/,
    );
    if (httpsMatch) return `https://github.com/${httpsMatch[1]}`;

    // git@github.com:owner/repo.git
    const sshMatch = config.match(
      /url\s*=\s*git@github\.com:([^/\s]+\/[^/\s.]+)/,
    );
    if (sshMatch) return `https://github.com/${sshMatch[1]}`;

    return undefined;
  } catch {
    return undefined;
  }
}

// ── Task State (last-run tracking) ────────────────────────────────

interface TaskStateEntry {
  lastRun: string; // ISO 8601
}

type TaskStateMap = Record<string, TaskStateEntry>;

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

export type RunStatus = "queued" | "in_progress" | "completed" | "failure" | "cancelled" | "error";

interface RunInfo {
  status: RunStatus;
  runUrl?: string;
  conclusion?: string;
}

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
function setRunInfo(taskId: string, info: RunInfo): void {
  const map = getRunMap();
  map[taskId] = info;
  setRunMap(map);
}

// ── Dependency Resolution ─────────────────────────────────────────

/**
 * Check whether a task's dependencies are satisfied.
 * A dependency is satisfied if its last run completed successfully
 * (i.e., it has a "completed" status in the run store or a lastRun in state).
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

/** Parse "owner/repo" from a GitHub URL. */
function parseOwnerRepo(repoUrl: string): { owner: string; repo: string } | undefined {
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!m) return undefined;
  return { owner: m[1], repo: m[2] };
}

/**
 * Dispatch a workflow via GitHub Actions API and poll until completion.
 *
 * Uses VS Code's built-in GitHub authentication provider — no PAT needed.
 * Returns a Disposable to cancel polling (push into context.subscriptions).
 */
export async function dispatchAndMonitor(
  repoUrl: string,
  taskId: string,
  onUpdate: (info: RunInfo) => void,
): Promise<vscode.Disposable> {
  const parsed = parseOwnerRepo(repoUrl);
  if (!parsed) throw new Error("Cannot parse GitHub owner/repo from URL");

  const { owner, repo } = parsed;
  const workflowFile = `scheduled-${taskId}.yml`;

  // Get GitHub token via VS Code auth
  const session = await vscode.authentication.getSession("github", ["repo"], { createIfNone: true });
  const token = session.accessToken;
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "alex-cognitive-architecture",
  };

  // Mark as queued
  setRunInfo(taskId, { status: "queued" });
  onUpdate({ status: "queued" });

  // Capture timestamp before dispatch to filter runs
  const dispatchTime = new Date().toISOString();

  // POST dispatch
  const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;
  const dispatchRes = await fetch(dispatchUrl, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ ref: "main" }),
  });

  if (!dispatchRes.ok) {
    const body = await dispatchRes.text();
    const info: RunInfo = { status: "error" };
    setRunInfo(taskId, info);
    onUpdate(info);
    throw new Error(`Dispatch failed (${dispatchRes.status}): ${body}`);
  }

  // Poll for the run
  const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/runs?per_page=1&created=>${dispatchTime.slice(0, 19)}Z`;

  let attempts = 0;
  const maxAttempts = 120; // ~10 minutes at 5s interval
  const pollInterval = 5_000;

  const poll = async (): Promise<void> => {
    attempts++;
    if (attempts > maxAttempts) {
      const info: RunInfo = { status: "error" };
      setRunInfo(taskId, info);
      onUpdate(info);
      return;
    }

    try {
      const res = await fetch(runsUrl, { headers });
      if (!res.ok) return schedulePoll();

      const data = (await res.json()) as { workflow_runs?: Array<{ status: string; conclusion: string | null; html_url: string }> };
      const run = data.workflow_runs?.[0];

      if (!run) return schedulePoll(); // Run not yet visible

      const status: RunStatus =
        run.status === "completed"
          ? (run.conclusion === "success" ? "completed" : (run.conclusion as RunStatus) ?? "failure")
          : (run.status as RunStatus) ?? "in_progress";

      const info: RunInfo = {
        status,
        runUrl: run.html_url,
        conclusion: run.conclusion ?? undefined,
      };
      setRunInfo(taskId, info);
      onUpdate(info);

      // Keep polling if not terminal
      if (run.status !== "completed") {
        return schedulePoll();
      }
    } catch {
      return schedulePoll();
    }
  };

  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const schedulePoll = (): void => {
    if (cancelled) return;
    timers.push(setTimeout(() => void poll(), pollInterval));
  };

  // Start polling after a short delay (GitHub needs a moment to create the run)
  timers.push(setTimeout(() => void poll(), 3_000));

  return { dispose: () => { cancelled = true; timers.forEach(clearTimeout); } };
}

// ── Loader ────────────────────────────────────────────────────────

/**
 * Load scheduled tasks from the config file.
 *
 * @param workspaceRoot — absolute path to the workspace root
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

/**
 * Check whether a workflow YAML file has been generated for a task.
 */
export function hasWorkflow(workspaceRoot: string, taskId: string): boolean {
  const workflowPath = path.join(
    workspaceRoot,
    ".github",
    "workflows",
    `scheduled-${taskId}.yml`,
  );
  return fs.existsSync(workflowPath);
}

// ── Workflow Generation ───────────────────────────────────────────

function workflowDir(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".github", "workflows");
}

function workflowPath(workspaceRoot: string, taskId: string): string {
  return path.join(workflowDir(workspaceRoot), `scheduled-${taskId}.yml`);
}

/** Sanitize a string for safe interpolation in YAML values (single-line). */
function sanitizeForYaml(value: string): string {
  return value.replace(/[\\"`$!#&|;(){}<>]/g, "");
}

/** Validate a task ID contains only safe characters (alphanumeric + hyphen). */
function validateTaskId(id: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Invalid task ID: "${id}". Must be lowercase alphanumeric with hyphens.`);
  }
  return id;
}

/** Validate a cron expression contains only safe characters (digits, spaces, asterisks, commas, slashes, hyphens). */
function validateCron(cron: string): string {
  if (!/^[0-9*\/,\- ]+$/.test(cron)) {
    throw new Error(`Invalid cron expression: "${cron}".`);
  }
  return cron;
}

function agentWorkflowYaml(task: ScheduledTask): string {
  const safeName = sanitizeForYaml(task.name);
  const safeId = validateTaskId(task.id);
  const safeCron = validateCron(task.schedule);
  return `# Auto-generated — do not edit manually
name: "Scheduled: ${safeName}"

on:
  schedule:
    - cron: "${safeCron}"
  workflow_dispatch: {}

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  create-copilot-task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Check for duplicate open issues
        id: check
        env:
          GH_TOKEN: \${{ github.token }}
        run: |
          OPEN=$(gh issue list --label automated,${safeId} --state open --json number --jq 'length')
          echo "open=$OPEN" >> $GITHUB_OUTPUT

      - name: Create issue for Copilot
        if: steps.check.outputs.open == '0'
        env:
          GH_TOKEN: \${{ github.token }}
          TASK_NAME: "${safeName}"
          PROMPT_FILE: "${sanitizeForYaml(task.promptFile ?? "")}"
        run: |
          gh issue create \\
            --title "$TASK_NAME: $(date -u +%Y-%m-%d-%H%M)" \\
            --body-file "$PROMPT_FILE" \\
            --label automated,${safeId} \\
            --assignee copilot
`;
}

function directWorkflowYaml(task: ScheduledTask): string {
  const safeName = sanitizeForYaml(task.name);
  const safeDesc = sanitizeForYaml(task.description);
  const safeMuscle = task.muscle ? sanitizeForYaml(task.muscle) : "";
  const safeArgs = task.muscleArgs
    ? ` ${task.muscleArgs.map(sanitizeForYaml).join(" ")}`
    : "";
  const safeId = validateTaskId(task.id);
  const safeCron = validateCron(task.schedule);
  return `# Auto-generated — do not edit manually
name: "Scheduled: ${safeName}"

on:
  schedule:
    - cron: "${safeCron}"
  workflow_dispatch: {}

permissions:
  contents: write
  pull-requests: write

jobs:
  run-task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 22

      - name: Run ${safeId}
        run: node ${safeMuscle}${safeArgs}

      - name: Create PR if changes exist
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          TASK_NAME: "${safeName}"
          TASK_DESC: "${safeDesc}"
        run: |
          git diff --quiet && exit 0
          BRANCH="auto/${safeId}-$(date -u +%s)"
          git checkout -b "$BRANCH"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "chore(scheduled): ${safeId} $(date -u +%Y-%m-%d)"
          git push origin "$BRANCH"
          gh pr create \\
            --title "Scheduled: $TASK_NAME $(date -u +%Y-%m-%d)" \\
            --body "## Automated Task: $TASK_NAME\\n\\n$TASK_DESC\\n\\n---\\n\\n*Generated by scheduled-${safeId}.yml*" \\
            --label automated \\
            --base main
`;
}

/** Generate a GitHub Actions workflow YAML for a task. */
export function generateWorkflow(workspaceRoot: string, task: ScheduledTask): boolean {
  let content: string;
  if (task.mode === "agent" && task.promptFile) {
    content = agentWorkflowYaml(task);
  } else if (task.mode === "direct" && task.muscle) {
    content = directWorkflowYaml(task);
  } else {
    return false;
  }
  const dir = workflowDir(workspaceRoot);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(workflowPath(workspaceRoot, task.id), content, "utf-8");
  return true;
}

/** Remove a task's workflow YAML if it exists. */
export function removeWorkflow(workspaceRoot: string, taskId: string): void {
  const fp = workflowPath(workspaceRoot, taskId);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

/**
 * Render the scheduled tasks panel HTML.
 */
export function renderScheduledTasks(
  tasks: ScheduledTask[],
  repoUrl?: string,
  workspaceRoot?: string,
): string {
  let html: string;

  if (tasks.length === 0) {
    html = `
    <div class="schedule-empty">
      <span class="codicon codicon-rocket"></span>
      <p><strong>Automate your workflow</strong></p>
      <p class="schedule-hint">Schedule AI agents to run tasks on your behalf —<br>code reviews, audits, reports, and more.</p>
      <button class="action-btn primary" data-command="addTask" style="margin-top:16px">
        <span class="codicon codicon-add"></span>
        <span class="btn-label">Create Your First Task</span>
      </button>
      <button class="action-btn" data-command="openExternal" data-file="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki/Autopilot" style="margin-top:4px">
        <span class="codicon codicon-book"></span>
        <span class="btn-label">Learn more</span>
      </button>
    </div>`;
  } else {

  const taskState = workspaceRoot ? getTaskState(workspaceRoot) : {};

  const taskRows = tasks
    .map((t) => {
      const modeIcon = t.mode === "agent" ? "hubot" : "terminal";
      const modeLabel = t.mode === "agent" ? "Agent" : "Script";
      const humanSchedule = cronToHuman(t.schedule);
      const wfExists = workspaceRoot ? hasWorkflow(workspaceRoot, t.id) : false;

      // Status pill (running state overrides enabled/paused)
      const runInfo = getRunInfo(t.id);
      let statusPill: string;
      if (runInfo && (runInfo.status === "queued" || runInfo.status === "in_progress")) {
        statusPill = `<span class="schedule-pill schedule-pill-running"><span class="codicon codicon-loading codicon-modifier-spin"></span> Running</span>`;
      } else if (runInfo && runInfo.status === "completed") {
        statusPill = `<span class="schedule-pill schedule-pill-success"><span class="codicon codicon-check"></span> Passed</span>`;
      } else if (runInfo && (runInfo.status === "failure" || runInfo.status === "cancelled" || runInfo.status === "error")) {
        statusPill = `<span class="schedule-pill schedule-pill-fail"><span class="codicon codicon-error"></span> Failed</span>`;
      } else {
        statusPill = t.enabled
          ? `<span class="schedule-pill schedule-pill-on">Active</span>`
          : `<span class="schedule-pill schedule-pill-off">Paused</span>`;
      }

      // Per-task action buttons
      const isRunning = runInfo && (runInfo.status === "queued" || runInfo.status === "in_progress");
      const runNowBtn = t.mode === "agent" && t.promptFile
        ? (isRunning
            ? `<button class="schedule-action-btn schedule-action-running" disabled title="Running…"><span class="codicon codicon-loading codicon-modifier-spin"></span></button>`
            : `<button class="schedule-action-btn schedule-action-run" data-command="runTask" data-file="${escAttr(t.id)}" title="${wfExists ? "Run on GitHub Actions" : "Run now in Copilot Chat"}">\uD83D\uDE80</button>`)
        : "";
      const viewRunBtn = runInfo?.runUrl
        ? `<button class="schedule-action-btn" data-command="openExternal" data-file="${escAttr(runInfo.runUrl)}" title="View run on GitHub"><span class="codicon codicon-link-external"></span></button>`
        : "";
      const editPromptBtn = t.mode === "agent" && t.promptFile
        ? `<button class="schedule-action-btn" data-command="openPromptFile" data-file="${escAttr(t.promptFile)}" title="Edit prompt">\u270E</button>`
        : "";
      const toggleBtn = `<button class="schedule-action-btn ${t.enabled ? "schedule-action-pause" : "schedule-action-resume"}" data-command="toggleTask" data-file="${escAttr(t.id)}" title="${t.enabled ? "Pause" : "Resume"}">${t.enabled ? "\u23F8" : "\u25B6"}</button>`;
      const deleteBtn = `<button class="schedule-action-btn schedule-action-danger" data-command="deleteTask" data-file="${escAttr(t.id)}" title="Delete">\uD83D\uDDD1</button>`;

      // Last-run indicator
      const lastRunHtml = taskState[t.id]?.lastRun
        ? `<span class="schedule-last-run" title="Last run: ${escAttr(taskState[t.id].lastRun)}"><span class="codicon codicon-history"></span> ${timeAgo(taskState[t.id].lastRun)}</span>`
        : "";

      // Dependency indicator
      let depsHtml = "";
      if (t.dependsOn && t.dependsOn.length > 0 && workspaceRoot) {
        const depCheck = checkDependencies(t, tasks, workspaceRoot);
        if (!depCheck.satisfied) {
          depsHtml = `<div class="schedule-task-deps schedule-deps-blocked"><span class="codicon codicon-lock"></span> Blocked by: ${escHtml(depCheck.blocking.join(", "))}</div>`;
        } else {
          depsHtml = `<div class="schedule-task-deps schedule-deps-ok"><span class="codicon codicon-pass"></span> Dependencies met</div>`;
        }
      }

      return `
      <div class="schedule-task ${t.enabled ? "enabled" : "disabled"}" data-task-id="${escAttr(t.id)}">
        <div class="schedule-task-header">
          <span class="schedule-mode" title="${modeLabel}"><span class="codicon codicon-${modeIcon}"></span></span>
          <span class="schedule-task-name" title="${escAttr(t.name)}">${escHtml(t.name)}</span>
          ${statusPill}
        </div>
        <div class="schedule-task-meta">
          <span class="schedule-schedule"><span class="codicon codicon-clock"></span> ${escHtml(humanSchedule)}</span>
          ${lastRunHtml}
        </div>
        <div class="schedule-task-desc">${escHtml(t.description)}</div>
        ${depsHtml}
        <div class="schedule-task-actions">
          ${runNowBtn}
          ${viewRunBtn}
          ${editPromptBtn}
          ${toggleBtn}
          ${deleteBtn}
        </div>
      </div>`;
    })
    .join("");

  html = `
    <div class="schedule-tasks">
      ${taskRows}
    </div>
    <div class="schedule-actions">
      <button class="action-btn primary" data-command="addTask">
        <span class="codicon codicon-add"></span>
        <span class="btn-label">Add Task</span>
      </button>
      <button class="action-btn" data-command="openScheduleConfig">
        <span class="codicon codicon-edit"></span>
        <span class="btn-label">Edit Config</span>
      </button>
    </div>`;
  }

  // Help and GitHub links
  html += `
  <div class="schedule-divider"></div>
  <div class="schedule-actions">`;
  if (repoUrl) {
    html += `
      <button class="action-btn" data-command="openExternal" data-file="${escAttr(repoUrl)}/actions">
        <span class="codicon codicon-github-action"></span>
        <span class="btn-label">GitHub Actions</span>
      </button>`;
  }
  html += `
      <button class="action-btn" data-command="openExternal" data-file="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki/Autopilot">
        <span class="codicon codicon-book"></span>
        <span class="btn-label">Documentation</span>
      </button>
    </div>`;

  return html;
}

// ── Add Task Writer ───────────────────────────────────────────────

function addTask(workspaceRoot: string, task: ScheduledTask): boolean {
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

// ── Add Task Wizard ───────────────────────────────────────────────

interface SchedulePreset {
  label: string;
  cron: string;
  description: string;
}

const SCHEDULE_PRESETS: SchedulePreset[] = [
  { label: "Every 3 hours",  cron: "0 */3 * * *",  description: "8 times/day" },
  { label: "Every 6 hours",  cron: "0 */6 * * *",  description: "4 times/day" },
  { label: "Every 12 hours", cron: "0 */12 * * *", description: "Twice daily" },
  { label: "Daily at 8 AM",  cron: "0 8 * * *",    description: "Once daily (UTC)" },
  { label: "Daily at noon",  cron: "0 12 * * *",   description: "Once daily (UTC)" },
  { label: "Weekly Monday",  cron: "0 8 * * 1",    description: "Every Monday 8 AM UTC" },
  { label: "Weekly Friday",  cron: "0 16 * * 5",   description: "Every Friday 4 PM UTC" },
  { label: "Custom cron...",  cron: "",             description: "Enter POSIX cron expression" },
];

/**
 * Multi-step quick pick wizard for adding a scheduled task.
 * Uses native VS Code UI — no webview complexity.
 */
export async function addTaskWizard(workspaceRoot: string): Promise<boolean> {
  // Step 1: Name
  const name = await vscode.window.showInputBox({
    title: "Add Scheduled Task (1/5)",
    prompt: "Task name",
    placeHolder: "e.g. Weekly Code Review",
    validateInput: (v) => (v.trim() ? undefined : "Name is required"),
  });
  if (!name) return false;

  // Step 2: Description
  const description = await vscode.window.showInputBox({
    title: "Add Scheduled Task (2/5)",
    prompt: "Brief description",
    placeHolder: "What does this automation do?",
    validateInput: (v) => (v.trim() ? undefined : "Description is required"),
  });
  if (!description) return false;

  // Step 3: Mode
  const modePick = await vscode.window.showQuickPick(
    [
      {
        label: "$(hubot) Cloud Agent",
        description: "Creates a GitHub issue assigned to Copilot",
        detail: "Best for creative tasks: writing, analysis, reviews",
        mode: "agent" as const,
      },
      {
        label: "$(terminal) Direct",
        description: "Runs a script in GitHub Actions",
        detail: "Best for mechanical tasks: audits, builds, syncs",
        mode: "direct" as const,
      },
    ],
    { title: "Add Scheduled Task (3/5)", placeHolder: "Execution mode" },
  );
  if (!modePick) return false;

  // Step 4: Schedule
  const schedPick = await vscode.window.showQuickPick(
    SCHEDULE_PRESETS.map((p) => ({
      label: p.label,
      description: p.description,
      cron: p.cron,
    })),
    { title: "Add Scheduled Task (4/5)", placeHolder: "Schedule frequency" },
  );
  if (!schedPick) return false;

  let cron = (schedPick as { cron: string }).cron;
  if (!cron) {
    const custom = await vscode.window.showInputBox({
      title: "Custom Cron Expression",
      prompt: "POSIX cron: minute hour day-of-month month day-of-week",
      placeHolder: "0 */4 * * *",
      validateInput: (v) => {
        const parts = v.trim().split(/\s+/);
        return parts.length === 5 ? undefined : "Must be 5 space-separated fields";
      },
    });
    if (!custom) return false;
    cron = custom.trim();
  }

  // Step 5: Skill (optional — scan available skills)
  const skillsDir = path.join(workspaceRoot, ".github", "skills");
  let skill: string | undefined;
  if (fs.existsSync(skillsDir)) {
    const skills = fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => ({ label: d.name }));

    if (skills.length > 0) {
      const skillPick = await vscode.window.showQuickPick(
        [{ label: "(none)", description: "No specific skill" }, ...skills],
        { title: "Add Scheduled Task (5/5)", placeHolder: "Associate a skill (optional)" },
      );
      if (skillPick && skillPick.label !== "(none)") {
        skill = skillPick.label;
      }
    }
  }

  // Build task
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!id) {
    vscode.window.showErrorMessage("Task name must contain at least one letter or digit.");
    return false;
  }

  const task: ScheduledTask = {
    id,
    name,
    description,
    mode: modePick.mode,
    schedule: cron,
    enabled: false,
    ...(skill ? { skill } : {}),
    ...(modePick.mode === "agent"
      ? { promptFile: `.github/config/scheduled-tasks/${id}.md` }
      : {}),
  };

  if (addTask(workspaceRoot, task)) {
    // Scaffold prompt template for agent tasks
    if (modePick.mode === "agent" && task.promptFile) {
      const tplPath = path.join(workspaceRoot, task.promptFile);
      const tplDir = path.dirname(tplPath);
      if (!fs.existsSync(tplDir)) fs.mkdirSync(tplDir, { recursive: true });
      if (!fs.existsSync(tplPath)) {
        const template = [
          `# ${name}`,
          "",
          `## Task`,
          "",
          `${description}`,
          "",
          `## Instructions`,
          "",
          "1. Read relevant context from the repository",
          "2. Perform the task",
          "3. Create a PR with your changes",
          "",
          `## Quality Standards`,
          "",
          "- Follow existing project conventions",
          "- Include meaningful commit messages",
          "- Ensure all tests pass before submitting",
          "",
        ].join("\n");
        fs.writeFileSync(tplPath, template, "utf-8");
      }
    }

    // Generate workflow file if task is enabled
    if (task.enabled) {
      generateWorkflow(workspaceRoot, task);
    }

    vscode.window.showInformationMessage(
      `Task "${name}" added (disabled). Enable it from the Autopilot tab to activate.`,
    );
    return true;
  }
  return false;
}

// ── Styles ────────────────────────────────────────────────────────

export const SCHEDULE_CSS = `
    /* Autopilot tab — uses design tokens from parent */
    .schedule-empty {
      text-align: center;
      padding: var(--spacing-xl, 24px) var(--spacing-lg, 16px);
      color: var(--vscode-foreground);
    }
    .schedule-empty .codicon {
      font-size: 40px;
      display: block;
      margin-bottom: var(--spacing-md, 12px);
      color: var(--accent, #6366f1);
      opacity: 0.85;
    }
    .schedule-empty p {
      margin: var(--spacing-xs, 4px) 0;
    }
    .schedule-empty strong {
      font-size: var(--font-xl, 14px);
    }
    .schedule-hint {
      font-size: var(--font-md, 12px);
      margin-top: var(--spacing-sm, 8px);
      color: var(--vscode-descriptionForeground);
      line-height: 1.5;
    }
    .schedule-tasks {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm, 8px);
      margin-bottom: var(--spacing-md, 12px);
    }
    .schedule-task {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.15));
      border-radius: var(--radius-md, 6px);
      padding: var(--spacing-md, 12px);
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }
    .schedule-task:hover {
      background: var(--vscode-list-hoverBackground);
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
    }
    .schedule-task.enabled {
      border-left: 3px solid var(--accent, #6366f1);
    }
    .schedule-task.disabled {
      opacity: 0.5;
      border-left: 3px solid transparent;
    }
    .schedule-task.disabled:hover {
      opacity: 0.7;
    }
    .schedule-task-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      min-height: 24px;
    }
    .schedule-mode {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
      flex-shrink: 0;
    }
    .schedule-task.enabled .schedule-mode {
      color: var(--accent, #6366f1);
    }
    .schedule-task-name {
      flex: 1;
      font-weight: 600;
      font-size: var(--font-lg, 13px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .schedule-warn {
      color: var(--vscode-editorWarning-foreground);
      font-size: var(--font-md, 12px);
      flex-shrink: 0;
    }
    /* Status pill */
    .schedule-pill {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      padding: 1px 6px;
      border-radius: 9px;
      flex-shrink: 0;
    }
    .schedule-pill-on {
      background: var(--accent-subtle, rgba(99, 102, 241, 0.15));
      color: var(--accent, #6366f1);
    }
    .schedule-pill-off {
      background: rgba(128, 128, 128, 0.12);
      color: var(--vscode-descriptionForeground);
    }
    .schedule-pill-running {
      background: rgba(59, 130, 246, 0.15);
      color: var(--vscode-notificationsInfoIcon-foreground, #3b82f6);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .schedule-pill-running .codicon {
      font-size: 10px;
    }
    .schedule-pill-success {
      background: rgba(34, 197, 94, 0.15);
      color: var(--vscode-testing-iconPassed, #22c55e);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .schedule-pill-success .codicon {
      font-size: 10px;
    }
    .schedule-pill-fail {
      background: rgba(239, 68, 68, 0.15);
      color: var(--vscode-errorForeground, #ef4444);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .schedule-pill-fail .codicon {
      font-size: 10px;
    }
    .schedule-action-running {
      opacity: 0.5;
      cursor: default;
    }
    /* Action button row at bottom of card */
    .schedule-task-actions {
      display: flex;
      gap: var(--spacing-xs, 4px);
      margin-top: var(--spacing-sm, 8px);
      padding-top: var(--spacing-sm, 8px);
      border-top: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.1));
    }
    .schedule-action-btn {
      background: var(--vscode-button-secondaryBackground, rgba(128,128,128,0.15));
      border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.2));
      color: var(--vscode-foreground);
      cursor: pointer;
      height: 26px;
      padding: 0 8px;
      border-radius: var(--radius-sm, 4px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.12s, background 0.12s, transform 0.1s;
      opacity: 0.7;
      font-size: 12px;
      line-height: 1;
    }
    .schedule-action-btn:hover {
      opacity: 1;
      background: var(--vscode-toolbar-hoverBackground);
    }
    .schedule-action-btn:focus-visible {
      outline: var(--focus-ring, 2px solid var(--accent, #6366f1));
      outline-offset: var(--focus-ring-offset, 2px);
      opacity: 1;
    }
    .schedule-action-btn:active {
      transform: scale(0.96);
    }
    .schedule-action-danger:hover {
      color: var(--vscode-errorForeground) !important;
    }
    .schedule-action-run:hover {
      color: var(--vscode-testing-iconPassed, #73c991) !important;
      background: rgba(115, 201, 145, 0.1) !important;
    }
    .schedule-action-resume:hover {
      color: var(--vscode-testing-iconPassed, #73c991) !important;
    }
    .schedule-action-pause:hover {
      color: var(--vscode-editorWarning-foreground) !important;
    }
    /* Meta line: schedule + last run */
    .schedule-task-meta {
      margin-top: var(--spacing-xs, 4px);
      margin-left: 22px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px 12px;
    }
    .schedule-schedule {
      font-size: var(--font-sm, 11px);
      color: var(--vscode-descriptionForeground);
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
    }
    .schedule-schedule .codicon {
      font-size: 11px;
      opacity: 0.7;
    }
    .schedule-last-run {
      font-size: var(--font-sm, 11px);
      color: var(--vscode-descriptionForeground);
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      opacity: 0.75;
    }
    .schedule-last-run .codicon {
      font-size: 11px;
      opacity: 0.7;
    }
    .schedule-task-desc {
      font-size: var(--font-sm, 11px);
      color: var(--vscode-descriptionForeground);
      margin-top: var(--spacing-xs, 4px);
      margin-left: 22px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    /* Dependency indicators */
    .schedule-task-deps {
      font-size: var(--font-sm, 11px);
      margin-top: var(--spacing-xs, 4px);
      margin-left: 22px;
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
    }
    .schedule-deps-blocked {
      color: var(--vscode-editorWarning-foreground, #cca700);
    }
    .schedule-deps-blocked .codicon {
      font-size: 11px;
    }
    .schedule-deps-ok {
      color: var(--vscode-testing-iconPassed, #22c55e);
      opacity: 0.75;
    }
    .schedule-deps-ok .codicon {
      font-size: 11px;
    }
    .schedule-actions {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px) var(--spacing-sm, 8px);
    }
    .schedule-actions .action-btn {
      width: 100%;
    }
    .schedule-divider {
      border-top: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.15));
      margin: var(--spacing-sm, 8px) 0 var(--spacing-xs, 4px);
    }
`;


