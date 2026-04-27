---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
model: claude-opus-4-6
description: "Run a full ACT pass on a specific decision — Materiality, Hypothesise, Alternatives, Disconfirmers, Audit-priors, Severity, Commit"
application: "When you want to force a structured Artificial Critical Thinking pass on a decision before committing, especially for medium and high stakes work"
tools: []
currency: 2026-04-26
---

# /act-pass — Run the 7-Step ACT Pass

Run the full Artificial Critical Thinking pass on the decision the user names. Do not trim — even on medium-stakes work, the explicit invocation of `/act-pass` means the user wants every step.

## Process

Read [`.github/skills/act-pass/SKILL.md`](../skills/act-pass/SKILL.md) first to load the step definitions and visible-marker cheat sheet. Then walk all 7 steps below in order, leaving visible markers as you go.

## Required Output Sections

Produce exactly these seven sections, in this order. Each section's marker must carry real content — performative markers without grounding violate Tenet IX.

### 1. Materiality

State the stakes plainly:

- **Decision being passed**: what is being decided?
- **Cost of being wrong**: what does a wrong answer cost (time, trust, irreversibility)?
- **Intensity tag**: low / medium / high

If intensity is low, stop here and report *"Materiality Gate exits — low stakes, no pass needed."* Otherwise continue.

### 2. Hypothesise the Ask

Restate the user's request as a testable claim:

`**H1**: <restated claim with truth conditions>`

This is the frame audit (Discipline -1) embedded in the pass. The literal request is rarely the hypothesis — extract the underlying intent and make it falsifiable.

### 3. Surface Alternatives

At least one rival hypothesis with grounding (Two-Hypothesis Floor):

`**H2**: <alternative claim> because <specific reason or evidence>`

For high-stakes passes, surface 2–3 alternatives. Each must cite a *specific* reason (because / given), not a generic "could also be."

### 4. Identify Disconfirmers

For each hypothesis from steps 2 and 3:

`**Disconfirmer for H1**: <observation that would force revision>`
`**Disconfirmer for H2**: <observation that would force revision>`

If you cannot name a disconfirmer for H1, H1 is unfalsifiable — restate it or retire it before continuing.

### 5. Audit Priors

Split the evidence supporting H1:

`**Evidence split**: <X> from the request itself, <Y> from independent sources (logs, code, prior session, domain knowledge, fleet data)`

If 100% of support is "from the request", system-prompt skepticism (Tenet IV) fires — say so explicitly.

### 6. Severity Check

The adversarial self-probe:

`**Severity**: If H1 is false, my plan would reveal it because <X>` — *or* — `**Severity**: My plan does not test H1; this is a known weakness because <Y>`

A plan that succeeds silently under the wrong hypothesis is decorative. If yours does, redesign or flag the gap.

### 7. Commit with Marker

The visible commitment:

`**Going with H1**: <action>. Would revise if: <specific evidence, named in advance>`

Do not hedge. Commit. But pair the commit with a named falsifier — "if profiler shows GC pressure" not "if new data emerges".

## Constraints

- **No internal-only reasoning.** All seven markers appear in the response.
- **No performative alternatives.** If H2 has no grounding, omit step 3 and report *"unable to surface a grounded alternative — this is a single-hypothesis decision."*
- **Commit at step 7.** Pyrrhonian regress (doubt as stance) fails the pass.
- **No post-hoc passes.** If the action has already been taken, do not run a pass to justify it — run a retrospective instead.

## When This Prompt Is Useful

- A release decision (full pass mandatory)
- An architectural choice with downstream cost
- A "should we" or "is this safe" question from the user
- A second attempt at a fix that failed once already
- Any irreversible operation
