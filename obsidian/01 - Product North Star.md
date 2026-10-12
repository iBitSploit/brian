# Product North Star

## Vision

Enable infrastructure and security teams to see, understand, and manage their entire network topology in real time across on-premises, cloud, and distributed locations.

## Mission

Brian turns fragmented infrastructure observations into a trustworthy, inspectable topology. It combines inventory, scans, agents, and manual knowledge without forcing teams to abandon the systems they already use.

## Value proposition

- One visual context for devices, interfaces, services, sites, and relationships.
- Faster reconnaissance and incident context.
- Less manual topology maintenance.
- Open source and self-hosted.
- Clear provenance: where a fact came from and when it was observed.

## Product principles

1. Topology first: relationships matter more than decoration.
2. Progressive disclosure: show the right detail at the right zoom and context.
3. State is explicit: active, degraded, offline, unknown, and stale must be distinguishable.
4. Source-aware: never hide whether data came from NetBox, a scan, an agent, or a person.
5. Read before write: external integrations start with safe, read-only synchronization.
6. Boring infrastructure: deployments, failures, logs, and recovery should be predictable.
7. Small surfaces: the MVP should solve the first useful workflow before becoming a platform.

## Success definition

Brian succeeds when a team can answer these questions in under five minutes:

- What assets exist?
- Where are they?
- How are they connected?
- Which facts are current?
- Which source or agent found them?
- What changed since the last observation?

## Strategic bets

- The topology canvas is the product's differentiator.
- NetBox is the first high-value source of truth.
- Distributed agents unlock environments that cannot be reached from the central server.
- Provenance and freshness create trust.
- A useful API allows the frontend and future integrations to evolve independently.
- Later, a customer-owned Ollama assistant can explain topology without sending data to a vendor model.
- Later, host-to-container visibility can extend the same topology to DevOps runtime context without becoming an orchestrator.
