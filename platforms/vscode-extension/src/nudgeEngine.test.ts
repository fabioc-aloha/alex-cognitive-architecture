import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock settings (depends on vscode)
vi.mock("./settings.js", () => ({
  dreamOverdueCriticalDays: () => 14,
  dreamStaleAttentionDays: () => 7,
  syncStaleCriticalDays: () => 3,
}));

import type { HealthPulse } from "./healthPulse";
import {
  generateNudges,
  getPrimaryNudge,
  hasCriticalNudges,
  nudgeColor,
  type Nudge,
} from "./nudgeEngine";

// ── Test helpers ──────────────────────────────────────────────────

function createBasePulse(overrides: Partial<HealthPulse> = {}): HealthPulse {
  const now = new Date();
  return {
    status: "healthy",
    skillCount: 50,
    instructionCount: 30,
    promptCount: 20,
    agentCount: 5,
    lastDreamDate: now,
    dreamNeeded: false,
    syncStale: false,
    uncommittedFileCount: 0,
    uncommittedDays: 0,
    ...overrides,
  };
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ── generateNudges tests ──────────────────────────────────────────

describe("generateNudges", () => {
  describe("critical nudges", () => {
    it("generates no-dream-baseline nudge when no dream ever run", () => {
      const pulse = createBasePulse({ lastDreamDate: null });
      const nudges = generateNudges(pulse);

      expect(nudges[0]).toMatchObject({
        id: "no-dream-baseline",
        priority: "critical",
      });
    });

    it("generates dream-overdue-critical when dreamNeeded and >14 days", () => {
      const pulse = createBasePulse({
        dreamNeeded: true,
        lastDreamDate: daysAgo(15),
      });
      const nudges = generateNudges(pulse);

      expect(nudges[0]).toMatchObject({
        id: "dream-overdue-critical",
        priority: "critical",
      });
      expect(nudges[0].message).toContain("15 days");
    });

    it("generates sync-stale-critical when syncStale and dream >3 days", () => {
      const pulse = createBasePulse({
        syncStale: true,
        lastDreamDate: daysAgo(5),
      });
      const nudges = generateNudges(pulse);

      expect(nudges[0]).toMatchObject({
        id: "sync-stale-critical",
        priority: "critical",
      });
    });
  });

  describe("high priority nudges", () => {
    it("generates dream-needed nudge when issues detected", () => {
      const pulse = createBasePulse({
        dreamNeeded: true,
        lastDreamDate: daysAgo(3),
      });
      const nudges = generateNudges(pulse);

      expect(nudges.some((n) => n.id === "dream-needed")).toBe(true);
      const nudge = nudges.find((n) => n.id === "dream-needed");
      expect(nudge?.priority).toBe("high");
    });

    it("generates dream-stale nudge when >7 days without issues", () => {
      const pulse = createBasePulse({
        dreamNeeded: false,
        lastDreamDate: daysAgo(10),
      });
      const nudges = generateNudges(pulse);

      expect(nudges.some((n) => n.id === "dream-stale")).toBe(true);
      const nudge = nudges.find((n) => n.id === "dream-stale");
      expect(nudge?.priority).toBe("high");
      expect(nudge?.message).toContain("10 days");
    });
  });

  describe("medium priority nudges", () => {
    it("generates sync-stale nudge when stale but dream recent", () => {
      const pulse = createBasePulse({
        syncStale: true,
        lastDreamDate: daysAgo(1),
      });
      const nudges = generateNudges(pulse);

      expect(nudges.some((n) => n.id === "sync-stale")).toBe(true);
      const nudge = nudges.find((n) => n.id === "sync-stale");
      expect(nudge?.priority).toBe("medium");
    });
  });

  describe("low priority nudges", () => {
    it("generates healthy-status nudge when all is well", () => {
      const pulse = createBasePulse();
      const nudges = generateNudges(pulse);

      expect(nudges.some((n) => n.id === "healthy-status")).toBe(true);
      const nudge = nudges.find((n) => n.id === "healthy-status");
      expect(nudge?.priority).toBe("low");
    });
  });

  describe("priority ordering", () => {
    it("returns critical nudges before high", () => {
      const pulse = createBasePulse({
        lastDreamDate: null, // critical: no-dream-baseline
        dreamNeeded: true,
      });
      const nudges = generateNudges(pulse);

      expect(nudges[0].priority).toBe("critical");
    });

    it("returns high nudges before medium", () => {
      const pulse = createBasePulse({
        dreamNeeded: true, // high
        lastDreamDate: daysAgo(3),
        syncStale: true, // medium (dream recent enough)
      });
      const nudges = generateNudges(pulse);

      expect(nudges[0].priority).toBe("high");
    });
  });

  describe("maxNudges limit", () => {
    it("respects maxNudges parameter", () => {
      const pulse = createBasePulse({
        syncStale: true,
        lastDreamDate: daysAgo(5), // triggers sync-stale-critical + dream-stale
      });

      expect(generateNudges(pulse, 1)).toHaveLength(1);
    });

    it("defaults to 3 nudges", () => {
      const pulse = createBasePulse({
        syncStale: true,
        lastDreamDate: daysAgo(5),
      });

      const nudges = generateNudges(pulse);
      expect(nudges.length).toBeLessThanOrEqual(3);
    });
  });
});

// ── getPrimaryNudge tests ─────────────────────────────────────────

describe("getPrimaryNudge", () => {
  it("returns the highest priority nudge", () => {
    const pulse = createBasePulse({
      lastDreamDate: null, // critical
      dreamNeeded: true,
    });

    const nudge = getPrimaryNudge(pulse);
    expect(nudge?.priority).toBe("critical");
  });

  it("returns a nudge for healthy pulse", () => {
    const pulse = createBasePulse();
    const nudge = getPrimaryNudge(pulse);
    expect(nudge).not.toBeNull();
  });
});

// ── hasCriticalNudges tests ───────────────────────────────────────

describe("hasCriticalNudges", () => {
  it("returns true for no-dream-baseline", () => {
    const pulse = createBasePulse({ lastDreamDate: null });
    expect(hasCriticalNudges(pulse)).toBe(true);
  });

  it("returns false when no critical nudges", () => {
    const pulse = createBasePulse();
    expect(hasCriticalNudges(pulse)).toBe(false);
  });

  it("returns true for dream overdue with issues", () => {
    const pulse = createBasePulse({
      dreamNeeded: true,
      lastDreamDate: daysAgo(15),
    });
    expect(hasCriticalNudges(pulse)).toBe(true);
  });
});

// ── nudgeColor tests ──────────────────────────────────────────────

describe("nudgeColor", () => {
  it("returns red for critical", () => {
    expect(nudgeColor("critical")).toBe("#ef4444");
  });

  it("returns amber for high", () => {
    expect(nudgeColor("high")).toBe("#eab308");
  });

  it("returns blue for medium", () => {
    expect(nudgeColor("medium")).toBe("#3b82f6");
  });

  it("returns green for low", () => {
    expect(nudgeColor("low")).toBe("#22c55e");
  });
});
