---
sem: 1
description: Run a currency audit — full assessment (freshness + semantic consistency) before stamping dates
application: "When brain-qa shows expired currency dates or when performing scheduled maintenance"
agent: Brain Ops
currency: 2026-04-20
---

# /currency-audit — Brain File Full Assessment

Full review of brain files — external freshness AND internal consistency — stamp only after all checks pass.

## Workflow

1. **Generate grid**: Run `node .github/muscles/brain-qa.cjs` and read the Priority Queue
2. **Select batch**: Pick the top 10-15 files from the Priority Queue
3. **Per-file review**: For each file, apply the currency-audit skill checklist:
   - Frontmatter completeness
   - Content freshness (APIs, versions, URLs, best practices)
   - **Semantic consistency** (terminology, claims match reality, cross-refs, no contradictions, process logic)
   - Structural quality (token waste, progressive disclosure)
   - Inheritance correctness (master-only vs inheritable)
4. **Fix and stamp**: Fix ALL issues, then stamp `currency:` to today — partial review does not earn a stamp
5. **Verify**: Re-run brain-qa, confirm all reviewed files pass
6. **Report**: Summarize what was updated and any findings worth noting
