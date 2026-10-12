"""NetBox read-only integration implemented through pynetbox.

Only this adapter imports pynetbox. Sync returns normalized DTOs and never writes
to Brian persistence directly. Provider-specific mapping can be extended safely.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Mapping
from urllib.parse import urlparse

from ..base import (
    ConfigurationError,
    ConnectionFailure,
    ConnectionTestResult,
    NormalizedRecord,
    PluginMetadata,
    SyncResult,
    UnsupportedVersion,
)

try:
    import pynetbox
except ImportError:  # Allows app startup when optional integration extra is absent.
    pynetbox = None


class NetBoxPlugin:
    metadata = PluginMetadata(
        id="netbox",
        name="NetBox",
        version="1.0.0",
        description="Read-only DCIM/IPAM inventory synchronization from NetBox.",
        capabilities=("test", "read", "sync", "health"),
        config_schema={
            "type": "object",
            "required": ["url", "token"],
            "properties": {
                "url": {"type": "string", "format": "uri", "description": "NetBox base URL"},
                "token": {"type": "string", "writeOnly": True},
                "verify_tls": {"type": "boolean", "default": True},
                "timeout_seconds": {"type": "integer", "minimum": 1, "maximum": 120, "default": 15},
                "include_interfaces": {"type": "boolean", "default": True},
                "include_ip_addresses": {"type": "boolean", "default": True},
                "include_prefixes": {"type": "boolean", "default": True},
            },
            "additionalProperties": False,
        },
    )

    def healthcheck(self) -> bool:
        return pynetbox is not None

    def validate_config(self, config: Mapping[str, Any]) -> None:
        if pynetbox is None:
            raise ConfigurationError("NetBox integration dependency is not installed")
        url = config.get("url")
        token = config.get("token")
        if not isinstance(url, str) or not isinstance(token, str) or not token.strip():
            raise ConfigurationError("NetBox URL and token are required")
        parsed = urlparse(url)
        if parsed.scheme not in ("https", "http") or not parsed.hostname:
            raise ConfigurationError("NetBox URL must be an absolute HTTP(S) URL")
        if parsed.username or parsed.password:
            raise ConfigurationError("Credentials must not be embedded in the NetBox URL")
        if parsed.query or parsed.fragment:
            raise ConfigurationError("NetBox URL must not contain a query string or fragment")
        timeout = config.get("timeout_seconds", 15)
        if not isinstance(timeout, int) or not 1 <= timeout <= 120:
            raise ConfigurationError("timeout_seconds must be between 1 and 120")
        if config.get("verify_tls", True) is False and os.getenv("BRIAN_ALLOW_INSECURE_INTEGRATIONS") != "1":
            raise ConfigurationError("TLS verification can only be disabled when explicitly allowed by deployment config")

    def _api(self, config: Mapping[str, Any]):
        self.validate_config(config)
        # pynetbox passes session options through requests. Use read timeout and TLS
        # verification; never disable TLS verification implicitly.
        api = pynetbox.api(
            config["url"].rstrip("/"),
            token=config["token"],
        )
        api.http_session.verify = config.get("verify_tls", True)
        api.http_session.headers.update({"User-Agent": "Brian-Integration/netbox"})
        api.http_session.timeout = config.get("timeout_seconds", 15)
        return api

    @staticmethod
    def _version(api) -> str | None:
        try:
            version = getattr(api, "version", None)
            if callable(version):
                version = version()
            return str(version) if version else None
        except Exception:
            return None

    def test_connection(self, config: Mapping[str, Any]) -> ConnectionTestResult:
        api = self._api(config)
        try:
            # Read one object at most; no writes.
            api.dcim.sites.count()
            version = self._version(api)
            self._validate_version(version)
            return ConnectionTestResult(ok=True, message="NetBox connection successful", external_version=version)
        except (ConfigurationError, UnsupportedVersion):
            raise
        except Exception as exc:
            # Do not expose request headers, URLs with secrets, or raw response bodies.
            raise ConnectionFailure(f"Could not connect to NetBox ({type(exc).__name__})", retryable=True) from None

    @staticmethod
    def _validate_version(version: str | None) -> None:
        """Enforce the deployment's declared compatibility range when configured.

        Set BRIAN_NETBOX_MIN_VERSION and BRIAN_NETBOX_MAX_VERSION to the validated
        deployment range. Avoid guessing compatibility when no matrix is configured.
        """
        minimum = os.getenv("BRIAN_NETBOX_MIN_VERSION")
        maximum = os.getenv("BRIAN_NETBOX_MAX_VERSION")
        if not version or not minimum or not maximum:
            return
        def parts(value: str) -> tuple[int, ...]:
            return tuple(int(p) for p in value.split(".")[:3] if p.isdigit())
        current, low, high = parts(version), parts(minimum), parts(maximum)
        if current and low and high and not (low <= current <= high):
            raise UnsupportedVersion(
                f"NetBox version {version} is outside the configured supported range {minimum}–{maximum}"
            )

    @staticmethod
    def _value(obj: Any, key: str, default=None):
        value = getattr(obj, key, default)
        if hasattr(value, "serialize"):
            try:
                return value.serialize()
            except Exception:
                return str(value)
        if isinstance(value, (str, int, float, bool)) or value is None:
            return value
        if isinstance(value, dict):
            return value
        return str(value)

    def sync(self, config: Mapping[str, Any], options: Mapping[str, Any] | None = None) -> SyncResult:
        api = self._api(config)
        options = options or {}
        started = datetime.now(timezone.utc)
        records: list[NormalizedRecord] = []
        fetched = 0
        warnings: list[str] = []
        try:
            version = self._version(api)
            self._validate_version(version)
            limit = options.get("max_records", 10000)
            if not isinstance(limit, int) or not 1 <= limit <= 100000:
                raise ConfigurationError("max_records must be between 1 and 100000")

            def add_records(endpoint, object_type: str, mapper, remaining: int) -> int:
                count = 0
                # pynetbox's RecordSet supports page_size; iteration paginates.
                for item in endpoint.all():
                    if count >= remaining:
                        warnings.append(f"{object_type} record limit reached")
                        break
                    external_id = getattr(item, "id", None)
                    if external_id is None:
                        warnings.append(f"Skipped {object_type} record without an ID")
                        continue
                    records.append(NormalizedRecord(
                        object_type=object_type,
                        external_id=str(external_id),
                        external_url=getattr(item, "url", None),
                        fields=mapper(item),
                        source_updated_at=None,
                    ))
                    count += 1
                return count

            fetched += add_records(api.dcim.devices, "device", lambda x: {
                "name": self._value(x, "name"),
                "status": self._value(x, "status"),
                "serial": self._value(x, "serial"),
                "asset_tag": self._value(x, "asset_tag"),
                "site": self._value(x, "site"),
                "role": self._value(x, "role"),
                "device_type": self._value(x, "device_type"),
                "primary_ip4": self._value(x, "primary_ip4"),
                "primary_ip6": self._value(x, "primary_ip6"),
                "source": "netbox",
            }, limit - fetched)

            if config.get("include_interfaces", True) and fetched < limit:
                fetched += add_records(api.dcim.interfaces, "interface", lambda x: {
                    "name": self._value(x, "name"),
                    "device": self._value(x, "device"),
                    "enabled": self._value(x, "enabled"),
                    "type": self._value(x, "type"),
                    "mac_address": self._value(x, "mac_address"),
                    "source": "netbox",
                }, limit - fetched)

            if config.get("include_ip_addresses", True) and fetched < limit:
                fetched += add_records(api.ipam.ip_addresses, "ip_address", lambda x: {
                    "address": self._value(x, "address"),
                    "status": self._value(x, "status"),
                    "dns_name": self._value(x, "dns_name"),
                    "assigned_object": self._value(x, "assigned_object"),
                    "source": "netbox",
                }, limit - fetched)

            if config.get("include_prefixes", True) and fetched < limit:
                fetched += add_records(api.ipam.prefixes, "prefix", lambda x: {
                    "prefix": self._value(x, "prefix"),
                    "status": self._value(x, "status"),
                    "description": self._value(x, "description"),
                    "site": self._value(x, "site"),
                    "vrf": self._value(x, "vrf"),
                    "source": "netbox",
                }, limit - fetched)

            return SyncResult(
                provider="netbox",
                external_version=version,
                started_at=started,
                completed_at=datetime.now(timezone.utc),
                records=records,
                fetched=fetched,
                warnings=tuple(warnings),
            )
        except (ConfigurationError, UnsupportedVersion):
            raise
        except Exception as exc:
            raise ConnectionFailure(
                f"NetBox synchronization failed ({type(exc).__name__}); previous Brian data was not modified",
                retryable=True,
            ) from None
