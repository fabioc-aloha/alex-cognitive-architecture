/**
 * Extension settings — centralized access to user-configurable values.
 *
 * All magic numbers that were previously hardcoded are read from VS Code
 * settings with sensible defaults matching the original values.
 */

import * as vscode from "vscode";

function cfg(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration("alex");
}

// ── Muscle Runner ─────────────────────────────────────────────────

/** Max execution time for muscle scripts in ms (default: 120 000). */
export function muscleTimeout(): number {
  return cfg().get<number>("muscle.timeout", 120_000);
}

/** Max stdout/stderr buffer for muscle output in bytes (default: 10 MB). */
export function muscleMaxBuffer(): number {
  return cfg().get<number>("muscle.maxBufferMB", 10) * 1024 * 1024;
}

// ── Status Bar ────────────────────────────────────────────────────

/** Status bar refresh interval in ms (default: 5 minutes). */
export function statusBarRefreshInterval(): number {
  return cfg().get<number>("statusBar.refreshIntervalMinutes", 5) * 60 * 1000;
}

// ── Health Pulse ──────────────────────────────────────────────────

/** Days without dream before status = critical (default: 14). */
export function dreamOverdueCriticalDays(): number {
  return cfg().get<number>("health.dreamOverdueCriticalDays", 14);
}

/** Days without dream before status = attention (default: 7). */
export function dreamStaleAttentionDays(): number {
  return cfg().get<number>("health.dreamStaleAttentionDays", 7);
}

/** Days since dream + sync stale before status = critical (default: 3). */
export function syncStaleCriticalDays(): number {
  return cfg().get<number>("health.syncStaleCriticalDays", 3);
}

/** Days since last sync before marking stale (default: 7). */
export function syncStaleDays(): number {
  return cfg().get<number>("health.syncStaleDays", 7);
}
