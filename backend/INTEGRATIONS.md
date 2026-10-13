# Backend Integration Plugin Contract

Status: implementation contract for Brian's FastAPI backend.

## Goals
- Keep HTTP routes independent from vendor SDKs.
- Require a stable lifecycle: metadata, config validation, connection test, read/sync, health.
- Normalize external records before persistence.
- Default integrations to read-only and isolate provider failures.
- Preserve last-known-good data when providers fail or return partial results.

## Package layout
```
backend/src/backend/integrations/
  base.py                 # shared plugin contract and DTOs
  registry.py             # explicit registration; never import user-supplied modules
  service.py              # shared orchestration boundary
  models.py               # integration instance, job and source-object provenance
  secrets.py              # Fernet encryption helper
  ingestion.py            # transactional idempotent source-object staging
  routes.py               # FastAPI /api/v1 routes
  netbox/
    plugin.py             # pynetbox adapter
    manifest.yaml         # plugin metadata
backend/migrations/
  0001_integration_tables.sql
```

## Plugin contract
Every plugin declares a lowercase stable ID, name, plugin version, configuration schema, capabilities, and external compatibility range. It implements `validate_config`, `test_connection`, `sync`, and `healthcheck`. `sync` returns normalized DTOs and must never write ORM models itself. The shared service owns persistence, transactions, provenance, jobs, audit events, retries, and public API serialization.

## NetBox compatibility matrix
Brian currently pins `pynetbox==7.8.0`. Upstream's tested compatibility table maps pynetbox 7.8.0 to NetBox 4.4, 4.5 and 4.6. NetBox 4.7 requires pynetbox 7.9.0; do not use that combination until Brian deliberately upgrades the pin and validates the adapter. See the [official compatibility table](https://github.com/netbox-community/pynetbox#compatibility).

The repository declares Python >=3.14. This runtime is within the supported Python range for NetBox 4.4–4.6 deployments; however, the exact Brian dependency lock still must be regenerated and CI-tested. The compatibility table is upstream tested compatibility, not a claim that Brian's integration tests have already passed against all three NetBox versions.

Use `BRIAN_NETBOX_MIN_VERSION=4.4.0` and `BRIAN_NETBOX_MAX_VERSION=4.6.99` as the default supported bounds. CI should test at least one patch release in each supported minor line. Do not expand the bounds without tests.

## Data and identity
External identity is `(integration_instance_id, object_type, external_id)`; IP address and hostname are not safe external keys. Normalized source payload and source URL are retained separately from canonical records. A future canonical mapper must map device, interface, IP address, prefix and relationship DTOs to Brian's canonical model. The current repository does not yet define canonical SQLAlchemy entities, so ingestion currently persists source-object staging/provenance and does not pretend that the full topology projection is finished.

Only mark objects stale after a successful, complete, untruncated snapshot with no warnings. Failed syncs, timeouts, capped results, disabled integrations, or partial endpoint errors must never stale missing objects. Never hard-delete canonical data automatically.

## Secrets and security
- Use a dedicated least-privilege NetBox read-only token.
- Set `BRIAN_INTEGRATION_ENCRYPTION_KEY` to a Fernet key and back it up separately from the database.
- Never commit tokens, expose them in API responses, or include them in logs.
- HTTPS and TLS verification are required by default. `BRIAN_ALLOW_INSECURE_INTEGRATIONS=1` is only for deliberate local test environments.
- Apply egress/SSRF controls at deployment/network policy level. Do not expose arbitrary unauthenticated URL testing in a public deployment.
- Set request connect/read timeouts and enforce maximum record and job duration limits.

## API currently exposed
- `GET /api/v1/integrations` — plugin metadata and schema.
- `GET /api/v1/integrations/{plugin_id}/schema` — configuration schema.
- `POST /api/v1/integrations/{plugin_id}/test` — stateless connection test (local/dev only; protect from public exposure).
- `GET /api/v1/integrations/instances` — list saved instances without secret values.
- `POST /api/v1/integrations/instances` — create a NetBox instance; encrypts its token.
- `GET /api/v1/integrations/instances/{instance_id}` — get instance metadata.
- `POST /api/v1/integrations/instances/{instance_id}/test` — test saved credentials.
- `POST /api/v1/integrations/instances/{instance_id}/sync` — run bounded sync and return job ID/counters (currently inline, not queued).
- `GET /api/v1/integrations/jobs/{job_id}` — retrieve persisted job status/counters.

Instance update/delete routes, a durable background queue, and full canonical topology projection remain follow-up work before production use. Do not expose the stateless test endpoint on a public deployment without authentication, rate limits, and SSRF protections.

## Install and validate
From `backend/`:
```bash
uv sync --extra dev
uv run pytest
```
The dependency list has changed; regenerate and commit `uv.lock` with the project's pinned uv toolchain before treating the branch as reproducible. Set `DATABASE_URL` to Brian's PostgreSQL database and configure the migration runner before using persistent endpoints. PostgreSQL migration `migrations/0001_integration_tables.sql` is a schema proposal; connect it to the project's chosen migration runner before deployment.

## Adding a plugin
1. Create `src/backend/integrations/<slug>/`.
2. Implement the common contract and a manifest.
3. Map upstream records to normalized DTOs; never persist from plugin code.
4. Register explicitly during app startup.
5. Add config, error redaction, pagination, partial-failure, idempotency and compatibility tests.
6. Add API examples and upstream version matrix entries.
