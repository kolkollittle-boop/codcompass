# Performance & Resilience Engineering

## Core Theory & Mental Models

- **Performance is a feature with owners**: latency budgets and tail discipline require accountability, not heroics.
- **Resilience budgets**: timeouts, retries, bulkheads, and load shedding are finite resources—oversubscription causes correlated failure.
- **Load shape literacy**: steady-state, spikes, and adversarial patterns imply different architectures than average-case thinking.
- **Observability prerequisite**: you cannot tune what you cannot slice by user cohort, dependency, and release.

## Learning Path & Maturity Stages

1. **Measurement baseline** — Golden signals, tracing readiness, and representative workloads.
2. **Structural fixes** — Caching semantics, concurrency models, and data access patterns before micro-optimizations.
3. **Chaos & degradation** — Game days, failure injection, and graceful degradation contracts.
4. **Continuous resilience** — SLO-driven prioritization and architectural feedback into design reviews.
