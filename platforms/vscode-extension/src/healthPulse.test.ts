import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock settings (depends on vscode)
vi.mock("./settings.js", () => ({
  dreamOverdueCriticalDays: () => 14,
  dreamStaleAttentionDays: () => 7,
  syncStaleCriticalDays: () => 3,
  syncStaleDays: () => 7,
}));

import {
  HealthPulse,
  HealthStatus,
  computeHealthStatus,
  formatRelativeTime,
  formatInventory,
  statusDotColor,
  statusLabel,
} from "./healthPulse";

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

// ── computeHealthStatus tests ─────────────────────────────────────

describe("computeHealthStatus", () => {
  describe("critical conditions", () => {
    it("returns critical when syncStale and dream > 3 days old", () => {
      const pulse = createBasePulse({
        syncStale: true,
        lastDreamDate: daysAgo(4),
      });
      expect(computeHealthStatus(pulse)).toBe("critical");
    });

    it("returns critical when dreamNeeded and dream > 14 days old", () => {
      const pulse = createBasePulse({
        dreamNeeded: true,
        lastDreamDate: daysAgo(15),
      });
      expect(computeHealthStatus(pulse)).toBe("critical");
    });

    it("returns critical when dreamNeeded and no dream ever", () => {
      const pulse = createBasePulse({
        dreamNeeded: true,
        lastDreamDate: null,
      });
      expect(computeHealthStatus(pulse)).toBe("critical");
    });
  });

  describe("attention conditions", () => {
    it("returns attention when dreamNeeded is true (even if recent)", () => {
      const pulse = createBasePulse({
        dreamNeeded: true,
        lastDreamDate: new Date(),
      });
      expect(computeHealthStatus(pulse)).toBe("attention");
    });

    it("returns attention when dream > 7 days old", () => {
      const pulse = createBasePulse({
        lastDreamDate: daysAgo(8),
      });
      expect(computeHealthStatus(pulse)).toBe("attention");
    });

    it("returns attention when syncStale (but dream recent)", () => {
      const pulse = createBasePulse({
        syncStale: true,
        lastDreamDate: new Date(),
      });
      expect(computeHealthStatus(pulse)).toBe("attention");
    });
  });

  describe("healthy conditions", () => {
    it("returns healthy when all conditions are good", () => {
      const pulse = createBasePulse();
      expect(computeHealthStatus(pulse)).toBe("healthy");
    });

    it("returns healthy with dream exactly 7 days ago", () => {
      const pulse = createBasePulse({ lastDreamDate: daysAgo(7) });
      expect(computeHealthStatus(pulse)).toBe("healthy");
    });
  });

  describe("priority order", () => {
    it("critical takes precedence over attention (stale sync)", () => {
      const pulse = createBasePulse({
        syncStale: true,
        lastDreamDate: daysAgo(10),
        dreamNeeded: true,
      });
      expect(computeHealthStatus(pulse)).toBe("critical");
    });
  });
});

// ── formatRelativeTime tests ──────────────────────────────────────

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Never' for null date", () => {
    expect(formatRelativeTime(null)).toBe("Never");
  });

  it("returns 'Today' for same day", () => {
    const today = new Date("2026-04-17T05:00:00Z");
    expect(formatRelativeTime(today)).toBe("Today");
  });

  it("returns 'Yesterday' for 1 day ago", () => {
    const yesterday = new Date("2026-04-16T10:00:00Z");
    expect(formatRelativeTime(yesterday)).toBe("Yesterday");
  });

  it("returns 'X days ago' for 2-29 days", () => {
    const fiveDaysAgo = new Date("2026-04-12T10:00:00Z");
    expect(formatRelativeTime(fiveDaysAgo)).toBe("5 days ago");
  });

  it("returns '1 month ago' for 30-59 days", () => {
    const thirtyDaysAgo = new Date("2026-03-18T10:00:00Z");
    expect(formatRelativeTime(thirtyDaysAgo)).toBe("1 month ago");
  });

  it("returns 'X months ago' for 60+ days", () => {
    const ninetyDaysAgo = new Date("2026-01-17T10:00:00Z");
    expect(formatRelativeTime(ninetyDaysAgo)).toBe("3 months ago");
  });
});

// ── formatInventory tests ─────────────────────────────────────────

describe("formatInventory", () => {
  it("formats all four counts", () => {
    const pulse = createBasePulse({
      skillCount: 188,
      instructionCount: 145,
      promptCount: 60,
      agentCount: 22,
    });
    expect(formatInventory(pulse)).toBe(
      "188 skills · 145 instructions · 60 prompts · 22 agents",
    );
  });

  it("handles zero counts", () => {
    const pulse = createBasePulse({
      skillCount: 0,
      instructionCount: 0,
      promptCount: 0,
      agentCount: 0,
    });
    expect(formatInventory(pulse)).toBe(
      "0 skills · 0 instructions · 0 prompts · 0 agents",
    );
  });
});

// ── statusDotColor tests ──────────────────────────────────────────

describe("statusDotColor", () => {
  it("returns green for healthy", () => {
    expect(statusDotColor("healthy")).toBe("#22c55e");
  });

  it("returns amber for attention", () => {
    expect(statusDotColor("attention")).toBe("#eab308");
  });

  it("returns red for critical", () => {
    expect(statusDotColor("critical")).toBe("#ef4444");
  });
});

// ── statusLabel tests ─────────────────────────────────────────────

describe("statusLabel", () => {
  it("returns '✓ Healthy' for healthy status", () => {
    expect(statusLabel("healthy")).toBe("✓ Healthy");
  });

  it("returns '⚠ Needs Attention' for attention status", () => {
    expect(statusLabel("attention")).toBe("⚠ Needs Attention");
  });

  it("returns '✗ Critical' for critical status", () => {
    expect(statusLabel("critical")).toBe("✗ Critical");
  });
});
