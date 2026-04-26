---
type: instruction
lifecycle: stable
description: "Brain evolution governance — criteria for skill promotion, retirement, and architectural growth"
application: "When proposing new skills, instructions, or agents for promotion to master brain"
applyTo: "**/.github/skills/**,**/.github/instructions/**,**/.github/agents/**"
currency: 2026-04-22
---

# Organic Evolution Policy

The brain grows by need, not by plan. Every addition must earn its place.

## Promotion Criteria

A new brain file (skill, instruction, agent, prompt) is promoted to master when ALL of:

1. **Battle-tested**: Used successfully in 3+ independent projects or sessions
2. **Passes brain-qa**: All frontmatter fields present, currency recent, no token waste flags
3. **Fills a gap**: No existing skill/instruction covers the same domain adequately
4. **Self-contained**: No external dependencies that break portability across heirs
5. **Trifecta preferred**: Workflow skills should have matching instruction + muscle where applicable

## Retirement Criteria

Remove or archive a brain file when ANY of:

1. **Zero activations**: Never matched by applyTo in 90+ days across the fleet
2. **Superseded**: A newer, better file covers the same domain
3. **Stale beyond repair**: Currency >180 days old and content no longer accurate
4. **Token waste**: File costs more tokens than the value it delivers

## Growth Guardrails

- **No speculative additions**: Don't create skills for hypothetical future needs
- **Consolidate before splitting**: If two instructions overlap >50%, merge them
- **Instruction ≠ Skill**: Instructions are always-on behavioral rules; skills are on-demand deep knowledge. Don't duplicate content across both — the instruction should reference the skill
- **Count discipline**: When adding files, update counts in all 8+ documentation surfaces (see repo memory for locations)

## Review Cadence

- **Weekly**: brain-qa scan catches frontmatter/currency issues automatically
- **Monthly**: Manual review of activation patterns (which skills never fire?)
- **Per-release**: Audit total token cost of always-on instructions
