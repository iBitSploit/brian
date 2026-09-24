# Brian API MVP

Base URL: `/api/v1`

The API is JSON-first. Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

Obtain a development token with `POST /api/v1/auth/login`. Configure production credentials through `BRIAN_ADMIN_USERNAME` and `BRIAN_ADMIN_PASSWORD`; the default development credentials are `admin` / `change-me`.

## Response conventions

Successful single-resource responses return the resource object. List responses return:

```json
{
  "items": [],
  "pagination": { "page": 1, "page_size": 50, "total": 0, "pages": 0 }
}
```

Errors return:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed.",
    "details": {}
  }
}
```

## Endpoint catalog

### Health and authentication

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | Liveness check. |
| POST | `/api/v1/auth/login` | No | Create a JWT from username and password. |
| GET | `/api/v1/openapi.json` | No | Minimal machine-readable API metadata. |
| GET | `/api/v1/stats` | JWT | Return topology summary counts. |

### Devices

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/devices` | List devices. Supports `page`, `page_size`, and `search`. |
| POST | `/api/v1/devices` | Create a device. Required: `name`, `ip_address`. |
| GET | `/api/v1/devices/{id}` | Retrieve a device. |
| PUT | `/api/v1/devices/{id}` | Update device fields. |
| DELETE | `/api/v1/devices/{id}` | Delete a device. |
| POST | `/api/v1/devices/bulk/import` | Import a JSON array of devices. |
| POST | `/api/v1/devices/{id}/rescan` | Queue a device rescan. |

Device fields include `name`, `ip_address`, `mac_address`, `hostname`, `device_type`, `location`, `description`, `status`, `tags`, `metadata`, `last_scanned_at`, `scan_source`, and `source_agent_id`.

### Topology and connections

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/topology` | Return graph nodes and edges. |
| POST | `/api/v1/topology/connections` | Create a connection between devices. |
| DELETE | `/api/v1/topology/connections/{id}` | Delete a connection. |

Connection fields include `source_device_id`, `target_device_id`, `source_interface`, `target_interface`, `connection_type`, `protocol`, `port`, `status`, `latency_ms`, and `bandwidth_mbps`.

### Scans

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/scans` | List scan results. |
| POST | `/api/v1/scans/upload` | Store a normalized scan result and queue processing. |
| GET | `/api/v1/scans/{id}` | Retrieve a scan result. |

The MVP upload endpoint accepts normalized JSON. Parser adapters for nmap XML, dnsrecon JSON/XML, Ettercap data, and generic JSON can be added behind the scan service without changing the resource contract.

### Agents

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/agents` | List registered agents. |
| POST | `/api/v1/agents/register` | Register an agent and return its token once. |
| GET | `/api/v1/agents/{id}` | Retrieve agent configuration and status. |
| PUT | `/api/v1/agents/{id}` | Update schedule, targets, status, or metadata. |
| DELETE | `/api/v1/agents/{id}` | Decommission an agent. |
| POST | `/api/v1/agents/{id}/heartbeat` | Record an authenticated heartbeat. |
| POST | `/api/v1/agents/{id}/report` | Accept agent findings. |

Agent status values are `online`, `degraded`, and `offline`. Production agent authentication should use a dedicated scoped-token decorator rather than the administrative JWT used by this MVP.

### NetBox integration

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/integrations/netbox/test` | Test configured NetBox connectivity. |
| POST | `/api/v1/integrations/netbox/sync` | Queue a read-only synchronization. |
| GET | `/api/v1/integrations/netbox/status` | Return sync state, counts, and errors. |
| PUT | `/api/v1/integrations/netbox/config` | Store URL and sync configuration. |

### Icons

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/icons` | List available icons. |
| POST | `/api/v1/icons/upload` | Store icon metadata for an uploaded asset. |
| DELETE | `/api/v1/icons/{id}` | Delete a custom icon. |

## Local development

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask --app wsgi run --debug
```

The default local API is available at `http://localhost:5000`.

## Production notes

- Set `SECRET_KEY`, `JWT_SECRET_KEY`, and database credentials through the environment.
- Put the API behind HTTPS and a reverse proxy.
- Replace the development login with an identity provider or production credential service.
- Add scoped agent-token authentication before deploying remote agents.
- Run with Gunicorn, for example `gunicorn --chdir backend wsgi:app`.
