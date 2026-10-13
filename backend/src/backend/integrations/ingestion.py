"""Transactional, idempotent provider-object ingestion and conservative stale marking.

This is the provider-neutral staging/provenance layer. Mapping staged objects into
Brian's canonical device/interface/IP models is deliberately delegated to a mapper,
because the current repository has not yet defined those canonical ORM models.
"""
from __future__ import annotations
from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import select
from sqlalchemy.orm import Session
from .base import NormalizedRecord, SyncResult
from .models import IntegrationInstance, IntegrationJob, IntegrationObject

def utcnow(): return datetime.now(timezone.utc)

def ingest_batch(session: Session, instance: IntegrationInstance, job: IntegrationJob,
                 result: SyncResult, *, complete_snapshot: bool) -> dict[str, int]:
    """Upsert source identity and payload in one caller-owned transaction.

    Caller must pass complete_snapshot=True only if all enabled endpoints were read
    without truncation/warnings. Partial results never stale unseen objects.
    """
    if result.provider != instance.plugin_id:
        raise ValueError("Sync provider does not match integration instance")
    if job.instance_id != instance.id:
        raise ValueError("Sync job does not belong to integration instance")
    if job.status not in ("queued", "running"):
        raise ValueError("Only queued/running jobs can be ingested")
    now=utcnow(); created=updated=0; seen=set()
    for record in result.records:
        key=(record.object_type, record.external_id)
        if not record.object_type or not record.external_id:
            raise ValueError("Provider records require object_type and external_id")
        if key in seen:
            # Deterministically skip duplicate identities in the same provider batch.
            continue
        seen.add(key)
        row=session.scalar(select(IntegrationObject).where(
            IntegrationObject.instance_id==instance.id,
            IntegrationObject.object_type==record.object_type,
            IntegrationObject.external_id==record.external_id))
        if row is None:
            row=IntegrationObject(id=str(uuid4()), instance_id=instance.id,
                object_type=record.object_type, external_id=record.external_id,
                payload_json=dict(record.fields), external_url=record.external_url,
                stale=False, last_seen_at=now, last_successful_sync_id=job.id)
            session.add(row); created+=1
        else:
            row.payload_json=dict(record.fields); row.external_url=record.external_url
            row.stale=False; row.last_seen_at=now; row.last_successful_sync_id=job.id
            updated+=1
    if complete_snapshot and not result.warnings:
        # Mark missing records stale only after a complete successful snapshot.
        existing=session.scalars(select(IntegrationObject).where(
            IntegrationObject.instance_id==instance.id)).all()
        for row in existing:
            if (row.object_type,row.external_id) not in seen:
                row.stale=True
    job.status="succeeded"; job.started_at=job.started_at or result.started_at
    job.completed_at=result.completed_at; job.fetched=result.fetched
    job.created=created; job.updated=updated; job.skipped=max(0,result.fetched-created-updated)
    session.flush()
    return {"created":created,"updated":updated,"skipped":job.skipped}
