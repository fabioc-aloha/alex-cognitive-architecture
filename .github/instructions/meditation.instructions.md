---
description: "Procedural steps for knowledge consolidation meditation sessions"
application: "When exploring new domains, synthesizing knowledge, or building expertise"
applyTo: "**/*meditation*,**/*dream*,**/*consolidation*"
---

# Meditation Protocol

Knowledge consolidation — transform working memory into permanent architecture.

## Completion Gate

A meditation is INCOMPLETE unless it produces at least one file change:

| Output | Target |
|---|---|
| Repeatable process | `.github/instructions/*.instructions.md` |
| Domain knowledge | `.github/skills/*/SKILL.md` |
| Workflow template | `.github/prompts/*.prompt.md` |
| Cross-project pattern | `/memories/` (user memory) |
| Repo-specific fact | `/memories/repo/` (repo memory) |

## 4 Phases

### 1. Review

- Scan conversation for insights, patterns, breakthroughs, mistakes
- Extract concepts worth persisting (non-obvious, reusable, easy to forget)
- Discard noise — not everything deserves permanent storage

### 2. Connect

- Compare findings against existing instructions, skills, and `/memories/`
- Identify reinforcements (existing knowledge confirmed) and contradictions (flag for review)
- Look for cross-domain connections — one genuine insight beats three forced ones

### 3. Persist

- Create or update the right file type (see Completion Gate)
- Ensure frontmatter is complete (`description`, `applyTo`)
- Link related skills/instructions via naming or frontmatter references
- Patterns that pass the 3-workspace test → `/memories/` (user memory)
- Patterns that are repo-specific → `/memories/repo/`

### 4. Validate

Output checklist before concluding:

```text
✓ File: [path] — [created|updated]
✓ Related: [skill-a, skill-b] — linked
✓ Summary: [one-line description of what was consolidated]
```

If new skills/instructions were created, verify they load correctly.

## When to Meditate

- Session produced reusable knowledge worth persisting
- Domain learning reached a milestone
- Cross-domain patterns emerged
- Working memory feels overloaded (7+ unrecorded insights)
