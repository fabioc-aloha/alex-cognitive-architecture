# Tutorial: Setting Up Autopilot Tasks

![Autopilot](tutorials/images/tutorial-autopilot.png)

*20 minutes · Intermediate*

---

## What You'll Build

Scheduled tasks that run automatically — daily standups, weekly reviews, maintenance checks, or any recurring workflow you want Alex to handle.

After this tutorial, you'll have recurring work running on autopilot.

---

## 📋 Prerequisites

- Alex installed in VS Code
- A recurring task you want automated
- Familiarity with Alex's basic operations

---

## What is Autopilot?

Autopilot runs scheduled tasks:

- **Time-based**: Run at 9am daily, every Monday, first of month
- **Event-based**: Run on git commit, file save, workspace open
- **Manual batch**: Run a set of tasks with one click

You define what happens. Alex executes when triggered.

---

## 📍 Steps

### Step 1: Open the Autopilot Tab

In the Alex sidebar, click the **Autopilot** tab (or clock icon).

You'll see:
- **Scheduled Tasks** — Recurring automated work
- **Task History** — What ran and when
- **Quick Actions** — Run tasks manually

---

### Step 2: Create a Scheduled Task

Click **+ New Task** and configure:

**Name**: `Daily Standup Prep`

**Schedule**: `0 8 * * 1-5` (8am weekdays — cron format)

**Prompt**:
```
Review my recent commits and draft a standup update:
- What I completed yesterday
- What I'm working on today
- Any blockers
```

Click **Save**.

✅ **Checkpoint**: The task appears in your Scheduled Tasks list with the next run time displayed.

---

### Step 3: Test the Task

Click the **▶ Run Now** button next to your task.

Alex executes the prompt and shows results. Review the output:
- Is it what you expected?
- Does it need refinement?

Adjust the prompt if needed and test again.

---

### Step 4: Configure Notifications

Click **Settings** on your task:

| Setting | Purpose |
|---------|---------|
| **Notify on completion** | Show notification when task finishes |
| **Notify on failure** | Alert if task errors |
| **Auto-open results** | Show output automatically |
| **Silent mode** | Run without UI disruption |

Choose what fits your workflow.

---

### Step 5: Add More Tasks

Create tasks for your recurring work:

**Weekly Review**
```
Schedule: 0 17 * * 5 (Friday 5pm)
Prompt: Summarize this week's commits, PRs, and progress 
        toward sprint goals
```

**Dependency Check**
```
Schedule: 0 9 * * 1 (Monday 9am)
Prompt: Check for outdated dependencies and security 
        vulnerabilities. Summarize what needs attention.
```

**Doc Freshness**
```
Schedule: 0 10 1 * * (1st of month)
Prompt: Audit README and key documentation for accuracy. 
        Flag anything outdated.
```

---

## 💡 Tips

### Cron Format Quick Reference

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sun=0)
│ │ │ │ │
* * * * *
```

| Schedule | Cron |
|----------|------|
| Every day at 9am | `0 9 * * *` |
| Weekdays at 8am | `0 8 * * 1-5` |
| Every Monday | `0 9 * * 1` |
| First of month | `0 9 1 * *` |
| Every 6 hours | `0 */6 * * *` |

### Chain Tasks

Reference previous task output:

```
After Daily Standup Prep completes, run:
"Post this standup to Slack channel #team-updates"
```

### Use Agent Modes

Specify which agent handles the task:

```
@Researcher Review the latest industry news and summarize 
relevant items for our product
```

### Conditional Execution

Add conditions to prompts:

```
Check for failing tests. If any fail:
- Summarize the failures
- Suggest likely causes
Otherwise report "All green"
```

---

## ⚠️ Common Issues

### Task Doesn't Run

Check:
1. Is VS Code running at the scheduled time?
2. Is the workspace open?
3. Is the cron expression valid?

Autopilot requires VS Code to be active.

### Results Not Useful

Improve your prompt:
- Be more specific about what you want
- Specify the format (bullet points, table, etc.)
- Tell Alex where to look (which files, repos, etc.)

### Too Many Notifications

Use **Silent mode** for background tasks, notify only on failures.

---

## Example Autopilot Setup

Here's a complete weekly workflow:

| Task | Schedule | Purpose |
|------|----------|---------|
| Standup Prep | 8am M-F | Draft daily update |
| Code Review | 2pm daily | Summarize open PRs |
| Test Report | 6pm daily | Run tests, report failures |
| Week Summary | 5pm Friday | Sprint progress review |
| Dep Audit | 9am Monday | Security/update check |
| Doc Review | 10am 1st | Documentation freshness |

---

## Advanced: Custom Task Scripts

For complex automation, create a task script:

**`.github/scheduled-tasks/monthly-audit.md`**

```markdown
# Monthly Audit Task

## Steps
1. Run dependency audit
2. Check test coverage
3. Review open issues older than 30 days
4. Generate summary report

## Output
Save report to `reports/monthly-audit-{date}.md`
```

Reference in Autopilot:
```
Run the monthly audit task from .github/scheduled-tasks/
```

---

## What's Next?

- Explore the pre-built tasks in the Autopilot tab
- [Building Your Own Skill](TUTORIAL-Build-Skill.md) — Create expertise for your tasks
- [Agent Modes](TUTORIAL-Agent-Modes.md) — Use specialized agents in tasks

---

*Skills used: project-management, status-reporting, scope-management*
