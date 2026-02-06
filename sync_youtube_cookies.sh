#!/bin/bash
# YouTube Cookie Sync Script
# Exports cookies from your browser and uploads them to the VPS

set -e

# ============ CONFIGURATION ============
# Change these values to match your setup
VPS_USER="deploy"
VPS_HOST="46.224.77.210"  # Replace with your VPS IP address
BROWSER="chrome"       # Options: firefox, chrome, chromium, brave, edge, safari
DOCKER_VOLUME_PATH="/var/lib/docker/volumes/prod-pdfswifter_api_data/_data/cookies.txt"
# =======================================

COOKIES_FILE="/tmp/youtube_cookies_$$.txt"
LOG_FILE="$HOME/.youtube_cookie_sync.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

cleanup() {
    rm -f "$COOKIES_FILE"
}
trap cleanup EXIT

log "Starting YouTube cookie sync..."

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    log "ERROR: yt-dlp is not installed. Install with: brew install yt-dlp"
    exit 1
fi

# Export cookies from browser
log "Exporting cookies from $BROWSER..."
if ! yt-dlp --cookies-from-browser "$BROWSER" --cookies "$COOKIES_FILE" --skip-download "https://www.youtube.com/watch?v=dQw4w9WgXcQ" 2>&1 | tee -a "$LOG_FILE"; then
    log "ERROR: Failed to export cookies from $BROWSER"
    exit 1
fi

# Verify cookies file was created and has content
if [ ! -s "$COOKIES_FILE" ]; then
    log "ERROR: Cookies file is empty or not created"
    exit 1
fi

COOKIE_COUNT=$(grep -c "youtube.com" "$COOKIES_FILE" 2>/dev/null || echo "0")
log "Exported $COOKIE_COUNT YouTube cookies"

# Upload to VPS
log "Uploading cookies to VPS ($VPS_HOST)..."
if ! scp "$COOKIES_FILE" "$VPS_USER@$VPS_HOST:/tmp/cookies.txt" 2>&1 | tee -a "$LOG_FILE"; then
    log "ERROR: Failed to upload cookies to VPS"
    exit 1
fi

# Move to Docker volume with correct permissions
log "Installing cookies to Docker volume..."
if ! ssh "$VPS_USER@$VPS_HOST" "sudo cp /tmp/cookies.txt $DOCKER_VOLUME_PATH && sudo chown 1000:1000 $DOCKER_VOLUME_PATH && rm /tmp/cookies.txt" 2>&1 | tee -a "$LOG_FILE"; then
    log "ERROR: Failed to install cookies on VPS"
    exit 1
fi

log "SUCCESS: Cookies synced to VPS"
log "---"
