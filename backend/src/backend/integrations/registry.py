"""Explicit registry: never import a module named by untrusted user input."""
from .base import IntegrationPlugin

class PluginRegistry:
    def __init__(self): self._plugins: dict[str, IntegrationPlugin] = {}
    def register(self, plugin: IntegrationPlugin) -> None:
        key = plugin.metadata.id
        if not key or key != key.lower() or not key.replace("-", "").replace("_", "").isalnum():
            raise ValueError("Plugin IDs must be lowercase slugs")
        if key in self._plugins: raise ValueError(f"Plugin already registered: {key}")
        self._plugins[key] = plugin
    def get(self, key: str) -> IntegrationPlugin:
        if key not in self._plugins: raise KeyError(f"Unknown integration plugin: {key}")
        return self._plugins[key]
    def all(self): return tuple(self._plugins[k] for k in sorted(self._plugins))
    def describe(self):
        return [{"id": p.metadata.id, "name": p.metadata.name, "version": p.metadata.version,
                 "description": p.metadata.description, "capabilities": list(p.metadata.capabilities),
                 "config_schema": dict(p.metadata.config_schema)} for p in self.all()]

registry = PluginRegistry()
