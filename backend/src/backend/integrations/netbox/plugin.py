"""Read-only NetBox adapter using pynetbox; no direct database writes."""
from __future__ import annotations
import os
from datetime import datetime, timezone
from typing import Any, Mapping
from urllib.parse import urlparse
from ..base import (ConfigurationError, ConnectionFailure, ConnectionTestResult,
                    NormalizedRecord, PluginMetadata, SyncResult, UnsupportedVersion)
try:
    import pynetbox
except ImportError:
    pynetbox = None

class NetBoxPlugin:
    metadata = PluginMetadata(
        id="netbox", name="NetBox", version="1.0.0",
        description="Read-only NetBox DCIM/IPAM synchronization.",
        capabilities=("test", "read", "sync", "health"),
        config_schema={"type":"object","required":["url","token"],"additionalProperties":False,
          "properties":{"url":{"type":"string","format":"uri"},"token":{"type":"string","writeOnly":True},
            "verify_tls":{"type":"boolean","default":True},"timeout_seconds":{"type":"integer","minimum":1,"maximum":120},
            "include_interfaces":{"type":"boolean","default":True},"include_ip_addresses":{"type":"boolean","default":True},
            "include_prefixes":{"type":"boolean","default":True}}})
    def healthcheck(self) -> bool: return pynetbox is not None
    def validate_config(self, config: Mapping[str, Any]) -> None:
        if pynetbox is None: raise ConfigurationError("pynetbox dependency is not installed")
        url, token = config.get("url"), config.get("token")
        if not isinstance(url,str) or not isinstance(token,str) or not token.strip(): raise ConfigurationError("NetBox URL and token are required")
        u=urlparse(url)
        if u.scheme not in ("https","http") or not u.hostname or u.username or u.password or u.query or u.fragment:
            raise ConfigurationError("NetBox URL must be absolute HTTP(S), without credentials, query or fragment")
        if u.scheme != "https" and os.getenv("BRIAN_ALLOW_INSECURE_INTEGRATIONS") != "1":
            raise ConfigurationError("HTTP is disabled unless BRIAN_ALLOW_INSECURE_INTEGRATIONS=1")
        timeout=config.get("timeout_seconds",15)
        if not isinstance(timeout,int) or not 1 <= timeout <= 120: raise ConfigurationError("timeout_seconds must be 1..120")
        if config.get("verify_tls",True) is False and os.getenv("BRIAN_ALLOW_INSECURE_INTEGRATIONS") != "1":
            raise ConfigurationError("TLS verification can only be disabled by explicit deployment policy")
    def _api(self, config):
        self.validate_config(config)
        api=pynetbox.api(config["url"].rstrip("/"), token=config["token"])
        api.http_session.verify=config.get("verify_tls",True)
        api.http_session.headers.update({"User-Agent":"Brian-Integration/netbox"})
        return api
    @staticmethod
    def _version(api):
        try:
            v=getattr(api,"version",None)
            if callable(v): v=v()
            return str(v) if v else None
        except Exception: return None
    @staticmethod
    def _version_tuple(v):
        try: return tuple(int(p) for p in v.split(".")[:3])
        except (ValueError,AttributeError): return None
    def _check_version(self, version):
        low=os.getenv("BRIAN_NETBOX_MIN_VERSION"); high=os.getenv("BRIAN_NETBOX_MAX_VERSION")
        if low and high:
            v,l,h=map(self._version_tuple,(version,low,high))
            if not v or not l or not h or not l <= v <= h:
                raise UnsupportedVersion(f"NetBox version {version or 'unknown'} is outside configured range {low}..{high}")
    def test_connection(self, config: Mapping[str, Any]) -> ConnectionTestResult:
        api=self._api(config)
        try:
            api.dcim.sites.count()
            version=self._version(api); self._check_version(version)
            return ConnectionTestResult(True,"NetBox connection successful",version)
        except (ConfigurationError,UnsupportedVersion): raise
        except Exception as exc: raise ConnectionFailure(f"NetBox connection failed ({type(exc).__name__})",True) from None
    @staticmethod
    def _field(obj, key):
        v=getattr(obj,key,None)
        if hasattr(v,"serialize"):
            try: return v.serialize()
            except Exception: return str(v)
        if v is None or isinstance(v,(str,int,float,bool,dict,list)): return v
        return str(v)
    def sync(self, config: Mapping[str, Any], options: Mapping[str, Any] | None = None) -> SyncResult:
        api=self._api(config); options=options or {}; started=datetime.now(timezone.utc)
        maximum=options.get("max_records",10000)
        if not isinstance(maximum,int) or not 1 <= maximum <= 100000: raise ConfigurationError("max_records must be 1..100000")
        records=[]; warnings=[]; version=self._version(api)
        try:
            self._check_version(version)
            endpoints=[("device",api.dcim.devices,("name","status","serial","asset_tag","site","role","device_type","primary_ip4","primary_ip6"))]
            if config.get("include_interfaces",True): endpoints.append(("interface",api.dcim.interfaces,("name","device","enabled","type","mac_address")))
            if config.get("include_ip_addresses",True): endpoints.append(("ip_address",api.ipam.ip_addresses,("address","status","dns_name","assigned_object")))
            if config.get("include_prefixes",True): endpoints.append(("prefix",api.ipam.prefixes,("prefix","status","description","site","vrf")))
            for kind,endpoint,fields in endpoints:
                for obj in endpoint.all():
                    if len(records)>=maximum:
                        warnings.append("Record limit reached; result is not a complete snapshot"); break
                    external_id=getattr(obj,"id",None)
                    if external_id is None: warnings.append(f"Skipped {kind} without external ID"); continue
                    records.append(NormalizedRecord(kind,str(external_id),{**{f:self._field(obj,f) for f in fields},"source":"netbox"},getattr(obj,"url",None)))
                if len(records)>=maximum: break
            return SyncResult("netbox",version,started,datetime.now(timezone.utc),tuple(records),len(records),tuple(warnings))
        except (ConfigurationError,UnsupportedVersion): raise
        except Exception as exc: raise ConnectionFailure(f"NetBox sync failed ({type(exc).__name__}); no Brian records were changed",True) from None
