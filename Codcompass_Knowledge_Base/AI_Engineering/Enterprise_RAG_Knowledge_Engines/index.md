# Enterprise RAG & Knowledge Engines

## Core Theory & Mental Models

- **Retrieval is a systems problem, not an embedding trick.** Quality emerges from ingestion hygiene, representation choices, routing, ranking, and operational feedback—not from a single vector index.
- **Grounding has economic semantics.** Every retrieval path implies freshness obligations, licensing posture, and accountability for wrong synthesis.
- **Knowledge engines decay without ownership.** Without editorial loops and telemetry on “why this was retrieved,” corpora silently rot.

## Key Patterns & Decision Frameworks

- **Chunking strategy vs task surface:** Match segmentation to the unit of evidence users must cite; avoid token-count superstitions that fracture semantics.
- **Hybrid retrieval:** Combine lexical and dense signals when vocabulary shifts, codes, or SKUs dominate; tune with offline replay and online guardrails.
- **Pipeline architecture:** Separate crawl/ETL, enrichment, indexing, and serving; isolate failures so partial freshness remains explainable.
- **Governance:** Version datasets, document transformations, and enforce redaction/classification before vectors leave trusted zones.

## Learning Path & Maturity Model

1. **Foundational:** Baseline semantic search with measurable precision/recall proxies on curated evaluation sets.
2. **Intermediate:** Production ingestion with schema-aware metadata, deduplication, and human review hooks for high-risk domains.
3. **Advanced:** Multi-index routing, rerankers, query rewriting, and feedback loops that close the gap between clicks and outcomes.
4. **Principal:** Federated knowledge graphs across business units with unified observability, SLAs, and compliance-ready lineage.
