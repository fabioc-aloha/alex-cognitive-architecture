---
description: "Fleet-wide brain synchronization — audit, upgrade, verify, rollback across heir projects"
application: "When managing multiple heir projects or synchronizing brain updates across the fleet"
applyTo: "**/*upgrade*brain*,**/*fleet*,**/*heir*sync*"
currency: 2026-04-22
---

# Fleet Management

Keep heir projects synchronized with Master Alex brain updates.

## Quick Reference

| Operation | Command |
|-----------|---------|
| **Audit** | `node scripts/upgrade-brain.cjs --mode Audit` |
| **Dry-run** | `node scripts/upgrade-brain.cjs --mode Upgrade --dry-run` |
| **Upgrade** | `node scripts/upgrade-brain.cjs --mode Upgrade` |
| **Full** | `node scripts/upgrade-brain.cjs --mode Full` |
| **Verify** | `node scripts/upgrade-brain.cjs --mode Verify` |
| **Rollback** | `node scripts/upgrade-brain.cjs --mode Rollback --include "name"` |

## Pre-Upgrade Checklist

1. Run brain QA: `node .github/muscles/brain-qa.cjs`
2. Verify "0 failing" in queue depth
3. Sync heir template: `node scripts/sync-to-heir.cjs`

## Post-Upgrade Checklist

1. Verify: `node scripts/upgrade-brain.cjs --mode Verify`
2. Curate custom CI from `.backup.md` files
3. Commit changes in each project
4. Delete `.github-backup-*` after verification

## Exclusions

Default exclusions: `AlexMaster`, `AlexMaster_Legacy`, `pbi`, `pbi-test`, `GCX_*`

Override: `-Include "project1,project2"` or modify `-Exclude` parameter.

## Rollback Path

Backups at `.github-backup-YYYYMMDD/` until manually deleted. Restore:

```powershell
Remove-Item ".github" -Recurse
Rename-Item ".github-backup-YYYYMMDD" ".github"
```
