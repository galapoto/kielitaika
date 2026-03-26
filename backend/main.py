from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import all_routers
from .core.config import SETTINGS
from .middleware.error_handlers import register_error_handlers
from .middleware.request_id import register_request_id_middleware


app = FastAPI(title="KieliTaika API", version=SETTINGS.api_version)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(SETTINGS.cors_allow_origins),
    allow_origin_regex=SETTINGS.cors_allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_request_id_middleware(app)
register_error_handlers(app)
for router in all_routers():
    app.include_router(router)
