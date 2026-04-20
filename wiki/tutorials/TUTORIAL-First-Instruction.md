# Tutorial: Your First Custom Instruction

![Custom instructions](images/tutorial-instructions.png)

*15 minutes · Beginner*

---

## What You'll Build

A custom instruction file that teaches Alex about your project's specific conventions.

After this tutorial, Alex will automatically follow rules you define whenever you're working in your project.

---

## 📋 Prerequisites

- Alex installed in VS Code
- A project folder open
- The Alex brain installed in your project (`.github/` folder exists)

---

## Why Custom Instructions?

Alex comes with 130+ built-in instructions covering general best practices. But your project is unique:

- Maybe you use a specific naming convention
- Maybe you have a testing framework with specific patterns
- Maybe there are legacy constraints Alex doesn't know about

Custom instructions fill these gaps.

---

## 📍 Steps

### Step 1: Create the Instructions Folder

If it doesn't exist, create a folder for your project-specific instructions:

```
.github/
  instructions/         ← Create this if missing
```

Your project may already have instructions inherited from Alex. That's fine — your custom instructions add to them.

---

### Step 2: Create Your Instruction File

Create a new file in `.github/instructions/`:

```
.github/instructions/my-project.instructions.md
```

Use a descriptive name. The `.instructions.md` suffix is required.

---

### Step 3: Add the Frontmatter

Every instruction file needs frontmatter that tells Alex when to load it:

```markdown
---
description: "Project-specific conventions for [Your Project Name]"
applyTo: "**"
---
```

The `applyTo` field uses glob patterns:
- `**` — Apply to all files
- `**/*.py` — Apply only to Python files
- `src/**` — Apply only in the src folder

---

### Step 4: Write Your Rules

Below the frontmatter, write your instructions in plain language:

```markdown
---
description: "Project-specific conventions for MyApp"
applyTo: "**"
---

# MyApp Conventions

## Naming

- Use `camelCase` for variables and functions
- Use `PascalCase` for classes and components
- Prefix private methods with underscore: `_privateMethod()`

## Testing

- Every new function needs at least one test
- Test files live in `__tests__/` next to the code they test
- Use `describe()` blocks to group related tests

## Avoid

- Never use `any` type in TypeScript — always provide types
- Don't commit console.log statements
- Avoid default exports — use named exports
```

Write like you're explaining to a new team member.

---

### Step 5: Verify It Works

✅ **Checkpoint**: Test your instruction

1. Open a file that matches your `applyTo` pattern
2. Ask Alex to write some code
3. Check if it follows your conventions

If it doesn't, your instruction might not be loading. Check:
- Filename ends with `.instructions.md`
- Frontmatter has required fields
- `applyTo` pattern matches the file you're editing

---

## 💡 Tips

### Be Specific

❌ Vague: "Write good code"  
✅ Specific: "Use TypeScript strict mode. Never use `any` type."

### Include Examples

```markdown
## Error Handling

Always use the Result pattern:

```typescript
// Good
function divide(a: number, b: number): Result<number, Error>

// Bad
function divide(a: number, b: number): number // throws on b=0
```
```

### Layer Your Instructions

You can have multiple instruction files:
- `api.instructions.md` — For API-related conventions
- `testing.instructions.md` — For test patterns
- `security.instructions.md` — For security requirements

Each loads when its `applyTo` pattern matches.

---

## ⚠️ Common Mistakes

1. **Missing frontmatter** — The file won't load without `---` blocks
2. **Wrong file extension** — Must be `.instructions.md`, not `.md`
3. **Too broad** — Instructions that say "do everything right" don't help
4. **Contradicting built-in instructions** — Your rules add to Alex's knowledge; avoid conflicts

---

## What's Next?

- [Creating a Reusable Prompt](TUTORIAL-First-Prompt.md) — Save workflows you use often
- [Building Your Own Skill](TUTORIAL-Build-Skill.md) — For more complex domain knowledge

---

*Skills used: skill-building, project-scaffolding*
