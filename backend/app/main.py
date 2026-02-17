from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routes import incidents, logs

Base.metadata.create_all(bind=engine)


def _cors_origins() -> list[str]:
    if settings.cors_origins.strip() == "*":
        return ["*"]
    return [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router, prefix=settings.api_prefix)
app.include_router(logs.router, prefix=settings.api_prefix)


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name}
