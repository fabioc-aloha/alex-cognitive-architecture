# Brain Health Grid

Generated: 2026-04-26

> **Scope**: This is a **structural linter**, not a content quality gate. It validates frontmatter, currency freshness, cross-references, and potential skill conflicts — not whether advice is correct or examples are current. Content accuracy requires semantic review (see below).

## Pass Criteria

All brain file types use the same two-gate pass model:

| Gate | Requirement | Meaning |
|------|-------------|---------|
| **fm** | Frontmatter complete | Type-specific required fields present (visibility to the brain) |
| **currency** | Updated within 90 days | Content researched against current external developments |

**Pass = fm AND currency**. Other dimensions (tri, handoffs, persona, etc.) are shown as informational columns but do not affect pass/fail.

### Type-Specific fm Requirements

| Type | Required Fields |
|------|----------------|
| Skills | `name`, `description`, `applyTo`, `tier` |
| Agents | `description`, `name`, `model`, `tools` |
| Instructions | `description`, `application` |
| Prompts | `description`, `application` |
| Muscles | Standard header: `@muscle`, `@description`, `@platform`, `@requires` |
| Hooks | JSDoc header block |

### Informational Columns

| Col | Meaning | Value |
|:---:|---------|-------|
| **tri** | Trifecta | 1 = workflow skill has matching `.instructions.md` |
| **inh** | Inheritance | 1 = Master-only, 0 = Synced to heirs |
| **Currency** | Currency date | YYYY-MM-DD (when content was last researched) |

> **inh validation**: During currency audits, verify that master-only items (`inh=1`) have not leaked to heir projects. The inheritance flag is confirmed by cross-referencing the master-only skills list in `.github/config/MASTER-ALEX-PROTECTED.json`.

## Currency Audit Process

Files pass when `currency` is within 90 days. A currency audit verifies content against current external knowledge (Research → Compare → Audit → Update → Stamp).

Full checklist and type-specific guidance: `.github/skills/currency-audit/SKILL.md`

## Priority Queue

> **Sorted by urgency**: Failing first, then no currency date, then oldest currency. Top 20 shown.

| # | Type | File | Pass | Currency | Action |
|--:|:----:|------|:----:|:--------:|--------|
| 1 | skill | [academic-paper-drafting](../skills/academic-paper-drafting/SKILL.md) | ✓ | 2026-04-20 | Re-audit |
| 2 | skill | [academic-research](../skills/academic-research/SKILL.md) | ✓ | 2026-04-20 | Re-audit |
| 3 | instruction | [afcp-artifact-management](../instructions/afcp-artifact-management.instructions.md) | ✓ | 2026-04-20 | Re-audit |
| 4 | instruction | [afcp-mission-coordination](../instructions/afcp-mission-coordination.instructions.md) | ✓ | 2026-04-20 | Re-audit |
| 5 | skill | [agent-debug-panel](../skills/agent-debug-panel/SKILL.md) | ✓ | 2026-04-20 | Re-audit |
| 6 | skill | [ai-agent-design](../skills/ai-agent-design/SKILL.md) | ✓ | 2026-04-20 | Re-audit |
| 7 | skill | [ai-character-reference-generation](../skills/ai-character-reference-generation/SKILL.md) | ✓ | 2026-04-20 | Re-audit |
| 8 | skill | [ai-generated-readme-banners](../skills/ai-generated-readme-banners/SKILL.md) | ✓ | 2026-04-20 | Re-audit |
| 9 | skill | [ai-writing-avoidance](../skills/ai-writing-avoidance/SKILL.md) | ✓ | 2026-04-20 | Re-audit |
| 10 | agent | [alex](../agents/alex.agent.md) | ✓ | 2026-04-20 | Re-audit |
| 11 | agent | [alex-brain-ops](../agents/alex-brain-ops.agent.md) | ✓ | 2026-04-20 | Re-audit |
| 12 | agent | [alex-docs-cloud](../agents/alex-docs-cloud.agent.md) | ✓ | 2026-04-20 | Re-audit |
| 13 | agent | [alex-maintenance-cloud](../agents/alex-maintenance-cloud.agent.md) | ✓ | 2026-04-20 | Re-audit |
| 14 | agent | [alex-researcher-cloud](../agents/alex-researcher-cloud.agent.md) | ✓ | 2026-04-20 | Re-audit |
| 15 | agent | [alex-security-cloud](../agents/alex-security-cloud.agent.md) | ✓ | 2026-04-20 | Re-audit |
| 16 | agent | [alex-skill-builder](../agents/alex-skill-builder.agent.md) | ✓ | 2026-04-20 | Re-audit |
| 17 | muscle | [analyze-assignments.cjs](../muscles/analyze-assignments.cjs) | ✓ | 2026-04-20 | Re-audit |
| 18 | skill | [anti-hallucination](../skills/anti-hallucination/SKILL.md) | ✓ | 2026-04-20 | Re-audit |
| 19 | skill | [appropriate-reliance](../skills/appropriate-reliance/SKILL.md) | ✓ | 2026-04-20 | Re-audit |
| 20 | muscle | [audit-token-waste.cjs](../muscles/audit-token-waste.cjs) | ✓ | 2026-04-20 | Re-audit |

**Queue depth**: 0 failing | 0 no currency | 381 with currency | 381 total

## Skills

| Skill | Tier | Lines | fm | tri | Pass | inh | Currency |
|-------|:----:|------:|:--:|:---:|:----:|:---:|:--------:|
| [academic-paper-drafting](../skills/academic-paper-drafting/SKILL.md) | exte | 677 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [academic-research](../skills/academic-research/SKILL.md) | exte | 341 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [agent-debug-panel](../skills/agent-debug-panel/SKILL.md) | stan | 139 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [ai-agent-design](../skills/ai-agent-design/SKILL.md) | stan | 225 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [ai-character-reference-generation](../skills/ai-character-reference-generation/SKILL.md) | stan | 323 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [ai-generated-readme-banners](../skills/ai-generated-readme-banners/SKILL.md) | stan | 716 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [ai-writing-avoidance](../skills/ai-writing-avoidance/SKILL.md) | stan | 334 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [anti-hallucination](../skills/anti-hallucination/SKILL.md) | core | 154 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [appropriate-reliance](../skills/appropriate-reliance/SKILL.md) | core | 498 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [awareness](../skills/awareness/SKILL.md) | core | 350 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [code-review](../skills/code-review/SKILL.md) | core | 192 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [cognitive-load](../skills/cognitive-load/SKILL.md) | core | 203 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [critical-thinking](../skills/critical-thinking/SKILL.md) | core | 346 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [currency-audit](../skills/currency-audit/SKILL.md) | core | 266 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [debugging-patterns](../skills/debugging-patterns/SKILL.md) | core | 115 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [dialog-engineering](../skills/dialog-engineering/SKILL.md) | core | 156 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [doc-hygiene](../skills/doc-hygiene/SKILL.md) | core | 145 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [error-recovery-patterns](../skills/error-recovery-patterns/SKILL.md) | core | 211 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [git-workflow](../skills/git-workflow/SKILL.md) | core | 154 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [global-knowledge](../skills/global-knowledge/SKILL.md) | stan | 251 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [lint-clean-markdown](../skills/lint-clean-markdown/SKILL.md) | core | 109 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [memory-activation](../skills/memory-activation/SKILL.md) | core | 417 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [north-star](../skills/north-star/SKILL.md) | core | 322 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [persona-detection](../skills/persona-detection/SKILL.md) | core | 113 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [proactive-assistance](../skills/proactive-assistance/SKILL.md) | core | 211 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [refactoring-patterns](../skills/refactoring-patterns/SKILL.md) | core | 235 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [root-cause-analysis](../skills/root-cause-analysis/SKILL.md) | core | 144 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [security-review](../skills/security-review/SKILL.md) | core | 334 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [session-notes](../skills/session-notes/SKILL.md) | stan | 112 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [silence-as-signal](../skills/silence-as-signal/SKILL.md) | core | 243 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [terminal-command-safety](../skills/terminal-command-safety/SKILL.md) | core | 104 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [testing-strategies](../skills/testing-strategies/SKILL.md) | core | 155 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [alex-effort-estimation](../skills/alex-effort-estimation/SKILL.md) | exte | 170 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [api-design](../skills/api-design/SKILL.md) | stan | 225 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [api-documentation](../skills/api-documentation/SKILL.md) | stan | 313 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [architecture-audit](../skills/architecture-audit/SKILL.md) | stan | 293 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [architecture-health](../skills/architecture-health/SKILL.md) | stan | 103 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [architecture-refinement](../skills/architecture-refinement/SKILL.md) | stan | 121 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [ascii-project-dashboard](../skills/ascii-project-dashboard/SKILL.md) | stan | 244 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [audio-memory](../skills/audio-memory/SKILL.md) | stan | 243 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [azure-architecture-patterns](../skills/azure-architecture-patterns/SKILL.md) | stan | 205 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [azure-deployment-operations](../skills/azure-deployment-operations/SKILL.md) | stan | 290 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [azure-devops-automation](../skills/azure-devops-automation/SKILL.md) | stan | 457 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [azure-openai-patterns](../skills/azure-openai-patterns/SKILL.md) | stan | 322 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [bicep-avm-mastery](../skills/bicep-avm-mastery/SKILL.md) | exte | 425 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [blog-writer](../skills/blog-writer/SKILL.md) | stan | 127 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [book-publishing](../skills/book-publishing/SKILL.md) | exte | 296 | 1 | 0 | ✓ | 0 | 2026-04-22 |
| [bootstrap-learning](../skills/bootstrap-learning/SKILL.md) | stan | 115 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [brain-qa](../skills/brain-qa/SKILL.md) | stan | 235 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [brand-asset-management](../skills/brand-asset-management/SKILL.md) | stan | 134 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [business-analysis](../skills/business-analysis/SKILL.md) | stan | 274 | 1 | 0 | ✓ | 0 | 2026-04-22 |
| [career-development](../skills/career-development/SKILL.md) | exte | 217 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [change-management](../skills/change-management/SKILL.md) | stan | 236 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [character-aging-progression](../skills/character-aging-progression/SKILL.md) | exte | 228 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [chart-interpretation](../skills/chart-interpretation/SKILL.md) | stan | 186 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [chat-participant-patterns](../skills/chat-participant-patterns/SKILL.md) | stan | 190 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [citation-management](../skills/citation-management/SKILL.md) | exte | 315 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [cloud-solution-architect](../skills/cloud-solution-architect/SKILL.md) | stan | 276 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [coaching-techniques](../skills/coaching-techniques/SKILL.md) | exte | 327 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [cognitive-symbiosis](../skills/cognitive-symbiosis/SKILL.md) | exte | 245 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [comedy-writing](../skills/comedy-writing/SKILL.md) | exte | 150 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [content-safety-implementation](../skills/content-safety-implementation/SKILL.md) | stan | 282 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [converter-qa](../skills/converter-qa/SKILL.md) | exte | 112 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [copilot-sdk](../skills/copilot-sdk/SKILL.md) | stan | 487 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [counseling-psychology](../skills/counseling-psychology/SKILL.md) | exte | 209 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [creative-writing](../skills/creative-writing/SKILL.md) | stan | 466 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [cross-cultural-collaboration](../skills/cross-cultural-collaboration/SKILL.md) | exte | 341 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [dashboard-design](../skills/dashboard-design/SKILL.md) | stan | 210 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [data-analysis](../skills/data-analysis/SKILL.md) | stan | 221 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [data-quality-monitoring](../skills/data-quality-monitoring/SKILL.md) | stan | 210 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [data-storytelling](../skills/data-storytelling/SKILL.md) | stan | 170 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [data-visualization](../skills/data-visualization/SKILL.md) | stan | 298 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [database-design](../skills/database-design/SKILL.md) | stan | 418 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [deep-work-optimization](../skills/deep-work-optimization/SKILL.md) | exte | 367 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [dissertation-defense](../skills/dissertation-defense/SKILL.md) | exte | 494 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [distribution-security](../skills/distribution-security/SKILL.md) | stan | 222 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [documentation-quality-assurance](../skills/documentation-quality-assurance/SKILL.md) | stan | 337 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [docx-to-md](../skills/docx-to-md/SKILL.md) | exte | 362 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [dream-state](../skills/dream-state/SKILL.md) | stan | 109 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [early-filter-optimization](../skills/early-filter-optimization/SKILL.md) | exte | 119 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [enterprise-integration](../skills/enterprise-integration/SKILL.md) | stan | 242 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [entra-agent-id](../skills/entra-agent-id/SKILL.md) | stan | 280 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [executive-storytelling](../skills/executive-storytelling/SKILL.md) | stan | 464 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [extension-audit-methodology](../skills/extension-audit-methodology/SKILL.md) | stan | 189 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [fabric-notebook-publish](../skills/fabric-notebook-publish/SKILL.md) | exte | 157 | 1 | 0 | ✓ | 0 | 2026-04-22 |
| [financial-analysis](../skills/financial-analysis/SKILL.md) | exte | 159 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [fleet-management](../skills/fleet-management/SKILL.md) | stan | 202 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [flux-brand-finetune](../skills/flux-brand-finetune/SKILL.md) | exte | 395 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [foundry-agent-platform](../skills/foundry-agent-platform/SKILL.md) | exte | 284 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [frontend-design-review](../skills/frontend-design-review/SKILL.md) | stan | 298 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [game-design](../skills/game-design/SKILL.md) | exte | 185 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [global-knowledge-sync](../skills/global-knowledge-sync/SKILL.md) | stan | 133 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [grant-writing](../skills/grant-writing/SKILL.md) | exte | 196 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [graphic-design](../skills/graphic-design/SKILL.md) | exte | 453 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [health-pulse](../skills/health-pulse/SKILL.md) | stan | 256 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [healthcare-informatics](../skills/healthcare-informatics/SKILL.md) | exte | 175 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [heir-bootstrap](../skills/heir-bootstrap/SKILL.md) | stan | 193 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [heir-feedback](../skills/heir-feedback/SKILL.md) | stan | 188 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [hr-people-operations](../skills/hr-people-operations/SKILL.md) | exte | 188 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [hypothesis-driven-debugging](../skills/hypothesis-driven-debugging/SKILL.md) | stan | 194 | 1 | 0 | ✓ | 0 | 2026-04-22 |
| [identity-customization](../skills/identity-customization/SKILL.md) | stan | 216 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [image-handling](../skills/image-handling/SKILL.md) | stan | 374 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [incident-response](../skills/incident-response/SKILL.md) | stan | 118 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [infrastructure-as-code](../skills/infrastructure-as-code/SKILL.md) | stan | 846 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [journalism](../skills/journalism/SKILL.md) | exte | 181 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [kdp-publishing](../skills/kdp-publishing/SKILL.md) | exte | 235 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [knowledge-synthesis](../skills/knowledge-synthesis/SKILL.md) | stan | 135 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [kql](../skills/kql/SKILL.md) | exte | 416 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [learning-psychology](../skills/learning-psychology/SKILL.md) | stan | 204 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [legal-compliance](../skills/legal-compliance/SKILL.md) | exte | 159 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [literature-review](../skills/literature-review/SKILL.md) | exte | 347 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [llm-model-selection](../skills/llm-model-selection/SKILL.md) | stan | 216 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [localization](../skills/localization/SKILL.md) | exte | 791 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [lucid-dream](../skills/lucid-dream/SKILL.md) | stan | 103 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [m365-agent-debugging](../skills/m365-agent-debugging/SKILL.md) | stan | 166 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [markdown-mermaid](../skills/markdown-mermaid/SKILL.md) | stan | 1482 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [mcp-builder](../skills/mcp-builder/SKILL.md) | stan | 320 | 1 | 0 | ✓ | 0 | 2026-04-22 |
| [mcp-development](../skills/mcp-development/SKILL.md) | stan | 741 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [md-scaffold](../skills/md-scaffold/SKILL.md) | exte | 237 | 1 | 0 | ✓ | 0 | 2026-04-22 |
| [md-to-eml](../skills/md-to-eml/SKILL.md) | exte | 206 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [md-to-html](../skills/md-to-html/SKILL.md) | stan | 205 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [md-to-word](../skills/md-to-word/SKILL.md) | stan | 411 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [meeting-efficiency](../skills/meeting-efficiency/SKILL.md) | stan | 358 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [memory-curation](../skills/memory-curation/SKILL.md) | stan | 192 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [memory-export](../skills/memory-export/SKILL.md) | exte | 105 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [microsoft-fabric](../skills/microsoft-fabric/SKILL.md) | stan | 315 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [microsoft-graph-api](../skills/microsoft-graph-api/SKILL.md) | stan | 522 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [msal-authentication](../skills/msal-authentication/SKILL.md) | stan | 266 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [multi-agent-orchestration](../skills/multi-agent-orchestration/SKILL.md) | stan | 322 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [muscle-memory-recognition](../skills/muscle-memory-recognition/SKILL.md) | stan | 207 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [music-generation](../skills/music-generation/SKILL.md) | exte | 199 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [nav-inject](../skills/nav-inject/SKILL.md) | exte | 103 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [observability-monitoring](../skills/observability-monitoring/SKILL.md) | stan | 351 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [performance-profiling](../skills/performance-profiling/SKILL.md) | stan | 440 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [pii-privacy-regulations](../skills/pii-privacy-regulations/SKILL.md) | exte | 360 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [postmortem](../skills/postmortem/SKILL.md) | stan | 236 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [pptx-generation](../skills/pptx-generation/SKILL.md) | exte | 161 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [presentation-tool-selection](../skills/presentation-tool-selection/SKILL.md) | stan | 230 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [privacy-responsible-ai](../skills/privacy-responsible-ai/SKILL.md) | stan | 279 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [project-deployment](../skills/project-deployment/SKILL.md) | stan | 306 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [project-management](../skills/project-management/SKILL.md) | stan | 249 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [project-registration](../skills/project-registration/SKILL.md) | stan | 286 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [project-risk-analysis](../skills/project-risk-analysis/SKILL.md) | exte | 566 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [project-scaffolding](../skills/project-scaffolding/SKILL.md) | stan | 140 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [project-taglines](../skills/project-taglines/SKILL.md) | stan | 183 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [prompt-builder](../skills/prompt-builder/SKILL.md) | stan | 186 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [prompt-engineering](../skills/prompt-engineering/SKILL.md) | stan | 357 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [prompt-evolution-system](../skills/prompt-evolution-system/SKILL.md) | stan | 189 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [rag-architecture](../skills/rag-architecture/SKILL.md) | stan | 426 | 1 | 0 | ✓ | 0 | 2026-04-22 |
| [ralph-loop](../skills/ralph-loop/SKILL.md) | stan | 240 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [react-vite-performance](../skills/react-vite-performance/SKILL.md) | stan | 317 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [release-preflight](../skills/release-preflight/SKILL.md) | stan | 101 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [research-first-development](../skills/research-first-development/SKILL.md) | stan | 397 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [rubber-duck-debugging](../skills/rubber-duck-debugging/SKILL.md) | exte | 172 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [sales-enablement](../skills/sales-enablement/SKILL.md) | exte | 188 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [scope-management](../skills/scope-management/SKILL.md) | stan | 268 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [secrets-management](../skills/secrets-management/SKILL.md) | stan | 423 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [security-threat-modeler](../skills/security-threat-modeler/SKILL.md) | stan | 182 | 1 | 0 | ✓ | 0 | 2026-04-22 |
| [self-actualization](../skills/self-actualization/SKILL.md) | stan | 142 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [service-worker-offline-first](../skills/service-worker-offline-first/SKILL.md) | exte | 251 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [sidebar-customization](../skills/sidebar-customization/SKILL.md) | stan | 214 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [skill-development](../skills/skill-development/SKILL.md) | stan | 340 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [slide-design](../skills/slide-design/SKILL.md) | exte | 352 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [socratic-questioning](../skills/socratic-questioning/SKILL.md) | exte | 170 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [sse-streaming](../skills/sse-streaming/SKILL.md) | exte | 290 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [stakeholder-management](../skills/stakeholder-management/SKILL.md) | stan | 293 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [status-reporting](../skills/status-reporting/SKILL.md) | stan | 266 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [svg-graphics](../skills/svg-graphics/SKILL.md) | stan | 210 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [teams-app-patterns](../skills/teams-app-patterns/SKILL.md) | stan | 196 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [tech-debt-discovery](../skills/tech-debt-discovery/SKILL.md) | stan | 193 | 1 | 0 | ✓ | 0 | 2026-04-22 |
| [terminal-image-rendering](../skills/terminal-image-rendering/SKILL.md) | exte | 114 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [test-quality-analysis](../skills/test-quality-analysis/SKILL.md) | stan | 202 | 1 | 0 | ✓ | 0 | 2026-04-22 |
| [text-to-speech](../skills/text-to-speech/SKILL.md) | exte | 202 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [token-waste-elimination](../skills/token-waste-elimination/SKILL.md) | stan | 125 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [ui-ux-design](../skills/ui-ux-design/SKILL.md) | stan | 672 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [user-config-manager](../skills/user-config-manager/SKILL.md) | stan | 210 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [video-generation](../skills/video-generation/SKILL.md) | stan | 292 | 1 | 0 | ✓ | 0 | 2026-04-22 |
| [visual-memory](../skills/visual-memory/SKILL.md) | exte | 271 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [vscode-configuration-validation](../skills/vscode-configuration-validation/SKILL.md) | stan | 233 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [vscode-environment](../skills/vscode-environment/SKILL.md) | stan | 111 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [vscode-extension-patterns](../skills/vscode-extension-patterns/SKILL.md) | core | 279 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [welcome-experience-customization](../skills/welcome-experience-customization/SKILL.md) | stan | 310 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [wiki-publish](../skills/wiki-publish/SKILL.md) | stan | 102 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [work-life-balance](../skills/work-life-balance/SKILL.md) | exte | 120 | 1 | 1 | ✓ | 0 | 2026-04-22 |
| [brain-upgrade](../skills/brain-upgrade/SKILL.md) | stan | 355 | 1 | 1 | ✓ | 0 | 2026-04-23 |
| [gamma-presentation](../skills/gamma-presentation/SKILL.md) | work | 362 | 1 | 0 | ✓ | 0 | 2026-04-23 |
| [book-launch-content](../skills/book-launch-content/SKILL.md) | stan | 120 | 1 | 1 | ✓ | 0 | 2026-04-25 |
| [meditation](../skills/meditation/SKILL.md) | stan | 167 | 1 | 1 | ✓ | 0 | 2026-04-25 |
| [skill-creator](../skills/skill-creator/SKILL.md) | stan | 423 | 1 | 1 | ✓ | 0 | 2026-04-25 |

**Summary**: 189 skills | Passing: 189 | Failing: 0

## Agents

| Agent | Lines | fm | handoffs | persona | Pass | Currency |
|-------|------:|:--:|:--------:|:-------:|:----:|:--------:|
| [alex](../agents/alex.agent.md) | 280 | 1 | 1 | 1 | ✓ | 2026-04-20 |
| [alex-brain-ops](../agents/alex-brain-ops.agent.md) | 337 | 1 | 1 | 1 | ✓ | 2026-04-20 |
| [alex-docs-cloud](../agents/alex-docs-cloud.agent.md) | 31 | 1 | 0 | 0 | ✓ | 2026-04-20 |
| [alex-maintenance-cloud](../agents/alex-maintenance-cloud.agent.md) | 31 | 1 | 0 | 0 | ✓ | 2026-04-20 |
| [alex-researcher-cloud](../agents/alex-researcher-cloud.agent.md) | 31 | 1 | 0 | 0 | ✓ | 2026-04-20 |
| [alex-security-cloud](../agents/alex-security-cloud.agent.md) | 31 | 1 | 0 | 0 | ✓ | 2026-04-20 |
| [alex-skill-builder](../agents/alex-skill-builder.agent.md) | 366 | 1 | 1 | 1 | ✓ | 2026-04-20 |

**Summary**: 7 agents | Passing: 7 | Failing: 0

## Instructions

| Instruction | Lines | fm | depth | sect | skill | Pass | Currency |
|-------------|------:|:--:|:-----:|:----:|:-----:|:----:|:--------:|
| [afcp-artifact-management](../instructions/afcp-artifact-management.instructions.md) | 93 | 1 | 1 | 1 | 0 | ✓ | 2026-04-20 |
| [afcp-mission-coordination](../instructions/afcp-mission-coordination.instructions.md) | 94 | 1 | 1 | 1 | 0 | ✓ | 2026-04-20 |
| [cross-project-isolation](../instructions/cross-project-isolation.instructions.md) | 88 | 1 | 1 | 1 | 0 | ✓ | 2026-04-20 |
| [currency-audit](../instructions/currency-audit.instructions.md) | 28 | 1 | 0 | 1 | 1 | ✓ | 2026-04-20 |
| [global-knowledge-sync](../instructions/global-knowledge-sync.instructions.md) | 53 | 1 | 1 | 1 | 1 | ✓ | 2026-04-20 |
| [knowledge-coverage](../instructions/knowledge-coverage.instructions.md) | 65 | 1 | 1 | 1 | 0 | ✓ | 2026-04-20 |
| [pii-memory-filter](../instructions/pii-memory-filter.instructions.md) | 65 | 1 | 1 | 1 | 0 | ✓ | 2026-04-20 |
| [proactive-awareness](../instructions/proactive-awareness.instructions.md) | 104 | 1 | 1 | 1 | 0 | ✓ | 2026-04-20 |
| [session-notes](../instructions/session-notes.instructions.md) | 51 | 1 | 1 | 1 | 1 | ✓ | 2026-04-20 |
| [prompt-authoring-standard](../instructions/prompt-authoring-standard.instructions.md) | 159 | 1 | 1 | 1 | 0 | ✓ | 2026-04-21 |
| [agent-debug-panel](../instructions/agent-debug-panel.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [ai-character-reference-generation](../instructions/ai-character-reference-generation.instructions.md) | 14 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [alex-core](../instructions/alex-core.instructions.md) | 519 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [alex-identity-integration](../instructions/alex-identity-integration.instructions.md) | 162 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [automated-quality-gates](../instructions/automated-quality-gates.instructions.md) | 108 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [bicep-avm-mastery](../instructions/bicep-avm-mastery.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [blog-writer](../instructions/blog-writer.instructions.md) | 41 | 1 | 0 | 1 | 1 | ✓ | 2026-04-22 |
| [brand-asset-management](../instructions/brand-asset-management.instructions.md) | 22 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [character-aging-progression](../instructions/character-aging-progression.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [cloud-solution-architect](../instructions/cloud-solution-architect.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [cognitive-benchmarking](../instructions/cognitive-benchmarking.instructions.md) | 151 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [doc-hygiene](../instructions/doc-hygiene.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [dream-state-automation](../instructions/dream-state-automation.instructions.md) | 84 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [epistemic-calibration](../instructions/epistemic-calibration.instructions.md) | 62 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [extension-audit-methodology](../instructions/extension-audit-methodology.instructions.md) | 25 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [fleet-management](../instructions/fleet-management.instructions.md) | 50 | 1 | 0 | 1 | 1 | ✓ | 2026-04-22 |
| [global-knowledge](../instructions/global-knowledge.instructions.md) | 23 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [heir-bootstrap](../instructions/heir-bootstrap.instructions.md) | 17 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [heir-feedback](../instructions/heir-feedback.instructions.md) | 57 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [heir-project-improvement](../instructions/heir-project-improvement.instructions.md) | 374 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [heir-sync-management](../instructions/heir-sync-management.instructions.md) | 46 | 1 | 0 | 1 | 0 | ✓ | 2026-04-22 |
| [infrastructure-as-code](../instructions/infrastructure-as-code.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [knowledge-synthesis](../instructions/knowledge-synthesis.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [kql](../instructions/kql.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [localization](../instructions/localization.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [lucid-dream](../instructions/lucid-dream.instructions.md) | 22 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [meditation](../instructions/meditation.instructions.md) | 25 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [memory-curation](../instructions/memory-curation.instructions.md) | 37 | 1 | 0 | 1 | 1 | ✓ | 2026-04-22 |
| [memory-export](../instructions/memory-export.instructions.md) | 26 | 1 | 0 | 1 | 1 | ✓ | 2026-04-22 |
| [msal-authentication](../instructions/msal-authentication.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [organic-evolution-policy](../instructions/organic-evolution-policy.instructions.md) | 43 | 1 | 0 | 1 | 0 | ✓ | 2026-04-22 |
| [planning-first-development](../instructions/planning-first-development.instructions.md) | 168 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [project-registration](../instructions/project-registration.instructions.md) | 58 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [project-taglines](../instructions/project-taglines.instructions.md) | 17 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [prompt-builder](../instructions/prompt-builder.instructions.md) | 33 | 1 | 0 | 1 | 1 | ✓ | 2026-04-22 |
| [protocol-triggers](../instructions/protocol-triggers.instructions.md) | 246 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [release-process](../instructions/release-process.instructions.md) | 15 | 1 | 0 | 0 | 0 | ✓ | 2026-04-22 |
| [repository-readiness-eval](../instructions/repository-readiness-eval.instructions.md) | 99 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [research-first-development](../instructions/research-first-development.instructions.md) | 13 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [research-first-workflow](../instructions/research-first-workflow.instructions.md) | 381 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [self-actualization](../instructions/self-actualization.instructions.md) | 13 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [session-health-monitoring](../instructions/session-health-monitoring.instructions.md) | 110 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [sidebar-customization](../instructions/sidebar-customization.instructions.md) | 19 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [skill-building](../instructions/skill-building.instructions.md) | 18 | 1 | 0 | 0 | 0 | ✓ | 2026-04-22 |
| [skill-creator](../instructions/skill-creator.instructions.md) | 56 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [skill-development](../instructions/skill-development.instructions.md) | 22 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [skill-selection-optimization](../instructions/skill-selection-optimization.instructions.md) | 212 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [sse-streaming](../instructions/sse-streaming.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [svg-graphics](../instructions/svg-graphics.instructions.md) | 11 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [token-waste-elimination](../instructions/token-waste-elimination.instructions.md) | 24 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [user-config-manager](../instructions/user-config-manager.instructions.md) | 25 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [welcome-experience-customization](../instructions/welcome-experience-customization.instructions.md) | 37 | 1 | 0 | 1 | 1 | ✓ | 2026-04-22 |
| [wiki-publish](../instructions/wiki-publish.instructions.md) | 24 | 1 | 0 | 0 | 1 | ✓ | 2026-04-22 |
| [worldview-constitutional-ai](../instructions/worldview-constitutional-ai.instructions.md) | 70 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [worldview-integration](../instructions/worldview-integration.instructions.md) | 84 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [worldview-moral-psychology](../instructions/worldview-moral-psychology.instructions.md) | 84 | 1 | 1 | 1 | 0 | ✓ | 2026-04-22 |
| [brain-upgrade](../instructions/brain-upgrade.instructions.md) | 108 | 1 | 1 | 1 | 1 | ✓ | 2026-04-23 |
| [north-star](../instructions/north-star.instructions.md) | 59 | 1 | 1 | 1 | 1 | ✓ | 2026-04-23 |
| [identity-customization](../instructions/identity-customization.instructions.md) | 65 | 1 | 1 | 1 | 1 | ✓ | 2026-04-25 |
| [learned-patterns](../instructions/learned-patterns.instructions.md) | 138 | 1 | 1 | 1 | 0 | ✓ | 2026-04-25 |

**Summary**: 70 instructions | Passing: 70 | Failing: 0

## Prompts

| Prompt | Lines | desc | app | agent | >20L | Pass | Currency |
|--------|------:|:----:|:---:|:-----:|:----:|:----:|:--------:|
| [audit-writing](../prompts/audit-writing.prompt.md) | 53 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [blog-write](../prompts/blog-write.prompt.md) | 16 | 1 | 1 | 1 | 0 | ✓ | 2026-04-21 |
| [brand](../prompts/brand.prompt.md) | 33 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [critical-thinking](../prompts/critical-thinking.prompt.md) | 25 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [currency-audit](../prompts/currency-audit.prompt.md) | 41 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [customize-sidebar](../prompts/customize-sidebar.prompt.md) | 55 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [dashboard](../prompts/dashboard.prompt.md) | 43 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [debug](../prompts/debug.prompt.md) | 51 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [explain](../prompts/explain.prompt.md) | 34 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [fix](../prompts/fix.prompt.md) | 49 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [fleet-upgrade](../prompts/fleet-upgrade.prompt.md) | 54 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [gamma](../prompts/gamma.prompt.md) | 220 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [graph-api](../prompts/graph-api.prompt.md) | 212 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [identity-customization](../prompts/identity-customization.prompt.md) | 27 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [image-handling](../prompts/image-handling.prompt.md) | 128 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [interpret](../prompts/interpret.prompt.md) | 47 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [markdown-mermaid](../prompts/markdown-mermaid.prompt.md) | 67 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [marp](../prompts/marp.prompt.md) | 193 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [masteraudit](../prompts/masteraudit.prompt.md) | 57 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [mcp-server](../prompts/mcp-server.prompt.md) | 195 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [md-scaffold](../prompts/md-scaffold.prompt.md) | 130 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [plan](../prompts/plan.prompt.md) | 103 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [presentation](../prompts/presentation.prompt.md) | 106 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [project-dashboard](../prompts/project-dashboard.prompt.md) | 76 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [publish-all](../prompts/publish-all.prompt.md) | 59 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [refactor](../prompts/refactor.prompt.md) | 53 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [release](../prompts/release.prompt.md) | 58 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [review](../prompts/review.prompt.md) | 51 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [root-cause-analysis](../prompts/root-cause-analysis.prompt.md) | 45 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [secrets](../prompts/secrets.prompt.md) | 108 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [setup-ai-memory](../prompts/setup-ai-memory.prompt.md) | 43 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [spec](../prompts/spec.prompt.md) | 65 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [tdd](../prompts/tdd.prompt.md) | 59 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [teams-app](../prompts/teams-app.prompt.md) | 202 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [tests](../prompts/tests.prompt.md) | 57 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [ui-ux-audit](../prompts/ui-ux-audit.prompt.md) | 703 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [validate-config](../prompts/validate-config.prompt.md) | 95 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [visual-memory](../prompts/visual-memory.prompt.md) | 180 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [visualize](../prompts/visualize.prompt.md) | 42 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [vscode-extension-audit](../prompts/vscode-extension-audit.prompt.md) | 176 | 1 | 1 | 1 | 1 | ✓ | 2026-04-21 |
| [analyze-data](../prompts/loop/analyze-data.prompt.md) | 85 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [build](../prompts/loop/build.prompt.md) | 72 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [customize-welcome](../prompts/customize-welcome.prompt.md) | 28 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [data-story](../prompts/loop/data-story.prompt.md) | 109 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [debug](../prompts/loop/debug.prompt.md) | 75 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [dependencies](../prompts/loop/dependencies.prompt.md) | 127 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [diagram](../prompts/loop/diagram.prompt.md) | 85 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [doc-audit](../prompts/loop/doc-audit.prompt.md) | 94 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [gap-analysis](../prompts/loop/gap-analysis.prompt.md) | 79 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [health-check](../prompts/loop/health-check.prompt.md) | 106 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [ideate](../prompts/loop/ideate.prompt.md) | 47 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [improve](../prompts/loop/improve.prompt.md) | 44 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [learn](../prompts/loop/learn.prompt.md) | 66 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [literature](../prompts/loop/literature.prompt.md) | 106 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [meeting-notes](../prompts/loop/meeting-notes.prompt.md) | 106 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [north-star](../prompts/loop/north-star.prompt.md) | 75 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [plan](../prompts/loop/plan.prompt.md) | 55 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [presentation](../prompts/loop/presentation.prompt.md) | 88 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [refactor](../prompts/loop/refactor.prompt.md) | 52 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [release](../prompts/loop/release.prompt.md) | 48 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [research](../prompts/loop/research.prompt.md) | 82 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [responsible-ai](../prompts/loop/responsible-ai.prompt.md) | 84 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [review](../prompts/loop/review.prompt.md) | 61 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [security](../prompts/loop/security.prompt.md) | 114 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [sfi-review](../prompts/loop/sfi-review.prompt.md) | 102 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [tdd](../prompts/loop/tdd.prompt.md) | 84 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [tech-debt](../prompts/loop/tech-debt.prompt.md) | 121 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [test](../prompts/loop/test.prompt.md) | 66 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [write-email](../prompts/loop/write-email.prompt.md) | 110 | 1 | 1 | 1 | 1 | ✓ | 2026-04-22 |
| [propose-change](../prompts/propose-change.prompt.md) | 112 | 1 | 1 | 1 | 1 | ✓ | 2026-04-23 |

**Summary**: 70 prompts | Passing: 70 | Failing: 0

## Muscles

| Muscle | Lines | Lang | Category | comments | err | compat | Pass | inh | Currency |
|--------|------:|:----:|----------|:--------:|:---:|:------:|:----:|:---:|:--------:|
| [analyze-assignments.cjs](../muscles/analyze-assignments.cjs) | 152 | js | analysis | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [audit-token-waste.cjs](../muscles/audit-token-waste.cjs) | 465 | js | validation | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [brain-qa.cjs](../muscles/brain-qa.cjs) | 1448 | js | validation | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [chart-recommend.cjs](../muscles/chart-recommend.cjs) | 255 | js | analysis | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [dashboard-scaffold.cjs](../muscles/dashboard-scaffold.cjs) | 330 | js | converter | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [data-ingest.cjs](../muscles/data-ingest.cjs) | 376 | js | analysis | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [data-profile.cjs](../muscles/data-profile.cjs) | 298 | js | analysis | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [docx-to-md.cjs](../muscles/docx-to-md.cjs) | 393 | js | converter | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [dream-creativity-score.cjs](../muscles/dream-creativity-score.cjs) | 159 | js | utility | 1 | 0 | 1 | ✓ | 0 | 2026-04-20 |
| [fix-fence-bug.cjs](../muscles/fix-fence-bug.cjs) | 236 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [fleet-feedback-aggregator.cjs](../muscles/fleet-feedback-aggregator.cjs) | 257 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [fleet-pattern-aggregator.cjs](../muscles/fleet-pattern-aggregator.cjs) | 336 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [gamma-generator.cjs](../muscles/gamma-generator.cjs) | 922 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [insight-pipeline.cjs](../muscles/insight-pipeline.cjs) | 207 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [install-hooks.cjs](../muscles/install-hooks.cjs) | 90 | js | build | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [markdown-lint.cjs](../muscles/markdown-lint.cjs) | 452 | js | validation | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [md-scaffold.cjs](../muscles/md-scaffold.cjs) | 550 | js | converter | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [md-to-eml.cjs](../muscles/md-to-eml.cjs) | 457 | js | converter | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [md-to-html.cjs](../muscles/md-to-html.cjs) | 451 | js | converter | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [md-to-word.cjs](../muscles/md-to-word.cjs) | 1257 | js | converter | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [nav-inject.cjs](../muscles/nav-inject.cjs) | 230 | js | converter | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [new-skill.cjs](../muscles/new-skill.cjs) | 162 | js | build | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [normalize-paths.cjs](../muscles/normalize-paths.cjs) | 258 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [ralph-loop.cjs](../muscles/ralph-loop.cjs) | 750 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [session-name.cjs](../muscles/session-name.cjs) | 247 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [update-notes.cjs](../muscles/update-notes.cjs) | 226 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [update-registry.cjs](../muscles/update-registry.cjs) | 329 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [validate-skills.cjs](../muscles/validate-skills.cjs) | 155 | js | validation | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [visual-memory.cjs](../muscles/visual-memory.cjs) | 604 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-20 |
| [html-to-md.cjs](../muscles/html-to-md.cjs) | 178 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-21 |
| [md-to-epub.cjs](../muscles/md-to-epub.cjs) | 181 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-21 |
| [md-to-latex.cjs](../muscles/md-to-latex.cjs) | 189 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-21 |
| [md-to-pdf.cjs](../muscles/md-to-pdf.cjs) | 311 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-21 |
| [md-to-pptx.cjs](../muscles/md-to-pptx.cjs) | 166 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-21 |
| [md-to-txt.cjs](../muscles/md-to-txt.cjs) | 130 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-21 |
| [pptx-to-md.cjs](../muscles/pptx-to-md.cjs) | 164 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-21 |
| [token-cost-report.cjs](../muscles/token-cost-report.cjs) | 248 | js | utility | 1 | 0 | 1 | ✓ | 0 | 2026-04-21 |
| [brain-upgrade.cjs](../muscles/brain-upgrade.cjs) | 735 | js | utility | 1 | 1 | 1 | ✓ | 0 | 2026-04-23 |
| [md-to-gamma.cjs](../muscles/md-to-gamma.cjs) | 275 | js | utility | 1 | 0 | 1 | ✓ | 0 | 2026-04-23 |

**Summary**: 39 muscles | Passing: 39 | Failing: 0

**Inheritance**: Master-only(1): 0 | Inheritable(0): 39

**Metadata Adoption**: 39/39 have standard header | 30/39 linked to skills

**Categories**: analysis: 4 | validation: 4 | converter: 7 | utility: 22 | build: 2

## Hooks

| Hook | Lines | Event | header | stdin | stdout | err | Pass | Currency |
|------|------:|-------|:------:|:-----:|:------:|:---:|:----:|:--------:|
| [builder-post-tool-use.cjs](../muscles/hooks/builder-post-tool-use.cjs) | 47 | builder-post-tool-use | 1 | 1 | 1 | 1 | ✓ | 2026-04-20 |
| [documentarian-post-tool-use.cjs](../muscles/hooks/documentarian-post-tool-use.cjs) | 93 | documentarian-post-tool-use | 1 | 1 | 1 | 1 | ✓ | 2026-04-20 |
| [researcher-session-start.cjs](../muscles/hooks/researcher-session-start.cjs) | 86 | researcher-session-start | 1 | 1 | 1 | 1 | ✓ | 2026-04-20 |
| [researcher-stop.cjs](../muscles/hooks/researcher-stop.cjs) | 58 | researcher-stop | 1 | 1 | 1 | 1 | ✓ | 2026-04-20 |
| [validator-pre-tool-use.cjs](../muscles/hooks/validator-pre-tool-use.cjs) | 62 | validator-pre-tool-use | 1 | 1 | 1 | 1 | ✓ | 2026-04-20 |
| [validator-session-start.cjs](../muscles/hooks/validator-session-start.cjs) | 69 | validator-session-start | 1 | 1 | 1 | 1 | ✓ | 2026-04-20 |

**Summary**: 6 hooks | Passing: 6 | Failing: 0

## Overall

| Category | Count |
|----------|------:|
| Skills | 189 |
| Agents | 7 |
| Instructions | 70 |
| Prompts | 70 |
| Muscles | 39 |
| Hooks | 6 |
| **Total** | **381** |

## Token Waste

> **Philosophy**: Brain files are LLM-consumed. Mermaid diagrams render for humans but waste tokens for LLMs (who see raw syntax like `flowchart LR` and `style X fill:#...`). Use concise prose descriptions instead.

**Status**: ⚠️ Found 4 Mermaid blocks across 3 files (~40 lines of waste)

| File | Type | Mermaid | Lines | Style | Score | Fix |
|------|:----:|--------:|------:|------:|------:|-----|
| [markdown-mermaid](../skills/markdown-mermaid/SKILL.md) | skill | 2 | 26 | 6 | 16 | Replace with prose |
| [lint-clean-markdown](../skills/lint-clean-markdown/SKILL.md) | skill | 1 | 13 | 0 | 5 | Replace with prose |
| [architecture-audit](../skills/architecture-audit/SKILL.md) | skill | 1 | 1 | 0 | 5 | Replace with prose |

**Fix**: Replace Mermaid diagrams with concise prose, e.g.:
- `flowchart LR: A --> B --> C` → `**A → B → C**`
- Complex workflows → Numbered steps or bullet list

## Cross-References

**Status**: ⚠️ 7 broken reference(s) found

| Source | Type | References | Target Missing |
|--------|:----:|------------|----------------|
| skills/converter-qa | muscle | → converter-qa.cjs | ✗ |
| skills/gamma-presentation | instruction | → gamma-presentation | ✗ |
| skills/heir-bootstrap | instruction | → project-specific | ✗ |
| skills/pptx-generation | muscle | → pptxgen-cli.cjs | ✗ |
| skills/ralph-loop | skill | → cosmos-db | ✗ |
| instructions/heir-project-improvement | instruction | → code-review | ✗ |
| instructions/heir-project-improvement | prompt | → code-review | ✗ |

## Skill Conflicts

**Status**: ⚠️ 40 potential conflict(s) — review for contradictory advice

| # | File A | File B | applyTo Overlap | Topic Overlap | Score |
|--:|--------|--------|-----------------|---------------|------:|
| 1 | skill/pii-privacy-regulations | skill/privacy-responsible-ai | privacy, pii, gdpr, consent | privacy, staleness, warning, transparency, data | 22 |
| 2 | skill/academic-paper-drafting | skill/academic-research | paper, manuscript, journal | academic, templates, workflows, related, review | 21 |
| 3 | skill/docx-to-md | skill/md-to-word | docx, word | convert, word, documents, markdown, image | 18 |
| 4 | skill/secrets-management | skill/security-review | secret, credential, token, auth | management, secure, code, credential, core | 18 |
| 5 | skill/academic-research | skill/dissertation-defense | thesis, dissertation | structure, question, committee, management, templates | 16 |
| 6 | skill/global-knowledge | skill/knowledge-synthesis | knowledge, insight, pattern | knowledge, cross-project, pattern, recognition, insight | 16 |
| 7 | skill/hypothesis-driven-debugging | skill/root-cause-analysis | debug, bug, error | debugging, systematic, find, root, cause | 16 |
| 8 | skill/project-deployment | skill/release-preflight | release, deploy, publish, json | deployment, quick, common, related | 16 |
| 9 | skill/debugging-patterns | skill/hypothesis-driven-debugging | debug, error, fix | debugging, systematic, error, hypothesis, testing | 15 |
| 10 | skill/global-knowledge | instruction/knowledge-synthesis | knowledge, insight, pattern | knowledge, cross-project, pattern, recognition, insight | 15 |
| 11 | instruction/research-first-development | instruction/research-first-workflow | research, gap-analysis | research, first, development, research-first, workflow | 15 |
| 12 | skill/cognitive-load | skill/socratic-questioning | explain, teach, learn | dont, core, principle, types, good | 14 |
| 13 | skill/debugging-patterns | skill/root-cause-analysis | debug, error, issue | debugging, systematic, analysis, common, categories | 14 |
| 14 | skill/foundry-agent-platform | skill/multi-agent-orchestration | agent, orchestrat | agent, orchestration, rapid, evolution, domain | 14 |
| 15 | skill/incident-response | skill/postmortem | incident, outage | incident, handling, prevention, template, summary | 14 |
| 16 | skill/learning-psychology | skill/socratic-questioning | learn, teach, explain | help, core, guidance, dont, good | 14 |
| 17 | skill/project-taglines | skill/sidebar-customization | github, json, config | project-specific, alex, sidebar, quick, reference | 14 |
| 18 | skill/project-taglines | skill/welcome-experience-customization | github, json, config | taglines, quick, reference, checklist, integration | 14 |
| 19 | skill/ai-agent-design | skill/multi-agent-orchestration | agent, orchestrat | agent, agents, tasks, core, framework | 13 |
| 20 | skill/azure-architecture-patterns | skill/cloud-solution-architect | cloud, waf | azure, architecture, well-architected, framework, principles | 13 |

*... and 20 more. Run with `--stdout` to see all.*