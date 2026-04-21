---
sem: 1
description: Push master and heir repos, sync brain, and publish both GitHub Wikis in one shot
application: "When you need to push and publish everything — repos and wikis"
agent: Alex
currency: 2026-04-21
---

# /publish-all — Push and Publish Everything

Push both repos and publish both wikis. One command, everything ships.

## What It Does

1. **Push master** (`AlexMaster`) to GitHub
2. **Sync brain + push heir** (`alex-cognitive-architecture`) — brain sync, commit, push, and publish heir wiki
3. **Publish master wiki** — flatten `master-wiki/` and push to `AlexMaster.wiki.git`

## Quick Run

```bash
node scripts/publish-all.cjs --message "docs: your message here"
```

## Options

| Flag | Effect |
|------|--------|
| `--message "msg"` | Commit message for heir and wiki commits |
| `--dry-run` | Preview only, no changes |
| `--skip-master-push` | Skip `git push` on master (if already pushed) |

## Prerequisites

- Master repo must have a clean working tree or committed changes ready to push
- Heir repo changes are auto-committed by the publish-heir script
- Both wiki remotes must be accessible (GitHub auth configured)

## When to Use

- After finishing a batch of changes across brain, docs, or MCP
- After any session where you modified master-wiki/ or heir/wiki/
- Before ending a work session to ensure everything is synced
