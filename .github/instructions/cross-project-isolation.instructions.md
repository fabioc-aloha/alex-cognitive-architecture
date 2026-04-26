---
type: instruction
lifecycle: stable
description: "Cross-project data isolation rules — strip project-specific context before globalizing patterns, insights, and fleet data"
application: "Always active — unconscious filter when promoting data from project scope to global scope"
applyTo: "**"
currency: 2026-04-20
---

# Cross-Project Data Isolation

Always-active unconscious behavior. Self-monitor whenever data crosses from project scope to global scope.

## Boundary Definition

**Project scope**: `.github/episodic/`, `.github/config/`, `/memories/repo/`, project-local files.
**Global scope**: `AI-Memory/` (knowledge/, patterns/, insights/, global-knowledge.md, project-registry.json, feedback/).

Every write to global scope from project context must pass through the stripping rules below.

## Mandatory Stripping Rules

Before writing project-derived content to any global-scope location:

| Strip | Example Before | Example After | Risk If Kept |
|-------|----------------|---------------|--------------|
| **File paths** | `src/services/billing/handler.ts:42` | "a service handler module" | Reveals project internals |
| **Project names** | "In the FabricManager project..." | "In a Fabric workspace management project..." | Client identification |
| **Client names** | "Contoso's billing API" | "a client billing API" | L3 confidential |
| **Domain-specific entities** | "Patient record schema in FHIR format" | "a domain entity schema" | L3/L4 domain leakage |
| **Repo URLs** | `github.com/org/private-repo` | omit | Reveals private repos |
| **Branch/PR references** | "Fixed in PR #347" | omit | Project-specific context |
| **Internal team names** | "The Platform team decided..." | "The team decided..." | Org structure leakage |
| **Specific dates with context** | "On April 15, client X deployed..." | "After deployment..." | Timeline correlation |

## What Survives Promotion

These are safe to include in global patterns:

- **Technology names**: React, Azure Functions, Bicep, Python
- **Architecture patterns**: "microservice → monolith migration", "event sourcing"
- **Abstract problem descriptions**: "N+1 query in ORM", "race condition in async handler"
- **Solution techniques**: "Use AbortController with 180s timeout for streaming"
- **Quantified outcomes**: "Reduced build time by 40%" (no project attribution)
- **Tool/library gotchas**: "marked.js requires DOMPurify post-processing"

## Per-Destination Rules

### Fleet Registry (`project-registry.json`)

| Field | Rule |
|-------|------|
| Project identifier | Use slugs (e.g., `fabric-mgr`), never client-identifying names |
| Tech stack | Technology names only, no architecture secrets |
| Brain version | Safe — public version number |
| Status | `active`/`archived`/`paused` — safe |
| Description | Generic purpose, no client context (e.g., "Fabric workspace governance tool") |

### Pattern Files (`AI-Memory/patterns/`)

| Rule | Rationale |
|------|-----------|
| Must pass the "stranger test" — would this help someone who has never seen the source project? | If it requires project context to understand, it's not abstract enough |
| Source field uses generic description, not project name | "Learned from a healthcare data pipeline" not "From the HealthAnalytics project" |
| No code snippets >5 lines | Longer snippets leak project architecture |
| No configuration values | Connection strings, endpoints, resource names are project-specific |

### Feedback (`AI-Memory/feedback/`)

| Field | Content Rule |
|-------|--------------|
| Skill name | Exact skill name — safe (public brain content) |
| Category | `bug` / `friction` / `feature-request` / `success` — safe |
| Severity | `low` / `medium` / `high` / `critical` — safe |
| Description | **Structured only** — what happened + expected behavior. No domain data, no file paths, no client references |

### Announcements (`AI-Memory/announcements/`)

Master→heir direction only. No project-specific content by design.

## Aggregation Pipeline Rules (For Future FI2/FI3)

When a pattern aggregation muscle collects insights from multiple heirs:

1. **Strip first, aggregate second** — never collect raw project data then strip later
2. **No cross-reference** — never link "Project A had this pattern AND Project B had this pattern" in the same file
3. **Count, don't enumerate** — "Observed in 3 projects" not "Observed in ProjectA, ProjectB, ProjectC"
4. **Minimum 2-project threshold** — only promote to global if observed in 2+ independent contexts
5. **Domain generalization** — "healthcare → regulated domain", "fintech → compliance-heavy domain"
