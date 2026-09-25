# Roadmap

## Phase 0 - Foundation

Status: in progress

- [x] Establish PRD, SRS, and client topology requirements.
- [x] Create frontend prototype and React/Vite MVP.
- [x] Create Flask API foundation.
- [x] Add API documentation and OpenAPI contract.
- [ ] Make frontend and backend run together with documented commands.
- [ ] Add root development setup and environment documentation.

Exit criteria: a new contributor can run both services and exercise health, login, device CRUD, and the empty topology view.

## Phase 1 - Vertical slice

- [ ] Frontend API client and shared error handling.
- [ ] Device list, create, edit, delete, and details connected to Flask.
- [ ] Database migrations and seed-free local setup.
- [ ] Auth boundary suitable for local deployment.
- [ ] End-to-end device workflow.

Exit criteria: create a device in the UI, see it in the API and topology, edit it, and delete it.

## Phase 2 - Trustworthy discovery

- [ ] Nmap XML parser and import preview.
- [ ] Generic JSON parser and validation.
- [ ] Merge, replace, and review conflict flows.
- [ ] Scan history and raw-data retention policy.
- [ ] NetBox read-only client, mapping, sync status, and logs.

Exit criteria: an operator can import a real scan or NetBox dataset without corrupting existing records.

## Phase 3 - Distributed visibility

- [ ] Scoped agent token lifecycle.
- [ ] Agent registration and deployment command.
- [ ] Heartbeat status calculation.
- [ ] Agent report normalization and deduplication.
- [ ] Agent logs, rescans, schedules, and decommissioning.

Exit criteria: one agent can discover a remote host and Brian shows source, freshness, and status.

## Phase 4 - Operator-grade topology

- [ ] Real graph renderer and persisted positions.
- [ ] Interface-aware edges and labels.
- [ ] Layout modes and clustering.
- [ ] Progressive detail and large-topology performance.
- [ ] Selection inspector and contextual actions.
- [ ] JSON, CSV, SVG, and PNG exports.

Exit criteria: a 500-node topology remains readable and usable.

## Phase 5 - Hardening and release

- [ ] Security review and dependency audit.
- [ ] Production deployment guide.
- [ ] Backup and restore procedure.
- [ ] Observability and health checks.
- [ ] API versioning policy.
- [ ] Release checklist, changelog, and demo dataset.

## Later possibilities

- Ettercap Layer 2 topology.
- Risk and vulnerability enrichment.
- RBAC and SSO.
- Alerts and notifications.
- Kubernetes and high availability.
- Terraform provider.
- Customer-owned Ollama AI assistant ([[07 - Feature Plans]]).
- DevOps lifecycle, container-on-host visibility, logs, and optional console access ([[07 - Feature Plans]]).

Do not pull later possibilities into MVP without evidence that the core loop is adopted.
