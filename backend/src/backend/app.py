from fastapi import FastAPI
from backend.integrations.netbox import NetBoxPlugin
from backend.integrations.registry import registry
from backend.integrations.routes import router as integrations_router
from backend.integrations.instance_routes import router as integration_instances_router

app = FastAPI(title="Brian API", version="0.3.0")
if "netbox" not in {plugin.metadata.id for plugin in registry.all()}:
    registry.register(NetBoxPlugin())
app.include_router(integrations_router)
app.include_router(integration_instances_router)

@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
