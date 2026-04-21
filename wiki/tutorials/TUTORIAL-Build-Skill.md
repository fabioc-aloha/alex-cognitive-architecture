# Tutorial: Building Your Own Skill

![Build a skill](tutorials/images/tutorial-build-skill.png)

*45 minutes · Advanced*

---

## What You'll Build

A custom skill file that teaches Alex domain-specific knowledge — patterns, procedures, and expertise that make Alex better at tasks in your area.

After this tutorial, you'll extend Alex's capabilities for your specific needs.

---

## 📋 Prerequisites

- Alex installed in VS Code
- Completed basic tutorials (Instructions and Prompts)
- A domain where you have expertise Alex lacks

---

## Skills vs Instructions vs Prompts

| Type | Purpose | When Loaded |
|------|---------|-------------|
| **Instruction** | Rules and conventions | Automatically, based on file patterns |
| **Prompt** | Saved workflows | Manually invoked |
| **Skill** | Deep domain knowledge | On request or when relevant |

Skills are for **expertise** — the kind of knowledge that takes pages to explain, not just a few rules.

---

## 📍 Steps

### Step 1: Identify the Gap

What does Alex not know that you wish it did?

Good skill candidates:
- Your company's deployment process
- A framework Alex handles poorly
- Domain-specific vocabulary and patterns
- Procedures with many steps and edge cases

Bad skill candidates (use instructions instead):
- Coding style preferences
- Simple naming conventions
- One-paragraph rules

✅ **Checkpoint**: You should have a topic that requires at least a page of explanation.

---

### Step 2: Create the Skill File

Create a new file:

```
.github/skills/my-domain/SKILL.md
```

Start with the required frontmatter:

```markdown
---
name: "my-domain"
description: "Brief description of what this skill covers"
tier: project
applyTo: "**/*my-domain*"
---

# My Domain Skill

Brief overview of what this skill enables.
```

---

### Step 3: Structure Your Knowledge

Organize the skill with clear sections:

```markdown
## When to Use This Skill

- Trigger phrase 1
- Trigger phrase 2
- File patterns that indicate relevance

## Core Concepts

### Concept 1
Explanation...

### Concept 2
Explanation...

## Procedures

### How to Do X

1. Step one
2. Step two
3. Step three

### How to Do Y

1. Different procedure...

## Common Mistakes

| Mistake | Why It Happens | How to Fix |
|---------|----------------|------------|
| ... | ... | ... |

## Examples

### Good Example
```code
// This is correct because...
```

### Bad Example
```code
// This fails because...
```
```

---

### Step 4: Add Decision Logic

Help Alex make good choices:

```markdown
## Decision Matrix

| Situation | Approach | Rationale |
|-----------|----------|-----------|
| Need speed | Use approach A | Fastest option |
| Need accuracy | Use approach B | Most reliable |
| Limited resources | Use approach C | Lowest overhead |

## If-Then Rules

- IF the system is in production THEN always use the safe deployment path
- IF this is a prototype THEN skip the full review process
- IF multiple teams are involved THEN use the coordination checklist
```

---

### Step 5: Include Reference Material

Add information Alex should have available:

```markdown
## API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/deploy | POST | Trigger deployment |
| /api/status | GET | Check deployment status |

## Configuration Options

```yaml
deployment:
  strategy: rolling  # or: blue-green, canary
  timeout: 300       # seconds
  rollback: auto     # or: manual
```

## Error Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| E001 | Auth failed | Refresh credentials |
| E002 | Timeout | Increase timeout or check network |
```

---

### Step 6: Test the Skill

Ask Alex questions that should trigger your skill:

```
How do I deploy to production?
```

```
What's the right approach for [your domain scenario]?
```

If Alex doesn't use the skill, check:
- Is the `applyTo` pattern correct?
- Is the `name` field present?
- Is the file in `.github/skills/your-skill/SKILL.md`?

---

## 💡 Tips

### Keep It Focused

One skill = one domain. Don't create a "everything about our company" skill.

### Use Real Examples

```markdown
## Real-World Example

In Q3 2024, we had an incident where X happened. 
The correct response was Y because Z.
```

Real examples teach better than abstract rules.

### Version Your Knowledge

```markdown
## Version History

- **v2.1** (2024-06): Added canary deployment section
- **v2.0** (2024-03): Rewrote for new deployment system
- **v1.0** (2023-09): Initial version
```

### Cross-Reference Other Skills

```markdown
For authentication details, see the `auth-patterns` skill.
For monitoring setup, see the `observability` skill.
```

---

## ⚠️ Common Issues

### Skill Not Loading

Check the folder structure:
```
.github/
  skills/
    my-domain/           ← Folder name
      SKILL.md           ← Must be exactly this name
```

### Too Generic

```markdown
## Bad
"Make sure to test your code"

## Good  
"Run the full E2E suite before production deploys:
1. npm run test:e2e
2. Verify all 47 critical paths pass
3. Check the coverage report meets 80% threshold"
```

### Outdated Quickly

Add review dates:
```markdown
> **Last verified**: 2024-06-15
> **Review by**: 2024-09-15
```

---

## Skill Template

```markdown
---
name: "domain-name"
description: "What this skill enables"
tier: project
applyTo: "**/*pattern*"
---

# Domain Name Skill

> One-sentence summary of what this enables.

## When to Use

Trigger this skill when:
- Condition 1
- Condition 2

## Core Concepts

### Key Term 1
Definition and explanation.

### Key Term 2
Definition and explanation.

## Procedures

### Primary Procedure
1. Step
2. Step
3. Step

## Decision Matrix

| Situation | Action |
|-----------|--------|
| Case A | Do X |
| Case B | Do Y |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Error 1 | Solution |

## Examples

### Correct
\`\`\`
code
\`\`\`

### Incorrect
\`\`\`
code
\`\`\`
```

---

## What's Next?

- Share your skill with the team by committing to version control
- Consider promoting stable skills to the global brain
- [Setting Up Autopilot Tasks](TUTORIAL-Autopilot.md) — Automate using your new skill

---

*Skills used: skill-building, skill-creator, architecture-refinement*
