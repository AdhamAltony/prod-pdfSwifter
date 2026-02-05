# pdfswifter-prod

Production-ready Docker Compose setup for the PDFSwifter frontend (Next.js) and API (FastAPI) with Caddy + Redis.

## Structure
- `PDFSwifter/` - Next.js frontend
- `PDFSwifter-api/` - FastAPI backend
- `docker-compose.yml` - Production compose (Caddy, web, api, redis)

## Production Setup
1. Create root env:
   - Copy `.env.example` to `.env` and set `WEB_DOMAIN`, `API_DOMAIN`, `CADDY_EMAIL`, `REDIS_PASSWORD`.
2. Create service envs:
   - Copy `PDFSwifter/deploy/web.env.example` to `PDFSwifter/deploy/web.env` and set `AUTH_SECRET` and any payment/ad keys.
   - Copy `PDFSwifter/deploy/api.env.example` to `PDFSwifter/deploy/api.env` and set allowed origins/hosts.
3. Start:
   - `docker compose up -d --build`

## Security Notes
- Use a strong `REDIS_PASSWORD` and `AUTH_SECRET`.
- Keep `PDFSwifter/deploy/*.env` out of version control.
