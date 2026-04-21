---
description: "Manage VS Code's global AI configuration — user memories, user prompts, and MCP servers"
application: "When reviewing, organizing, or troubleshooting user-level Copilot configuration"
applyTo: "**/*memory*,**/*agent*,**/*prompt*,**/*mcp*,**/*user-config*"
currency: 2026-04-21
---

# User Config Management

## User Config Locations

VS Code user data folder:
- **Windows**: `%APPDATA%/Code/User/`
- **macOS**: `~/Library/Application Support/Code/User/`
- **Linux**: `~/.config/Code/User/`

| Component | Path | Scope |
|-----------|------|-------|
| **User Memories** | `<USER_DATA>/globalStorage/github.copilot-chat/memory-tool/memories/` | All workspaces |
| **User Prompts** | `<USER_DATA>/prompts/*.prompt.md` | All workspaces |
| **MCP Config** | `<USER_DATA>/mcp.json` (access via `MCP: Open User Configuration`) | Profile-scoped |

**Workspace-level** (shared with team):
- Custom agents: `.github/agents/*.agent.md`
- Instructions: `.github/instructions/*.instructions.md`
- MCP config: `.vscode/mcp.json`

> **Note**: User-level `~/.copilot/instructions/` and `~/.copilot/agents/` are supported by VS Code but Alex no longer deploys content there. All Alex instructions and agents live at the workspace level via `.github/`.

## Scope Boundaries

### What Belongs in User Config

- **Universal identity**: Name, role, communication preferences
- **Cross-project patterns**: Lessons learned that apply everywhere
- **Tool preferences**: CLI tools, diagram preferences, formatting rules
- **Global expertise**: Domain knowledge not tied to any workspace

### What Does NOT Belong in User Config

- **Project-specific settings** → `.github/` or `/memories/repo/`
- **Team conventions** → Workspace `.github/copilot-instructions.md`
- **Secrets/tokens** → VS Code SecretStorage or environment variables
- **Temporary session notes** → `/memories/session/`

## Custom Agent Format

```markdown
---
name: AgentName
description: What the agent does
argument-hint: Input guidance for users
model: claude-sonnet-4          # Optional, can be array for fallback
target: vscode
user-invocable: true            # Show in agents dropdown (default: true)
disable-model-invocation: false # Allow as subagent (default: false)
tools: ['search', 'read', 'web', 'vscode/memory']
agents: ['SubAgentName']        # Other agents this can call (* for all)
handoffs:                       # Buttons shown after completion
  - label: Continue
    agent: implementation
    prompt: 'Start implementing...'
    send: false
    model: GPT-5 (copilot)      # Optional model override
hooks:                          # Preview: agent-scoped hooks
  onFileEdited: ["npm run lint"]
---

You are [AGENT NAME], a specialized assistant...

Reference tools inline with #tool:web/fetch syntax.
```

**Note**: VS Code also supports `.claude/agents/*.md` with Claude-specific format.

## Conflict Resolution

When user instructions conflict with workspace instructions:

1. **Workspace wins** for project-specific concerns
2. **User wins** for personal preferences (formatting, style)
3. **Most specific wins** — narrow `applyTo` beats broad

## MCP Server Guidelines

User-level `mcp.json` should contain:

- **Global utility servers**: markitdown, fetch tools
- **Enterprise servers**: Microsoft Graph, GitHub MCP
- **Personal servers**: Local tools you use everywhere

Workspace-level MCP should contain:

- **Project-specific servers**: Custom APIs, local databases
- **Team-shared servers**: Shared infrastructure tools

## Quick Commands

```bash
# View user memories
memory view /memories/

# Create new memory file
memory create /memories/new-topic.md

# Edit memory
memory str_replace /memories/file.md "old" "new"
```

## Health Checks

Run periodically:

- **Memory budget**: User memories should stay under 150 lines
- **MCP reachability**: Confirm MCP servers respond
- **Prompt deduplication**: Check user prompts don't duplicate workspace prompts
