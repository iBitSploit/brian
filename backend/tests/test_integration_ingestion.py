from datetime import datetime, timezone
from types import SimpleNamespace
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from backend.integrations.base import NormalizedRecord, SyncResult
from backend.integrations.models import Base, IntegrationInstance, IntegrationJob, IntegrationObject
from backend.integrations.ingestion import ingest_batch

def setup_db():
    engine=create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    return engine

def test_upsert_is_idempotent_and_records_provenance():
    engine=setup_db()
    with Session(engine) as s:
        instance=IntegrationInstance(id="i1",plugin_id="netbox",name="lab",config_json={})
        job=IntegrationJob(id="j1",instance_id="i1",status="running")
        s.add_all([instance,job]); s.flush()
        result=SyncResult("netbox", "4.5.0", datetime.now(timezone.utc), datetime.now(timezone.utc),
            [NormalizedRecord("device","17",{"name":"edge-1"})],1)
        first=ingest_batch(s,instance,job,result,complete_snapshot=True)
        assert first["created"]==1
        s.commit()
    with Session(engine) as s:
        instance=s.get(IntegrationInstance,"i1")
        job=IntegrationJob(id="j2",instance_id="i1",status="running")
        s.add(job); s.flush()
        result=SyncResult("netbox","4.5.0",datetime.now(timezone.utc),datetime.now(timezone.utc),
            [NormalizedRecord("device","17",{"name":"edge-1-updated"})],1)
        second=ingest_batch(s,instance,job,result,complete_snapshot=True)
        assert second["created"]==0 and second["updated"]==1
        rows=s.scalars(select(IntegrationObject)).all()
        assert len(rows)==1 and rows[0].payload_json["name"]=="edge-1-updated"

def test_partial_sync_never_marks_missing_objects_stale():
    engine=setup_db()
    with Session(engine) as s:
        instance=IntegrationInstance(id="i1",plugin_id="netbox",name="lab",config_json={})
        job=IntegrationJob(id="j1",instance_id="i1",status="running")
        s.add_all([instance,job]); s.flush()
        seed=SyncResult("netbox",None,datetime.now(timezone.utc),datetime.now(timezone.utc),
            [NormalizedRecord("device","1",{"name":"keep"})],1)
        ingest_batch(s,instance,job,seed,complete_snapshot=True); s.commit()
    with Session(engine) as s:
        instance=s.get(IntegrationInstance,"i1")
        job=IntegrationJob(id="j2",instance_id="i1",status="running"); s.add(job); s.flush()
        partial=SyncResult("netbox",None,datetime.now(timezone.utc),datetime.now(timezone.utc),
            [NormalizedRecord("device","2",{"name":"new"})],1,warnings=("record limit reached",))
        ingest_batch(s,instance,job,partial,complete_snapshot=True)
        rows=s.scalars(select(IntegrationObject).order_by(IntegrationObject.external_id)).all()
        assert all(not row.stale for row in rows)
