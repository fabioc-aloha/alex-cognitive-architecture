---
name: "wiki-publish"
description: "Publish master-wiki/ to GitHub Wiki with folder flattening and link rewriting"
tier: standard
applyTo: '**/*wiki*publish*,**/*wiki*push*,**/*wiki*sync*,**/master-wiki/**'
disable-model-invocation: true
currency: 2025-01-01
---

# Wiki Publish Skill

Publish `master-wiki/` to the GitHub Wiki repo (`AlexMaster.wiki.git`). The master-wiki uses folder-based organization; GitHub Wiki requires flat filenames. This skill encodes the transformation rules.

## Source and Target

| Property | Value |
|----------|-------|
| Source | `master-wiki/` in AlexMaster repo |
| Target | `https://github.com/fabioc-aloha/AlexMaster.wiki.git` |
| Sidebar | `master-wiki/_Sidebar.md` (canonical, synced to wiki) |
| Footer | `master-wiki/_Footer.md` (canonical, synced to wiki) |
| Assets | All image/SVG files from asset dirs → wiki root (flat) |

## Automation

```bash
node scripts/publish-master-wiki.cjs              # full publish
node scripts/publish-master-wiki.cjs --dry-run    # preview mapping
node scripts/publish-master-wiki.cjs --no-push    # flatten to .wiki-publish-tmp/
node scripts/publish-master-wiki.cjs --message "docs: v8.0.0"
```

The script handles folder-to-prefix mapping, link rewriting, and asset flattening.

## Folder-to-Prefix Mapping

GitHub Wiki is flat. Files in subfolders get a prefix derived from the folder name.

| Source Folder | Wiki Prefix | README Target |
|---------------|-------------|---------------|
| `master-wiki/` (root) | _(none)_ | `Home.md` |
| `master-wiki/architecture/` | _(none)_ | — |
| `master-wiki/blog/` | `BLOG-` | `BLOG-HOME.md` |
| `master-wiki/brand/` | _(none)_ | — |
| `master-wiki/cowork/` | `COWORK-` | `COWORK-README.md` |
| `master-wiki/critical-thinking/` | `CRITICAL-THINKING-` | `CRITICAL-THINKING-README.md` |
| `master-wiki/decisions/` | _(none)_ | — |
| `master-wiki/guides/` | _(none)_ | — |
| `master-wiki/heirs/` | _(none)_ | `HEIR-SYSTEM.md` |
| `master-wiki/platforms/m365/` | _(none)_ | — |
| `master-wiki/portraits/` | _(none)_ | `PORTRAITS.md` |
| `master-wiki/research/` | _(none)_ | — |
| `master-wiki/rituals/` | _(none)_ | `RITUALS-OVERVIEW.md` |
| `master-wiki/safety/` | _(none)_ | — |
| `master-wiki/ui-ux/` | _(none)_ | — |
| `master-wiki/vscode/` | _(none)_ | — |
| `master-wiki/assets/` | _(none)_ | SVGs copied flat to wiki root |

## Special File Mappings

| Source | Wiki Name | Reason |
|--------|-----------|--------|
| `master-wiki/README.md` | `Home.md` | GitHub Wiki convention |
| `master-wiki/_Sidebar.md` | `_Sidebar.md` | GitHub Wiki special file |
| `master-wiki/_Footer.md` | `_Footer.md` | GitHub Wiki special file |

## Link Rewriting Rules

Internal links must be rewritten from relative paths to flat wiki page names (no `.md` extension).

| Source Link Pattern | Wiki Link |
|---------------------|-----------|
| `./MEDITATION.md` | `MEDITATION` |
| `../architecture/COGNITIVE-ARCHITECTURE.md` | `COGNITIVE-ARCHITECTURE` |
| `../assets/banner-rituals.svg` | `banner-rituals.svg` |
| `../../.github/prompts/dream.prompt.md` | Full GitHub repo URL |
| `./README.md` (within a folder) | Mapped per folder prefix table above |

Link rewriting is handled by `scripts/publish-master-wiki.cjs`.

## Publish Checklist

1. `node scripts/publish-master-wiki.cjs --dry-run` — verify mapping
2. `node scripts/publish-master-wiki.cjs` — publish

The script handles clone, flatten, link-rewrite, commit, push, and cleanup.

## What NOT to Publish

| Excluded | Reason |
|----------|--------|
| `master-wiki/alex3/` | Image generation assets, not docs |
| `master-wiki/skills/` | Internal skill docs, not user-facing |
| `*.json` files | Build artifacts |
| `CNAME`, `index.html` | Static site files, not wiki |

## Common Gotchas

- **Relative paths break in wiki**: GitHub Wiki renders all pages at root level. Paths like `../assets/image.png` that work in the repo fail in published wiki. Use `./assets/image.png` or absolute URLs.
- **Sidebar ordering**: `_Sidebar.md` controls navigation. Update it when adding new pages or reorganizing sections.
- **Image assets must be flat**: Wiki doesn't support subdirectories for assets. All SVGs go to wiki root.
- **Duplicate page names**: Two source files mapping to the same wiki name will overwrite each other. The prefix table prevents this — follow it strictly.
