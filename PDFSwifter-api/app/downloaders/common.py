import os
from typing import Callable, Dict, Optional

import yt_dlp
from yt_dlp.utils import DownloadError

from app.config import (
    YOUTUBE_CONCURRENT_FRAGMENT_DOWNLOADS,
    YOUTUBE_EXTRACTOR_RETRIES,
    YOUTUBE_FRAGMENT_RETRIES,
    YOUTUBE_MAX_FILESIZE_MB,
    YOUTUBE_MAX_RETRIES,
    YOUTUBE_SOCKET_TIMEOUT_SECONDS,
    YOUTUBE_SOURCE_ADDRESS,
)


def download_video(
    url: str,
    output_template: str,
    custom_options: Optional[Dict] = None,
    progress_callback: Optional[Callable[[Dict], None]] = None,
) -> str:
    """Download remote video content to disk and return the resulting filename."""
    ydl_opts = {
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]",
        "outtmpl": output_template,
        "merge_output_format": "mp4",
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "retries": YOUTUBE_MAX_RETRIES,
        "fragment_retries": YOUTUBE_FRAGMENT_RETRIES,
        "extractor_retries": YOUTUBE_EXTRACTOR_RETRIES,
        "socket_timeout": YOUTUBE_SOCKET_TIMEOUT_SECONDS,
        "source_address": YOUTUBE_SOURCE_ADDRESS,
        "concurrent_fragment_downloads": YOUTUBE_CONCURRENT_FRAGMENT_DOWNLOADS,
        "geo_bypass": True,
        "continuedl": True,
        "js_runtimes": {"node": {}},
        "remote_components": {"ejs": "github"},
        "user_agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/121.0.0.0 Safari/537.36"
        ),
    }

    if YOUTUBE_MAX_FILESIZE_MB and YOUTUBE_MAX_FILESIZE_MB > 0:
        ydl_opts["max_filesize"] = int(YOUTUBE_MAX_FILESIZE_MB) * 1024 * 1024

    if custom_options:
        ydl_opts.update(custom_options)

    if progress_callback:
        ydl_opts["progress_hooks"] = [progress_callback]

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url)
        except DownloadError as exc:
            message = str(exc).replace("\n", " ").strip()
            raise RuntimeError(message) from exc

        if isinstance(info, dict) and info.get("_type") == "playlist":
            entries = info.get("entries") or []
            info = next((e for e in entries if e), None) or info

        filename = None
        if isinstance(info, dict):
            requested = info.get("requested_downloads")
            if isinstance(requested, list) and requested:
                filename = requested[0].get("filepath") or requested[0].get("filename")
            filename = filename or info.get("_filename")

        filename = filename or ydl.prepare_filename(info)
        if isinstance(filename, str) and not filename.lower().endswith(".mp4"):
            filename = os.path.splitext(filename)[0] + ".mp4"

    if not os.path.exists(filename):
        raise FileNotFoundError("Failed to download video.")

    return filename
