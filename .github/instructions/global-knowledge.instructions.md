---
description: "Cross-project knowledge search, pattern recognition, and insight management via unified AI-Memory"
application: "When searching for reusable patterns, applying lessons learned, or managing knowledge across projects"
applyTo: "**/*knowledge*,**/*insight*,**/*pattern*,**/*ai-memory*"
currency: 2026-04-20
---

# Global Knowledge Management

## Source of Truth

**`AI-Memory/user-profile.json`** is the canonical source of truth for user identity across all heirs and projects. Never duplicate profile data in project configs or Copilot Memory.

| Data | Location | Scope |
|------|----------|-------|
| Name, role, identity | AI-Memory/user-profile.json | All projects |
| Preferences (style, learning) | AI-Memory/user-profile.json | All projects |
| Cross-project patterns | AI-Memory/global-knowledge.md | All projects |
| Session notes | AI-Memory/notes.md | All projects |
| Learning goals | AI-Memory/learning-goals.md | All projects |
| Fleet visibility | AI-Memory/project-registry.json | All projects |
| Project persona | .github/config/project-persona.json | One project |

## AI-Memory Location

| Platform | Path |
|----------|------|
| Windows | `%OneDrive%/AI-Memory/` (e.g., `~/OneDrive - Company/AI-Memory/`) |
| macOS | `~/Library/CloudStorage/OneDrive-*/AI-Memory/` |
| Fallback | `~/.alex/AI-Memory/` |
| M365 | OneDrive > AI-Memory via OneDriveAndSharePoint |

## Directory Structure

| Path | Content |
|------|---------|
| `global-knowledge.md` | Consolidated cross-project patterns and insights |
| `notes.md` | Quick notes, reminders, observations |
| `learning-goals.md` | Active learning objectives |
| `user-profile.json` | User identity and preferences |
| `project-registry.json` | Fleet project registry |
| `index.json` | File registry |
| `.github/` | Architecture config (reserved) |
| `announcements/` | Fleet announcements |
| `feedback/` | Heir bug reports and feature requests |
| `insights/` | Future individual insight files |
| `knowledge/` | Future domain knowledge files |
| `patterns/` | Future pattern files |

## Project Registry: Cross-Project Discovery

**`AI-Memory/project-registry.json`** tracks all heir projects and their successful patterns. Use it to find "what worked elsewhere":

| Query | Registry Lookup |
|-------|-----------------|
| "webview patterns" | `projects[].successfulPatterns` where skill contains "webview" |
| "MCP examples" | `projects[].technologies` contains "mcp" |
| "testing friction" | `projects[].frictionPoints` where skill contains "test" |

Before solving a problem from scratch, check if another project solved it successfully.

## Search Strategy

1. Check AI-Memory/global-knowledge.md for existing patterns
2. Check project-local knowledge first (faster)
3. Escalate to global only when local insufficient
4. Record new patterns for future use

## Pattern Recognition

| Signal | Action |
|--------|--------|
| Solved similar problem before | Search AI-Memory/global-knowledge.md |
| New technique worked well | Add to global-knowledge.md |
| Pattern applies across projects | Store in global-knowledge.md |
| Pattern is project-specific | Keep in project docs |

## Insight Lifecycle

1. **Capture**: Record in AI-Memory/notes.md while fresh
2. **Validate**: Confirm in second context
3. **Generalize**: Abstract from specifics
4. **Store**: Add to AI-Memory/global-knowledge.md under appropriate category
5. **Apply**: Reference in future work
6. **Promote**: Mature patterns become `.github/skills/` or `.github/instructions/`

## Anti-Patterns

- Reinventing solutions that exist in global-knowledge.md
- Over-generalizing one-off fixes
- Storing project-specific knowledge globally
- Duplicating user-profile.json in heirs

## Heir Contribution Procedures

Heirs are **active contributors** to the shared knowledge base:

### Contribute Pattern to Registry

After solving a problem elegantly:

```javascript
// Update own entry in project-registry.json
myEntry.successfulPatterns.push('pattern-name');
myEntry.health.lastMeditation = new Date().toISOString();
```

### Add to Global Knowledge

When a pattern proves valuable (reused 3+ times), add an entry to `AI-Memory/global-knowledge.md` under the appropriate category heading.

### Report Friction

When encountering recurring issues:

```javascript
// Update own entry
myEntry.frictionPoints.push('issue-description');
```

Or create feedback file:

```bash
# Create: ~/AI-Memory/feedback/{date}-friction-{slug}.md
```

### What Heirs Cannot Do

- Modify `user-profile.json` (read-only)
- Edit other projects' registry entries
- Delete global patterns (request via feedback)
