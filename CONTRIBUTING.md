# Contributing to Alex Cognitive Architecture

Thank you for your interest in contributing!

## Repository Structure

```text
alex-cognitive-architecture/
├── .github/                           # Cognitive architecture (brain files)
│   ├── copilot-instructions.md        # Main cognitive framework
│   ├── instructions/                  # Behavior rules (auto-loaded by applyTo)
│   ├── skills/                        # Domain knowledge (on-demand)
│   ├── prompts/                       # Reusable workflow templates
│   ├── agents/                        # Agent definitions
│   ├── muscles/                       # Automation scripts
│   └── config/                        # Configuration files
├── platforms/
│   └── vscode-extension/              # VS Code extension source
│       ├── src/                       # TypeScript source
│       ├── brain-files/               # Generated at package time (gitignored)
│       ├── package.json               # Extension manifest
│       ├── esbuild.mjs                # Build script
│       └── sync-brain-files.cjs       # Brain → VSIX packaging
├── wiki/                              # User documentation (published to GitHub Wiki)
├── scripts/                           # Automation and build scripts
├── assets/                            # Repo-level assets (banner, etc.)
├── CHANGELOG.md                       # Release history
├── README.md                          # Project overview
└── LICENSE.md                         # License
```

## Prerequisites

- **Node.js** 20+ and npm
- **VS Code** 1.100+
- **Git**

## Building the VS Code Extension

```bash
# Clone the repository
git clone https://github.com/fabioc-aloha/alex-cognitive-architecture.git
cd alex-cognitive-architecture/platforms/vscode-extension

# Install dependencies
npm install

# Build the extension (type-check + bundle + package brain files)
npm run package
```

This produces `alex-cognitive-architecture-X.X.X.vsix` in the extension directory.

### Build Scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Bundle with esbuild |
| `npm run build:check` | TypeScript type checking |
| `npm run package` | Full build → VSIX (runs prepackage + vsce) |
| `npm run watch` | Development mode with hot reload |
| `npm run lint` | ESLint |
| `npm run clean` | Remove dist/ |

### How Packaging Works

1. `sync-brain-files.cjs` copies `.github/` → `brain-files/` (excluding session data)
2. `vscode:prepublish` runs type-check + production bundle
3. `vsce package` creates the VSIX with brain-files included

### Testing Locally

```bash
# Install the VSIX in your VS Code
code --install-extension alex-cognitive-architecture-8.0.0.vsix
```

Then open a workspace, click the Alex sidebar icon, and run **Install Brain**.

## Development Workflow

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR-USERNAME/alex-cognitive-architecture.git
cd alex-cognitive-architecture
```

### 2. Run in Development Mode

```bash
cd platforms/vscode-extension
npm install
npm run watch
```

Then press `F5` in VS Code to launch the Extension Development Host.

### 3. Validate Brain Files

```bash
# Run brain-qa validation from repo root
node .github/muscles/brain-qa.cjs
```

### 4. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

## Contributing Brain Files

### Skills

Create a directory under `.github/skills/your-skill/` with a `SKILL.md` file:

```markdown
---
name: your-skill
description: "What this skill does"
applyTo: "**/*pattern*"
tier: domain
---

# Your Skill

## Quick Reference

One-paragraph summary.

## Procedural Guide

Step-by-step workflows.
```

### Instructions

Create `.github/instructions/your-topic.instructions.md`:

```markdown
---
description: "When and why this instruction loads"
applyTo: "**/*pattern*"
---

# Your Topic

## Rules

1. First rule
2. Second rule
```

### Prompts

Create `.github/prompts/your-workflow.prompt.md`:

```markdown
---
mode: "agent"
description: "What this prompt does"
---

# Your Workflow

Steps for the AI to follow.
```

## Commit Messages

Format: `{type}: {short description}`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

```text
feat: add security-review skill for OWASP Top 10 audits
fix: correct applyTo pattern in api-design instruction
docs: update User Manual with new agent descriptions
```

## Pull Request Process

1. Ensure `node .github/muscles/brain-qa.cjs` passes with 0 errors
2. Verify `npm run package` succeeds in `platforms/vscode-extension/`
3. Describe what changed and why
4. Link related issues

## Questions?

- [GitHub Issues](https://github.com/fabioc-aloha/alex-cognitive-architecture/issues) — Bug reports and feature requests
- [Wiki](https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki) — User documentation
# Contributing to Alex Cognitive Architecture

**Last Updated**: April 11, 2026

Thank you for your interest in contributing to the Alex Cognitive Architecture project! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Architecture Principles](#architecture-principles)
- [File Naming Conventions](#file-naming-conventions)
- [Memory File Guidelines](#memory-file-guidelines)
- [Connection Integrity](#connection-integrity)
- [Pull Request Process](#pull-request-process)
- [Testing and Validation](#testing-and-validation)

## Code of Conduct

This project adheres to the Contributor Covenant Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior via GitHub issues.

## Getting Started

### Prerequisites

- **Node.js & npm**: Required for building the VS Code Extension
- **VS Code**: Required for extension development
- **Git**: For version control
- **PowerShell 7+**: Optional, for legacy scripts

### Repository Structure

```
AlexMaster/
├── platforms/vscode-extension/          # VS Code extension project
│   ├── src/                             # Extension source code
│   │   ├── commands/                    # Extension commands (Initialize, Dream)
│   │   └── extension.ts                 # Main entry point
│   ├── .github/                         # Cognitive architecture (heir copy)
│   ├── package.json                     # Extension manifest
│   └── tsconfig.json                    # TypeScript configuration
├── .github/                             # Master cognitive architecture (source of truth)
│   ├── copilot-instructions.md          # Main cognitive framework
│   ├── instructions/                    # Procedural memory (.instructions.md)
│   ├── prompts/                         # Episodic memory (.prompt.md)
│   ├── skills/                          # Domain expertise (SKILL.md files)
│   ├── agents/                          # Agent definitions
│   └── config/                          # Configuration files
├── alex_docs/                           # Documentation
├── article/                             # Research papers and articles
└── scripts/                             # Automation tools
```

## Development Process

### 1. Fork and Clone

```bash
# Fork the repository via GitHub UI, then:
git clone https://github.com/YOUR-USERNAME/AlexMaster.git
cd AlexMaster
npm install
```

### 2. Run the Extension

1. Open the project in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. Test commands like `Alex: Initialize Architecture` in the new window.


### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Make Changes

Follow the architecture principles and file conventions detailed below.

### 5. Test Your Changes

```
# Validate architecture integrity via VS Code Command Palette
Alex: Dream

# Review generated report for:
# - Network health status (should be HEALTHY)
# - Broken connections count (should be 0)
# - Total connections (should be 800+)
```

### 6. Validate with brain-qa

```bash
# Run brain-qa validation
node .github/muscles/brain-qa.cjs

# Expected: 0 errors, 0 warnings
```

## Architecture Principles

### 1. **Empirical Foundation**
- All claims must be evidence-based with research backing
- Include citations for psychological, neurological, or cognitive science concepts
- Avoid hyperbole or unsupported statements

### 2. **Grounded Implementation**
- Precise language without exaggeration
- Measured, deliberate changes with impact assessment
- Fact-checking protocol for all new content

### 3. **Memory Capacity Management**
- Working memory limited to 7 rules (4 core + 3 domain-adaptive)
- Trigger consolidation when working memory exceeds capacity
- Use meditation protocols for conscious consolidation

### 4. **Connection Integrity**
- All file references must be valid and current
- Use embedded connection notation: `[file.md] (strength, type, direction) - "activation condition"`
- Maintain connection counts and validate regularly

## File Naming Conventions

### File Type Conventions

| Type             | Pattern                     | Purpose                                  |
| ---------------- | --------------------------- | ---------------------------------------- |
| **Instructions** | `{name}.instructions.md`    | Procedural memory - repeatable processes |
| **Prompts**      | `{name}.prompt.md`          | Episodic memory - complex workflows      |
| **Skills**       | `{name}/SKILL.md`           | Specialized expertise (replaces DK-*.md) |
| **Scripts**      | `{name}.cjs` / `{name}.ps1` | Automation tools (Node.js or PowerShell) |
| **Config**       | `{name}.json`               | Configuration and settings               |

## Memory File Guidelines

### Creating New Instruction Files

```markdown
---
applyTo: '**/*pattern*'
---
# {Title} Instructions

## Purpose
Clear statement of what this instruction file controls.

## Core Principles
Enumerated list of key principles.

## Protocols
Detailed step-by-step procedures.

## Connections
[related-file.md] (high, bidirectional, procedural) - "when X condition occurs"
```

### Creating Skill Files

Skills follow a three-level progressive disclosure pattern. See [.github/skills/](https://github.com/fabioc-aloha/alex-cognitive-architecture/tree/main/.github/skills) for examples.

```markdown
# Skill Name

**Domain**: {Category}
**Trigger Keywords**: {action verbs that activate this skill}

## Level 1: Quick Reference

One-paragraph summary visible in skill listings.

## Level 2: Procedural Guide

Step-by-step workflows and patterns.

## Level 3: Deep Expertise

Detailed knowledge, research citations, edge cases.

## Connections

Connections encoded in the skill folder.
```

## Connection Integrity

### Embedded Connection Notation

When creating connections between files:

```markdown
## Connections
[target-file.md] (strength, relationship-type, direction) - "activation condition"
```

**Parameters**:
- **strength**: low, medium, high, critical
- **relationship-type**: procedural, conceptual, episodic, domain-transfer
- **direction**: unidirectional, bidirectional
- **activation-condition**: When to activate this connection

**Example**:
```markdown
[bootstrap-learning.instructions.md] (high, procedural, bidirectional) - "domain knowledge acquisition"
```

### Validation Requirements

Before submitting a pull request:

```
# Validate all connections via VS Code Command Palette
Alex: Dream

# Expected: HEALTHY status, 0 broken connections, 800+ total connections
```

## Pull Request Process

### 1. Pre-Submission Checklist

- [ ] All connections validated (0 broken references)
- [ ] Version numbers updated following IUPAC convention
- [ ] Research citations included for new concepts
- [ ] Dream protocol health check passed
- [ ] File naming conventions followed

### 2. Commit Message Format

```
{type}: {short description}

{detailed explanation of changes}

{architecture impact}:
- Files modified: {count}
- Connections added/updated: {count}
- Network integrity: {validation result}

{related issues/PRs}
```

**Types**: feat, fix, docs, refactor, test, chore, enhance

**Example**:
```
feat: Add lucid dream integration protocols

Implemented hybrid unconscious-conscious processing bridge
for enhanced meditation sessions with measurable outcomes.

Architecture impact:
- Files modified: 4
- Connections added/updated: 12
- Network integrity: 945 connections, 100% valid

Related: #42, PR #38
```

### 3. Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief overview of changes

## Type of Change
- [ ] New feature (non-breaking change adding functionality)
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] Documentation update
- [ ] Architecture enhancement
- [ ] Connection network optimization

## Architecture Impact
- **Files Modified**: {count}
- **Connections**: {added/updated/removed}
- **Network Integrity**: {validation result}
- **Version Changes**: {if applicable}

## Testing Performed
- [ ] Dream protocol passed (via `Alex: Dream` command)
- [ ] Network health status: HEALTHY
- [ ] Manual validation completed

## Research Foundation
{citations for new concepts, if applicable}

## Checklist
- [ ] Code follows project naming conventions
- [ ] Documentation updated
- [ ] All tests passing
- [ ] No broken references
- [ ] Commit messages follow format
```

## Testing and Validation

### Automated Validation

```bash
# Brain QA comprehensive validation
node .github/muscles/brain-qa.cjs

# Expected results:
# - 0 errors, 0 warnings
# - All phases passed
```

### Manual Validation

1. **File Reference Check**: Verify all `[file.md]` references point to existing files
2. **Version Consistency**: Ensure version numbers match IUPAC naming
3. **Research Citations**: Validate all empirical claims have backing
4. **Impact Assessment**: Document changes to connection network

## Questions or Issues?

- **Documentation Questions**: Open an issue with `docs` label
- **Architecture Discussions**: Open an issue with `architecture` label
- **Bug Reports**: Open an issue with `bug` label
- **Feature Requests**: Open an issue with `enhancement` label

## Recognition

Contributors who maintain connection integrity and follow architecture principles will be recognized in project documentation.

Thank you for contributing to the advancement of empirically-grounded cognitive architectures!
