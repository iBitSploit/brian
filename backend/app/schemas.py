from marshmallow import EXCLUDE, Schema, fields, validate


class DeviceSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Str(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    ip_address = fields.Str(required=True)
    mac_address = fields.Str(allow_none=True)
    hostname = fields.Str(allow_none=True)
    device_type = fields.Str(load_default="other")
    location = fields.Str(allow_none=True)
    description = fields.Str(allow_none=True)
    status = fields.Str(load_default="unknown")
    tags = fields.List(fields.Str(), load_default=list)
    metadata = fields.Dict(attribute="metadata_json", data_key="metadata", load_default=dict)
    last_scanned_at = fields.DateTime(allow_none=True)
    scan_source = fields.Str(allow_none=True)
    source_agent_id = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ConnectionSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Str(dump_only=True)
    source_device_id = fields.Str(required=True)
    target_device_id = fields.Str(required=True)
    source_interface = fields.Str(allow_none=True)
    target_interface = fields.Str(allow_none=True)
    connection_type = fields.Str(load_default="direct")
    protocol = fields.Str(allow_none=True)
    port = fields.Integer(allow_none=True)
    status = fields.Str(load_default="running")
    latency_ms = fields.Float(allow_none=True)
    bandwidth_mbps = fields.Float(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class AgentSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Str(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    ip_address = fields.Str(allow_none=True)
    system_os = fields.Str(allow_none=True)
    location = fields.Str(allow_none=True)
    status = fields.Str(load_default="offline")
    last_heartbeat_at = fields.DateTime(dump_only=True, allow_none=True)
    last_scan_at = fields.DateTime(dump_only=True, allow_none=True)
    scan_schedule = fields.Str(allow_none=True)
    scan_targets = fields.Str(allow_none=True)
    scan_type = fields.Str(load_default="network")
    connection_date = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ScanResultSchema(Schema):
    id = fields.Str(dump_only=True)
    scan_source = fields.Str(required=True)
    agent_id = fields.Str(allow_none=True)
    raw_data = fields.Dict(load_default=dict)
    devices_discovered = fields.Integer(dump_only=True)
    devices_updated = fields.Integer(dump_only=True)
    scan_date = fields.DateTime(dump_only=True)
    scan_duration_seconds = fields.Integer(allow_none=True)
    created_at = fields.DateTime(dump_only=True)


class IconSchema(Schema):
    id = fields.Str(dump_only=True)
    name = fields.Str(required=True)
    type = fields.Str(load_default="custom", data_key="type", attribute="icon_type")
    file_path = fields.Str(required=True)
    device_type = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
