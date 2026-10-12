from fastapi import FastAPI
from backend.integrations.netbox import NetBoxPlugin
from backend.integrations.registry import registry
from backend.integrations.routes import router as integrations_router

app = FastAPI(title="Brian API", version="0.2.0")
if "netbox" not in {plugin.metadata.id for plugin in registry.all()}:
    registry.register(NetBoxPlugin())
app.include_router(integrations_router)

@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
