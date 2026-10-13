from backend.integrations.base import PluginMetadata, UnsupportedVersion
from backend.integrations.registry import PluginRegistry
from backend.integrations.netbox.plugin import NetBoxPlugin
import pytest

class Dummy:
    metadata=PluginMetadata("dummy","Dummy","1","test")
    def validate_config(self,c): pass
    def test_connection(self,c): pass
    def sync(self,c,options=None): pass
    def healthcheck(self): return True

def test_registry_registers_and_lists_plugins():
    r=PluginRegistry(); r.register(Dummy())
    assert r.get("dummy").metadata.name == "Dummy"
    assert r.describe()[0]["id"] == "dummy"

def test_registry_rejects_duplicate_ids():
    r=PluginRegistry(); r.register(Dummy())
    with pytest.raises(ValueError): r.register(Dummy())

def test_registry_rejects_uppercase_id():
    class Bad(Dummy): metadata=PluginMetadata("Bad","Bad","1","test")
    with pytest.raises(ValueError): PluginRegistry().register(Bad())

def test_netbox_requires_url_and_token():
    with pytest.raises(Exception): NetBoxPlugin().validate_config({"url":"https://netbox.example"})

def test_netbox_rejects_url_embedded_credentials():
    with pytest.raises(Exception):
        NetBoxPlugin().validate_config({"url":"https://user:pass@netbox.example","token":"token"})

def test_netbox_rejects_unsupported_version(monkeypatch):
    monkeypatch.setenv("BRIAN_NETBOX_MIN_VERSION","4.4.0")
    monkeypatch.setenv("BRIAN_NETBOX_MAX_VERSION","4.6.99")
    with pytest.raises(UnsupportedVersion):
        NetBoxPlugin()._check_version("4.7.0")
