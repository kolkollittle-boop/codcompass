# Advanced RAG Patterns

## Core Theory & Mental Models

- **Retrieval is not search**: recall@k on benchmarks ≠ utility under conversational and transactional workloads.
- **Pipeline decomposition**: routing, rewriting, retrieval fusion, reranking, and context packing are independently tunable stages.
- **Hybrid retrieval doctrine**: sparse + dense + metadata filters address complementary failure modes; fusion strategy is an architectural choice.
- **Operational hazards**: staleness, permission leakage across tenants, and prompt injection via documents require systemic controls.

## Learning Path & Maturity Stages

1. **Baseline RAG hygiene** — Chunk boundaries, deduplication, and permission-aware indexing.
2. **Adaptive retrieval** — Query understanding, multi-hop decomposition, and confidence-aware expansion.
3. **Quality at scale** — Online evaluation, human calibration slices, and regression suites tied to corpus deltas.
4. **Evolution path** — When to graduate from retrieval-augmented generation to richer knowledge graphs or tool-mediated reasoning—explicit triggers.
