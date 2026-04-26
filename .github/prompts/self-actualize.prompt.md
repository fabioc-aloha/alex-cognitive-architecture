---
type: prompt
lifecycle: stable
description: "Run a comprehensive self-actualization session — the deep monthly meditation that grades architecture across 6 dimensions and produces a chronicle with prioritized action plan"
application: "Monthly cadence, or on-demand when architecture feels off; runs the snapshot muscle for mechanical inputs and applies LLM judgment for depth"
mode: agent
tools: []
currency: 2026-04-26
---

# /self-actualize

> Comprehensive cognitive self-assessment. Mechanical inputs from the muscle, honest judgment from you.

The snapshot muscle (`.github/muscles/self-actualization-snapshot.cjs`) gathers the counts and samples; this prompt orchestrates the LLM-judged dimensions and writes the chronicle. Spec: `.github/skills/self-actualization/SKILL.md`.

## Pre-flight

| Step | Action |
|---|---|
| 1 | Run `node .github/muscles/self-actualization-snapshot.cjs` |
| 2 | Read `.github/quality/self-actualization-snapshot.json` |
| 3 | If `dimensions.structuralIntegrity.dreamAvailable === false` OR `dreamStale === true`, recommend running `/dream` first (decoupled per D8 — you may proceed without it, but dim 1 will be unscored) |
| 4 | If `recency.daysSinceLastSelfActualization < 30` and not user-requested, suggest meditation instead — self-actualization is the monthly variant |

## Six-Dimension Assessment

Apply the rubric in `self-actualization/SKILL.md` §Assessment Dimensions. The snapshot gives you the inputs; you do the grading.

### Dim 1 — Structural Integrity (mechanical, from dream)

| Snapshot field | Meaning |
|---|---|
| `dreamAvailable` | If `false`, mark dim 1 as N/A and proceed |
| `brokenRefs` | Count of broken cross-references |
| `trifectaIssues` | Count of orphan skills / incomplete trifectas |
| `health` | Dream's overall verdict (`healthy` / `needs-attention`) |

Score 1–5: 5 = 0 broken refs and 0 trifecta issues; 1 = pervasive issues or `unhealthy`.

### Dim 2 — Memory Balance (mechanical, LLM interprets)

| Snapshot field | Meaning |
|---|---|
| `ratio.P / ratio.E / ratio.D` | Procedural / Episodic / Domain mix |
| `instructions / skills / prompts / episodic / agents` | Raw counts |

Compare against maturity targets (SKILL §Memory Balance). Score 1–5 based on distance from target ratio. Note imbalance signals (procedural-heavy = "knows how but not what", etc.).

### Dim 3 — Knowledge Depth (LLM-judged from sample)

The snapshot gives you `samples[]` — the smallest N skills (deterministic). For each:

1. Read the SKILL.md file at the relative path
2. Classify per SKILL §Knowledge Depth: **Deep** / **Adequate** / **Shallow** / **Empty shell**
3. Watch for the **capabilities-list anti-pattern** ("Expert in X. Capabilities: validate, detect, assess...")

Score 1–5: 5 = all sampled skills Deep; 1 = mostly Shallow or Empty shell.

### Dim 4 — Connection Density (mechanical, LLM interprets)

| Snapshot field | Meaning |
|---|---|
| `avgPatternsPerSkill` | Healthy: 3–6 |
| `orphanSkills` | Skills with no `applyTo` patterns |
| `hubSkills` | Skills with > 8 patterns (potential over-centralization) |

Score 1–5 based on average + orphan/hub balance.

### Dim 5 — Trifecta Completeness (from dream)

If `trifectaIssueCount` is available, use it. Otherwise note that a quick trifecta scan is recommended. Score 1–5 based on issue density relative to total skills.

### Dim 6 — Growth Trajectory (from snapshot diff)

| Snapshot field | Meaning |
|---|---|
| `priorAvailable` | If `false`, mark as "first snapshot — baseline established" |
| `diff.skills.delta`, `.instructions.delta`, etc. | Net change vs prior snapshot |

Healthy: positive deltas across skills + instructions. Warning: episodic-only growth (consolidation debt).

## Compute Overall Score

Use the weighted rubric in `self-actualization/SKILL.md` §Scoring Guide. Round to one decimal. Verdict:

| Overall | Verdict |
|---|---|
| ≥ 4.0 | Healthy |
| 3.0–4.0 | Needs attention |
| < 3.0 | Urgent |

## Prioritize Top 3–5 Improvements

Rank by impact (not effort). For each, assign a session type:

- **Quick fix** — single-file edit, < 30 min
- **Deep dive** — sustained focus, 1–3 hours
- **Trifecta build** — full skill + instruction + (optional) prompt creation

## Author the Chronicle

Write `.github/episodic/self-actualization-YYYY-MM-DD.md` with:

```markdown
# Self-Actualization — YYYY-MM-DD

## Snapshot
- Last self-actualization: <date> (<N>d ago)
- Inventory: <S>S / <I>I / <P>P / <E>E / <A>A
- Memory ratio P/E/D: <P>/<E>/<D>
- Dream baseline: <available|unavailable> (<health>)

## Dimension Scores
| Dim | Score | Notes |
|---|---|---|
| 1. Structural Integrity | X/5 | <evidence from dream> |
| 2. Memory Balance | X/5 | <how the ratio compares to maturity target> |
| 3. Knowledge Depth | X/5 | <which sampled skills were Deep/Shallow> |
| 4. Connection Density | X/5 | <avg, orphan/hub findings> |
| 5. Trifecta Completeness | X/5 | <issue density> |
| 6. Growth Trajectory | X/5 | <delta narrative or "baseline"> |

**Overall**: X.X / 5.0 — <verdict>

## Top Improvements (prioritized)
1. <Improvement> — <session type> — <why this matters>
2. ...

## Session Outcome
- Tests: <passing|failing|not-run>
- Build: <clean|errors>
- Files modified: <count>
```

## Bookkeeping

| Step | Action |
|---|---|
| 1 | Set `cogConfig.lastSelfActualization` to today's date (D12). The snapshot will pick up the chronicle filename automatically next run, but the cogConfig field provides a fallback for heir consumers and pre-snapshot environments. |
| 2 | Re-run `node .github/muscles/self-actualization-snapshot.cjs` so the snapshot reflects the new `lastSelfActualization` date and the next run's `growthTrajectory.priorAvailable` is `true`. |
| 3 | Stage the chronicle (`git add .github/episodic/self-actualization-*.md` and `cognitive-config.json`). The snapshot itself is gitignored (D13). |

## Stop Conditions

- Fatigue — partial assessment is better than rushed grading; mark unfinished dimensions as "deferred" in the chronicle
- Dream unavailable AND user declines to run `/dream` first — do dims 2/3/4/6 only, mark 1/5 as N/A
- Snapshot stale (regenerated > 1h ago in the same session) — refresh before writing the chronicle

## Cross-references

- [self-actualization/SKILL.md](../skills/self-actualization/SKILL.md) — full rubric and dimension definitions
- [meditation/SKILL.md](../skills/meditation/SKILL.md) — relationship between rituals; the 5 R's are still the bookkeeping surface
- [dream-state/SKILL.md](../skills/dream-state/SKILL.md) — diagnostic input when dim 1 needs evidence
