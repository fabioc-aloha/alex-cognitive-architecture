---
description: "Battle-tested patterns learned from real project experience — gotchas, solutions, and architectural rules"
application: "Always active — apply relevant patterns when working in matching domains"
applyTo: "**"
currency: 2026-04-22
---

# Learned Patterns

Hard-won patterns from production experience. Each entry records a specific gotcha or proven solution.

## Security

- **Markdown rendering chain**: marked.js → DOMPurify → Mermaid post-render. Parse first, sanitize second, then run diagram renderer on the sanitized DOM. Never skip the sanitizer even if content is "trusted."
- **Allowlist over blocklist**: For URL validation, file path validation, command execution — enumerate permitted values, reject everything else
- **Sanitize at system boundaries**: Strip file paths, stack traces, internal state from user-facing error messages. Regex: replace absolute paths with `[path]`. Also: don't forward raw SDK error messages to clients.
- **execFileSync over execSync**: When spawning known executables (git, gh, node), use `execFileSync(cmd, argsArray)` instead of `execSync("cmd args")`. Avoids shell injection surface, slightly faster. Same blocking behavior.
- **Cache expensive CLI probes**: `ghAvailable()`, `gitAvailable()`, and similar "is tool installed?" checks should cache at module level (`let cached: boolean | null = null`). The answer doesn't change mid-session.
- **Atomic filesystem writes**: Copy to staging dir → swap (rename) → cleanup on failure. Avoids partial-write corruption.
- **Path traversal guard**: When copying trees, validate `path.resolve(dest, entry.name)` stays within destination root
- **Event delegation over inline handlers**: Never use `onclick="fn('${userInput}')"` with user-sourced data (localStorage, URL params). Use `data-*` attributes + event delegation to prevent XSS.
- **escAttr must cover 6 chars**: `& < > " ' \` — missing any creates injection vectors in HTML attributes

## GitHub

- **`.github/README.md` overrides root README**: GitHub treats `.github/README.md` as a community health file and displays it on the repo landing page instead of the root `README.md`. Rename to `ABOUT.md` or delete to fix.
- **GitHub Wiki is flat**: All pages render at root. Automate folder→flat mapping with link rewriting (same-folder, cross-folder, source-code→repo URL). Sidebar `_Sidebar.md` is ground truth for link targets.

## Documentation

- **Docs decay proportional to velocity**: Hardcoded numbers (test counts, line counts, version requirements) rot fastest. Prefer runtime reads or "as of [date]" stamps.
- **Multi-surface count drift**: When a number (skill count, instruction count) appears in N files across M surfaces, it WILL diverge. Grep for the old number across all surfaces when updating. Analytical/point-in-time docs are exempt — those are historical records.
- **Automate version stamps**: Version numbers in 5+ files WILL drift with manual edits. Solution: single-source (root `package.json`) + bump script that derives all locations. Classify each reference as auto-derivable vs. inherently manual (changelogs, planning docs).
- **Plan integrity has no automated check**: Lane header task counts (e.g., "0/6") and total rollups can silently diverge from the actual backlog items when tasks are added. Manual recount is the only verification.
- **Planning voice → past tense**: Strategy docs written in future tense ("will ship", "in progress") must be updated when milestones complete.
- **Dual-surface docs drift**: Two READMEs covering overlapping scope will diverge. Cross-reference from the less-detailed to the more-detailed, or consolidate.
- **Wiki = user docs, README = developer docs**: Keep audience separation clean. Wiki for end users (no Node.js), README for contributors.
- **No decoration in machine-consumed files**: Emoji, color codes, or visual markers in tables/configs parsed by regex or LLMs will break tooling.

## Architecture

- **Default to fast, opt into slow**: For AI/LLM features, default to shortest response length. Users who want more depth will select it. Persist preference in localStorage.
- **Defaults-plus-overrides**: Provide role/archetype defaults, allow partial overrides, clamp bounds.
- **Weighted scoring matrix**: Multi-factor scoring with normalized weights and optional boosts.
- **Staged transformation pipeline**: Input flows through discrete stages (profile → style → format → output). Each stage is independently testable and replaceable.
- **Opt-in for workspace mutations**: Extensions/tools that write to user workspaces must get explicit consent first. Auto-writing .github/, config files, or scaffolding without confirmation violates least-surprise.
- **Cross-platform path resolution**: Never use raw `process.env.APPDATA` for VS Code paths. Use `os.platform()` switch: Windows=`%APPDATA%/Code/User`, macOS=`~/Library/Application Support/Code/User`, Linux=`${XDG_CONFIG_HOME:-~/.config}/Code/User`.

## Visual Memory

- **256px max for embedded images**: Full-resolution base64 images (512px) quickly exceed context limits. Resize to 256px longest edge before encoding — 70% savings (42KB → 13KB per image).
- **Separate storage from embedding**: Keep original files at full resolution (512px) on disk; only the embedded `dataUri` uses the smaller version. Document with `embedSize` field.
- **Face-consistent models work at 256px**: nano-banana-pro and similar reference-based models work fine with 256px inputs.

## Fleet Operations

- **DryRun must simulate non-existent paths**: When a script renames then restores, dry-run skips the rename so the restore source doesn't exist. Solution: use the original path as restore source in dry-run, the backup path in real runs. Test dry-run separately from real runs.
- **Two-phase fleet upgrade**: Phase 1 = mechanical batch (`node scripts/upgrade-brain.cjs --mode Full`). Phase 2 = semantic curation per-project (scan `.github-backup-*/` for custom content worth restoring). Batch for correctness, human for judgment.
- **Brain source path**: Root `.github/` is the canonical brain source. `heir/.github/` is generated by `sync-to-heir.cjs`. Extension source code lives in `heir/platforms/vscode-extension/`.
- **Three "hooks" in AlexMaster**: (1) `.github/hooks/` = git pre-commit hooks (inheritable — marked `@inheritance inheritable`), (2) `.github/muscles/hooks/` = agent hook scripts (selectively distributed), (3) `.github/config/hooks.json` = agent hook event registry (master-only — references hooks that don't exist in heirs). BRAIN_SUBDIRS includes `hooks` (pre-commit hooks). `hooks.json` must NOT be synced to heirs.
- **Stacked upgrades: curate oldest backup first**: When multiple `.github-backup-*` dirs exist, only the oldest has project-specific content. Config files can silently drop between minor brain versions — always diff config/ against backups.

## Build Pipelines

- **Fix-once + auto-inject-future**: Pair an idempotent one-time fix script with a build-time auto-inject fallback. This two-pronged approach avoids perpetual manual enforcement.
- **Declarative data-driven layouts**: Define page layout structures as data, keep rendering code as pure templates. Adding new sections requires only data changes, not template surgery.
- **Config + content file separation**: JSON config defines structure, separate .md files hold content. Loader resolves file references at runtime. Cache per session, invalidate on refresh.
- **Verify every field when transcribing code to config**: When extracting hardcoded data to JSON, icon names, descriptions, and field values will silently drift. Cross-check every field against the source.
- **Hardcoded paths in build scripts rot**: When directory structure changes (e.g., `platforms/` → `heir/platforms/`), build scripts with hardcoded paths break silently. Use config or resolve relative to manifest files.
- **Release scripts must build their own artifacts**: Never assume a pre-built artifact exists. Build → validate → publish → then commit/tag/push. Irreversible git ops (commit, tag, push) must come AFTER artifact validation succeeds — not before.
- **Preflight version-mismatch is a gate, not a warning**: If the VSIX filename doesn't match package.json version, that's a hard stop — not a warning to scroll past.

## Quality Process

- **Universal audit pattern**: Inventory → compare against ground truth → severity-classify → fix all. Works for code, docs, security. Transfers to any domain where claims can drift from reality.
- **Iterative health-check loop**: Score → fix top issues → rescore. Fix the highest-ROI dimension first.
- **Dev folder harvest**: Scan all projects → deduplicate against master → tier (ADOPT/MAYBE/SKIP) → copy → clean frontmatter → validate. Battle-tested (3+ projects) is a strong quality signal.
- **brain-qa frontmatter gate**: All 4 fields required (name, description, applyTo, tier). Missing any one → fm=0 → likely fail. Workflow skills also need matching `.instructions.md` for tri=1.
- **Token waste triage**: Not all scanner findings are actionable. Mermaid in a Mermaid-teaching skill is instructional content, not waste. Triage before fixing.
- **Fractional date arithmetic at thresholds**: `daysBetween(a, b)` using `getTime()` returns fractional days. A date "exactly 7 days ago" may compute as 7.0001 and fail a `> 7` check. Always `Math.floor()` before threshold comparison.
- **Rename drift in tests**: When renaming a function, grep all test files for both the old and new name. Test describe blocks, comments, and non-invocation references survive find-and-replace that only targets `fn(` call sites.

## Windows / Node.js

- **Winget MSI packages share install dirs**: `OpenJS.NodeJS.22` and `OpenJS.NodeJS.LTS` both install to `C:\Program Files\nodejs\`. Uninstalling the old version removes binaries for the new one. Install new first, verify, then uninstall old.
- **PAT expiration breaks publish silently**: `VSCE_PAT` environment variable can be set but expired. Preflight only checks existence, not validity. The 401 error at publish time is the first signal.

## Azure CLI

- **Subscription context breaks silently**: Azure CLI commands return empty results or "not found" when wrong subscription is active. Always verify with `az account show` first.
- **Cost Management API requires file-based body**: In PowerShell, inline JSON causes "Unsupported Media Type" errors. Pattern: write JSON to file, then `az rest --body "@$path"`.

## Azure Static Web Apps

- **Vite public/ requires rebuild+redeploy**: Files in `public/` are copied to `dist/` during build. Committing a new file doesn't serve it — must rebuild and redeploy.
- **Self-host CDN libraries in enterprise**: CDN scripts hit CSP violations and tracking prevention blockers. Self-hosting eliminates both.
- **AbortController for long API calls**: SSE/streaming endpoints can take 30-90 seconds. Browsers may silently drop without explicit timeout. Use AbortController with 180s timeout.
- **Auth route ordering matters**: `/.auth/*` must be explicitly allowed for `anonymous` BEFORE any `/*` wildcard with `authenticated`. Otherwise login callbacks get 401 → infinite redirect loop.
- **SWA CLI v2.0.8 silently fails**: Reports success but uploads nothing. Use GitHub Actions (`Azure/static-web-apps-deploy@v1`) instead.
- **Custom domain redirect URIs**: Entra ID app registration must include callback URIs for BOTH the default SWA hostname AND any custom domain.
- **Disconnect before switching deploy methods**: `az staticwebapp disconnect` before moving to CLI or new workflow deployments.
- **SWA embedded Functions lack IDENTITY_HEADER**: Causes `ManagedIdentityCredential` to fail. Solution: Create a standalone Function App with system-assigned managed identity, link via `az staticwebapp backends link`.
- **Embedded API overrides linked backend**: If the workflow has `api_location:`, SWA deploys embedded Functions which override any linked backend. Remove `api_location` to route to the linked Function App.
- **Azure Functions v4 requires main entry**: `package.json` must have `"main"` pointing to the file that registers functions via `app.http()`. Without it, functions silently fail to deploy.
- **X-Frame-Options blocks iframes by default**: SWA default is `DENY`. Set `"X-Frame-Options": "SAMEORIGIN"` in globalHeaders for iframe embed patterns.
- **Verify hostname via az CLI**: SWA hostnames can change. Always verify with `az staticwebapp show --name <name> --query defaultHostname`.

## Azure Identity

- **MSI = ServicePrincipal**: A Managed Identity IS a Service Principal in Entra ID. The `principalId` matches the ServicePrincipal in role assignments.
- **RBAC verification pattern**: (1) get principalId from resource, (2) list role assignments on target resource, (3) match principalId to ServicePrincipal, (4) verify roleId.

## GitHub Actions

- **Proactive version upgrades**: `actions/checkout@v5`, `actions/setup-node@v5` with `node-version: 22`. The v4 + Node 20 combination triggers deprecation warnings.

## VitePress

- **Standalone HTML in VitePress nav**: Use iframe embed pattern. Create `.md` page + Vue component that embeds HTML via iframe. The HTML detects `?embed` and hides its own chrome.
- **cleanUrls + nav links**: With `cleanUrls: true`, nav links must not have `.html` extensions.
- **SPA routing intercepts all nav clicks**: For non-VitePress pages, use iframe embed (preferred) or `target: "_self"` to force full navigation.
- **Iframe CSS isolation**: iframes cannot access parent CSS custom properties. Fallback colors must use hardcoded values, not other CSS variables.

## Data Modeling

- **Temp-file Python analysis**: Write to _tmp.py → execute → delete. Avoids inline quoting issues across shells.
- **TMDL linter false positives**: VS Code TMDL linter reports `description` as invalid on measures — this is a linter limitation, not a syntax error.

## Academic Writing

- **Editorial review is judgment, not pattern-matching**: Complex style rules (APA7 verb tense, citation format) require context-dependent decisions. Apply critical-thinking framework from the start.
- **Verify instrument wording against source data**: Before changing terminology in academic documents, verify actual survey wording against the raw data file. Manuscripts evolve terminology that may not match what was actually administered.
- **Appendix "exactness" claims require audit**: When an appendix claims to reproduce something "exactly as administered," compare line-by-line against ground truth. The claim of exactness is itself a testable hypothesis.
