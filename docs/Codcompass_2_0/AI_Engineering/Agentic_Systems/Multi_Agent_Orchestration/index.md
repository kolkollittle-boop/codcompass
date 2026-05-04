# Multi-Agent Orchestration

## Core Theory & Mental Models

- **Coordination patterns**: supervisor–worker, peer negotiation, pipeline stages, and blackboard-style shared context—choose by coupling and latency budgets.
- **Consistency vs. autonomy**: stronger coordination reduces divergence but increases coupling and operational brittleness.
- **Emergent complexity**: without interfaces and contracts, multi-agent systems recreate distributed-systems failures at semantic speed.
- **Evaluation-first**: orchestration quality is measured by outcomes under distribution shift, not demo coherence.

## Learning Path & Maturity Stages

1. **Single-agent discipline** — Reliable tools, schemas, and telemetry before adding actors.
2. **Deterministic choreography** — Fixed graphs with explicit failure semantics and compensating actions.
3. **Adaptive orchestration** — Dynamic routing when bounded by policies, budgets, and observability.
4. **Fleet governance** — Cross-agent SLOs, cost envelopes, and organizational ownership of shared context stores.
