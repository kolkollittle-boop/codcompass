# Knowledge Architectures

## Core Theory & Mental Models

- **Knowledge as a system**: ingestion, representation, retrieval, and grounding are separate failure domains with distinct SLOs.
- **Semantic vs. symbolic**: hybrid approaches balance interpretability, maintainability, and recall under noisy corpora.
- **Freshness & authority**: not all knowledge ages equally; architectures encode provenance and decay explicitly.
- **Evaluation mirrors production**: offline metrics without query distribution fidelity mislead architecture choices.

## Learning Path & Maturity Stages

1. **Corpus governance** — Ownership, licensing posture, and lifecycle for sources of truth.
2. **Retrieval foundations** — Chunking philosophies, embedding geometry assumptions, and filtering strategies.
3. **Grounding discipline** — Attenuate hallucination risk through interfaces, citations, and abstention policies.
4. **Compound intelligence** — Feedback loops that improve retrieval and generation without silent regressions.
