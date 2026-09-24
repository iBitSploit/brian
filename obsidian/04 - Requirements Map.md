# Requirements Map

This note translates the product documents into build areas.

## Product sources

- [[../HUMAN/PRD|PRD]]: product intent, data model, workflows, roadmap.
- [[../HUMAN/NetBox|NetBox client notes]]: topology presentation and visual behavior.
- [[../HUMAN/SRS|SRS]]: testable functional, interface, security, and performance requirements.

## Requirement areas

| Area | Frontend | Backend | Verification |
|---|---|---|---|
| Topology | Canvas, controls, selection, layout, labels | Graph endpoint, connections, positions | 500-node render and interaction test |
| Devices | List, form, details, filters | CRUD, validation, pagination | API and form tests |
| NetBox | Connection form, sync status | Client, mapping, sync job, logs | Mock NetBox integration test |
| Scans | Upload, preview, conflicts | Parser boundary, normalized result, import transaction | Fixture-based parser tests |
| Agents | Table, registration, status, actions | Scoped auth, heartbeat, reports, deduplication | Heartbeat/report API tests |
| Icons | Library, upload, assignment | Safe upload, metadata, storage | File and SVG security tests |
| Exports | JSON, CSV, SVG, PNG controls | Scope, serialization, render/export jobs | Snapshot and export tests |
| Settings | Theme, layout, preferences | Configuration and persistence | Browser and config tests |

## Cross-cutting requirements

- Accessibility and non-color state cues.
- Consistent JSON errors.
- Source provenance and timestamps.
- Pagination for large lists.
- Secret redaction.
- Health checks and logs.
- Database migrations.
- Backward-compatible API versioning.

## Traceability habit

Every feature branch or implementation note should name:

- The requirement it satisfies.
- The user workflow it supports.
- The data it reads or mutates.
- The focused test or validation command.
