import asyncio

from backend.plugin_catalog import get_plugin_catalog_entry, list_plugin_catalog


def test_catalog_lists_expected_integrations(monkeypatch):
    monkeypatch.delenv("BRIAN_PLUGIN_CATALOG_URL", raising=False)
    payload = asyncio.run(list_plugin_catalog())
    assert payload["source"] == "built-in-catalog"
    assert {item["name"] for item in payload["plugins"]} == {
        "Wazuh", "Nmap", "NetBox", "ZAP", "GitLab", "Cockpit"
    }
    assert all(item["installed"] is False for item in payload["plugins"])


def test_catalog_entry_lookup(monkeypatch):
    monkeypatch.delenv("BRIAN_PLUGIN_CATALOG_URL", raising=False)
    plugin = asyncio.run(get_plugin_catalog_entry("netbox"))
    assert plugin["name"] == "NetBox"
    assert "inventory" in plugin["capabilities"]
