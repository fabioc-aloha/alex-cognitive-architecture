/**
 * Context-aware taglines with signal-based selection.
 *
 * Signals used:
 * - Health status (critical/attention/healthy) → selects base pool
 * - Project context (name, type) → personalizes tagline
 * - North Star (if present) → incorporates vision
 * - Custom config (if present) → project-specific taglines
 * - Day of year → rotates within pool
 * - Time of day → optional flavor adjustment
 */

import type { HealthStatus } from "./healthPulse.js";

// ── Config types ──────────────────────────────────────────────────

export interface TaglineConfig {
  version: string;
  project: string;
  taglines: {
    project: string[];
    vision?: string[];
    collaboration?: string[];
    [key: string]: string[] | undefined;
  };
  rotation?: {
    strategy?: "balanced" | "project-heavy" | "inspirational-heavy";
    projectWeight?: number;
    inspirationalWeight?: number;
  };
}


// ── Curated tagline pools ─────────────────────────────────────────

/**
 * Taglines for healthy state — human-AI collaboration, building together
 */
const HEALTHY_TAGLINES = [
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
  "Understanding before answering",
];

/**
 * Taglines for attention state — encouraging, collaborative
 */
const ATTENTION_TAGLINES = [
  "Still here, still building",
  "Every pause is a chance to reflect",
  "The best work takes time",
  "Progress isn't always visible",
  "Let's pick up where we left off",
  "Good things are worth the wait",
  "One conversation at a time",
];

/**
 * Taglines for critical state — grounding, partnership
 */
const CRITICAL_TAGLINES = [
  "Fresh starts are powerful",
  "We'll figure this out",
  "The first step is showing up",
  "Building begins with connection",
  "Ready when you are",
  "Together, we'll find the way",
];

/**
 * Taglines for unknown state (no health data yet)
 */
const UNKNOWN_TAGLINES = [
  "Two minds, ready to build",
  "Let's see what we can create",
  "The beginning of something",
  "Your partner in possibility",
];

// ── Time-of-day pools (optional flavor) ───────────────────────────

const MORNING_TAGLINES = [
  "A new day to create",
  "Fresh ideas await",
  "What will we build today?",
];

const EVENING_TAGLINES = [
  "Wrapping up what we started",
  "Good work deserves reflection",
  "Tomorrow we build on today",
];

// ── Selection logic ───────────────────────────────────────────────

type TimeOfDay = "morning" | "afternoon" | "evening";

function getTimeOfDay(date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function getDayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Select a tagline from a pool using day-of-year rotation.
 */
function selectFromPool(pool: string[], date = new Date()): string {
  const dayOfYear = getDayOfYear(date);
  return pool[dayOfYear % pool.length];
}

/**
 * Get the appropriate tagline pool for a health status.
 */
function getPoolForStatus(status: HealthStatus | "unknown"): string[] {
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

// ── Public API ────────────────────────────────────────────────────

/**
 * Load tagline configuration from .github/config/taglines.json
 */
export function loadTaglineConfig(
  workspaceRoot: string,
  fs: { existsSync: (p: string) => boolean; readFileSync: (p: string, enc: "utf-8") => string },
  path: { join: (...p: string[]) => string },
): TaglineConfig | null {
  const configPath = path.join(workspaceRoot, ".github", "config", "taglines.json");
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(content) as TaglineConfig;
    // Basic validation
    if (!config.taglines?.project || config.taglines.project.length === 0) {
      return null;
    }
    return config;
  } catch {
    return null;
  }
}

/**
 * Get all taglines from a config, flattened across categories.
 */
function getConfigTaglines(config: TaglineConfig): string[] {
  const all: string[] = [];
  for (const category of Object.keys(config.taglines)) {
    const pool = config.taglines[category];
    if (Array.isArray(pool)) {
      all.push(...pool);
    }
  }
  return all;
}

export interface TaglineOptions {
  /** Health status — affects tagline pool */
  status?: HealthStatus | "unknown";
  /** Custom tagline configuration loaded from .github/config/taglines.json */
  config?: TaglineConfig | null;
  /** Use time-of-day flavored taglines (10% chance) */
  useTimeOfDay?: boolean;
  /** Override date for testing */
  date?: Date;
}

/**
 * Get a tagline based on signals.
 *
 * @param options - Selection options
 * @returns A curated tagline string
 *
 * @example
 * getTagline({ status: "healthy" }) // "Two minds, one vision"
 * getTagline({ config }) // May return project-specific tagline
 */
export function getTagline(options: TaglineOptions = {}): string {
  const {
    status = "unknown",
    config,
    useTimeOfDay = true,
    date = new Date(),
  } = options;

  const dayOfYear = getDayOfYear(date);

  // If config exists with project taglines, mix with inspirational
  if (config && status === "healthy") {
    const projectWeight = config.rotation?.projectWeight ?? 50;
    const threshold = Math.floor(projectWeight);
    const shouldUseProject = (dayOfYear % 100) < threshold;
    
    if (shouldUseProject) {
      const projectTaglines = getConfigTaglines(config);
      if (projectTaglines.length > 0) {
        return selectFromPool(projectTaglines, date);
      }
    }
    // Fall through to inspirational if not using project tagline
  }

  // 10% chance of time-of-day tagline (only for healthy state)
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

  // Primary selection: health-status pool with daily rotation
  const pool = getPoolForStatus(status);
  return selectFromPool(pool, date);
}

/**
 * Get all taglines for a given status (for testing/preview).
 */
export function getAllTaglines(
  status: HealthStatus | "unknown",
): readonly string[] {
  return getPoolForStatus(status);
}
