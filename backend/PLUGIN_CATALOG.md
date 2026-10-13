# Brian Plugin Catalog

Brian's **Plugins** page is a catalog browser for separately distributed extensions. Plugin implementation packages are not bundled into the Brian frontend or backend.

## Catalog API

- `GET /api/plugins/catalog` returns the available catalog entries.
- `GET /api/plugins/catalog/{plugin_id}` returns one entry.
- `POST /api/plugins/{plugin_id}/install` is reserved for central installation and currently returns HTTP 501. It will not download or execute a package until package integrity verification and an isolated installation lifecycle are implemented.

The initial metadata-only catalog lists Wazuh, Nmap, NetBox, ZAP, GitLab, and Cockpit. These are catalog listings only; no corresponding Brian plugin package is included or installed.

## Use a central catalog service

Set `BRIAN_PLUGIN_CATALOG_URL` to the HTTPS URL of a trusted JSON endpoint. The endpoint must return a JSON object containing a `plugins` array. Each entry must include non-empty `id`, `name`, and `description` strings. Optional fields include `category`, `icon`, `capabilities`, `repository`, and `version`.

Example shape:

```json
{
  "plugins": [
    {
      "id": "example-connector",
      "name": "Example Connector",
      "description": "An example integration.",
      "category": "Networking",
      "icon": "blocks",
      "capabilities": ["inventory"],
      "version": "1.0.0",
      "repository": "https://github.com/example/example-connector"
    }
  ]
}
```

The catalog URL is deployment configuration, not user input. Use a trusted host, restrict outbound traffic at the network layer, and do not expose the catalog proxy to untrusted users. The current implementation requires HTTPS, uses a short request timeout, and does not follow redirects.

## Installation is intentionally not enabled yet

The UI offers the intended central-install workflow, but the backend rejects installation requests until these controls exist:

1. A trusted package URL tied to a catalog release.
2. Cryptographic signature verification and a pinned trust policy.
3. Archive path traversal and size checks.
4. Dependency and permission review.
5. Atomic installation, rollback, and lifecycle management.
6. Isolation of third-party code from the core API process.

Do not treat catalog visibility as trust or installation approval. Plugin packages will live in a separate repository and must be distributed independently from Brian core.
