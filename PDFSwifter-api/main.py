from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.config import ALLOWED_HOSTS, ALLOWED_ORIGINS, ENVIRONMENT
from app.routes.tiktok import router as tiktok_router
from app.routes.instagram import router as instagram_router
from app.routes.downloads import router as downloads_router
from app.routes.pdf import router as pdf_router

is_production = ENVIRONMENT == "production"

app = FastAPI(
    openapi_url=None if is_production else "/openapi.json",
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
)

if ALLOWED_HOSTS:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=ALLOWED_HOSTS)

if ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(tiktok_router)
app.include_router(instagram_router)
app.include_router(downloads_router)
app.include_router(pdf_router)


@app.get("/health", include_in_schema=False)
def health_check():
    return {"status": "ok"}
