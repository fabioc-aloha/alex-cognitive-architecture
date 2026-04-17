# Project Registration Skill

Register and update project metadata in the AI-Memory project registry for fleet-wide visibility and cross-project pattern discovery.

## Purpose

Enable heirs to self-register in the centralized project registry, track successful patterns, document friction points, and promote reusable solutions to the fleet.

## Registry Location

```
~/OneDrive - Correa Family/AI-Memory/project-registry.json
```

The registry syncs across all machines via OneDrive. Never create local copies.

## Registry Schema (v2.0)

```json
{
  "path": "C:\\Development\\ProjectName",
  "name": "ProjectName",
  "description": "Brief project description",
  "lastAccessed": "2026-04-16T10:00:00.000Z",
  "status": "active|maintenance|archived",
  "technologies": ["nodejs", "typescript", "alex-brain"],
  "brainVersion": "8.0.0",
  "health": {
    "skillCount": 0,
    "instructionCount": 0,
    "lastMeditation": null,
    "meditationCount": 0
  },
  "successfulPatterns": ["pattern-name"],
  "frictionPoints": ["issue-description"],
  "promotedPatterns": ["pattern-promoted-to-master"]
}
```

## Procedures

### 1. Register Current Project

When an heir wants to join the fleet registry:

```bash
# Master Alex has a scanner muscle:
node scripts/scan-projects.cjs
```

For manual registration:

1. Read existing registry
2. Check if project already exists (match by path)
3. If exists, update metadata; if not, add new entry
4. Preserve existing successfulPatterns and frictionPoints
5. Write updated registry

### 2. Record Successful Pattern

When you solve a problem elegantly and it could help other projects:

```json
{
  "successfulPatterns": [
    "webview-state-management",
    "atomic-file-writes",
    "tmdl-parsing"
  ]
}
```

Pattern names should be:
- Lowercase, hyphenated
- Descriptive of the solution domain
- Referenceable across projects

### 3. Document Friction Point

When encountering recurring issues:

```json
{
  "frictionPoints": [
    "msal-token-refresh-race-condition",
    "webpack-5-esm-compatibility"
  ]
}
```

Before solving a problem from scratch, check if another project already solved it:

```javascript
// Query pattern
const registry = JSON.parse(fs.readFileSync(registryPath));
const solutions = registry.projects.filter(p => 
    p.successfulPatterns.includes('your-problem-domain')
);
```

### 4. Promote Pattern to Master

When a pattern proves valuable and should become a Master Alex capability:

1. Add to `promotedPatterns` array
2. Create skill/instruction/prompt trifecta in Master
3. Mark as promoted in registry

### 5. Update Project Health

After meditation or brain-qa runs:

```json
{
  "health": {
    "skillCount": 176,
    "instructionCount": 136,
    "lastMeditation": "2026-04-16T10:00:00Z",
    "meditationCount": 15
  }
}
```

## Cross-Project Discovery

### Find Projects with Similar Tech Stack

```javascript
const typescriptProjects = registry.projects.filter(p => 
    p.technologies.includes('typescript') && 
    p.status === 'active'
);
```

### Find Solutions to Known Problems

```javascript
// Find who solved SSE streaming
const sseExperts = registry.projects.filter(p => 
    p.successfulPatterns.some(pat => pat.includes('sse'))
);
```

### Identify Fleet Health

```javascript
const needsMeditation = registry.projects.filter(p => 
    p.status === 'active' && 
    !p.health.lastMeditation
);
```

## Status Definitions

| Status | Criteria | Registry Update Frequency |
|--------|----------|---------------------------|
| `active` | Modified in last 7 days | On every significant change |
| `maintenance` | Modified in last 30 days | Weekly or on changes |
| `archived` | Not modified in 30+ days | Rarely/never |

## Integration with Fleet Operations

The project registry powers:
- **Brain Ops**: Fleet-wide meditation scheduling
- **Pattern Discovery**: Cross-pollination of solutions
- **Health Monitoring**: Identify projects needing attention
- **Skill Promotion**: Pipeline from heir to master

## Related

- [global-knowledge.instructions.md](../../instructions/global-knowledge.instructions.md) — Cross-project knowledge queries
- [MEMORY-SYSTEMS.md](../../../master-wiki/architecture/MEMORY-SYSTEMS.md) — Full memory architecture
- [heir-sync-management.instructions.md](../../instructions/heir-sync-management.instructions.md) — Syncing changes to heirs
