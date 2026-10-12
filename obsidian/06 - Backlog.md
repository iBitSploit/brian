# Backlog

Use this as the actionable queue. Keep individual tasks small enough to finish in one focused session or split them further.

## Now

- [ ] Add a typed frontend API client for auth, devices, topology, agents, scans, and integrations.
- [ ] Add frontend environment configuration for the API base URL.
- [ ] Fix backend API concerns before frontend wiring: agent scoped tokens, upload file handling, and migration scripts.
- [ ] Add a real Flask migration directory and initial migration.
- [ ] Add a frontend integration test for navigation and theme persistence.
- [ ] Add a backend test for duplicate IP conflict behavior.

## Next

- [ ] Connect the Devices view to `GET /devices`.
- [ ] Build the Add Device form against `POST /devices`.
- [ ] Build device update and delete actions.
- [ ] Connect topology nodes to `GET /topology`.
- [ ] Replace mock agent table with `GET /agents`.
- [ ] Add error/loading/empty states to API-backed views.
- [ ] Add API CORS policy for local frontend development.

## Later

- [ ] Nmap XML parser.
- [ ] Generic JSON parser.
- [ ] Import preview and conflict review.
- [ ] NetBox HTTP client and mapping configuration.
- [ ] Background job strategy for syncs and imports.
- [ ] Agent token hashing and scoped authentication.
- [ ] Device and edge position persistence.
- [ ] Graph renderer integration.
- [ ] SVG sanitization and icon storage.
- [ ] Export service.
- [ ] Audit event storage.

## Parking lot

- [ ] Saved filter views.
- [ ] DNS relationship visualization.
- [ ] Layer 2 and VLAN model.
- [ ] Risk scoring.
- [ ] User accounts and RBAC.
- [ ] LDAP/SSO.
- [ ] Alert rules and notifications.
- [ ] Kubernetes deployment.
- [ ] Terraform provider.
- [ ] Add optional Ollama assistant settings so operators can point Brian at a customer-owned model endpoint they choose.
- [ ] Add an ask-the-topology panel that cites devices and sources and never includes secrets in prompts.
- [ ] Represent containers as child objects of hosts so DevOps can see what runs where.
- [ ] Add a simple workload lifecycle view without building a CI/CD product.
- [ ] Add bounded log access or deep-links to a customer-owned log system from a selected workload.
- [ ] Add optional auditable console/exec access using customer-owned credentials, not a Brian-owned shell.

## Task format

When adding a task, write it as:

`[ ] Verb + object + outcome`

Example: `[ ] Add duplicate-IP validation so imports cannot create ambiguous device identity.`
