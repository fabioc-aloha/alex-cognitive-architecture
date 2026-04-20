# Tutorial: AI-Assisted Code Review

![Code review](images/tutorial-code-review.png)

*25 minutes · For Developers*

---

## What You'll Build

A systematic code review workflow using AI as a second pair of eyes — catching bugs, suggesting improvements, and maintaining quality standards.

After this tutorial, you'll review code faster and more thoroughly.

---

## 📋 Prerequisites

- Alex installed in VS Code
- Code that needs review (yours or a PR)

---

## Why AI-Assisted Review?

Human reviewers catch design issues and business logic problems. AI reviewers catch:

- Patterns humans miss from fatigue
- Security vulnerabilities
- Consistency violations
- Edge cases
- Documentation gaps

The combination is stronger than either alone.

---

## 📍 Steps

### Step 1: Set the Context

Open the file or diff and frame the review:

```
Review this code. I'm a senior developer on a fintech team.
Focus on: security, error handling, maintainability.
This is a payment processing service handling PCI data.
```

✅ **Checkpoint**: Alex understands the domain and priority areas.

---

### Step 2: Security-First Pass

```
What security vulnerabilities do you see?
Check for: injection, auth bypass, data exposure, input validation.
```

Review each finding:
- Is it a real issue or false positive?
- What's the severity?
- How should it be fixed?

---

### Step 3: Logic and Edge Cases

```
What edge cases could break this code?
Consider: null inputs, empty collections, boundary values, 
concurrent access, timeout scenarios.
```

Alex identifies potential failure modes you might miss.

---

### Step 4: Code Quality

```
What refactoring would improve this code?
Focus on: readability, naming, DRY violations, 
function size, single responsibility.
```

Not everything needs fixing — prioritize what matters for this PR.

---

### Step 5: Generate Review Comments

For PR reviews, ask for formatted feedback:

```
Draft 3-5 PR comments for the most important findings.
Format: line reference, issue, suggested fix.
Tone: constructive, not critical.
```

---

## 💡 Tips

### Review Your Own Code First

Before submitting a PR:

```
Review my changes as if you were a senior developer 
who doesn't know this codebase well.
What would confuse you? What questions would you ask?
```

### Compare to Standards

```
Does this code follow our team's style guide?
Check against: [paste relevant standards]
```

### Check Test Coverage

```
What test cases are missing for this function?
Consider both happy path and error scenarios.
```

### Architecture Decision Records

For significant changes:

```
Should this change have an ADR?
Draft one if the architectural decision isn't documented.
```

---

## ⚠️ Common Mistakes

### Accepting All Suggestions

AI findings need human judgment. Not every suggestion is right for your context.

### Missing the Big Picture

AI catches details but may miss architectural issues. You still need to ask: "Does this design make sense?"

### Copy-Paste Comments

Review AI-generated PR comments before posting. Make them your own.

---

## Review Checklist

Use this systematic approach:

| Pass | Focus | Question |
|------|-------|----------|
| 1 | Security | "What could an attacker exploit?" |
| 2 | Correctness | "What inputs break this?" |
| 3 | Quality | "What would make this clearer?" |
| 4 | Tests | "What scenarios aren't tested?" |
| 5 | Docs | "Could someone understand this in 6 months?" |

---

## What's Next?

- [LearnAI: Software Developers](https://learnai.correax.com/workshop/developers) — Full developer playbook
- [Writing a Technical Document](TUTORIAL-Technical-Writing.md) — Document your architecture
- [Building Your Own Skill](TUTORIAL-Build-Skill.md) — Encode your team's review standards

---

*Skills used: code-review, security-review, testing-strategies*
