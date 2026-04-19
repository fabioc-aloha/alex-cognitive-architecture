# Scheduled Tasks

Automate recurring work with cron-driven tasks that run via GitHub Actions. Alex can write blog posts, run audits, sync documentation, and more — all on autopilot.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [The Schedule Tab](#the-schedule-tab)
- [Walkthrough: Your First Scheduled Task](#walkthrough-your-first-scheduled-task)
- [Walkthrough: Adding a Direct Task](#walkthrough-adding-a-direct-task)
- [Execution Modes](#execution-modes)
- [The Add Task Wizard](#the-add-task-wizard)
- [Schedule Presets and Cron](#schedule-presets-and-cron)
- [Writing Prompt Templates](#writing-prompt-templates)
- [Generating Workflows](#generating-workflows)
- [Configuration Reference](#configuration-reference)
- [Examples](#examples)
- [Requirements and Setup](#requirements-and-setup)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)

---

## Overview

The scheduling system lets you define tasks that run automatically on a cron schedule. It has three parts:

| Part | What | Where |
|------|------|-------|
| **Config** | Task definitions | `.github/config/scheduled-tasks.json` |
| **Workflows** | GitHub Actions YAML | `.github/workflows/scheduled-*.yml` |
| **Sidebar** | Visual management | Alex sidebar → Schedule tab |

Tasks use one of two execution modes:

| Mode | How It Works | Best For |
|------|-------------|----------|
| **Cloud Agent** | Creates a GitHub issue assigned to Copilot, which reads the instructions and works autonomously | Creative tasks — writing, analysis, code reviews |
| **Direct** | Runs a script in GitHub Actions, commits results, and opens a PR | Mechanical tasks — audits, builds, syncs, linting |

---

## Quick Start

Already familiar with Alex? Here's the 60-second version:

1. Open the Alex sidebar → **Schedule** tab
2. Click **Add Task** → follow the wizard
3. Enable the task with the toggle button
4. Click **Generate Workflows**
5. Commit and push the generated `.github/workflows/scheduled-*.yml` file
6. Your task now runs on schedule

---

## The Schedule Tab

Open the Alex sidebar (`Ctrl+Shift+A` or click the Alex icon) and click **Schedule**.

### What You See

Each configured task appears as a card showing:

- **Status indicator** — Green dot = enabled, gray circle = disabled
- **Task name** — What the automation is called
- **Mode badge** — "Cloud Agent" or "Direct" with an icon
- **Schedule badge** — Human-readable frequency (e.g., "Every 6h")
- **Target badge** — Output directory, if configured
- **Description** — Brief explanation of what the task does

### Action Buttons

| Button | Icon | What It Does |
|--------|------|-------------|
| **Add Task** | + | Opens the guided wizard to create a new task |
| **Generate Workflows** | ⚙ | Converts enabled tasks into GitHub Actions YAML files |
| **Edit Config** | ✏ | Opens `scheduled-tasks.json` in the editor |
| **Help** | ? | Opens this documentation page |

### Toggling Tasks

Click the play/pause button on any task card to enable or disable it. This writes directly to `scheduled-tasks.json`. After toggling, run **Generate Workflows** to update the workflow files.

---

## Walkthrough: Your First Scheduled Task

This walkthrough creates a cloud agent task that writes a weekly project summary.

### Step 1: Open the Schedule Tab

Click the Alex icon in the sidebar, then click the **Schedule** tab. If no tasks exist yet, you'll see an empty state with an **Add Task** button.

### Step 2: Run the Add Task Wizard

Click **Add Task**. The wizard asks five questions:

**Question 1 — Name:**

```
Weekly Project Summary
```

**Question 2 — Description:**

```
Summarize recent commits and PR activity into a weekly digest
```

**Question 3 — Mode:**

Select **Cloud Agent** (Copilot will write the summary creatively).

**Question 4 — Schedule:**

Select **Weekly Monday** (runs every Monday at 8 AM UTC).

**Question 5 — Skill:**

Select **(none)** or pick a relevant skill if you have one.

### Step 3: Review What Was Created

The wizard creates:

- A new entry in `.github/config/scheduled-tasks.json`
- A prompt template at `.github/config/scheduled-tasks/weekly-project-summary.md`

The task starts **disabled**. You can see it in the Schedule tab as a grayed-out card.

### Step 4: Customize the Prompt Template

Open `.github/config/scheduled-tasks/weekly-project-summary.md` and edit it:

```markdown
# Weekly Project Summary

## Task

Write a weekly project summary based on recent repository activity.

## Instructions

1. Review commits from the last 7 days using `git log --since="7 days ago"`
2. Check open and recently merged pull requests
3. Identify the top 3-5 most significant changes
4. Write a clear, concise summary (300-500 words)
5. Save to `docs/weekly-summaries/YYYY-MM-DD.md`
6. Create a PR titled "docs: weekly summary YYYY-MM-DD"

## Quality Standards

- Use past tense for completed work
- Group changes by category (features, fixes, refactoring)
- Highlight breaking changes prominently
- Keep technical jargon appropriate for the team
```

### Step 5: Enable and Generate

1. Click the **play button** on the task card to enable it
2. Click **Generate Workflows**
3. A terminal opens and runs the generator

You'll see output like:

```
Found 1 task, 1 enabled
Generated: scheduled-weekly-project-summary.yml

Done. 1 workflow(s) generated.
```

### Step 6: Commit and Push

```bash
git add .github/
git commit -m "feat: add weekly project summary automation"
git push
```

The workflow is now active. Every Monday at 8 AM UTC, GitHub Actions will create an issue assigned to Copilot, which reads your prompt template and creates a PR with the summary.

### Step 7: Verify

- Check the **Actions** tab on GitHub to see scheduled runs
- Click **workflow_dispatch** to trigger a manual test run
- Review the issue Copilot creates and the resulting PR

---

## Walkthrough: Adding a Direct Task

This walkthrough creates a direct task that runs a linting script daily.

### Step 1: Create the Script

First, create the script the task will run. For example, `.github/muscles/lint-report.cjs`:

```javascript
#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");

const output = execSync("npx eslint src --format json", {
  encoding: "utf-8",
  stdio: ["pipe", "pipe", "pipe"],
});

const report = JSON.parse(output);
const errorCount = report.reduce((sum, f) => sum + f.errorCount, 0);
const warningCount = report.reduce((sum, f) => sum + f.warningCount, 0);

const summary = `# Lint Report — ${new Date().toISOString().slice(0, 10)}

- Errors: ${errorCount}
- Warnings: ${warningCount}
- Files checked: ${report.length}
`;

fs.writeFileSync("docs/lint-report.md", summary, "utf-8");
console.log("Lint report generated.");
```

### Step 2: Add via Wizard or JSON

Using the wizard (click **Add Task**):

1. Name: `Daily Lint Report`
2. Description: `Run ESLint and save a summary report`
3. Mode: **Direct**
4. Schedule: **Daily at 8 AM**
5. Skill: **(none)**

Or edit `scheduled-tasks.json` directly:

```json
{
  "id": "daily-lint",
  "name": "Daily Lint Report",
  "description": "Run ESLint and save a summary report",
  "mode": "direct",
  "schedule": "0 8 * * *",
  "enabled": false,
  "muscle": ".github/muscles/lint-report.cjs",
  "target": "docs/"
}
```

### Step 3: Enable, Generate, Push

Same as the agent walkthrough: enable → generate workflows → commit → push.

The generated workflow will run the script, commit changes to a timestamped branch, and open a PR.

---

## Execution Modes

### Cloud Agent Mode

```
Schedule triggers → GitHub Actions → Creates issue → Copilot reads it → Copilot works → Creates PR
```

**How it works:**

1. GitHub Actions runs on the cron schedule
2. The workflow creates a GitHub issue using `gh issue create`
3. The issue body comes from your prompt template file
4. The issue is assigned to `copilot`
5. Copilot reads the issue, follows the instructions, and opens a PR
6. You review and merge the PR

**Best for:** Writing tasks, analysis, code reviews, documentation updates — anything requiring judgment and creativity.

**Requires:** `COPILOT_PAT` repository secret, Copilot enabled on the repo.

### Direct Mode

```
Schedule triggers → GitHub Actions → Runs script → Commits to branch → Opens PR
```

**How it works:**

1. GitHub Actions runs on the cron schedule
2. The workflow checks out the repo and sets up Node.js
3. It runs your muscle script with any configured arguments
4. If the script produces changes, they're committed to a branch named `scheduled/{id}/{timestamp}`
5. A PR is opened for review

**Best for:** Automated audits, lint checks, data syncs, build reports — anything a script can do deterministically.

**Requires:** The muscle script must exist at the configured path.

---

## The Add Task Wizard

The wizard uses native VS Code quick picks — no complex forms. Five steps, each cancellable.

| Step | Input | Validation |
|------|-------|------------|
| 1. Name | Free text | Required, non-empty |
| 2. Description | Free text | Required, non-empty |
| 3. Mode | Pick: Cloud Agent or Direct | Required |
| 4. Schedule | Pick from presets or custom cron | 5-field POSIX cron |
| 5. Skill | Pick from `.github/skills/` dirs | Optional |

**What the wizard creates:**

- Adds a task entry to `scheduled-tasks.json` (starts disabled)
- For agent mode: scaffolds a prompt template at `.github/config/scheduled-tasks/{id}.md`
- The task ID is auto-generated from the name (lowercase, hyphens)

**What the wizard does NOT do:**

- Generate workflow files (click **Generate Workflows** separately)
- Enable the task (toggle it on when you're ready)
- Push to GitHub (you commit and push)

---

## Schedule Presets and Cron

The wizard offers these presets:

| Preset | Cron Expression | Runs |
|--------|----------------|------|
| Every 3 hours | `0 */3 * * *` | 8 times/day |
| Every 6 hours | `0 */6 * * *` | 4 times/day |
| Every 12 hours | `0 */12 * * *` | Twice daily |
| Daily at 8 AM | `0 8 * * *` | Once daily at 08:00 UTC |
| Daily at noon | `0 12 * * *` | Once daily at 12:00 UTC |
| Weekly Monday | `0 8 * * 1` | Every Monday at 08:00 UTC |
| Weekly Friday | `0 16 * * 5` | Every Friday at 16:00 UTC |
| Custom | _(you enter it)_ | Any valid cron |

### Understanding Cron Expressions

Cron uses 5 fields separated by spaces:

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
│ │ │ │ │
* * * * *
```

**Common patterns:**

| Pattern | Meaning |
|---------|---------|
| `*` | Every value |
| `*/N` | Every N intervals |
| `0 8 * * *` | Daily at 8 AM |
| `0 8 * * 1-5` | Weekdays at 8 AM |
| `30 6,18 * * *` | 6:30 AM and 6:30 PM |
| `0 0 1 * *` | First of each month |

**Important:** GitHub Actions cron times are **UTC**. Factor in your timezone offset.

---

## Writing Prompt Templates

Prompt templates are markdown files that become the issue body for cloud agent tasks. Copilot reads them as instructions.

### Template Structure

A good template has four sections:

```markdown
# Task Name

## Task
One-paragraph description of what to do.

## Instructions
1. Step-by-step procedure
2. Be specific about file locations
3. Include commands to run if needed
4. Specify the output format and location
5. Say how to create the PR

## Quality Standards
- What "done right" looks like
- Style guidelines
- Things to avoid

## Context
- Relevant files: `src/components/`, `docs/`
- Conventions: Follow existing patterns in the codebase
- References: Link to style guides or standards
```

### Tips for Better Templates

- **Be specific.** "Write a blog post" is vague. "Write an 800-1500 word blog post in first person, saved to `blog/` with the next sequence number" is actionable.
- **Include file paths.** Copilot needs to know where to read and write.
- **Set boundaries.** "Do not modify files outside `docs/`" prevents scope creep.
- **Specify the PR.** "Create a PR titled `docs: weekly summary YYYY-MM-DD`" gives clear output.
- **Reference skills.** If you associate a skill, mention it: "Follow the guidelines in the blog-writer skill."

---

## Generating Workflows

The workflow generator converts your config into GitHub Actions YAML files.

### From the Schedule Tab

Click **Generate Workflows**. A terminal opens and runs:

```
node .github/muscles/generate-scheduled-workflows.cjs
```

### From the Command Line

```bash
node .github/muscles/generate-scheduled-workflows.cjs
```

### Dry Run

Preview what would be generated without writing files:

```bash
node .github/muscles/generate-scheduled-workflows.cjs --dry-run
```

### What Happens

1. Reads `.github/config/scheduled-tasks.json`
2. For each **enabled** task, generates `.github/workflows/scheduled-{id}.yml`
3. Removes stale workflow files for tasks that no longer exist or were renamed
4. Reports what was generated

Disabled tasks are skipped — no workflow is generated for them.

### After Generating

Commit and push the generated files:

```bash
git add .github/workflows/scheduled-*.yml
git commit -m "ci: update scheduled task workflows"
git push
```

GitHub Actions picks up the new cron schedules automatically.

---

## Configuration Reference

### File Location

`.github/config/scheduled-tasks.json`

### Full Schema

```json
{
  "$schema": "./scheduled-tasks.schema.json",
  "version": "1.0.0",
  "tasks": [
    {
      "id": "task-id",
      "name": "Human-Readable Name",
      "description": "What this task does",
      "skill": "optional-skill-name",
      "mode": "agent",
      "schedule": "0 */6 * * *",
      "enabled": false,
      "promptFile": ".github/config/scheduled-tasks/task-id.md",
      "muscle": ".github/muscles/script.cjs",
      "muscleArgs": ["--flag", "value"],
      "target": "output/directory/"
    }
  ]
}
```

### Property Reference

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `id` | string | Yes | — | Unique identifier. Lowercase letters, numbers, hyphens only. |
| `name` | string | Yes | — | Display name shown in the Schedule tab. |
| `description` | string | Yes | — | Brief description of the task's purpose. |
| `mode` | `"agent"` or `"direct"` | Yes | — | Execution mode. |
| `schedule` | string | Yes | — | POSIX cron expression (5 fields). |
| `enabled` | boolean | Yes | — | Whether the task runs on schedule. |
| `skill` | string | No | — | Name of an associated skill in `.github/skills/`. |
| `promptFile` | string | No | — | Path to the issue body template (agent mode). |
| `muscle` | string | No | — | Path to the script to run (direct mode). |
| `muscleArgs` | string[] | No | `[]` | Arguments passed to the muscle script. |
| `target` | string | No | — | Output directory (shown as a badge in the UI). |

### Validation

A JSON Schema is provided at `.github/config/scheduled-tasks.schema.json`. VS Code will show validation errors inline if the `$schema` field is set.

---

## Examples

### Example 1: Daily Changelog Generator

Automatically compile a changelog from merged PRs each day.

```json
{
  "id": "daily-changelog",
  "name": "Daily Changelog",
  "description": "Compile changelog from merged PRs",
  "mode": "agent",
  "schedule": "0 7 * * *",
  "enabled": true,
  "promptFile": ".github/config/scheduled-tasks/daily-changelog.md"
}
```

Prompt template:

```markdown
# Daily Changelog

## Task
Generate a changelog entry from PRs merged in the last 24 hours.

## Instructions
1. List merged PRs since yesterday using `gh pr list --state merged --search "merged:>=$(date -d yesterday +%Y-%m-%d)"`
2. Group by category: Features, Fixes, Maintenance
3. Write a concise entry in Keep a Changelog format
4. Append to CHANGELOG.md under the [Unreleased] section
5. Create a PR titled "docs: daily changelog $(date +%Y-%m-%d)"

## Quality Standards
- Use present tense ("Add feature" not "Added feature")
- Include PR numbers as links
- Skip dependabot/automated PRs
```

### Example 2: Weekly Dependency Check

Run `npm audit` weekly and create a report.

```json
{
  "id": "dependency-check",
  "name": "Weekly Dependency Check",
  "description": "Run npm audit and report vulnerabilities",
  "mode": "direct",
  "schedule": "0 9 * * 1",
  "enabled": true,
  "muscle": ".github/muscles/dependency-check.cjs",
  "target": "docs/security/"
}
```

### Example 3: Documentation Freshness Audit

Check for stale documentation monthly.

```json
{
  "id": "docs-freshness",
  "name": "Documentation Freshness Audit",
  "description": "Find docs not updated in 90+ days",
  "mode": "agent",
  "schedule": "0 10 1 * *",
  "enabled": true,
  "promptFile": ".github/config/scheduled-tasks/docs-freshness.md"
}
```

### Example 4: Nightly Test Report

Run tests every night and save a summary.

```json
{
  "id": "nightly-tests",
  "name": "Nightly Test Report",
  "description": "Run full test suite and save results",
  "mode": "direct",
  "schedule": "0 2 * * *",
  "enabled": true,
  "muscle": ".github/muscles/test-report.cjs",
  "target": "docs/test-reports/"
}
```

### Example 5: Blog Writer (Built-in)

This task ships with Alex out of the box.

```json
{
  "id": "blog-writer",
  "name": "Alex Blog Writer",
  "description": "Write a new blog post from recent brain changes and commits",
  "skill": "blog-writer",
  "mode": "agent",
  "schedule": "0 */6 * * *",
  "enabled": false,
  "promptFile": ".github/config/scheduled-tasks/blog-writer.md",
  "target": "master-wiki/blog/"
}
```

---

## Requirements and Setup

### GitHub Repository Requirements

| Requirement | Agent Mode | Direct Mode |
|-------------|-----------|-------------|
| GitHub Actions enabled | Yes | Yes |
| Copilot enabled | Yes | No |
| `COPILOT_PAT` secret | Yes | No |
| Node.js (in workflow) | No | Yes (auto-setup) |

### Setting Up COPILOT_PAT

For cloud agent tasks, you need a Personal Access Token:

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Click **Generate new token**
3. Set permissions:
   - **Issues**: Read and write
   - **Pull requests**: Read and write
   - **Contents**: Read and write
4. Copy the token
5. In your repository: **Settings → Secrets and variables → Actions**
6. Click **New repository secret**
7. Name: `COPILOT_PAT`, Value: _(paste your token)_

### Setting Up Copilot for Issues

For Copilot to respond to assigned issues:

1. Go to your repository **Settings → Copilot → Coding agent**
2. Enable "Allow Copilot to work on issues"
3. Configure allowed tools and permissions

---

## FAQ

### Can I run a task manually?

Yes. Go to your repository's **Actions** tab, find the workflow, and click **Run workflow**. All scheduled workflows include `workflow_dispatch` for manual triggering.

### Do tasks run if the repo has no recent commits?

Yes. GitHub Actions cron triggers run regardless of commit activity.

### Can I have the same script on different schedules?

Yes. Create multiple task entries with different IDs that reference the same muscle script:

```json
[
  { "id": "lint-daily", "muscle": ".github/muscles/lint.cjs", "schedule": "0 8 * * *" },
  { "id": "lint-weekly-full", "muscle": ".github/muscles/lint.cjs", "muscleArgs": ["--full"], "schedule": "0 8 * * 1" }
]
```

### What happens if a task fails?

- **Agent mode**: The issue is still created. If Copilot can't complete the work, the issue remains open for manual follow-up.
- **Direct mode**: The GitHub Actions run shows as failed. Check the Actions tab for error details. No PR is created if the script fails.

### Can I schedule tasks more frequently than hourly?

GitHub Actions cron has a minimum granularity of 5 minutes, but schedules more frequent than hourly may experience delays. GitHub does not guarantee exact timing — runs may be delayed by up to 15 minutes during peak times.

### Are task changes version controlled?

Yes. Everything lives in `.github/` — the config, templates, and generated workflows are all committed to your repo. Changes are reviewable in pull requests.

### Can I edit the generated workflow files?

You can, but changes will be overwritten the next time you run **Generate Workflows**. If you need custom workflow steps, consider creating a separate workflow that's not prefixed with `scheduled-`.

### How do I remove a task?

1. Delete the task entry from `scheduled-tasks.json`
2. Click **Generate Workflows** (this cleans up the stale workflow file)
3. Commit and push

### Do tasks work in private repositories?

Yes. Both modes work with private repos. Agent mode requires Copilot to have access to the repository.

---

## Troubleshooting

### Tasks Not Running

**Check the basics:**

1. Is the task **enabled** in `scheduled-tasks.json`?
2. Was the workflow file **generated** and pushed to the repo?
3. Are GitHub Actions enabled for the repository?

**Check the Actions tab:**

Go to your repository → **Actions** tab → find the workflow → check run history.

**Check the cron timing:**

GitHub Actions cron uses UTC. A task scheduled for `0 8 * * *` runs at 8 AM UTC, not your local time. Also note GitHub may delay runs by up to 15 minutes.

### Workflows Not Generated

- Make sure at least one task is **enabled**
- Run manually: `node .github/muscles/generate-scheduled-workflows.cjs`
- Try dry run first: `node .github/muscles/generate-scheduled-workflows.cjs --dry-run`
- Check the terminal output for error messages

### Copilot Not Responding to Issues

1. Verify Copilot coding agent is enabled: **Settings → Copilot → Coding agent**
2. Check the issue is assigned to `copilot` (not `@copilot`)
3. Verify `COPILOT_PAT` has the right permissions (issues + PRs + contents)
4. Check if the PAT has expired

### Toggle Not Working

- Ensure the workspace has a `.github/config/scheduled-tasks.json` file
- Check file permissions — the extension needs write access
- Try clicking **Edit Config** to verify the file is valid JSON

### Schedule Tab Empty

- The Schedule tab reads from `.github/config/scheduled-tasks.json`
- If the file doesn't exist, you'll see the empty state with an **Add Task** button
- Run `@alex initialize` to set up the workspace if Alex hasn't been configured yet

### Workflow Generator Script Missing

If clicking **Generate Workflows** shows "not found":

- The script should be at `.github/muscles/generate-scheduled-workflows.cjs`
- Run `@alex sync` or re-initialize the workspace to restore brain files
- Alternatively, generate workflows manually by writing the YAML

---

*Need more help? Ask Alex: `@alex I need help with scheduled tasks`*
