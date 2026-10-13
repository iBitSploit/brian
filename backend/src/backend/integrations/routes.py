"""API routes for generic integration discovery and NetBox operations.

This blueprint/router intentionally exposes no secret values. Instance persistence and
background-job dispatch are injected so the API layer remains testable.
"""
from __future__ import annotations
from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, HttpUrl, SecretStr
from backend.integrations.registry import registry
from backend.integrations.service import IntegrationService
from backend.integrations.base import IntegrationError

router = APIRouter(prefix="/api/v1/integrations", tags=["integrations"])
service = IntegrationService(registry)

class NetBoxConfigInput(BaseModel):
    url: HttpUrl
    token: SecretStr
    verify_tls: bool = True
    timeout_seconds: int = Field(default=15, ge=1, le=120)
    include_interfaces: bool = True
    include_ip_addresses: bool = True
    include_prefixes: bool = True

@router.get("")
def list_integrations():
    return {"items": service.list_plugins()}

@router.get("/{plugin_id}/schema")
def get_schema(plugin_id: str):
    try: p=registry.get(plugin_id)
    except KeyError: raise HTTPException(404, detail={"code":"plugin_not_found","message":"Integration plugin not found"})
    return {"id":p.metadata.id,"name":p.metadata.name,"version":p.metadata.version,
            "capabilities":list(p.metadata.capabilities),"config_schema":dict(p.metadata.config_schema)}

@router.post("/{plugin_id}/test")
def test_integration(plugin_id: str, payload: dict[str, Any]):
    # This stateless test endpoint is for local validation only. Persisted instances
    # should be used in production; never send a stored token back to clients.
    config=dict(payload)
    if isinstance(config.get("token"), dict) and "token" in config["token"]:
        config["token"]=config["token"]["token"]
    try:
        result=service.test_connection(plugin_id,config)
        return {"ok":result.ok,"message":result.message,"external_version":result.external_version,
                "checked_at":result.checked_at.isoformat()}
    except KeyError: raise HTTPException(404,detail={"code":"plugin_not_found","message":"Integration plugin not found"})
    except IntegrationError as exc:
        status=400 if exc.code=="invalid_integration_config" else 502
        raise HTTPException(status,detail={"code":exc.code,"message":str(exc)})
