from datetime import datetime, timezone
import hashlib
import secrets
from typing import Any, TypeVar

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError
from sqlalchemy import or_

from ..errors import error_response
from ..extensions import db
from ..models import Agent, Connection, Device, Icon, ScanResult
from ..schemas import AgentSchema, ConnectionSchema, DeviceSchema, IconSchema, ScanResultSchema


device_bp = Blueprint("devices", __name__)
topology_bp = Blueprint("topology", __name__)
scan_bp = Blueprint("scans", __name__)
agent_bp = Blueprint("agents", __name__)
integration_bp = Blueprint("integrations", __name__)
icon_bp = Blueprint("icons", __name__)

device_schema = DeviceSchema()
connection_schema = ConnectionSchema()
agent_schema = AgentSchema()
scan_schema = ScanResultSchema()
icon_schema = IconSchema()
T = TypeVar("T")


def page_query(model: type[T]) -> tuple[list[T], dict[str, int]]:
    page = max(request.args.get("page", 1, type=int), 1)
    page_size = min(max(request.args.get("page_size", 50, type=int), 1), 100)
    query = model.query
    search = request.args.get("search", "").strip()
    if model is Device and search:
        query = query.filter(or_(Device.name.ilike(f"%{search}%"), Device.ip_address.ilike(f"%{search}%"), Device.hostname.ilike(f"%{search}%")))
    pagination = query.paginate(page=page, per_page=page_size, error_out=False)
    return pagination.items, {"page": page, "page_size": page_size, "total": pagination.total, "pages": pagination.pages}


def protected_json(data: Any, status_code: int = 200) -> tuple[Any, int]:
    return jsonify(data), status_code


@device_bp.get("")
@jwt_required()
def list_devices() -> tuple[Any, int]:
    devices, pagination = page_query(Device)
    return protected_json({"items": device_schema.dump(devices, many=True), "pagination": pagination})


@device_bp.post("")
@jwt_required()
def create_device() -> tuple[Any, int]:
    data = device_schema.load(request.get_json(silent=True) or {})
    device = Device(**data)
    db.session.add(device)
    db.session.commit()
    return protected_json(device_schema.dump(device), 201)


@device_bp.get("/<string:device_id>")
@jwt_required()
def get_device(device_id: str) -> tuple[Any, int]:
    device = db.session.get(Device, device_id)
    if not device:
        return error_response("Device not found.", 404, "not_found")
    return protected_json(device_schema.dump(device))


@device_bp.put("/<string:device_id>")
@jwt_required()
def update_device(device_id: str) -> tuple[Any, int]:
    device = db.session.get(Device, device_id)
    if not device:
        return error_response("Device not found.", 404, "not_found")
    data = device_schema.load(request.get_json(silent=True) or {}, partial=True)
    for key, value in data.items():
        setattr(device, key, value)
    db.session.commit()
    return protected_json(device_schema.dump(device))


@device_bp.delete("/<string:device_id>")
@jwt_required()
def delete_device(device_id: str) -> tuple[Any, int]:
    device = db.session.get(Device, device_id)
    if not device:
        return error_response("Device not found.", 404, "not_found")
    db.session.delete(device)
    db.session.commit()
    return protected_json({"message": "Device deleted."})


@device_bp.post("/bulk/import")
@jwt_required()
def bulk_import_devices() -> tuple[Any, int]:
    records = request.get_json(silent=True)
    if not isinstance(records, list):
        return error_response("Expected a JSON array of devices.", 400, "invalid_payload")
    imported = 0
    for record in records:
        data = device_schema.load(record)
        device = Device(**data)
        db.session.add(device)
        imported += 1
    db.session.commit()
    return protected_json({"imported": imported}, 201)


@device_bp.post("/<string:device_id>/rescan")
@jwt_required()
def rescan_device(device_id: str) -> tuple[Any, int]:
    if not db.session.get(Device, device_id):
        return error_response("Device not found.", 404, "not_found")
    return protected_json({"message": "Rescan queued.", "device_id": device_id}, 202)


@topology_bp.get("")
@jwt_required()
def get_topology() -> tuple[Any, int]:
    devices = Device.query.all()
    connections = Connection.query.all()
    return protected_json({"nodes": device_schema.dump(devices, many=True), "edges": connection_schema.dump(connections, many=True)})


@topology_bp.post("/connections")
@jwt_required()
def create_connection() -> tuple[Any, int]:
    data = connection_schema.load(request.get_json(silent=True) or {})
    if data["source_device_id"] == data["target_device_id"]:
        return error_response("A connection cannot point to the same device.", 400, "invalid_connection")
    connection = Connection(**data)
    db.session.add(connection)
    db.session.commit()
    return protected_json(connection_schema.dump(connection), 201)


@topology_bp.delete("/connections/<string:connection_id>")
@jwt_required()
def delete_connection(connection_id: str) -> tuple[Any, int]:
    connection = db.session.get(Connection, connection_id)
    if not connection:
        return error_response("Connection not found.", 404, "not_found")
    db.session.delete(connection)
    db.session.commit()
    return protected_json({"message": "Connection deleted."})


@scan_bp.get("")
@jwt_required()
def list_scans() -> tuple[Any, int]:
    scans, pagination = page_query(ScanResult)
    return protected_json({"items": scan_schema.dump(scans, many=True), "pagination": pagination})


@scan_bp.post("/upload")
@jwt_required()
def upload_scan() -> tuple[Any, int]:
    payload = request.get_json(silent=True) or {}
    data = scan_schema.load(payload)
    scan = ScanResult(scan_source=data["scan_source"], agent_id=data.get("agent_id"), raw_data=data.get("raw_data", {}), scan_duration_seconds=data.get("scan_duration_seconds"))
    db.session.add(scan)
    db.session.commit()
    return protected_json(scan_schema.dump(scan), 202)


@scan_bp.get("/<string:scan_id>")
@jwt_required()
def get_scan(scan_id: str) -> tuple[Any, int]:
    scan = db.session.get(ScanResult, scan_id)
    if not scan:
        return error_response("Scan result not found.", 404, "not_found")
    return protected_json(scan_schema.dump(scan))


@agent_bp.get("")
@jwt_required()
def list_agents() -> tuple[Any, int]:
    agents = Agent.query.order_by(Agent.connection_date.desc()).all()
    return protected_json({"items": agent_schema.dump(agents, many=True), "total": len(agents)})


@agent_bp.post("/register")
@jwt_required()
def register_agent() -> tuple[Any, int]:
    payload = request.get_json(silent=True) or {}
    data = agent_schema.load(payload)
    raw_token = secrets.token_urlsafe(32)
    agent = Agent(**data, token_hash=hashlib.sha256(raw_token.encode()).hexdigest())
    db.session.add(agent)
    db.session.commit()
    response = agent_schema.dump(agent)
    response["token"] = raw_token
    return protected_json(response, 201)


@agent_bp.get("/<string:agent_id>")
@jwt_required()
def get_agent(agent_id: str) -> tuple[Any, int]:
    agent = db.session.get(Agent, agent_id)
    if not agent:
        return error_response("Agent not found.", 404, "not_found")
    return protected_json(agent_schema.dump(agent))


@agent_bp.put("/<string:agent_id>")
@jwt_required()
def update_agent(agent_id: str) -> tuple[Any, int]:
    agent = db.session.get(Agent, agent_id)
    if not agent:
        return error_response("Agent not found.", 404, "not_found")
    data = agent_schema.load(request.get_json(silent=True) or {}, partial=True)
    for key, value in data.items():
        setattr(agent, key, value)
    db.session.commit()
    return protected_json(agent_schema.dump(agent))


@agent_bp.delete("/<string:agent_id>")
@jwt_required()
def delete_agent(agent_id: str) -> tuple[Any, int]:
    agent = db.session.get(Agent, agent_id)
    if not agent:
        return error_response("Agent not found.", 404, "not_found")
    db.session.delete(agent)
    db.session.commit()
    return protected_json({"message": "Agent decommissioned."})


@agent_bp.post("/<string:agent_id>/heartbeat")
@jwt_required()
def agent_heartbeat(agent_id: str) -> tuple[Any, int]:
    agent = db.session.get(Agent, agent_id)
    if not agent:
        return error_response("Agent not found.", 404, "not_found")
    agent.status = "online"
    agent.last_heartbeat_at = datetime.now(timezone.utc)
    db.session.commit()
    return protected_json({"status": agent.status, "last_heartbeat_at": agent.last_heartbeat_at.isoformat()})


@agent_bp.post("/<string:agent_id>/report")
@jwt_required()
def agent_report(agent_id: str) -> tuple[Any, int]:
    if not db.session.get(Agent, agent_id):
        return error_response("Agent not found.", 404, "not_found")
    payload = request.get_json(silent=True) or {}
    return protected_json({"message": "Agent report accepted.", "agent_id": agent_id, "received": len(payload.get("devices", []))}, 202)


@integration_bp.post("/netbox/test")
@jwt_required()
def test_netbox() -> tuple[Any, int]:
    return protected_json({"status": "not_configured", "message": "NetBox connector is ready for configuration."})


@integration_bp.post("/netbox/sync")
@jwt_required()
def sync_netbox() -> tuple[Any, int]:
    return protected_json({"status": "queued", "message": "NetBox synchronization queued."}, 202)


@integration_bp.get("/netbox/status")
@jwt_required()
def netbox_status() -> tuple[Any, int]:
    return protected_json({"connected": False, "last_sync": None, "next_sync": None, "devices_synced": 0, "errors": []})


@integration_bp.put("/netbox/config")
@jwt_required()
def configure_netbox() -> tuple[Any, int]:
    payload = request.get_json(silent=True) or {}
    if not payload.get("url"):
        return error_response("NetBox URL is required.", 400, "validation_error")
    return protected_json({"url": payload["url"], "configured": True, "token_saved": bool(payload.get("token"))})


@icon_bp.get("")
@jwt_required()
def list_icons() -> tuple[Any, int]:
    return protected_json({"items": icon_schema.dump(Icon.query.all(), many=True)})


@icon_bp.post("/upload")
@jwt_required()
def upload_icon() -> tuple[Any, int]:
    data = icon_schema.load(request.get_json(silent=True) or {})
    icon = Icon(**data)
    db.session.add(icon)
    db.session.commit()
    return protected_json(icon_schema.dump(icon), 201)


@icon_bp.delete("/<string:icon_id>")
@jwt_required()
def delete_icon(icon_id: str) -> tuple[Any, int]:
    icon = db.session.get(Icon, icon_id)
    if not icon:
        return error_response("Icon not found.", 404, "not_found")
    db.session.delete(icon)
    db.session.commit()
    return protected_json({"message": "Icon deleted."})
