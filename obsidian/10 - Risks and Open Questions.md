# Risks and Open Questions

## Risks from later bets

### Ollama assistant

- Topology and scan data in prompts can leak if the configured endpoint is not actually customer-owned.
- Operators may treat model answers as inventory truth.
- Large graphs will overflow context windows; answers must be scoped to selection or filters.

Open questions:

- What is the first useful question an operator would ask?
- Is the unit of context a saved view, a site, or the current selection?
- Who is allowed to enable the Ollama URL in a production deployment?

### DevOps containers, logs, and console

- Host-to-container mapping without a trusted runtime source will be stale or wrong.
- Log ingestion can turn Brian into an accidental log platform.
- Console/exec is a high-impact credential and audit surface.

Open questions:

- First runtime source: Docker API on the host, an agent plugin, or deep-links only?
- Lifecycle: inferred from runtime state, or imported from a pipeline the customer already has?
- Is console required for usefulness, or are logs plus placement enough?

## Core product risks (unchanged)

- Scope expansion before the discovery loop is trusted.
- Integrations that write back to NetBox without an explicit later decision.
- Color-only state on the topology canvas.
