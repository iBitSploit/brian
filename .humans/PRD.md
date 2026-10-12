# Product Requirements Document: Brian
## Open-Source Network & Infrastructure Topology Platform

**Version:** 1.2
**Last Updated:** September 25, 2026  

---

## 1. Executive Summary

Brian is an open-source, self-hosted network and infrastructure topology visualization platform designed for security engineers, DevSecOps teams, and network engineers. It provides a unified, real-time view of complex network architectures by aggregating data from multiple sources (manual input, scanning tools, NetBox API, distributed agents) and rendering them as interactive topology maps.

**Core Value Proposition:**
- Centralized visibility into distributed infrastructure across multiple locations
- Automated discovery from existing tools (NetBox, nmap, reconnaissance scanners)
- Extensible agent-based architecture for remote network scanning
- Customizable, themeable visualization interface
- Open-source, self-hosted, no vendor lock-in

---

## 2. Vision & Goals

### Vision Statement
Enable infrastructure and security teams to see, understand, and manage their entire network topology in real-time—whether assets are on-premises, cloud-hosted, or geographically distributed.

### Strategic Goals
1. **Unified Discovery**: Consolidate device/network data from scanning tools, APIs, and agents into a single source of truth
2. **Extensibility**: Support plugin architecture for new data sources and integrations
3. **Accessibility**: Provide both technical and non-technical teams with understandable infrastructure visualizations
4. **Automation**: Minimize manual topology maintenance through automated scanning and syncing
5. **Security**: Enable rapid threat identification, network segmentation analysis, and unauthorized asset detection

---

## 3. Target Users

### Primary Users
- **Security Engineers**: Red team operators, Blue team operators, cyber threat researchers
- **Network Engineers**: NOC Operators, Network Administrators
- **DevSecOps Teams**: Architects, platform engineers managing multi-site infrastructure
- **SOC Analysts**: Incident responders needing rapid asset context
- **GRC Teams**: Asset inventory and network documentation

### User Personas

**Persona 1: Red Team Operator**
- Needs rapid reconnaissance output visualization
- Requiring a massive CTI database for their attack target
- Uses nmap, dnsrecon, ettercap for discovery
- Requires custom annotations and device categorization
- Works in teams across locations

**Persona 2: Infrastructure Operator**
- Manages 50-500 device deployments across 1-10 locations
- Useing an inventory system like NetBox or anything similar
- Needs to see physical/logical topology relationships
- Requires dark mode for 24/7 SOC environments

**Persona 3: Compliance Officer**
- Needs to export/verify asset inventories
- Requires network segmentation views
- Needs audit trails and documentation

**Persona 4: DevOps / Platform Engineer**
- Needs to see which containers run on which servers
- Wants a lifecycle view of build, deploy, run, and retire
- Needs logs and optional console access without leaving operational context
- Expects integrations with tools the team already owns, not a new SaaS control plane

---

## 4. High-Level Features (MVP)

### 4.1 Core Visualization Layer
- **Interactive Topology Canvas**
  - graph rendering
  - Node-link diagram with logical clustering (by site, network, function)
  - Pan, zoom, fit-to-screen, zoom-to-selection gestures
  - Collapsible subnet/network groupings
  - Connection visualization showing active links, latency data (if available)

- **Device/Node Representation**
  - Visual nodes representing devices, networks, services
  - Customizable icons and labels
  - Status indicators (online/offline, vulnerability level, last scan date)
  - Right-click context menus (view details, edit, delete, rescan)
  - Click-to-inspect panels showing detailed metadata

- **Search & Filtering**
  - Full-text search across device names, IPs, MAC addresses
  - Filter by device type, status, location, last modified date
  - Filter by tag/label
  - Saved filter views (e.g., "Critical Servers", "Unscanned Devices")

### 4.2 Device Management
- **Manual Device Addition**
  - Form-based UI to add individual devices (name, IP, type, location, description)
  - Bulk import via CSV (IP, hostname, device_type, location, icon)
  - Device fields: name, IP address, MAC address, device type, location, tags, custom metadata
  
- **Custom Device Icons**
  - Icon library (server, router, firewall, workstation, switch, cloud, etc.)
  - Upload custom SVG/PNG icons
  - Read custom SVG/PNG icons from a predefined path the user can change its content at any given time
  - Icon association per device type or individual device
  - Icon preview in topology

- **Device Lifecycle**
  - Create, read, update, delete operations
  - Device state tracking (active, inactive, decommissioned, unknown)
  - Edit device attributes in-place or in side panel
  - Bulk operations (tag, delete, change status)

### 4.3 Data Ingestion & Integration

#### NetBox Integration
- **Read-Only Sync**
  - Periodic sync (configurable: every 1-6 hours or minutes)
  - Pull devices, sites, interfaces, IP addresses
  - Map NetBox device_type to custom icons
  - Conflict resolution: manual merge, timestamp-based, user preference
  - Log all sync events
  - Sync status dashboard (last sync time, device count, sync errors)

#### Scanning Tool Integration
- **Nmap Integration**
  - Accept XML output from nmap scans
  - Parse: hosts, open ports, services, OS detection, hostnames
  - Upload via UI or API endpoint
  - Auto-create nodes for discovered hosts
  - Update existing nodes with service/port data
  - Track scan date per host
  - Support for incremental scans (update rather than replace)

- **Dnsrecon Integration**
  - Accept JSON/XML output from dnsrecon
  - Parse: A records, MX, NS, TXT records, zone transfers
  - Create nodes for discovered subdomains/hosts
  - Link DNS records to topology (DNS server nodes)
  - Store raw DNS data for export

- **Ettercap Integration**
  - Accept pcap/network logs from ettercap
  - Parse: ARP tables, DHCP servers, discovered hosts
  - Layer 2 topology visualization (if advanced feature)
  - Switch/VLAN detection (if available in pcap)

- **Generic Scan Upload**
  - Custom import format: JSON array
    ```json
    [
      {
        "ip": "192.168.1.10",
        "hostname": "server01",
        "device_type": "server",
        "location": "HQ-DC1",
        "services": [{"port": 22, "service": "ssh"}, {"port": 3306, "service": "mysql"}],
        "os": "Linux",
        "scan_date": "2026-09-24T10:30:00Z"
      }
    ]
    ```
  - Validation and error reporting

### 4.4 Agent-Based Distributed Scanning
- **Agent Architecture**
  - Lightweight, containerized agents (Docker image, <50MB)
  - Deployed at remote locations/subnets
  - Agents communicate via REST API to central Brian server
  - No inbound ports required (agents initiate outbound connections)
  - Authentication: API tokens with per-agent scoping

- **Agent Capabilities**
  - Local network scanning (nmap, ARP table dumps)
  - Subnet discovery (ipcalc, netmask calculations)
  - Service probing (port scanning, banner grabbing)
  - DNS lookups and reverse DNS resolution
  - Ping/latency measurements
  - Scheduled scans (cron-like expressions)

- **Agent Deployment**
  - Docker Compose example provided
  - Environment variables for server URL, auth token, scan schedules
  - Systemd service template for bare-metal deployment
  - Kubernetes Helm chart (stretch goal)
  - Auto-registration or manual token-based registration

- **Agent Management Panel**
  - List deployed agents with status (online/offline, last heartbeat)
  - Configure per-agent scan schedules
  - Trigger on-demand scans from UI
  - View agent logs and error messages
  - Decommission/delete agents

- **Data Aggregation**
  - Agents report findings to central server
  - Central server deduplicates data across agents
  - Conflict resolution: most recent scan wins, unless manually overridden
  - Visualization shows which agent discovered each node

---

## 5. Theme & UI/UX Requirements

### 5.1 Dark & Light Themes
- **Dark Theme (Default)**
  - Background: #1a1a1a or #0d1117 (GitHub-style)
  - Canvas: #0d1117
  - Nodes: #238636 (active), #6e7681 (inactive)
  - Text: #c9d1d9
  - Accent: #58a6ff (links, highlights)
  - Borders: #30363d

- **Light Theme**
  - Background: #ffffff
  - Canvas: #f6f8fa
  - Nodes: #238636 (active), #d0d7de (inactive)
  - Text: #24292f
  - Accent: #0969da
  - Borders: #d0d7de

- **Theme Toggle**
  - Persistent preference (localStorage)
  - System preference detection (optional)
  - Smooth transition between themes
  - All UI elements respect theme (modals, tooltips, sidebars)

### 5.2 Layout & Components
- **Main Layout**
  - Left sidebar: Navigation, filters, device tree (collapsible)
  - Center: Topology canvas (80% of viewport)
  - Right panel: Context/details panel for selected nodes (collapsible)
  - Top bar: Logo, search, theme toggle, settings, notifications

- **Responsive Design**
  - Minimum viewport: 1024px width
  - Sidebar collapse on <1400px
  - Mobile view: simplified layout (sidebar hidden by default)

- **Navigation**
  - Home/Dashboard
  - Topology View (main feature)
  - Devices (list/table view)
  - Integrations (NetBox, scanning tools, agents)
  - Settings (users, API tokens, theme, scan schedules)
  - Help/Documentation

---

## 6. Detailed Feature Specifications

### 6.1 Topology View Canvas
**Component: TopologyCanvas**
- **Graph Algorithms**:
  - Layout: Hierarchical (top-down), force-directed, radial, breadth-first
  - Selectable layout at runtime
  - Layout reset/recenter buttons
  
- **Interactions**:
  - Click node: Select and open details panel
  - Drag node: Move (but position resets on next sync/refresh)
  - Hover node: Show tooltip (name, IP, status)
  - Right-click: Context menu (edit, delete, rescan, copy IP)
  - Ctrl+Click: Multi-select
  - Drag to select: Selection box
  - Scroll wheel: Zoom
  - Middle-click drag: Pan
  - Double-click node: Zoom to node
  - Escape: Deselect all

- **Visual Encoding**:
  - Node size: Based on device type or connectivity (configurable)
  - Node color: By status (online/offline/unknown), or by type
  - Node shape: Circle, square, diamond (per icon library)
  - Edge color: By connection type (direct link, inferred, DNS)
  - Edge thickness: By traffic volume or latency (if data available)
  - Edge label: Optional bandwidth, latency, protocol
  - Node glow/halo: Highlight selected or active nodes

**Topology Presentation Requirements**:

- **Canvas**:
  - Provide a two-dimensional workspace with an optional alignment grid or background pattern.
  - Support smooth pan, zoom, configurable zoom levels, automatic centering, and fit-to-screen behavior.
  - Allow free placement of topology objects and optional snap-to-grid alignment.
  - Preserve object positions between sessions or topology saves.
  - Maintain sufficient contrast between the canvas and topology objects without decorative elements competing with the network.

- **Node Presentation**:
  - Represent routers, switches, firewalls, hosts/end devices, network appliances, cloud/network abstractions, and other virtualized devices as discrete visual objects.
  - Display an icon or device graphic with a consistently positioned, readable label.
  - Support normal, selected, running/active, stopped/inactive, warning/error, and disabled/unavailable states.
  - Communicate state through more than color by using icons, borders, opacity, or other supplementary indicators.

- **Connection Presentation**:
  - Render network links between the relevant interfaces or endpoints of two nodes.
  - Support consistent line weight, endpoint/interface association, optional directional indicators, connection metadata labels, and visual link-state differentiation.
  - Clearly render multiple connections between the same devices.
  - Support running, stopped, disconnected, degraded, and unavailable link states.

- **Interface and Port Labels**:
  - Identify the source and destination interfaces when interface information is displayed, for example `R1:eth0/0 - R2:eth0/1`.
  - Keep labels associated with their links during movement, zooming, and topology rearrangement.
  - Hide secondary interface metadata at lower zoom levels and progressively reveal detail as the user zooms in.

- **Selection and Interaction States**:
  - Provide immediate visual feedback for selected nodes and links through highlighted borders or outlines, increased contrast, contextual controls, or actions.
  - Emphasize directly connected links when a node is selected to clarify immediate topology relationships.
  - Provide lightweight hover feedback without permanently changing the topology presentation.

- **Labels and Information Density**:
  - Use a consistent label hierarchy: device name, device type or status, interface/link information, then secondary metadata.
  - Use progressive disclosure through zoom, hover, selection, or contextual panels instead of displaying all metadata at once.

- **Color and Theming**:
  - Use color primarily for device or link state, selection and focus, alerts/errors, and necessary device categories.
  - Avoid arbitrary colors for every topology object to preserve visual hierarchy.
  - Maintain sufficient contrast in light and dark themes and ensure state distinctions remain understandable for users with common color-vision deficiencies.

- **Layout and Persistence**:
  - Support both manually arranged and automatically arranged topologies.
  - Automatic layouts should reduce link crossings, maintain reasonable spacing, preserve directional or hierarchical relationships, avoid label/link overlap, and group related devices.
  - Manual positioning takes precedence over automatic layout after the user explicitly arranges objects.

- **Large Topologies**:
  - Support level-of-detail rendering, progressive label visibility, reduced metadata at lower zoom levels, link simplification, grouping or clustering, and viewport-based rendering.
  - Preserve responsive interaction and visual comprehension as the number of topology objects increases.

- **Contextual Controls and Visual Consistency**:
  - Keep controls visually secondary to the network and expose actions such as adding, linking, editing, deleting, changing layout, and zooming through contextual menus, toolbars, or object-specific controls.
  - Use a unified visual language for iconography, typography, borders, lines, corner radius, elevation, state indicators, spacing, selection behavior, and transitions.
  - Use subtle, functional animations only to communicate state transitions, selection, or topology updates.

- **Presentation Principles**:
  - Prioritize topology relationships over decorative UI and keep persistent visual noise low.
  - Make operational state immediately recognizable and use consistent semantics throughout the application.
  - Ensure the visual system scales with topology complexity.
  - Do not rely solely on color or fine visual distinctions to communicate state or meaning.
  - Preserve user-defined positioning and presentation preferences where appropriate.

### 6.2 Device Details Panel
**Component: DeviceDetailsPanel**
- **Read-Only View** (Initially):
  - Device name, IP, MAC address
  - Device type, location, tags
  - Status (online/offline), last scan date
  - Associated services (ports, protocols)
  - Related nodes (upstream, downstream, DNS records)
  - Edit button → Edit mode

- **Edit Mode**:
  - Inline form for all editable fields
  - Save/Cancel buttons
  - Validation (IP format, required fields)
  - Change log (show previous values)

- **Action Buttons**:
  - Rescan (re-run agent/tool scan for this device)
  - Export (JSON/CSV)
  - Delete (with confirmation)
  - View Logs (scan history, changes)

### 6.3 Search & Filter Panel
**Component: FilterPanel**
- **Search Box**:
  - Real-time filtering as user types
  - Search fields: name, IP, MAC, hostname, tags, location
  - Clear button, X to dismiss

- **Filter Options** (Checkboxes/Dropdowns):
  - Status: Online, Offline, Unknown, All
  - Device Type: [multi-select]
  - Location: [multi-select]
  - Last Scanned: Last 24h, Last 7d, Last 30d, Never, All
  - Tags: [multi-select]
  - Has Services: Yes/No
  - Scan Source: NetBox, Nmap, Dnsrecon, Ettercap, Manual, Agent [name]

- **Saved Views**:
  - Save current filter combo as named view
  - List saved views with delete option
  - Quick access buttons

### 6.4 NetBox Integration Panel
**Component: NetBoxIntegration**
- **Configuration Form**:
  - NetBox URL (text input)
  - API Token (password input, show/hide)
  - Test Connection button
  - Auto-sync toggle (on/off)
  - Sync interval dropdown: Every 1, 6, 12, 24 hours
  - Device Type Icon Mapping: UI to map NetBox device_type → custom icons

- **Sync Status**:
  - Last sync time, next sync time
  - Device count synced, errors
  - Expandable error log
  - Manual sync button
  - Disconnect button (stop sync, keep data)

### 6.5 Scanning Tool Upload Panel
**Component: ScanUploadPanel**
- **Upload Interface**:
  - Tool selector: Nmap, Dnsrecon, Ettercap, Custom JSON
  - File drop zone (drag-and-drop)
  - Browse button
  - File preview (parsed data table)
  - Conflict resolution selector:
    - "Merge" (update existing devices, add new)
    - "Replace" (overwrite existing)
    - "Review" (show conflicts, user chooses)

- **Parsing & Validation**:
  - Real-time validation feedback
  - Show parsing errors (line number, reason)
  - Display preview of discovered devices
  - Count of new vs. updated devices

- **Import Confirmation**:
  - Summary table of devices to be added/updated
  - Import button
  - Success message with affected device count
  - Undo option (10-minute window)

### 6.6 Agent Management Panel
**Component: AgentManagement**
- **Agent List**:
  - Table: Agent Name, Location, Status (online/offline), Last Heartbeat, Last Scan, Actions
  - New Agent button → Registration form
  - Filter by status, location

- **Registration Form**:
  - Agent name (required)
  - Location (dropdown/text)
  - Scan type: Network Subnet, Specific Hosts, Services
  - Auto-generate API token (copy button)
  - Display Docker run command for quick deployment

- **Agent Configuration**:
  - Click agent row → Expand details
  - Edit scan schedule (cron expression or dropdown presets)
  - Edit scan targets (CIDR, comma-separated hosts)
  - Manual scan trigger button
  - View logs (last 100 lines)
  - Decommission button

- **Agent Heartbeat & Status**:
  - Green indicator: Online (heartbeat in last 5 min)
  - Yellow: Degraded (heartbeat in last 1 hour)
  - Red: Offline (no heartbeat in last 1 hour)
  - Click status → View error details

---

## 7. User Workflows (Happy Paths)

### Workflow 1: Initial Setup & Discovery
1. User deploys Brian (Docker/bare-metal)
2. Navigates to Settings → Integrations
3. Connects NetBox instance (URL + token)
4. Enables auto-sync (12 hours)
5. Manually triggers sync
6. Views populated topology with all NetBox devices
7. Customizes device type → icon mappings
8. Deploys 2 agents (HQ, Remote Office)
9. Configures agents to scan local subnets (192.168.1.0/24, 10.0.0.0/24)
10. Agents discover local devices and report back
11. Topology now shows all devices with source annotations

### Workflow 2: Penetration Test Integration
1. Red team runs nmap scan: `nmap -sV -O 192.168.0.0/24 -oX scan.xml`
2. Uploads scan.xml via Topology → Upload Scan
3. Brian parses nmap XML, auto-creates nodes for new hosts
4. Selects conflict resolution: "Merge"
5. Confirms import
6. New nodes appear on canvas with service/port data
7. User filters by "Last Scanned: Last 24h" to see new nodes
8. Clicks on node, views detected services and OS
9. Adds custom tags: "Active", "High-Risk"
10. Exports topology as PNG for report

### Workflow 3: Continuous Monitoring
1. Agent in DC1 runs scheduled scan every 6 hours
2. Discovers new server (192.168.100.50)
3. Reports to central Brian instance
4. Node appears on topology with status "Just Added" (highlight)
5. Admin reviews, confirms it's legitimate
6. Agent in DC2 detects missing server (previously scanned)
7. Node status changes to "Offline"
8. Alert notification (if configured)
9. Admin investigates, updates device status to "Decommissioned"

---

## 8. Data Model

### Core Entities

**Device**
```
{
  id: UUID (primary key),
  name: string,
  ip_address: string (unique),
  mac_address: string (unique, nullable),
  device_type: string (enum: server, router, firewall, workstation, switch, cloud, service, other),
  location: string (foreign key to Location),
  description: string,
  status: string (enum: online, offline, unknown),
  icon_id: UUID (foreign key to Icon),
  tags: string[] (array of tag names),
  metadata: JSON (custom fields),
  created_at: datetime,
  updated_at: datetime,
  last_scanned_at: datetime,
  scan_source: string (enum: manual, netbox, nmap, dnsrecon, ettercap, agent, api),
  source_agent_id: UUID (nullable, if discovered by agent)
}
```

**Connection/Link**
```
{
  id: UUID,
  source_device_id: UUID (foreign key),
  target_device_id: UUID (foreign key),
  connection_type: string (enum: direct, inferred, dns, layer2, service),
  protocol: string (optional),
  port: integer (optional),
  latency_ms: float (optional),
  bandwidth_mbps: float (optional),
  created_at: datetime,
  updated_at: datetime
}
```

**Location**
```
{
  id: UUID,
  name: string (unique),
  description: string,
  created_at: datetime,
  updated_at: datetime
}
```

**Agent**
```
{
  id: UUID,
  name: string,
  location_id: UUID (foreign key to Location),
  api_token: string (hashed),
  status: string (enum: online, offline, degraded),
  last_heartbeat_at: datetime,
  scan_schedule: string (cron expression),
  scan_targets: string (CIDR/host list),
  scan_type: string (enum: network, specific_hosts, services),
  created_at: datetime,
  updated_at: datetime
}
```

**Icon**
```
{
  id: UUID,
  name: string,
  type: string (enum: built_in, custom),
  file_path: string (path to SVG/PNG),
  device_type: string (optional, if default for type),
  created_at: datetime,
  uploaded_by_user_id: UUID (nullable)
}
```

**ScanResult**
```
{
  id: UUID,
  scan_source: string (enum: nmap, dnsrecon, ettercap, agent),
  agent_id: UUID (nullable),
  raw_data: JSON (original parsed output),
  devices_discovered: integer,
  devices_updated: integer,
  scan_date: datetime,
  scan_duration_seconds: integer,
  created_at: datetime
}
```

---

## 9. API Specification

### Base URL
`/api/v1`

### Authentication
All endpoints require `Authorization: Bearer <API_TOKEN>` header.

### Endpoints

#### Devices
- `GET /devices` - List all devices (supports pagination, filtering)
- `GET /devices/:id` - Get device details
- `POST /devices` - Create device
- `PUT /devices/:id` - Update device
- `DELETE /devices/:id` - Delete device
- `POST /devices/bulk/import` - Bulk import from CSV
- `POST /devices/:id/rescan` - Trigger rescan

#### Topology
- `GET /topology` - Get full graph JSON (nodes + edges)
- `GET /topology/export` - Export as SVG/PNG
- `GET /topology/stats` - Summary stats (device count, connections, etc.)

#### Scans
- `POST /scans/upload` - Upload scan file (nmap, dnsrecon, etc.)
- `GET /scans/:id` - Get scan details
- `GET /scans` - List recent scans

#### Agents
- `POST /agents/register` - Register new agent
- `GET /agents` - List agents
- `GET /agents/:id` - Get agent details
- `PUT /agents/:id` - Update agent config
- `DELETE /agents/:id` - Decommission agent
- `POST /agents/:id/heartbeat` - Agent heartbeat (agents only)
- `POST /agents/:id/report` - Agent report findings (agents only)

#### Integrations
- `POST /integrations/netbox/test` - Test NetBox connection
- `POST /integrations/netbox/sync` - Trigger NetBox sync
- `GET /integrations/netbox/status` - NetBox sync status
- `PUT /integrations/netbox/config` - Update NetBox config

#### Icons
- `GET /icons` - List available icons
- `POST /icons/upload` - Upload custom icon
- `DELETE /icons/:id` - Delete custom icon

---

## 10. Technical Architecture

The full service, communication, and workflow description is in [Architecture.md](./Architecture.md). That document is the implementation architecture of record.

### Stack
- **Frontend**: React 18+, TypeScript, Vite, Cytoscape.js or equivalent, Brian CSS variables (Lucide icons)
- **Backend**: Python Flask (application factory, blueprints, SQLAlchemy, Marshmallow, Flask-Migrate). Not Node.js or FastAPI for MVP.
- **Database**: PostgreSQL 13+ with PostGIS (for geographic topology)
- **Cache**: Redis (for session management, rate limiting)
- **Message Queue**: Optional (for async scan processing)
- **Containerization**: Docker, Docker Compose

### Repository Structure
```
brian/
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── hooks/
│   └── package.json
├── backend/               # API server
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── migrations/
│   └── requirements.txt
├── agent/                 # Lightweight scan agent
│   ├── src/
│   └── Dockerfile
├── docs/                  # Documentation
├── docker-compose.yml
├── .github/workflows/      # CI/CD
└── README.md
```

### Deployment Options
1. **Docker Compose (Recommended for MVP)**
   - Single machine deployment
   - Services: API, Frontend, PostgreSQL, Redis
   - Volume mounts for data persistence

2. **Kubernetes (Future)**
   - Helm charts provided
   - StatefulSet for database
   - Deployment for API/frontend

3. **Bare Metal**
   - Systemd service files
   - Installation scripts for Ubuntu/Debian

---

## 11. Success Metrics & KPIs

### User Adoption
- Number of active users (DAU/MAU)
- Number of self-hosted instances deployed
- GitHub stars, forks, releases

### Feature Usage
- % of users integrating NetBox
- % of users deploying agents
- Average devices per topology
- Average scan uploads per week

### Performance
- Page load time < 2 seconds
- Topology render time < 1 second (for 500 nodes)
- API response time < 100ms (p95)
- Agent scan completion time < 5 minutes (for typical /24 subnet)

### Quality
- Uptime SLA: 99.5% (self-hosted)
- Bug report response time < 48 hours
- Security audit: Annual (for production use)

---

## 12. Roadmap & Phasing

### Phase 1: MVP (Months 1-2)
- ✅ Basic topology canvas (Cytoscape.js)
- ✅ Manual device CRUD
- ✅ Dark/light theme toggle
- ✅ Nmap XML upload and parsing
- ✅ Custom device icons (upload, library)
- ✅ Device filtering and search
- ✅ Simple deployment (Docker Compose)

### Phase 2: Integrations (Months 3-4)
- ✅ NetBox read-only sync
- ✅ Dnsrecon JSON import
- ✅ Basic agent architecture (single scan type)
- ✅ Agent management UI
- ✅ Topology export (SVG, PNG, JSON)

### Phase 3: Advanced Features (Months 5-6)
- Ettercap Layer 2 topology
- Vulnerability/risk scoring per node
- Custom metadata fields
- API documentation (OpenAPI/Swagger)
- User/role-based access control (RBAC)
- Audit logging

### Phase 4: Enterprise (Post-MVP)
- High availability deployment (multi-instance)
- Kubernetes support
- LDAP/SSO authentication
- Alerting/notifications system
- Advanced analytics dashboard
- Terraform provider for infrastructure-as-code
- Customer-owned Ollama AI assistant (see Section 17)
- DevOps lifecycle and container visibility (see Section 17)

---

## 13. Out of Scope (MVP)

- VPN/overlay network topology visualization
- Real-time traffic analysis (Netflow, sFlow)
- Vulnerability database integration (CVE scoring)
- Multi-tenant support
- Mobile app
- Predictive analytics / ML-based anomaly detection
- Browser-based network packet capture
- Built-in hosted LLM or any vendor-hosted model API as a default
- Full container orchestration, CI/CD replacement, or unrestricted remote shell product

---

## 14. Assumptions & Constraints

### Assumptions
- Users have network access to all devices they want to scan
- NetBox instance is externally accessible and has stable API
- Agents deployed in trusted environments (no untrusted network)
- Users understand basic networking concepts (CIDR, TCP/UDP)

### Constraints
- MVP: Single-server deployment only (no HA)
- No built-in authentication (rely on reverse proxy or basic auth)
- Agent communication: HTTP only (can be upgraded to mTLS)
- Topology layout: Automatic (no manual position save)

---

## 15. Glossary

| Term | Definition |
|------|------------|
| **Topology** | Visual representation of network devices and their connections |
| **Node** | A device or service in the topology (server, router, workstation) |
| **Link/Edge** | Connection between two devices |
| **Agent** | Lightweight service deployed remotely for distributed scanning |
| **Scan Source** | Origin of device data (manual, nmap, NetBox, agent, etc.) |
| **NetBox** | Open-source IPAM/DCIM platform (external integration) |
| **VAPT** | Vulnerability Assessment and Penetration Testing |
| **OSINT** | Open Source Intelligence (reconnaissance) |
| **Layer 2** | Data link layer (MAC addresses, switches, VLANs) |
| **Layer 3** | Network layer (IP addresses, routing) |
| **Ollama** | Customer-owned local LLM runtime; Brian may connect to it later, but never hosts or requires it |
| **Container runtime** | Docker, containerd, or equivalent process isolation on a host already represented in topology |

---

## 16. Appendix: Example Deployment Commands

### Docker Compose (Quick Start)
```bash
git clone https://github.com/yourusername/brian.git
cd brian
docker-compose up -d
# Access at http://localhost:3000
```

### Agent Deployment
```bash
docker run -d \
  -e NETVIZ_SERVER=https://brian.example.com \
  -e AGENT_TOKEN=<api_token> \
  -e AGENT_NAME="DC1-Scanner" \
  -e SCAN_TARGETS="192.168.1.0/24" \
  brian-agent:latest
```

---

## 17. Planned Post-MVP Capabilities

These capabilities are accepted product direction. They are **not** MVP acceptance criteria and must not displace topology, discovery, provenance, or agent work.

### 17.1 Customer-Owned Ollama AI Assistant

Brian should later offer an optional AI assistant that answers questions about the operator's own topology, inventory, and observations.

**Intent**
- Help operators ask natural-language questions such as "which hosts in DC1 have SSH open?" without leaving Brian.
- Keep the model and runtime under the customer's control.

**Non-negotiable constraints**
- The Ollama service is owned, deployed, and networked by the customer. Brian does not ship or host a model.
- The operator chooses the reachable Ollama base URL, model name, and which Brian network or deployment may contact it.
- Brian must not send topology, scan, or credential data to a third-party hosted LLM by default.
- Prompts and responses must respect existing secret-redaction rules. Tokens, NetBox credentials, and agent secrets must never be included in model context.
- The assistant is an overlay on existing APIs. It must not become a second source of truth or write inventory without an explicit, confirmed operator action.
- If Ollama is unreachable, Brian remains fully usable without the assistant.

**Likely surface**
- Settings: enable assistant, Ollama URL, model, timeout, and allowed networks.
- Optional chat or "ask this topology" panel scoped to current filters and selected nodes.
- Citations back to devices, scans, and sources rather than unsourced answers.

### 17.2 DevOps Lifecycle and Container Visibility

Brian should later help DevOps and platform engineers see runtime software in the same topology as the hosts that run it.

**Intent**
- Visualize a simple lifecycle of services and workloads (plan, deploy, run, stop, retire) without becoming a CI/CD product.
- Show which containers (or equivalent workloads) run on which servers already present in the topology.
- Make logs and optional console access easier to reach from that context.

**Candidate capabilities**
- Host-to-container (or host-to-workload) overlay on the topology or a related inspector.
- Runtime status per container: running, stopped, unknown, last seen.
- Log tail or deep-link to an existing log system the customer already operates.
- Optional console or exec access only through customer-owned credentials, an existing jump host, or a documented runtime API. Brian must not store unrestricted root shells or become a general remote-access product.
- Progressive disclosure: containers are detail on a host, not a second noisy graph by default.

**Non-goals**
- Replacing Kubernetes dashboards, Docker Desktop, or full APM.
- Collecting application performance traces as a core product.
- Granting console access without explicit operator configuration and auditability.

**Relationship to core product**
Containers and workloads are additional node types or child objects of existing devices. They must reuse provenance, status, filtering, and export patterns already defined for devices.

---

**Change Log**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2 | Sep 25, 2026 | Product Team | Pointed technical architecture at Architecture.md and locked Flask as the MVP API. |
| 1.1 | Sep 25, 2026 | Product Team | Captured post-MVP Ollama assistant and DevOps/container visibility from operator input. |
| 1.0 | Sep 2026 | Product Team | Initial PRD |