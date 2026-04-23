/**
 * GitHub API dispatch, polling, and PAT management for scheduled tasks.
 */

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { execFileSync } from "child_process";
import type { RunInfo, RunStatus } from "./scheduledTasksTypes.js";
import { setRunInfo } from "./taskStore.js";
import { recordTaskStart, recordTaskEnd } from "./agentMetricsCollector.js";
import { autopilotPollInterval, autopilotMaxPollAttempts } from "../settings.js";

// ── GitHub PAT Helpers ────────────────────────────────────────────

/** Check if COPILOT_PAT secret exists in the repo. */
export function hasCopilotPAT(workspaceRoot: string): boolean {
  try {
    const out = execFileSync("gh", ["secret", "list", "--json", "name"], {
      cwd: workspaceRoot, encoding: "utf-8", timeout: 10_000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const secrets = JSON.parse(out) as Array<{ name: string }>;
    return secrets.some((s) => s.name === "COPILOT_PAT");
  } catch {
    return false; // gh not available or not authenticated
  }
}

/**
 * One-click PAT setup: stores the user's existing `gh auth token` as the
 * COPILOT_PAT repo secret. Returns true on success.
 */
export async function setupCopilotPAT(workspaceRoot: string): Promise<boolean> {
  const choice = await vscode.window.showInformationMessage(
    "Autopilot needs a GitHub token (repo secret) to assign Copilot to issues. " +
    "Set it up now using your existing GitHub CLI auth?",
    { modal: true },
    "Set Up Automatically",
    "I'll Do It Manually",
  );

  if (choice === "I'll Do It Manually") {
    void vscode.env.openExternal(
      vscode.Uri.parse("https://github.com/settings/personal-access-tokens/new"),
    );
    void vscode.window.showInformationMessage(
      "Create a fine-grained PAT with Issues (read/write) and Contents (read/write) permissions, " +
      "then run: gh secret set COPILOT_PAT in your repo.",
    );
    return false;
  }

  if (choice !== "Set Up Automatically") return false;

  try {
    // Get user's existing gh token
    const token = execFileSync("gh", ["auth", "token"], {
      cwd: workspaceRoot, encoding: "utf-8", timeout: 10_000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (!token) {
      vscode.window.showErrorMessage("Could not retrieve GitHub CLI token. Run `gh auth login` first.");
      return false;
    }

    // Store as repo secret — token piped via stdin to avoid process list exposure
    execFileSync("gh", ["secret", "set", "COPILOT_PAT"], {
      cwd: workspaceRoot, timeout: 15_000,
      input: token,
      stdio: ["pipe", "pipe", "pipe"],
    });

    vscode.window.showInformationMessage("COPILOT_PAT secret created. Copilot can now be auto-assigned to issues.");
    return true;
  } catch {
    vscode.window.showErrorMessage(
      "Failed to set up COPILOT_PAT. Make sure `gh` CLI is installed and you're authenticated (`gh auth login`).",
    );
    return false;
  }
}

// ── Git Helpers ───────────────────────────────────────────────────

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

// ── Dispatch & Monitor ────────────────────────────────────────────

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
  workspaceRoot?: string,
): Promise<vscode.Disposable> {
  const parsed = parseOwnerRepo(repoUrl);
  if (!parsed) throw new Error("Cannot parse GitHub owner/repo from URL");

  // Metrics: start tracking
  const metricsKey = recordTaskStart(taskId);
  const wsRoot = workspaceRoot ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

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
    // Metrics: record failure
    if (wsRoot) recordTaskEnd(wsRoot, metricsKey, false);
    throw new Error(`Dispatch failed (${dispatchRes.status}): ${body}`);
  }

  // Poll for the run
  const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/runs?per_page=1&created=>${dispatchTime.slice(0, 19)}Z`;

  let attempts = 0;
  const maxAttempts = autopilotMaxPollAttempts();
  const pollInterval = autopilotPollInterval();

  const poll = async (): Promise<void> => {
    attempts++;
    if (attempts > maxAttempts) {
      const info: RunInfo = { status: "error" };
      setRunInfo(taskId, info);
      onUpdate(info);
      // Metrics: record timeout as failure
      if (wsRoot) recordTaskEnd(wsRoot, metricsKey, false);
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

      // Metrics: record final outcome
      if (wsRoot) recordTaskEnd(wsRoot, metricsKey, run.conclusion === "success");
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
