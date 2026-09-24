from datetime import datetime, timezone
from uuid import uuid4

from .extensions import db


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Device(db.Model):
    __tablename__ = "devices"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(120), nullable=False)
    ip_address = db.Column(db.String(64), nullable=False, unique=True, index=True)
    mac_address = db.Column(db.String(32), unique=True, nullable=True)
    hostname = db.Column(db.String(120), nullable=True)
    device_type = db.Column(db.String(40), nullable=False, default="other")
    location = db.Column(db.String(120), nullable=True)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(24), nullable=False, default="unknown")
    tags = db.Column(db.JSON, nullable=False, default=list)
    metadata_json = db.Column("metadata", db.JSON, nullable=False, default=dict)
    last_scanned_at = db.Column(db.DateTime(timezone=True), nullable=True)
    scan_source = db.Column(db.String(40), nullable=True)
    source_agent_id = db.Column(db.String(36), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class Connection(db.Model):
    __tablename__ = "connections"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    source_device_id = db.Column(db.String(36), nullable=False, index=True)
    target_device_id = db.Column(db.String(36), nullable=False, index=True)
    source_interface = db.Column(db.String(80), nullable=True)
    target_interface = db.Column(db.String(80), nullable=True)
    connection_type = db.Column(db.String(24), nullable=False, default="direct")
    protocol = db.Column(db.String(32), nullable=True)
    port = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(24), nullable=False, default="running")
    latency_ms = db.Column(db.Float, nullable=True)
    bandwidth_mbps = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class Agent(db.Model):
    __tablename__ = "agents"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(120), nullable=False, unique=True)
    ip_address = db.Column(db.String(64), nullable=True)
    system_os = db.Column(db.String(120), nullable=True)
    location = db.Column(db.String(120), nullable=True)
    token_hash = db.Column(db.String(128), nullable=False)
    status = db.Column(db.String(24), nullable=False, default="offline")
    last_heartbeat_at = db.Column(db.DateTime(timezone=True), nullable=True)
    last_scan_at = db.Column(db.DateTime(timezone=True), nullable=True)
    scan_schedule = db.Column(db.String(120), nullable=True)
    scan_targets = db.Column(db.Text, nullable=True)
    scan_type = db.Column(db.String(32), nullable=False, default="network")
    connection_date = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class ScanResult(db.Model):
    __tablename__ = "scan_results"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    scan_source = db.Column(db.String(40), nullable=False)
    agent_id = db.Column(db.String(36), nullable=True)
    raw_data = db.Column(db.JSON, nullable=False, default=dict)
    devices_discovered = db.Column(db.Integer, nullable=False, default=0)
    devices_updated = db.Column(db.Integer, nullable=False, default=0)
    scan_date = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    scan_duration_seconds = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)


class Icon(db.Model):
    __tablename__ = "icons"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(120), nullable=False, unique=True)
    icon_type = db.Column("type", db.String(24), nullable=False, default="custom")
    file_path = db.Column(db.String(255), nullable=False)
    device_type = db.Column(db.String(40), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
