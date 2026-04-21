/**
 * Frecency module — combines frequency and recency for ranking.
 *
 * Score = frequency × recency_weight
 * Recency weight decays over time using half-life formula.
 */

// ── E10: Frecency Engine ──────────────────────────────────────────

/**
 * A single frecency record for an action.
 */
export interface FrecencyRecord {
  /** Action identifier (e.g., "ideate", "plan", "build") */
  id: string;
  /** Number of times used */
  count: number;
  /** Last use timestamp (ISO string) */
  lastUsed: string;
}

/**
 * Frecency data store shape.
 */
export interface FrecencyData {
  version: 1;
  actions: FrecencyRecord[];
}

// ── Configuration ─────────────────────────────────────────────────

/**
 * Half-life in days — after this many days, recency weight is halved.
 * 7 days means: an action used 7 days ago has half the recency boost
 * of one used today.
 */
const HALF_LIFE_DAYS = 7;

/**
 * Minimum score to consider an action "used". Actions below this
 * threshold are treated as unused for sorting purposes.
 */
const MIN_SCORE_THRESHOLD = 0.1;

// ── Core algorithms ───────────────────────────────────────────────

/**
 * Calculate recency weight using exponential decay.
 * Returns a value between 0 and 1.
 */
function recencyWeight(lastUsed: Date, now: Date): number {
  const daysSince =
    (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);
  // Exponential decay: e^(-λt) where λ = ln(2) / half_life
  const lambda = Math.LN2 / HALF_LIFE_DAYS;
  return Math.exp(-lambda * daysSince);
}

/**
 * Calculate frecency score for a single record.
 * Higher score = more relevant (used often and recently).
 */
export function calculateScore(record: FrecencyRecord, now = new Date()): number {
  const lastUsed = new Date(record.lastUsed);
  const weight = recencyWeight(lastUsed, now);
  // Score = frequency × recency weight
  // Using sqrt(count) to prevent heavy users from dominating
  return Math.sqrt(record.count) * weight;
}

/**
 * Record a use of an action, updating its frecency data.
 */
export function recordUse(
  data: FrecencyData,
  actionId: string,
  now = new Date(),
): FrecencyData {
  const existing = data.actions.find((a) => a.id === actionId);

  if (existing) {
    // Update existing record
    return {
      ...data,
      actions: data.actions.map((a) =>
        a.id === actionId
          ? { ...a, count: a.count + 1, lastUsed: now.toISOString() }
          : a,
      ),
    };
  } else {
    // Add new record
    return {
      ...data,
      actions: [
        ...data.actions,
        { id: actionId, count: 1, lastUsed: now.toISOString() },
      ],
    };
  }
}

/**
 * Sort action IDs by frecency score (highest first).
 * Actions not in the data are sorted to the end in original order.
 */
export function sortByFrecency(
  actionIds: string[],
  data: FrecencyData,
  now = new Date(),
): string[] {
  const scores = new Map<string, number>();

  for (const record of data.actions) {
    const score = calculateScore(record, now);
    if (score >= MIN_SCORE_THRESHOLD) {
      scores.set(record.id, score);
    }
  }

  // Separate actions with scores from those without
  const scored = actionIds.filter((id) => scores.has(id));
  const unscored = actionIds.filter((id) => !scores.has(id));

  // Sort scored actions by score (descending)
  scored.sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0));

  // Return scored first, then unscored in original order
  return [...scored, ...unscored];
}

/**
 * Get the top N actions by frecency.
 */
export function getTopActions(
  data: FrecencyData,
  n: number,
  now = new Date(),
): string[] {
  const scoredRecords = data.actions
    .map((record) => ({
      id: record.id,
      score: calculateScore(record, now),
    }))
    .filter((r) => r.score >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  return scoredRecords.slice(0, n).map((r) => r.id);
}

/**
 * Create empty frecency data.
 */
export function createEmptyData(): FrecencyData {
  return { version: 1, actions: [] };
}

/**
 * Prune old records that have decayed below threshold.
 * Call periodically to keep data size manageable.
 */
export function pruneOldRecords(
  data: FrecencyData,
  now = new Date(),
): FrecencyData {
  const validActions = data.actions.filter(
    (record) => calculateScore(record, now) >= MIN_SCORE_THRESHOLD,
  );

  return { ...data, actions: validActions };
}
