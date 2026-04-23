import type { HealthPulse } from "./healthPulse.js";
import { daysBetween } from "./dateUtils.js";
import {
  dreamOverdueCriticalDays,
  dreamStaleAttentionDays,
  syncStaleCriticalDays,
} from "./settings.js";

// ── E9: Nudge Engine ──────────────────────────────────────────────

/**
 * Priority levels for nudges. Lower numbers = higher priority.
 */
export type NudgePriority = "critical" | "high" | "medium" | "low";

/**
 * A context-aware suggestion based on current health state.
 */
export interface Nudge {
  /** Unique identifier for deduplication */
  id: string;
  /** Priority level (affects display order) */
  priority: NudgePriority;
  /** Short message for the nudge */
  message: string;
  /** VS Code codicon name */
  icon: string;
  /** Command to execute when clicked */
  command: string;
  /** Optional prompt to send with command */
  prompt?: string;
}

// ── Nudge rules ───────────────────────────────────────────────────

interface NudgeRule {
  id: string;
  /** Check if this nudge applies */
  condition: (pulse: HealthPulse, context: NudgeContext) => boolean;
  /** Generate the nudge */
  generate: (pulse: HealthPulse, context: NudgeContext) => Nudge;
}

interface NudgeContext {
  daysSinceDream: number;
}

function computeContext(pulse: HealthPulse): NudgeContext {
  const now = new Date();
  return {
    daysSinceDream: pulse.lastDreamDate
      ? daysBetween(pulse.lastDreamDate, now)
      : Infinity,
  };
}

// ── Nudge rule definitions ────────────────────────────────────────

const NUDGE_RULES: NudgeRule[] = [
  // Critical: No dream ever
  {
    id: "no-dream-baseline",
    condition: (p) => p.lastDreamDate === null,
    generate: () => ({
      id: "no-dream-baseline",
      priority: "critical",
      message: "Run Dream to establish a health baseline",
      icon: "beaker",
      command: "dream",
    }),
  },

  // Critical: Dream overdue with issues
  {
    id: "dream-overdue-critical",
    condition: (p, ctx) => p.dreamNeeded && ctx.daysSinceDream > dreamOverdueCriticalDays(),
    generate: (_p, ctx) => ({
      id: "dream-overdue-critical",
      priority: "critical",
      message: `${Math.floor(ctx.daysSinceDream)} days since dream — issues need attention`,
      icon: "alert",
      command: "dream",
    }),
  },

  // Critical: Sync stale + old dream
  {
    id: "sync-stale-critical",
    condition: (p, ctx) => p.syncStale && ctx.daysSinceDream > syncStaleCriticalDays(),
    generate: () => ({
      id: "sync-stale-critical",
      priority: "critical",
      message: "Heir sync stale — run Dream then sync",
      icon: "sync-ignored",
      command: "dream",
    }),
  },

  // High: Dream needed (issues detected)
  {
    id: "dream-needed",
    condition: (p, ctx) =>
      p.dreamNeeded && ctx.daysSinceDream <= dreamOverdueCriticalDays() && p.lastDreamDate !== null,
    generate: () => ({
      id: "dream-needed",
      priority: "high",
      message: "Issues detected — Dream recommended",
      icon: "symbol-event",
      command: "dream",
    }),
  },

  // High: Dream stale (>7 days)
  {
    id: "dream-stale",
    condition: (p, ctx) =>
      !p.dreamNeeded && ctx.daysSinceDream > dreamStaleAttentionDays() && p.lastDreamDate !== null,
    generate: (_p, ctx) => ({
      id: "dream-stale",
      priority: "high",
      message: `${Math.floor(ctx.daysSinceDream)} days since dream — weekly check recommended`,
      icon: "calendar",
      command: "dream",
    }),
  },

  // Medium: Sync stale (but dream recent)
  {
    id: "sync-stale",
    condition: (p, ctx) => p.syncStale && ctx.daysSinceDream <= syncStaleCriticalDays(),
    generate: () => ({
      id: "sync-stale",
      priority: "medium",
      message: "Heir architecture behind master — sync recommended",
      icon: "sync",
      command: "openChat",
      prompt: "Sync the heir project's cognitive architecture",
    }),
  },

  // Low: Healthy encouragement
  {
    id: "healthy-status",
    condition: (p) => p.status === "healthy" && p.lastDreamDate !== null,
    generate: () => ({
      id: "healthy-status",
      priority: "low",
      message: "Architecture healthy — ready to create",
      icon: "check",
      command: "openChat",
    }),
  },
];

// ── Priority ordering ─────────────────────────────────────────────

const PRIORITY_ORDER: Record<NudgePriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function compareNudges(a: Nudge, b: Nudge): number {
  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Generate context-aware nudges based on current health state.
 * Returns nudges sorted by priority (critical first).
 *
 * @param pulse - Current health pulse data
 * @param maxNudges - Maximum number of nudges to return (default: 3)
 */
export function generateNudges(pulse: HealthPulse, maxNudges = 3): Nudge[] {
  const context = computeContext(pulse);

  const nudges = NUDGE_RULES.filter((rule) => rule.condition(pulse, context))
    .map((rule) => rule.generate(pulse, context))
    .sort(compareNudges);

  return nudges.slice(0, maxNudges);
}

/**
 * Get the single most important nudge for display in compact UI.
 */
export function getPrimaryNudge(pulse: HealthPulse): Nudge | null {
  const nudges = generateNudges(pulse, 1);
  return nudges[0] ?? null;
}

/**
 * Check if any critical nudges exist.
 */
export function hasCriticalNudges(pulse: HealthPulse): boolean {
  const context = computeContext(pulse);
  return NUDGE_RULES.some(
    (rule) =>
      rule.condition(pulse, context) &&
      rule.generate(pulse, context).priority === "critical",
  );
}

// ── PA2: Cross-session proactive nudges ───────────────────────────

export function generateCrossSessionNudges(pulse: HealthPulse): Nudge[] {
  const nudges: Nudge[] = [];

  // PA2: Uncommitted work detection (privacy: file count only, not paths)
  if (pulse.uncommittedFileCount > 0 && pulse.uncommittedDays >= 1) {
    const priority: NudgePriority = pulse.uncommittedDays >= 4 ? "high" : "medium";
    const daysLabel = pulse.uncommittedDays === 1
      ? "~1 day"
      : `~${pulse.uncommittedDays} days`;
    nudges.push({
      id: "uncommitted-work",
      message: `${pulse.uncommittedFileCount} uncommitted change(s) for ${daysLabel}`,
      priority,
      icon: "git-commit",
      command: "workbench.action.output.toggleOutput",
    });
  }

  return nudges;
}

/**
 * Get nudge icon color based on priority.
 */
export function nudgeColor(priority: NudgePriority): string {
  switch (priority) {
    case "critical":
      return "#ef4444";
    case "high":
      return "#eab308";
    case "medium":
      return "#3b82f6";
    case "low":
      return "#22c55e";
  }
}
