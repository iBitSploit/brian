# Backend Integration Plugin Contract

Status: proposed implementation contract for Brian backend.

## Goals
- Keep Flask HTTP routes independent from vendor SDKs.
- Make every integration implement the same lifecycle: metadata, configuration validation, connection test, read/sync, health/status.
- Normalize external records into Brian-owned canonical entities before persistence.
- Keep external systems read-only unless a future integration explicitly declares and is approved for write capability.
- Isolate integration failures; existing Brian data remains available when a provider is unavailable.

## Package layout
```
backend/app/integrations/
  __init__.py
  base.py                 # IntegrationPlugin protocol and shared DTOs
  registry.py             # explicit, deterministic plugin registration
  service.py              # orchestration boundary for routes/jobs
  errors.py               # safe public errors
  netbox/
    __init__.py
    plugin.py              # NetBox plugin implementation
    client.py              # pynetbox construction and version checks
    mapper.py              # NetBox records -> canonical import DTOs
    schemas.py             # config and sync options
    manifest.yaml          # machine-readable metadata/capabilities
  tests/
```

## Standard plugin contract
Each plugin has a stable `id` (lowercase slug), display name, plugin version, description, configuration schema, declared capabilities, and supported external-version range. It implements:
- `validate_config(config)` — reject malformed/insecure config before saving.
- `test_connection(config)` — verify auth and connectivity; return sanitized status.
- `get_status(config, persisted_state)` — report enabled/connected/last success/last error.
- `sync(config, options)` — fetch, normalize, and return a batch of canonical records and counters; it must not write to Brian's database directly.
- `healthcheck()` — cheap local readiness check, not a network sync.

The integration service owns persistence, transactions, provenance, job records, audit events, retries, and public API responses. Plugin exceptions are translated into typed safe errors; tokens and raw authorization headers must never be returned or logged.

## Canonical output
A sync result contains `provider`, `external_version`, `started_at`, `completed_at`, `records`, and counts (`fetched`, `created`, `updated`, `skipped`, `failed`). Each record includes provider object type, external ID, stable external URL when available, normalized fields, and source timestamp. The service performs idempotent upserts keyed by `(integration_id, object_type, external_id)`; IP address alone must not be the integration identity.

## NetBox implementation
- Use `pynetbox` only inside the NetBox adapter package.
- Initial supported scope: DCIM devices, sites, device roles/types, interfaces, IPAM IP addresses, and prefixes where useful to topology.
- Use GET/read-only requests only. No create/update/delete calls.
- Support explicit endpoint selection and pagination; handle optional fields defensively.
- Store NetBox token using Brian's secret provider/environment in development; public API returns only a configured boolean and masked summary, never the token.
- Test connection by reading API version/status and a minimal read endpoint.
- Verify NetBox API version against the pinned pynetbox compatibility matrix. Treat API-version headers as primary and don't infer compatibility from server labels.
- Failed/partial sync must not delete previously imported records. Missing objects only become candidates for stale marking after a successful complete sync and a separate retention policy.
- Make sync idempotent, bounded by timeouts, and suitable for background jobs.

## Version policy
The current pynetbox compatibility matrix lists pynetbox 7.9.0 tested with NetBox 4.5–4.7 and requires Python 3.12+. Pin an exact pynetbox version rather than an open-ended dependency. Use 7.9.0 only if Brian's backend runtime is Python 3.12+ and the supported NetBox target is 4.5–4.7; otherwise choose the matching older pynetbox release and document the corresponding NetBox range. Do not claim one pynetbox version supports every NetBox release.

Reference: https://github.com/netbox-community/pynetbox and https://netbox-community.github.io/pynetbox/

## Proposed API
- `GET /api/v1/integrations` — installed plugin metadata and instance status.
- `GET /api/v1/integrations/<id>/schema` — safe configuration schema/capabilities.
- `GET /api/v1/integrations/<id>/instances` — configured instances (secret values omitted).
- `POST /api/v1/integrations/<id>/instances` — validate and create config.
- `PATCH /api/v1/integrations/<id>/instances/<instance_id>` — update config.
- `POST /api/v1/integrations/<id>/instances/<instance_id>/test` — test connection.
- `POST /api/v1/integrations/<id>/instances/<instance_id>/sync` — enqueue sync, return 202/job ID.
- `GET /api/v1/integration-jobs/<job_id>` — job status and counters.
- `GET /api/v1/integrations/<id>/instances/<instance_id>/status` — health and last sync.
- `DELETE /api/v1/integrations/<id>/instances/<instance_id>` — disable/disconnect; imported data is retained by default.

Legacy NetBox-specific endpoints may be kept as compatibility aliases, but they should delegate to this generic service.

## Security and reliability requirements
- HTTPS required outside explicitly enabled local development.
- Reject URLs with embedded credentials; restrict localhost/private targets only by explicit deployment policy, and defend against SSRF by validating destinations and rechecking redirects.
- Set connect/read timeouts; cap page/record counts and sync duration.
- Redact secrets from logs, exceptions, config diffs, and API output.
- Use least-privilege NetBox read-only token.
- Never delete existing canonical records because a provider timed out, returned partial results, or was disabled.
- Use a job/transaction boundary so a failed sync does not partially replace the last known-good snapshot.
- Include unit tests with fake plugin and mocked pynetbox records; integration tests against supported NetBox versions are opt-in.

## Adding a future plugin
1. Add a package under `app/integrations/<slug>/`.
2. Implement the shared contract and declare its manifest.
3. Map provider data into canonical DTOs; do not write ORM models from plugin code.
4. Register explicitly in the application factory.
5. Add config, error, pagination, partial-failure, idempotency, and security tests.
6. Document supported upstream versions and add API/schema examples.
