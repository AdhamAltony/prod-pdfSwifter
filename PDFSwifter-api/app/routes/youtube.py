import asyncio
from urllib.parse import urlparse

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.config import YOUTUBE_CONCURRENCY, YOUTUBE_QUEUE_SIZE
from app.downloaders.youtube import YOUTUBE_DOWNLOADER
from app.services.download_tracker import DOWNLOAD_TRACKER

router = APIRouter(prefix="/youtube", tags=["YouTube"])
_YOUTUBE_SEMAPHORE = asyncio.Semaphore(max(YOUTUBE_CONCURRENCY, 1))
_inflight = 0
_inflight_lock = asyncio.Lock()
_max_inflight = max(YOUTUBE_CONCURRENCY, 1) + max(YOUTUBE_QUEUE_SIZE, 0)


async def _reserve_slot() -> bool:
    global _inflight
    async with _inflight_lock:
        if _inflight >= _max_inflight:
            return False
        _inflight += 1
        return True


async def _release_slot() -> None:
    global _inflight
    async with _inflight_lock:
        _inflight = max(_inflight - 1, 0)


def _is_allowed_youtube_url(raw_url: str) -> bool:
    if not raw_url:
        return False
    parsed = urlparse(raw_url)
    if parsed.scheme not in {"http", "https"}:
        return False
    host = (parsed.hostname or "").lower()
    if host in {"youtu.be"}:
        return True
    if host.endswith(".youtube.com") or host == "youtube.com":
        return True
    if host.endswith(".youtube-nocookie.com") or host == "youtube-nocookie.com":
        return True
    return False


async def _extract_url(request: Request) -> str | None:
    # Prefer query param.
    url = request.query_params.get("url")
    if url:
        return url

    content_type = (request.headers.get("content-type") or "").lower()
    if "application/json" in content_type:
        try:
            payload = await request.json()
            if isinstance(payload, dict):
                return payload.get("url")
        except Exception:
            return None

    if "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        try:
            form = await request.form()
            return form.get("url")
        except Exception:
            return None

    return None


@router.post("/download")
async def request_youtube_download(request: Request):
    """Kick off a YouTube download and return a process identifier."""
    url = await _extract_url(request)
    if not url:
        return JSONResponse(
            status_code=400,
            content={"detail": "Missing url parameter."},
        )

    if not _is_allowed_youtube_url(url):
        return JSONResponse(
            status_code=400,
            content={"detail": "Only public YouTube URLs are allowed."},
        )

    if not await _reserve_slot():
        return JSONResponse(
            status_code=429,
            content={
                "detail": "Download queue is full. Please retry in a few minutes."
            },
        )

    job = DOWNLOAD_TRACKER.create_job(source="youtube", url=url)
    DOWNLOAD_TRACKER.update_job(job.process_id, status="queued", progress=0.0)

    async def runner():
        try:
            async with _YOUTUBE_SEMAPHORE:
                DOWNLOAD_TRACKER.update_job(job.process_id, status="running")
                await YOUTUBE_DOWNLOADER.download(url, job.process_id)
        except Exception as exc:
            DOWNLOAD_TRACKER.update_job(
                job.process_id, status="failed", error=str(exc)
            )
        finally:
            await _release_slot()

    asyncio.create_task(runner())
    return {"process_id": job.process_id}
