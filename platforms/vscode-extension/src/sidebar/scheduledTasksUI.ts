/**
 * HTML rendering and VS Code wizard UI for scheduled tasks.
 */

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { escHtml, escAttr } from "./htmlUtils.js";
import type { ScheduledTask } from "./scheduledTasksTypes.js";
import { getTaskState, getRunInfo, checkDependencies, addTask } from "./taskStore.js";
import { generateWorkflow, hasWorkflow, workflowPath } from "./workflowGenerator.js";
import { hasCopilotPAT, setupCopilotPAT } from "./taskDispatcher.js";

// ── Formatting Helpers ────────────────────────────────────────────

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

// ── Rendering ─────────────────────────────────────────────────────

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
        statusPill = `<span class="schedule-pill schedule-pill-success"><span class="codicon codicon-check"></span> Dispatched</span>`;
      } else if (runInfo && (runInfo.status === "failure" || runInfo.status === "cancelled" || runInfo.status === "error")) {
        statusPill = `<span class="schedule-pill schedule-pill-fail"><span class="codicon codicon-error"></span> Failed</span>`;
      } else {
        statusPill = t.enabled
          ? `<span class="schedule-pill schedule-pill-on">Active</span>`
          : `<span class="schedule-pill schedule-pill-off">Paused</span>`;
      }

      // Per-task action buttons
      const isRunning = runInfo && (runInfo.status === "queued" || runInfo.status === "in_progress");
      const canRun = (t.mode === "agent" && t.promptFile) || (t.mode === "direct" && t.muscle);
      const runNowBtn = canRun
        ? (isRunning
            ? `<button class="schedule-action-btn schedule-action-running" disabled title="Running…"><span class="codicon codicon-loading codicon-modifier-spin"></span></button>`
            : `<button class="schedule-action-btn schedule-action-run" data-command="runTask" data-file="${escAttr(t.id)}" title="${wfExists ? "Run on GitHub Actions" : "Run now"}"><span class="codicon codicon-rocket"></span></button>`)
        : "";
      const viewRunBtn = runInfo?.runUrl
        ? `<button class="schedule-action-btn" data-command="openExternal" data-file="${escAttr(runInfo.runUrl)}" title="View run on GitHub"><span class="codicon codicon-link-external"></span></button>`
        : "";
      const editPromptBtn = t.mode === "agent" && t.promptFile
        ? `<button class="schedule-action-btn" data-command="openPromptFile" data-file="${escAttr(t.promptFile)}" title="Edit prompt"><span class="codicon codicon-edit"></span></button>`
        : "";
      const toggleBtn = `<button class="schedule-action-btn ${t.enabled ? "schedule-action-pause" : "schedule-action-resume"}" data-command="toggleTask" data-file="${escAttr(t.id)}" title="${t.enabled ? "Pause" : "Resume"}">${t.enabled ? `<span class="codicon codicon-debug-pause"></span>` : `<span class="codicon codicon-play-circle"></span>`}</button>`;
      const deleteBtn = `<button class="schedule-action-btn schedule-action-danger" data-command="deleteTask" data-file="${escAttr(t.id)}" title="Delete"><span class="codicon codicon-trash"></span></button>`;

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
    <div class="schedule-section-header">
      <span class="codicon codicon-clock"></span>
      <strong>Scheduled Tasks</strong>
      <span class="agent-badge">${tasks.filter(t => t.enabled).length}/${tasks.length}</span>
    </div>
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

  // PAT setup banner — show if any agent tasks exist but PAT is not configured
  const hasAgentTasks = tasks.some((t) => t.mode === "agent");
  if (hasAgentTasks && workspaceRoot && !hasCopilotPAT(workspaceRoot)) {
    html += `
    <div class="schedule-setup-banner">
      <span class="codicon codicon-warning"></span>
      <span>Set up <strong>COPILOT_PAT</strong> to auto-assign Copilot to issues.</span>
      <button class="action-btn" data-command="setupCopilotPAT" style="margin-left:auto">
        <span class="codicon codicon-key"></span>
        <span class="btn-label">Set Up</span>
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
    enabled: true,
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
      // Open the prompt template for editing
      void vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.file(tplPath),
      );
    }

    // Generate workflow file
    generateWorkflow(workspaceRoot, task);

    // For agent mode, ensure COPILOT_PAT secret exists (one-click setup)
    if (modePick.mode === "agent" && !hasCopilotPAT(workspaceRoot)) {
      void setupCopilotPAT(workspaceRoot);
    }

    // Guide user on next steps
    const nextSteps = modePick.mode === "agent"
      ? `Task "${name}" created with workflow. Edit the prompt template, then commit & push to activate on GitHub.`
      : `Task "${name}" created with workflow. Commit & push to activate on GitHub.`;
    const action = modePick.mode === "agent" ? "Edit Prompt" : "View Workflow";
    void vscode.window.showInformationMessage(nextSteps, action).then((choice) => {
      if (choice === "Edit Prompt" && task.promptFile) {
        const fp = path.join(workspaceRoot, task.promptFile);
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
