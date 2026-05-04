# AI Agents & Orchestration

## Core Theory & Mental Models

- **Agency is bounded computation.** An agent is not “autonomy”; it is policy + tools + memory under constraints. Confusing demos for agency produces systems that cannot be owned in production.
- **Orchestration is control theory for software.** You are designing feedback loops (plan → act → observe → revise) with latency budgets, failure domains, and human gates.
- **Evaluation precedes scaling.** If you cannot falsify claims about behavior on representative workloads, orchestration depth only amplifies risk.

## Key Patterns & Decision Frameworks

- **Single-agent vs multi-agent:** Introduce multiple agents only when responsibilities, failure isolation, or cognitive load clearly diverge; otherwise prefer composable tools and structured workflows.
- **Human-in-the-loop placement:** Decide *where* judgment is mandatory (policy, spend, safety, irreversible effects) rather than sprinkling approvals reactively.
- **Tool contracts:** Treat tools like microservices—explicit schemas, timeouts, idempotency notes, and blast-radius limits.
- **Memory tiers:** Separate ephemeral working state, durable task memory, and curated organizational knowledge; mixing them creates silent drift.

## Learning Path & Maturity Model

1. **Foundational:** Reliable tool use, tracing, and regression suites on golden tasks.
2. **Intermediate:** Workflow graphs with retries, compensations, and measurable SLIs for agent-assisted flows.
3. **Advanced:** Multi-agent decomposition with shared observability, conflict resolution, and economic governance (cost caps, model routing).
4. **Principal:** Org-wide agent platforms—policy engines, audit trails, and lifecycle management rivaling traditional service estates.
