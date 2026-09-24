# Product Scope

## Target MVP

Brian MVP must provide:

- Interactive topology canvas.
- Device and connection CRUD.
- Device search, filtering, tagging, and saved views.
- NetBox read-only synchronization.
- Nmap XML, dnsrecon JSON/XML, Ettercap, and generic scan ingestion boundaries.
- Agent registration, heartbeat, reporting, status, and decommissioning.
- Custom icon metadata and upload boundaries.
- JSON, CSV, SVG, and PNG export paths.
- Light and dark themes.
- Versioned Flask REST API.
- Docker-friendly deployment with persistent storage.

## Explicitly out of scope for MVP

- Multi-tenant isolation.
- Built-in user identity, SSO, LDAP, and full RBAC.
- Real-time NetFlow or sFlow analysis.
- Browser packet capture.
- CVE database integration.
- Predictive or ML anomaly detection.
- Native mobile application.
- VPN and overlay topology visualization.
- High availability and multi-instance coordination.
- Kubernetes production support.

## Scope guard

When a request does not clearly improve discovery, topology understanding, source trust, or operator workflow, it should be deferred until the core loop is healthy.

## Core loop

1. Connect a source or add an asset.
2. Normalize and validate the observation.
3. Persist the entity with provenance and timestamps.
4. Render the relationship in the topology.
5. Let the operator search, inspect, filter, tag, correct, or export it.
6. Repeat as new observations arrive.

## Release gates

MVP is not complete until the core loop works through both manual entry and one imported source, with tests, error states, and documentation.
