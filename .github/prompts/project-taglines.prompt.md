---
name: project-taglines
description: "Generate custom taglines for a project's Alex sidebar banner"
trigger: "Create/update project taglines"
mode: agent
---

# Generate Project Taglines

Create compelling, project-specific taglines that rotate in the Alex sidebar banner.

## Prerequisites

- Access to project's North Star, README, or identity docs
- Understanding of the project's unique value

## Workflow

### 1. Gather Context

Read these files if they exist:

```
NORTH-STAR.md    → Vision and goals
README.md        → Project description
package.json     → Name, keywords
```

### 2. Identify Project Essence

Answer these questions:

- **What is this project?** (Identity)
- **What makes it unique?** (Differentiation)
- **Where is it going?** (Vision)
- **Who uses it with whom?** (Partnership)

### 3. Generate Taglines

Create taglines for each category:

| Category | Count | Focus |
|----------|-------|-------|
| `project` | 8-12 | Identity, uniqueness |
| `vision` | 3-5 | North Star, goals |
| `collaboration` | 3-5 | Partnership, teamwork |

Rules per tagline:
- 4-8 words ideal
- Under 60 characters max
- Active voice, present tense
- Confident but not arrogant

### 4. Write Configuration

Create `.github/config/taglines.json`:

```json
{
  "version": "1.0",
  "project": "{{PROJECT_NAME}}",
  "taglines": {
    "project": [
      "{{tagline1}}",
      "{{tagline2}}",
      // ... 8-12 total
    ],
    "vision": [
      "{{vision1}}",
      // ... 3-5 total
    ],
    "collaboration": [
      "{{collab1}}",
      // ... 3-5 total
    ]
  },
  "rotation": {
    "strategy": "balanced",
    "projectWeight": 50,
    "inspirationalWeight": 50
  }
}
```

### 5. Validate

- [ ] JSON syntax valid
- [ ] All taglines under 60 characters
- [ ] No duplicates or near-duplicates
- [ ] At least 3 project taglines
- [ ] Each reads well aloud

## Example Output

For a project called "Pulse" with North Star "Real-time insights for every team":

```json
{
  "version": "1.0",
  "project": "Pulse",
  "taglines": {
    "project": [
      "Feel the heartbeat of your data",
      "Insights in real time",
      "Where metrics become meaning",
      "The signal in the noise",
      "Data that breathes",
      "Your team's vital signs",
      "Beyond dashboards",
      "Pulse on performance"
    ],
    "vision": [
      "Real-time insights for every team",
      "Making data feel alive",
      "Dashboards that don't sleep"
    ],
    "collaboration": [
      "Your data, our clarity",
      "Watching together",
      "Insights we both understand"
    ]
  }
}
```

## Tips

- Read taglines aloud — awkward phrasing shows
- Avoid clichés: "next-gen", "revolutionary", "game-changing"
- If stuck, start with the North Star and work backward
- Ask: "Would I be proud to see this in the sidebar?"
