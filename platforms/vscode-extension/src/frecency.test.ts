import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  calculateScore,
  recordUse,
  sortByFrecency,
  getTopActions,
  createEmptyData,
  pruneOldRecords,
  type FrecencyData,
  type FrecencyRecord,
} from "./frecency";

// ── Test helpers ──────────────────────────────────────────────────

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function createRecord(
  id: string,
  count: number,
  daysOld: number,
): FrecencyRecord {
  return {
    id,
    count,
    lastUsed: daysAgo(daysOld).toISOString(),
  };
}

// ── calculateScore tests ──────────────────────────────────────────

describe("calculateScore", () => {
  const now = new Date("2026-04-17T10:00:00Z");

  it("gives higher score to recently used actions", () => {
    const recent = createRecord("a", 5, 0);
    const old = createRecord("b", 5, 14);

    expect(calculateScore(recent, now)).toBeGreaterThan(
      calculateScore(old, now),
    );
  });

  it("gives higher score to frequently used actions", () => {
    const frequent = createRecord("a", 10, 3);
    const rare = createRecord("b", 1, 3);

    expect(calculateScore(frequent, now)).toBeGreaterThan(
      calculateScore(rare, now),
    );
  });

  it("balances frequency and recency", () => {
    // Old but very frequent vs recent but rare
    const oldFrequent = createRecord("a", 100, 14);
    const recentRare = createRecord("b", 1, 0);

    // The frequent one should still score higher even though old
    // sqrt(100) * decay(14 days) ≈ 10 * 0.25 = 2.5
    // sqrt(1) * decay(0 days) = 1 * 1 = 1
    expect(calculateScore(oldFrequent, now)).toBeGreaterThan(
      calculateScore(recentRare, now),
    );
  });

  it("decays by half after half-life period (7 days)", () => {
    const recent = createRecord("a", 4, 0);
    const halfLife = createRecord("b", 4, 7);

    const recentScore = calculateScore(recent, now);
    const halfLifeScore = calculateScore(halfLife, now);

    // Should be approximately half (within 5% tolerance)
    expect(halfLifeScore / recentScore).toBeCloseTo(0.5, 1);
  });
});

// ── recordUse tests ───────────────────────────────────────────────

describe("recordUse", () => {
  it("creates new record for first use", () => {
    const data = createEmptyData();
    const updated = recordUse(data, "ideate");

    expect(updated.actions).toHaveLength(1);
    expect(updated.actions[0].id).toBe("ideate");
    expect(updated.actions[0].count).toBe(1);
  });

  it("increments count for existing action", () => {
    let data = createEmptyData();
    data = recordUse(data, "ideate");
    data = recordUse(data, "ideate");
    data = recordUse(data, "ideate");

    expect(data.actions).toHaveLength(1);
    expect(data.actions[0].count).toBe(3);
  });

  it("updates lastUsed timestamp", () => {
    const t1 = new Date("2026-04-10T10:00:00Z");
    const t2 = new Date("2026-04-17T10:00:00Z");

    let data = createEmptyData();
    data = recordUse(data, "build", t1);
    data = recordUse(data, "build", t2);

    expect(data.actions[0].lastUsed).toBe(t2.toISOString());
  });

  it("handles multiple different actions", () => {
    let data = createEmptyData();
    data = recordUse(data, "ideate");
    data = recordUse(data, "plan");
    data = recordUse(data, "build");

    expect(data.actions).toHaveLength(3);
    expect(data.actions.map((a) => a.id)).toContain("ideate");
    expect(data.actions.map((a) => a.id)).toContain("plan");
    expect(data.actions.map((a) => a.id)).toContain("build");
  });
});

// ── sortByFrecency tests ──────────────────────────────────────────

describe("sortByFrecency", () => {
  const now = new Date("2026-04-17T10:00:00Z");

  it("sorts actions by score descending", () => {
    const data: FrecencyData = {
      version: 1,
      actions: [
        createRecord("low", 1, 10),
        createRecord("high", 10, 0),
        createRecord("mid", 5, 3),
      ],
    };

    const sorted = sortByFrecency(["low", "mid", "high"], data, now);
    expect(sorted).toEqual(["high", "mid", "low"]);
  });

  it("preserves order for unscored actions", () => {
    const data: FrecencyData = {
      version: 1,
      actions: [createRecord("used", 5, 0)],
    };

    const sorted = sortByFrecency(["a", "b", "used", "c"], data, now);
    expect(sorted).toEqual(["used", "a", "b", "c"]);
  });

  it("handles empty frecency data", () => {
    const data = createEmptyData();
    const sorted = sortByFrecency(["a", "b", "c"], data, now);
    expect(sorted).toEqual(["a", "b", "c"]);
  });

  it("filters out actions with very low scores", () => {
    const data: FrecencyData = {
      version: 1,
      actions: [
        createRecord("ancient", 1, 100), // Decayed to near zero
        createRecord("recent", 2, 0),
      ],
    };

    const sorted = sortByFrecency(["ancient", "recent", "unused"], data, now);
    // "ancient" should be treated as unscored due to decay
    expect(sorted[0]).toBe("recent");
  });
});

// ── getTopActions tests ───────────────────────────────────────────

describe("getTopActions", () => {
  const now = new Date("2026-04-17T10:00:00Z");

  it("returns top N actions by score", () => {
    const data: FrecencyData = {
      version: 1,
      actions: [
        createRecord("a", 1, 10),
        createRecord("b", 10, 0),
        createRecord("c", 5, 3),
        createRecord("d", 3, 1),
      ],
    };

    const top = getTopActions(data, 2, now);
    expect(top).toHaveLength(2);
    expect(top[0]).toBe("b"); // Highest score
  });

  it("returns empty array for empty data", () => {
    const data = createEmptyData();
    expect(getTopActions(data, 3, now)).toEqual([]);
  });

  it("returns fewer than N if not enough scored actions", () => {
    const data: FrecencyData = {
      version: 1,
      actions: [createRecord("only", 1, 0)],
    };

    const top = getTopActions(data, 5, now);
    expect(top).toHaveLength(1);
  });
});

// ── pruneOldRecords tests ─────────────────────────────────────────

describe("pruneOldRecords", () => {
  const now = new Date("2026-04-17T10:00:00Z");

  it("removes records with decayed scores below threshold", () => {
    const data: FrecencyData = {
      version: 1,
      actions: [
        createRecord("recent", 5, 0),
        createRecord("ancient", 1, 100), // Should be pruned
      ],
    };

    const pruned = pruneOldRecords(data, now);
    expect(pruned.actions).toHaveLength(1);
    expect(pruned.actions[0].id).toBe("recent");
  });

  it("preserves frequently used old actions", () => {
    const data: FrecencyData = {
      version: 1,
      actions: [
        createRecord("frequent-old", 100, 30), // High count compensates for age
        createRecord("rare-old", 1, 30), // Low count + old = prune
      ],
    };

    const pruned = pruneOldRecords(data, now);
    expect(pruned.actions.some((a) => a.id === "frequent-old")).toBe(true);
  });
});

// ── createEmptyData tests ─────────────────────────────────────────

describe("createEmptyData", () => {
  it("returns valid empty structure", () => {
    const data = createEmptyData();
    expect(data.version).toBe(1);
    expect(data.actions).toEqual([]);
  });
});
