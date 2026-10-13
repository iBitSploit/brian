"""Application service boundary for integration operations."""
from __future__ import annotations

from typing import Any, Mapping

from .base import IntegrationError
from .registry import PluginRegistry


class IntegrationService:
    """Delegates provider work; caller owns persistence, jobs, and audit events."""

    def __init__(self, registry: PluginRegistry):
        self.registry = registry

    def list_plugins(self) -> list[dict[str, Any]]:
        return self.registry.describe()

    def test_connection(self, plugin_id: str, config: Mapping[str, Any]):
        plugin = self.registry.get(plugin_id)
        plugin.validate_config(config)
        return plugin.test_connection(config)

    def sync(self, plugin_id: str, config: Mapping[str, Any], options: Mapping[str, Any] | None = None):
        plugin = self.registry.get(plugin_id)
        plugin.validate_config(config)
        # The returned batch is not persisted here. A future persistence/job service
        # must commit only after a successful complete fetch and record provenance.
        return plugin.sync(config, options)

    def health(self, plugin_id: str) -> dict[str, Any]:
        plugin = self.registry.get(plugin_id)
        return {"id": plugin.metadata.id, "ready": plugin.healthcheck()}
