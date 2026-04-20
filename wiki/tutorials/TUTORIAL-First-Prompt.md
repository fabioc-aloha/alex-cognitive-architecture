# Tutorial: Creating a Reusable Prompt

![Creating prompts](images/tutorial-prompts.png)

*10 minutes · Beginner*

---

## What You'll Build

A saved prompt that you can invoke anytime from VS Code's command palette or chat.

After this tutorial, you'll be able to create shortcuts for workflows you repeat often.

---

## 📋 Prerequisites

- Alex installed in VS Code
- A project folder open
- The Alex brain installed in your project

---

## Why Prompts?

You probably have workflows you repeat:

- "Review this code for security issues"
- "Write tests for the selected function"
- "Explain this error and suggest fixes"

Prompts save these workflows so you don't retype them every time.

---

## 📍 Steps

### Step 1: Create the Prompts Folder

If it doesn't exist, create:

```
.github/
  prompts/         ← Create this
```

---

### Step 2: Create Your Prompt File

Create a new file:

```
.github/prompts/code-review.prompt.md
```

The filename becomes the prompt's identifier. Use `.prompt.md` suffix.

---

### Step 3: Add the Frontmatter

```markdown
---
description: "Review selected code for issues and improvements"
---
```

Optional fields:
- `mode: "agent"` — Use a specific agent mode
- `tools: ["read_file", "grep_search"]` — Specify allowed tools

---

### Step 4: Write the Prompt Body

```markdown
---
description: "Review selected code for issues and improvements"
---

Review the selected code for:

1. **Bugs** — Logic errors, edge cases, null handling
2. **Security** — Input validation, injection risks, auth issues  
3. **Performance** — Unnecessary loops, memory leaks, N+1 queries
4. **Readability** — Naming, comments, complexity

For each issue found:
- Explain what's wrong
- Show the problematic code
- Provide a corrected version

If no issues found, confirm the code looks good.
```

---

### Step 5: Use Your Prompt

✅ **Checkpoint**: Invoke the prompt

1. Select some code in your editor
2. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Type "Chat: Run Prompt"
4. Select your prompt (`code-review`)

Your prompt runs with the selected code as context.

---

## 💡 Tips

### Use Variables

Prompts support template variables:

```markdown
Review changes in {{git_diff}} for breaking changes.
```

Available variables:
- `{{selection}}` — Currently selected text
- `{{file}}` — Current file path
- `{{git_diff}}` — Uncommitted changes

### Target Specific Agents

```markdown
---
description: "Deep security review"
mode: "agent"
tools: ["read_file", "grep_search", "semantic_search"]
---

@Validator Perform a security-focused code review...
```

### Create Prompt Chains

Reference other prompts:

```markdown
First run the code-review prompt, then...
```

---

## ⚠️ Common Mistakes

1. **Wrong extension** — Must be `.prompt.md`
2. **Missing description** — Prompt won't appear in command palette
3. **Too generic** — "Help me with code" isn't useful. Be specific.
4. **Too long** — Prompts should be focused. Create multiple prompts for different tasks.

---

## Example Prompts

### Quick Test Writer

```markdown
---
description: "Generate unit tests for selected function"
---

Write unit tests for the selected function:

1. Test the happy path
2. Test edge cases (null, empty, boundary values)
3. Test error conditions

Use the testing framework already in this project.
Match existing test file naming conventions.
```

### Commit Message Generator

```markdown
---
description: "Generate conventional commit message"
---

Based on {{git_diff}}, write a commit message following Conventional Commits:

- type(scope): subject
- Blank line
- Body explaining what and why

Types: feat, fix, docs, style, refactor, test, chore

Keep subject under 50 characters.
```

### Documentation Updater

```markdown
---
description: "Update docs to match code changes"
---

Review {{git_diff}} and identify any documentation that needs updating:

1. README changes needed
2. API doc updates
3. Comment updates in code

Provide the updated documentation text.
```

---

## What's Next?

- [Using Agent Modes Effectively](TUTORIAL-Agent-Modes.md) — Learn when to use different personas
- [Your First Custom Instruction](TUTORIAL-First-Instruction.md) — For always-on rules

---

*Skills used: prompt-engineering, project-scaffolding*
