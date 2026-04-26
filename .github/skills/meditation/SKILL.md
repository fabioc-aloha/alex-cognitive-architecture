---
name: meditation
description: "Knowledge consolidation — transform session learnings into permanent architecture"
tier: standard
disable-model-invocation: true
applyTo: '**/*meditat*,**/*reflect*,**/*consolidat*'
currency: 2026-04-25
---

# Meditation Skill

Domain knowledge for guided knowledge consolidation sessions.

## When to Use

- User says "meditate", "consolidate", or "reflect"
- After learning sessions to persist insights
- When working memory feels overloaded (7+ unrecorded insights)
- After breakthroughs that need permanent storage

## Meditation as Foundational Ritual

Meditation is the primary cognitive ritual. All other rituals are subordinate:

| Ritual | Relationship to Meditation |
|---|---|
| **Dream** | Diagnostic tool — chains after meditation sometimes |
| **Self-Actualize** | Deep meditation — monthly, includes Dream baseline first |

### Dream Chaining

After completing the 5 R's, optionally trigger a Dream diagnostic when:

- Architecture files were created or modified during this meditation
- Trifecta concerns surfaced during the session
- Last dream was >7 days ago
- Random (~1 in 5 meditations)

Dream produces the diagnostic report; meditation decides what to fix.

### Consuming Dream Findings

The inverse handoff also exists: a meditation may *open* by reading an existing `dream-report.json` and using it to focus the session. See `dream-state/SKILL.md` §Escalation for the finding→resolution mapping. This pattern replaces the former lucid-dream ritual (retired v8.4.0).

## The 5 R's — Facilitation Framework

Review → Relate → Reinforce → Record → Resolve. The first four discover and persist; Resolve closes the meditation explicitly so the user knows what was saved and whether a dream follows.

### Review — What happened?

- List concrete actions (files created, bugs fixed, features added)
- Identify surprising discoveries or unexpected connections
- Note what was harder or easier than expected
- If the review is all "I did X" with no reflection, it's too shallow

### Relate — How does this connect?

- Which existing skills/instructions does this touch?
- Cross-project patterns? → `/memories/` candidate
- Gaps revealed in the architecture?
- At least one connection, or explicitly note "isolated learning"

### Reinforce — What's worth keeping?

| Signal | Keep? | Where |
|---|---|---|
| "I'll forget this by next week" | Yes | `.instructions.md` or `SKILL.md` |
| "This was non-obvious" | Yes | `/memories/` or `/memories/repo/` |
| "I keep rediscovering this" | Definitely | `.instructions.md` (procedural) |
| "This was specific to today" | No | Session memory only |
| "Everyone knows this" | No | Don't store |

### Record — Persist to the right place

| Type | Location |
|---|---|
| Repeatable process | `.github/instructions/*.instructions.md` |
| Domain expertise | `.github/skills/*/SKILL.md` |
| Workflow template | `.github/prompts/*.prompt.md` |
| Cross-project pattern | `/memories/` (user memory) |
| Repo-specific fact | `/memories/repo/` (repo memory) |
| Active multi-session task | `/memories/session/` (conversation-scoped) |
| Long-term chronicle entry | `.github/episodic/meditation-YYYY-MM-DD-{topic}.md` |

#### Episodic Memory (chronicle log)

`.github/episodic/` is the project's long-term meditation/dream chronicle. Write an entry when:

- The meditation produced multiple insights worth narrating in one place
- The session marks a phase transition (project pivot, breakthrough, completed milestone)
- A dream chained from this meditation (save as `dream-report-YYYY-MM-DD.md`)

File naming:

- `meditation-YYYY-MM-DD-{topic-slug}.md` — meditation chronicle
- `dream-report-YYYY-MM-DD.md` — dream diagnostic output
- `chronicle-YYYY-MM-DD-{name}.md` — major milestone narrative

If `.github/episodic/` does not exist, create it. The folder is heir-portable.

Distinction from `/memories/session/`: episodic = permanent, project-scoped narrative; session = ephemeral, conversation-scoped state.

### Welcome Experience Check (optional, during Record)

After recording insights, assess whether the welcome experience still fits:

| Question | If drifted | Config to update |
|----------|-----------|-----------------|
| Do taglines still reflect the project direction? | Regenerate | `.github/config/taglines.json` |
| Does the loop menu match actual workflows? | Add/remove groups | `.github/config/loop-menu.json` |
| Has the project phase changed? | Update phase | `loop-menu.json` → `projectPhase` |
| Is the identity/persona still accurate? | Revise identity layer | `.github/copilot-instructions.md` |
| Does the North Star still inspire? | Refresh vision | `NORTH-STAR.md` |

Trigger: Run this check when meditation surfaces project evolution, phase transitions, or domain pivots. Use the `welcome-experience-customization` skill for the full workflow.

**Heir fallback:** If `taglines.json` or `loop-menu.json` does not exist, skip this check — the project hasn't run welcome customization yet. Suggest it only if the user explicitly asks about welcome experience.

### Resolve — Close the meditation

The 5th R closes the loop. Without it, meditations end ambiguously and the user is left wondering "did anything get saved?"

**Required close steps:**

1. **Summarize persisted artifacts** — list each file written/modified in this meditation, one line each:

   ```text
   Persisted:
   - .github/instructions/foo.instructions.md (new — captures X pattern)
   - /memories/patterns.md (added Y rule)
   - .github/episodic/meditation-2026-04-25-bar.md (chronicle)
   ```

2. **Evaluate dream chaining** — explicitly check the criteria (see Dream Chaining section above):

   - Architecture files modified? → favor chaining
   - Trifecta concerns surfaced? → favor chaining
   - Last dream >7 days ago (or never)? → favor chaining
   - **Heir fallback:** if `.github/quality/dream-report.json` does not exist, treat as never-dreamed (overdue). The file is created on first `/dream` run.

   State the verdict: "Chaining a dream now" / "Skipping dream — none of the criteria fired" / "Bookmarking dream for later".

3. **One-line session summary** — close with what changed: *"Meditation persisted 3 insights across 2 surfaces; no dream needed."*

After Resolve, the meditation is complete. Do not continue probing.

## Facilitation Techniques

### Socratic Probing

Don't just list — ask *why* it matters:

- "What would you do differently next time?"
- "Is this a one-time fix or a recurring pattern?"
- "If you saw this in another project, would you recognize it?"

### Diminishing Returns

| Signal | Action |
|---|---|
| Repeating the same insight differently | Move on |
| No new connections after 3 attempts | Close topic |
| User energy dropping | Wrap up with quick record |
| Tangent detected | Bookmark for separate session |

### Depth Calibration

- **Too shallow**: "I learned about testing" → probe for specifics
- **Right depth**: "Property-based testing caught an edge case our unit tests missed because..."
- **Too deep**: 30 minutes on one function → zoom out to pattern level

## Snapshot Muscle (`meditation-snapshot.cjs`)

Path B (v8.4.0): chronicle files in `.github/episodic/meditation-YYYY-MM-DD-*.md` are the canonical record of when meditation last happened. The `meditation-snapshot.cjs` muscle scans them, derives the date from each filename (mtimes are unreliable across bulk git operations), and writes `.github/quality/meditation-snapshot.json`.

`session-start.cjs` reads this snapshot to decide whether to surface the "meditation overdue" nag — replacing the hand-edited `cogConfig.lastMeditation` field, which is now a fallback only.

| Field | Source |
|---|---|
| `lastMeditation` | `YYYY-MM-DD` from newest matching filename |
| `lastMeditationFile` | Workspace-relative path |
| `daysSinceLastMeditation` | Computed from `lastMeditation` |
| `overdue` | `daysSinceLastMeditation >= 7` |
| `chronicleCount` | Total matching chronicles |
| `cadence.last30Days` / `last90Days` | Trailing-window counts |
| `pruneThreshold` | `60` (D17) |

Run after authoring a new chronicle:

```pwsh
node .github/muscles/meditation-snapshot.cjs
```

The muscle prunes the episodic directory to the newest **60** chronicles (FIFO) on each non-`--json` run. Older chronicles remain in git history; meditation's job is to produce new insight, not to curate the archive.

## Bookkeeping Surfaces

Four config files reference meditation as their lifecycle owner. The current honest state (v8.4.0):

| File | Claim | Status |
|---|---|---|
| `.github/config/assignment-log.json` | "Meditation analyzes for routing patterns" | AFCP feature; pruning not yet automated. Manually inspect during meditation when the log has entries. |
| `.github/config/knowledge-artifacts.json` | "Meditation prunes artifacts older than 90 days with confidence < 0.5" | Future trifecta — see `PLAN-meditation-ritual-refactor.md`. Manually curate during meditation for now. |
| `.github/config/unknowns.json` | "Unknowns with state=resolved are pruned during meditation" | Manual curation during meditation. No automated pruning today. |
| `.github/config/session-metrics.json` | "Session tracking for meditation analysis" | Gitignored local file; analyze in-session if useful. |

When meditating, scan these files only if they are non-empty.

