---
mode: agent
description: "Audit and optimize VS Code's global AI configuration — memories, agents, prompts, and MCP"
tools: ['vscode/memory', 'read', 'search']
---

# User Config Audit

Perform a comprehensive audit of the user's global VS Code AI configuration.

## Scope

Audit these components in `%APPDATA%/Code/User/`:

1. **User Memories** (`globalStorage/github.copilot-chat/memory-tool/memories/`)
   - Check line count against 200-line budget
   - Verify content passes 3-workspace test
   - Flag project-specific content for migration
   - Flag secrets or sensitive data for removal

2. **Custom Agents** (`globalStorage/github.copilot-chat/*-agent/`)
   - List all custom agents
   - Check for overlap with workspace agents
   - Verify tool configurations are appropriate
   - Check model selections are justified

3. **User Instructions** (`prompts/*.instructions.md`)
   - List all user-level instructions
   - Check for conflicts with workspace instructions in `.github/`
   - Flag duplicates for consolidation

4. **User Prompts** (`prompts/*.prompt.md`)
   - List all user-level prompts
   - Check for overlap with workspace prompts
   - Verify mode and tools configurations

5. **MCP Configuration** (`mcp.json`)
   - List configured servers
   - Check for overlap with workspace MCP
   - Note any unreachable servers

## Output

Generate a health report with:

- Summary table showing component counts and health status
- List of critical issues requiring immediate action
- List of warnings for review
- Optimization recommendations
- Proposed actions (with user confirmation before executing)

## Guidelines

- READ ONLY by default — don't modify files without explicit user approval
- Flag but don't delete potentially sensitive content
- Prioritize issues by impact on AI behavior
- Cross-reference with workspace `.github/` to detect conflicts
