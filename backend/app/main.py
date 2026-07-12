from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api.routes import (
    auth,
    users,
    accounts,
    categories,
    transactions,
    budgets,
    dashboard,
    periods,
    investments,
    goals,
    imports,
    fx,
)
from app import models  # noqa: F401  ensures models are registered before create_all

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(accounts.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(transactions.router, prefix=settings.API_V1_STR)
app.include_router(budgets.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(periods.router, prefix=settings.API_V1_STR)
app.include_router(investments.router, prefix=settings.API_V1_STR)
app.include_router(goals.router, prefix=settings.API_V1_STR)
app.include_router(imports.router, prefix=settings.API_V1_STR)
app.include_router(fx.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {"status": "ok", "service": settings.PROJECT_NAME}


@app.get("/health")
def health():
    return {"status": "healthy"}
