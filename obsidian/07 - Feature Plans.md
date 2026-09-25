# Feature Plans

Plans for accepted capabilities that are **not** in the current MVP. Implement only after the core discovery loop is healthy. Source: [[Human Input]], PRD Section 17, SRS Section 14.

## Guardrail

Do not start these while frontend/API wiring, scan import, NetBox, or agents are unfinished. They extend topology; they do not replace it.

---

## Plan A - Customer-owned Ollama assistant

### Problem

Operators already have topology, scans, and inventory in Brian. They still have to translate that graph into answers by hand. They want an assistant, but they own the model runtime and the network path to it.

### Outcome

An optional "ask this topology" surface that calls **the customer's Ollama**, on **the network the customer decides**, and cites Brian records. Brian stays usable if Ollama is off.

### Constraints

- Customer owns Ollama. Brian does not bundle, host, or require a model.
- Operator configures base URL, model, timeout, and which Brian site/network may reach it.
- No default calls to vendor-hosted LLM APIs.
- Prompts never include tokens, passwords, NetBox secrets, or agent credentials.
- The assistant does not write inventory unless the operator confirms an explicit action later (out of first slice).
- Isolated integration client, versioned under `/api/v1`.

### First slice (when scheduled)

1. Settings: enable flag, Ollama URL, model, timeout, allowed network.
2. Connection test that fails closed.
3. Read-only question over current filter/selection with citations to device IDs and sources.
4. UI hidden when disabled; errors when Ollama is down do not block Topology or Devices.

### Not in this plan

- Training models on customer data.
- Brian-operated GPU or model catalog.
- Autonomous remediations.

### Trace

- PRD 17.1
- SRS FR-AI-001 through IR-AI-001, SEC-AI-001/002

---

## Plan B - DevOps lifecycle and container visibility

### Problem

DevOps need to see **which containers run on which servers**, follow a **simple lifecycle**, and reach **logs** and maybe **console** without leaving the operational picture. Easier usage matters more than a new control plane.

### Outcome

Workloads appear as child context on existing host nodes. Operators can inspect runtime state, a coarse lifecycle, logs, and optionally an auditable console path the customer already owns.

### Constraints

- Containers attach to devices already in topology. Do not create a second unrelated graph as the default.
- Brian is not Docker Desktop, Kubernetes, CI/CD, or an APM product.
- Logs: bounded tail from a configured runtime API **or** deep-link to an existing log system.
- Console/exec: explicit enablement, customer-owned credentials or runtime API, audited, no unrestricted shells stored in Brian.
- Progressive disclosure: host topology stays primary.

### First slice (when scheduled)

1. Workload child model: name, host device, runtime state, last seen, source.
2. Inspector list: containers on selected server.
3. Lifecycle states: at least run / stop / unknown (deploy/retire can follow).
4. Log deep-link or bounded tail behind a feature flag.

### Second slice

- Optional console/exec with audit events.
- Richer lifecycle if a real source exists (compose, systemd, a cluster API). Still not a pipeline builder.

### Trace

- PRD 17.2
- SRS FR-WORK-001 through NFR-WORK-001, SEC-WORK-001
- Persona: DevOps engineer in [[03 - User and Market]]

---

## Scheduling

| Plan | Earliest honest phase | Blocked by |
|---|---|---|
| Ollama assistant | After Phase 5 hardening, or a later optional add-on | Stable device/topology API, secret handling, settings |
| Container visibility | After operator-grade topology (Phase 4) | Device identity, provenance, inspector, host nodes |
| Console access | After container visibility | Audit events, secret handling, explicit operator demand |
