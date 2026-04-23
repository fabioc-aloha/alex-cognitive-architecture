---
name: meditation
description: "Knowledge consolidation — transform session learnings into permanent architecture"
tier: standard
disable-model-invocation: true
applyTo: '**/*meditat*,**/*reflect*,**/*consolidat*'
currency: 2026-04-22
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

After completing the 4 R's, optionally trigger a Dream diagnostic when:

- Architecture files were created or modified during this meditation
- Trifecta concerns surfaced during the session
- Last dream was >7 days ago
- Random (~1 in 5 meditations)

Dream produces the diagnostic report; meditation decides what to fix.

## The 4 R's — Facilitation Framework

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
