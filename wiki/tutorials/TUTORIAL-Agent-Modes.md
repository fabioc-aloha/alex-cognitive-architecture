# Tutorial: Using Agent Modes Effectively

![Agent modes](tutorials/images/tutorial-agents.png)

*20 minutes · Beginner*

---

## What You'll Learn

How to choose the right agent mode for different tasks, and when to let Alex switch modes automatically.

After this tutorial, you'll use Alex more efficiently by picking the right tool for each job.

---

## 📋 Prerequisites

- Alex installed in VS Code
- Basic familiarity with asking Alex questions

---

## Why Modes Matter

Think of agent modes like different specialists:

- You wouldn't ask a surgeon to do your taxes
- You wouldn't ask an accountant to review your blood work

Each mode optimizes Alex for a specific type of task. Using the right mode gets better results faster.

---

## 📍 The Core Modes

### Builder Mode

**Best for:** Creating new things

```
@Builder Create a REST API endpoint for user authentication
```

Builder is optimistic and solution-oriented. It assumes you want something built and focuses on getting to working code quickly.

**Use when:**
- Starting a new feature
- Implementing a design
- Writing boilerplate code
- "Make it work" is the goal

**Avoid when:**
- You need to understand existing code first
- You suspect there might be problems
- You're not sure what you want yet

---

### Researcher Mode

**Best for:** Understanding before acting

```
@Researcher How does the authentication flow work in this codebase?
```

Researcher explores, reads documentation, and synthesizes information. It doesn't rush to solutions.

**Use when:**
- Joining a new codebase
- Investigating how something works
- Learning a new technology
- You need to understand before you build

**Avoid when:**
- You already know what you need
- You're in the middle of building something
- The answer is straightforward

---

### Validator Mode

**Best for:** Finding problems

```
@Validator Review this pull request for issues
```

Validator is skeptical. It assumes there are bugs, security holes, and edge cases you haven't considered. Its job is to break things before users do.

**Use when:**
- Reviewing code (yours or others')
- Before deploying to production
- When something "should work" but doesn't
- Security-sensitive changes

**Avoid when:**
- You're still in creative/exploratory mode
- You need encouragement, not criticism
- The code is obviously incomplete

---

## 📍 Practical Workflow

### The Three-Mode Pattern

Most substantial work benefits from all three modes in sequence:

1. **Research first** — Understand the landscape

   ```
   @Researcher What patterns does this codebase use for API endpoints?
   ```

2. **Build second** — Implement the solution

   ```
   @Builder Create a new endpoint following those patterns
   ```

3. **Validate last** — Find the problems

   ```
   @Validator Review the new endpoint for security issues
   ```

✅ **Checkpoint**: Try this pattern on a real task

---

### When to Let Alex Choose

Sometimes you don't need to specify a mode:

```
Help me fix this bug
```

Alex will automatically use debugging-focused behavior. Mode selection is most valuable when:

- You have a strong preference for the approach
- Alex keeps using the wrong approach
- The task requires a specific mindset

---

## 💡 Tips

### Mode Switching Mid-Conversation

You can switch modes in the same chat:

```
@Builder Create a login form

[Alex builds the form]

@Validator Now review what we just built for XSS vulnerabilities
```

### Combining with Prompts

Custom prompts can specify modes:

```markdown
---
description: "Security audit"
mode: "agent"
---

@Validator Perform a comprehensive security review...
```

### Knowing the Signs

**You need Researcher when:**
- You're asking "how does this work?"
- You're exploring unfamiliar code
- You want options explained, not decisions made

**You need Builder when:**
- You're asking "can you make this?"
- You have a clear goal
- You want working code, not analysis

**You need Validator when:**
- You're asking "what's wrong with this?"
- You're about to ship something
- You want problems found, not solutions built

---

## ⚠️ Common Mistakes

### Using Builder When You Need Researcher

❌ "Build me an authentication system"  
(When you don't know what kind you need)

✅ "What authentication approaches would work for a public API?"  
(Research first, then build)

### Using Validator Too Early

❌ Validating every line while writing  
(Slows you down, interrupts flow)

✅ Build first, validate when you have something complete  
(Let yourself create before critiquing)

### Ignoring Mode Feedback

If Alex in Builder mode keeps asking clarifying questions, you might need Researcher first. If Validator mode isn't finding issues, the code might actually be good (or the wrong mode).

---

## What's Next?

- [Your First Custom Instruction](TUTORIAL-First-Instruction.md) — Teach Alex your project's rules
- [Creating a Reusable Prompt](TUTORIAL-First-Prompt.md) — Save workflows you use often

---

*Skills used: ai-agent-design, proactive-assistance*
