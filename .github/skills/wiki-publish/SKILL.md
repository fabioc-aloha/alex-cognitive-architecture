---
name: "wiki-publish"
description: "Publish master-wiki/ to GitHub Wiki with folder flattening and link rewriting"
applyTo: '**/*wiki*publish*,**/*wiki*push*,**/*wiki*sync*,**/master-wiki/**'
disable-model-invocation: true
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
| Assets | `master-wiki/assets/*.svg` → wiki root as flat files |

## Folder-to-Prefix Mapping

GitHub Wiki is flat. Files in subfolders get a prefix derived from the folder name.

| Source Folder | Wiki Prefix | Example |
|---------------|-------------|---------|
| `master-wiki/` (root) | _(none)_ | `README.md` → `Home.md` |
| `master-wiki/architecture/` | _(none)_ | Already flat names |
| `master-wiki/blog/` | `BLOG-` | `001-HELLO-WORLD.md` → `BLOG-001-HELLO-WORLD.md` |
| `master-wiki/blog/README.md` | — | → `BLOG-HOME.md` |
| `master-wiki/brand/` | _(none)_ | Already flat names |
| `master-wiki/cowork/` | `Cowork-` | `OVERVIEW.md` → `Cowork-OVERVIEW.md` |
| `master-wiki/cowork/README.md` | — | → `Cowork-README.md` |
| `master-wiki/decisions/` | _(none)_ | Already flat names |
| `master-wiki/guides/` | _(none)_ | Already flat names |
| `master-wiki/heirs/` | _(none)_ | Already flat names, except README |
| `master-wiki/heirs/README.md` | — | → `HEIR-SYSTEM.md` |
| `master-wiki/platforms/m365/` | _(none)_ | Already flat names |
| `master-wiki/research/` | _(none)_ | Already flat names |
| `master-wiki/rituals/` | `RITUALS-` | `DREAM.md` → `RITUALS-DREAM.md` |
| `master-wiki/rituals/README.md` | — | → `RITUALS.md` |
| `master-wiki/safety/` | _(none)_ | Already flat names |
| `master-wiki/vscode/` | _(none)_ | Already flat names |
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
| `./MEDITATION.md` | `RITUALS-MEDITATION` |
| `../architecture/COGNITIVE-ARCHITECTURE.md` | `COGNITIVE-ARCHITECTURE` |
| `../assets/banner-rituals.svg` | `banner-rituals.svg` |
| `../../.github/prompts/dream.prompt.md` | _(remove or note as source-only)_ |
| `./README.md` (within a folder) | Mapped per folder prefix table above |

### Link Rewriting Procedure

1. Strip `../` path traversals
2. Strip folder prefixes that match the mapping table
3. Apply the folder prefix if the source folder uses one
4. Remove `.md` extension
5. Leave anchor fragments (`#section`) intact

## Publish Checklist

1. Clone `AlexMaster.wiki.git` to temp dir
2. Copy all `.md` and `.svg` files, applying name mapping
3. Rewrite internal links in copied files
4. Sync `_Sidebar.md` and `_Footer.md`
5. `git add -A && git status` — review changes
6. `git commit -m "docs: sync from master-wiki"` and push
7. Remove temp clone

## What NOT to Publish

| Excluded | Reason |
|----------|--------|
| `master-wiki/alex3/` | Image generation assets, not docs |
| `master-wiki/skills/` | Internal skill docs, not user-facing |
| `*.json` files | Build artifacts |
| `CNAME`, `index.html` | Static site files, not wiki |
