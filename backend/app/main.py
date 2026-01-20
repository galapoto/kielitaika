from fastapi import FastAPI
from app.routers import (
    admin,
    auth,
    engagement,
    grammar,
    personalization,
    payments,
    progressive_disclosure,
    shadowing,
    output,
    recharge,
    session,
    subscription,
    users,
    voice,
    vocab,
    workplace,
    yki,
    conversation_socket,
)
from app.db.models import Base
from app.db.database import engine

app = FastAPI(title="RUKA API")

app.include_router(auth.router, tags=["auth"])
app.include_router(payments.router, tags=["payments"])
app.include_router(voice.router, prefix="/voice", tags=["voice"])
app.include_router(session.router, prefix="/session", tags=["session"])
app.include_router(grammar.router, prefix="/grammar", tags=["grammar"])
app.include_router(yki.router, prefix="/yki", tags=["yki"])
app.include_router(subscription.router, prefix="/subscription", tags=["subscription"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(progressive_disclosure.router, prefix="/progressive-disclosure", tags=["progressive-disclosure"])
app.include_router(workplace.router, prefix="/workplace", tags=["workplace"])
app.include_router(vocab.router, prefix="/vocab", tags=["vocab"])
app.include_router(personalization.router, prefix="/personalization", tags=["personalization"])
app.include_router(recharge.router, prefix="/recharge", tags=["recharge"])
app.include_router(output.router, prefix="/output", tags=["output"])
app.include_router(shadowing.router, prefix="/shadowing", tags=["shadowing"])
app.include_router(engagement.router, prefix="/engagement", tags=["engagement"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(conversation_socket.router, tags=["conversation-socket"])


@app.get("/")
async def root():
    return {"message": "RUKA backend running"}


@app.on_event("startup")
async def on_startup():
    """Create tables on startup (dev convenience, replace with migrations in prod)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
