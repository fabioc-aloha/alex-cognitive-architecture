---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
model: claude-opus-4-6
description: "Force a frame audit on a stuck or repeating problem — restate, surface symptom→cause moves, and propose alternative framings"
application: "When a problem feels stuck, when a fix has failed twice, or when the user explicitly wants to step back"
tools: []
currency: 2026-04-26
---

# /reframe — Force a Frame Audit

Run the step-back protocol from `.github/skills/problem-framing-audit/SKILL.md` on the current problem. This prompt forces a frame audit even when the trigger conditions in the always-on instruction would not have fired.

## Process

Read [`.github/skills/problem-framing-audit/SKILL.md`](../skills/problem-framing-audit/SKILL.md) first. Then run **at least three** of the eight checks below — pick the three most likely to surface a different framing for this specific problem:

1. **Restate** in one sentence in your own words.
2. **Generalise** — what is this a special case of?
3. **Specialise** — what's the simplest concrete instance?
4. **Invert** — what would make this worse, or how would I cause this to fail?
5. **Five Whys** — recursively, why is this a problem?
6. **Pre-mortem** — imagine it's done and didn't work; what went wrong?
7. **Stakeholder** — whose problem is this really, and what outcome would tell *them* it's solved?
8. **Frame audit** — what other framings exist? At least two.

## Required Output

Produce these sections:

### 1. The literal frame

Restate the user's request as one sentence, using only words the user used.

### 2. My restatement

The same problem in *my* words. If this differs from §1 in kind (not just wording), the audit fires.

### 3. Symptom or cause?

Is the user's framing a *symptom* (fix the function, make it faster, stop the error) or a *cause* (why is the function called so often, why is this slow, why is this erroring)? If symptom, surface the cause underneath.

### 4. Alternative framings

List **at least two** other ways the problem could be framed. For each, name the kind of solution it would lead to.

### 5. Recommendation

Which framing is right? Why? What evidence would change that?

### 6. Falsifiability

What would tell us this reframe was wrong? (E.g., "If the cause-frame fix doesn't reduce X, then the symptom-frame was the real frame after all.")

## Output Markers

Use the markers from `problem-framing-audit/SKILL.md`:

- `**Frame**: ...`
- `**Cause-frame**: ...` (if symptom→cause move is real)
- `**Considered framings**: (a) X, (b) Y — going with X because ...`

## When NOT to Use This Prompt

- The task is mechanical (single-file edit, < 15 min, no architectural choice). The frame audit is friction without payoff.
- The user has already restated and is asking for execution. Audit was already done.
- The problem genuinely has one obvious frame and the user is clearly right. Run the audit anyway as a check — but if it produces no new framing, say so explicitly and proceed.

## User Input

Provide the stuck problem, the failed attempts (if any), and the user's current framing. The prompt audits *that* — not whatever the next step looks like.
