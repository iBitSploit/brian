"""Provider-neutral plugin contract. Plugins never write to Brian persistence directly."""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Protocol, Sequence

@dataclass(frozen=True)
class PluginMetadata:
    id: str
    name: str
    version: str
    description: str
    capabilities: tuple[str, ...] = ("test", "sync")
    config_schema: Mapping[str, Any] = field(default_factory=dict)

@dataclass(frozen=True)
class NormalizedRecord:
    object_type: str
    external_id: str
    fields: Mapping[str, Any]
    external_url: str | None = None
    source_updated_at: datetime | None = None

@dataclass(frozen=True)
class SyncResult:
    provider: str
    external_version: str | None
    started_at: datetime
    completed_at: datetime
    records: Sequence[NormalizedRecord]
    fetched: int
    warnings: tuple[str, ...] = ()

@dataclass(frozen=True)
class ConnectionTestResult:
    ok: bool
    message: str
    external_version: str | None = None
    checked_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

class IntegrationError(Exception):
    code = "integration_error"
    def __init__(self, message: str, retryable: bool = False):
        super().__init__(message)
        self.retryable = retryable

class ConfigurationError(IntegrationError):
    code = "invalid_integration_config"
class ConnectionFailure(IntegrationError):
    code = "integration_connection_failed"
class UnsupportedVersion(IntegrationError):
    code = "unsupported_external_version"

class IntegrationPlugin(Protocol):
    @property
    def metadata(self) -> PluginMetadata: ...
    def validate_config(self, config: Mapping[str, Any]) -> None: ...
    def test_connection(self, config: Mapping[str, Any]) -> ConnectionTestResult: ...
    def sync(self, config: Mapping[str, Any], options: Mapping[str, Any] | None = None) -> SyncResult: ...
    def healthcheck(self) -> bool: ...
