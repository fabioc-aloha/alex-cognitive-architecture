---
mode: agent
description: Run the meditation ritual — consolidate session learnings into permanent architecture (5 R's framework)
application: "When a session has surfaced new patterns, gotchas, or insights worth persisting"
tools: []
currency: 2026-04-26
---

# /meditate — Cognitive Consolidation

Walk the meditation ritual end-to-end. Read [`.github/skills/meditation/SKILL.md`](../skills/meditation/SKILL.md) first; that file is the spec. This prompt orchestrates execution, snapshot capture, and chronicle bookkeeping.

Create a TODO list for the steps below. Mark each in-progress before starting, completed immediately after finishing.

## Steps

1. **Pre-flight snapshot** — Run `node .github/muscles/meditation-snapshot.cjs --json` and read the result. If `overdue` is true, prioritize this session over deeper exploration. If a recent `dream-report.json` exists at `.github/quality/dream-report.json`, scan it for findings to address (per [`dream-state/SKILL.md`](../skills/dream-state/SKILL.md) §Escalation).

2. **Reflect** — Surface session learnings using the 5 R's: Recall, Reflect, Reconcile, Record, Resolve. Drive the conversation by asking the user 1-2 focused questions per R, not a script.

3. **Bookkeeping pass** — When the meditation surfaces config-level changes (assignment-log, knowledge-artifacts, unknowns, session-metrics), inspect those files only if they are non-empty; do NOT mass-prune. Manual curation only — automated pruning is a future trifecta.

4. **Author the chronicle** — Write `.github/episodic/meditation-YYYY-MM-DD-<short-slug>.md` capturing: trigger, key insights, persisted artifacts (paths), and follow-ups. The filename date IS the source of truth for `lastMeditation` (D7, v8.4.0).

5. **Refresh snapshot** — Run `node .github/muscles/meditation-snapshot.cjs` (no flag — this prunes to the newest 60 chronicles FIFO and rewrites `.github/quality/meditation-snapshot.json`).

6. **Resolve** — Close the meditation with the explicit summary from §Resolve in the meditation SKILL: list each persisted artifact, what changed, and any deferred follow-ups.

## Stop conditions

- User signals fatigue → wrap up with a quick Record + Resolve, skip optional welcome-experience check.
- No new connections after 3 reflection attempts → close the topic.
- Snapshot confirms a chronicle was just written today AND session has surfaced nothing new → meditation is not needed; suggest a different ritual instead.
