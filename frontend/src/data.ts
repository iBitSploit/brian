export type DeviceStatus = 'online' | 'offline' | 'unknown'
export type DeviceType = 'server' | 'router' | 'firewall' | 'workstation' | 'switch' | 'cloud' | 'service' | 'access-point'
export type AgentStatus = 'online' | 'offline' | 'degraded'

export interface Device {
  id: string
  name: string
  ip: string
  mac?: string
  type: DeviceType
  location: string
  status: DeviceStatus
  tags: string[]
  os?: string
  services?: { port: number; service: string }[]
  lastSeen?: string
  scanSource: string
  description?: string
}

export interface Agent {
  id: string
  name: string
  location: string
  ip: string
  os: string
  status: AgentStatus
  lastHeartbeat: string
  lastScan: string
  scanTargets: string
  scanSchedule: string
  devicesFound: number
  token: string
}

export interface ScanResult {
  id: string
  source: string
  filename: string
  date: string
  duration: string
  devicesDiscovered: number
  devicesUpdated: number
  status: 'success' | 'partial' | 'error'
  agent?: string
}

export interface Activity {
  id: string
  type: 'sync' | 'scan' | 'device' | 'agent' | 'alert'
  message: string
  detail: string
  time: string
  color: string
}

export const DEVICES: Device[] = [
  { id: 'd1', name: 'FW-HQ-01', ip: '10.0.0.1', mac: '00:1A:2B:3C:4D:01', type: 'firewall', location: 'HQ-DC1', status: 'online', tags: ['critical', 'perimeter'], os: 'FortiOS 7.4', services: [{ port: 443, service: 'https' }, { port: 22, service: 'ssh' }], lastSeen: '2 min ago', scanSource: 'NetBox', description: 'Primary perimeter firewall' },
  { id: 'd2', name: 'RTR-CORE-01', ip: '10.0.1.1', mac: '00:1A:2B:3C:4D:02', type: 'router', location: 'HQ-DC1', status: 'online', tags: ['critical', 'core'], os: 'Cisco IOS-XE 17.9', services: [{ port: 22, service: 'ssh' }], lastSeen: '3 min ago', scanSource: 'NetBox' },
  { id: 'd3', name: 'SW-CORE-01', ip: '10.0.2.1', mac: '00:1A:2B:3C:4D:03', type: 'switch', location: 'HQ-DC1', status: 'online', tags: ['core'], os: 'Cisco NX-OS 10.2', lastSeen: '3 min ago', scanSource: 'NetBox' },
  { id: 'd4', name: 'SW-CORE-02', ip: '10.0.2.2', mac: '00:1A:2B:3C:4D:04', type: 'switch', location: 'HQ-DC1', status: 'online', tags: ['core'], os: 'Cisco NX-OS 10.2', lastSeen: '3 min ago', scanSource: 'NetBox' },
  { id: 'd5', name: 'WEB-01', ip: '10.10.1.10', mac: '00:1A:2B:3C:4D:05', type: 'server', location: 'HQ-DC1', status: 'online', tags: ['web', 'production'], os: 'Ubuntu 22.04 LTS', services: [{ port: 80, service: 'http' }, { port: 443, service: 'https' }, { port: 22, service: 'ssh' }], lastSeen: '1 min ago', scanSource: 'Agent: HQ-Scanner-01', description: 'Primary web server' },
  { id: 'd6', name: 'WEB-02', ip: '10.10.1.11', mac: '00:1A:2B:3C:4D:06', type: 'server', location: 'HQ-DC1', status: 'online', tags: ['web', 'production'], os: 'Ubuntu 22.04 LTS', services: [{ port: 80, service: 'http' }, { port: 443, service: 'https' }], lastSeen: '1 min ago', scanSource: 'Agent: HQ-Scanner-01' },
  { id: 'd7', name: 'DB-PRIMARY', ip: '10.10.2.20', mac: '00:1A:2B:3C:4D:07', type: 'server', location: 'HQ-DC1', status: 'online', tags: ['database', 'critical', 'production'], os: 'Rocky Linux 9', services: [{ port: 5432, service: 'postgresql' }, { port: 22, service: 'ssh' }], lastSeen: '4 min ago', scanSource: 'Nmap', description: 'PostgreSQL primary replica' },
  { id: 'd8', name: 'DB-REPLICA', ip: '10.10.2.21', mac: '00:1A:2B:3C:4D:08', type: 'server', location: 'HQ-DC1', status: 'online', tags: ['database', 'production'], os: 'Rocky Linux 9', services: [{ port: 5432, service: 'postgresql' }], lastSeen: '4 min ago', scanSource: 'Nmap' },
  { id: 'd9', name: 'MON-01', ip: '10.10.3.30', mac: '00:1A:2B:3C:4D:09', type: 'server', location: 'HQ-DC1', status: 'online', tags: ['monitoring'], os: 'Debian 12', services: [{ port: 9090, service: 'prometheus' }, { port: 3000, service: 'grafana' }], lastSeen: '2 min ago', scanSource: 'Manual' },
  { id: 'd10', name: 'JUMP-01', ip: '10.0.100.5', mac: '00:1A:2B:3C:4D:0A', type: 'server', location: 'HQ-DC1', status: 'online', tags: ['bastion', 'access'], os: 'Ubuntu 24.04 LTS', services: [{ port: 22, service: 'ssh' }], lastSeen: '6 min ago', scanSource: 'Manual', description: 'Bastion / jump host' },
  { id: 'd11', name: 'WS-ADMIN-01', ip: '10.20.1.100', mac: '00:1A:2B:3C:4D:0B', type: 'workstation', location: 'HQ-Office', status: 'online', tags: ['admin', 'workstation'], os: 'Windows 11 Pro', lastSeen: '12 min ago', scanSource: 'Agent: HQ-Scanner-01' },
  { id: 'd12', name: 'WS-DEV-01', ip: '10.20.1.101', mac: '00:1A:2B:3C:4D:0C', type: 'workstation', location: 'HQ-Office', status: 'online', tags: ['dev', 'workstation'], os: 'macOS 15.1', lastSeen: '8 min ago', scanSource: 'Agent: HQ-Scanner-01' },
  { id: 'd13', name: 'WS-DEV-02', ip: '10.20.1.102', mac: '00:1A:2B:3C:4D:0D', type: 'workstation', location: 'HQ-Office', status: 'offline', tags: ['dev', 'workstation'], os: 'macOS 15.1', lastSeen: '3 h ago', scanSource: 'Agent: HQ-Scanner-01' },
  { id: 'd14', name: 'AP-OFFICE-01', ip: '10.20.0.10', mac: '00:1A:2B:3C:4D:0E', type: 'access-point', location: 'HQ-Office', status: 'online', tags: ['wifi'], os: 'UniFi 8.3', lastSeen: '1 min ago', scanSource: 'NetBox' },
  { id: 'd15', name: 'RTR-REMOTE-01', ip: '10.42.0.1', mac: '00:1A:2B:3C:4D:10', type: 'router', location: 'Remote-East', status: 'online', tags: ['remote', 'edge'], os: 'Cisco IOS-XE 17.9', lastSeen: '7 min ago', scanSource: 'Agent: Remote-East-01' },
  { id: 'd16', name: 'SRV-REMOTE-01', ip: '10.42.1.10', mac: '00:1A:2B:3C:4D:11', type: 'server', location: 'Remote-East', status: 'online', tags: ['remote', 'fileserver'], os: 'Windows Server 2022', services: [{ port: 445, service: 'smb' }, { port: 3389, service: 'rdp' }], lastSeen: '7 min ago', scanSource: 'Agent: Remote-East-01' },
  { id: 'd17', name: 'SRV-REMOTE-02', ip: '10.42.1.11', mac: '00:1A:2B:3C:4D:12', type: 'server', location: 'Remote-East', status: 'unknown', tags: ['remote'], os: 'Unknown', lastSeen: '2 d ago', scanSource: 'Agent: Remote-East-01' },
  { id: 'd18', name: 'CLOUD-GW-AWS', ip: '172.31.0.1', type: 'cloud', location: 'AWS-us-east-1', status: 'online', tags: ['cloud', 'aws', 'gateway'], lastSeen: '1 min ago', scanSource: 'Agent: Cloud-Discovery-01', description: 'AWS VPC gateway' },
  { id: 'd19', name: 'K8S-NODE-01', ip: '172.31.10.10', type: 'server', location: 'AWS-us-east-1', status: 'online', tags: ['cloud', 'kubernetes', 'aws'], os: 'Amazon Linux 2023', services: [{ port: 6443, service: 'kubernetes' }, { port: 10250, service: 'kubelet' }], lastSeen: '2 min ago', scanSource: 'Agent: Cloud-Discovery-01' },
  { id: 'd20', name: 'K8S-NODE-02', ip: '172.31.10.11', type: 'server', location: 'AWS-us-east-1', status: 'online', tags: ['cloud', 'kubernetes', 'aws'], os: 'Amazon Linux 2023', services: [{ port: 6443, service: 'kubernetes' }, { port: 10250, service: 'kubelet' }], lastSeen: '2 min ago', scanSource: 'Agent: Cloud-Discovery-01' },
  { id: 'd21', name: 'REDIS-01', ip: '10.10.3.40', type: 'service', location: 'HQ-DC1', status: 'online', tags: ['cache', 'production'], os: 'Debian 12', services: [{ port: 6379, service: 'redis' }], lastSeen: '3 min ago', scanSource: 'Nmap' },
  { id: 'd22', name: 'NTP-01', ip: '10.0.0.5', type: 'server', location: 'HQ-DC1', status: 'online', tags: ['infrastructure'], os: 'Debian 12', services: [{ port: 123, service: 'ntp' }], lastSeen: '10 min ago', scanSource: 'Nmap' },
  { id: 'd23', name: 'DNS-01', ip: '10.0.0.6', type: 'server', location: 'HQ-DC1', status: 'online', tags: ['dns', 'infrastructure'], os: 'Ubuntu 22.04 LTS', services: [{ port: 53, service: 'dns' }], lastSeen: '5 min ago', scanSource: 'Dnsrecon' },
  { id: 'd24', name: 'UNKNOWN-192-168', ip: '192.168.99.1', type: 'router', location: 'Unknown', status: 'unknown', tags: ['unclassified'], lastSeen: '1 d ago', scanSource: 'Nmap', description: 'Discovered during subnet sweep — unidentified' },
]

export const AGENTS: Agent[] = [
  { id: 'a1', name: 'HQ-Scanner-01', location: 'HQ-DC1', ip: '10.20.0.15', os: 'Ubuntu 24.04 LTS', status: 'online', lastHeartbeat: '34 s ago', lastScan: '2026-09-24 08:00 UTC', scanTargets: '10.0.0.0/8', scanSchedule: '0 */6 * * *', devicesFound: 18, token: 'brn_hq01_••••••••••••' },
  { id: 'a2', name: 'Remote-East-01', location: 'Remote-East', ip: '10.42.8.21', os: 'Debian 12', status: 'online', lastHeartbeat: '1 min 12 s ago', lastScan: '2026-09-24 06:00 UTC', scanTargets: '10.42.0.0/16', scanSchedule: '0 */12 * * *', devicesFound: 6, token: 'brn_re01_••••••••••••' },
  { id: 'a3', name: 'Cloud-Discovery-01', location: 'AWS-us-east-1', ip: '172.31.16.44', os: 'Rocky Linux 9', status: 'online', lastHeartbeat: '48 s ago', lastScan: '2026-09-24 07:30 UTC', scanTargets: '172.31.0.0/16', scanSchedule: '0 */4 * * *', devicesFound: 12, token: 'brn_cd01_••••••••••••' },
  { id: 'a4', name: 'Legacy-DC2-Scanner', location: 'HQ-DC2', ip: '10.50.0.100', os: 'CentOS 7', status: 'degraded', lastHeartbeat: '47 min ago', lastScan: '2026-09-23 18:00 UTC', scanTargets: '10.50.0.0/24', scanSchedule: '0 0 * * *', devicesFound: 3, token: 'brn_dc2_••••••••••••' },
]

export const SCANS: ScanResult[] = [
  { id: 's1', source: 'Nmap XML', filename: 'hq_subnet_sweep_0924.xml', date: '2026-09-24 08:12 UTC', duration: '4 min 22 s', devicesDiscovered: 8, devicesUpdated: 14, status: 'success', agent: 'HQ-Scanner-01' },
  { id: 's2', source: 'Dnsrecon JSON', filename: 'dns_enum_internal.json', date: '2026-09-23 22:00 UTC', duration: '1 min 08 s', devicesDiscovered: 3, devicesUpdated: 1, status: 'success' },
  { id: 's3', source: 'Nmap XML', filename: 'aws_scan_us_east.xml', date: '2026-09-23 20:30 UTC', duration: '12 min 44 s', devicesDiscovered: 5, devicesUpdated: 7, status: 'success', agent: 'Cloud-Discovery-01' },
  { id: 's4', source: 'Custom JSON', filename: 'manual_asset_import.json', date: '2026-09-22 16:45 UTC', duration: '0 min 03 s', devicesDiscovered: 2, devicesUpdated: 0, status: 'partial' },
  { id: 's5', source: 'Ettercap', filename: 'remote_east_arp.pcap', date: '2026-09-21 11:00 UTC', duration: '—', devicesDiscovered: 0, devicesUpdated: 0, status: 'error' },
  { id: 's6', source: 'Nmap XML', filename: 'full_sweep_192.168.xml', date: '2026-09-20 09:00 UTC', duration: '31 min 17 s', devicesDiscovered: 1, devicesUpdated: 2, status: 'success' },
]

export const ACTIVITY: Activity[] = [
  { id: 'ac1', type: 'sync', message: 'NetBox sync completed', detail: '24 devices updated, 0 conflicts', time: '8 min ago', color: 'var(--accent)' },
  { id: 'ac2', type: 'scan', message: 'Agent HQ-Scanner-01 scan finished', detail: '8 new hosts discovered on 10.0.0.0/8', time: '22 min ago', color: 'var(--cyan)' },
  { id: 'ac3', type: 'alert', message: 'Agent Legacy-DC2-Scanner degraded', detail: 'Last heartbeat 47 min ago — check connectivity', time: '47 min ago', color: 'var(--amber)' },
  { id: 'ac4', type: 'device', message: 'Device WS-DEV-02 went offline', detail: 'Last seen at 10.20.1.102, 3 h ago', time: '3 h ago', color: 'var(--red)' },
  { id: 'ac5', type: 'scan', message: 'Dnsrecon import completed', detail: '3 new hostnames resolved', time: '6 h ago', color: 'var(--cyan)' },
  { id: 'ac6', type: 'device', message: 'UNKNOWN-192-168 discovered', detail: 'Unclassified router at 192.168.99.1 — needs review', time: '1 d ago', color: 'var(--amber)' },
  { id: 'ac7', type: 'agent', message: 'Cloud-Discovery-01 registered', detail: 'New agent connected from 172.31.16.44', time: '2 d ago', color: 'var(--accent)' },
  { id: 'ac8', type: 'scan', message: 'Ettercap import failed', detail: 'Unsupported pcap format — see error log', time: '3 d ago', color: 'var(--red)' },
]

// Topology graph definition
export interface TopoNode {
  id: string
  label: string
  ip: string
  type: DeviceType
  status: DeviceStatus
  x: number
  y: number
  location: string
}

export interface TopoEdge {
  id: string
  source: string
  target: string
  type: 'direct' | 'inferred' | 'dns'
}

export const TOPO_NODES: TopoNode[] = [
  { id: 'n-inet', label: 'Internet', ip: '0.0.0.0/0', type: 'cloud', status: 'online', x: 380, y: 48, location: 'External' },
  { id: 'n-fw', label: 'FW-HQ-01', ip: '10.0.0.1', type: 'firewall', status: 'online', x: 380, y: 138, location: 'HQ-DC1' },
  { id: 'n-rtr', label: 'RTR-CORE-01', ip: '10.0.1.1', type: 'router', status: 'online', x: 380, y: 228, location: 'HQ-DC1' },
  { id: 'n-sw1', label: 'SW-CORE-01', ip: '10.0.2.1', type: 'switch', status: 'online', x: 210, y: 320, location: 'HQ-DC1' },
  { id: 'n-sw2', label: 'SW-CORE-02', ip: '10.0.2.2', type: 'switch', status: 'online', x: 560, y: 320, location: 'HQ-DC1' },
  { id: 'n-web1', label: 'WEB-01', ip: '10.10.1.10', type: 'server', status: 'online', x: 90, y: 430, location: 'HQ-DC1' },
  { id: 'n-web2', label: 'WEB-02', ip: '10.10.1.11', type: 'server', status: 'online', x: 210, y: 430, location: 'HQ-DC1' },
  { id: 'n-db1', label: 'DB-PRIMARY', ip: '10.10.2.20', type: 'server', status: 'online', x: 330, y: 430, location: 'HQ-DC1' },
  { id: 'n-db2', label: 'DB-REPLICA', ip: '10.10.2.21', type: 'server', status: 'online', x: 460, y: 430, location: 'HQ-DC1' },
  { id: 'n-mon', label: 'MON-01', ip: '10.10.3.30', type: 'server', status: 'online', x: 580, y: 430, location: 'HQ-DC1' },
  { id: 'n-ws1', label: 'WS-ADMIN-01', ip: '10.20.1.100', type: 'workstation', status: 'online', x: 100, y: 530, location: 'HQ-Office' },
  { id: 'n-ws2', label: 'WS-DEV-02', ip: '10.20.1.102', type: 'workstation', status: 'offline', x: 220, y: 530, location: 'HQ-Office' },
  { id: 'n-cloud', label: 'CLOUD-GW-AWS', ip: '172.31.0.1', type: 'cloud', status: 'online', x: 680, y: 228, location: 'AWS' },
  { id: 'n-unk', label: 'UNKNOWN', ip: '192.168.99.1', type: 'router', status: 'unknown', x: 700, y: 380, location: 'Unknown' },
]

export const TOPO_EDGES: TopoEdge[] = [
  { id: 'e1', source: 'n-inet', target: 'n-fw', type: 'direct' },
  { id: 'e2', source: 'n-fw', target: 'n-rtr', type: 'direct' },
  { id: 'e3', source: 'n-rtr', target: 'n-sw1', type: 'direct' },
  { id: 'e4', source: 'n-rtr', target: 'n-sw2', type: 'direct' },
  { id: 'e5', source: 'n-sw1', target: 'n-web1', type: 'direct' },
  { id: 'e6', source: 'n-sw1', target: 'n-web2', type: 'direct' },
  { id: 'e7', source: 'n-sw1', target: 'n-db1', type: 'direct' },
  { id: 'e8', source: 'n-sw2', target: 'n-db2', type: 'direct' },
  { id: 'e9', source: 'n-sw2', target: 'n-mon', type: 'direct' },
  { id: 'e10', source: 'n-web1', target: 'n-ws1', type: 'inferred' },
  { id: 'e11', source: 'n-web2', target: 'n-ws2', type: 'inferred' },
  { id: 'e12', source: 'n-fw', target: 'n-cloud', type: 'direct' },
  { id: 'e13', source: 'n-sw2', target: 'n-unk', type: 'inferred' },
]
