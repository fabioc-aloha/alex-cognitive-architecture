"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode9 = __toESM(require("vscode"));
var fs13 = __toESM(require("fs"));
var path13 = __toESM(require("path"));

// src/chat/handler.ts
var vscode2 = __toESM(require("vscode"));
var path3 = __toESM(require("path"));
var fs3 = __toESM(require("fs"));

// src/sidebar/scheduledTasks.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var vscode = __toESM(require("vscode"));
var import_child_process = require("child_process");

// src/sidebar/htmlUtils.ts
function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/`/g, "&#96;").replace(/\\/g, "&#92;");
}

// src/sidebar/agentMetricsCollector.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var STATE_FILE = ".agent-metrics-state.json";
var RETENTION_MS = 90 * 24 * 60 * 60 * 1e3;
function stateFilePath(workspaceRoot) {
  return path.join(workspaceRoot, STATE_FILE);
}
function runLogPath(workspaceRoot) {
  return path.join(workspaceRoot, ".agent-metrics-runlog.json");
}
function readState(workspaceRoot) {
  try {
    return JSON.parse(fs.readFileSync(stateFilePath(workspaceRoot), "utf-8"));
  } catch {
    return {};
  }
}
function writeState(workspaceRoot, state) {
  fs.writeFileSync(
    stateFilePath(workspaceRoot),
    JSON.stringify(state, null, 2) + "\n",
    "utf-8"
  );
}
function readRunLog(workspaceRoot) {
  try {
    return JSON.parse(fs.readFileSync(runLogPath(workspaceRoot), "utf-8"));
  } catch {
    return { runs: [] };
  }
}
function writeRunLog(workspaceRoot, log) {
  fs.writeFileSync(
    runLogPath(workspaceRoot),
    JSON.stringify(log, null, 2) + "\n",
    "utf-8"
  );
}
function pruneRunLog(log) {
  const cutoff = Date.now() - RETENTION_MS;
  return { runs: log.runs.filter((r) => r.completedAt > cutoff) };
}
var inFlight = /* @__PURE__ */ new Map();
function recordTaskStart(taskId) {
  const key = `${taskId}:${Date.now()}`;
  inFlight.set(key, { startedAt: Date.now() });
  return key;
}
function recordTaskEnd(workspaceRoot, runKey, success) {
  const record = inFlight.get(runKey);
  const now = Date.now();
  const log = readRunLog(workspaceRoot);
  log.runs.push({
    taskId: runKey.split(":")[0],
    startedAt: record?.startedAt ?? now,
    completedAt: now,
    success
  });
  const pruned = pruneRunLog(log);
  writeRunLog(workspaceRoot, pruned);
  inFlight.delete(runKey);
  recalculate(workspaceRoot, pruned);
}
function recalculate(workspaceRoot, log) {
  const state = readState(workspaceRoot);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const runs = log.runs;
  state["tasks-run-count"] = { value: runs.length, lastUpdated: now };
  if (runs.length > 0) {
    const successes = runs.filter((r) => r.success).length;
    state["task-success-rate"] = {
      value: Math.round(successes / runs.length * 100),
      lastUpdated: now
    };
  }
  const durations = runs.map((r) => (r.completedAt - r.startedAt) / 1e3).filter((d) => d > 0);
  if (durations.length > 0) {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    state["task-duration"] = {
      value: Math.round(avg),
      lastUpdated: now
    };
  }
  if (!state["loop-guard-triggers"]) {
    state["loop-guard-triggers"] = { value: 0, lastUpdated: now };
  }
  writeState(workspaceRoot, state);
}

// src/sidebar/scheduledTasks.ts
function hasCopilotPAT(workspaceRoot) {
  try {
    const out = (0, import_child_process.execFileSync)("gh", ["secret", "list", "--json", "name"], {
      cwd: workspaceRoot,
      encoding: "utf-8",
      timeout: 1e4,
      stdio: ["pipe", "pipe", "pipe"]
    });
    const secrets = JSON.parse(out);
    return secrets.some((s) => s.name === "COPILOT_PAT");
  } catch {
    return false;
  }
}
async function setupCopilotPAT(workspaceRoot) {
  const choice = await vscode.window.showInformationMessage(
    "Autopilot needs a GitHub token (repo secret) to assign Copilot to issues. Set it up now using your existing GitHub CLI auth?",
    { modal: true },
    "Set Up Automatically",
    "I'll Do It Manually"
  );
  if (choice === "I'll Do It Manually") {
    void vscode.env.openExternal(
      vscode.Uri.parse("https://github.com/settings/personal-access-tokens/new")
    );
    void vscode.window.showInformationMessage(
      "Create a fine-grained PAT with Issues (read/write) and Contents (read/write) permissions, then run: gh secret set COPILOT_PAT in your repo."
    );
    return false;
  }
  if (choice !== "Set Up Automatically") return false;
  try {
    const token = (0, import_child_process.execFileSync)("gh", ["auth", "token"], {
      cwd: workspaceRoot,
      encoding: "utf-8",
      timeout: 1e4,
      stdio: ["pipe", "pipe", "pipe"]
    }).trim();
    if (!token) {
      vscode.window.showErrorMessage("Could not retrieve GitHub CLI token. Run `gh auth login` first.");
      return false;
    }
    (0, import_child_process.execFileSync)("gh", ["secret", "set", "COPILOT_PAT"], {
      cwd: workspaceRoot,
      timeout: 15e3,
      input: token,
      stdio: ["pipe", "pipe", "pipe"]
    });
    vscode.window.showInformationMessage("COPILOT_PAT secret created. Copilot can now be auto-assigned to issues.");
    return true;
  } catch {
    vscode.window.showErrorMessage(
      "Failed to set up COPILOT_PAT. Make sure `gh` CLI is installed and you're authenticated (`gh auth login`)."
    );
    return false;
  }
}
function getGitHubRepoUrl(workspaceRoot) {
  const gitConfigPath = path2.join(workspaceRoot, ".git", "config");
  if (!fs2.existsSync(gitConfigPath)) return void 0;
  try {
    const config = fs2.readFileSync(gitConfigPath, "utf-8");
    const httpsMatch = config.match(
      /url\s*=\s*https:\/\/github\.com\/([^/\s]+\/[^/\s.]+)/
    );
    if (httpsMatch) return `https://github.com/${httpsMatch[1]}`;
    const sshMatch = config.match(
      /url\s*=\s*git@github\.com:([^/\s]+\/[^/\s.]+)/
    );
    if (sshMatch) return `https://github.com/${sshMatch[1]}`;
    return void 0;
  } catch {
    return void 0;
  }
}
var STATE_FILE2 = path2.join(".github", "config", ".scheduled-tasks-state.json");
function statePath(workspaceRoot) {
  return path2.join(workspaceRoot, STATE_FILE2);
}
function getTaskState(workspaceRoot) {
  try {
    return JSON.parse(fs2.readFileSync(statePath(workspaceRoot), "utf-8"));
  } catch {
    return {};
  }
}
function recordTaskRun(workspaceRoot, taskId) {
  const state = getTaskState(workspaceRoot);
  state[taskId] = { lastRun: (/* @__PURE__ */ new Date()).toISOString() };
  const fp = statePath(workspaceRoot);
  const dir = path2.dirname(fp);
  if (!fs2.existsSync(dir)) fs2.mkdirSync(dir, { recursive: true });
  fs2.writeFileSync(fp, JSON.stringify(state, null, 2) + "\n", "utf-8");
}
var runStore = null;
var RUNS_KEY = "alex.scheduledRuns";
function initRunStore(state) {
  runStore = state;
}
function getRunMap() {
  return runStore?.get(RUNS_KEY) ?? {};
}
function setRunMap(map) {
  if (runStore) void runStore.update(RUNS_KEY, map);
}
function clearRunInfo(taskId) {
  const map = getRunMap();
  delete map[taskId];
  setRunMap(map);
}
function setRunInfo(taskId, info) {
  const map = getRunMap();
  map[taskId] = info;
  setRunMap(map);
}
function topologicalSort(tasks) {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const visited = /* @__PURE__ */ new Set();
  const visiting = /* @__PURE__ */ new Set();
  const sorted = [];
  function visit(id) {
    if (visited.has(id)) return;
    if (visiting.has(id)) return;
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
  for (const task of tasks) {
    if (!visited.has(task.id)) sorted.push(task);
  }
  return sorted;
}
function parseOwnerRepo(repoUrl) {
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!m) return void 0;
  return { owner: m[1], repo: m[2] };
}
async function dispatchAndMonitor(repoUrl, taskId, onUpdate, workspaceRoot) {
  const parsed = parseOwnerRepo(repoUrl);
  if (!parsed) throw new Error("Cannot parse GitHub owner/repo from URL");
  const metricsKey = recordTaskStart(taskId);
  const wsRoot = workspaceRoot ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const { owner, repo } = parsed;
  const workflowFile = `scheduled-${taskId}.yml`;
  const session = await vscode.authentication.getSession("github", ["repo"], { createIfNone: true });
  const token = session.accessToken;
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "alex-cognitive-architecture"
  };
  setRunInfo(taskId, { status: "queued" });
  onUpdate({ status: "queued" });
  const dispatchTime = (/* @__PURE__ */ new Date()).toISOString();
  const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;
  const dispatchRes = await fetch(dispatchUrl, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ ref: "main" })
  });
  if (!dispatchRes.ok) {
    const body = await dispatchRes.text();
    const info = { status: "error" };
    setRunInfo(taskId, info);
    onUpdate(info);
    if (wsRoot) recordTaskEnd(wsRoot, metricsKey, false);
    throw new Error(`Dispatch failed (${dispatchRes.status}): ${body}`);
  }
  const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/runs?per_page=1&created=>${dispatchTime.slice(0, 19)}Z`;
  let attempts = 0;
  const maxAttempts = 120;
  const pollInterval = 5e3;
  const poll = async () => {
    attempts++;
    if (attempts > maxAttempts) {
      const info = { status: "error" };
      setRunInfo(taskId, info);
      onUpdate(info);
      if (wsRoot) recordTaskEnd(wsRoot, metricsKey, false);
      return;
    }
    try {
      const res = await fetch(runsUrl, { headers });
      if (!res.ok) return schedulePoll();
      const data = await res.json();
      const run = data.workflow_runs?.[0];
      if (!run) return schedulePoll();
      const status = run.status === "completed" ? run.conclusion === "success" ? "completed" : run.conclusion ?? "failure" : run.status ?? "in_progress";
      const info = {
        status,
        runUrl: run.html_url,
        conclusion: run.conclusion ?? void 0
      };
      setRunInfo(taskId, info);
      onUpdate(info);
      if (run.status !== "completed") {
        return schedulePoll();
      }
      if (wsRoot) recordTaskEnd(wsRoot, metricsKey, run.conclusion === "success");
    } catch {
      return schedulePoll();
    }
  };
  let cancelled = false;
  const timers = [];
  const schedulePoll = () => {
    if (cancelled) return;
    timers.push(setTimeout(() => void poll(), pollInterval));
  };
  timers.push(setTimeout(() => void poll(), 3e3));
  return { dispose: () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  } };
}
function loadScheduledTasks(workspaceRoot) {
  const configPath = path2.join(
    workspaceRoot,
    ".github",
    "config",
    "scheduled-tasks.json"
  );
  if (!fs2.existsSync(configPath)) {
    return [];
  }
  try {
    const config = JSON.parse(
      fs2.readFileSync(configPath, "utf-8")
    );
    return config.tasks ?? [];
  } catch {
    return [];
  }
}
function toggleTask(workspaceRoot, taskId) {
  const configPath = path2.join(
    workspaceRoot,
    ".github",
    "config",
    "scheduled-tasks.json"
  );
  if (!fs2.existsSync(configPath)) return null;
  try {
    const config = JSON.parse(
      fs2.readFileSync(configPath, "utf-8")
    );
    const task = config.tasks?.find((t) => t.id === taskId);
    if (!task) return null;
    task.enabled = !task.enabled;
    fs2.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
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
function deleteTask(workspaceRoot, taskId) {
  const configPath = path2.join(
    workspaceRoot,
    ".github",
    "config",
    "scheduled-tasks.json"
  );
  if (!fs2.existsSync(configPath)) return null;
  try {
    const config = JSON.parse(
      fs2.readFileSync(configPath, "utf-8")
    );
    const idx = config.tasks?.findIndex((t) => t.id === taskId);
    if (idx === void 0 || idx < 0) return null;
    config.tasks.splice(idx, 1);
    fs2.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
    removeWorkflow(workspaceRoot, taskId);
    return config.tasks;
  } catch {
    return null;
  }
}
function hasWorkflow(workspaceRoot, taskId) {
  const workflowPath2 = path2.join(
    workspaceRoot,
    ".github",
    "workflows",
    `scheduled-${taskId}.yml`
  );
  return fs2.existsSync(workflowPath2);
}
function workflowDir(workspaceRoot) {
  return path2.join(workspaceRoot, ".github", "workflows");
}
function workflowPath(workspaceRoot, taskId) {
  return path2.join(workflowDir(workspaceRoot), `scheduled-${taskId}.yml`);
}
function sanitizeForYaml(value) {
  return value.replace(/[\\"`$!#&|;(){}<>]/g, "");
}
function validateTaskId(id) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Invalid task ID: "${id}". Must be lowercase alphanumeric with hyphens.`);
  }
  return id;
}
function validateCron(cron) {
  if (!/^[0-9*\/,\- ]+$/.test(cron)) {
    throw new Error(`Invalid cron expression: "${cron}".`);
  }
  return cron;
}
function agentWorkflowYaml(task) {
  const safeName = sanitizeForYaml(task.name);
  const safeId = validateTaskId(task.id);
  const safeCron = validateCron(task.schedule);
  return `# Auto-generated \u2014 do not edit manually
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
        id: create
        env:
          GH_TOKEN: \${{ github.token }}
          TASK_NAME: "${safeName}"
          PROMPT_FILE: "${sanitizeForYaml(task.promptFile ?? "")}"
        run: |
          ISSUE_URL=$(gh issue create \\
            --title "$TASK_NAME: $(date -u +%Y-%m-%d-%H%M)" \\
            --body-file "$PROMPT_FILE" \\
            --label automated,${safeId})
          echo "issue_url=$ISSUE_URL" >> $GITHUB_OUTPUT

      - name: Assign Copilot to issue
        if: steps.create.outputs.issue_url != ''
        continue-on-error: true
        env:
          GH_TOKEN: \${{ secrets.COPILOT_PAT || github.token }}
        run: |
          ISSUE_NUM=$(echo "\${{ steps.create.outputs.issue_url }}" | grep -oE '[0-9]+$')
          gh api \\
            --method POST \\
            -H "Accept: application/vnd.github+json" \\
            -H "X-GitHub-Api-Version: 2022-11-28" \\
            "/repos/\${{ github.repository }}/issues/\${ISSUE_NUM}/assignees" \\
            --input - <<< '{
            "assignees": ["copilot-swe-agent[bot]"],
            "agent_assignment": {
              "target_repo": "'"\${{ github.repository }}"'",
              "base_branch": "main"
            }
          }' || echo "::warning::Could not auto-assign Copilot. Add a COPILOT_PAT repo secret for automatic assignment."
`;
}
function directWorkflowYaml(task) {
  const safeName = sanitizeForYaml(task.name);
  const safeDesc = sanitizeForYaml(task.description);
  const safeMuscle = task.muscle ? sanitizeForYaml(task.muscle) : "";
  const safeArgs = task.muscleArgs ? ` ${task.muscleArgs.map(sanitizeForYaml).join(" ")}` : "";
  const safeId = validateTaskId(task.id);
  const safeCron = validateCron(task.schedule);
  return `# Auto-generated \u2014 do not edit manually
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
function generateWorkflow(workspaceRoot, task) {
  let content;
  if (task.mode === "agent" && task.promptFile) {
    content = agentWorkflowYaml(task);
  } else if (task.mode === "direct" && task.muscle) {
    content = directWorkflowYaml(task);
  } else {
    return false;
  }
  const dir = workflowDir(workspaceRoot);
  if (!fs2.existsSync(dir)) fs2.mkdirSync(dir, { recursive: true });
  fs2.writeFileSync(workflowPath(workspaceRoot, task.id), content, "utf-8");
  return true;
}
function removeWorkflow(workspaceRoot, taskId) {
  const fp = workflowPath(workspaceRoot, taskId);
  if (fs2.existsSync(fp)) fs2.unlinkSync(fp);
}
function addTask(workspaceRoot, task) {
  const configPath = path2.join(
    workspaceRoot,
    ".github",
    "config",
    "scheduled-tasks.json"
  );
  try {
    let config;
    if (fs2.existsSync(configPath)) {
      config = JSON.parse(fs2.readFileSync(configPath, "utf-8"));
    } else {
      const dir = path2.dirname(configPath);
      if (!fs2.existsSync(dir)) fs2.mkdirSync(dir, { recursive: true });
      config = { version: "1.0.0", tasks: [] };
    }
    if (config.tasks.some((t) => t.id === task.id)) {
      vscode.window.showWarningMessage(`Task "${task.id}" already exists.`);
      return false;
    }
    config.tasks.push(task);
    fs2.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
    return true;
  } catch {
    return false;
  }
}
var SCHEDULE_PRESETS = [
  { label: "Every 3 hours", cron: "0 */3 * * *", description: "8 times/day" },
  { label: "Every 6 hours", cron: "0 */6 * * *", description: "4 times/day" },
  { label: "Every 12 hours", cron: "0 */12 * * *", description: "Twice daily" },
  { label: "Daily at 8 AM", cron: "0 8 * * *", description: "Once daily (UTC)" },
  { label: "Daily at noon", cron: "0 12 * * *", description: "Once daily (UTC)" },
  { label: "Weekly Monday", cron: "0 8 * * 1", description: "Every Monday 8 AM UTC" },
  { label: "Weekly Friday", cron: "0 16 * * 5", description: "Every Friday 4 PM UTC" },
  { label: "Custom cron...", cron: "", description: "Enter POSIX cron expression" }
];
async function addTaskWizard(workspaceRoot) {
  const name = await vscode.window.showInputBox({
    title: "Add Scheduled Task (1/5)",
    prompt: "Task name",
    placeHolder: "e.g. Weekly Code Review",
    validateInput: (v) => v.trim() ? void 0 : "Name is required"
  });
  if (!name) return false;
  const description = await vscode.window.showInputBox({
    title: "Add Scheduled Task (2/5)",
    prompt: "Brief description",
    placeHolder: "What does this automation do?",
    validateInput: (v) => v.trim() ? void 0 : "Description is required"
  });
  if (!description) return false;
  const modePick = await vscode.window.showQuickPick(
    [
      {
        label: "$(hubot) Cloud Agent",
        description: "Creates a GitHub issue assigned to Copilot",
        detail: "Best for creative tasks: writing, analysis, reviews",
        mode: "agent"
      },
      {
        label: "$(terminal) Direct",
        description: "Runs a script in GitHub Actions",
        detail: "Best for mechanical tasks: audits, builds, syncs",
        mode: "direct"
      }
    ],
    { title: "Add Scheduled Task (3/5)", placeHolder: "Execution mode" }
  );
  if (!modePick) return false;
  const schedPick = await vscode.window.showQuickPick(
    SCHEDULE_PRESETS.map((p) => ({
      label: p.label,
      description: p.description,
      cron: p.cron
    })),
    { title: "Add Scheduled Task (4/5)", placeHolder: "Schedule frequency" }
  );
  if (!schedPick) return false;
  let cron = schedPick.cron;
  if (!cron) {
    const custom = await vscode.window.showInputBox({
      title: "Custom Cron Expression",
      prompt: "POSIX cron: minute hour day-of-month month day-of-week",
      placeHolder: "0 */4 * * *",
      validateInput: (v) => {
        const parts = v.trim().split(/\s+/);
        return parts.length === 5 ? void 0 : "Must be 5 space-separated fields";
      }
    });
    if (!custom) return false;
    cron = custom.trim();
  }
  const skillsDir = path2.join(workspaceRoot, ".github", "skills");
  let skill;
  if (fs2.existsSync(skillsDir)) {
    const skills = fs2.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => ({ label: d.name }));
    if (skills.length > 0) {
      const skillPick = await vscode.window.showQuickPick(
        [{ label: "(none)", description: "No specific skill" }, ...skills],
        { title: "Add Scheduled Task (5/5)", placeHolder: "Associate a skill (optional)" }
      );
      if (skillPick && skillPick.label !== "(none)") {
        skill = skillPick.label;
      }
    }
  }
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!id) {
    vscode.window.showErrorMessage("Task name must contain at least one letter or digit.");
    return false;
  }
  const task = {
    id,
    name,
    description,
    mode: modePick.mode,
    schedule: cron,
    enabled: true,
    ...skill ? { skill } : {},
    ...modePick.mode === "agent" ? { promptFile: `.github/config/scheduled-tasks/${id}.md` } : {}
  };
  if (addTask(workspaceRoot, task)) {
    if (modePick.mode === "agent" && task.promptFile) {
      const tplPath = path2.join(workspaceRoot, task.promptFile);
      const tplDir = path2.dirname(tplPath);
      if (!fs2.existsSync(tplDir)) fs2.mkdirSync(tplDir, { recursive: true });
      if (!fs2.existsSync(tplPath)) {
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
          ""
        ].join("\n");
        fs2.writeFileSync(tplPath, template, "utf-8");
      }
      void vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.file(tplPath)
      );
    }
    generateWorkflow(workspaceRoot, task);
    if (modePick.mode === "agent" && !hasCopilotPAT(workspaceRoot)) {
      void setupCopilotPAT(workspaceRoot);
    }
    const nextSteps = modePick.mode === "agent" ? `Task "${name}" created with workflow. Edit the prompt template, then commit & push to activate on GitHub.` : `Task "${name}" created with workflow. Commit & push to activate on GitHub.`;
    const action = modePick.mode === "agent" ? "Edit Prompt" : "View Workflow";
    void vscode.window.showInformationMessage(nextSteps, action).then((choice) => {
      if (choice === "Edit Prompt" && task.promptFile) {
        const fp = path2.join(workspaceRoot, task.promptFile);
        void vscode.commands.executeCommand("vscode.open", vscode.Uri.file(fp));
      } else if (choice === "View Workflow") {
        const fp = workflowPath(workspaceRoot, task.id);
        void vscode.commands.executeCommand("vscode.open", vscode.Uri.file(fp));
      }
    });
    return true;
  }
  return false;
}
var SCHEDULE_CSS = `
    /* Autopilot tab \u2014 uses design tokens from parent */
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
      opacity: 0.6;
      border-left: 3px solid transparent;
    }
    .schedule-task.disabled:hover {
      opacity: 0.8;
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
    .schedule-section-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: var(--spacing-sm, 8px) var(--spacing-sm, 8px) var(--spacing-xs, 4px);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground);
    }
    .schedule-section-header .codicon {
      font-size: 13px;
      opacity: 0.7;
    }
    .schedule-section-header strong {
      flex: 1;
    }
    .schedule-setup-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      margin: 8px 0;
      border-radius: 6px;
      background: var(--vscode-inputValidation-warningBackground, rgba(205, 145, 0, 0.1));
      border: 1px solid var(--vscode-inputValidation-warningBorder, #cda100);
      font-size: 12px;
    }
    .schedule-setup-banner .codicon-warning {
      color: var(--vscode-inputValidation-warningBorder, #cda100);
      flex-shrink: 0;
    }
    .schedule-setup-banner .action-btn {
      flex-shrink: 0;
      width: auto;
    }
`;

// src/chat/handler.ts
var chatHandler = async (request, context, stream, token) => {
  if (request.command === "autopilot") {
    return handleAutopilot(request, stream);
  }
  if (request.command === "cloud") {
    return handleCloud(request, stream, token);
  }
  return {};
};
async function handleAutopilot(request, stream) {
  const wsRoot = vscode2.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!wsRoot) {
    stream.markdown("Open a workspace folder to use Autopilot.");
    return {};
  }
  const tasks = loadScheduledTasks(wsRoot);
  const query = request.prompt.trim().toLowerCase();
  if (query === "list" || query === "") {
    stream.markdown("## Autopilot Tasks\n\n");
    const sorted = topologicalSort(tasks);
    for (const t of sorted) {
      const icon = t.mode === "agent" ? "\u{1F916}" : "\u2699\uFE0F";
      const status = t.enabled ? "Active" : "Paused";
      const deps = t.dependsOn?.length ? ` \u2190 depends on: ${t.dependsOn.join(", ")}` : "";
      stream.markdown(`- ${icon} **${t.name}** \u2014 ${status}${deps}
`);
    }
    stream.markdown(`
*${tasks.length} tasks configured. Use \`/autopilot status\` for run history.*`);
    return {};
  }
  if (query === "status") {
    stream.markdown("## Autopilot Status\n\n");
    const enabled = tasks.filter((t) => t.enabled);
    const disabled = tasks.filter((t) => !t.enabled);
    stream.markdown(`**${enabled.length}** active \xB7 **${disabled.length}** paused

`);
    for (const t of enabled) {
      stream.markdown(`- **${t.name}** \u2014 \`${t.schedule}\`
`);
    }
    return {};
  }
  if (query.startsWith("run ")) {
    const taskId = query.slice(4).trim();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      stream.markdown(`Task \`${taskId}\` not found. Use \`/autopilot list\` to see available tasks.`);
      return {};
    }
    if (task.mode === "agent" && task.promptFile) {
      const promptPath = path3.join(wsRoot, task.promptFile);
      const resolved = path3.resolve(promptPath);
      if (!resolved.toLowerCase().startsWith(wsRoot.toLowerCase())) {
        stream.markdown("Invalid prompt file path.");
        return {};
      }
      if (fs3.existsSync(resolved)) {
        const promptContent = fs3.readFileSync(resolved, "utf-8").replace(/^---[\s\S]*?---\s*/, "").trim();
        stream.markdown(`Running **${task.name}**...

${promptContent}`);
      } else {
        stream.markdown(`Prompt file not found: \`${task.promptFile}\``);
      }
    } else {
      stream.markdown(`Task **${task.name}** uses direct mode (script: \`${task.muscle ?? "n/a"}\`). Run it from the Autopilot tab or GitHub Actions.`);
    }
    return {};
  }
  stream.markdown("## Autopilot Commands\n\n");
  stream.markdown("- `/autopilot list` \u2014 Show all configured tasks\n");
  stream.markdown("- `/autopilot status` \u2014 Show active tasks and schedules\n");
  stream.markdown("- `/autopilot run <task-id>` \u2014 Run a specific task\n");
  return {};
}
async function handleCloud(request, stream, token) {
  const wsRoot = vscode2.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!wsRoot) {
    stream.markdown("Open a workspace folder to use cloud dispatch.");
    return {};
  }
  const tasks = loadScheduledTasks(wsRoot);
  const query = request.prompt.trim().toLowerCase();
  if (query === "" || query === "help") {
    stream.markdown("## Cloud Dispatch\n\n");
    stream.markdown("Dispatch Autopilot tasks to GitHub Actions for cloud execution.\n\n");
    stream.markdown("- `/cloud list` \u2014 Show cloud-eligible tasks\n");
    stream.markdown("- `/cloud run <task-id>` \u2014 Dispatch a task to GitHub Actions\n");
    return {};
  }
  if (query === "list") {
    const cloudTasks = tasks.filter((t) => t.enabled && t.mode === "agent");
    if (cloudTasks.length === 0) {
      stream.markdown("No cloud-eligible tasks found. Enable agent-mode tasks in scheduled-tasks.json.");
      return {};
    }
    stream.markdown("## Cloud-Eligible Tasks\n\n");
    for (const t of cloudTasks) {
      stream.markdown(`- **${t.id}** \u2014 ${t.name}
`);
    }
    stream.markdown(`
*Use \`/cloud run <task-id>\` to dispatch.*`);
    return {};
  }
  if (query.startsWith("run ")) {
    const taskId = query.slice(4).trim();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      stream.markdown(`Task \`${taskId}\` not found. Use \`/cloud list\` to see eligible tasks.`);
      return {};
    }
    if (!task.enabled) {
      stream.markdown(`Task **${task.name}** is paused. Enable it first.`);
      return {};
    }
    const repoUrl = getGitHubRepoUrl(wsRoot);
    if (!repoUrl) {
      stream.markdown(`Could not determine GitHub repo URL from workspace.`);
      return {};
    }
    stream.markdown(`Dispatching **${task.name}** to GitHub Actions...

`);
    try {
      const disposable = await dispatchAndMonitor(repoUrl, task.id, () => {
      }, wsRoot);
      token.onCancellationRequested(() => disposable.dispose());
      stream.markdown(`Workflow dispatched. Check the Autopilot tab or GitHub Actions for progress.`);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const msg = raw.replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi, "[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g, "[path]");
      stream.markdown(`Dispatch failed: ${msg}`);
    }
    return {};
  }
  stream.markdown("Unknown cloud command. Use `/cloud help` for usage.");
  return {};
}

// src/sidebar/WelcomeViewProvider.ts
var vscode4 = __toESM(require("vscode"));
var crypto = __toESM(require("crypto"));
var fs6 = __toESM(require("fs"));
var path6 = __toESM(require("path"));
var os = __toESM(require("os"));

// src/healthPulse.ts
var fs4 = __toESM(require("fs"));
var path4 = __toESM(require("path"));
var import_child_process2 = require("child_process");

// src/dateUtils.ts
function daysBetween(a, b) {
  return Math.abs(b.getTime() - a.getTime()) / (1e3 * 60 * 60 * 24);
}

// src/healthPulse.ts
function computeHealthStatus(pulse) {
  const now = /* @__PURE__ */ new Date();
  const daysSinceDream = pulse.lastDreamDate ? Math.floor(daysBetween(pulse.lastDreamDate, now)) : Infinity;
  if (pulse.dreamNeeded && daysSinceDream > 14) return "critical";
  if (pulse.syncStale && daysSinceDream > 3) return "critical";
  if (pulse.dreamNeeded) return "attention";
  if (daysSinceDream > 7) return "attention";
  if (pulse.syncStale) return "attention";
  return "healthy";
}
function readDreamReport(workspaceRoot) {
  const reportPath = path4.join(
    workspaceRoot,
    ".github",
    "quality",
    "dream-report.json"
  );
  try {
    const raw = fs4.readFileSync(reportPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function readSyncManifest(workspaceRoot) {
  const manifestPath = path4.join(
    workspaceRoot,
    ".github",
    ".sync-manifest.json"
  );
  try {
    const raw = fs4.readFileSync(manifestPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function getExtensionBrainVersion() {
  try {
    const pkgPath = path4.resolve(__dirname, "..", "package.json");
    const pkg = JSON.parse(fs4.readFileSync(pkgPath, "utf-8"));
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}
function detectSyncStale(workspaceRoot) {
  const manifest = readSyncManifest(workspaceRoot);
  if (!manifest) return false;
  const extVersion2 = getExtensionBrainVersion();
  if (manifest.brainVersion !== extVersion2) return true;
  const lastSync = new Date(manifest.lastSync);
  if (isNaN(lastSync.getTime())) return true;
  const daysSince = daysBetween(lastSync, /* @__PURE__ */ new Date());
  if (daysSince > 7) return true;
  return false;
}
function detectUncommittedWork(workspaceRoot) {
  try {
    const staged = (0, import_child_process2.execFileSync)("git", ["diff", "--cached", "--name-only"], {
      cwd: workspaceRoot,
      encoding: "utf-8",
      timeout: 5e3
    }).trim();
    const modified = (0, import_child_process2.execFileSync)("git", ["diff", "--name-only"], {
      cwd: workspaceRoot,
      encoding: "utf-8",
      timeout: 5e3
    }).trim();
    const stagedCount = staged ? staged.split("\n").length : 0;
    const modifiedCount = modified ? modified.split("\n").length : 0;
    const totalCount = stagedCount + modifiedCount;
    if (totalCount === 0) return { fileCount: 0, days: 0 };
    let days = 0;
    try {
      const lastCommitDate = (0, import_child_process2.execFileSync)("git", ["log", "-1", "--format=%ci"], {
        cwd: workspaceRoot,
        encoding: "utf-8",
        timeout: 5e3
      }).trim();
      if (lastCommitDate) {
        days = Math.floor(daysBetween(new Date(lastCommitDate), /* @__PURE__ */ new Date()));
      }
    } catch {
    }
    return { fileCount: totalCount, days };
  } catch {
    return { fileCount: 0, days: 0 };
  }
}
function countLiveInventory(workspaceRoot) {
  const ghDir = path4.join(workspaceRoot, ".github");
  const countDirs = (dir) => {
    try {
      return fs4.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).length;
    } catch {
      return 0;
    }
  };
  const countFiles = (dir, suffix, recursive = false) => {
    try {
      if (!recursive) {
        return fs4.readdirSync(dir).filter((f) => f.endsWith(suffix)).length;
      }
      let count = 0;
      const walk = (d) => {
        for (const entry of fs4.readdirSync(d, { withFileTypes: true })) {
          if (entry.isDirectory()) walk(path4.join(d, entry.name));
          else if (entry.name.endsWith(suffix)) count++;
        }
      };
      walk(dir);
      return count;
    } catch {
      return 0;
    }
  };
  return {
    skills: countDirs(path4.join(ghDir, "skills")),
    instructions: countFiles(path4.join(ghDir, "instructions"), ".instructions.md"),
    prompts: countFiles(path4.join(ghDir, "prompts"), ".prompt.md", true),
    agents: countFiles(path4.join(ghDir, "agents"), ".agent.md")
  };
}
function collectHealthPulse(workspaceRoot) {
  const report = readDreamReport(workspaceRoot);
  const inv = countLiveInventory(workspaceRoot);
  const lastDreamDate = report ? new Date(report.timestamp) : null;
  const dreamNeeded = report ? report.brokenRefs.length > 0 || report.trifectaIssues.length > 20 : true;
  const gitStatus = detectUncommittedWork(workspaceRoot);
  const pulse = {
    status: "healthy",
    // placeholder — computed below
    skillCount: inv.skills,
    instructionCount: inv.instructions,
    promptCount: inv.prompts,
    agentCount: inv.agents,
    lastDreamDate,
    dreamNeeded,
    syncStale: detectSyncStale(workspaceRoot),
    uncommittedFileCount: gitStatus.fileCount,
    uncommittedDays: gitStatus.days
  };
  pulse.status = computeHealthStatus(pulse);
  return pulse;
}

// src/frecency.ts
var HALF_LIFE_DAYS = 7;
var MIN_SCORE_THRESHOLD = 0.1;
function recencyWeight(lastUsed, now) {
  const daysSince = (now.getTime() - lastUsed.getTime()) / (1e3 * 60 * 60 * 24);
  const lambda = Math.LN2 / HALF_LIFE_DAYS;
  return Math.exp(-lambda * daysSince);
}
function calculateScore(record, now = /* @__PURE__ */ new Date()) {
  const lastUsed = new Date(record.lastUsed);
  const weight = recencyWeight(lastUsed, now);
  return Math.sqrt(record.count) * weight;
}
function recordUse(data, actionId, now = /* @__PURE__ */ new Date()) {
  const existing = data.actions.find((a) => a.id === actionId);
  if (existing) {
    return {
      ...data,
      actions: data.actions.map(
        (a) => a.id === actionId ? { ...a, count: a.count + 1, lastUsed: now.toISOString() } : a
      )
    };
  } else {
    return {
      ...data,
      actions: [
        ...data.actions,
        { id: actionId, count: 1, lastUsed: now.toISOString() }
      ]
    };
  }
}
function sortByFrecency(actionIds, data, now = /* @__PURE__ */ new Date()) {
  const scores = /* @__PURE__ */ new Map();
  for (const record of data.actions) {
    const score = calculateScore(record, now);
    if (score >= MIN_SCORE_THRESHOLD) {
      scores.set(record.id, score);
    }
  }
  const scored = actionIds.filter((id) => scores.has(id));
  const unscored = actionIds.filter((id) => !scores.has(id));
  scored.sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0));
  return [...scored, ...unscored];
}
function createEmptyData() {
  return { version: 1, actions: [] };
}

// src/taglines.ts
var HEALTHY_TAGLINES = [
  // Partnership & collaboration
  "Two minds, one vision",
  "Better together than alone",
  "Your ideas, amplified",
  "Where human meets machine",
  "The sum of us",
  // Building & creating
  "Let's build something meaningful",
  "From thought to reality",
  "Creating what neither could alone",
  "Turning possibility into code",
  "What will we make today?",
  // Growth & exploration
  "Exploring the edge of possible",
  "Learning never looked like this",
  "Growing smarter, together",
  "Every question opens a door",
  "Uncharted territory, good company",
  // Trust & understanding
  "I see what you're building",
  "Your vision, our journey",
  "Thinking alongside you",
  "Understanding before answering"
];
var ATTENTION_TAGLINES = [
  "Still here, still building",
  "Every pause is a chance to reflect",
  "The best work takes time",
  "Progress isn't always visible",
  "Let's pick up where we left off",
  "Good things are worth the wait",
  "One conversation at a time"
];
var CRITICAL_TAGLINES = [
  "Fresh starts are powerful",
  "We'll figure this out",
  "The first step is showing up",
  "Building begins with connection",
  "Ready when you are",
  "Together, we'll find the way"
];
var UNKNOWN_TAGLINES = [
  "Two minds, ready to build",
  "Let's see what we can create",
  "The beginning of something",
  "Your partner in possibility"
];
var MORNING_TAGLINES = [
  "A new day to create",
  "Fresh ideas await",
  "What will we build today?"
];
var EVENING_TAGLINES = [
  "Wrapping up what we started",
  "Good work deserves reflection",
  "Tomorrow we build on today"
];
function getTimeOfDay(date = /* @__PURE__ */ new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
function getDayOfYear(date = /* @__PURE__ */ new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1e3 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
function selectFromPool(pool, date = /* @__PURE__ */ new Date()) {
  const dayOfYear = getDayOfYear(date);
  return pool[dayOfYear % pool.length];
}
function getPoolForStatus(status) {
  switch (status) {
    case "healthy":
      return HEALTHY_TAGLINES;
    case "attention":
      return ATTENTION_TAGLINES;
    case "critical":
      return CRITICAL_TAGLINES;
    default:
      return UNKNOWN_TAGLINES;
  }
}
function loadTaglineConfig(workspaceRoot, fs14, path14) {
  const configPath = path14.join(workspaceRoot, ".github", "config", "taglines.json");
  if (!fs14.existsSync(configPath)) {
    return null;
  }
  try {
    const content = fs14.readFileSync(configPath, "utf-8");
    const config = JSON.parse(content);
    if (!config.taglines?.project || config.taglines.project.length === 0) {
      return null;
    }
    return config;
  } catch {
    return null;
  }
}
function getConfigTaglines(config) {
  const all = [];
  for (const category of Object.keys(config.taglines)) {
    const pool = config.taglines[category];
    if (Array.isArray(pool)) {
      all.push(...pool);
    }
  }
  return all;
}
function getTagline(options = {}) {
  const {
    status = "unknown",
    config,
    useTimeOfDay = true,
    date = /* @__PURE__ */ new Date()
  } = options;
  const dayOfYear = getDayOfYear(date);
  if (config && status === "healthy") {
    const projectWeight = config.rotation?.projectWeight ?? 50;
    const threshold = Math.floor(projectWeight);
    const shouldUseProject = dayOfYear % 100 < threshold;
    if (shouldUseProject) {
      const projectTaglines = getConfigTaglines(config);
      if (projectTaglines.length > 0) {
        return selectFromPool(projectTaglines, date);
      }
    }
  }
  if (useTimeOfDay && status === "healthy") {
    if (dayOfYear % 10 === 0) {
      const tod = getTimeOfDay(date);
      if (tod === "morning") {
        return selectFromPool(MORNING_TAGLINES, date);
      } else if (tod === "evening") {
        return selectFromPool(EVENING_TAGLINES, date);
      }
    }
  }
  const pool = getPoolForStatus(status);
  return selectFromPool(pool, date);
}

// src/sidebar/loopMenu.ts
var fs5 = __toESM(require("fs"));
var path5 = __toESM(require("path"));
function stripFrontmatter(content) {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? content.slice(match[0].length).trim() : content.trim();
}
function loadSkillPartials(extensionRoot) {
  const skillsDir = path5.join(extensionRoot, ".github", "skills");
  if (!fs5.existsSync(skillsDir)) return [];
  const partialGroups = [];
  let entries;
  try {
    entries = fs5.readdirSync(skillsDir, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const partialPath = path5.join(skillsDir, entry.name, "loop-config.partial.json");
    if (!fs5.existsSync(partialPath)) continue;
    try {
      const partial = JSON.parse(
        fs5.readFileSync(partialPath, "utf-8")
      );
      if (Array.isArray(partial.groups)) {
        for (const g of partial.groups) {
          partialGroups.push({ ...g, source: "skill" });
        }
      }
    } catch {
    }
  }
  return partialGroups;
}
function mergeGroups(base, partials) {
  const merged = base.map((g) => ({ ...g, buttons: [...g.buttons] }));
  for (const partial of partials) {
    const existing = merged.find((g) => g.id === partial.id);
    if (existing) {
      const existingIds = new Set(
        existing.buttons.map((b) => b.id ?? b.label)
      );
      for (const btn of partial.buttons) {
        const btnId = btn.id ?? btn.label;
        if (!existingIds.has(btnId)) {
          existing.buttons.push(btn);
          existingIds.add(btnId);
        }
      }
    } else {
      merged.push({ ...partial, buttons: [...partial.buttons] });
    }
  }
  return merged;
}
function filterByPhase(groups, currentPhase) {
  if (!currentPhase) return groups;
  return groups.filter((g) => !g.phase || g.phase.includes(currentPhase)).map((g) => {
    const filteredButtons = g.buttons.filter(
      (b) => !b.phase || b.phase.includes(currentPhase)
    );
    const isPhaseMatch = g.phase?.includes(currentPhase);
    return {
      ...g,
      buttons: filteredButtons,
      collapsed: isPhaseMatch ? false : g.collapsed
    };
  }).filter((g) => g.buttons.length > 0);
}
function resolveButton(b, promptDir) {
  const button = {
    id: b.id,
    icon: b.icon,
    label: b.label,
    command: b.command,
    hint: b.hint,
    tooltip: b.tooltip
  };
  if (b.promptFile) {
    const promptPath = path5.join(promptDir, b.promptFile);
    try {
      if (fs5.existsSync(promptPath)) {
        button.prompt = stripFrontmatter(
          fs5.readFileSync(promptPath, "utf-8")
        );
      }
    } catch {
    }
  }
  if (!button.prompt && b.prompt) {
    button.prompt = b.prompt;
  }
  if (b.file) {
    button.file = b.file;
  }
  return button;
}
function loadLoopGroups(extensionRoot) {
  const configPath = path5.join(
    extensionRoot,
    ".github",
    "config",
    "loop-menu.json"
  );
  if (!fs5.existsSync(configPath)) {
    return [];
  }
  let config;
  try {
    config = JSON.parse(fs5.readFileSync(configPath, "utf-8"));
  } catch {
    return [];
  }
  if (!Array.isArray(config.groups)) {
    return [];
  }
  const skillPartials = loadSkillPartials(extensionRoot);
  const mergedGroups = mergeGroups(config.groups, skillPartials);
  const phaseFiltered = filterByPhase(mergedGroups, config.projectPhase);
  const promptDir = path5.join(extensionRoot, ".github", "prompts", "loop");
  return phaseFiltered.map((g) => ({
    id: g.id,
    label: g.label,
    desc: g.desc,
    accent: g.accent,
    icon: g.icon,
    collapsed: g.collapsed,
    buttons: g.buttons.map((b) => resolveButton(b, promptDir))
  }));
}

// src/sidebar/agentActivity.ts
var vscode3 = __toESM(require("vscode"));
var import_child_process3 = require("child_process");
var cachedActivity = {
  recentAgentPRs: [],
  pendingReviews: [],
  totalPending: 0,
  lastFetched: null,
  error: null
};
function runGhAsync(args, cwd) {
  return new Promise((resolve5) => {
    const parts = args.split(/\s+/);
    (0, import_child_process3.execFile)("gh", parts, {
      cwd,
      timeout: 15e3,
      maxBuffer: 1024 * 1024
    }, (err, stdout) => {
      if (err) {
        resolve5(null);
        return;
      }
      resolve5(stdout.trim());
    });
  });
}
function parsePRs(json) {
  if (!json) return [];
  try {
    const raw = JSON.parse(json);
    return raw.map((pr) => ({
      number: pr.number,
      title: pr.title,
      url: pr.url,
      state: pr.state,
      author: pr.author?.login ?? "unknown",
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
      isDraft: pr.isDraft ?? false,
      reviewDecision: pr.reviewDecision ?? "",
      labels: (pr.labels ?? []).map((l) => l.name)
    }));
  } catch {
    return [];
  }
}
var PR_FIELDS = "number,title,url,state,author,createdAt,updatedAt,isDraft,reviewDecision,labels";
var refreshInFlight = false;
async function refreshAgentActivityAsync(workspaceRoot, onUpdate) {
  if (refreshInFlight) return;
  refreshInFlight = true;
  try {
    const [agentJson, reviewJson] = await Promise.all([
      runGhAsync(
        `pr list --author app/copilot-swe-agent --state all --limit 10 --json ${PR_FIELDS}`,
        workspaceRoot
      ),
      runGhAsync(
        `pr list --search review-requested:@me --state open --limit 10 --json ${PR_FIELDS}`,
        workspaceRoot
      )
    ]);
    const recentAgentPRs = parsePRs(agentJson);
    const pendingReviews = parsePRs(reviewJson);
    cachedActivity = {
      recentAgentPRs,
      pendingReviews,
      totalPending: pendingReviews.length,
      lastFetched: /* @__PURE__ */ new Date(),
      error: null
    };
  } catch (err) {
    cachedActivity = {
      ...cachedActivity,
      error: err instanceof Error ? err.message : String(err)
    };
  }
  refreshInFlight = false;
  onUpdate?.();
}
var statusBarItem = null;
function createAgentStatusBar(context) {
  statusBarItem = vscode3.window.createStatusBarItem(
    vscode3.StatusBarAlignment.Right,
    50
  );
  statusBarItem.command = "alex.openChat";
  statusBarItem.name = "Alex Agent Activity";
  context.subscriptions.push(statusBarItem);
  return statusBarItem;
}
function updateAgentStatusBar(workspaceRoot) {
  if (!statusBarItem) return;
  if (!workspaceRoot) {
    statusBarItem.text = "$(brain) Alex";
    statusBarItem.tooltip = "Alex Cognitive Architecture";
    statusBarItem.show();
    return;
  }
  const pending = cachedActivity.pendingReviews;
  if (pending.length > 0) {
    statusBarItem.text = `$(brain) Alex $(bell-dot) ${pending.length}`;
    statusBarItem.tooltip = `${pending.length} PR${pending.length === 1 ? "" : "s"} awaiting review`;
  } else {
    statusBarItem.text = "$(brain) Alex";
    statusBarItem.tooltip = "Alex Cognitive Architecture \u2014 no pending reviews";
  }
  statusBarItem.show();
  void refreshAgentActivityAsync(workspaceRoot, () => {
    const updated = cachedActivity.pendingReviews;
    if (!statusBarItem) return;
    if (updated.length > 0) {
      statusBarItem.text = `$(brain) Alex $(bell-dot) ${updated.length}`;
      statusBarItem.tooltip = `${updated.length} PR${updated.length === 1 ? "" : "s"} awaiting review`;
    } else {
      statusBarItem.text = "$(brain) Alex";
      statusBarItem.tooltip = "Alex Cognitive Architecture \u2014 no pending reviews";
    }
  });
}
var AGENT_ACTIVITY_CSS = `
  .agent-activity {
    margin: var(--spacing-sm, 8px) 0;
  }
  .agent-activity-empty {
    padding: var(--spacing-xl, 24px) var(--spacing-lg, 16px);
    text-align: center;
    color: var(--vscode-descriptionForeground);
  }
  .agent-activity-empty .codicon {
    font-size: 32px;
    display: block;
    margin-bottom: var(--spacing-sm, 8px);
    opacity: 0.5;
  }
  .agent-empty-title {
    font-size: var(--font-lg, 13px);
    font-weight: 600;
    color: var(--vscode-foreground);
    margin: var(--spacing-xs, 4px) 0;
  }
  .agent-empty-hint {
    font-size: var(--font-sm, 11px);
    color: var(--vscode-descriptionForeground);
    line-height: 1.5;
    margin: 0;
  }
  .agent-section {
    margin-bottom: var(--spacing-md, 12px);
  }
  .agent-section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
  }
  .agent-section-header .codicon {
    font-size: 13px;
    opacity: 0.7;
  }
  .agent-badge {
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    border-radius: 8px;
    padding: 0 6px;
    font-size: 10px;
    font-weight: 600;
    min-width: 16px;
    text-align: center;
  }
  .agent-pr-row {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm, 8px);
    padding: var(--spacing-sm, 8px);
    cursor: pointer;
    border-radius: var(--radius-sm, 4px);
    transition: background 0.12s ease;
  }
  .agent-pr-row:hover {
    background: var(--vscode-list-hoverBackground);
  }
  .agent-pr-row:focus-visible {
    outline: 2px solid var(--accent, #6366f1);
    outline-offset: -2px;
  }
  .agent-pr-row .codicon {
    margin-top: 2px;
    flex-shrink: 0;
  }
  .agent-pr-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .agent-pr-title {
    font-size: var(--font-md, 12px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .agent-pr-meta {
    font-size: var(--font-xs, 10px);
    color: var(--vscode-descriptionForeground);
    margin-top: 1px;
  }
  .agent-pr-arrow {
    opacity: 0;
    font-size: 12px;
    margin-top: 2px;
    flex-shrink: 0;
    transition: opacity 0.12s;
    color: var(--vscode-descriptionForeground);
  }
  .agent-pr-row:hover .agent-pr-arrow {
    opacity: 0.6;
  }
`;

// src/sidebar/WelcomeViewProvider.ts
var VIEW_ID = "alex.welcomeView";
function vscodeUserDataPath() {
  const platform2 = os.platform();
  if (platform2 === "win32") {
    return path6.join(process.env.APPDATA || path6.join(os.homedir(), "AppData", "Roaming"), "Code", "User");
  }
  if (platform2 === "darwin") {
    return path6.join(os.homedir(), "Library", "Application Support", "Code", "User");
  }
  return path6.join(process.env.XDG_CONFIG_HOME || path6.join(os.homedir(), ".config"), "Code", "User");
}
var extPkgPath = path6.resolve(__dirname, "..", "package.json");
var extVersion = (() => {
  try {
    return JSON.parse(fs6.readFileSync(extPkgPath, "utf-8")).version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
})();
var WIKI_BASE = "https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki";
var SETUP_GROUPS = [
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
        hint: "command"
      },
      {
        icon: "arrow-up",
        label: "Upgrade Architecture",
        command: "upgrade",
        tooltip: "Update to the latest brain architecture",
        hint: "command"
      },
      {
        icon: "cloud",
        label: "Setup AI-Memory",
        command: "setupAIMemory",
        tooltip: "Find or create the shared AI-Memory knowledge store",
        hint: "command"
      }
    ]
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
        hint: "command"
      },
      {
        icon: "shield",
        label: "Brain Health Check",
        command: "brainQA",
        tooltip: "Generate brain health quality grid",
        hint: "command"
      },
      {
        icon: "check-all",
        label: "Validate Skills",
        command: "validateSkills",
        tooltip: "Check all skills for compliance",
        hint: "command"
      },
      {
        icon: "dashboard",
        label: "Token Cost Report",
        command: "tokenCostReport",
        tooltip: "Measure brain file token costs",
        hint: "command"
      },
      {
        icon: "heart",
        label: "Meditate",
        command: "openChat",
        prompt: "Run a meditation session \u2014 consolidate knowledge, review recent changes, and strengthen architecture",
        tooltip: "Knowledge consolidation session",
        hint: "chat"
      },
      {
        icon: "graph",
        label: "Self-Actualize",
        command: "openChat",
        prompt: "Run a self-actualization assessment \u2014 evaluate architecture completeness, identify growth areas, and plan improvements",
        tooltip: "Deep self-assessment and growth",
        hint: "chat"
      }
    ]
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
        hint: "command"
      },
      {
        icon: "person-add",
        label: "New Agent",
        command: "createCustomAgent",
        tooltip: "Scaffold a custom agent with frontmatter",
        hint: "command"
      },
      {
        icon: "warning",
        label: "Lint Markdown",
        command: "markdownLint",
        tooltip: "Validate current file for converter readiness",
        hint: "command"
      },
      {
        icon: "lightbulb",
        label: "Extract Insights",
        command: "insightPipeline",
        tooltip: "Extract cross-project insights",
        hint: "command"
      },
      {
        icon: "references",
        label: "Set Package Context",
        command: "setContext",
        tooltip: "Switch active package in monorepo projects",
        hint: "command"
      }
    ]
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
        hint: "command"
      },
      {
        icon: "edit",
        label: "User Prompts",
        command: "openPrompts",
        tooltip: "Reusable prompt templates",
        hint: "command"
      },
      {
        icon: "server",
        label: "MCP Config",
        command: "openMcpConfig",
        tooltip: "Model Context Protocol servers",
        hint: "command"
      },
      {
        icon: "cloud",
        label: "Copilot Memory (GitHub)",
        command: "openExternal",
        file: "https://github.com/settings/copilot",
        tooltip: "Manage cloud-synced Copilot memory",
        hint: "link"
      }
    ]
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
        hint: "command"
      }
    ]
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
        hint: "link"
      },
      {
        icon: "comment-discussion",
        label: "User Stories",
        command: "openExternal",
        file: `${WIKI_BASE}/blog/README`,
        tooltip: "Real-world examples of working with Alex",
        hint: "link"
      },
      {
        icon: "mortar-board",
        label: "Tutorials",
        command: "openExternal",
        file: `${WIKI_BASE}/tutorials/README`,
        tooltip: "Step-by-step guides for common tasks",
        hint: "link"
      },
      {
        icon: "lightbulb",
        label: "LearnAI Playbooks",
        command: "openExternal",
        file: "https://learnai.correax.com/",
        tooltip: "80 AI playbooks for professional disciplines",
        hint: "link"
      },
      {
        icon: "bug",
        label: "Report an Issue",
        command: "openExternal",
        file: "https://github.com/fabioc-aloha/alex-cognitive-architecture/issues",
        tooltip: "Found a bug? Let us know",
        hint: "link"
      }
    ]
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
        tooltip: "Installed extension version"
      },
      {
        icon: "person",
        label: "Publisher: fabioc-aloha",
        command: "openExternal",
        file: "https://github.com/fabioc-aloha",
        hint: "link",
        tooltip: "View publisher on GitHub"
      },
      {
        icon: "law",
        label: "PolyForm Noncommercial 1.0.0",
        command: "openExternal",
        file: "https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/LICENSE.md",
        hint: "link",
        tooltip: "View license"
      }
    ]
  }
];
var ALLOWED_ORIGINS = [
  "https://github.com/",
  "https://marketplace.visualstudio.com/",
  "https://learnai.correax.com/"
];
var FRECENCY_KEY = "alex.quickActionFrecency";
var WelcomeViewProvider = class {
  constructor(extensionUri, globalState) {
    this.extensionUri = extensionUri;
    this.globalState = globalState;
    this.workspaceRoot = vscode4.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";
    this.frecencyData = globalState.get(FRECENCY_KEY) ?? createEmptyData();
  }
  static viewId = VIEW_ID;
  view;
  workspaceRoot;
  frecencyData;
  disposables = [];
  dispose() {
    for (const d of this.disposables) d.dispose();
    this.disposables.length = 0;
  }
  /** Record a Quick Action use and persist */
  recordActionUse(actionId) {
    this.frecencyData = recordUse(this.frecencyData, actionId);
    this.globalState.update(FRECENCY_KEY, this.frecencyData);
  }
  /** Load Loop groups from config, caching the result for the session */
  loopGroupsCache = null;
  getLoopGroups() {
    if (!this.loopGroupsCache) {
      this.loopGroupsCache = this.workspaceRoot ? loadLoopGroups(this.workspaceRoot) : [];
    }
    return this.loopGroupsCache;
  }
  /** Render groups with frecency-sorted buttons (except creative-loop which has deliberate order) */
  renderGroupsWithFrecency(groups) {
    const sortedGroups = groups.map((g) => {
      if (g.id === "creative-loop") return g;
      const buttonIds = g.buttons.map(
        (b) => b.id ?? b.label.toLowerCase().replace(/\s+/g, "-")
      );
      const sortedIds = sortByFrecency(buttonIds, this.frecencyData);
      const sortedButtons = sortedIds.map(
        (id) => g.buttons.find(
          (b) => (b.id ?? b.label.toLowerCase().replace(/\s+/g, "-")) === id
        )
      ).filter((b) => b !== void 0);
      return { ...g, buttons: sortedButtons };
    });
    return renderGroups(sortedGroups);
  }
  /** Re-render the sidebar with fresh health data */
  refresh() {
    this.loopGroupsCache = null;
    if (this.view) {
      this.view.webview.html = this.getHtml(this.view.webview);
    }
  }
  resolveWebviewView(webviewView, _context, _token) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };
    webviewView.webview.html = this.getHtml(webviewView.webview);
    if (this.workspaceRoot) {
      void refreshAgentActivityAsync(this.workspaceRoot, () => this.refresh());
    }
    webviewView.webview.onDidReceiveMessage(
      (msg) => this.handleMessage(msg)
    );
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.refresh();
      }
    });
  }
  async handleMessage(msg) {
    if (msg.actionId) {
      this.recordActionUse(msg.actionId);
    }
    switch (msg.command) {
      case "openChat":
        if (msg.prompt) {
          const needsUserInput = msg.prompt.endsWith(": ");
          await vscode4.commands.executeCommand("workbench.action.chat.open", {
            query: msg.prompt,
            isPartialQuery: needsUserInput
          });
        } else {
          await vscode4.commands.executeCommand("workbench.action.chat.open");
        }
        break;
      case "initialize":
        await vscode4.commands.executeCommand("alex.initialize");
        break;
      case "upgrade":
        await vscode4.commands.executeCommand("alex.upgrade");
        break;
      case "setupAIMemory":
        await vscode4.commands.executeCommand("alex.setupAIMemory");
        break;
      case "dream":
        await vscode4.commands.executeCommand("alex.dream");
        break;
      case "brainQA":
        await vscode4.commands.executeCommand("alex.brainQA");
        break;
      case "validateSkills":
        await vscode4.commands.executeCommand("alex.validateSkills");
        break;
      case "tokenCostReport":
        await vscode4.commands.executeCommand("alex.tokenCostReport");
        break;
      case "newSkill":
        await vscode4.commands.executeCommand("alex.newSkill");
        break;
      case "createCustomAgent":
        await vscode4.commands.executeCommand("alex.createCustomAgent");
        break;
      case "markdownLint":
        await vscode4.commands.executeCommand("alex.markdownLint");
        break;
      case "insightPipeline":
        await vscode4.commands.executeCommand("alex.insightPipeline");
        break;
      case "setContext":
        await vscode4.commands.executeCommand("alex.setContext");
        break;
      case "openSettings":
        await vscode4.commands.executeCommand(
          "workbench.action.openSettings",
          "alex"
        );
        break;
      case "openMemories":
        {
          const memoriesPath = vscode4.Uri.file(
            path6.join(
              vscodeUserDataPath(),
              "globalStorage",
              "github.copilot-chat",
              "memory-tool",
              "memories"
            )
          );
          try {
            await vscode4.commands.executeCommand("revealFileInOS", memoriesPath);
          } catch {
            await vscode4.commands.executeCommand("vscode.openFolder", memoriesPath, { forceNewWindow: false });
          }
        }
        break;
      case "openPrompts":
        {
          const promptsPath = vscode4.Uri.file(
            path6.join(vscodeUserDataPath(), "prompts")
          );
          try {
            await vscode4.commands.executeCommand("revealFileInOS", promptsPath);
          } catch {
            await vscode4.commands.executeCommand("vscode.openFolder", promptsPath, { forceNewWindow: false });
          }
        }
        break;
      case "openMcpConfig":
        {
          const mcpPath = vscode4.Uri.file(
            path6.join(vscodeUserDataPath(), "mcp.json")
          );
          await vscode4.commands.executeCommand("vscode.open", mcpPath);
        }
        break;
      case "openExternal":
        if (msg.file) {
          const url = String(msg.file);
          if (ALLOWED_ORIGINS.some((origin) => url.startsWith(origin))) {
            await vscode4.env.openExternal(vscode4.Uri.parse(url));
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
              const wfNote = task.enabled ? "Workflow created." : "Workflow removed.";
              vscode4.window.showInformationMessage(
                `Task "${task.name}" ${verb}. ${wfNote} Commit & push to activate on GitHub.`
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
          const confirm = await vscode4.window.showWarningMessage(
            `Delete task "${msg.file}"?`,
            { modal: true },
            "Delete"
          );
          if (confirm === "Delete") {
            const remaining = deleteTask(this.workspaceRoot, msg.file);
            if (remaining !== null) {
              this.refresh();
              vscode4.window.showInformationMessage(
                `Task "${msg.file}" deleted. Commit & push to remove the workflow from GitHub.`
              );
            }
          }
        }
        break;
      case "openPromptFile":
        if (this.workspaceRoot && msg.file) {
          const promptPath = path6.resolve(this.workspaceRoot, msg.file);
          if (!promptPath.toLowerCase().startsWith(this.workspaceRoot.toLowerCase() + path6.sep) && promptPath.toLowerCase() !== this.workspaceRoot.toLowerCase()) break;
          if (fs6.existsSync(promptPath)) {
            await vscode4.commands.executeCommand(
              "vscode.open",
              vscode4.Uri.file(promptPath)
            );
          } else {
            vscode4.window.showWarningMessage(
              `Prompt file not found: ${msg.file}`
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
            try {
              const pollDisposable = await dispatchAndMonitor(repoUrl, msg.file, (_info) => {
                this.refresh();
              }, this.workspaceRoot);
              this.disposables.push(pollDisposable);
              vscode4.window.showInformationMessage(
                `Workflow dispatched for "${msg.file}". Monitoring execution\u2026`
              );
            } catch (err) {
              const errMsg = err instanceof Error ? err.message : String(err);
              vscode4.window.showErrorMessage(`Failed to dispatch workflow: ${errMsg}`);
            }
          } else {
            const localRunKey = recordTaskStart(msg.file);
            const tasks = loadScheduledTasks(this.workspaceRoot);
            const task = tasks.find((t) => t.id === msg.file);
            if (task?.promptFile) {
              const promptPath = path6.resolve(this.workspaceRoot, task.promptFile);
              const wsLower = this.workspaceRoot.toLowerCase() + path6.sep;
              if (!promptPath.toLowerCase().startsWith(wsLower)) break;
              if (fs6.existsSync(promptPath)) {
                const promptContent = fs6.readFileSync(promptPath, "utf-8").replace(/^---[\s\S]*?---\s*/, "").trim();
                await vscode4.commands.executeCommand("workbench.action.chat.open", {
                  query: promptContent,
                  isPartialQuery: false
                });
                recordTaskEnd(this.workspaceRoot, localRunKey, true);
              } else {
                vscode4.window.showWarningMessage(
                  `Prompt file not found: ${task.promptFile}`
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
          const configPath = path6.join(
            this.workspaceRoot,
            ".github",
            "config",
            "scheduled-tasks.json"
          );
          if (fs6.existsSync(configPath)) {
            await vscode4.commands.executeCommand(
              "vscode.open",
              vscode4.Uri.file(configPath)
            );
          }
        }
        break;
      case "noop":
        break;
      case "switchTab":
        break;
    }
  }
  getHtml(webview) {
    const nonce = getNonce();
    const codiconsUri = webview.asWebviewUri(
      vscode4.Uri.joinPath(
        this.extensionUri,
        "dist",
        "codicon.css"
      )
    );
    const pulse = this.workspaceRoot ? collectHealthPulse(this.workspaceRoot) : null;
    const healthStatus = pulse?.status ?? "unknown";
    const taglineConfig = this.workspaceRoot ? loadTaglineConfig(this.workspaceRoot, fs6, path6) : null;
    const tagline = getTagline({ status: healthStatus, config: taglineConfig });
    return (
      /* html */
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'nonce-${nonce}'; font-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${codiconsUri}" rel="stylesheet">
  <style nonce="${nonce}">
    /* \u2550\u2550\u2550 Design Tokens \u2550\u2550\u2550 */
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

    /* Header \u2014 branded banner (always dark, matches Alex banner SVGs) */
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



    /* Tabs \u2014 44px touch target (WCAG 2.1 AA 2.5.5) */
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

    /* Action groups \u2014 collapsible sections */
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

    /* Buttons \u2014 44px touch target (WCAG 2.1 AA 2.5.5) */
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
    /* Noop buttons \u2014 informational only, not interactive */
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

    /* Hint badges \u2014 show button behavior (chat/link/command) */
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

    /* Tooltips \u2014 positioned below to fit narrow sidebar */
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
  <!-- Header \u2014 branded banner -->
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

    // Collapsible groups \u2014 persist state
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

    // Button clicks \u2014 event delegation
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
</html>`
    );
  }
};
function getNonce() {
  return crypto.randomBytes(16).toString("hex");
}
function renderGroups(groups) {
  return groups.map(
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
    }
  ).join("");
}
function renderButton(b, primary = false) {
  const cls = primary ? "action-btn primary" : "action-btn";
  const actionId = b.id ?? b.label.toLowerCase().replace(/\s+/g, "-");
  const attrs = [
    `data-command="${escAttr(b.command)}"`,
    `data-action-id="${escAttr(actionId)}"`,
    b.prompt ? `data-prompt="${escAttr(b.prompt)}"` : "",
    b.file ? `data-file="${escAttr(b.file)}"` : "",
    b.tooltip ? `data-tooltip="${escAttr(b.tooltip)}"` : ""
  ].filter(Boolean).join(" ");
  const hintIcons = {
    chat: "comment-discussion",
    link: "link-external",
    command: "zap"
  };
  const hint = b.hint ? `<span class="hint-badge" title="${b.hint}"><span class="codicon codicon-${hintIcons[b.hint]}"></span></span>` : "";
  return `<button class="${cls}" ${attrs}>
    <span class="codicon codicon-${escAttr(b.icon)}"></span>
    <span class="btn-label">${escHtml(b.label)}</span>
    ${hint}
  </button>`;
}

// src/sidebar/projectDetector.ts
var fs7 = __toESM(require("fs"));
var path7 = __toESM(require("path"));
function fileExists(root, ...segments) {
  return fs7.existsSync(path7.join(root, ...segments));
}
function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs7.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}
function detectConventions(root, pkg) {
  const conventions = [];
  if (pkg || fileExists(root, "tsconfig.json")) conventions.push("TypeScript");
  if (fileExists(root, "requirements.txt") || fileExists(root, "pyproject.toml") || fileExists(root, "setup.py")) conventions.push("Python");
  if (fileExists(root, "go.mod")) conventions.push("Go");
  if (fileExists(root, "Cargo.toml")) conventions.push("Rust");
  if (fileExists(root, "pom.xml") || fileExists(root, "build.gradle")) conventions.push("Java");
  const deps = { ...pkg?.dependencies ?? {}, ...pkg?.devDependencies ?? {} };
  if (deps["react"] || deps["react-dom"]) conventions.push("React");
  if (deps["next"]) conventions.push("Next.js");
  if (deps["vue"]) conventions.push("Vue");
  if (deps["vitepress"]) conventions.push("VitePress");
  if (deps["express"]) conventions.push("Express");
  if (deps["fastify"]) conventions.push("Fastify");
  if (deps["@azure/functions"]) conventions.push("Azure Functions");
  if (deps["esbuild"]) conventions.push("esbuild");
  if (deps["webpack"]) conventions.push("webpack");
  if (deps["vite"] && !deps["vitepress"]) conventions.push("Vite");
  if (deps["vitest"]) conventions.push("Vitest");
  if (deps["jest"]) conventions.push("Jest");
  if (deps["mocha"]) conventions.push("Mocha");
  if (deps["eslint"] || fileExists(root, ".eslintrc.json") || fileExists(root, "eslint.config.js") || fileExists(root, "eslint.config.mjs")) conventions.push("ESLint");
  if (deps["prettier"] || fileExists(root, ".prettierrc")) conventions.push("Prettier");
  if (fileExists(root, "pyproject.toml")) {
    try {
      const pyproject = fs7.readFileSync(path7.join(root, "pyproject.toml"), "utf-8");
      if (pyproject.includes("fastapi")) conventions.push("FastAPI");
      if (pyproject.includes("flask")) conventions.push("Flask");
      if (pyproject.includes("django")) conventions.push("Django");
      if (pyproject.includes("pytest")) conventions.push("pytest");
      if (pyproject.includes("ruff")) conventions.push("Ruff");
      if (pyproject.includes("mypy")) conventions.push("mypy");
    } catch {
    }
  }
  if (fileExists(root, "Dockerfile") || fileExists(root, "docker-compose.yml") || fileExists(root, "docker-compose.yaml")) {
    conventions.push("Docker");
  }
  return [...new Set(conventions)];
}
function extractCommands(root, pkg) {
  const result = {};
  const scripts = pkg?.scripts ?? {};
  if (scripts["build"]) result.buildCommand = "npm run build";
  if (scripts["build:prod"]) result.buildCommand = "npm run build:prod";
  if (scripts["test"]) result.testCommand = "npm test";
  if (scripts["lint"]) result.lintCommand = "npm run lint";
  if (!result.buildCommand && fileExists(root, "setup.py")) result.buildCommand = "python setup.py build";
  if (!result.testCommand && fileExists(root, "pyproject.toml")) result.testCommand = "pytest";
  if (!result.buildCommand && fileExists(root, "go.mod")) result.buildCommand = "go build ./...";
  if (!result.testCommand && fileExists(root, "go.mod")) result.testCommand = "go test ./...";
  const releasePatterns = ["scripts/release-vscode.cjs", "scripts/release-full.cjs", "scripts/release.cjs", "scripts/release.sh", "scripts/release.ps1"];
  for (const p of releasePatterns) {
    if (fileExists(root, p)) {
      result.releaseScript = p;
      break;
    }
  }
  return result;
}
function detectProject(workspaceRoot) {
  const pkgPath = path7.join(workspaceRoot, "package.json");
  const pkg = readJsonSafe(pkgPath);
  const conventions = detectConventions(workspaceRoot, pkg);
  const commands6 = extractCommands(workspaceRoot, pkg);
  let projectType = "generic";
  if (pkg) {
    const engines = pkg.engines;
    if (engines?.vscode) {
      projectType = "vscode-extension";
      return { projectType, ...commands6, conventions };
    }
  }
  if (fileExists(workspaceRoot, "platforms", "vscode-extension", "package.json")) {
    const nestedPkg = readJsonSafe(path7.join(workspaceRoot, "platforms", "vscode-extension", "package.json"));
    const engines = nestedPkg?.engines ?? {};
    if (engines.vscode) {
      projectType = "vscode-extension";
      return { projectType, ...commands6, conventions };
    }
  }
  if (pkg) {
    if (pkg.workspaces || fileExists(workspaceRoot, "lerna.json") || fileExists(workspaceRoot, "pnpm-workspace.yaml")) {
      projectType = "monorepo";
      return { projectType, ...commands6, conventions };
    }
  }
  if (fileExists(workspaceRoot, ".vitepress", "config.ts") || fileExists(workspaceRoot, ".vitepress", "config.mts") || fileExists(workspaceRoot, "next.config.js") || fileExists(workspaceRoot, "next.config.mjs") || fileExists(workspaceRoot, "gatsby-config.js") || fileExists(workspaceRoot, "astro.config.mjs")) {
    projectType = "static-site";
    return { projectType, ...commands6, conventions };
  }
  if (conventions.includes("FastAPI") || conventions.includes("Flask") || conventions.includes("Django")) {
    projectType = "python-api";
    return { projectType, ...commands6, conventions };
  }
  if (fileExists(workspaceRoot, "dbt_project.yml") || fileExists(workspaceRoot, "notebook") || fileExists(workspaceRoot, "synapse") || fileExists(workspaceRoot, ".pbixproj")) {
    projectType = "data-pipeline";
    return { projectType, ...commands6, conventions };
  }
  return { projectType, ...commands6, conventions };
}

// src/sidebar/loopConfigGenerator.ts
var fs8 = __toESM(require("fs"));
var path8 = __toESM(require("path"));
var VSCODE_EXTENSION_GROUPS = [
  {
    id: "extension-dev",
    label: "EXTENSION DEV",
    icon: "extensions",
    desc: "Package, publish, test, and debug the VS Code extension",
    collapsed: true,
    buttons: [
      {
        id: "ext-package",
        icon: "package",
        label: "Package VSIX",
        command: "openChat",
        prompt: "Package the VS Code extension into a .vsix file. Run the build first, then package with vsce. Report the file size.",
        hint: "chat",
        tooltip: "Build and package the extension"
      },
      {
        id: "ext-publish",
        icon: "cloud-upload",
        label: "Publish",
        command: "openChat",
        prompt: "Run the release preflight checks, then publish the extension to the VS Code Marketplace. Follow the release-management skill.",
        hint: "chat",
        tooltip: "Publish to VS Code Marketplace"
      },
      {
        id: "ext-test",
        icon: "beaker",
        label: "Extension Tests",
        command: "openChat",
        prompt: "Run all extension tests. Report pass/fail counts and any failures with root cause analysis.",
        hint: "chat",
        tooltip: "Run extension test suite"
      },
      {
        id: "ext-debug",
        icon: "debug-alt",
        label: "Debug Launch",
        command: "runCommand",
        file: "workbench.action.debug.start",
        hint: "command",
        tooltip: "Launch Extension Development Host"
      }
    ]
  }
];
var PYTHON_API_GROUPS = [
  {
    id: "api-dev",
    label: "API DEVELOPMENT",
    icon: "plug",
    desc: "Run, test, and document API endpoints",
    collapsed: true,
    buttons: [
      {
        id: "api-run",
        icon: "play",
        label: "Run Server",
        command: "openChat",
        prompt: "Start the API development server. Detect the framework (FastAPI/Flask/Django) and use the appropriate command.",
        hint: "chat",
        tooltip: "Start the development server"
      },
      {
        id: "api-test",
        icon: "beaker",
        label: "Test API",
        command: "openChat",
        prompt: "Run the API test suite with pytest. Report coverage, pass/fail counts, and any failures.",
        hint: "chat",
        tooltip: "Run API tests with coverage"
      },
      {
        id: "api-lint",
        icon: "warning",
        label: "Lint & Type",
        command: "openChat",
        prompt: "Run linting (ruff/flake8) and type checking (mypy/pyright) on the Python codebase. Fix any issues found.",
        hint: "chat",
        tooltip: "Run linter and type checker"
      },
      {
        id: "api-docs",
        icon: "book",
        label: "API Docs",
        command: "openChat",
        prompt: "Review and update the API documentation. Ensure OpenAPI/Swagger specs match the current endpoints.",
        hint: "chat",
        tooltip: "Update API documentation"
      }
    ]
  }
];
var DATA_PIPELINE_GROUPS = [
  {
    id: "pipeline-phases",
    label: "PIPELINE PHASES",
    icon: "server-process",
    desc: "Medallion architecture: ingest, transform, serve",
    collapsed: true,
    buttons: [
      {
        id: "bronze",
        icon: "database",
        label: "Bronze Layer",
        command: "openChat",
        prompt: "Help me work on the Bronze (raw ingestion) layer. Identify data sources, define schemas, implement extraction logic.",
        hint: "chat",
        tooltip: "Raw data ingestion patterns"
      },
      {
        id: "silver",
        icon: "filter",
        label: "Silver Layer",
        command: "openChat",
        prompt: "Help me work on the Silver (cleansed/conformed) layer. Apply data quality rules, standardize schemas, handle nulls and duplicates.",
        hint: "chat",
        tooltip: "Cleansing and conforming"
      },
      {
        id: "gold",
        icon: "star-full",
        label: "Gold Layer",
        command: "openChat",
        prompt: "Help me work on the Gold (business-ready) layer. Build aggregations, KPI calculations, and dimensional models.",
        hint: "chat",
        tooltip: "Business-ready aggregations"
      }
    ]
  },
  {
    id: "data-quality",
    label: "DATA QUALITY",
    icon: "verified",
    desc: "Profile, validate, and trace data lineage",
    collapsed: true,
    buttons: [
      {
        id: "profile",
        icon: "graph-line",
        label: "Profile Data",
        command: "openChat",
        prompt: "Profile the dataset: row counts, null rates, distributions, cardinality, outliers. Present findings in a summary table.",
        hint: "chat",
        tooltip: "Statistical data profiling"
      },
      {
        id: "validate",
        icon: "check",
        label: "Validate Schema",
        command: "openChat",
        prompt: "Validate data schemas against expectations. Check column types, constraints, referential integrity, and naming conventions.",
        hint: "chat",
        tooltip: "Schema validation checks"
      },
      {
        id: "lineage",
        icon: "git-merge",
        label: "Trace Lineage",
        command: "openChat",
        prompt: "Trace data lineage for the selected table or column. Map source-to-target transformations and document the flow.",
        hint: "chat",
        tooltip: "Data lineage documentation"
      }
    ]
  }
];
var STATIC_SITE_GROUPS = [
  {
    id: "site-dev",
    label: "SITE DEVELOPMENT",
    icon: "browser",
    desc: "Dev server, build, deploy, and performance audit",
    collapsed: true,
    buttons: [
      {
        id: "site-dev-server",
        icon: "play",
        label: "Dev Server",
        command: "openChat",
        prompt: "Start the development server for this static site. Detect the framework and use the appropriate dev command.",
        hint: "chat",
        tooltip: "Start local dev server"
      },
      {
        id: "site-build",
        icon: "package",
        label: "Build Site",
        command: "openChat",
        prompt: "Build the static site for production. Report any build warnings or errors.",
        hint: "chat",
        tooltip: "Production build"
      },
      {
        id: "site-deploy",
        icon: "cloud-upload",
        label: "Deploy",
        command: "openChat",
        prompt: "Deploy the site to the configured hosting platform. Run preflight checks first.",
        hint: "chat",
        tooltip: "Deploy to hosting"
      },
      {
        id: "site-perf",
        icon: "dashboard",
        label: "Performance",
        command: "openChat",
        prompt: "Audit site performance: bundle size, image optimization, lazy loading, caching headers, Core Web Vitals.",
        hint: "chat",
        tooltip: "Performance and accessibility audit"
      }
    ]
  }
];
var MONOREPO_GROUPS = [
  {
    id: "cross-package",
    label: "CROSS-PACKAGE",
    icon: "references",
    desc: "Shared types, dependency updates, and coordinated releases",
    collapsed: true,
    buttons: [
      {
        id: "deps-update",
        icon: "package",
        label: "Update Deps",
        command: "openChat",
        prompt: "Check for outdated dependencies across all packages. Propose coordinated updates that maintain compatibility.",
        hint: "chat",
        tooltip: "Cross-package dependency updates"
      },
      {
        id: "shared-types",
        icon: "symbol-interface",
        label: "Shared Types",
        command: "openChat",
        prompt: "Review shared type definitions across packages. Identify drift, inconsistencies, or missing exports.",
        hint: "chat",
        tooltip: "Audit shared type definitions"
      },
      {
        id: "release-all",
        icon: "rocket",
        label: "Release Train",
        command: "openChat",
        prompt: "Coordinate a release across all packages. Check version consistency, run all tests, update changelogs.",
        hint: "chat",
        tooltip: "Coordinated multi-package release"
      }
    ]
  }
];
var TYPE_GROUPS = {
  "vscode-extension": VSCODE_EXTENSION_GROUPS,
  "python-api": PYTHON_API_GROUPS,
  "data-pipeline": DATA_PIPELINE_GROUPS,
  "static-site": STATIC_SITE_GROUPS,
  "monorepo": MONOREPO_GROUPS,
  "generic": []
};
function readBaseGroups(configPath) {
  try {
    const raw = JSON.parse(fs8.readFileSync(configPath, "utf-8"));
    return Array.isArray(raw.groups) ? raw.groups : [];
  } catch {
    return [];
  }
}
function generateLoopConfig(workspaceRoot, context) {
  const ctx = context ?? detectProject(workspaceRoot);
  const configPath = path8.join(workspaceRoot, ".github", "config", "loop-menu.json");
  const baseGroups = readBaseGroups(configPath);
  const allTypeGroupIds = new Set(
    Object.values(TYPE_GROUPS).flatMap((groups) => groups.map((g) => g.id))
  );
  const coreGroups = baseGroups.filter((g) => !allTypeGroupIds.has(g.id));
  const typeGroups = TYPE_GROUPS[ctx.projectType] ?? [];
  const allGroups = [...coreGroups, ...typeGroups];
  const projectContext = {};
  if (ctx.buildCommand) projectContext.buildCommand = ctx.buildCommand;
  if (ctx.testCommand) projectContext.testCommand = ctx.testCommand;
  if (ctx.lintCommand) projectContext.lintCommand = ctx.lintCommand;
  if (ctx.releaseScript) projectContext.releaseScript = ctx.releaseScript;
  if (ctx.conventions.length > 0) projectContext.conventions = ctx.conventions;
  return {
    $schema: "./loop-config.schema.json",
    $comment: `Loop tab menu configuration \u2014 auto-generated for ${ctx.projectType} project. Prompts are loaded from .github/prompts/loop/{promptFile} at runtime.`,
    version: "1.0",
    projectType: ctx.projectType,
    projectPhase: "active-development",
    groups: allGroups,
    ...Object.keys(projectContext).length > 0 ? { projectContext } : {}
  };
}
function writeLoopConfig(workspaceRoot, context) {
  const config = generateLoopConfig(workspaceRoot, context);
  const configDir = path8.join(workspaceRoot, ".github", "config");
  const configPath = path8.join(configDir, "loop-menu.json");
  try {
    fs8.mkdirSync(configDir, { recursive: true });
    fs8.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
    return true;
  } catch {
    return false;
  }
}
function setProjectPhase(workspaceRoot, phase) {
  const configPath = path8.join(workspaceRoot, ".github", "config", "loop-menu.json");
  try {
    if (!fs8.existsSync(configPath)) return false;
    const config = JSON.parse(fs8.readFileSync(configPath, "utf-8"));
    config.projectPhase = phase;
    fs8.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
    return true;
  } catch {
    return false;
  }
}

// src/aiMemory.ts
var vscode5 = __toESM(require("vscode"));
var fs9 = __toESM(require("fs"));
var path9 = __toESM(require("path"));
var os2 = __toESM(require("os"));
function discoverAIMemoryPaths() {
  const found = [];
  const home = os2.homedir();
  try {
    for (const entry of fs9.readdirSync(home)) {
      if (/^OneDrive/i.test(entry)) {
        const candidate = path9.join(home, entry, "AI-Memory");
        if (fs9.existsSync(candidate)) found.push(candidate);
      }
    }
  } catch {
  }
  const cloudStorage = path9.join(home, "Library", "CloudStorage");
  try {
    if (fs9.existsSync(cloudStorage)) {
      for (const entry of fs9.readdirSync(cloudStorage)) {
        if (/^OneDrive/i.test(entry)) {
          const candidate = path9.join(cloudStorage, entry, "AI-Memory");
          if (fs9.existsSync(candidate)) found.push(candidate);
        }
      }
    }
  } catch {
  }
  for (const fallback of [
    path9.join(home, "AI-Memory"),
    path9.join(home, ".alex", "AI-Memory")
  ]) {
    if (fs9.existsSync(fallback)) found.push(fallback);
  }
  return found;
}
function suggestAIMemoryCandidates() {
  const candidates = [];
  const home = os2.homedir();
  try {
    for (const entry of fs9.readdirSync(home)) {
      if (/^OneDrive/i.test(entry)) {
        candidates.push(path9.join(home, entry, "AI-Memory"));
      }
    }
  } catch {
  }
  const cloudStorage = path9.join(home, "Library", "CloudStorage");
  try {
    if (fs9.existsSync(cloudStorage)) {
      for (const entry of fs9.readdirSync(cloudStorage)) {
        if (/^OneDrive/i.test(entry)) {
          candidates.push(path9.join(cloudStorage, entry, "AI-Memory"));
        }
      }
    }
  } catch {
  }
  candidates.push(path9.join(home, "AI-Memory"));
  candidates.push(path9.join(home, ".alex", "AI-Memory"));
  return candidates;
}
function resolveAIMemoryPath() {
  const configured = vscode5.workspace.getConfiguration("alex.aiMemory").get("path");
  if (configured && fs9.existsSync(configured)) {
    return configured;
  }
  const existing = discoverAIMemoryPaths();
  return existing.length > 0 ? existing[0] : null;
}
var SCAFFOLD_DIRS = [
  ".github",
  "announcements",
  "feedback",
  "insights",
  "knowledge",
  "patterns"
];
var SCAFFOLD_FILES = {
  "global-knowledge.md": `# Global Knowledge

Cross-project patterns, insights, and reusable solutions.

## Patterns

## Insights

## Anti-Patterns
`,
  "notes.md": `# Session Notes

Quick notes, reminders, and observations.

## Quick Notes

## Reminders

## Observations
`,
  "learning-goals.md": `# Learning Goals

Active learning objectives and progress tracking.

## Active Goals

## Completed
`,
  "user-profile.json": () => JSON.stringify(
    {
      name: "",
      role: "",
      preferences: {
        communication: "direct",
        codeStyle: "",
        learningStyle: ""
      },
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    null,
    2
  ),
  "project-registry.json": () => JSON.stringify(
    {
      version: 1,
      projects: [],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    null,
    2
  ),
  "index.json": () => JSON.stringify(
    {
      version: 1,
      files: [],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    null,
    2
  )
};
function ensureAIMemoryStructure(basePath) {
  const created = [];
  if (!fs9.existsSync(basePath)) {
    fs9.mkdirSync(basePath, { recursive: true });
    created.push(basePath);
  }
  for (const dir of SCAFFOLD_DIRS) {
    const dirPath = path9.join(basePath, dir);
    if (!fs9.existsSync(dirPath)) {
      fs9.mkdirSync(dirPath, { recursive: true });
      created.push(dirPath);
    }
  }
  for (const [file, contentOrFn] of Object.entries(SCAFFOLD_FILES)) {
    const filePath = path9.join(basePath, file);
    if (!fs9.existsSync(filePath)) {
      const content = typeof contentOrFn === "function" ? contentOrFn() : contentOrFn;
      fs9.writeFileSync(filePath, content, "utf-8");
      created.push(filePath);
    }
  }
  return created;
}
async function promptForAIMemoryLocation() {
  const configured = vscode5.workspace.getConfiguration("alex.aiMemory").get("path");
  if (configured && fs9.existsSync(configured)) {
    const use = await vscode5.window.showInformationMessage(
      `AI-Memory already configured at: ${configured}`,
      "Use This",
      "Change Location"
    );
    if (use === "Use This") return configured;
    if (!use) return void 0;
  }
  const existing = discoverAIMemoryPaths();
  const candidates = suggestAIMemoryCandidates();
  const items = [];
  for (const p of existing) {
    items.push({
      label: "$(check) " + p,
      description: "Found \u2014 existing AI-Memory",
      detail: p
    });
  }
  for (const p of candidates) {
    if (!existing.includes(p)) {
      const isOneDrive = /OneDrive/i.test(p);
      items.push({
        label: (isOneDrive ? "$(cloud) " : "$(folder) ") + p,
        description: isOneDrive ? "OneDrive \u2014 recommended (cloud-synced)" : "Local fallback",
        detail: p
      });
    }
  }
  items.push({
    label: "$(folder-opened) Browse...",
    description: "Choose a custom location",
    detail: "__browse__"
  });
  const pick = await vscode5.window.showQuickPick(items, {
    title: "AI-Memory Location",
    placeHolder: "Where should Alex store shared knowledge?",
    ignoreFocusOut: true
  });
  if (!pick) return void 0;
  let chosenPath;
  if (pick.detail === "__browse__") {
    const uris = await vscode5.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: "Select AI-Memory Folder",
      title: "Choose AI-Memory Location"
    });
    if (!uris || uris.length === 0) return void 0;
    chosenPath = uris[0].fsPath;
    if (!path9.basename(chosenPath).toLowerCase().includes("ai-memory")) {
      chosenPath = path9.join(chosenPath, "AI-Memory");
    }
  } else {
    chosenPath = pick.detail;
  }
  return chosenPath;
}
async function setupAIMemory() {
  const chosenPath = await promptForAIMemoryLocation();
  if (!chosenPath) return void 0;
  try {
    const created = ensureAIMemoryStructure(chosenPath);
    await vscode5.workspace.getConfiguration("alex.aiMemory").update("path", chosenPath, vscode5.ConfigurationTarget.Global);
    if (created.length > 0) {
      vscode5.window.showInformationMessage(
        `AI-Memory initialized at ${chosenPath} (${created.length} items created).`
      );
    } else {
      vscode5.window.showInformationMessage(
        `AI-Memory linked to ${chosenPath} (already complete).`
      );
    }
    return chosenPath;
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const msg = raw.replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi, "[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g, "[path]");
    vscode5.window.showErrorMessage(`AI-Memory setup failed: ${msg}`);
    return void 0;
  }
}

// src/sidebar/agentActivityTreeView.ts
var vscode6 = __toESM(require("vscode"));
var path10 = __toESM(require("path"));
var fs10 = __toESM(require("fs"));
var AgentActivityItem = class extends vscode6.TreeItem {
  constructor(label, description, collapsibleState, metricId, children) {
    super(label, collapsibleState);
    this.metricId = metricId;
    this.children = children;
    this.description = description;
    this.tooltip = `${label}: ${description}`;
  }
};
function formatMetricValue(value, unit) {
  switch (unit) {
    case "percent":
      return `${value}%`;
    case "seconds":
      return `${value}s`;
    case "count":
      return `${value}`;
    default:
      return `${value} ${unit}`;
  }
}
var AgentActivityProvider = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
  }
  _onDidChangeTreeData = new vscode6.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  refresh() {
    this._onDidChangeTreeData.fire(void 0);
  }
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (!this.workspaceRoot) {
      return [new AgentActivityItem("No workspace", "Open a folder", vscode6.TreeItemCollapsibleState.None)];
    }
    if (element?.children) {
      return element.children;
    }
    if (!element) {
      return this.getRootItems();
    }
    return [];
  }
  getRootItems() {
    const items = [];
    const configPath = path10.join(this.workspaceRoot, ".github", "config", "agent-metrics.json");
    if (!fs10.existsSync(configPath)) {
      return [new AgentActivityItem("Not configured", "No agent-metrics.json found", vscode6.TreeItemCollapsibleState.None)];
    }
    let config;
    try {
      config = JSON.parse(fs10.readFileSync(configPath, "utf-8"));
    } catch {
      return [new AgentActivityItem("Config error", "Invalid agent-metrics.json", vscode6.TreeItemCollapsibleState.None)];
    }
    const statePath2 = path10.join(this.workspaceRoot, ".agent-metrics-state.json");
    let state = {};
    if (fs10.existsSync(statePath2)) {
      try {
        state = JSON.parse(fs10.readFileSync(statePath2, "utf-8"));
      } catch {
      }
    }
    const thresholds = config.thresholds ?? {};
    for (const metric of config.metrics) {
      const current = state[metric.id];
      const value = current ? formatMetricValue(current.value, metric.unit) : "\u2014";
      const threshold = thresholds[metric.id];
      const iconName = this.getStatusIcon(metric, current?.value, threshold);
      const item = new AgentActivityItem(
        metric.name,
        value,
        vscode6.TreeItemCollapsibleState.None,
        metric.id
      );
      item.iconPath = new vscode6.ThemeIcon(iconName);
      const thresholdInfo = threshold ? `

Warning: ${formatMetricValue(threshold.warning, metric.unit)} \xB7 Critical: ${formatMetricValue(threshold.critical, metric.unit)}` : "";
      item.tooltip = new vscode6.MarkdownString(
        `**${metric.name}**

${metric.description}

Current: ${value}${thresholdInfo}`
      );
      items.push(item);
    }
    return items;
  }
  getStatusIcon(metric, value, threshold) {
    if (value === void 0 || !threshold) return "circle-outline";
    const isHigherBetter = metric.higherIsBetter === true || metric.id.includes("rate") || metric.id === "tasks-run-count";
    if (isHigherBetter) {
      if (value < threshold.critical) return "error";
      if (value < threshold.warning) return "warning";
      return "check";
    } else {
      if (value > threshold.critical) return "error";
      if (value > threshold.warning) return "warning";
      return "check";
    }
  }
};

// src/bootstrap.ts
var vscode7 = __toESM(require("vscode"));
var fs11 = __toESM(require("fs"));
var path11 = __toESM(require("path"));
var BRAIN_SUBDIRS = [
  "instructions",
  "skills",
  "prompts",
  "agents",
  "muscles",
  "config",
  "hooks"
];
var BRAIN_ROOT_FILES = [
  "copilot-instructions.md",
  "ABOUT.md",
  "NORTH-STAR.md",
  "EXTERNAL-API-REGISTRY.md"
];
var BRAIN_DIR = "brain-files";
var TARGET_DIR = ".github";
var VERSION_FILE = ".github/.alex-brain-version";
var MASTER_PROTECTED_FILE = ".github/config/MASTER-ALEX-PROTECTED.json";
function getBundledVersion(context) {
  return context.extension.packageJSON.version;
}
function getInstalledVersion(workspaceRoot) {
  const versionPath = path11.join(workspaceRoot, VERSION_FILE);
  try {
    return fs11.readFileSync(versionPath, "utf-8").trim();
  } catch {
    return void 0;
  }
}
function copyDirSync(src, dest, destRoot) {
  const root = destRoot ?? dest;
  fs11.mkdirSync(dest, { recursive: true });
  for (const entry of fs11.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path11.join(src, entry.name);
    const destPath = path11.resolve(dest, entry.name);
    if (!destPath.startsWith(root + path11.sep) && destPath !== root) {
      throw new Error(`Path traversal blocked: ${entry.name}`);
    }
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, root);
    } else {
      fs11.copyFileSync(srcPath, destPath);
    }
  }
}
function isProtectedWorkspace(workspaceRoot) {
  return fs11.existsSync(path11.join(workspaceRoot, MASTER_PROTECTED_FILE));
}
async function bootstrapBrainFiles(context, force = false) {
  const workspaceFolders = vscode7.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode7.window.showWarningMessage("Alex: Open a workspace folder first.");
    return false;
  }
  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  if (isProtectedWorkspace(workspaceRoot)) {
    vscode7.window.showWarningMessage(
      "Alex: Protected mode \u2014 brain updates blocked in this workspace."
    );
    return false;
  }
  const bundledVersion = getBundledVersion(context);
  const installedVersion = getInstalledVersion(workspaceRoot);
  const targetPath = path11.join(workspaceRoot, TARGET_DIR);
  const needsInstall = force || !fs11.existsSync(targetPath) || installedVersion !== bundledVersion;
  if (!needsInstall) {
    vscode7.window.showInformationMessage(
      `Alex: Brain is up to date (v${bundledVersion}).`
    );
    return false;
  }
  const sourcePath = path11.join(context.extensionUri.fsPath, BRAIN_DIR);
  if (!fs11.existsSync(sourcePath)) {
    vscode7.window.showWarningMessage(
      "Alex: Brain files not found in extension bundle."
    );
    return false;
  }
  try {
    const githubDir = path11.join(workspaceRoot, TARGET_DIR);
    fs11.mkdirSync(githubDir, { recursive: true });
    if (installedVersion) {
      const now = /* @__PURE__ */ new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
      const backupDir = path11.join(workspaceRoot, `.github-backup-${ts}`);
      fs11.mkdirSync(backupDir, { recursive: true });
      for (const subdir of BRAIN_SUBDIRS) {
        const existing = path11.join(githubDir, subdir);
        if (fs11.existsSync(existing)) {
          copyDirSync(existing, path11.join(backupDir, subdir));
        }
      }
      for (const file of BRAIN_ROOT_FILES) {
        const existing = path11.join(githubDir, file);
        if (fs11.existsSync(existing)) {
          fs11.copyFileSync(existing, path11.join(backupDir, file));
        }
      }
    }
    for (const subdir of BRAIN_SUBDIRS) {
      const srcSub = path11.join(sourcePath, subdir);
      if (!fs11.existsSync(srcSub)) continue;
      const destSub = path11.join(githubDir, subdir);
      const stagingSub = destSub + `.staging-${Date.now()}`;
      copyDirSync(srcSub, stagingSub);
      if (fs11.existsSync(destSub)) {
        fs11.rmSync(destSub, { recursive: true, force: true });
      }
      fs11.renameSync(stagingSub, destSub);
    }
    for (const file of BRAIN_ROOT_FILES) {
      const srcFile = path11.join(sourcePath, file);
      if (!fs11.existsSync(srcFile)) continue;
      fs11.copyFileSync(srcFile, path11.join(githubDir, file));
    }
    const versionPath = path11.join(workspaceRoot, VERSION_FILE);
    fs11.writeFileSync(versionPath, bundledVersion, "utf-8");
    writeLoopConfig(workspaceRoot);
    const action = installedVersion ? "updated" : "installed";
    const settingsChoice = await vscode7.window.showInformationMessage(
      `Alex: Brain ${action} to v${bundledVersion}. Configure recommended settings?`,
      "Optimize Settings",
      "Skip"
    );
    if (settingsChoice === "Optimize Settings") {
      vscode7.commands.executeCommand("alex.optimizeSettings");
    }
    if (!resolveAIMemoryPath()) {
      const memChoice = await vscode7.window.showInformationMessage(
        "Alex: Set up AI-Memory for cross-project knowledge sharing?",
        "Setup AI-Memory",
        "Skip"
      );
      if (memChoice === "Setup AI-Memory") {
        await setupAIMemory();
      }
    }
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode7.window.showErrorMessage(`Alex: Brain install failed \u2014 ${msg}`);
    return false;
  }
}
function getBrainStatus(context) {
  const bundledVersion = getBundledVersion(context);
  const workspaceFolders = vscode7.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return { installed: false, bundledVersion, needsUpgrade: false };
  }
  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const installedVersion = getInstalledVersion(workspaceRoot);
  const targetPath = path11.join(workspaceRoot, TARGET_DIR);
  const installed = fs11.existsSync(targetPath);
  return {
    installed,
    version: installedVersion,
    bundledVersion,
    needsUpgrade: installed && installedVersion !== bundledVersion
  };
}
async function checkAutoUpgrade(context) {
  const status = getBrainStatus(context);
  if (!status.needsUpgrade) return;
  const workspaceRoot = vscode7.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceRoot && isProtectedWorkspace(workspaceRoot)) return;
  const choice = await vscode7.window.showInformationMessage(
    `Alex: Brain v${status.version} \u2192 v${status.bundledVersion} available.`,
    "Upgrade Now",
    "Later"
  );
  if (choice === "Upgrade Now") {
    await bootstrapBrainFiles(context, true);
  }
}

// src/muscleRunner.ts
var vscode8 = __toESM(require("vscode"));
var path12 = __toESM(require("path"));
var fs12 = __toESM(require("fs"));
var import_child_process4 = require("child_process");
function runMuscle(workspaceRoot, muscle, args = []) {
  const musclePath = path12.join(workspaceRoot, ".github", "muscles", muscle);
  if (!fs12.existsSync(musclePath)) {
    return Promise.resolve({
      code: 1,
      stdout: "",
      stderr: `Muscle not found: ${muscle}`
    });
  }
  return new Promise((resolve5) => {
    (0, import_child_process4.execFile)("node", [musclePath, ...args], {
      cwd: workspaceRoot,
      maxBuffer: 10 * 1024 * 1024,
      timeout: 12e4
    }, (err, stdout, stderr) => {
      let exitCode = 0;
      if (err) {
        if (typeof err.code === "number") {
          exitCode = err.code;
        } else if (err.signal) {
          exitCode = 137;
        } else {
          exitCode = 1;
        }
        if (typeof err.code === "string") {
          stderr = `${err.code}: ${err.message}
${stderr ?? ""}`;
        }
      }
      resolve5({
        code: exitCode,
        stdout: stdout ?? "",
        stderr: stderr ?? ""
      });
    });
  });
}
async function muscleAndPrompt(workspaceRoot, muscle, muscleArgs, channelName, chatPrompt) {
  const channel = vscode8.window.createOutputChannel(channelName);
  channel.show(true);
  channel.appendLine(`Running ${muscle}...`);
  channel.appendLine("");
  const result = await runMuscle(workspaceRoot, muscle, muscleArgs);
  if (result.stdout) {
    channel.appendLine(result.stdout);
  }
  if (result.stderr) {
    channel.appendLine(result.stderr);
  }
  if (result.code !== 0) {
    channel.appendLine(`
[Exit code: ${result.code}]`);
  }
  channel.appendLine(`
[Done]`);
  if (chatPrompt) {
    const action = await vscode8.window.showInformationMessage(
      `Alex: ${channelName} complete. Open chat for follow-up?`,
      "Open Chat",
      "Done"
    );
    if (action === "Open Chat") {
      await vscode8.commands.executeCommand("workbench.action.chat.open", {
        query: chatPrompt
      });
    }
  }
}

// src/extension.ts
function sanitizeError(err) {
  const raw = err instanceof Error ? err.message : String(err);
  return raw.replace(/[A-Z]:\\[\w\\.\-\s]+/gi, "[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g, "[path]");
}
async function enforceSafetySettings() {
  const config = vscode9.workspace.getConfiguration();
  const key = "github.copilot.chat.copilotMemory.enabled";
  if (config.get(key) !== false) {
    await config.update(key, false, vscode9.ConfigurationTarget.Global);
  }
}
function activate(context) {
  enforceSafetySettings();
  initRunStore(context.workspaceState);
  const participant = vscode9.chat.createChatParticipant(
    "alex.chat",
    chatHandler
  );
  participant.iconPath = vscode9.Uri.joinPath(
    context.extensionUri,
    "assets",
    "icon.png"
  );
  participant.followupProvider = {
    provideFollowups(_result, _context) {
      return [
        { prompt: "Run brain health check", label: "Brain Health Check" }
      ];
    }
  };
  context.subscriptions.push(participant);
  const welcomeProvider = new WelcomeViewProvider(
    context.extensionUri,
    context.globalState
  );
  context.subscriptions.push(welcomeProvider);
  context.subscriptions.push(
    vscode9.window.registerWebviewViewProvider(
      WelcomeViewProvider.viewId,
      welcomeProvider
    )
  );
  const workspaceRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
  createAgentStatusBar(context);
  updateAgentStatusBar(workspaceRoot);
  const statusTimer = setInterval(() => {
    updateAgentStatusBar(vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath);
  }, 5 * 60 * 1e3);
  context.subscriptions.push({ dispose: () => clearInterval(statusTimer) });
  const agentActivityProvider = new AgentActivityProvider(workspaceRoot);
  context.subscriptions.push(
    vscode9.window.createTreeView("alex.agentActivity", {
      treeDataProvider: agentActivityProvider
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.refreshAgentActivity", () => {
      agentActivityProvider.refresh();
    })
  );
  if (workspaceRoot) {
    const metricsPattern = new vscode9.RelativePattern(workspaceRoot, ".agent-metrics-state.json");
    const metricsWatcher = vscode9.workspace.createFileSystemWatcher(metricsPattern);
    metricsWatcher.onDidChange(() => agentActivityProvider.refresh());
    metricsWatcher.onDidCreate(() => agentActivityProvider.refresh());
    context.subscriptions.push(metricsWatcher);
  }
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.refreshWelcome", () => {
      welcomeProvider.refresh();
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.openChat", () => {
      vscode9.commands.executeCommand("workbench.action.chat.open");
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.dream", async () => {
      const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode9.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      try {
        await muscleAndPrompt(
          wsRoot,
          "brain-qa.cjs",
          [],
          "Alex: Brain QA",
          "Review the brain health grid at .github/quality/brain-health-grid.md and fix the top priority issues"
        );
      } catch (err) {
        vscode9.window.showErrorMessage(
          `Dream protocol failed: ${sanitizeError(err)}`
        );
      }
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.initialize", async () => {
      try {
        await enforceSafetySettings();
        const choice = await vscode9.window.showInformationMessage(
          "Install the Alex brain in this workspace?",
          "Install",
          "Cancel"
        );
        if (choice === "Install") {
          const installed = await bootstrapBrainFiles(context, true);
          if (installed) {
            await enforceSafetySettings();
            welcomeProvider.refresh();
          }
        }
      } catch (err) {
        vscode9.window.showErrorMessage(
          `Initialize failed: ${sanitizeError(err)}`
        );
      }
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.upgrade", async () => {
      try {
        await enforceSafetySettings();
        const status = getBrainStatus(context);
        if (!status.needsUpgrade && status.installed) {
          vscode9.window.showInformationMessage(
            `Alex: Brain is already up to date (v${status.bundledVersion}).`
          );
          return;
        }
        const from = status.version ?? "not installed";
        const choice = await vscode9.window.showInformationMessage(
          `Upgrade Alex brain from v${from} to v${status.bundledVersion}? A backup will be created.`,
          "Upgrade",
          "Cancel"
        );
        if (choice !== "Upgrade") return;
        const installed = await bootstrapBrainFiles(context, true);
        if (installed) {
          await enforceSafetySettings();
          welcomeProvider.refresh();
        }
      } catch (err) {
        vscode9.window.showErrorMessage(
          `Upgrade failed: ${sanitizeError(err)}`
        );
      }
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.setupAIMemory", async () => {
      try {
        await setupAIMemory();
        welcomeProvider.refresh();
      } catch (err) {
        vscode9.window.showErrorMessage(
          `AI-Memory setup failed: ${sanitizeError(err)}`
        );
      }
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.generateLoopConfig", async () => {
      const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode9.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      try {
        const ctx = detectProject(wsRoot);
        const ok = writeLoopConfig(wsRoot, ctx);
        if (ok) {
          vscode9.window.showInformationMessage(
            `Alex: Loop config generated for ${ctx.projectType} project (${ctx.conventions.length} conventions detected).`
          );
        } else {
          vscode9.window.showErrorMessage("Alex: Failed to write loop config.");
        }
      } catch (err) {
        vscode9.window.showErrorMessage(
          `Alex: Loop config generation failed \u2014 ${sanitizeError(err)}`
        );
      }
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.setProjectPhase", async () => {
      const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode9.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      const phases = [
        { label: "Planning", description: "Ideation, research, and design", value: "planning" },
        { label: "Active Development", description: "Building features and writing code", value: "active-development" },
        { label: "Testing", description: "QA, integration tests, and validation", value: "testing" },
        { label: "Release", description: "Packaging, publishing, and deployment", value: "release" },
        { label: "Maintenance", description: "Bug fixes, upgrades, and monitoring", value: "maintenance" }
      ];
      const picked = await vscode9.window.showQuickPick(
        phases.map((p) => ({ label: p.label, description: p.description, value: p.value })),
        { placeHolder: "Select the current project phase" }
      );
      if (!picked) return;
      const ok = setProjectPhase(wsRoot, picked.value);
      if (ok) {
        welcomeProvider.refresh();
        vscode9.window.showInformationMessage(
          `Alex: Project phase set to "${picked.label}".`
        );
      } else {
        vscode9.window.showErrorMessage(
          "Alex: Failed to update project phase. Generate a loop config first."
        );
      }
    })
  );
  const converterMuscles = {
    "alex.convertMdToHtml": { muscle: "md-to-html.cjs", label: "HTML", srcExt: ".md" },
    "alex.convertMdToWord": { muscle: "md-to-word.cjs", label: "Word", srcExt: ".md" },
    "alex.convertMdToEml": { muscle: "md-to-eml.cjs", label: "Email", srcExt: ".md" },
    "alex.convertMdToPdf": { muscle: "md-to-pdf.cjs", label: "PDF", srcExt: ".md" },
    "alex.convertMdToPptx": { muscle: "md-to-pptx.cjs", label: "PowerPoint", srcExt: ".md" },
    "alex.convertMdToEpub": { muscle: "md-to-epub.cjs", label: "EPUB", srcExt: ".md" },
    "alex.convertMdToLatex": { muscle: "md-to-latex.cjs", label: "LaTeX", srcExt: ".md" },
    "alex.convertMdToTxt": { muscle: "md-to-txt.cjs", label: "Plain Text", srcExt: ".md" },
    "alex.convertDocxToMd": { muscle: "docx-to-md.cjs", label: "Markdown", srcExt: ".docx" },
    "alex.convertHtmlToMd": { muscle: "html-to-md.cjs", label: "Markdown", srcExt: ".html" },
    "alex.convertPptxToMd": { muscle: "pptx-to-md.cjs", label: "Markdown", srcExt: ".pptx" }
  };
  for (const [cmdId, cfg] of Object.entries(converterMuscles)) {
    context.subscriptions.push(
      vscode9.commands.registerCommand(cmdId, async (uri) => {
        const fileUri = uri ?? vscode9.window.activeTextEditor?.document.uri;
        if (!fileUri || fileUri.scheme !== "file") {
          vscode9.window.showWarningMessage("Alex: Select a file to convert.");
          return;
        }
        if (!fileUri.fsPath.endsWith(cfg.srcExt)) {
          vscode9.window.showWarningMessage(
            `Alex: This converter requires a ${cfg.srcExt} file.`
          );
          return;
        }
        const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!wsRoot) {
          vscode9.window.showWarningMessage("Alex: Open a workspace folder first.");
          return;
        }
        const musclePath = path13.join(wsRoot, ".github", "muscles", cfg.muscle);
        const filePath = fileUri.fsPath;
        const terminal = vscode9.window.createTerminal(`Alex: Convert \u2192 ${cfg.label}`);
        terminal.show();
        terminal.sendText(`node "${musclePath}" "${filePath}"`);
      })
    );
  }
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.brainQA", async () => {
      const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode9.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      await muscleAndPrompt(wsRoot, "brain-qa.cjs", [], "Alex: Brain QA");
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.validateSkills", async () => {
      const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode9.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      await muscleAndPrompt(
        wsRoot,
        "validate-skills.cjs",
        [],
        "Alex: Validate Skills",
        "Review the skill validation results and fix any issues found"
      );
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.markdownLint", async () => {
      const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
      const fileUri = vscode9.window.activeTextEditor?.document.uri;
      if (!wsRoot || !fileUri || fileUri.scheme !== "file") {
        vscode9.window.showWarningMessage("Alex: Open a markdown file first.");
        return;
      }
      await muscleAndPrompt(
        wsRoot,
        "markdown-lint.cjs",
        [fileUri.fsPath],
        "Alex: Markdown Lint",
        "Fix the markdown lint issues found in the current file"
      );
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.tokenCostReport", async () => {
      const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode9.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      await muscleAndPrompt(
        wsRoot,
        "token-cost-report.cjs",
        [],
        "Alex: Token Cost Report"
      );
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.newSkill", async () => {
      const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode9.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      const name = await vscode9.window.showInputBox({
        prompt: "Skill name (kebab-case, e.g., my-new-skill)",
        placeHolder: "my-new-skill",
        validateInput: (v) => /^[a-z][a-z0-9-]*$/.test(v) ? null : "Use kebab-case (lowercase, hyphens)"
      });
      if (!name) return;
      const desc = await vscode9.window.showInputBox({
        prompt: "Skill description",
        placeHolder: "What does this skill do?"
      });
      const args = [name];
      if (desc) args.push("--description", desc);
      await muscleAndPrompt(
        wsRoot,
        "new-skill.cjs",
        args,
        "Alex: New Skill",
        `Customize the new skill ${name} \u2014 fill in the SKILL.md with real content and create the matching instruction file`
      );
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.createCustomAgent", async () => {
      const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode9.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      const name = await vscode9.window.showInputBox({
        prompt: "Agent name (e.g., Code Reviewer, Data Analyst)",
        placeHolder: "My Custom Agent",
        validateInput: (v) => v.trim().length > 0 ? null : "Agent name cannot be empty"
      });
      if (!name) return;
      const desc = await vscode9.window.showInputBox({
        prompt: "Agent description (one sentence)",
        placeHolder: "What does this agent specialize in?"
      });
      if (desc === void 0) return;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const filename = `${slug}.agent.md`;
      const agentsDir = path13.join(wsRoot, ".github", "agents");
      const filePath = path13.join(agentsDir, filename);
      if (fs13.existsSync(filePath)) {
        vscode9.window.showWarningMessage(`Agent file already exists: .github/agents/${filename}`);
        await vscode9.commands.executeCommand("vscode.open", vscode9.Uri.file(filePath));
        return;
      }
      const template = [
        "---",
        `description: "${desc.replace(/"/g, "'") || name + " - custom agent"}"`,
        `name: "${name}"`,
        'model: ["Claude Sonnet 4", "GPT-4o"]',
        "tools:",
        '  ["search", "codebase", "problems", "usages", "runSubagent", "fetch", "agent"]',
        "user-invocable: true",
        "---",
        "",
        `# ${name}`,
        "",
        `You are **Alex** in **${name}** mode.`,
        "",
        "## Purpose",
        "",
        desc || "Describe this agent's purpose and expertise.",
        "",
        "## Instructions",
        "",
        "1. Follow the project's existing conventions",
        "2. Verify your work before declaring done",
        "3. Ask for clarification when requirements are ambiguous",
        "",
        "## Relevant Skills",
        "",
        "<!-- List skills this agent should load, e.g.:",
        "- `.github/skills/api-design/SKILL.md`",
        "-->",
        ""
      ].join("\n");
      fs13.mkdirSync(agentsDir, { recursive: true });
      fs13.writeFileSync(filePath, template, "utf-8");
      await vscode9.commands.executeCommand("vscode.open", vscode9.Uri.file(filePath));
      vscode9.window.showInformationMessage(
        `Alex: Custom agent "${name}" created at .github/agents/${filename}`
      );
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.setContext", async () => {
      const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode9.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      const packages = [];
      const pkgPath = path13.join(wsRoot, "package.json");
      if (fs13.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs13.readFileSync(pkgPath, "utf-8"));
          const workspaces = Array.isArray(pkg.workspaces) ? pkg.workspaces : pkg.workspaces?.packages ?? [];
          for (const pattern of workspaces) {
            const base = pattern.replace(/\/\*$/, "");
            const baseDir = path13.join(wsRoot, base);
            if (fs13.existsSync(baseDir)) {
              for (const entry of fs13.readdirSync(baseDir, { withFileTypes: true })) {
                if (!entry.isDirectory()) continue;
                const childPkg = path13.join(baseDir, entry.name, "package.json");
                if (fs13.existsSync(childPkg)) {
                  try {
                    const child = JSON.parse(fs13.readFileSync(childPkg, "utf-8"));
                    packages.push({
                      label: child.name ?? entry.name,
                      description: path13.relative(wsRoot, path13.join(baseDir, entry.name)),
                      dir: path13.join(baseDir, entry.name)
                    });
                  } catch {
                  }
                }
              }
            }
          }
        } catch {
        }
      }
      const pnpmWs = path13.join(wsRoot, "pnpm-workspace.yaml");
      if (packages.length === 0 && fs13.existsSync(pnpmWs)) {
        try {
          const content = fs13.readFileSync(pnpmWs, "utf-8");
          const matches = content.match(/- ['"](.*?)['"]/g) ?? [];
          for (const m of matches) {
            const pattern = m.replace(/- ['"](.*)['"]/, "$1").replace(/\/\*$/, "");
            const baseDir = path13.join(wsRoot, pattern);
            if (fs13.existsSync(baseDir)) {
              for (const entry of fs13.readdirSync(baseDir, { withFileTypes: true })) {
                if (!entry.isDirectory()) continue;
                packages.push({
                  label: entry.name,
                  description: path13.relative(wsRoot, path13.join(baseDir, entry.name)),
                  dir: path13.join(baseDir, entry.name)
                });
              }
            }
          }
        } catch {
        }
      }
      if (packages.length === 0) {
        for (const subdir of ["platforms", "packages", "apps", "libs"]) {
          const dir = path13.join(wsRoot, subdir);
          if (fs13.existsSync(dir)) {
            for (const entry of fs13.readdirSync(dir, { withFileTypes: true })) {
              if (!entry.isDirectory()) continue;
              packages.push({
                label: entry.name,
                description: `${subdir}/${entry.name}`,
                dir: path13.join(dir, entry.name)
              });
            }
          }
        }
      }
      packages.unshift({
        label: "(root)",
        description: "Workspace root",
        dir: wsRoot
      });
      const picked = await vscode9.window.showQuickPick(packages, {
        placeHolder: "Select the active package context",
        title: "Set Active Package"
      });
      if (!picked) return;
      const configPath = path13.join(wsRoot, ".github", "config", "loop-menu.json");
      try {
        let config = {};
        if (fs13.existsSync(configPath)) {
          config = JSON.parse(fs13.readFileSync(configPath, "utf-8"));
        }
        config.activePackage = picked.label === "(root)" ? null : picked.description;
        config.activePackageName = picked.label === "(root)" ? null : picked.label;
        fs13.mkdirSync(path13.dirname(configPath), { recursive: true });
        fs13.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
        welcomeProvider.refresh();
        vscode9.window.showInformationMessage(
          picked.label === "(root)" ? "Alex: Active context set to workspace root." : `Alex: Active context set to "${picked.label}" (${picked.description}).`
        );
      } catch (err) {
        vscode9.window.showErrorMessage(
          `Alex: Failed to update context \u2014 ${sanitizeError(err)}`
        );
      }
    })
  );
  context.subscriptions.push(
    vscode9.commands.registerCommand("alex.insightPipeline", async () => {
      const wsRoot = vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode9.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      await muscleAndPrompt(
        wsRoot,
        "insight-pipeline.cjs",
        [],
        "Alex: Insight Pipeline",
        "Review the extracted insights and promote the most valuable ones to global knowledge"
      );
    })
  );
  const loopConfigWatcher = vscode9.workspace.createFileSystemWatcher(
    new vscode9.RelativePattern(
      vscode9.workspace.workspaceFolders?.[0] ?? "",
      ".github/config/loop-menu.json"
    )
  );
  const loopPromptWatcher = vscode9.workspace.createFileSystemWatcher(
    new vscode9.RelativePattern(
      vscode9.workspace.workspaceFolders?.[0] ?? "",
      ".github/prompts/loop/*.prompt.md"
    )
  );
  const skillPartialWatcher = vscode9.workspace.createFileSystemWatcher(
    new vscode9.RelativePattern(
      vscode9.workspace.workspaceFolders?.[0] ?? "",
      ".github/skills/*/loop-config.partial.json"
    )
  );
  const refreshOnChange = () => welcomeProvider.refresh();
  context.subscriptions.push(
    loopConfigWatcher,
    loopConfigWatcher.onDidChange(refreshOnChange),
    loopConfigWatcher.onDidCreate(refreshOnChange),
    loopConfigWatcher.onDidDelete(refreshOnChange),
    loopPromptWatcher,
    loopPromptWatcher.onDidChange(refreshOnChange),
    loopPromptWatcher.onDidCreate(refreshOnChange),
    loopPromptWatcher.onDidDelete(refreshOnChange),
    skillPartialWatcher,
    skillPartialWatcher.onDidChange(refreshOnChange),
    skillPartialWatcher.onDidCreate(refreshOnChange),
    skillPartialWatcher.onDidDelete(refreshOnChange)
  );
  checkAutoUpgrade(context).then(() => {
    welcomeProvider.refresh();
  });
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
