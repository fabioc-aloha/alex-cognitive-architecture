---
type: prompt
lifecycle: stable
description: Report → Validate → Approve loop for non-trivial refactors and architecture changes
mode: agent
application: "When a change spans multiple files / trifectas / executors and deserves explicit sign-off before it ships"
agent: Alex
currency: 2026-04-23
---

# /propose-change — Structured Change Proposal Loop

A lightweight governance ritual for changes that are too big for a single commit message
but too small for a full ADR. Produces a plain-text proposal the user can read, annotate
inline, and sign off on — then archives the artifact as a decision record.

This is **the Loop in action**: IDEATE (working notes) → PLAN (proposal) → BUILD (inline
resolutions) → TEST (critical thinking / falsifiability) → RELEASE (approval stamp) →
IMPROVE (archive + template reuse).

## When to Use

Invoke this when the change touches any of:

- A trifecta (skill + instruction + muscle) or multiple executors of the same contract
- Shared core modules that other surfaces mirror (e.g. TS mirrors of CJS cores)
- Upgrade, publish, sync, or release pipelines
- Anything with a non-obvious rollback path

Do **not** invoke for single-file edits, typo fixes, or clearly-scoped bug repairs.

## The Loop

### 1. Working notes (IDEATE)

Create `UPGRADE-PROCEDURE-WORKING-NOTES.txt` (or equivalent name for the change).
Dump raw thinking: the problem, candidate designs, discarded alternatives, known
unknowns. No structure required — this is scratch space.

### 2. Proposal (PLAN)

Create a sibling file: `<CHANGE>-PROPOSED.txt`. Use plain text, not markdown, so
the user can annotate inline with `A:` lines without worrying about formatting.

Required sections:

1. **Summary** — one paragraph, what changes and why
2. **Phase N** sections — numbered, exhaustive steps of the mechanical work
3. **Per-project / per-surface flow** — operator mental model
4. **Contract / invariants** — what must remain true after the change
5. **Critical thinking** — apply `critical-thinking.instructions.md`:
   - Alternative hypotheses considered and rejected
   - Open questions (Qn, prefixed for inline answers)
   - Residual risks (Rn) with mitigation candidates
   - Falsifiability tests — how we'd know this design is wrong
6. **Approval checklist** — numbered `[ ]` items the user ticks to sign off
7. **On approval** — what the agent will do once signed off (rename working
   notes to `.superseded.txt`, propagate resolutions, etc.)

### 3. User annotation (BUILD)

User opens the proposal and adds `A:` lines inline under each Qn / Rn they want
to resolve. Silence = "accepted as residual risk, revisit later."

### 4. Agent closeout (TEST + RELEASE)

When the user signals approval (even as terse as "all answered"):

1. **Read §8 verbatim** before editing — do not trust summary memory for
   resolutions (users answer inline with context that matters)
2. Propagate each A: answer to its proper home:
   - Documentation advisories → SKILL.md Hard Rules
   - Automated checks → preflight scripts
   - New defaults → config or shared cores
3. Fix any drift the resolutions reveal (if A2 says "add a parity check", the
   check will almost always fail on its first run — that is the point)
4. Tick remaining `[ ]` boxes and stamp status: `APPROVED <date>`
5. Ask the user the final yes/no questions flagged in §9 (e.g. rename working
   notes file?)

### 5. Archive (IMPROVE)

Move approved proposals to `master-wiki/decisions/change-proposals/` and rename
the working notes to `.superseded.txt`. These become reference examples for
future proposals.

## Hard Rules

1. **Plain text, not markdown.** Users annotate inline; markdown rendering
   hides the annotations in preview.
2. **Never summarize the user's answers — read them verbatim.** Compaction and
   summaries drop nuance that the user explicitly typed.
3. **The parity check you add will catch real drift.** Expect it. Fix it in
   the same closeout.
4. **Silence is acceptance, not consent to change behavior.** If a risk has no
   `A:` line, accept it as residual and note it in the approval stamp.
5. **One proposal, one approval.** Do not stack multiple approvals in the same
   document — new change, new file.

## Reference Examples

See `master-wiki/decisions/change-proposals/` for worked examples:

- `brain-upgrade-v8.3/` — trifecta refactor with shared core + TS mirror +
  version-stamp migration (2026-04-23)

## Template

Start new proposals from:

```text
master-wiki/decisions/change-proposals/TEMPLATE.txt
```
