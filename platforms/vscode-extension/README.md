# Alex Cognitive Architecture

[![Version](https://img.shields.io/visual-studio-marketplace/v/fabioc-aloha.alex-cognitive-architecture)](https://marketplace.visualstudio.com/items?itemName=fabioc-aloha.alex-cognitive-architecture)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/fabioc-aloha.alex-cognitive-architecture)](https://marketplace.visualstudio.com/items?itemName=fabioc-aloha.alex-cognitive-architecture)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/fabioc-aloha.alex-cognitive-architecture)](https://marketplace.visualstudio.com/items?itemName=fabioc-aloha.alex-cognitive-architecture)
[![License](https://img.shields.io/github/license/fabioc-aloha/alex-cognitive-architecture)](https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/LICENSE.md)

**Your cognitive learning partner for VS Code.** Alex installs a living brain of skills, instructions, and prompts that makes GitHub Copilot dramatically smarter in any project.

## What Alex Does

Alex enhances GitHub Copilot with a **cognitive architecture** — a structured collection of domain knowledge, behavior rules, and reusable workflows that load automatically based on what you're working on.

| What You Get | How It Works |
|--------------|--------------|
| **195 Skills** | Domain knowledge for security, API design, testing, debugging, and more |
| **159 Instructions** | Behavior rules that auto-load based on file patterns |
| **37 Prompts** | Reusable workflow templates for common tasks |
| **22 Agents** | Specialized personas: Builder, Researcher, Validator, Documentarian, and more |

## Features

### Brain Bootstrap

One-click install deploys the full cognitive architecture into any workspace. Skills, instructions, and prompts are copied to `.github/` where VS Code and Copilot load them automatically.

### Sidebar Dashboard

The Alex sidebar gives you quick access to:

- **Loop Tab** — Creative workflow integration (Ideate → Plan → Build → Test → Release → Improve)
- **Autopilot Tab** — Scheduled tasks, recurring maintenance, and automation
- **Setup Tab** — Configure Alex for your project

### Specialized Agents

Switch between focused agents depending on your task:

| Agent | Best For |
|-------|----------|
| **Alex** | General conversations and broad questions |
| **Builder** | Writing code and implementing features |
| **Researcher** | Learning new topics and deep investigations |
| **Validator** | Code review, testing, and quality audits |
| **Documentarian** | READMEs, wikis, and documentation |
| **Planner** | Architecture decisions and roadmapping |
| **Presenter** | Demos, presentations, and stakeholder docs |

### Health Maintenance

Keep the brain healthy with built-in maintenance rituals:

- **Dream** — Validate and repair the architecture (weekly)
- **Meditate** — Consolidate recent learning (after major sessions)
- **Self-Actualize** — Deep architecture assessment (monthly)

### Autopilot

Schedule recurring brain maintenance tasks that run automatically:

- **Task Cards** — Visual dashboard of scheduled and one-time tasks
- **Enable/Disable Toggles** — Control which tasks run automatically
- **Interval Configuration** — Set frequency per task
- **Workflow Generator** — Create custom scheduled workflows from project analysis

### Settings Optimization

Auto-configure VS Code settings for the best AI experience with a single command.

## Getting Started

1. **Install** the extension from the Marketplace
2. **Click** the Alex icon in the Activity Bar
3. **Install Brain** — click the button in the sidebar to deploy the cognitive architecture
4. **Chat** — open Copilot Chat (`Ctrl+Shift+I`) and start collaborating

> Alex's brain files enhance every Copilot conversation automatically. No `@alex` prefix needed — the skills and instructions load based on what files you have open.

## Commands

| Command | Description |
|---------|-------------|
| `Alex: Install / Update Brain` | Deploy or update the cognitive architecture in your workspace |
| `Alex: Dream` | Run a dream cycle to validate architecture health |
| `Alex: Show Status` | View brain health, version, and skill inventory |
| `Alex: Optimize Settings` | Auto-configure VS Code for optimal AI collaboration |
| `Alex: Open Documentation` | Open the wiki in your browser |

## Requirements

- **VS Code** 1.100 or later
- **GitHub Copilot** subscription (Alex uses Copilot's language models)

## Extension Pack

This extension recommends installing these companions:

| Extension | Purpose |
|-----------|---------|
| GitHub Copilot Chat | Required — Alex enhances Copilot's responses |
| PowerShell | Automation script support |
| YAML | Frontmatter editing in skills and instructions |
| Markdown Mermaid | Diagram rendering in documentation |
| markdownlint | Clean markdown in brain files |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `alex.workspace.protectedMode` | `false` | Prevents brain operations that modify workspace files |

## How It Works

Alex's cognitive architecture is a set of files in `.github/` that VS Code and GitHub Copilot read automatically:

```text
your-project/
└── .github/
    ├── copilot-instructions.md    # Core identity and routing
    ├── instructions/              # Auto-loaded behavior rules
    ├── skills/                    # On-demand domain knowledge
    ├── prompts/                   # Reusable workflow templates
    ├── agents/                    # Specialized agent definitions
    ├── muscles/                   # Automation scripts
    └── config/                    # Configuration
```

- **Instructions** load automatically when you open files matching their `applyTo` patterns
- **Skills** are loaded on demand when Copilot detects relevant context
- **Prompts** are available as reusable templates in Copilot Chat
- **Agents** provide specialized personas you can switch between

## Documentation

- [Getting Started](https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki/Getting-Started) — First-time setup
- [User Manual](https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki/User-Manual) — Complete command and feature reference
- [Heir Project Setup](https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki/Heir-Project-Setup) — Configure Alex for your specific project
- [FAQ](https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki/FAQ) — Common questions and troubleshooting

## Privacy

Alex stores all data locally in your workspace. No data is sent to external servers beyond what GitHub Copilot normally processes. See our [Privacy Policy](https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/PRIVACY.md).

## Known Issues

- Brain files require a workspace folder — Alex cannot operate in untitled/unsaved contexts
- Some skills reference domain-specific tools that may not be installed in your environment

## Release Notes

See the full [Changelog](https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/CHANGELOG.md).

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/CONTRIBUTING.md) for build instructions and guidelines.

## License

[PolyForm Noncommercial 1.0.0](https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/LICENSE.md)
