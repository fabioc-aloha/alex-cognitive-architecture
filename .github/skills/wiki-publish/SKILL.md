---
type: skill
lifecycle: stable
name: "wiki-publish"
description: "Publish master-wiki/ to GitHub Wiki with folder flattening and link rewriting"
tier: standard
applyTo: '**/*wiki*publish*,**/*wiki*push*,**/*wiki*sync*,**/master-wiki/**'
disable-model-invocation: true
currency: 2026-04-22
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

## Wiki Publish QA Decision Table (KW2)

After `publish-master-wiki.cjs` runs mechanical link rewriting, the LLM reviews the flattened output for semantic quality issues the script cannot detect.

| # | Check | Pass | Fail | Action on Fail |
|---|-------|------|------|----------------|
| 1 | **Audience fit** — wiki pages are user-facing (no Node.js assumed) | No dev-only jargon, build commands, or internal references | References `.github/`, `brain-qa`, muscle scripts, or `npm run` | Rewrite for end-user audience or move to README (developer docs) |
| 2 | **Voice consistency** — wiki reads as one author, one tone | Consistent tone across all pages, matches Alex's public voice | Mixed formal/informal, or robotic instructions next to conversational prose | Harmonize tone to wiki voice guide |
| 3 | **Orphaned pages** — every page reachable from `_Sidebar.md` | All published `.md` files appear in sidebar or are linked from a sidebar page | Pages exist in wiki root but have no inbound links | Add to `_Sidebar.md` or remove from publish |
| 4 | **Broken cross-refs** — internal wiki links resolve after flattening | All `[[Page-Name]]` and `[text](Page-Name)` links resolve to actual wiki pages | Link target doesn't exist in flattened output | Fix link rewriting rule or source page |
| 5 | **Asset references** — images and SVGs load correctly | All `![](asset.svg)` reference files that exist in wiki root | Image referenced but file not published (excluded by filter) | Add to publish list or remove reference |
| 6 | **Prefix consistency** — page names follow folder-to-prefix mapping | Page names match `FOLDER_CONFIG` prefixes | Manual override broke naming convention | Revert to convention or update `FOLDER_CONFIG` |
| 7 | **Stale content** — pages reflect current architecture/features | Content matches current v8.x capabilities | References deprecated features, old version numbers, removed commands | Update content or add "as of vX.Y" qualifier |
| 8 | **Duplicate content** — no two pages cover the same topic | Each topic has one canonical page | Same content in GUIDE-X and BLOG-Y | Consolidate to one, cross-reference from the other |
| 9 | **Navigation flow** — sidebar sections ordered logically | Getting Started → Guides → Reference → Blog | Random ordering or missing section headers | Reorder `_Sidebar.md` |
| 10 | **Sensitive data** — no internal paths, credentials, or project-specific data | Clean of file paths, API keys, client names | `C:\Development\...` paths or internal project references leak through | Strip per `cross-project-isolation.instructions.md` |
