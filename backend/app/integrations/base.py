"""Stable contract shared by all Brian backend integrations.

Plugins return normalized DTOs; they never persist directly to Brian's database.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Protocol, Sequence


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass(frozen=True)
class PluginMetadata:
    id: str
    name: str
    version: str
    description: str
    capabilities: tuple[str, ...] = ("test", "read", "sync")
    config_schema: Mapping[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class NormalizedRecord:
    """Provider-independent record; persistence layer owns canonical model mapping."""
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
    skipped: int = 0
    warnings: tuple[str, ...] = ()


@dataclass(frozen=True)
class ConnectionTestResult:
    ok: bool
    message: str
    external_version: str | None = None
    checked_at: datetime = field(default_factory=utcnow)


class IntegrationError(Exception):
    """Safe base exception. Never include credentials or authorization headers."""

    code = "integration_error"

    def __init__(self, message: str, *, retryable: bool = False) -> None:
        super().__init__(message)
        self.retryable = retryable


class ConfigurationError(IntegrationError):
    code = "invalid_integration_config"


class ConnectionFailure(IntegrationError):
    code = "integration_connection_failed"


class UnsupportedVersion(IntegrationError):
    code = "unsupported_external_version"


class IntegrationPlugin(Protocol):
    """All plugins must implement this interface."""

    @property
    def metadata(self) -> PluginMetadata: ...

    def validate_config(self, config: Mapping[str, Any]) -> None:
        """Raise ConfigurationError for invalid configuration."""
        ...

    def test_connection(self, config: Mapping[str, Any]) -> ConnectionTestResult: ...

    def sync(
        self, config: Mapping[str, Any], options: Mapping[str, Any] | None = None
    ) -> SyncResult:
        """Fetch and normalize records; do not persist them."""
        ...

    def healthcheck(self) -> bool:
        """Return local plugin readiness without making external network calls."""
        ...
