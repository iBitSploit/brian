# User and Market

## Primary users

### Infrastructure operator

Manages 50-500 assets across several sites. Needs inventory context, interfaces, topology relationships, status, and low-friction updates.

### Security engineer

Uses reconnaissance output during assessments. Needs rapid import, service visibility, tags, evidence export, and source freshness.

### SOC analyst

Needs asset context during an investigation. Cares about relationships, recent observations, affected locations, and operational state.

### DevSecOps and platform engineer

Manages mixed cloud and on-premises infrastructure. Needs integrations, agents, automation, and an API that fits existing workflows.

### DevOps engineer (later)

Needs to see workload placement on hosts, a simple lifecycle, logs, and optional console access from the same operational picture. Does not expect Brian to replace Kubernetes UIs or a log platform.

### Compliance and GRC user

Needs an inspectable inventory, segmentation context, exportable records, and eventually audit history.

## Market wedge

Start with teams that already have one of these pain patterns:

- NetBox is accurate but not visually useful during incidents.
- Nmap output is useful but disconnected from inventory.
- Remote sites are difficult to observe centrally.
- Existing topology diagrams become stale immediately.
- Commercial tools are expensive, opaque, or too broad.

## Positioning

Brian is the open-source operational topology layer between inventory systems, scanners, and the humans who need context.

It should not claim to replace:

- NetBox as the authoritative IPAM/DCIM system.
- Nmap as a scanning engine.
- SIEM, EDR, or vulnerability management systems.
- Network management and configuration platforms.
- Ollama or any other LLM runtime.
- Docker, Kubernetes, or a logging SaaS as the system of record for workloads.

## Differentiation

- Open and self-hosted.
- Source-agnostic normalized model.
- Topology presentation designed for operational clarity.
- Distributed outbound agents.
- Explicit provenance and freshness.
- Import-first workflow for security teams.

## Discovery questions

- What is the first topology question an operator asks during an incident?
- Which source is trusted for device identity versus reachability?
- How often does a topology become stale in practice?
- Which exports are required for reports and audits?
- What is the minimum agent deployment friction a remote site will tolerate?
- Which existing workflows must Brian fit without becoming a new system of record?

## Adoption path

1. Start with a scan upload or NetBox sync.
2. Keep the first topology useful without an agent.
3. Add one remote agent when central visibility is incomplete.
4. Save filters and export evidence.
5. Earn trust through provenance, predictable updates, and reversible actions.
