# Memory System Internals

How Alex's memory systems initialize, persist, and interact from a fresh extension install through ongoing use.

## The Three Memory Tiers

Alex operates across three independent memory systems. Each has a different storage location, lifecycle, and initialization path.

| Tier | What It Stores | Where On Disk | Scope | Auto-Loaded? |
| --- | --- | --- | --- | --- |
| **Copilot Memory** (`/memories/`) | VS Code workflow tips, tool workarounds, cross-workspace patterns | `%APPDATA%/Code/User/globalStorage/github.copilot-chat/memory-tool/memories/` | Global (all workspaces) | Yes — first 200 lines (but Alex disables auto-injection; see below) |
| **AI-Memory** | User identity, cross-project knowledge, patterns, learning goals | OneDrive `AI-Memory/` or `~/.alex/AI-Memory/` | Global (all workspaces) | No — on-demand reads |
| **Project Memory** (`.github/`) | Skills, instructions, prompts, muscles, episodic logs | `<workspace>/.github/` | Per-workspace | Yes — by Copilot |

There are also two sub-tiers within Copilot Memory:

| Sub-Tier | Path | Lifecycle |
| --- | --- | --- |
| Session Memory | `/memories/session/` | Cleared after conversation ends |
| Repo Memory | `/memories/repo/` | Permanent, scoped to one repository |

## What Happens at Extension Install

When a user installs the Alex Cognitive Architecture extension from the VS Code Marketplace, the following occurs:

### Step 1: Extension Unpacks (Automatic)

VS Code extracts the `.vsix` package to:

```
%USERPROFILE%/.vscode/extensions/fabioc-aloha.alex-cognitive-architecture-<version>/
```

The extension bundle includes:

- `dist/extension.js` — compiled extension code
- `assets/` — icon and sidebar SVG
- `.github/` — the complete brain (skills, instructions, prompts, muscles, agents, config)
- `package.json`, `README.md`, `CHANGELOG.md`, `LICENSE.md`

The `.github/` directory inside the extension package is the **source of truth** for brain files. It gets there via `sync-architecture.cjs` at build time, which copies from the repository root `.github/` into `platforms/vscode-extension/.github/`.

### Step 2: Extension Activates (Automatic)

On first activation, `extension.ts` runs `activate()`:

1. **Safety settings enforced** — `enforceSafetySettings()` disables `github.copilot.chat.copilotMemory.enabled` globally. This prevents Copilot's native memory feature from auto-loading `/memories/` files into every LLM prompt (a PII exposure risk). Alex manages its own memory tiers instead.

2. **Chat participant registered** — The `@alex` chat participant becomes available in Copilot Chat.

3. **Sidebar created** — The Alex sidebar panel appears in the Activity Bar with two tabs: Loop and Setup.

4. **Commands registered** — `alex.initialize`, `alex.upgrade`, `alex.setupAIMemory`, `alex.dream`, etc.

**What does NOT happen at install:**

- No files are written to the user's workspace
- No memory files or directories are created
- No AI-Memory folder is scaffolded
- No Copilot Memory files are created
- The `.github/` brain is NOT copied to any workspace

The extension is passive until the user takes action.

## Initializing a Workspace (User-Triggered)

### Trigger

The user clicks **Initialize Workspace** in the sidebar Setup tab, or runs the `Alex: Initialize Workspace` command from the Command Palette.

### Flow

```
User clicks "Initialize Workspace"
  │
  ├─ 1. enforceSafetySettings()
  │     └─ Disables Copilot native memory (PII protection)
  │
  ├─ 2. Check AI-Memory
  │     ├─ resolveAIMemoryPath() finds existing path? → continue
  │     └─ Not found? → Prompt: "Set up AI-Memory?" → Yes/Skip
  │           └─ If Yes → setupAIMemory() (see AI-Memory section below)
  │
  └─ 3. bootstrapBrainFiles()
        └─ Direct filesystem copy from extension bundle
            └─ Copies brain-files/ from VSIX into workspace .github/
            └─ Creates: skills/, instructions/, prompts/, muscles/,
               agents/, config/, hooks/, copilot-instructions.md,
               ABOUT.md, NORTH-STAR.md, EXTERNAL-API-REGISTRY.md
```

The file scaffolding is performed by `bootstrapBrainFiles()` in `bootstrap.ts` — a direct filesystem copy operation using Node.js `fs` APIs. No LLM or chat session is involved. The extension copies the bundled `brain-files/` directory structure into the workspace's `.github/` folder.

### What Gets Created in the Workspace

After initialization, the workspace contains:

```
<workspace>/
  .github/
    copilot-instructions.md    ← Project personality and config
    instructions/              ← ~167 procedural memory files
    skills/                    ← ~195 domain knowledge directories
    prompts/                   ← ~41 reusable workflows
    muscles/                   ← ~81 execution scripts + hooks
    agents/                    ← ~22 specialized agent configs
    config/                    ← Runtime configuration files
    assets/                    ← Brand assets
    ABOUT.md                   ← Explains the .github/ folder
    NORTH-STAR.md              ← Vision document
    SUPPORT.md                 ← Help links
```

Existing files are never overwritten. If the workspace already has a `.github/copilot-instructions.md`, it is preserved.

## AI-Memory Initialization

### Trigger

AI-Memory setup happens in one of three ways:

1. **During Initialize** — prompted if not found
2. **During Upgrade** — prompted if not found
3. **Standalone** — sidebar Setup tab "Setup AI-Memory" button, or `Alex: Setup AI-Memory` command

### Path Discovery

`resolveAIMemoryPath()` searches in priority order:

1. **User setting** — `alex.aiMemory.path` in VS Code settings (if set and directory exists)
2. **Auto-discovery** — scans these locations for an existing `AI-Memory/` folder:

| Platform | Search Locations |
| --- | --- |
| Windows | `%USERPROFILE%/OneDrive*/AI-Memory/` |
| macOS | `~/Library/CloudStorage/OneDrive-*/AI-Memory/` |
| Any | `~/AI-Memory/`, `~/.alex/AI-Memory/` |

3. **null** — not found

### Interactive Setup Flow

If no AI-Memory folder is found, `setupAIMemory()` presents a QuickPick dialog:

```
┌─ AI-Memory Location ─────────────────────────────────┐
│                                                       │
│  ☁ C:\Users\you\OneDrive\AI-Memory                   │
│    OneDrive — recommended (cloud-synced)              │
│                                                       │
│  📁 C:\Users\you\AI-Memory                           │
│    Local fallback                                     │
│                                                       │
│  📁 C:\Users\you\.alex\AI-Memory                     │
│    Local fallback                                     │
│                                                       │
│  📂 Browse...                                         │
│    Choose a custom location                           │
└───────────────────────────────────────────────────────┘
```

OneDrive locations are preferred because they sync across devices.

### Scaffolded Structure

`ensureAIMemoryStructure()` creates the following (only missing items — never overwrites):

```
AI-Memory/
  .github/                   ← (reserved)
  announcements/             ← Master→heir announcements
  feedback/                  ← Bug reports, feature requests
  insights/                  ← Cross-project insights
  knowledge/                 ← Domain knowledge articles
  patterns/                  ← Reusable solution patterns
  global-knowledge.md        ← Cross-project patterns and anti-patterns
  notes.md                   ← Session notes and quick observations
  learning-goals.md          ← Active learning objectives
  user-profile.json          ← Name, role, preferences (identity source of truth)
  project-registry.json      ← Fleet registry of all heir projects
  index.json                 ← File index for knowledge search
```

### Settings Persistence

The chosen path is saved to VS Code's global user settings:

```json
{
  "alex.aiMemory.path": "C:\\Users\\you\\OneDrive\\AI-Memory"
}
```

This setting is global (not workspace-scoped), so all workspaces share the same AI-Memory location.

## Copilot Memory (`/memories/`)

### How It Works

Copilot Memory is a **VS Code-native feature**, not managed by the Alex extension. It stores markdown files at:

```
%APPDATA%/Code/User/globalStorage/github.copilot-chat/memory-tool/memories/
```

These files are created by the LLM itself during conversations using the `memory` tool. When the LLM learns a user preference or pattern, it can call `memory create /memories/filename.md` to persist it.

### Auto-Loading

The first 200 lines of user memory files are automatically injected into every Copilot conversation context. This is why PII management matters — anything stored here is sent through the LLM on every prompt.

### Alex's Relationship to Copilot Memory

Alex **disables auto-injection** of Copilot Memory into LLM prompts (`github.copilot.chat.copilotMemory.enabled = false`) on every activation. This prevents the first 200 lines from being silently sent with every request. The `memory` tool itself remains accessible — the LLM can still read and create memory files during conversations. Alex manages structured knowledge through:

- **AI-Memory** for identity and cross-project knowledge
- **Project Memory** (`.github/`) for workspace-specific architecture
- The `/memories/` path is still accessible via the sidebar "Memories" button for manual inspection

The sidebar Setup tab has a **Memories** button that opens the Copilot memories folder in the OS file explorer, allowing users to inspect or clean up files.

### What Gets Stored There

Despite Alex disabling the auto-load, users may already have Copilot Memory files from before installing Alex, or from conversations where the memory tool was used. Typical content:

| File | Content |
| --- | --- |
| `patterns.md` | Recurring technical patterns and gotchas |
| `health-repo-patterns.md` | Domain-specific notes |
| `pbi-project.md` | Project-specific quick references |

### Sub-Tiers

| Sub-Tier | Path | Created By | Lifecycle |
| --- | --- | --- | --- |
| **User Memory** | `/memories/*.md` | LLM via `memory create` | Permanent until deleted |
| **Session Memory** | `/memories/session/*.md` | LLM via `memory create` | Cleared when conversation ends |
| **Repo Memory** | `/memories/repo/*.md` | LLM via `memory create` | Permanent, scoped to repository |

Session memory files are listed in context but not auto-loaded — the LLM must explicitly read them. Repo memory is stored per-repository and only appears in conversations for that repo.

## Project Memory (`.github/`)

### How It Gets There

The `.github/` directory in a workspace is created during the **Initialize** step (see above). It contains the full cognitive architecture: skills, instructions, prompts, muscles, agents, and config.

### How Copilot Uses It

VS Code Copilot automatically reads certain files from `.github/`:

| File/Pattern | Loading Behavior |
| --- | --- |
| `.github/copilot-instructions.md` | Loaded into every conversation |
| `.github/instructions/*.instructions.md` | Loaded based on `applyTo` glob patterns matching open files |
| `.github/skills/*/SKILL.md` | Available for the LLM to read on demand |
| `.github/prompts/*.prompt.md` | Available as reusable workflow templates |
| `.github/agents/*.agent.md` | Registered as specialized agent modes |
| `.github/config/` | Runtime configuration read by muscles and hooks |

Instructions with `applyTo: "**"` are always loaded. Instructions with specific patterns like `applyTo: "**/*.ts"` only load when a TypeScript file is relevant to the conversation.

### Episodic Memory

Meditation sessions and dream reports are stored in:

```
.github/episodic/          ← Meditation logs
.github/quality/           ← Dream reports, audit results
```

These are created by Alex during maintenance rituals, not during initialization.

## Heir Bootstrap (Post-Initialize)

After initialization, the **Heir Bootstrap Wizard** can further customize the architecture through 10 interactive phases:

| Phase | What It Does | Memory Impact |
| --- | --- | --- |
| 0. Orientation | Scans repo for tech stack, languages, CI | State file created: `.github/.heir-bootstrap-state.json` |
| 1. Verify & Setup | Tests build/test/lint commands | Commands recorded in state |
| 2. Skip | Not applicable for heir projects (agent infra is inherited) | Marked as skipped in state |
| 3. Existing Configs | Detects pre-existing AI configs (CLAUDE.md, .cursorrules) | Conventions optionally ported to instructions |
| 4. Heir Instructions | Generates project-specific `copilot-instructions.md` additions | Writes to `.github/copilot-instructions.md` |
| 5. Path Instructions | Creates `applyTo`-scoped instruction files | Writes to `.github/instructions/` |
| 6. AI-Memory Setup | Finds or creates AI-Memory folder | May scaffold AI-Memory and save setting |
| 7. Heir Skills | Proposes project-specific skill stubs | Writes to `.github/skills/` |
| 8. Heir Agents | Reviews which agents need heir-specific tuning | May create 1-2 prompt files |
| 9. Security | Proposes security hooks | Writes to `.github/config/` |
| 10. Review | Summarizes and cleans up state | Deletes `.heir-bootstrap-state.json` |

Bootstrap state is persisted between sessions so the wizard can resume if interrupted.

## Data Flow Summary

```
┌──────────────────────────────────────────────────────────┐
│                    Extension Bundle                       │
│  .github/ (skills, instructions, prompts, muscles, ...)  │
│                                                          │
│     Copied during Initialize                             │
│              │                                           │
└──────────────┼───────────────────────────────────────────┘
               ▼
┌──────────────────────────────────────────────────────────┐
│              Workspace .github/                           │
│  Project Memory — loaded by Copilot per conversation     │
│  Modified by: meditation, dream, bootstrap, user edits   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│           AI-Memory (OneDrive or local)                   │
│  Cross-project knowledge — read on demand by LLM         │
│  Created by: setupAIMemory() or heir bootstrap Phase 6   │
│  Location saved in: alex.aiMemory.path VS Code setting   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│        Copilot Memory (/memories/)                        │
│  VS Code globalStorage — auto-injection disabled by Alex │
│  Memory tool still works; auto-load prevented for PII    │
│  Still accessible via sidebar "Memories" button           │
└──────────────────────────────────────────────────────────┘
```

## New User Timeline

Here is the exact sequence for a brand new user:

1. **Install extension** from Marketplace
   - Extension unpacks to `~/.vscode/extensions/`
   - No memory files created anywhere

2. **Open a workspace** — extension activates
   - `enforceSafetySettings()` disables Copilot native memory
   - Sidebar appears with Setup tab
   - No files written to workspace

3. **Click "Initialize Workspace"**
   - Extension checks for AI-Memory → not found → offers setup
   - User picks OneDrive location (or skips)
   - AI-Memory folder scaffolded with template files
   - `alex.aiMemory.path` saved to global settings
   - `bootstrapBrainFiles()` copies `.github/` brain to workspace via filesystem APIs
   - Workspace now has full cognitive architecture

4. **(Optional) Run Heir Bootstrap**
   - User asks Alex to bootstrap the project
   - 10-phase wizard customizes the architecture
   - Project-specific instructions, skills, and config created

5. **Start using Alex**
   - `.github/copilot-instructions.md` loaded every conversation
   - Instructions loaded based on `applyTo` file patterns
   - LLM may create `/memories/` files during conversations
   - AI-Memory read on demand for cross-project knowledge
   - Meditation/dream sessions create episodic logs in `.github/episodic/`

## Key Design Decisions

| Decision | Rationale |
| --- | --- |
| Copilot Memory disabled by default | First 200 lines auto-load creates uncontrolled PII exposure via cloud sync |
| AI-Memory prefers OneDrive | Cloud-synced across devices; survives machine replacement |
| Brain copied at Initialize, not at install | Opt-in for workspace mutations (least-surprise principle) |
| No auto-scaffolding | Extension never writes to workspace without user consent |
| Settings stored globally | All workspaces share the same AI-Memory location |
| Bootstrap state persisted to file | Wizard can resume after VS Code restart |
