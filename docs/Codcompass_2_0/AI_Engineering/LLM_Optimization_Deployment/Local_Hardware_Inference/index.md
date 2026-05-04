# Local Hardware Inference

## Core Theory & Mental Models

- **Privacy–latency–capacity trade-off**: local inference exchanges centralized scale for data locality and tail-latency control.
- **Hardware envelopes**: thermal, memory bandwidth, and batch-size ceilings define feasible serving architectures.
- **Model–hardware co-design**: architecture choices (attention patterns, precision, KV footprint) dominate raw TFLOPS claims.
- **Update mechanics**: on-device models imply distinct distribution, signing, and rollback models versus cloud-only stacks.

## Learning Path & Maturity Stages

1. **Workload characterization** — Interactive vs. batch, sequence lengths, and concurrent sessions on target silicon.
2. **Efficiency tactics** — Precision reduction, speculative decoding patterns, and caching strategies within hardware limits.
3. **Reliability at the edge** — Degraded modes, offline behavior, and observability without central aggregation.
4. **Platform integration** — Unified release ethics, compliance boundaries, and hybrid fallback policies.
