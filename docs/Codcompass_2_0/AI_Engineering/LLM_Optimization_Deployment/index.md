# LLM Optimization & Deployment

## Core Theory & Mental Models

- **Latency–quality–cost triangle**: moving one vertex affects the others; decisions must name the fixed constraint.
- **Serving tiers**: interactive, batch, and near-real-time workloads imply different scaling and resilience patterns.
- **Compression & approximation**: quantization and distillation trade fidelity for economics—explicitly track regression domains.
- **Operational drift**: model, data, and prompt pipelines all drift; deployment includes change detection, not only release mechanics.

## Learning Path & Maturity Stages

1. **Baseline profiling** — Establish latency distributions, token economics, and failure modes on representative traffic.
2. **Controlled optimization** — Apply changes behind canaries with automated rollback and offline parity checks where possible.
3. **Hardware-aware design** — Align batching, memory, and parallelism with deployment topology (edge, datacenter, hybrid).
4. **Lifecycle governance** — Versioning, audit trails, and cross-functional accountability for model changes.
