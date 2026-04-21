# Tutorial: Dialog Engineering Fundamentals

![Dialog engineering](tutorials/images/tutorial-dialog-engineering.png)

*30 minutes · Foundation*

---

## What You'll Learn

The five conversation patterns that make every AI interaction better — and the CSAR Loop that structures productive AI collaboration.

After this tutorial, you'll move from "one prompt, hope for the best" to iterative dialog that produces real results.

---

## 📋 Prerequisites

- Alex installed in VS Code
- Any task you've struggled to get right with AI

---

## Why Dialog Engineering?

Prompt engineering works for simple tasks: "Summarize this." "Translate that."

But complex knowledge work — writing a stakeholder briefing, debugging a system, drafting a research proposal — can't be captured in a single instruction. The output is generic because the input was a monologue, not a conversation.

**Dialog engineering treats AI as a thinking partner, not a vending machine.**

---

## 📍 The Five Patterns

### Pattern 1: Context-Goal-Constraints

Structure every request with three elements:

```
I'm a [role], working on [context].
I need [specific outcome].
Constraints: [limits, format, audience]
```

**Example:**
```
I'm a product manager at a B2B SaaS company.
I'm preparing the quarterly roadmap review for leadership.
I need a 1-page executive summary of our key initiatives.
Constraints: Non-technical language, focus on business outcomes, 
no more than 5 bullet points per initiative.
```

✅ **Try it**: Take a task you're working on and write it in this format.

---

### Pattern 2: Explain-Like

Calibrate AI responses to your knowledge level:

```
Explain [concept] like I'm a [role] who knows [X] but not [Y].
```

**Example:**
```
Explain Kubernetes networking like I'm a backend developer 
who knows Docker but hasn't worked with orchestration.
```

This eliminates both jargon overload and condescending oversimplification.

---

### Pattern 3: Show-Don't-Tell

Move from abstract to concrete:

```
Show me an example applied to [my specific situation].
```

**Example:**
```
Show me how this error handling pattern would look 
in our payment processing service.
```

Generic advice becomes actionable when grounded in your context.

---

### Pattern 4: Iterate

Every first output is a draft. Build through turns:

```
Good, but adjust [this]. Keep [that].
```

**Examples:**
- "More concise — cut the intro, start with the recommendation"
- "Good structure, but use our company terminology"
- "Keep the examples, remove the theoretical explanation"

The conversation IS the product.

---

### Pattern 5: Challenge-Me

Use AI as a critical thinking partner:

```
What am I missing?
What are the counterarguments?
Where could this fail?
```

This is where dialog engineering transcends what any single prompt can do.

---

## 📍 The CSAR Loop

Structure every dialog with four phases:

### C — Clarify

Before acting, surface assumptions:

```
Before we start, what questions do you have about this task?
What assumptions are you making?
```

### S — Summarize

Verify shared understanding:

```
Summarize what you understand so far. Is this correct?
```

### A — Act

Execute targeted work — smaller and more precise because the preceding phases narrowed scope.

### R — Reflect

Evaluate the outcome:

```
What worked well? What was missing? 
What should we change for the next section?
```

---

## 💡 Practice Exercise

Take a real task and apply all five patterns:

1. **Context-Goal-Constraints**: Frame your request
2. **Clarify**: Ask Alex what questions it has
3. **Summarize**: Verify understanding before proceeding
4. **Generate**: Get first draft
5. **Iterate**: Refine with "adjust X, keep Y"
6. **Challenge**: Ask "What am I missing?"
7. **Reflect**: What worked? What would you do differently?

---

## ⚠️ Common Mistakes

### Rerolling Instead of Repairing

**Bad**: Rephrasing and trying again from scratch  
**Good**: "That's not right because [X]. Here's what I expected: [Y]. Please correct."

Repair carries learning forward. Rerolls discard it.

### Skipping Clarify

Jumping straight to "write me X" skips the phase that catches misunderstandings.

### One-Turn Mentality

Dialog engineering requires multiple turns. If you're not iterating, you're just prompting.

---

## What's Next?

- [LearnAI: Beyond Prompt Engineering](https://learnai.correax.com/workshop/dialog-engineering) — Full interactive workshop
- [AI-Assisted Code Review](TUTORIAL-AI-Code-Review.md) — Apply dialog engineering to development
- [AI-Assisted Research](TUTORIAL-AI-Research.md) — Apply dialog engineering to academic work

---

*Skills used: dialog-engineering, prompt-engineering, learning-psychology*
