# Software Requirements Specification: Brian

**Project:** Brian - Open-Source Network and Infrastructure Topology Platform  
**Document Version:** 1.0  
**Date:** September 24, 2026  

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional, non-functional, data, interface, security, deployment, and acceptance requirements for Brian. Brian is a self-hosted platform that aggregates network and infrastructure information from manual entry, NetBox, nmap, dnsrecon, Ettercap, and distributed scanning agents, then presents the resulting topology as an interactive graph.

This document is intended for:

- Product owners and client stakeholders
- Frontend, backend, and agent developers
- QA and security reviewers
- Infrastructure and deployment engineers
- Technical writers and operators

### 1.2 Scope

Brian shall provide a single-server MVP with the following capabilities:

- Interactive network topology visualization
- Manual device and connection management
- Device search, filtering, and saved views
- Read-only NetBox synchronization
- Nmap XML, dnsrecon JSON/XML, Ettercap, and generic scan ingestion
- Distributed agent registration, health monitoring, and scan reporting
- Custom device icon management
- Topology export
- Light and dark themes
- REST API access using bearer tokens
- Docker Compose deployment with persistent storage

The MVP shall not provide built-in user authentication, multi-tenant isolation, real-time traffic analysis, mobile applications, VPN topology visualization, vulnerability database integration, predictive analytics, or browser-based packet capture.

### 1.3 Product Goals

1. Consolidate infrastructure discovery into a unified topology.
2. Make network relationships and operational states immediately understandable.
3. Reduce manual topology maintenance through synchronization and scanning.
4. Support extensible data sources and distributed scanning agents.
5. Provide an accessible, self-hosted, vendor-neutral deployment.

### 1.4 Definitions and Acronyms

| Term | Definition |
|---|---|
| Agent | A lightweight service deployed near a target network that performs scans and reports findings to Brian. |
| Device | A physical, virtual, cloud, or logical network asset represented as a topology node. |
| Edge | A connection between two topology nodes. |
| NetBox | An external IPAM/DCIM system used as a read-only infrastructure data source. |
| Scan source | The system or process that supplied device or connection data. |
| Topology | A graph representation of devices, interfaces, networks, services, and their relationships. |
| CIDR | Classless Inter-Domain Routing notation for an IP network range. |
| MVP | Minimum viable product. |
| RBAC | Role-based access control. |
| API | Application Programming Interface. |
| SRS | Software Requirements Specification. |

### 1.5 Requirement Conventions

Requirements use the following priority levels:

- **Must:** Required for MVP acceptance.
- **Should:** Important for MVP where practical; may be deferred with approval.
- **Could:** Desirable enhancement.
- **Won't:** Explicitly excluded from the MVP.

Each requirement has a stable identifier. Functional requirements use `FR`, non-functional requirements use `NFR`, interface requirements use `IR`, data requirements use `DR`, security requirements use `SEC`, and acceptance criteria use `AC`.

---

## 2. Product Description

### 2.1 Product Perspective

Brian is a central server composed of a web frontend, REST API, persistent database, optional Redis cache, and scanning agents. External systems submit or expose infrastructure data. Brian normalizes that data into devices, connections, locations, icons, agents, and scan results.

The high-level flow is:

1. An operator configures Brian or an integration.
2. Brian receives data from an external source, a file upload, a manual form, or an agent.
3. The ingestion service validates and normalizes the input.
4. The persistence layer creates or updates records using source and conflict rules.
5. The topology service provides graph data to the frontend.
6. The frontend renders the graph and exposes inspection, filtering, editing, and export workflows.

### 2.2 User Classes

#### UC-01: Infrastructure Operator

Manages network inventory, topology layout, device state, and NetBox synchronization. Requires efficient search, filtering, editing, and status visibility.

#### UC-02: Security Engineer

Uploads reconnaissance results, inspects services and open ports, tags devices, and exports topology evidence.

#### UC-03: SOC Analyst

Uses topology context during investigations, identifies connected assets, and reviews recent scan information.

#### UC-04: Compliance or GRC User

Reviews device inventories, network segmentation, source history, and exported records.

#### UC-05: Platform Administrator

Deploys Brian, configures integrations and tokens, manages agents, and reviews operational errors.

#### UC-06: Distributed Agent

Authenticates to Brian, sends heartbeats, uploads scan results, and receives agent-specific configuration where supported.

### 2.3 Operating Environment

- Supported deployment: Linux server using Docker Compose.
- Supported browser: Current versions of Chromium-based browsers, Firefox, and Safari where graph and file APIs are available.
- Minimum supported viewport: 1024 pixels wide for the full desktop layout.
- Backend database: PostgreSQL 13 or later.
- Optional cache: Redis.
- Frontend: React 18 or later with TypeScript and Cytoscape.js or an equivalent graph library.
- Backend: Node.js/Express or Python/FastAPI/Django, selected during implementation.
- Agent runtime: Linux container or bare-metal service with network access to target assets.

### 2.4 Design Principles

- Topology relationships take visual precedence over decorative interface elements.
- Operational state must be visible without requiring detailed inspection.
- State and meaning must not rely on color alone.
- Technical detail is progressively disclosed through zoom, hover, selection, and detail panels.
- Manual user positioning takes precedence over automatic layout after explicit arrangement.
- Source provenance and last-seen information must be retained for imported data.

---

## 3. System Architecture Requirements

### 3.1 Component Architecture

**NFR-ARCH-001 (Must):** The system shall separate frontend presentation, backend API/business logic, persistence, and agent responsibilities.

**NFR-ARCH-002 (Must):** The backend shall expose versioned REST endpoints under `/api/v1`.

**NFR-ARCH-003 (Must):** Data ingestion shall pass through validation and normalization before persistence.

**NFR-ARCH-004 (Must):** Integration failures shall not prevent users from viewing previously persisted topology data.

**NFR-ARCH-005 (Should):** Long-running sync and scan parsing operations should be asynchronous or otherwise prevent blocking unrelated API requests.

### 3.2 Deployment Components

The recommended MVP deployment shall contain:

- `frontend`: React single-page application.
- `api`: Backend REST API and business services.
- `database`: PostgreSQL with persistent volume.
- `redis`: Optional cache/session/rate-limit service.
- `agent`: Separately deployable scanning service.

**NFR-DEP-001 (Must):** The deployment shall provide a Docker Compose configuration for the frontend, API, and database.

**NFR-DEP-002 (Must):** Database and user-uploaded icon data shall survive container recreation.

**NFR-DEP-003 (Must):** Configuration shall be supplied through environment variables or a documented configuration file.

**NFR-DEP-004 (Should):** The deployment shall include health checks for the API and database.

---

## 4. Functional Requirements

### 4.1 Application Shell and Navigation

**FR-NAV-001 (Must):** The frontend shall provide navigation to Dashboard, Topology, Devices, Integrations, Settings, and Help/Documentation views.

**FR-NAV-002 (Must):** The main layout shall provide a top bar, a collapsible left navigation/filter area, a central topology or content area, and a collapsible details panel where applicable.

**FR-NAV-003 (Must):** The application shall preserve the current theme preference in browser local storage.

**FR-NAV-004 (Should):** The application should detect the operating system theme when no saved preference exists.

**FR-NAV-005 (Must):** The frontend shall display actionable error messages for failed API requests, invalid input, failed imports, and unavailable integrations.

### 4.2 Topology Canvas

**FR-TOPO-001 (Must):** The system shall render topology nodes and edges as an interactive graph.

**FR-TOPO-002 (Must):** Users shall be able to pan, zoom, fit the topology to the viewport, recenter the view, and reset the selected layout.

**FR-TOPO-003 (Must):** Users shall be able to select a node by clicking it and open its details panel.

**FR-TOPO-004 (Must):** Users shall be able to select an edge and inspect its connection details.

**FR-TOPO-005 (Must):** Users shall be able to drag nodes to manually position them.

**FR-TOPO-006 (Must):** The system shall preserve manually positioned nodes between sessions or saved topology states.

**FR-TOPO-007 (Should):** The canvas should provide an optional grid and snap-to-grid behavior.

**FR-TOPO-008 (Must):** The canvas shall support at least hierarchical, force-directed, radial, and breadth-first layouts, or provide an equivalent set of layout strategies.

**FR-TOPO-009 (Must):** The system shall support automatic layout while reducing link crossings, avoiding unnecessary overlap, maintaining reasonable spacing, and grouping related devices where possible.

**FR-TOPO-010 (Must):** Explicit manual positioning shall take precedence over subsequent automatic layout until the user requests a new automatic layout.

**FR-TOPO-011 (Must):** The canvas shall support click, hover, drag, double-click, right-click, multi-select, selection-box, middle-button pan, scroll-wheel zoom, and Escape-to-deselect interactions where supported by the browser and input device.

**FR-TOPO-012 (Must):** Double-clicking a node shall zoom or center the viewport on that node.

**FR-TOPO-013 (Must):** Selecting a node shall visually emphasize the node and its directly connected edges.

**FR-TOPO-014 (Must):** Right-clicking a node shall expose actions for viewing, editing, deleting, rescanning, and copying its IP address where applicable.

**FR-TOPO-015 (Must):** The system shall support logical clustering or grouping by site, network, function, subnet, or equivalent grouping key.

**FR-TOPO-016 (Should):** Large topologies should use level-of-detail rendering, progressive label visibility, link simplification, grouping, and viewport-based rendering to preserve responsiveness.

**FR-TOPO-017 (Must):** The topology shall remain readable without displaying all metadata simultaneously. Secondary metadata shall be progressively disclosed through zoom, hover, selection, or contextual panels.

### 4.3 Node Presentation

**FR-NODE-001 (Must):** The system shall represent routers, switches, firewalls, hosts, network appliances, cloud/network abstractions, services, and other supported device types.

**FR-NODE-002 (Must):** Each node shall display a device icon or graphic and a readable device name.

**FR-NODE-003 (Must):** Node styling shall support normal, selected, running/active, stopped/inactive, warning/error, and disabled/unavailable states.

**FR-NODE-004 (Must):** Node state shall be communicated using more than color through one or more of icons, borders, opacity, patterns, labels, or other visual indicators.

**FR-NODE-005 (Must):** The node label hierarchy shall prioritize device name, device type or status, interface/link information, and secondary metadata in that order.

**FR-NODE-006 (Should):** Node size should be configurable based on device type, connectivity, or another documented metric.

### 4.4 Connection and Interface Presentation

**FR-LINK-001 (Must):** The system shall render connections between relevant device interfaces or endpoints.

**FR-LINK-002 (Must):** Connections shall support direct, inferred, DNS, Layer 2, and service connection types.

**FR-LINK-003 (Must):** Connections shall support running, stopped, disconnected, degraded, and unavailable states.

**FR-LINK-004 (Must):** Connection rendering shall support consistent line weight, endpoint association, optional direction indicators, and connection metadata labels.

**FR-LINK-005 (Must):** Multiple connections between the same devices shall remain distinguishable.

**FR-LINK-006 (Must):** When interface data exists, the UI shall identify the source and destination interfaces.

**FR-LINK-007 (Must):** Interface labels shall remain associated with their links during panning, zooming, movement, and layout changes.

**FR-LINK-008 (Must):** Secondary interface metadata shall be hidden or reduced at low zoom levels and progressively exposed at higher zoom levels.

### 4.5 Device Management

**FR-DEV-001 (Must):** Users shall be able to create a device manually.

**FR-DEV-002 (Must):** A device form shall support name, IP address, MAC address, device type, location, description, status, tags, icon, and custom metadata where applicable.

**FR-DEV-003 (Must):** The system shall validate required fields and IP address format before saving a device.

**FR-DEV-004 (Must):** IP addresses shall be unique unless an explicitly documented device model supports shared or virtual addressing.

**FR-DEV-005 (Must):** Users shall be able to view, edit, and delete devices.

**FR-DEV-006 (Must):** Users shall be able to change device status between online, offline, unknown, active, inactive, decommissioned, and other documented states.

**FR-DEV-007 (Must):** Users shall be able to add, remove, and edit device tags.

**FR-DEV-008 (Must):** Users shall be able to view services, ports, operating system information, scan date, source, related nodes, and agent provenance when available.

**FR-DEV-009 (Must):** The system shall record device creation and update timestamps.

**FR-DEV-010 (Should):** The system should expose a change log for important device attribute changes.

**FR-DEV-011 (Must):** Users shall be able to perform bulk tagging, status changes, and deletion with confirmation.

**FR-DEV-012 (Must):** Users shall be able to export a device record as JSON or CSV.

**FR-DEV-013 (Must):** Users shall be able to trigger a rescan action for a device when a suitable agent or scan source is configured.

### 4.6 Search, Filtering, and Saved Views

**FR-FILTER-001 (Must):** Users shall be able to search devices in real time by name, IP address, MAC address, hostname, tags, and location.

**FR-FILTER-002 (Must):** Users shall be able to filter by status, device type, location, tags, last scanned date, service presence, and scan source.

**FR-FILTER-003 (Must):** Last-scanned filters shall include at least last 24 hours, last 7 days, last 30 days, never scanned, and all.

**FR-FILTER-004 (Must):** Users shall be able to clear active search and filters.

**FR-FILTER-005 (Should):** Users should be able to save a named combination of filters as a saved view.

**FR-FILTER-006 (Should):** Users should be able to list, activate, and delete saved views.

**FR-FILTER-007 (Must):** Applying filters shall update the device list and topology visibility consistently.

### 4.7 Connection Management

**FR-CONN-001 (Must):** Users shall be able to create a connection between two devices or interfaces.

**FR-CONN-002 (Must):** A connection shall support source device, target device, connection type, protocol, port, latency, bandwidth, and metadata fields where applicable.

**FR-CONN-003 (Must):** Users shall be able to view, edit, and delete connections.

**FR-CONN-004 (Must):** The system shall prevent invalid self-connections unless explicitly supported for a documented use case.

**FR-CONN-005 (Should):** The system should detect or warn about duplicate connections with identical endpoints and type.

### 4.8 NetBox Integration

**FR-NBX-001 (Must):** Administrators shall be able to configure a NetBox URL and API token.

**FR-NBX-002 (Must):** The API token shall be treated as a secret and shall not be displayed in plaintext after initial entry.

**FR-NBX-003 (Must):** Administrators shall be able to test the NetBox connection before enabling synchronization.

**FR-NBX-004 (Must):** The system shall support read-only synchronization from NetBox.

**FR-NBX-005 (Must):** Synchronization shall import devices, sites, interfaces, and IP addresses when present and supported by the NetBox API.

**FR-NBX-006 (Must):** The system shall map NetBox device types to Brian device types and custom icons where mappings are configured.

**FR-NBX-007 (Must):** Administrators shall be able to enable or disable automatic synchronization.

**FR-NBX-008 (Must):** Administrators shall be able to configure a synchronization interval, including at least 1, 6, 12, and 24 hours.

**FR-NBX-009 (Should):** The system should support intervals expressed in minutes for development and operational environments.

**FR-NBX-010 (Must):** Administrators shall be able to trigger a manual synchronization.

**FR-NBX-011 (Must):** The system shall display last sync time, next scheduled sync time, number of devices synchronized, and sync errors.

**FR-NBX-012 (Must):** The system shall log each synchronization event with start time, completion time, result, counts, and errors.

**FR-NBX-013 (Must):** The system shall support a documented conflict policy, including manual merge, timestamp-based resolution, or configured source preference.

**FR-NBX-014 (Must):** Disconnecting NetBox shall stop future synchronization while preserving previously imported data unless the user explicitly requests removal.

### 4.9 Scan Ingestion

**FR-SCAN-001 (Must):** Users shall be able to upload scan files through the UI or submit them through an API endpoint.

**FR-SCAN-002 (Must):** The upload workflow shall identify the selected source type: nmap, dnsrecon, Ettercap, or custom JSON.

**FR-SCAN-003 (Must):** Nmap XML ingestion shall parse hosts, open ports, services, operating system detection, hostnames, and scan dates where available.

**FR-SCAN-004 (Must):** Dnsrecon JSON/XML ingestion shall parse A records, MX records, NS records, TXT records, and zone transfer results where available.

**FR-SCAN-005 (Must):** Ettercap ingestion shall support ARP tables, DHCP server data, discovered hosts, and Layer 2 relationships where available in the submitted data.

**FR-SCAN-006 (Must):** Generic JSON ingestion shall accept an array containing IP, hostname, device type, location, services, operating system, and scan date fields.

**FR-SCAN-007 (Must):** The system shall validate file type, structure, required fields, and supported values before import.

**FR-SCAN-008 (Must):** Validation errors shall identify the affected record and, where possible, line or field information and a reason.

**FR-SCAN-009 (Must):** The UI shall provide a preview of parsed records before final import.

**FR-SCAN-010 (Must):** The preview shall show counts of new, updated, unchanged, and invalid records where determinable.

**FR-SCAN-011 (Must):** Users shall be able to select merge, replace, or review conflict resolution behavior before import.

**FR-SCAN-012 (Must):** The system shall create or update devices and related services according to the selected conflict policy.

**FR-SCAN-013 (Must):** The system shall retain raw scan data or a documented normalized equivalent for later review and export.

**FR-SCAN-014 (Must):** The system shall create a scan result record containing source, agent if applicable, raw data reference, device counts, scan date, duration, and creation time.

**FR-SCAN-015 (Should):** Successful imports should provide an undo operation for up to 10 minutes.

### 4.10 Agent Management

**FR-AGENT-001 (Must):** Administrators shall be able to register an agent with a name, location, scan type, schedule, and scan targets.

**FR-AGENT-002 (Must):** The system shall generate or accept a unique API token for each agent.

**FR-AGENT-003 (Must):** Agent tokens shall be scoped to the specific agent and shall not grant general administrative access.

**FR-AGENT-004 (Must):** The system shall provide deployment information including server URL, agent token reference, agent name, scan targets, and schedule.

**FR-AGENT-005 (Must):** The system shall support agent scan types for network subnet, specific hosts, and services.

**FR-AGENT-006 (Must):** Administrators shall be able to list agents by name, location, status, last heartbeat, last scan, and actions.

**FR-AGENT-007 (Must):** Agents shall send authenticated heartbeats to the central API.

**FR-AGENT-008 (Must):** The system shall classify agent status as online, degraded, or offline using documented heartbeat thresholds.

**FR-AGENT-009 (Must):** The default status thresholds shall be online within 5 minutes, degraded after 5 minutes and within 1 hour, and offline after 1 hour without a heartbeat.

**FR-AGENT-010 (Must):** Agents shall submit scan findings to the central API.

**FR-AGENT-011 (Must):** The system shall deduplicate findings reported by multiple agents according to a documented identity and conflict policy.

**FR-AGENT-012 (Must):** The system shall retain the discovering agent on imported device records when applicable.

**FR-AGENT-013 (Must):** Administrators shall be able to update agent schedule, targets, and configuration.

**FR-AGENT-014 (Must):** Administrators shall be able to trigger an on-demand scan for an agent.

**FR-AGENT-015 (Must):** Administrators shall be able to view recent agent logs and error messages.

**FR-AGENT-016 (Must):** Administrators shall be able to decommission or delete an agent after confirmation.

**FR-AGENT-017 (Should):** The agent should support nmap, ARP discovery, subnet calculations, service probing, DNS and reverse DNS lookups, and latency measurement.

### 4.11 Icon Management

**FR-ICON-001 (Must):** The system shall provide built-in icons for common device categories including server, router, firewall, workstation, switch, cloud, and service.

**FR-ICON-002 (Must):** Users shall be able to upload custom SVG or PNG icons.

**FR-ICON-003 (Must):** The system shall validate icon file type and configured size limits before storage.

**FR-ICON-004 (Must):** Administrators shall be able to associate an icon with a device type or individual device.

**FR-ICON-005 (Must):** The system shall store custom icons in a configurable persistent path or object storage location.

**FR-ICON-006 (Must):** The system shall expose an icon list and preview in the UI.

**FR-ICON-007 (Must):** Users shall be able to delete custom icons that are not protected built-in assets.

### 4.12 Topology Export

**FR-EXPORT-001 (Must):** Users shall be able to export topology data as JSON.

**FR-EXPORT-002 (Must):** Users shall be able to export device inventory as CSV.

**FR-EXPORT-003 (Must):** Users shall be able to export a rendered topology as SVG or PNG.

**FR-EXPORT-004 (Must):** Exported data shall reflect active filters or an explicitly selected scope.

**FR-EXPORT-005 (Must):** Export operations shall provide a useful error if rendering or serialization fails.

---

## 5. User Workflows

### 5.1 Initial Setup and Discovery

1. The operator deploys Brian.
2. The operator configures NetBox URL and API token.
3. The operator tests the connection.
4. The operator enables a 12-hour synchronization interval.
5. The operator starts a manual synchronization.
6. Brian imports NetBox devices, sites, interfaces, and IP addresses.
7. The operator views the populated topology.
8. The operator maps device types to icons.
9. The operator registers agents for the HQ and remote office.
10. Agents scan configured subnets and report findings.
11. Brian deduplicates and displays the combined topology with source annotations.

### 5.2 Penetration Test Import

1. A security engineer runs nmap and produces XML output.
2. The engineer uploads the XML through the scan upload panel.
3. Brian parses and previews the discovered hosts and services.
4. The engineer selects merge, replace, or review behavior.
5. The engineer confirms the import.
6. Brian creates or updates devices and records the scan result.
7. The engineer filters devices scanned in the last 24 hours.
8. The engineer inspects services and operating system data.
9. The engineer tags selected devices and exports the topology.

### 5.3 Continuous Monitoring

1. An agent executes a scheduled scan.
2. The agent reports a newly discovered device.
3. Brian creates the device with source agent and scan timestamp.
4. The device appears in the topology with a recent-discovery indicator.
5. An operator reviews and tags the device.
6. A later scan no longer finds a previously observed device.
7. Brian updates the device state according to the configured stale or offline policy.
8. The operator reviews the device history and either confirms decommissioning or restores the device state.

### 5.4 Manual Device Management

1. An operator selects Add Device.
2. The operator supplies required identity, type, location, and status fields.
3. Brian validates the form.
4. The operator saves the device.
5. Brian persists the device and displays it in the device list and topology.
6. The operator edits, tags, rescans, exports, or deletes the device as needed.

---

## 6. External Interface Requirements

### 6.1 Frontend User Interface

**IR-UI-001 (Must):** The UI shall provide a low-noise topology canvas with visible network relationships and secondary controls.

**IR-UI-002 (Must):** The UI shall support light and dark themes across the canvas, navigation, panels, dialogs, forms, menus, and tooltips.

**IR-UI-003 (Must):** The UI shall maintain sufficient contrast for text, nodes, links, selection, warnings, and errors.

**IR-UI-004 (Must):** Meaningful state distinctions shall not rely solely on color.

**IR-UI-005 (Must):** The UI shall provide labels, tooltips, or accessible names for unfamiliar icon controls.

**IR-UI-006 (Must):** Text shall remain readable and controls shall not overlap at the minimum supported viewport.

**IR-UI-007 (Should):** The left sidebar should collapse below 1400 pixels and mobile layouts should hide it by default.

**IR-UI-008 (Must):** Forms shall display field-level validation and preserve valid user input when another field fails validation.

### 6.2 REST API

All API endpoints shall be versioned under `/api/v1` and use JSON unless a file upload or export format requires another content type.

**IR-API-001 (Must):** Protected API calls shall use `Authorization: Bearer <API_TOKEN>`.

**IR-API-002 (Must):** API responses shall use documented HTTP status codes and a consistent error structure.

**IR-API-003 (Must):** List endpoints shall support pagination where result sets can become large.

**IR-API-004 (Must):** List endpoints shall support documented filtering and sorting parameters where applicable.

**IR-API-005 (Must):** API input shall be validated before business logic is executed.

**IR-API-006 (Must):** API errors shall not expose secrets, stack traces, or internal credentials.

#### Required API Endpoints

| Area | Method | Endpoint | Purpose |
|---|---|---|---|
| Devices | GET | `/devices` | List and filter devices. |
| Devices | GET | `/devices/:id` | Retrieve one device. |
| Devices | POST | `/devices` | Create a device. |
| Devices | PUT | `/devices/:id` | Update a device. |
| Devices | DELETE | `/devices/:id` | Delete a device. |
| Devices | POST | `/devices/bulk/import` | Import devices from CSV or supported bulk data. |
| Devices | POST | `/devices/:id/rescan` | Trigger a device rescan. |
| Topology | GET | `/topology` | Retrieve graph nodes and edges. |
| Topology | GET | `/topology/export` | Export topology as a requested format. |
| Topology | GET | `/topology/stats` | Retrieve topology summary statistics. |
| Scans | POST | `/scans/upload` | Upload a supported scan file. |
| Scans | GET | `/scans` | List scan results. |
| Scans | GET | `/scans/:id` | Retrieve a scan result. |
| Agents | POST | `/agents/register` | Register an agent. |
| Agents | GET | `/agents` | List agents. |
| Agents | GET | `/agents/:id` | Retrieve agent details. |
| Agents | PUT | `/agents/:id` | Update agent configuration. |
| Agents | DELETE | `/agents/:id` | Decommission an agent. |
| Agents | POST | `/agents/:id/heartbeat` | Submit an agent heartbeat. |
| Agents | POST | `/agents/:id/report` | Submit agent findings. |
| NetBox | POST | `/integrations/netbox/test` | Test NetBox connectivity. |
| NetBox | POST | `/integrations/netbox/sync` | Trigger NetBox synchronization. |
| NetBox | GET | `/integrations/netbox/status` | Retrieve sync status. |
| NetBox | PUT | `/integrations/netbox/config` | Update NetBox configuration. |
| Icons | GET | `/icons` | List icons. |
| Icons | POST | `/icons/upload` | Upload a custom icon. |
| Icons | DELETE | `/icons/:id` | Delete a custom icon. |

### 6.3 NetBox Interface

**IR-NBX-001 (Must):** Brian shall use the NetBox API in read-only mode for synchronization.

**IR-NBX-002 (Must):** Brian shall handle authentication failures, connection timeouts, rate limits, malformed responses, and unavailable endpoints without corrupting existing data.

**IR-NBX-003 (Must):** NetBox field mappings shall be documented for site, device, device type, interface, IP address, status, and description fields.

**IR-NBX-004 (Must):** Sync logs shall distinguish transport errors, authentication errors, validation errors, and per-record conflicts.

### 6.4 Agent Interface

**IR-AGENT-001 (Must):** Agents shall initiate outbound communication to Brian and shall not require inbound connections to the agent for normal operation.

**IR-AGENT-002 (Must):** Agent requests shall include the agent token and identify the agent that produced the data.

**IR-AGENT-003 (Must):** Agent reports shall support devices, services, scan timestamps, and discovered relationships where available.

**IR-AGENT-004 (Must):** Brian shall return actionable error responses to invalid or unauthorized agent requests.

---

## 7. Data Requirements

### 7.1 General Data Rules

**DR-GEN-001 (Must):** Every persisted entity shall have a stable unique identifier.

**DR-GEN-002 (Must):** Persisted entities shall include creation and update timestamps where applicable.

**DR-GEN-003 (Must):** Imported data shall retain source and last-seen information when applicable.

**DR-GEN-004 (Must):** Deletion behavior shall be documented for entities referenced by connections, scans, or audit records.

**DR-GEN-005 (Must):** The database shall enforce uniqueness and referential integrity constraints for required identifiers and relationships.

### 7.2 Device Entity

A device shall support at least:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key. |
| `name` | String | Yes | Display name. |
| `ip_address` | String | Yes | Unique normalized IP address. |
| `mac_address` | String | No | Unique when present. |
| `device_type` | Enum/String | Yes | Server, router, firewall, workstation, switch, cloud, service, or other. |
| `location_id` | UUID | No | Related location. |
| `description` | String | No | Operator description. |
| `status` | Enum | Yes | Online, offline, unknown, active, inactive, or decommissioned as applicable. |
| `icon_id` | UUID | No | Related icon. |
| `tags` | String array | No | User-defined tags. |
| `metadata` | JSON | No | Extensible custom fields. |
| `created_at` | DateTime | Yes | Creation timestamp. |
| `updated_at` | DateTime | Yes | Last update timestamp. |
| `last_scanned_at` | DateTime | No | Most recent scan observation. |
| `scan_source` | Enum | No | Manual, NetBox, nmap, dnsrecon, Ettercap, agent, or API. |
| `source_agent_id` | UUID | No | Agent that discovered the device. |

### 7.3 Connection Entity

A connection shall support:

- `id`: UUID primary key.
- `source_device_id`: UUID foreign key.
- `target_device_id`: UUID foreign key.
- `source_interface`: Optional interface identifier.
- `target_interface`: Optional interface identifier.
- `connection_type`: Direct, inferred, DNS, Layer 2, or service.
- `protocol`: Optional protocol name.
- `port`: Optional integer port.
- `status`: Running, stopped, disconnected, degraded, or unavailable.
- `latency_ms`: Optional numeric value.
- `bandwidth_mbps`: Optional numeric value.
- `created_at` and `updated_at`: Date-time fields.

### 7.4 Location Entity

A location shall support an ID, unique name, description, creation timestamp, and update timestamp.

### 7.5 Agent Entity

An agent shall support an ID, name, location, hashed token or token reference, status, last heartbeat timestamp, last scan timestamp, scan schedule, scan targets, scan type, creation timestamp, and update timestamp.

### 7.6 Icon Entity

An icon shall support an ID, name, type, persistent file path or object reference, optional device type mapping, creation timestamp, and uploading user reference when user management exists.

### 7.7 Scan Result Entity

A scan result shall support an ID, scan source, optional agent ID, raw data reference, discovered device count, updated device count, scan date, scan duration, creation timestamp, validation result, and error summary.

### 7.8 Audit and Event Data

**DR-AUDIT-001 (Should):** The system should retain synchronization events, scan import events, configuration changes, and important device changes.

**DR-AUDIT-002 (Must):** Integration and scan event records shall be queryable by source, date, status, and error state.

---

## 8. Security and Privacy Requirements

### 8.1 Authentication and Authorization

**SEC-AUTH-001 (Must):** Protected API endpoints shall require a valid bearer token.

**SEC-AUTH-002 (Must):** Agent tokens shall be scoped to the associated agent and restricted to heartbeat, report, and permitted agent operations.

**SEC-AUTH-003 (Must):** Administrative configuration endpoints shall not be accessible using an agent-scoped token.

**SEC-AUTH-004 (MVP constraint):** Built-in interactive user authentication is outside MVP scope and shall be provided by a reverse proxy, identity-aware gateway, or equivalent deployment control.

**SEC-AUTH-005 (Should):** The implementation should support token rotation and revocation without deleting associated agent or integration records.

### 8.2 Secret Handling

**SEC-SECRET-001 (Must):** NetBox API tokens and agent tokens shall not be logged in plaintext.

**SEC-SECRET-002 (Must):** Secrets shall not be returned in normal API responses after creation or configuration.

**SEC-SECRET-003 (Must):** Secrets shall be stored using a secure secret mechanism or encrypted configuration where supported by the deployment.

**SEC-SECRET-004 (Must):** Error messages shall redact authorization headers, tokens, passwords, and sensitive connection strings.

### 8.3 Input and File Security

**SEC-INPUT-001 (Must):** All API and form inputs shall be validated and normalized server-side.

**SEC-INPUT-002 (Must):** Uploaded files shall be checked for allowed type, size, structure, and content before parsing.

**SEC-INPUT-003 (Must):** Custom SVG uploads shall be sanitized or served in a way that prevents script execution and unsafe external resource loading.

**SEC-INPUT-004 (Must):** File paths supplied by users shall be constrained to configured storage locations to prevent path traversal.

**SEC-INPUT-005 (Must):** The system shall apply rate limits or equivalent protection to authentication, upload, heartbeat, and report endpoints.

### 8.4 Data Protection

**SEC-DATA-001 (Must):** API traffic shall support HTTPS in production deployments through the application or a documented reverse proxy configuration.

**SEC-DATA-002 (Must):** Database credentials shall be supplied through protected deployment configuration and not committed to source control.

**SEC-DATA-003 (Must):** Logs shall avoid storing unnecessary sensitive network data and shall support configurable retention.

**SEC-DATA-004 (Should):** Export operations should be auditable and optionally restricted by deployment policy.

---

## 9. Non-Functional Requirements

### 9.1 Performance

**NFR-PERF-001 (Must):** The initial frontend page load target shall be less than 2 seconds on a representative local or well-connected deployment, excluding unusually large asset downloads.

**NFR-PERF-002 (Must):** The topology shall render 500 nodes with typical connections in less than 1 second after graph data is available, subject to documented test hardware.

**NFR-PERF-003 (Must):** API requests shall target a 100 ms p95 response time for ordinary reads and writes excluding long-running sync, upload parsing, and export operations.

**NFR-PERF-004 (Must):** Long-running operations shall expose a status, completion result, or error rather than holding an unbounded synchronous request.

**NFR-PERF-005 (Should):** The UI should remain interactable during large topology layout and import operations by using incremental rendering or background processing.

### 9.2 Scalability

**NFR-SCALE-001 (Must):** The MVP shall support at least 500 devices in one topology.

**NFR-SCALE-002 (Should):** The architecture should permit growth to 10,000 devices through pagination, filtering, clustering, level-of-detail rendering, and asynchronous processing.

**NFR-SCALE-003 (Must):** Device list and scan history endpoints shall paginate large result sets.

### 9.3 Availability and Resilience

**NFR-RES-001 (Must):** Existing topology data shall remain viewable if NetBox, an agent, Redis, or another optional integration is unavailable.

**NFR-RES-002 (Must):** Failed sync or scan imports shall not partially corrupt unrelated existing records.

**NFR-RES-003 (Must):** Import processing shall provide transaction or rollback behavior appropriate to the selected conflict policy.

**NFR-RES-004 (Should):** The deployment should provide health and readiness endpoints for service orchestration.

### 9.4 Usability and Accessibility

**NFR-UX-001 (Must):** The topology shall prioritize low visual noise and clear network relationships.

**NFR-UX-002 (Must):** The application shall support light and dark themes.

**NFR-UX-003 (Must):** Color contrast shall be sufficient for text, controls, states, alerts, and topology elements.

**NFR-UX-004 (Must):** State and meaning shall not depend solely on color.

**NFR-UX-005 (Must):** The application shall provide keyboard-accessible forms, menus, dialogs, and primary navigation.

**NFR-UX-006 (Should):** The application should conform to WCAG 2.1 AA for applicable interface elements.

**NFR-UX-007 (Must):** User-defined topology positions and presentation preferences shall be preserved where specified by the feature.

### 9.5 Maintainability and Extensibility

**NFR-MAINT-001 (Must):** New scan sources shall be addable through a defined ingestion boundary without rewriting core topology rendering.

**NFR-MAINT-002 (Must):** Public API contracts shall be documented with request, response, authentication, validation, and error behavior.

**NFR-MAINT-003 (Must):** Database schema changes shall be managed through versioned migrations.

**NFR-MAINT-004 (Should):** The project should provide automated unit, integration, API, parser, and frontend interaction tests for supported MVP workflows.

### 9.6 Observability

**NFR-OBS-001 (Must):** The backend shall log API errors, synchronization events, scan imports, agent heartbeats, and background task failures.

**NFR-OBS-002 (Must):** Logs shall include timestamps, severity, operation, result, and correlation or task identifiers where applicable.

**NFR-OBS-003 (Must):** Logs shall redact secrets and avoid unnecessary sensitive payloads.

**NFR-OBS-004 (Should):** The system should expose metrics for API latency, device counts, scan counts, sync failures, agent status, and background task duration.

---

## 10. Error Handling Requirements

**FR-ERR-001 (Must):** The API shall return a consistent error structure containing an error code, human-readable message, and optional field or record details.

**FR-ERR-002 (Must):** Invalid device forms shall identify each invalid field without discarding valid entered values.

**FR-ERR-003 (Must):** Invalid scan files shall report the source, parser failure, affected record where known, and corrective action.

**FR-ERR-004 (Must):** NetBox errors shall identify whether the failure occurred during connection, authentication, retrieval, mapping, validation, or persistence.

**FR-ERR-005 (Must):** Agent errors shall identify whether the failure occurred during authentication, heartbeat, scan submission, payload validation, or persistence.

**FR-ERR-006 (Must):** The frontend shall distinguish transient errors, validation errors, permission errors, and unavailable-service errors.

**FR-ERR-007 (Must):** Failed background operations shall be visible in their relevant status or event log.

---

## 11. Testing and Verification Requirements

### 11.1 Test Levels

The implementation shall include, as appropriate:

- Unit tests for validation, normalization, conflict resolution, status classification, and parsers.
- API tests for authentication, CRUD, filters, uploads, exports, integrations, and error responses.
- Integration tests for database persistence, NetBox synchronization, agent reporting, and file storage.
- Frontend tests for navigation, forms, filtering, selection, theme switching, and error states.
- End-to-end tests for the primary workflows in Section 5.
- Security tests for token scope, secret redaction, file validation, SVG sanitization, and path traversal.
- Performance tests for 500-node topology rendering and representative API workloads.

### 11.2 Verification Rules

**NFR-TEST-001 (Must):** Every `Must` requirement shall have at least one automated or documented manual verification method before MVP release.

**NFR-TEST-002 (Must):** Parser tests shall cover valid input, malformed input, missing required fields, duplicate records, and unsupported values.

**NFR-TEST-003 (Must):** Integration tests shall verify that failed external systems do not delete or corrupt prior valid data.

**NFR-TEST-004 (Must):** UI tests shall verify that node and link state are distinguishable without color alone.

### 11.3 Acceptance Criteria

**AC-001:** A fresh Docker Compose deployment starts the frontend, API, and database with documented commands.

**AC-002:** An operator can create, edit, filter, select, inspect, export, and delete a device.

**AC-003:** An operator can create and inspect a connection with interface labels and connection state.

**AC-004:** A 500-node topology can be rendered, panned, zoomed, filtered, and inspected without unacceptable interaction failure.

**AC-005:** A valid nmap XML file produces a preview and creates or updates devices and services after confirmation.

**AC-006:** A malformed scan file produces actionable validation errors and does not corrupt existing data.

**AC-007:** A NetBox connection can be tested, synchronized manually, synchronized on a schedule, and disconnected without deleting prior imported data.

**AC-008:** NetBox sync status displays timestamps, counts, and errors.

**AC-009:** An agent can authenticate, send a heartbeat, submit findings, and appear with the correct status and provenance.

**AC-010:** An agent without a heartbeat for the documented threshold becomes degraded or offline as appropriate.

**AC-011:** Custom SVG and PNG icons can be uploaded, validated, assigned, displayed, and removed when permitted.

**AC-012:** Light and dark themes persist between browser sessions and apply to all major application surfaces.

**AC-013:** API tokens and NetBox credentials are never exposed in ordinary responses or logs.

**AC-014:** JSON, CSV, SVG, and PNG exports contain the requested topology or inventory scope.

---

## 12. Traceability Matrix

The following matrix maps major PRD capabilities to this SRS.

| PRD Capability | SRS Coverage |
|---|---|
| Interactive topology canvas | FR-TOPO, FR-NODE, FR-LINK, IR-UI |
| Manual device CRUD | FR-DEV |
| Search and filtering | FR-FILTER |
| Custom icons | FR-ICON, SEC-INPUT |
| NetBox read-only sync | FR-NBX, IR-NBX |
| Nmap, dnsrecon, Ettercap, generic imports | FR-SCAN |
| Distributed agents | FR-AGENT, IR-AGENT |
| Device and connection data model | DR-GEN through DR-SCAN |
| REST API | IR-API |
| Light and dark themes | FR-NAV, IR-UI, NFR-UX |
| Topology export | FR-EXPORT |
| Performance targets | NFR-PERF, NFR-SCALE |
| Docker Compose deployment | NFR-DEP |
| Security and token handling | SEC-AUTH through SEC-DATA |
| MVP exclusions | Section 1.2 and Section 13 |

---

## 13. Constraints, Assumptions, and Out of Scope

### 13.1 Constraints

- MVP is a single-server deployment.
- Built-in user authentication is not included in MVP.
- Agent communication initially uses HTTP/HTTPS API communication and may later support mutual TLS.
- Automatic topology layout is supported; manual position persistence is required by this SRS after explicit user arrangement.
- Users are responsible for network access and authorization to scan their environments.

### 13.2 Assumptions

- NetBox is externally accessible and exposes a stable supported API.
- Agents run in trusted environments.
- Users understand IP addresses, CIDR, TCP/UDP ports, and common network device types.
- Deployment operators provide appropriate reverse proxy, TLS, backups, and access controls for production.

### 13.3 Out of Scope for MVP

- VPN and overlay network topology visualization.
- Real-time NetFlow, sFlow, or equivalent traffic analysis.
- CVE or external vulnerability database integration.
- Multi-tenant isolation.
- Native mobile application.
- Predictive analytics or machine-learning anomaly detection.
- Browser-based packet capture.
- High-availability multi-instance deployment.
- Kubernetes support beyond documented future direction.
- LDAP, SSO, and built-in RBAC.

---

## 14. Future Requirements and Extension Points

The architecture should leave extension points for:

- Plugin-based scan source adapters.
- Additional IPAM/DCIM integrations.
- Layer 2 and VLAN-specific topology models.
- Vulnerability and risk scoring.
- Custom metadata schemas.
- OpenAPI and interactive API documentation.
- User accounts, RBAC, LDAP, and SSO.
- Alerting, notifications, and event subscriptions.
- High availability and Kubernetes deployment.
- Terraform provider support.
- mTLS for agent communication.

These capabilities are not acceptance requirements for the MVP unless explicitly promoted into scope.

---

## 15. Document Change History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | September 24, 2026 | Product Team | Initial SRS derived from the PRD and NetBox client requirements. |
