---
description: "Post-Initialize wizard that tailors Alex's cognitive architecture to a specific heir project"
application: "When bootstrapping new heir projects with Alex's cognitive architecture"
applyTo: "**/*heir*,**/*bootstrap*,**/*initialize*"
currency: 2025-06-01
---

# Heir Bootstrap Protocol

## Prerequisites

- Alex extension installed
- Initialize command completed
- Project has `.github/` folder

## Bootstrap Phases

1. **Project Type**: Identify (VS Code ext, web app, API, etc.)
2. **Stack Detection**: Languages, frameworks, tools
3. **Persona Config**: Developer/Researcher/Writer
4. **Skill Selection**: Relevant skills for project type
5. **Instruction Pruning**: Remove irrelevant instructions
6. **AI-Memory Setup**: Find or create shared AI-Memory folder (cross-project knowledge)
7. **Agent Setup**: Available specialized agents
8. **Quality Gates**: Pre-commit, pre-publish rules
9. **North Star**: Define project vision
10. **Validation**: Run brain-qa to confirm health

## Phase 6: AI-Memory Setup

The AI-Memory folder stores cross-project knowledge (patterns, notes, registry).

- Run `alex.setupAIMemory` command or use the sidebar "Setup AI-Memory" button
- Auto-discovers OneDrive paths (Windows/macOS), falls back to `~/.alex/AI-Memory/`
- User can browse for a custom location
- Creates directory structure and template files (global-knowledge.md, notes.md, user-profile.json, project-registry.json)
- Saves chosen path to `alex.aiMemory.path` setting
- Never overwrites existing content

## Key Files

- `.github/config/project-persona.json`
- `.github/copilot-instructions.md`
- `.github/skills/` (pruned set)
- AI-Memory folder (external, shared across projects)

## Anti-Patterns

- Skipping bootstrap (inherits everything)
- Not tailoring to project type
- Keeping irrelevant skills (noise)
- Skipping AI-Memory setup (loses cross-project knowledge sharing)
