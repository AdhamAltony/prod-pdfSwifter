"""Cookie management for yt-dlp downloads with automatic refresh."""

import asyncio
import logging
import os
import subprocess
import threading
import time
from typing import Optional

from app.config import YOUTUBE_COOKIES_BROWSER, YOUTUBE_COOKIES_PATH

logger = logging.getLogger(__name__)

_refresh_lock = threading.Lock()
_last_refresh_time: float = 0.0
_MIN_REFRESH_INTERVAL_SECONDS = 60.0


def is_cookie_error(error: Exception) -> bool:
    """Check if an error indicates stale or missing cookies."""
    message = str(error).lower()
    cookie_error_indicators = (
        "sign in to confirm",
        "confirm you're not a bot",
        "not a bot",
        "cookies",
        "login required",
        "please sign in",
        "sign in to view",
        "this video requires authentication",
    )
    return any(indicator in message for indicator in cookie_error_indicators)


def get_cookies_path() -> Optional[str]:
    """Return the expanded cookies file path if configured."""
    if not YOUTUBE_COOKIES_PATH:
        return None
    return os.path.expanduser(YOUTUBE_COOKIES_PATH)


def can_refresh_cookies() -> bool:
    """Check if cookie refresh is possible and allowed."""
    if not YOUTUBE_COOKIES_BROWSER:
        return False
    if not YOUTUBE_COOKIES_PATH:
        return False
    return True


def _do_refresh_cookies() -> bool:
    """
    Extract fresh cookies from the configured browser.

    Returns True if refresh succeeded, False otherwise.
    This function is NOT thread-safe - use refresh_cookies() instead.
    """
    if not can_refresh_cookies():
        return False

    cookies_path = get_cookies_path()
    if not cookies_path:
        return False

    cookies_dir = os.path.dirname(cookies_path)
    if cookies_dir and not os.path.exists(cookies_dir):
        try:
            os.makedirs(cookies_dir, exist_ok=True)
        except OSError as exc:
            logger.error("Failed to create cookies directory: %s", exc)
            return False

    # Use yt-dlp to extract cookies from browser
    cmd = [
        "yt-dlp",
        "--cookies-from-browser", YOUTUBE_COOKIES_BROWSER,
        "--cookies", cookies_path,
        "--skip-download",
        "--quiet",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ]

    try:
        logger.info("Refreshing cookies from browser: %s", YOUTUBE_COOKIES_BROWSER)
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0:
            logger.info("Successfully refreshed cookies to: %s", cookies_path)
            return True
        else:
            logger.error(
                "Cookie refresh failed (exit %d): %s",
                result.returncode,
                result.stderr.strip() or result.stdout.strip(),
            )
            return False
    except subprocess.TimeoutExpired:
        logger.error("Cookie refresh timed out")
        return False
    except FileNotFoundError:
        logger.error("yt-dlp not found - cannot refresh cookies")
        return False
    except Exception as exc:
        logger.error("Cookie refresh failed: %s", exc)
        return False


def refresh_cookies() -> bool:
    """
    Thread-safe cookie refresh with rate limiting.

    Returns True if cookies were refreshed, False otherwise.
    Prevents multiple concurrent refresh attempts.
    """
    global _last_refresh_time

    if not can_refresh_cookies():
        return False

    with _refresh_lock:
        now = time.time()
        if now - _last_refresh_time < _MIN_REFRESH_INTERVAL_SECONDS:
            logger.debug(
                "Skipping cookie refresh - last refresh was %.1f seconds ago",
                now - _last_refresh_time,
            )
            return False

        success = _do_refresh_cookies()
        if success:
            _last_refresh_time = now
        return success


async def refresh_cookies_async() -> bool:
    """Async wrapper for cookie refresh."""
    return await asyncio.to_thread(refresh_cookies)
