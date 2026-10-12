# Requirements Map

This note translates the product documents into build areas.

## Product sources

- [[../.humans/PRD|PRD]]: product intent, data model, workflows, roadmap. Post-MVP Ollama and DevOps in Section 17.
- [[../.humans/SRS|SRS]]: testable functional, interface, security, and performance requirements. Could-priority AI and workload requirements in Section 14.
- [[../.humans/Architecture|Architecture]]: services Brian makes and uses, communication, and workflows. Vault map: [[08 - System Architecture]].
- [[07 - Feature Plans]]: accepted later capabilities that must not enter the current build.

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
| Ollama assistant (later) | Optional ask panel, citations | Isolated client, no secrets in prompts | Unreachable-Ollama still serves MVP |
| Workloads (later) | Host inspector overlay, logs/console entry | Child objects, runtime adapter, audit | Progressive disclosure on host nodes |

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
