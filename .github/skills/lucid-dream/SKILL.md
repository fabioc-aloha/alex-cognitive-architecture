---
name: "lucid-dream"
description: "Hybrid dream-meditation protocol — conscious decisions during automated processing"
applyTo: '**/*lucid*,**/*dual-mode*,**/*bridge*'
disable-model-invocation: true
---

# Lucid Dream Skill

Conscious intervention during automated dream processing. When dream diagnostics find ambiguous issues that pure automation cannot resolve, lucid dream bridges to interactive decision-making.

## When to Use

- Dream report has findings marked "requires judgment"
- Two skills overlap and one should absorb the other
- A skill is flagged as shallow — needs enrichment or removal
- Architecture restructuring is recommended by dream diagnostics

## Lucid vs Dream vs Meditation

| | Dream | Lucid Dream | Meditation |
|---|---|---|---|
| Mode | Fully automated | Hybrid: auto scan + human decisions | Fully interactive |
| Input | None (zero-config) | Dream report findings | User-directed topic |
| Output | Diagnostic report | Resolved findings + applied fixes | New memory files |
| Modifies architecture? | Never | Yes, with human approval | Yes |
| Analogy | REM sleep | Lucid dreaming | Contemplation |

## Decision Framework

| Signal from Dream | Action | Owner |
|-------------------|--------|-------|
| Broken link, mapping exists | Auto-repair | Dream |
| Broken link, no mapping | Present options: remap, remove, or keep | Lucid |
| Missing frontmatter | Auto-flag | Dream → Lucid fills values |
| Overlapping `applyTo` | Present overlap analysis, recommend merge/split | Lucid |
| Shallow skill content | Present enrichment options or deprecation | Lucid |
| Version drift (master/heir) | Show diff, ask which is canonical | Lucid |
| Brand violation | Auto-flag with file + line | Dream → Lucid confirms fix |

## Resolution Patterns

### Skill Consolidation

Two skills overlap significantly → merge into one, update all references, redirect old name via mapping.

### Skill Enrichment

Skill flagged as shallow → research domain, add decision tables, examples, or integration patterns. If no real knowledge exists, deprecate.

### Architecture Restructuring

Dream finds systemic pattern (e.g., many skills missing prompts) → create batch fix plan, execute with confirmation per step.

## Completion Gate

All dream findings must reach one of:

| State | Meaning |
|-------|---------|
| Resolved | Fix applied and validated |
| Deferred | Logged with rationale for next session |
| Dismissed | False positive, documented why |
