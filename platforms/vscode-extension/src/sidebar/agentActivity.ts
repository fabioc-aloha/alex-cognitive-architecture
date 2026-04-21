/**
 * Agent Activity module — GitHub PR integration for Autopilot v2.
 *
 * AP4: Recent Sessions panel (PRs from copilot-swe-agent[bot])
 * AP5: Pending Reviews panel (PRs needing human review)
 * AP6: Status bar badge (ambient notification count)
 */

import * as vscode from "vscode";
import { execFile } from "child_process";
import { execSync } from "child_process";
import { escHtml, escAttr } from "./htmlUtils.js";

// ── Types ─────────────────────────────────────────────────────────

export interface AgentPR {
  number: number;
  title: string;
  url: string;
  state: "open" | "closed" | "merged";
  author: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  reviewDecision: string;
  labels: string[];
}

export interface AgentActivitySummary {
  recentAgentPRs: AgentPR[];
  pendingReviews: AgentPR[];
  totalPending: number;
  lastFetched: Date | null;
  error: string | null;
}

// ── Cache for non-blocking rendering ──────────────────────────────

let cachedActivity: AgentActivitySummary = {
  recentAgentPRs: [],
  pendingReviews: [],
  totalPending: 0,
  lastFetched: null,
  error: null,
};

// ── GitHub CLI helpers ────────────────────────────────────────────

let ghAvailableCache: boolean | null = null;

function ghAvailable(): boolean {
  if (ghAvailableCache !== null) return ghAvailableCache;
  try {
    execSync("gh --version", { stdio: "ignore", timeout: 5000 });
    ghAvailableCache = true;
  } catch {
    ghAvailableCache = false;
  }
  return ghAvailableCache;
}

/** Run gh CLI asynchronously — never blocks the extension host. */
function runGhAsync(args: string, cwd?: string): Promise<string | null> {
  return new Promise((resolve) => {
    const parts = args.split(/\s+/);
    execFile("gh", parts, {
      cwd,
      timeout: 15000,
      maxBuffer: 1024 * 1024,
    }, (err, stdout) => {
      if (err) { resolve(null); return; }
      resolve(stdout.trim());
    });
  });
}

/** Run gh CLI synchronously (only for ghAvailable check). */
function runGh(args: string, cwd?: string): string | null {
  try {
    return execSync(`gh ${args}`, {
      cwd,
      encoding: "utf-8",
      timeout: 15000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

// ── Core fetch ────────────────────────────────────────────────────

function parsePRs(json: string | null): AgentPR[] {
  if (!json) return [];
  try {
    const raw = JSON.parse(json) as Array<Record<string, unknown>>;
    return raw.map((pr) => ({
      number: pr.number as number,
      title: pr.title as string,
      url: pr.url as string,
      state: pr.state as "open" | "closed" | "merged",
      author: ((pr.author as Record<string, string>)?.login ?? "unknown"),
      createdAt: pr.createdAt as string,
      updatedAt: pr.updatedAt as string,
      isDraft: (pr.isDraft as boolean) ?? false,
      reviewDecision: (pr.reviewDecision as string) ?? "",
      labels: ((pr.labels as Array<Record<string, string>>) ?? []).map((l) => l.name),
    }));
  } catch {
    return [];
  }
}

const PR_FIELDS = "number,title,url,state,author,createdAt,updatedAt,isDraft,reviewDecision,labels";

/**
 * Fetch agent-created PRs (from copilot-swe-agent[bot] or similar).
 */
export function fetchAgentPRs(workspaceRoot: string, limit = 10): AgentPR[] {
  if (!ghAvailable()) return [];
  const json = runGh(
    `pr list --author "app/copilot-swe-agent" --state all --limit ${limit} --json ${PR_FIELDS}`,
    workspaceRoot,
  );
  return parsePRs(json);
}

/**
 * Fetch PRs that need the current user's review.
 */
export function fetchPendingReviews(workspaceRoot: string, limit = 10): AgentPR[] {
  if (!ghAvailable()) return [];
  const json = runGh(
    `pr list --search "review-requested:@me" --state open --limit ${limit} --json ${PR_FIELDS}`,
    workspaceRoot,
  );
  return parsePRs(json);
}

/**
 * Collect full agent activity summary (sync — kept for backward compat).
 */
export function collectAgentActivity(workspaceRoot: string): AgentActivitySummary {
  try {
    const recentAgentPRs = fetchAgentPRs(workspaceRoot);
    const pendingReviews = fetchPendingReviews(workspaceRoot);
    return {
      recentAgentPRs,
      pendingReviews,
      totalPending: pendingReviews.length,
      lastFetched: new Date(),
      error: null,
    };
  } catch (err) {
    return {
      recentAgentPRs: [],
      pendingReviews: [],
      totalPending: 0,
      lastFetched: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Async refresh of agent activity — never blocks extension host.
 * Updates the module-level cache and calls onUpdate when done.
 * Guards against overlapping refreshes.
 */
let refreshInFlight = false;
export async function refreshAgentActivityAsync(
  workspaceRoot: string,
  onUpdate?: () => void,
): Promise<void> {
  if (refreshInFlight) return;
  refreshInFlight = true;
  try {
    const [agentJson, reviewJson] = await Promise.all([
      runGhAsync(
        `pr list --author app/copilot-swe-agent --state all --limit 10 --json ${PR_FIELDS}`,
        workspaceRoot,
      ),
      runGhAsync(
        `pr list --search review-requested:@me --state open --limit 10 --json ${PR_FIELDS}`,
        workspaceRoot,
      ),
    ]);
    const recentAgentPRs = parsePRs(agentJson);
    const pendingReviews = parsePRs(reviewJson);
    cachedActivity = {
      recentAgentPRs,
      pendingReviews,
      totalPending: pendingReviews.length,
      lastFetched: new Date(),
      error: null,
    };
  } catch (err) {
    cachedActivity = {
      ...cachedActivity,
      error: err instanceof Error ? err.message : String(err),
    };
  }
  refreshInFlight = false;
  onUpdate?.();
}

// ── AP4/AP5: Render HTML for sidebar ──────────────────────────────



function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function prStateIcon(pr: AgentPR): string {
  if (pr.state === "merged") return "git-merge";
  if (pr.state === "closed") return "close";
  if (pr.isDraft) return "git-pull-request-draft";
  return "git-pull-request";
}

function prStateColor(pr: AgentPR): string {
  if (pr.state === "merged") return "var(--vscode-charts-purple, #a371f7)";
  if (pr.state === "closed") return "var(--vscode-errorForeground, #f85149)";
  return "var(--vscode-charts-green, #3fb950)";
}

export function renderAgentActivity(_workspaceRoot: string): string {
  const activity = cachedActivity;

  if (activity.error || (!activity.recentAgentPRs.length && !activity.pendingReviews.length)) {
    return `
    <div class="agent-activity">
      <div class="agent-activity-empty">
        <span class="codicon codicon-info"></span>
        ${activity.error ? "GitHub CLI not available or not authenticated." : "No agent PRs found. Agent activity will appear here."}
      </div>
    </div>`;
  }

  let html = `<div class="agent-activity">`;

  // Pending Reviews (AP5)
  if (activity.pendingReviews.length > 0) {
    html += `
    <div class="agent-section">
      <div class="agent-section-header">
        <span class="codicon codicon-eye"></span>
        <strong>Pending Reviews</strong>
        <span class="agent-badge">${activity.pendingReviews.length}</span>
      </div>`;
    for (const pr of activity.pendingReviews) {
      html += renderPRRow(pr);
    }
    html += `</div>`;
  }

  // Recent Agent PRs (AP4)
  if (activity.recentAgentPRs.length > 0) {
    html += `
    <div class="agent-section">
      <div class="agent-section-header">
        <span class="codicon codicon-hubot"></span>
        <strong>Recent Agent Sessions</strong>
      </div>`;
    for (const pr of activity.recentAgentPRs.slice(0, 5)) {
      html += renderPRRow(pr);
    }
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

function renderPRRow(pr: AgentPR): string {
  const icon = prStateIcon(pr);
  const color = prStateColor(pr);
  return `
  <div class="agent-pr-row" data-command="openExternal" data-file="${escAttr(pr.url)}" role="button" tabindex="0">
    <span class="codicon codicon-${escAttr(icon)}" style="color:${escAttr(color)};"></span>
    <div class="agent-pr-info">
      <span class="agent-pr-title">${escHtml(pr.title)}</span>
      <span class="agent-pr-meta">#${pr.number} · ${escHtml(timeAgo(pr.createdAt))} · ${escHtml(pr.author)}</span>
    </div>
  </div>`;
}

// ── AP6: Status bar badge ─────────────────────────────────────────

let statusBarItem: vscode.StatusBarItem | null = null;

export function createAgentStatusBar(context: vscode.ExtensionContext): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    50,
  );
  statusBarItem.command = "alex.openChat";
  statusBarItem.name = "Alex Agent Activity";
  context.subscriptions.push(statusBarItem);
  return statusBarItem;
}

export function updateAgentStatusBar(workspaceRoot: string | undefined): void {
  if (!statusBarItem) return;

  if (!workspaceRoot) {
    statusBarItem.text = "$(brain) Alex";
    statusBarItem.tooltip = "Alex Cognitive Architecture";
    statusBarItem.show();
    return;
  }

  // Use cached data for instant render, then refresh async
  const pending = cachedActivity.pendingReviews;
  if (pending.length > 0) {
    statusBarItem.text = `$(brain) Alex $(bell-dot) ${pending.length}`;
    statusBarItem.tooltip = `${pending.length} PR${pending.length === 1 ? "" : "s"} awaiting review`;
  } else {
    statusBarItem.text = "$(brain) Alex";
    statusBarItem.tooltip = "Alex Cognitive Architecture — no pending reviews";
  }
  statusBarItem.show();

  // Trigger async refresh for next render cycle
  void refreshAgentActivityAsync(workspaceRoot, () => {
    const updated = cachedActivity.pendingReviews;
    if (!statusBarItem) return;
    if (updated.length > 0) {
      statusBarItem.text = `$(brain) Alex $(bell-dot) ${updated.length}`;
      statusBarItem.tooltip = `${updated.length} PR${updated.length === 1 ? "" : "s"} awaiting review`;
    } else {
      statusBarItem.text = "$(brain) Alex";
      statusBarItem.tooltip = "Alex Cognitive Architecture — no pending reviews";
    }
  });
}

// ── CSS for agent activity panels ─────────────────────────────────

export const AGENT_ACTIVITY_CSS = `
  .agent-activity { margin: 8px 0; }
  .agent-activity-empty {
    padding: 12px;
    text-align: center;
    color: var(--vscode-descriptionForeground);
    font-size: 11px;
  }
  .agent-activity-empty .codicon { margin-right: 4px; }
  .agent-section { margin-bottom: 12px; }
  .agent-section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
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
    gap: 8px;
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 4px;
  }
  .agent-pr-row:hover { background: var(--vscode-list-hoverBackground); }
  .agent-pr-row .codicon { margin-top: 2px; flex-shrink: 0; }
  .agent-pr-info { display: flex; flex-direction: column; min-width: 0; }
  .agent-pr-title {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .agent-pr-meta {
    font-size: 10px;
    color: var(--vscode-descriptionForeground);
  }
`;
