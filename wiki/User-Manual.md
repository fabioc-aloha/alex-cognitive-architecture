# User Manual

![User Manual](./assets/banner-user-manual.svg)

Complete reference for Alex commands, UI, and features.

## Table of Contents

- [Chat Commands](#chat-commands)
- [Sidebar Panel](#sidebar-panel)
- [Loop Tab](Loop-Tab)
- [Autopilot Tab](Autopilot)
- [Setup Tab](Setup-Tab)
- [Agents](#agents)
- [Skills](#skills)
- [Memory System](#memory-system)
- [Health Processes](#health-processes)
- [Settings](#settings)

---

## Chat Commands

Interact with Alex through Copilot Chat using the `@alex` participant.

### Core Commands

| Command | Description |
|---------|-------------|
| `@alex help` | List available commands and capabilities |
| `@alex status` | Show cognitive health and memory stats |
| `@alex dream` | Run dream cycle (connection validation) |
| `@alex meditate` | Consolidate recent learning |
| `@alex self-actualize` | Deep architecture assessment |

### Workspace Commands

| Command | Description |
|---------|-------------|
| `@alex initialize` | Set up Alex for current workspace |
| `@alex reset` | Clear workspace-specific settings |
| `@alex sync` | Synchronize heir architecture |

### Agent Mode

| Command | Description |
|---------|-------------|
| `@alex /builder` | Switch to Builder agent (implementation) |
| `@alex /researcher` | Switch to Researcher agent (exploration) |
| `@alex /validator` | Switch to Validator agent (QA) |
| `@alex /documentarian` | Switch to Documentarian agent (docs) |

---

## Sidebar Panel

The Alex sidebar (`Ctrl+Shift+A` or click the Alex icon) contains three tabs:

### Loop Tab

Your primary workspace — guided workflows for every phase of development.

| Section | What It Does |
|---------|-------------|
| **Health Pulse** | Live status widget showing brain health (Healthy / Attention / Critical) |
| **Chat with Alex** | Primary button to open a conversation |
| **Creative Loop** | Six-phase development cycle: Ideate → Plan → Build → Test → Release → Improve |
| **Build Helpers** | Code review, refactoring, debugging, TDD, diagrams, gap analysis |
| **Research & Learn** | Socratic learning, deep research, data analysis, literature review |
| **Communicate** | Presentations, data stories, meeting notes, email drafting |
| **Project Health** | Vision alignment, health checks, doc audits, security, tech debt, dependencies |

Buttons reorder automatically by usage frequency (frecency). The Loop tab is config-driven — its content adapts to your project type and lifecycle phase. See [Loop Tab](Loop-Tab) for full documentation.

### Autopilot Tab

Manage automated recurring tasks powered by GitHub Actions.

| Section | What It Does |
|---------|-------------|
| **Task Cards** | Configured automations with status, mode, schedule, and workflow status badges |\n| **Per-Card Actions** | Edit prompt (agent tasks), Run on GitHub, Delete task |\n| **Add Task** | Guided 5-step wizard for creating new scheduled tasks |\n| **Generate Workflows** | Convert config to GitHub Actions workflow files |\n| **Edit Config** | Open `scheduled-tasks.json` in the editor |\n| **Actions / Agents** | Direct links to the GitHub repo's Actions and Agents pages |

See [Autopilot](Autopilot) for full documentation.

### Setup Tab

Workspace management, brain maintenance, memory access, and settings.

| Section | What It Does |
|---------|-------------|
| **Workspace** | Initialize or upgrade your cognitive architecture |
| **Brain Status** | Dream protocol, meditation, and self-actualization |
| **User Memory** | Quick access to memories, agents, instructions, prompts, and MCP config |
| **Environment** | Extension settings |
| **Learn** | Wiki and issue tracker links |
| **About** | Version, publisher, and license |

See [Setup Tab](Setup-Tab) for full documentation.

---

## Agents

Alex has 18 specialized agents for different tasks. Here are the most commonly used:

| Agent | Specialty | When to Use |
|-------|-----------|-------------|
| **Alex** | General partnership | Default, most conversations |
| **Builder** | Implementation | Writing code, creating features |
| **Researcher** | Exploration | Learning new domains, investigations |
| **Validator** | Quality assurance | Code review, testing, audits |
| **Planner** | Strategy | Architecture, roadmaps, planning |
| **Documentarian** | Documentation | READMEs, wikis, changelogs |
| **Presenter** | Communication | Demos, presentations, stakeholder docs |
| **Frontend** | UI development | React, TypeScript, design systems |
| **Backend** | API development | FastAPI, Pydantic, data services |
| **Infrastructure** | Cloud & IaC | Azure, Bicep, Container Apps |
| **Azure** | Azure services | Azure development with MCP tools |
| **Critical Thinker** | Analysis | High-stakes decisions, bias detection |
| **Image Studio** | Visual content | AI image generation via Replicate |
| **Audio Studio** | Audio content | Voice samples and TTS generation |
| **Brain Ops** | Maintenance | Cognitive architecture fleet management |
| **Skill Builder** | Skill creation | Building trifectas (skill + instruction + muscle) |
| **File Converter** | Format conversion | Document format routing |
| **M365** | Microsoft 365 | Teams and M365 Copilot development |

### Switching Agents

In chat, ask Alex to use a specific agent:
```
@alex Use the Builder agent to create a React component for user profiles
```

Or reference the agent directly:
```
@alex Use the Researcher to investigate OAuth2 best practices
```

---

## Skills

Alex has 182 skills across domains. Skills activate automatically based on context.

### Skill Categories

| Category | Examples |
|----------|----------|
| **Development** | `vscode-extension-patterns`, `api-design`, `testing-strategies` |
| **AI/ML** | `prompt-engineering`, `rag-architecture`, `mcp-development` |
| **Documentation** | `markdown-mermaid`, `lint-clean-markdown`, `md-to-word` |
| **Quality** | `code-review`, `security-review`, `debugging-patterns` |
| **Process** | `release-process`, `git-workflow`, `scope-management` |

### Checking Active Skills

```
@alex What skills are active for this workspace?
```

### Requesting a Skill

```
@alex Use the security-review skill to audit this code
```

---

## Memory System

Alex maintains three types of memory:

### Connections (Long-term)

Learned connections between concepts. Created when Alex discovers patterns or relationships.

- Stored in `.github/connections/`
- Persist across sessions
- Strengthened through repeated use

### Episodic Memory (Session-based)

Records of significant sessions and decisions.

- Stored in `.github/episodic/`
- Captures key moments from conversations
- Used for context in future sessions

### User Memory (Copilot Chat)

Copilot Chat's memory about you, accessible to Alex.

- Cloud-synced across workspaces
- Contains preferences and patterns
- Managed via the Setup tab → User Memory, or `@alex memory audit`

---

## Health Processes

Alex needs maintenance to stay healthy. Run these periodically:

### Dream (Weekly)

Validates and repairs connection network.

```
@alex dream
```

**What it does:**
- Checks connection integrity
- Identifies broken connections
- Proposes repairs
- Reports health score

### Meditate (After major sessions)

Consolidates recent learning into long-term memory.

```
@alex meditate
```

**What it does:**
- Reviews recent sessions
- Extracts key insights
- Creates new connections
- Updates skill activations

### Self-Actualize (Monthly)

Comprehensive architecture assessment.

```
@alex self-actualize
```

**What it does:**
- Full cognitive architecture audit
- Skill usage analysis
- Memory efficiency review
- Improvement recommendations

---

## Settings

Configure Alex through VS Code settings (`Ctrl+,` → search "alex").

### Available Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `alex.workspace.protectedMode` | `false` | Prevents brain operations that modify workspace files. Auto-enabled for Master Alex. |

### Settings File

Create `.vscode/settings.json` in your workspace:

```json
{
  "alex.workspace.protectedMode": true
}
```

---

## Keyboard Shortcuts

Alex uses standard VS Code shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+I` | Open Copilot Chat (talk to Alex) |
| Click Alex icon in Activity Bar | Toggle Alex sidebar |

### Custom Shortcuts

Add to `keybindings.json`:

```json
{
  "key": "ctrl+alt+d",
  "command": "alex.dream",
  "when": "editorTextFocus"
}
```

---

*Alex adapts to how you work. The more context you provide, the better the partnership.*
