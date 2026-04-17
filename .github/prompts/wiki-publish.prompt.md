---
mode: agent
description: "Publish master-wiki/ to the AlexMaster GitHub Wiki"
---

# Publish Wiki

Sync all master-wiki/ content to the GitHub Wiki repo.

## Steps

1. Clone `https://github.com/fabioc-aloha/AlexMaster.wiki.git` to a temp directory
2. Read the wiki-publish skill for folder-to-prefix mapping rules
3. Copy all publishable `.md` and `.svg` files from `master-wiki/`, applying name transformations:
   - `master-wiki/README.md` → `Home.md`
   - Folder READMEs → mapped names per skill
   - Subfolder files → prefixed per skill mapping table
   - `master-wiki/assets/*.svg` → wiki root
   - `_Sidebar.md` and `_Footer.md` → wiki root
4. Rewrite internal links in all copied files:
   - Relative paths → flat wiki page names (no `.md` extension)
   - Asset paths → flat filenames
   - Remove links to `.github/` source files (not accessible from wiki)
5. Run `git status --short` and show the diff summary
6. Ask for confirmation before pushing
7. Commit with message `docs: sync from master-wiki` and push
8. Remove the temp clone

## Exclusions

Skip: `master-wiki/alex3/`, `master-wiki/skills/`, `*.json`, `CNAME`, `index.html`, `*.html`

## Constraints

- Never force-push
- Always clone fresh
- If files exist in wiki but not in master-wiki, warn before overwriting
