# Legacy to Modern Migration Patterns

## Core Theory & Mental Models

- **Equivalence classes**: behavioral parity, data parity, and operational parity are rarely achieved simultaneously—prioritize explicitly.
- **Risk layering**: data migration, traffic shifting, and rollback windows compose into an aggregate risk surface.
- **Anti-pattern**: resume-driven modernization without measurable outcomes or sunset criteria for old pathways.
- **Economics of duration**: long migrations accrue opportunity cost; architectural decisions should shorten critical paths.

## Learning Path & Maturity Stages

1. **Define success signals** — SLOs, defect budgets, and business KPIs tied to migration phases.
2. **Isolate blast radius** — Feature flags, shadow traffic, and bounded contexts before cutovers.
3. **Automate verification** — Contract tests, reconciliation jobs, and observability-driven comparisons.
4. **Decommission deliberately** — Kill switches, debt retirement, and documentation of residual constraints.
