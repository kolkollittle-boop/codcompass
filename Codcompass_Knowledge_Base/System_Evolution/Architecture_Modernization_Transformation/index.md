# Architecture Modernization & Transformation

## Core Theory & Mental Models

- **Modernization is continuous migration, not a big bang.** Estates evolve while revenue flows; your architecture must tolerate partial truth and reversible steps.
- **Constraints are the specification.** Legacy data models, operational habits, and regulatory boundaries beat aspirational diagrams.
- **Boundary placement is strategy.** Microservices, modular monoliths, and strangler patterns differ mainly in where you buy coupling versus coordination overhead.

## Key Patterns & Decision Frameworks

- **Strangler fig routing:** Incrementally peel domains behind stable seams with measurable customer impact per slice.
- **Migration portfolios:** Classify workloads by risk, uncertainty, and coupling before picking sequencing—avoid vanity early wins that block later pivots.
- **Platform negotiation:** Decide what becomes paved-road vs optional; optional paths need stronger observability and clearer ownership.

## Learning Path & Maturity Model

1. **Foundational:** Inventory reality—dependencies, traffic shapes, change cadence—and establish baseline SLO thinking.
2. **Intermediate:** Bounded contexts with explicit APIs and migration paths that survive partial adoption.
3. **Advanced:** Multi-year programs with economic checkpoints and measurable reduction of operational toil.
4. **Principal:** Org-wide architectural governance—principles that survive leadership churn and vendor hype cycles.
