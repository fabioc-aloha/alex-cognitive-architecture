# Tutorial: Writing a Technical Document

![Technical writing](tutorials/images/tutorial-technical-writing.png)

*25 minutes · Intermediate*

---

## What You'll Build

A well-structured technical document — architecture doc, design spec, API reference, or technical guide — using a proven writing workflow.

After this tutorial, you'll produce clearer technical writing faster.

---

## 📋 Prerequisites

- Alex installed in VS Code
- A topic you need to document
- Basic understanding of your subject matter

---

## Why This Workflow?

Technical writing fails in predictable ways:

- **No structure** → Readers get lost
- **Wrong audience** → Too basic or too advanced
- **Missing context** → Assumptions unclear
- **Stale content** → Code evolved, docs didn't

This workflow prevents all four.

---

## 📍 Steps

### Step 1: Define Your Audience

Before writing anything, tell Alex who you're writing for:

```
I'm writing architecture documentation for:
- Audience: Senior developers joining the team
- Prior knowledge: Familiar with microservices, new to our system
- Goal: Understand the system well enough to make changes
```

Alex adjusts tone, detail level, and assumed knowledge throughout.

✅ **Checkpoint**: You should have clarity on who reads this and what they need.

---

### Step 2: Create an Outline

Ask Alex to scaffold the document:

```
Create an outline for architecture documentation covering:
- System overview
- Component breakdown
- Data flow
- Deployment
- Common operations
```

Alex generates a structured outline you can review and adjust.

---

### Step 3: Fill in Sections

Work through the outline section by section:

```
Write the System Overview section. Our system is a real-time 
analytics platform that processes IoT sensor data.
```

Alex drafts the section. Review and refine:

```
Make it more concise — cut the background, focus on what it does
```

---

### Step 4: Add Diagrams

For complex concepts:

```
Create a Mermaid diagram showing the data flow from 
sensors → ingestion → processing → storage → API
```

Alex generates diagram code you can embed directly in Markdown.

---

### Step 5: Include Code Examples

For API or code documentation:

```
Add a code example showing how to query the analytics API
```

Alex generates realistic examples that match your system's patterns.

---

### Step 6: Review for Clarity

When the draft is complete:

```
Review this document for:
- Unclear explanations
- Missing context
- Assumed knowledge not stated
- Sections that could use diagrams
```

Alex acts as a technical editor, flagging issues.

---

### Step 7: Add Metadata

Finish with context that keeps the doc useful:

```
Add a "Last Updated" date and "Prerequisites" section
```

Good metadata prevents the doc from rotting silently.

---

## 💡 Tips

### Writing API Documentation

```
Document this API endpoint following OpenAPI conventions:
POST /api/sensors
Body: { sensorId, readings[] }
Returns: { processed: boolean, anomalies?: [] }
```

### Handling Complex Systems

Break into multiple documents:

```
Create a document index for our system:
1. Overview (5 min read)
2. Architecture Deep Dive (20 min)
3. API Reference (reference doc)
4. Operations Runbook (how-to)
```

### Keeping Docs Current

```
Add a "Verify This" checklist at the end with items 
that should be checked when updating
```

---

## ⚠️ Common Issues

### Too Much Jargon

```
Simplify this for someone who hasn't used our system before
```

### Too Long

```
Split this into Overview (for scanning) and Details (for reference)
```

### Missing the "Why"

```
Add context explaining why we chose this approach
```

Technical docs that explain reasoning age better than those that just describe facts.

---

## Document Templates

### Architecture Document

1. **Overview** — What it does, why it exists
2. **Architecture** — Diagrams, components, interactions
3. **Data Model** — Entities, relationships, storage
4. **Security** — Auth, permissions, data protection
5. **Operations** — Deployment, monitoring, troubleshooting

### API Reference

1. **Authentication** — How to get credentials
2. **Endpoints** — Organized by resource
3. **Examples** — Common use cases
4. **Errors** — What can go wrong, how to fix it
5. **Rate Limits** — Quotas and best practices

### Runbook

1. **Prerequisites** — Access, tools, knowledge needed
2. **Procedure** — Step-by-step instructions
3. **Verification** — How to confirm success
4. **Rollback** — What to do if it fails
5. **Contacts** — Who to escalate to

---

## What's Next?

- [Markdown to PDF](TUTORIAL-MD-to-PDF.md) — Convert your document for sharing
- [Your First Custom Instruction](TUTORIAL-First-Instruction.md) — Enforce documentation standards

---

*Skills used: api-documentation, doc-hygiene, documentation-quality-assurance, markdown-mermaid*
