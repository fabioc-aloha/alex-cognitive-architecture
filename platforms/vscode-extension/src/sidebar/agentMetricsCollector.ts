/**
 * CL1: Agent Metrics Collector — writes to .agent-metrics-state.json.
 *
 * Tracks task execution outcomes (success/failure, duration, count)
 * and exposes an API for other modules to record events.
 * The AgentActivityTreeView reads the state file this module produces.
 */

import * as fs from "fs";
import * as path from "path";
import { metricsRetentionMs } from "../settings.js";

// ── Types ─────────────────────────────────────────────────────────

interface MetricEntry {
  value: number;
  lastUpdated: string;
}

type MetricsState = Record<string, MetricEntry>;

interface RunRecord {
  startedAt: number;   // Date.now()
  completedAt?: number;
  success?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────

const STATE_FILE = ".agent-metrics-state.json";

function retentionMs(): number {
  return metricsRetentionMs();
}

// ── In-memory run log for rate/duration aggregation ───────────────

/**
 * Rolling window of recent task runs. Persisted alongside the state file
 * so aggregation survives extension restarts.
 */
interface RunLog {
  runs: Array<{ taskId: string; startedAt: number; completedAt: number; success: boolean }>;
}

// ── State helpers ─────────────────────────────────────────────────

function stateFilePath(workspaceRoot: string): string {
  return path.join(workspaceRoot, STATE_FILE);
}

function runLogPath(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".agent-metrics-runlog.json");
}

function readState(workspaceRoot: string): MetricsState {
  try {
    return JSON.parse(fs.readFileSync(stateFilePath(workspaceRoot), "utf-8"));
  } catch {
    return {};
  }
}

function writeState(workspaceRoot: string, state: MetricsState): void {
  fs.writeFileSync(
    stateFilePath(workspaceRoot),
    JSON.stringify(state, null, 2) + "\n",
    "utf-8",
  );
}

function readRunLog(workspaceRoot: string): RunLog {
  try {
    return JSON.parse(fs.readFileSync(runLogPath(workspaceRoot), "utf-8"));
  } catch {
    return { runs: [] };
  }
}

function writeRunLog(workspaceRoot: string, log: RunLog): void {
  fs.writeFileSync(
    runLogPath(workspaceRoot),
    JSON.stringify(log, null, 2) + "\n",
    "utf-8",
  );
}

/** Remove entries older than retention window. */
function pruneRunLog(log: RunLog): RunLog {
  const cutoff = Date.now() - retentionMs();
  return { runs: log.runs.filter((r) => r.completedAt > cutoff) };
}

// ── In-flight tracking ────────────────────────────────────────────

const inFlight = new Map<string, RunRecord>();

// ── Public API ────────────────────────────────────────────────────

/**
 * Call when a task starts executing (local or cloud dispatch).
 * Returns a run key for pairing with `recordTaskEnd`.
 */
export function recordTaskStart(taskId: string): string {
  const key = `${taskId}:${Date.now()}`;
  inFlight.set(key, { startedAt: Date.now() });
  return key;
}

/**
 * Call when a task finishes. Pairs with `recordTaskStart`.
 * Updates the run log and recalculates aggregate metrics.
 */
export function recordTaskEnd(
  workspaceRoot: string,
  runKey: string,
  success: boolean,
): void {
  const record = inFlight.get(runKey);
  const now = Date.now();

  // Append to run log
  const log = readRunLog(workspaceRoot);
  log.runs.push({
    taskId: runKey.split(":")[0],
    startedAt: record?.startedAt ?? now,
    completedAt: now,
    success,
  });
  const pruned = pruneRunLog(log);
  writeRunLog(workspaceRoot, pruned);

  // Clean up in-flight
  inFlight.delete(runKey);

  // Recalculate aggregate metrics
  recalculate(workspaceRoot, pruned);
}

/**
 * Increment loop-guard-triggers counter.
 * Call when a runaway task is halted.
 */
export function recordLoopGuardTrigger(workspaceRoot: string): void {
  const state = readState(workspaceRoot);
  const current = state["loop-guard-triggers"]?.value ?? 0;
  state["loop-guard-triggers"] = {
    value: current + 1,
    lastUpdated: new Date().toISOString(),
  };
  writeState(workspaceRoot, state);
}

// ── Aggregate recalculation ───────────────────────────────────────

function recalculate(workspaceRoot: string, log: RunLog): void {
  const state = readState(workspaceRoot);
  const now = new Date().toISOString();
  const runs = log.runs;

  // tasks-run-count: total runs in window
  state["tasks-run-count"] = { value: runs.length, lastUpdated: now };

  // task-success-rate: percentage of successful runs
  if (runs.length > 0) {
    const successes = runs.filter((r) => r.success).length;
    state["task-success-rate"] = {
      value: Math.round((successes / runs.length) * 100),
      lastUpdated: now,
    };
  }

  // task-duration: average duration in seconds
  const durations = runs
    .map((r) => (r.completedAt - r.startedAt) / 1000)
    .filter((d) => d > 0);
  if (durations.length > 0) {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    state["task-duration"] = {
      value: Math.round(avg),
      lastUpdated: now,
    };
  }

  // Preserve loop-guard-triggers (incremented separately)
  if (!state["loop-guard-triggers"]) {
    state["loop-guard-triggers"] = { value: 0, lastUpdated: now };
  }

  writeState(workspaceRoot, state);
}
