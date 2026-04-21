import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";
import { daysBetween } from "./dateUtils.js";

// ── E3: Health Status type ────────────────────────────────────────

export type HealthStatus = "healthy" | "attention" | "critical";

// ── E2: HealthPulse interface ─────────────────────────────────────

export interface HealthPulse {
  status: HealthStatus;

  // Live architecture inventory (counted from filesystem)
  skillCount: number;
  instructionCount: number;
  promptCount: number;
  agentCount: number;

  // Rituals (from dream report timestamp)
  lastDreamDate: Date | null;
  dreamNeeded: boolean;

  // Sync
  syncStale: boolean;



  // PA2: Uncommitted work detection (privacy: counts only)
  uncommittedFileCount: number;
  uncommittedDays: number;
}

// ── Dream report shape (from .github/quality/dream-report.json) ──

interface DreamReport {
  timestamp: string;
  trifectaIssues: unknown[];
  brokenRefs: unknown[];
}

// ── E4: computeHealthStatus ───────────────────────────────────────

export function computeHealthStatus(pulse: HealthPulse): HealthStatus {
  const now = new Date();
  const daysSinceDream = pulse.lastDreamDate
    ? Math.floor(daysBetween(pulse.lastDreamDate, now))
    : Infinity;

  // Critical: no dream baseline, or overdue with known issues
  if (pulse.dreamNeeded && daysSinceDream > 14) return "critical";
  if (pulse.syncStale && daysSinceDream > 3) return "critical";

  // Attention: dream needed or stale
  if (pulse.dreamNeeded) return "attention";
  if (daysSinceDream > 7) return "attention";
  if (pulse.syncStale) return "attention";

  return "healthy";
}

// ── E5: Dream report reader ───────────────────────────────────────

function readDreamReport(workspaceRoot: string): DreamReport | null {
  const reportPath = path.join(
    workspaceRoot,
    ".github",
    "quality",
    "dream-report.json",
  );
  try {
    const raw = fs.readFileSync(reportPath, "utf-8");
    return JSON.parse(raw) as DreamReport;
  } catch {
    return null;
  }
}

// ── E1: Sync staleness detection ──────────────────────────────────

interface SyncManifest {
  lastSync: string;
  brainVersion: string;
  syncMode: string;
  files: Record<string, number>;
}

function readSyncManifest(workspaceRoot: string): SyncManifest | null {
  const manifestPath = path.join(
    workspaceRoot,
    ".github",
    ".sync-manifest.json",
  );
  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    return JSON.parse(raw) as SyncManifest;
  } catch {
    return null;
  }
}

/**
 * Read the extension's bundled brain version from its package.json.
 * This is the "master" version that the workspace should match.
 */
function getExtensionBrainVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function detectSyncStale(workspaceRoot: string): boolean {
  const manifest = readSyncManifest(workspaceRoot);
  if (!manifest) return false; // No manifest = probably not an heir project

  // Version mismatch = stale
  const extVersion = getExtensionBrainVersion();
  if (manifest.brainVersion !== extVersion) return true;

  // Last sync >7 days ago = stale
  const lastSync = new Date(manifest.lastSync);
  if (isNaN(lastSync.getTime())) return true;
  const daysSince = daysBetween(lastSync, new Date());
  if (daysSince > 7) return true;

  return false;
}

// ── PA2: Uncommitted work detection ───────────────────────────────

interface GitUncommittedStatus {
  fileCount: number;
  days: number;
}

function detectUncommittedWork(workspaceRoot: string): GitUncommittedStatus {
  try {
    // Count staged + modified tracked files (privacy: count only)
    const staged = execFileSync("git", ["diff", "--cached", "--name-only"], {
      cwd: workspaceRoot, encoding: "utf-8", timeout: 5000,
    }).trim();
    const modified = execFileSync("git", ["diff", "--name-only"], {
      cwd: workspaceRoot, encoding: "utf-8", timeout: 5000,
    }).trim();

    const stagedCount = staged ? staged.split("\n").length : 0;
    const modifiedCount = modified ? modified.split("\n").length : 0;
    const totalCount = stagedCount + modifiedCount;

    if (totalCount === 0) return { fileCount: 0, days: 0 };

    // Estimate age from last commit date
    let days = 0;
    try {
      const lastCommitDate = execFileSync("git", ["log", "-1", "--format=%ci"], {
        cwd: workspaceRoot, encoding: "utf-8", timeout: 5000,
      }).trim();
      if (lastCommitDate) {
        days = Math.floor(daysBetween(new Date(lastCommitDate), new Date()));
      }
    } catch { /* default 0 */ }

    return { fileCount: totalCount, days };
  } catch {
    return { fileCount: 0, days: 0 };
  }
}

// ── E6: Live filesystem inventory ─────────────────────────────────

function countLiveInventory(workspaceRoot: string): {
  skills: number;
  instructions: number;
  prompts: number;
  agents: number;
} {
  const ghDir = path.join(workspaceRoot, ".github");

  const countDirs = (dir: string): number => {
    try {
      return fs.readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory()).length;
    } catch { return 0; }
  };

  const countFiles = (dir: string, suffix: string, recursive = false): number => {
    try {
      if (!recursive) {
        return fs.readdirSync(dir).filter((f) => f.endsWith(suffix)).length;
      }
      let count = 0;
      const walk = (d: string): void => {
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
          if (entry.isDirectory()) walk(path.join(d, entry.name));
          else if (entry.name.endsWith(suffix)) count++;
        }
      };
      walk(dir);
      return count;
    } catch { return 0; }
  };

  return {
    skills: countDirs(path.join(ghDir, "skills")),
    instructions: countFiles(path.join(ghDir, "instructions"), ".instructions.md"),
    prompts: countFiles(path.join(ghDir, "prompts"), ".prompt.md", true),
    agents: countFiles(path.join(ghDir, "agents"), ".agent.md"),
  };
}

// ── Public: Collect all stats and build HealthPulse ───────────────

export function collectHealthPulse(workspaceRoot: string): HealthPulse {
  const report = readDreamReport(workspaceRoot);
  const inv = countLiveInventory(workspaceRoot);

  const lastDreamDate = report ? new Date(report.timestamp) : null;
  const dreamNeeded = report
    ? report.brokenRefs.length > 0 || report.trifectaIssues.length > 20
    : true;

  const gitStatus = detectUncommittedWork(workspaceRoot);

  const pulse: HealthPulse = {
    status: "healthy", // placeholder — computed below
    skillCount: inv.skills,
    instructionCount: inv.instructions,
    promptCount: inv.prompts,
    agentCount: inv.agents,
    lastDreamDate,
    dreamNeeded,
    syncStale: detectSyncStale(workspaceRoot),
    uncommittedFileCount: gitStatus.fileCount,
    uncommittedDays: gitStatus.days,
  };

  pulse.status = computeHealthStatus(pulse);
  return pulse;
}

// ── Formatting helpers for the sidebar ────────────────────────────

export function formatRelativeTime(date: Date | null): string {
  if (!date) return "Never";
  const now = new Date();
  const days = Math.floor(daysBetween(date, now));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function formatInventory(pulse: HealthPulse): string {
  return `${pulse.skillCount} skills · ${pulse.instructionCount} instructions · ${pulse.promptCount} prompts · ${pulse.agentCount} agents`;
}

export function statusDotColor(status: HealthStatus): string {
  switch (status) {
    case "healthy":
      return "#22c55e";
    case "attention":
      return "#eab308";
    case "critical":
      return "#ef4444";
  }
}

export function statusLabel(status: HealthStatus): string {
  // Icons included for colorblind accessibility (never color-only)
  switch (status) {
    case "healthy":
      return "✓ Healthy";
    case "attention":
      return "⚠ Needs Attention";
    case "critical":
      return "✗ Critical";
  }
}

// ── E3 stub: Knowledge coverage badge ─────────────────────────────
// TODO(v8.1.0/KS): Once the Knowledge Score lane delivers confidence
// metrics, compute a coverage badge (0-100%) indicating how much of the
// project's domain is encoded in skills/instructions. The badge renders
// in the Health Pulse sidebar card. Depends on: KS lane completion,
// .github/muscles/knowledge-score.cjs output, skill activation index.
export type CoverageBadge = { percent: number; label: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function computeCoverageBadge(_pulse: HealthPulse): CoverageBadge | null {
  // Placeholder — returns null until KS lane delivers scoring
  return null;
}
