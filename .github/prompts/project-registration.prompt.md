---
description: "Register or update this project in the fleet registry"
mode: "agent"
tools: ["run_in_terminal", "read_file", "replace_string_in_file"]
---

# Register Project in Fleet Registry

Register or update this project's metadata in the AI-Memory project registry.

## Context

- Registry: `~/OneDrive - Correa Family/AI-Memory/project-registry.json`
- Schema version: 2.0.0
- Syncs via OneDrive to all machines

## Task

1. **Read current registry** from AI-Memory location
2. **Detect project metadata**:
   - Path: Current workspace root
   - Name: Folder name
   - Technologies: Scan for package.json, tsconfig, requirements.txt, etc.
   - Brain health: Count skills and instructions in .github/
3. **Check if project exists** in registry (match by path)
4. **Update or add entry**:
   - Preserve existing successfulPatterns and frictionPoints
   - Update technologies, health metrics, lastAccessed
   - Set status based on activity
5. **Write updated registry**
6. **Report changes made**

## Pattern Discovery (Optional)

If the user mentions a successful solution or recurring issue:
- Add to `successfulPatterns` or `frictionPoints` respectively
- Suggest checking other projects for similar patterns

## Output

Confirm registration with:
- Project name and path
- Technologies detected
- Brain health (skill/instruction count)
- Any patterns added
