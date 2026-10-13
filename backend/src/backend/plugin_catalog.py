"""Central plugin catalog metadata and API.

Catalog entries describe externally distributed plugins; they are not bundled plugin
implementations. Package installation is handled by the separately managed catalog
service and is deliberately not performed by importing arbitrary Python modules here.
"""
from __future__ import annotations

import os
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/plugins", tags=["plugin-catalog"])

# Catalog metadata only. These are real integration products, not executable or
# mock plugin implementations. The actual plugin packages live in a separate repo.
BUILTIN_CATALOG: tuple[dict[str, Any], ...] = (
    {
        "id": "wazuh",
        "name": "Wazuh",
        "category": "Security",
        "description": "Security monitoring, endpoint telemetry, and alert visibility.",
        "icon": "shield-check",
        "capabilities": ["security-monitoring", "alerts"],
        "repository": "https://github.com/wazuh/wazuh",
    },
    {
        "id": "nmap",
        "name": "Nmap",
        "category": "Networking",
        "description": "Network discovery, host detection, and port-scan results.",
        "icon": "network",
        "capabilities": ["network-discovery", "scan-ingestion"],
        "repository": "https://github.com/nmap/nmap",
    },
    {
        "id": "netbox",
        "name": "NetBox",
        "category": "Networking",
        "description": "Infrastructure inventory, IP address management, and topology data.",
        "icon": "server",
        "capabilities": ["inventory", "ipam", "topology"],
        "repository": "https://github.com/netbox-community/netbox",
    },
    {
        "id": "zap",
        "name": "ZAP",
        "category": "Security",
        "description": "Web application security scanning and findings.",
        "icon": "bug",
        "capabilities": ["web-security", "findings"],
        "repository": "https://github.com/zaproxy/zaproxy",
    },
    {
        "id": "gitlab",
        "name": "GitLab",
        "category": "Development",
        "description": "Repositories, CI/CD pipelines, projects, and deployment status.",
        "icon": "git-branch",
        "capabilities": ["repositories", "ci-cd"],
        "repository": "https://gitlab.com/gitlab-org/gitlab",
    },
    {
        "id": "cockpit",
        "name": "Cockpit",
        "category": "Infrastructure",
        "description": "Linux server health, system metrics, and host administration.",
        "icon": "monitor-cog",
        "capabilities": ["host-management", "health"],
        "repository": "https://github.com/cockpit-project/cockpit",
    },
)


def _public_entry(entry: dict[str, Any]) -> dict[str, Any]:
    return {**entry, "installed": False, "status": "available"}


@router.get("/catalog")
async def list_plugin_catalog() -> dict[str, Any]:
    """Return catalog cards, optionally sourced from a central catalog service.

    BRIAN_PLUGIN_CATALOG_URL must point to a trusted HTTPS JSON endpoint returning
    {"plugins": [...]} with metadata compatible with the built-in catalog schema.
    """
    catalog_url = os.getenv("BRIAN_PLUGIN_CATALOG_URL", "").strip()
    if not catalog_url:
        return {"source": "built-in-catalog", "plugins": [_public_entry(p) for p in BUILTIN_CATALOG]}

    if not catalog_url.startswith("https://"):
        raise HTTPException(status_code=503, detail="The configured plugin catalog must use HTTPS")

    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=False) as client:
            response = await client.get(catalog_url, headers={"Accept": "application/json"})
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError):
        raise HTTPException(status_code=503, detail="The central plugin catalog is temporarily unavailable") from None

    entries = payload.get("plugins") if isinstance(payload, dict) else None
    if not isinstance(entries, list):
        raise HTTPException(status_code=503, detail="The central catalog returned an invalid response")

    safe_entries: list[dict[str, Any]] = []
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        plugin_id, name, description = entry.get("id"), entry.get("name"), entry.get("description")
        if not all(isinstance(value, str) and value.strip() for value in (plugin_id, name, description)):
            continue
        safe_entries.append({
            "id": plugin_id,
            "name": name,
            "description": description,
            "category": entry.get("category", "Other"),
            "icon": entry.get("icon", "blocks"),
            "capabilities": entry.get("capabilities", []),
            "repository": entry.get("repository"),
            "version": entry.get("version"),
            "installed": False,
            "status": "available",
        })
    return {"source": "central-catalog", "plugins": safe_entries}


@router.get("/catalog/{plugin_id}")
async def get_plugin_catalog_entry(plugin_id: str) -> dict[str, Any]:
    catalog = await list_plugin_catalog()
    for plugin in catalog["plugins"]:
        if plugin["id"] == plugin_id:
            return plugin
    raise HTTPException(status_code=404, detail="Plugin not found in the catalog")


@router.post("/{plugin_id}/install", status_code=501)
async def install_plugin(plugin_id: str) -> dict[str, str]:
    """Explicitly unavailable until package signature verification is implemented."""
    catalog = await list_plugin_catalog()
    if not any(plugin["id"] == plugin_id for plugin in catalog["plugins"]):
        raise HTTPException(status_code=404, detail="Plugin not found in the catalog")
    raise HTTPException(
        status_code=501,
        detail="Central package installation is not enabled yet; signed package verification and isolated installation are required.",
    )
