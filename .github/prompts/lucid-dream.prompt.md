---
mode: agent
description: "Run dream diagnostics with interactive resolution for ambiguous findings"
---

# Lucid Dream

Run full dream diagnostics, apply all automated fixes, then present judgment calls one at a time.

## Steps

1. Execute dream protocol: `node .github/muscles/brain-qa.cjs`
2. Parse results — separate auto-fixable from judgment-required
3. Apply all auto-fixes silently
4. For each judgment-required finding:
   - Present the issue with context
   - Show options with trade-offs
   - Wait for user decision
   - Apply the chosen resolution
   - Validate the fix
5. Generate summary of all resolutions (applied, deferred, dismissed)

## Constraints

- Never skip a judgment call — present all of them
- Never auto-resolve ambiguous findings
- Validate after each fix before proceeding
- Log deferred items for next session
