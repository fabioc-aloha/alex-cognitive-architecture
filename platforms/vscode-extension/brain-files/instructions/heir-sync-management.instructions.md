---
type: instruction
lifecycle: stable
description: "Synchronize cognitive architecture changes between Master Alex and heir projects"
application: "When syncing skills, instructions, or config between Master and heirs"
applyTo: "**/*heir-sync*,**/*sync-heir*,**/*architecture-sync*"
currency: 2026-04-22
---

# Heir Sync Management

## Sync Direction

| Direction | Use Case |
|-----------|----------|
| **Master → Heir** | Push improvements to heirs |
| **Heir → Master** | Promote validated patterns |

## What to Sync

- Skills (`.github/skills/`)
- Instructions (`.github/instructions/`)
- Config (`.github/config/`)
- Agents (`.github/agents/`)

## Sync Protocol

1. **Diff**: Compare Master vs Heir
2. **Review**: Identify conflicts
3. **Resolve**: Keep better version
4. **Copy**: Use Copy-Item for files
5. **Validate**: Run brain-qa in heir

## Conflict Resolution

| Conflict Type | Resolution |
|---------------|------------|
| Master newer | Push to heir |
| Heir has customization | Keep heir version |
| Both changed | Merge manually |

## Anti-Patterns

- Blind copy without diff
- Breaking heir customizations
- Not validating after sync
- Syncing project-specific content

## Sync Drift Decision Table

When `sync-to-heir.cjs` produces a diff report showing unexpected changes, use this table to decide the action:

| Condition | Verdict | Action |
|-----------|---------|--------|
| Diff is only whitespace / line-ending normalization | Accept | No action needed |
| Diff is a known transform (header rewrite, applyTo path substitution) | Accept | Verify transform is correct |
| Heir file has custom content not in master (heir-maintained) | Keep heir | Mark as `heir-maintained` in sync config |
| Master file changed and heir has no customization | Roll forward | Accept master version |
| Master file changed but heir has local customizations | Merge | Manually merge; keep heir customizations, adopt master improvements |
| Unexpected content removed from heir copy | Flag as bug | Investigate transform regex; file issue |
| Unexpected content added to heir copy | Flag as bug | Check for stale copy or bad merge |
| `lifecycle: experimental` file appeared in heir | Reject | FM11 should have excluded it; check sync-to-heir.cjs |
| Master-only file appeared in heir | Reject | Check `isMasterOnly()` detection; inheritance tag may be missing |
| File exists in heir but not in master | Investigate | Orphan from deleted master file or heir-local creation |
| Binary file (image, font) differs | Accept if intentional | Heir may have project-specific assets |
| Config file differs | Keep heir | Config is heir-maintained by design |
