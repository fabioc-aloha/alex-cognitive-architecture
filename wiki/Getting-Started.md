# Getting Started

![Getting Started](./assets/banner-getting-started.svg)

Get up and running with Alex in 5 minutes.

## Prerequisites

- **VS Code** 1.100 or later
- **GitHub Copilot** subscription (Alex uses Copilot's language models)
- **Node.js** 18+ (for heir project features)

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for "Alex Cognitive Architecture"
4. Click **Install**
5. Reload VS Code when prompted

### From VSIX (Manual)

```bash
code --install-extension alex-cognitive-architecture-X.X.X.vsix
```

## First Launch

When you first install Alex, you'll see the **Alex Welcome** sidebar panel. This is your command center.

### The Welcome Experience

1. **Loop Tab** — Quick actions and prompts organized by category
2. **Autopilot Tab** — Manage [automated tasks](Autopilot) that run on cron schedules
3. **Setup Tab** — First-time configuration and workspace initialization

### Initial Setup

Alex will prompt you to:

1. **Accept the partnership** — Alex remembers your preferences and learns from sessions
2. **Set your persona** — Are you primarily a Developer, Researcher, or Writer?
3. **Choose your workspace** — Alex adapts to your project structure

## Your First Conversation

Open Copilot Chat (`Ctrl+Shift+I`) and just talk naturally:

```
What can you help me with?
```

Alex will introduce available capabilities based on your workspace. You can ask follow-up questions like a normal conversation:

```
Can you explain the Creative Loop workflow?
```

```
Help me debug this function
```

```
What skills do you have for code review?
```

## Common Tasks

Here are some things you can ask Alex to do:

| What You Want | What to Say or Do |
|---------------|-------------------|
| Check brain health | Click **Brain Health Check** in Setup tab, or "Run a dream" |
| Validate skills | Click **Validate Skills** in Setup tab |
| See token costs | Click **Token Cost Report** in Setup tab |
| Lint a markdown file | Right-click a `.md` file → **Alex: Lint Markdown** |
| Create a new skill | Click **New Skill** in Setup tab |
| Consolidate learning | Click **Meditate** or "Let's do a meditation session" |
| Set up workspace | Click **Initialize Workspace** in Setup tab |
| Learn about project | "What do you know about this codebase?" |

## Configure Your Workspace

For Alex to work best in your project, create a `copilot-instructions.md` file:

```bash
# In your project root
echo "# Project Instructions\n\nThis is a TypeScript project using React." > .github/copilot-instructions.md
```

Or just ask Alex:

```
Initialize this workspace and create project instructions
```

## What's Next?

- **[User Manual](User-Manual)** — Learn all commands and UI features
- **[Heir Project Setup](Heir-Project-Setup)** — Configure Alex for your specific project
- **[FAQ](FAQ)** — Common questions and troubleshooting

## Recommended Settings

For the best experience with VS Code 1.117+, add to your `settings.json`:

```json
{
  "chat.permissions.default": "autopilot"
}
```

This enables persistent autopilot mode — Alex can run tools without per-action approval across sessions.

---

*Alex learns your patterns. The more you work together, the better the partnership becomes.*
