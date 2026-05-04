# Scalable Systems Design

## Core Theory & Mental Models

- **Scaling dimensions**: horizontal scale addresses throughput; organizational scale demands boundaries and contracts.
- **State placement**: where state lives determines failover, consistency, and evolution cost—centralize only with justification.
- **Hot-spot laws**: popularity distributions dominate; designs must degrade predictably under skew.
- **Elasticity vs. efficiency**: autoscaling hides inefficiency until economics force reckoning—capacity modeling remains essential.

## Learning Path & Maturity Stages

1. **Single-region excellence** — Correctness, idempotency, and backpressure before multi-region ambition.
2. **Partitioning strategy** — Sharding keys, tenancy models, and blast-radius containment.
3. **Distributed consistency posture** — Explicit CAP/PACELC trade-offs per subsystem—not slogans.
4. **Cost-aware scale** — Unit economics, architectural amortization, and sunset of low-value paths.
