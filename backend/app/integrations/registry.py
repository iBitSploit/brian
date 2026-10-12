"""Explicit plugin registry. Avoids importing arbitrary modules from user input."""
from __future__ import annotations

from collections.abc import Iterable
from typing import Dict

from .base import IntegrationPlugin


class PluginRegistry:
    def __init__(self) -> None:
        self._plugins: Dict[str, IntegrationPlugin] = {}

    def register(self, plugin: IntegrationPlugin) -> None:
        plugin_id = plugin.metadata.id
        if not plugin_id or plugin_id.lower() != plugin_id:
            raise ValueError("Plugin IDs must be non-empty lowercase identifiers")
        if plugin_id in self._plugins:
            raise ValueError(f"Integration plugin already registered: {plugin_id}")
        self._plugins[plugin_id] = plugin

    def get(self, plugin_id: str) -> IntegrationPlugin:
        try:
            return self._plugins[plugin_id]
        except KeyError as exc:
            raise KeyError(f"Unknown integration plugin: {plugin_id}") from exc

    def all(self) -> Iterable[IntegrationPlugin]:
        return tuple(self._plugins[key] for key in sorted(self._plugins))

    def describe(self) -> list[dict]:
        return [
            {
                "id": plugin.metadata.id,
                "name": plugin.metadata.name,
                "version": plugin.metadata.version,
                "description": plugin.metadata.description,
                "capabilities": list(plugin.metadata.capabilities),
                "config_schema": dict(plugin.metadata.config_schema),
            }
            for plugin in self.all()
        ]


registry = PluginRegistry()
