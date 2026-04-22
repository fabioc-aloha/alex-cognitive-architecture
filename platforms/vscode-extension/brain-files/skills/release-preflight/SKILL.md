---
name: release-preflight
description: Pre-checks, version consistency, and deployment discipline.
tier: standard
applyTo: "**/*release*,**/*publish*,**/*deploy*,**/*version*,**/package.json,**/CHANGELOG*"
currency: 2025-01-01
---

# Release Preflight Skill

> Pre-checks, version consistency, and deployment discipline.

## The Golden Rule

> **NEVER publish without running the preflight checklist.**

## Quick Start

```bash
# Full preflight check
node scripts/release-preflight.cjs

# With packaging test
node scripts/release-preflight.cjs

# Skip time-consuming tests
node scripts/release-preflight.cjs
```

## Version Locations (Must Stay Synchronized)

| #   | Location                                                     | Field               | Example                   |
| --- | ------------------------------------------------------------ | ------------------- | ------------------------- |
| 1   | `platforms/vscode-extension/package.json`                    | `version`           | `"5.1.0"`                 |
| 2   | `CHANGELOG.md`                                               | Latest heading      | `## [5.1.0] - 2026-02-07` |
| 3   | `.github/copilot-instructions.md`                            | `**Version**:` line | `**Version**: 5.1.0`      |
| 4   | `platforms/vscode-extension/.github/copilot-instructions.md` | Same as #3          |
| 5   | `docs/index.html`                                            | Footer version      | `v5.1.0`                  |
| 6   | `ROADMAP.md`                                                 | Quick Status table  | Master version row        |
| 7   | Git tag                                                      | Tag name            | `v5.1.0`                  |

## Preflight Gates

| Gate | Check                          | Script Flag           |
| ---- | ------------------------------ | --------------------- |
| 0    | PAT configured                 | Always                |
| 1    | Version sync (all 7 locations) | Always                |
| 2    | Build passes                   | Always                |
| 3    | Lint passes                    | Always                |
| 4    | Tests pass                     | `-SkipTests` to skip  |
| 5    | Package creates                | `-Package` to include |
| 6    | Human review                   | Manual                |

## Full Release Workflow

```bash
# VS Code Extension release
node scripts/release-vscode.cjs

# M365 Agent release
node scripts/release-m365.cjs --validate
```

## Version Bump Only

```powershell
# 1. Bump
npm version patch --no-git-tag-version

# 2. Get version
$v = (Get-Content package.json | ConvertFrom-Json).version

# 3. Update CHANGELOG, commit, tag, push
git add -A; git commit -m "release: v$v"; git tag "v$v"; git push --tags
```

## Common Mistakes

| Mistake                        | Prevention                       |
| ------------------------------ | -------------------------------- |
| Published without version bump | Run preflight first              |
| CHANGELOG not updated          | Script checks this               |
| Forgot to push tags            | Script does this                 |
| Version mismatch               | Grep entire repo for old version |
| PAT 401 error                  | Refresh PAT before release       |

## Related Scripts

| Script                                        | Purpose                                |
| --------------------------------------------- | -------------------------------------- |
| `scripts/release-preflight.cjs`               | Pre-release validation                 |
| `scripts/release-vscode.cjs`                  | Full VS Code release                   |
| `scripts/release-m365.cjs`                    | M365 agent packaging                   |
| `.github/muscles/build-extension-package.ps1` | Full build (sync + compile + PII scan) |
| `.github/muscles/sync-architecture.cjs`       | Canonical Master → Heir sync           |

## Triggers

- "release", "publish", "deploy"
- "preflight", "pre-release check"
- "version bump", "version sync"

---

_Scripts: `scripts/release-preflight.cjs`, `scripts/release-vscode.cjs`_
