import { useState } from 'react'
import { DEVICES, type Device, type DeviceType } from '../data'
import { Card, Btn, Badge, StatusBadge, StatusDot, DeviceTypeIcon, Modal, Field, SearchInput, Eyebrow, TableCard, Mono } from '../components/shared'

function DeviceDetailModal({ device, onClose }: { device: Device; onClose: () => void }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(device.name)
  const [desc, setDesc] = useState(device.description ?? '')

  return (
    <Modal title={device.name} onClose={onClose} width={620}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: 16, background: 'var(--bg)', borderRadius: 8 }}>
        <DeviceTypeIcon type={device.type} size={32} />
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 16 }}>{device.name}</strong>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 3, fontFamily: "'IBM Plex Mono', monospace" }}>{device.ip}</div>
        </div>
        <StatusBadge status={device.status} />
        <Btn onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</Btn>
      </div>

      {editing ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Device name"><input value={name} onChange={e => setName(e.target.value)} /></Field>
          <Field label="IP address"><input defaultValue={device.ip} /></Field>
          <Field label="MAC address"><input defaultValue={device.mac ?? ''} /></Field>
          <Field label="Location"><input defaultValue={device.location} /></Field>
          <Field label="Device type">
            <select defaultValue={device.type}>
              {(['server','router','firewall','workstation','switch','cloud','service','access-point'] as DeviceType[]).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select defaultValue={device.status}><option value="online">Online</option><option value="offline">Offline</option><option value="unknown">Unknown</option></select>
          </Field>
          <Field label="Description" style={{ gridColumn: '1 / -1' }}>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
          </Field>
          <Field label="Tags" style={{ gridColumn: '1 / -1' }}><input defaultValue={device.tags.join(', ')} placeholder="comma-separated tags" /></Field>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
            <Btn variant="primary">Save changes</Btn>
            <Btn onClick={() => setEditing(false)}>Cancel</Btn>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
            {[
              ['IP Address', device.ip, true],
              ['MAC Address', device.mac ?? '—', true],
              ['Type', device.type, false],
              ['Location', device.location, false],
              ['Operating system', device.os ?? '—', false],
              ['Scan source', device.scanSource, false],
              ['Last seen', device.lastSeen ?? '—', false],
              ['Status', null, false],
            ].map(([k, v, mono], i) => (
              <div key={k as string} style={{ padding: '12px 14px', background: i % 2 === 0 ? 'var(--panel-strong)' : 'transparent', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{k as string}</div>
                {k === 'Status'
                  ? <StatusBadge status={device.status} />
                  : <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: mono ? "'IBM Plex Mono', monospace" : undefined }}>{v as string}</div>
                }
              </div>
            ))}
          </div>

          {device.services && device.services.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Eyebrow style={{ display: 'block', marginBottom: 10 }}>Open services</Eyebrow>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {device.services.map(s => (
                  <span key={s.port} style={{ padding: '5px 10px', border: '1px solid var(--border-bright)', borderRadius: 5, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--cyan)' }}>
                    {s.port} <span style={{ color: 'var(--muted)' }}>·</span> {s.service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {device.tags.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Eyebrow style={{ display: 'block', marginBottom: 10 }}>Tags</Eyebrow>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {device.tags.map(tag => (
                  <span key={tag} style={{ padding: '4px 9px', background: 'var(--panel-soft)', borderRadius: 4, fontSize: 12, color: 'var(--muted)' }}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {device.description && (
            <div style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
              {device.description}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn>Trigger rescan</Btn>
            <Btn>Export JSON</Btn>
            <Btn variant="danger" style={{ marginLeft: 'auto' }}>Delete device</Btn>
          </div>
        </>
      )}
    </Modal>
  )
}

function AddDeviceModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Add device" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Device name"><input placeholder="e.g. WEB-03" /></Field>
        <Field label="IP address"><input placeholder="e.g. 10.10.1.12" /></Field>
        <Field label="MAC address"><input placeholder="Optional" /></Field>
        <Field label="Location">
          <select defaultValue="">
            <option value="" disabled>Select location</option>
            {['HQ-DC1', 'HQ-Office', 'Remote-East', 'AWS-us-east-1', 'HQ-DC2'].map(l => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Device type">
          <select defaultValue="server">
            {(['server','router','firewall','workstation','switch','cloud','service','access-point'] as DeviceType[]).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select defaultValue="unknown"><option value="online">Online</option><option value="offline">Offline</option><option value="unknown">Unknown</option></select>
        </Field>
        <Field label="Operating system" style={{ gridColumn: '1 / -1' }}><input placeholder="e.g. Ubuntu 22.04 LTS" /></Field>
        <Field label="Description" style={{ gridColumn: '1 / -1' }}><textarea rows={2} placeholder="Optional notes" style={{ resize: 'vertical' }} /></Field>
        <Field label="Tags" style={{ gridColumn: '1 / -1' }}><input placeholder="e.g. critical, web, production" /></Field>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
          <Btn variant="primary">Create device</Btn>
          <Btn onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </Modal>
  )
}

const LOCATIONS = ['All locations', 'HQ-DC1', 'HQ-Office', 'Remote-East', 'AWS-us-east-1', 'HQ-DC2', 'Unknown']
const TYPES: string[] = ['All types', 'server', 'router', 'firewall', 'workstation', 'switch', 'cloud', 'service', 'access-point']

export function DevicesView() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All locations')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const filtered = DEVICES.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.ip.includes(q) || d.tags.some(t => t.includes(q)) || d.location.toLowerCase().includes(q) || (d.os?.toLowerCase().includes(q) ?? false)
    const matchStatus = statusFilter === 'All' || d.status === statusFilter.toLowerCase()
    const matchLoc = locationFilter === 'All locations' || d.location === locationFilter
    const matchType = typeFilter === 'All types' || d.type === typeFilter
    return matchSearch && matchStatus && matchLoc && matchType
  })

  function toggleRow(id: string) {
    setSelectedRows(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function toggleAll() {
    setSelectedRows(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(d => d.id)))
  }

  return (
    <section className="view-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, letterSpacing: '-.03em' }}>Device Inventory</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>{DEVICES.length} devices across {[...new Set(DEVICES.map(d => d.location))].length} locations</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn>Bulk import CSV</Btn>
          <Btn>Export</Btn>
          <Btn variant="primary" onClick={() => setShowAdd(true)}>＋ Add device</Btn>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <SearchInput placeholder="Search by name, IP, tag, OS…" value={search} onChange={setSearch} style={{ width: 300, flexShrink: 0 }} />
        {[['All', 'All'], ['Online', 'Online'], ['Offline', 'Offline'], ['Unknown', 'Unknown']].map(([label, val]) => (
          <button key={val} onClick={() => setStatusFilter(val)} style={{
            padding: '6px 12px', border: `1px solid ${statusFilter === val ? 'var(--border-bright)' : 'var(--border)'}`,
            borderRadius: 6, background: statusFilter === val ? 'var(--panel-strong)' : 'transparent',
            color: statusFilter === val ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', fontSize: 12, fontWeight: 500,
          }}>{label}</button>
        ))}
        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} style={{ padding: '6px 10px', minWidth: 130 }}>
          {LOCATIONS.map(l => <option key={l}>{l}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '6px 10px', minWidth: 130 }}>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        {(search || statusFilter !== 'All' || locationFilter !== 'All locations' || typeFilter !== 'All types') && (
          <Btn variant="ghost" onClick={() => { setSearch(''); setStatusFilter('All'); setLocationFilter('All locations'); setTypeFilter('All types') }}>Clear filters</Btn>
        )}
      </div>

      {selectedRows.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 14px', background: 'var(--panel-soft)', border: '1px solid var(--border-bright)', borderRadius: 7, fontSize: 13 }}>
          <strong style={{ color: 'var(--accent)' }}>{selectedRows.size} selected</strong>
          <Btn style={{ minHeight: 30, fontSize: 12, padding: '4px 10px' }}>Tag</Btn>
          <Btn style={{ minHeight: 30, fontSize: 12, padding: '4px 10px' }}>Change status</Btn>
          <Btn variant="danger" style={{ minHeight: 30, fontSize: 12, padding: '4px 10px' }}>Delete</Btn>
          <Btn variant="ghost" onClick={() => setSelectedRows(new Set())} style={{ minHeight: 30, fontSize: 12, padding: '4px 10px', marginLeft: 'auto' }}>Deselect all</Btn>
        </div>
      )}

      <TableCard>
        <table>
          <thead>
            <tr>
              <th style={{ width: 40, paddingRight: 0 }}>
                <input type="checkbox" checked={selectedRows.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ width: 'auto', accentColor: 'var(--accent)' }} />
              </th>
              <th>Device</th>
              <th>IP Address</th>
              <th>Type</th>
              <th>Location</th>
              <th>OS</th>
              <th>Status</th>
              <th>Last seen</th>
              <th>Source</th>
              <th>Tags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(device => (
              <tr key={device.id} style={{ background: selectedRows.has(device.id) ? 'var(--panel-soft)' : undefined }}>
                <td style={{ paddingRight: 0 }}>
                  <input type="checkbox" checked={selectedRows.has(device.id)} onChange={() => toggleRow(device.id)} style={{ width: 'auto', accentColor: 'var(--accent)' }} />
                </td>
                <td>
                  <button onClick={() => setSelectedDevice(device)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 0, cursor: 'pointer', color: 'inherit', padding: 0 }}>
                    <DeviceTypeIcon type={device.type} size={15} />
                    <strong style={{ color: 'var(--text)' }}>{device.name}</strong>
                  </button>
                </td>
                <td><Mono>{device.ip}</Mono></td>
                <td style={{ textTransform: 'capitalize' }}>{device.type}</td>
                <td>{device.location}</td>
                <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{device.os ?? '—'}</td>
                <td><StatusBadge status={device.status} /></td>
                <td>{device.lastSeen ?? '—'}</td>
                <td style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}>{device.scanSource}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {device.tags.slice(0, 2).map(tag => (
                      <span key={tag} style={{ padding: '2px 6px', background: 'var(--panel-soft)', borderRadius: 3, fontSize: 10, color: 'var(--muted)' }}>{tag}</span>
                    ))}
                    {device.tags.length > 2 && <span style={{ fontSize: 10, color: 'var(--faint)' }}>+{device.tags.length - 2}</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setSelectedDevice(device)} title="Inspect" style={{ width: 28, height: 28, border: '1px solid var(--border-bright)', borderRadius: 5, background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>↗</button>
                    <button title="Rescan" style={{ width: 28, height: 28, border: '1px solid var(--border-bright)', borderRadius: 5, background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>⟳</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>
            <p>No devices match your filters.</p>
            <Btn variant="ghost">Clear filters</Btn>
          </div>
        )}
      </TableCard>

      <div style={{ marginTop: 12, color: 'var(--muted)', fontSize: 12 }}>
        Showing {filtered.length} of {DEVICES.length} devices
      </div>

      {selectedDevice && <DeviceDetailModal device={selectedDevice} onClose={() => setSelectedDevice(null)} />}
      {showAdd && <AddDeviceModal onClose={() => setShowAdd(false)} />}
    </section>
  )
}
