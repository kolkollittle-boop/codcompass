# Cognitive & Architectural Thinking

## Core Theory & Mental Models

- **Architecture is the shape of change.** Good structures make correct futures cheaper and incorrect futures visible early.
- **Abstractions leak power.** Every layer hides detail—but hides the wrong detail and teams compensate with secrecy and outages.
- **Coordination is the scarcest resource.** Designs should minimize synchronous coupling unless the domain truly demands it.

## Key Patterns & Decision Frameworks

- **Invariants first:** Identify non-negotiable properties (consistency, privacy, latency envelopes) before debating tech logos.
- **Scenario storms:** Walk migrations, incidents, and org splits as thought experiments—cheap failures on paper.
- **Explicit trade-off tables:** Capture alternatives with owners, costs, and reversible commitments; architecture reviews center on decisions not diagrams.

## Learning Path & Maturity Model

1. **Foundational:** Clear component diagrams with interfaces and failure propagation paths—not decorative boxes.
2. **Intermediate:** Fitness functions—automated checks that encode architectural intent (module boundaries, forbidden deps).
3. **Advanced:** Evolutionary architecture—guided experimentation with measurement gates and sunset discipline.
4. **Principal:** Institution-scale steering—principles, RFC culture, and empowerment models that align autonomy with coherence.
