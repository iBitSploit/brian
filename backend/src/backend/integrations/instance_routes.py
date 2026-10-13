"""Persistent integration instance and job endpoints.

Sync currently runs inline (bounded by adapter timeout/record limits); replace the
execution function with a durable worker queue before operating large inventories.
Protect these endpoints with Brian's authentication layer before public deployment.
"""
from __future__ import annotations
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, HttpUrl, SecretStr
from sqlalchemy import select
from backend.integrations.base import IntegrationError
from backend.integrations.db import make_session_factory
from backend.integrations.ingestion import ingest_batch
from backend.integrations.models import IntegrationInstance, IntegrationJob, IntegrationObject
from backend.integrations.registry import registry
from backend.integrations.secrets import encrypt_secret, decrypt_secret, SecretStoreError

router=APIRouter(prefix="/api/v1/integrations",tags=["integration-instances"])

class InstanceCreate(BaseModel):
    name: str = Field(min_length=1,max_length=160)
    url: HttpUrl
    token: SecretStr
    enabled: bool = True
    verify_tls: bool = True
    timeout_seconds: int = Field(default=15,ge=1,le=120)
    include_interfaces: bool = True
    include_ip_addresses: bool = True
    include_prefixes: bool = True

def public_instance(row):
    return {"id":row.id,"plugin_id":row.plugin_id,"name":row.name,"enabled":row.enabled,
            "config":dict(row.config_json),"secret_configured":bool(row.secret_ciphertext),
            "created_at":row.created_at.isoformat(),"updated_at":row.updated_at.isoformat()}

def _config(row):
    return {**row.config_json,"token":decrypt_secret(row.secret_ciphertext)} if row.secret_ciphertext else dict(row.config_json)

@router.get("/instances")
def list_instances():
    try: factory=make_session_factory()
    except RuntimeError as exc: raise HTTPException(503,str(exc))
    with factory() as session:
        return {"items":[public_instance(x) for x in session.scalars(select(IntegrationInstance).order_by(IntegrationInstance.name)).all()]}

@router.post("/instances",status_code=201)
def create_instance(payload: InstanceCreate):
    try: plugin=registry.get("netbox")
    except KeyError: raise HTTPException(404,"NetBox plugin is not registered")
    data=payload.model_dump()
    token=data.pop("token").get_secret_value()
    config={"url":str(data.pop("url")),"verify_tls":data["verify_tls"],
            "timeout_seconds":data["timeout_seconds"],"include_interfaces":data["include_interfaces"],
            "include_ip_addresses":data["include_ip_addresses"],"include_prefixes":data["include_prefixes"]}
    try:
        # Validate against actual plugin contract before persisting.
        plugin.validate_config({**config,"token":token})
        encrypted=encrypt_secret(token)
    except (IntegrationError,SecretStoreError) as exc: raise HTTPException(400,str(exc))
    except ValueError as exc: raise HTTPException(400,str(exc))
    try: factory=make_session_factory()
    except RuntimeError as exc: raise HTTPException(503,str(exc))
    row=IntegrationInstance(id=str(uuid4()),plugin_id="netbox",name=data["name"],
        enabled=data["enabled"],config_json=config,secret_ciphertext=encrypted)
    with factory() as session:
        session.add(row); session.commit(); session.refresh(row)
        return public_instance(row)

@router.get("/instances/{instance_id}")
def get_instance(instance_id: str):
    try: factory=make_session_factory()
    except RuntimeError as exc: raise HTTPException(503,str(exc))
    with factory() as session:
        row=session.get(IntegrationInstance,instance_id)
        if row is None: raise HTTPException(404,"Integration instance not found")
        return public_instance(row)

@router.post("/instances/{instance_id}/test")
def test_instance(instance_id: str):
    try: factory=make_session_factory()
    except RuntimeError as exc: raise HTTPException(503,str(exc))
    with factory() as session:
        row=session.get(IntegrationInstance,instance_id)
        if row is None: raise HTTPException(404,"Integration instance not found")
        try:
            result=registry.get(row.plugin_id).test_connection(_config(row))
            return {"ok":result.ok,"message":result.message,"external_version":result.external_version,
                    "checked_at":result.checked_at.isoformat()}
        except (IntegrationError,SecretStoreError) as exc:
            raise HTTPException(502,{"code":getattr(exc,"code","secret_store_error"),"message":str(exc)})

@router.post("/instances/{instance_id}/sync",status_code=202)
def sync_instance(instance_id: str):
    try: factory=make_session_factory()
    except RuntimeError as exc: raise HTTPException(503,str(exc))
    job_id=str(uuid4())
    with factory() as session:
        row=session.get(IntegrationInstance,instance_id)
        if row is None: raise HTTPException(404,"Integration instance not found")
        if not row.enabled: raise HTTPException(409,"Integration instance is disabled")
        job=IntegrationJob(id=job_id,instance_id=row.id,status="running",started_at=datetime.now(timezone.utc))
        session.add(job); session.commit()
        # Do not hold a DB transaction open while calling the remote API.
        plugin_id=row.plugin_id
        try:
            config=_config(row)
        except SecretStoreError as exc:
            job.status="failed"; job.completed_at=datetime.now(timezone.utc); job.error_code="secret_store_error"; job.error_message=str(exc)
            session.commit(); raise HTTPException(500,str(exc))
    try:
        result=registry.get(plugin_id).sync(config,{"max_records":10000})
        with factory() as session:
            row=session.get(IntegrationInstance,instance_id); job=session.get(IntegrationJob,job_id)
            # Warnings or a record cap mean this is not a complete snapshot.
            stats=ingest_batch(session,row,job,result,complete_snapshot=not result.warnings)
            session.commit()
            return {"job_id":job_id,"status":job.status,"fetched":job.fetched,**stats,"warnings":list(result.warnings)}
    except Exception as exc:
        with factory() as session:
            job=session.get(IntegrationJob,job_id)
            if job:
                job.status="failed"; job.completed_at=datetime.now(timezone.utc)
                job.error_code=getattr(exc,"code","sync_failed")
                job.error_message=str(exc)[:1000]
                session.commit()
        if isinstance(exc,HTTPException): raise
        raise HTTPException(502,{"job_id":job_id,"code":getattr(exc,"code","sync_failed"),
                                 "message":"Integration sync failed; previously stored source objects were retained"})

@router.get("/jobs/{job_id}")
def get_job(job_id: str):
    try: factory=make_session_factory()
    except RuntimeError as exc: raise HTTPException(503,str(exc))
    with factory() as session:
        job=session.get(IntegrationJob,job_id)
        if job is None: raise HTTPException(404,"Integration job not found")
        return {"id":job.id,"instance_id":job.instance_id,"status":job.status,
                "started_at":job.started_at.isoformat() if job.started_at else None,
                "completed_at":job.completed_at.isoformat() if job.completed_at else None,
                "fetched":job.fetched,"created":job.created,"updated":job.updated,
                "skipped":job.skipped,"error_code":job.error_code,"error_message":job.error_message}
