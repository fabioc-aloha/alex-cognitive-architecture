/**
 * GitHub Actions workflow YAML generation for scheduled tasks.
 */

import * as fs from "fs";
import * as path from "path";
import type { ScheduledTask } from "./scheduledTasksTypes.js";

// ── Path Helpers ──────────────────────────────────────────────────

function workflowDir(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".github", "workflows");
}

export function workflowPath(workspaceRoot: string, taskId: string): string {
  return path.join(workflowDir(workspaceRoot), `scheduled-${taskId}.yml`);
}

// ── Validation & Sanitization ─────────────────────────────────────

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

/** Validate a cron expression contains only safe characters. */
function validateCron(cron: string): string {
  if (!/^[0-9*\/,\- ]+$/.test(cron)) {
    throw new Error(`Invalid cron expression: "${cron}".`);
  }
  return cron;
}

// ── YAML Templates ────────────────────────────────────────────────

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

// ── Public API ────────────────────────────────────────────────────

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

/** Check whether a workflow YAML file has been generated for a task. */
export function hasWorkflow(workspaceRoot: string, taskId: string): boolean {
  return fs.existsSync(workflowPath(workspaceRoot, taskId));
}
