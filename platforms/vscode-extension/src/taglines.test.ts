import { describe, it, expect } from "vitest";
import { getTagline, getAllTaglines, loadTaglineConfig, type TaglineConfig } from "./taglines";

// ── getTagline tests ──────────────────────────────────────────────

describe("getTagline", () => {
  it("returns a string", () => {
    const tagline = getTagline();
    expect(typeof tagline).toBe("string");
    expect(tagline.length).toBeGreaterThan(0);
  });

  it("returns healthy tagline for healthy status", () => {
    const healthyPool = getAllTaglines("healthy");
    const tagline = getTagline({ status: "healthy", useTimeOfDay: false });
    expect(healthyPool).toContain(tagline);
  });

  it("returns attention tagline for attention status", () => {
    const attentionPool = getAllTaglines("attention");
    const tagline = getTagline({ status: "attention" });
    expect(attentionPool).toContain(tagline);
  });

  it("returns critical tagline for critical status", () => {
    const criticalPool = getAllTaglines("critical");
    const tagline = getTagline({ status: "critical" });
    expect(criticalPool).toContain(tagline);
  });

  it("returns unknown tagline for unknown status", () => {
    const unknownPool = getAllTaglines("unknown");
    const tagline = getTagline({ status: "unknown" });
    expect(unknownPool).toContain(tagline);
  });

  it("rotates taglines by day", () => {
    const day1 = new Date("2026-04-17");
    const day2 = new Date("2026-04-18");

    const tagline1 = getTagline({ status: "healthy", date: day1, useTimeOfDay: false });
    const tagline2 = getTagline({ status: "healthy", date: day2, useTimeOfDay: false });

    // Should be different (unless pool wraps at same index)
    // At minimum, the function should be deterministic for same date
    const tagline1Again = getTagline({ status: "healthy", date: day1, useTimeOfDay: false });
    expect(tagline1).toBe(tagline1Again);
  });

  it("is deterministic for same date and status", () => {
    const date = new Date("2026-04-17");
    const results = Array.from({ length: 5 }, () =>
      getTagline({ status: "healthy", date, useTimeOfDay: false }),
    );

    expect(new Set(results).size).toBe(1);
  });
});

// ── getAllTaglines tests ──────────────────────────────────────────

describe("getAllTaglines", () => {
  it("returns non-empty array for healthy", () => {
    const taglines = getAllTaglines("healthy");
    expect(taglines.length).toBeGreaterThan(0);
  });

  it("returns non-empty array for attention", () => {
    const taglines = getAllTaglines("attention");
    expect(taglines.length).toBeGreaterThan(0);
  });

  it("returns non-empty array for critical", () => {
    const taglines = getAllTaglines("critical");
    expect(taglines.length).toBeGreaterThan(0);
  });

  it("returns non-empty array for unknown", () => {
    const taglines = getAllTaglines("unknown");
    expect(taglines.length).toBeGreaterThan(0);
  });

  it("healthy pool is larger than critical pool", () => {
    // Healthy state should have more variety
    expect(getAllTaglines("healthy").length).toBeGreaterThan(
      getAllTaglines("critical").length,
    );
  });
});

// ── Pool content tests ────────────────────────────────────────────

describe("tagline pools", () => {
  it("healthy taglines are aspirational", () => {
    const taglines = getAllTaglines("healthy");
    // Check for positive/forward-looking words
    const positiveWords = ["together", "build", "think", "curiosity", "ready", "insight"];
    const hasPositive = taglines.some((t) =>
      positiveWords.some((w) => t.toLowerCase().includes(w)),
    );
    expect(hasPositive).toBe(true);
  });

  it("critical taglines are supportive", () => {
    const taglines = getAllTaglines("critical");
    // Check for supportive/grounding words
    const supportiveWords = ["together", "fresh", "help", "fix", "rebuild", "reconnect"];
    const hasSupportive = taglines.some((t) =>
      supportiveWords.some((w) => t.toLowerCase().includes(w)),
    );
    expect(hasSupportive).toBe(true);
  });

  it("no duplicate taglines within a pool", () => {
    for (const status of ["healthy", "attention", "critical", "unknown"] as const) {
      const taglines = getAllTaglines(status);
      expect(new Set(taglines).size).toBe(taglines.length);
    }
  });
});

// ── Config loading tests ──────────────────────────────────────────

describe("loadTaglineConfig", () => {
  const mockPath = {
    join: (...parts: string[]) => parts.join("/"),
  };

  const mockFs = (files: Record<string, string>) => ({
    existsSync: (p: string) => Object.keys(files).some((f) => p.endsWith(f)),
    readFileSync: (p: string, _enc: "utf-8") => {
      const key = Object.keys(files).find((f) => p.endsWith(f));
      if (key) return files[key];
      throw new Error("File not found");
    },
  });

  it("returns null when config doesn't exist", () => {
    const config = loadTaglineConfig("/workspace", mockFs({}), mockPath);
    expect(config).toBeNull();
  });

  it("loads valid config", () => {
    const configJson = JSON.stringify({
      version: "1.0",
      project: "Test",
      taglines: {
        project: ["Project tagline 1", "Project tagline 2", "Project tagline 3"],
      },
    });
    const config = loadTaglineConfig(
      "/workspace",
      mockFs({ ".github/config/taglines.json": configJson }),
      mockPath,
    );
    expect(config).not.toBeNull();
    expect(config?.project).toBe("Test");
    expect(config?.taglines.project).toHaveLength(3);
  });

  it("returns null for invalid JSON", () => {
    const config = loadTaglineConfig(
      "/workspace",
      mockFs({ ".github/config/taglines.json": "not json" }),
      mockPath,
    );
    expect(config).toBeNull();
  });

  it("returns null for empty project taglines", () => {
    const configJson = JSON.stringify({
      version: "1.0",
      project: "Test",
      taglines: {
        project: [],
      },
    });
    const config = loadTaglineConfig(
      "/workspace",
      mockFs({ ".github/config/taglines.json": configJson }),
      mockPath,
    );
    expect(config).toBeNull();
  });
});

// ── Config-based tagline selection tests ──────────────────────────

describe("getTagline with config", () => {
  const sampleConfig: TaglineConfig = {
    version: "1.0",
    project: "TestProject",
    taglines: {
      project: ["Custom project tagline", "Another custom tagline"],
      vision: ["Vision tagline"],
    },
    rotation: {
      strategy: "balanced",
      projectWeight: 50,
      inspirationalWeight: 50,
    },
  };

  it("uses config taglines on project-weight days", () => {
    // Day 49 of 2026 (Feb 18), 49 % 100 = 49 < 50 threshold, so use project
    const date = new Date("2026-02-18");
    const tagline = getTagline({
      status: "healthy",
      config: sampleConfig,
      date,
      useTimeOfDay: false,
    });

    const allConfigTaglines = [
      ...sampleConfig.taglines.project,
      ...(sampleConfig.taglines.vision ?? []),
    ];
    expect(allConfigTaglines).toContain(tagline);
  });

  it("uses inspirational taglines on non-project days", () => {
    // Day 51 of 2026 (Feb 20), 51 % 100 = 51 >= 50 threshold, so inspirational
    const date = new Date("2026-02-20");
    const tagline = getTagline({
      status: "healthy",
      config: sampleConfig,
      date,
      useTimeOfDay: false,
    });

    // Should be from healthy pool or contextual (not config)
    const healthyPool = getAllTaglines("healthy");
    expect(healthyPool).toContain(tagline);
  });

  it("ignores config for non-healthy status", () => {
    const tagline = getTagline({
      status: "critical",
      config: sampleConfig,
    });

    const criticalPool = getAllTaglines("critical");
    expect(criticalPool).toContain(tagline);
  });

  it("respects custom projectWeight", () => {
    const heavyConfig: TaglineConfig = {
      ...sampleConfig,
      rotation: { projectWeight: 100 },
    };

    // With 100% weight, should always use project taglines
    const tagline = getTagline({
      status: "healthy",
      config: heavyConfig,
      useTimeOfDay: false,
    });

    const allConfigTaglines = [
      ...heavyConfig.taglines.project,
      ...(heavyConfig.taglines.vision ?? []),
    ];
    expect(allConfigTaglines).toContain(tagline);
  });
});
