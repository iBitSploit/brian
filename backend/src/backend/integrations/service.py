"""Shared orchestration boundary. Persistence/jobs are supplied by application services."""
from .registry import PluginRegistry
class IntegrationService:
    def __init__(self, registry: PluginRegistry): self.registry=registry
    def list_plugins(self): return self.registry.describe()
    def test_connection(self, plugin_id, config):
        plugin=self.registry.get(plugin_id); plugin.validate_config(config); return plugin.test_connection(config)
    def sync(self, plugin_id, config, options=None):
        plugin=self.registry.get(plugin_id); plugin.validate_config(config); return plugin.sync(config,options)
    def health(self, plugin_id):
        p=self.registry.get(plugin_id); return {"id":p.metadata.id,"ready":p.healthcheck()}
