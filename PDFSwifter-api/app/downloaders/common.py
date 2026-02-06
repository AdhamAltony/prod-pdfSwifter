import json
import os
import subprocess
from typing import Callable, Dict, Optional

from app.config import (
    YOUTUBE_CONCURRENT_FRAGMENT_DOWNLOADS,
    YOUTUBE_EXTRACTOR_RETRIES,
    YOUTUBE_FRAGMENT_RETRIES,
    YOUTUBE_MAX_FILESIZE_MB,
    YOUTUBE_MAX_RETRIES,
    YOUTUBE_SOCKET_TIMEOUT_SECONDS,
    YOUTUBE_SOURCE_ADDRESS,
    YOUTUBE_COOKIES_PATH,
    YOUTUBE_PROXY,
)


def download_video(
    url: str,
    output_template: str,
    custom_options: Optional[Dict] = None,
    progress_callback: Optional[Callable[[Dict], None]] = None,
) -> str:
    """Download remote video content to disk and return the resulting filename."""

    cmd = [
        "yt-dlp",
        "--cache-dir", "/data/.yt-dlp-cache",
        "--format", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]",
        "--output", output_template,
        "--merge-output-format", "mp4",
        "--no-playlist",
        "--retries", str(YOUTUBE_MAX_RETRIES),
        "--fragment-retries", str(YOUTUBE_FRAGMENT_RETRIES),
        "--extractor-retries", str(YOUTUBE_EXTRACTOR_RETRIES),
        "--socket-timeout", str(YOUTUBE_SOCKET_TIMEOUT_SECONDS),
        "--concurrent-fragments", str(YOUTUBE_CONCURRENT_FRAGMENT_DOWNLOADS),
        "--geo-bypass",
        "--continue",
        "--js-runtimes", "node",
        "--remote-components", "ejs:github",
        "--user-agent", (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/121.0.0.0 Safari/537.36"
        ),
        "--print-json",
        "--no-simulate",
    ]

    if YOUTUBE_SOURCE_ADDRESS:
        cmd.extend(["--source-address", YOUTUBE_SOURCE_ADDRESS])

    if YOUTUBE_PROXY:
        cmd.extend(["--proxy", YOUTUBE_PROXY])

    if YOUTUBE_MAX_FILESIZE_MB and YOUTUBE_MAX_FILESIZE_MB > 0:
        cmd.extend(["--max-filesize", f"{YOUTUBE_MAX_FILESIZE_MB}M"])

    cookies_path = None
    if custom_options and custom_options.get("cookiefile"):
        cookies_path = custom_options["cookiefile"]
    elif YOUTUBE_COOKIES_PATH:
        cookies_path = os.path.expanduser(YOUTUBE_COOKIES_PATH)

    if cookies_path and os.path.exists(cookies_path):
        cmd.extend(["--cookies", cookies_path])

    cmd.append(url)

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,
        )

        if result.returncode != 0:
            error_msg = result.stderr.strip() or result.stdout.strip() or "Download failed"
            error_msg = error_msg.replace("\n", " ").strip()
            raise RuntimeError(error_msg)

        # Parse the JSON output to get the filename
        output_lines = result.stdout.strip().split("\n")
        info = None
        for line in reversed(output_lines):
            try:
                info = json.loads(line)
                break
            except json.JSONDecodeError:
                continue

        filename = None
        if info:
            requested = info.get("requested_downloads")
            if isinstance(requested, list) and requested:
                filename = requested[0].get("filepath") or requested[0].get("filename")
            filename = filename or info.get("_filename")

        # Fallback: find the downloaded file based on template
        if not filename or not os.path.exists(filename):
            base_dir = os.path.dirname(output_template)
            if os.path.isdir(base_dir):
                files = [
                    os.path.join(base_dir, f)
                    for f in os.listdir(base_dir)
                    if f.endswith(".mp4")
                ]
                if files:
                    filename = max(files, key=os.path.getctime)

        if not filename or not os.path.exists(filename):
            raise FileNotFoundError("Failed to download video.")

        return filename

    except subprocess.TimeoutExpired:
        raise RuntimeError("Download timed out after 10 minutes")
    except FileNotFoundError:
        raise RuntimeError("yt-dlp not found. Please install it.")
