# DevOps & Infrastructure as Code

## Core Theory & Mental Models

- **Delivery speed is trust in change.** Pipelines succeed when blast radius, rollback paths, and accountability are obvious—not when automation is maximal.
- **Infrastructure is code—and policy.** Declarative stacks without enforcement drift toward tribal knowledge and midnight fixes.
- **Operations scales through platforms.** Shared primitives beat bespoke scripts; bespoke thrives only where differentiation truly exists.

## Key Patterns & Decision Frameworks

- **GitOps vs imperative automation:** Prefer declarative reconciliation when drift detection matters; imperative orchestration when migrations are inherently procedural.
- **Environment strategy:** Parity costs money; invest proportionally to risk—protect production fidelity for data and networking semantics above cosmetic sameness.
- **Observability pairing:** Every IaC change should imply dashboards/alerts deltas or you have deferred incidents.

## Learning Path & Maturity Model

1. **Foundational:** Repeatable builds, secrets hygiene, and CI that fails loudly on regressions.
2. **Intermediate:** Modular IaC with environments, policy checks, and progressive rollout (canaries, feature flags).
3. **Advanced:** Multi-account/region governance, cost-aware autoscaling, and incident-ready runbooks encoded beside services.
4. **Principal:** Internal developer platforms—golden paths, paved roads, and measured freedom for teams that outgrow central scripts.
