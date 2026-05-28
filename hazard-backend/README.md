# Hazard Report Backend

Backend API for the Telegram Mini App hazard reporting platform.

## Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20+ / TypeScript |
| Framework | Express 4 |
| Database | PostgreSQL 16 + Prisma ORM |
| Real-time | WebSockets (`ws`) |
| Auth | Telegram `initData` validation + JWT |
| Storage | S3-compatible (AWS S3 / Cloudflare R2 / MinIO) |
| Routing | OSRM (foot profile) with hazard-avoidance heuristic |

---

## Quick Start

### 1. Clone & install

```bash
npm install
```

### 2. Start infrastructure

```bash
docker compose up -d   # PostgreSQL on :5432, MinIO on :9000
```

### 3. Configure environment

```bash
cp .env.example .env
# Fill in TELEGRAM_BOT_TOKEN, JWT_SECRET, and S3 credentials.
# For local dev, MinIO settings are pre-configured in .env.example.
```

Minimum `.env` for local dev (MinIO):

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/hazard_db
TELEGRAM_BOT_TOKEN=<your bot token>
JWT_SECRET=<any 64-char random string>
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=hazard-reports
S3_PUBLIC_URL=http://localhost:9000/hazard-reports
```

### 4. Run migrations

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Apply migrations (creates tables)
```

### 5. Start dev server

```bash
npm run dev
```

---

## API Reference

### Auth

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/auth/telegram` | `{ initData }` | Validate Telegram payload, return JWT + user |

### Reports

| Method | Path | Query / Body | Description |
|---|---|---|---|
| GET | `/api/reports` | `lat, lng, radius, type, category` | Fetch active reports |
| POST | `/api/reports` | `{ category, lat, lng, description?, photoUrl? }` or multipart `photo` | Create report |
| GET | `/api/reports/:id` | — | Get single report |
| POST | `/api/reports/:id/upvote` | — | Upvote a report |

### Comments

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/reports/:id/comments` | `limit, cursor` | Get comment thread |
| POST | `/api/reports/:id/comments` | `{ content }` | Post a comment |

### Routing

| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/api/routing/safe` | `startLat, startLng, endLat, endLng` | Safe + fastest GeoJSON routes |

### Profile

| Method | Path | Description |
|---|---|---|
| GET | `/api/profile/me` | Current user stats + badges |
| GET | `/api/profile/me/reports` | User's report history |
| GET | `/api/profile/me/saved-locations` | Saved locations list |
| POST | `/api/profile/me/saved-locations` | Add saved location |
| DELETE | `/api/profile/me/saved-locations/:id` | Remove saved location |
| GET | `/api/profile/me/presigned-upload?mimetype=image/jpeg` | Get S3 pre-signed URL |

---

## WebSocket Protocol

Connect to `ws://<host>/ws?token=<jwt>`.

### Client → Server messages

```jsonc
// Subscribe to live updates in a bounding box
{ "type": "SUBSCRIBE_BBOX", "bbox": { "minLat": 47.0, "maxLat": 47.1, "minLng": 28.8, "maxLng": 28.9 } }

// Keepalive
{ "type": "PING" }
```

### Server → Client messages

```jsonc
{ "type": "CONNECTED", "userId": "..." }
{ "type": "SUBSCRIBED", "bbox": { ... } }
{ "type": "PONG" }
// Broadcast when a new report is created inside your bbox:
{ "type": "NEW_REPORT", "report": { "id": "...", "category": "THREAT", ... } }
// Broadcast when any report is upvoted:
{ "type": "UPVOTE_UPDATE", "reportId": "...", "upvotes": 12 }
```

---

## Photo Upload Flow (Recommended)

1. **Frontend** calls `GET /api/profile/me/presigned-upload?mimetype=image/jpeg`
2. **Backend** returns `{ uploadUrl, publicUrl }`
3. **Frontend** PUTs the photo directly to S3 using `uploadUrl`
4. **Frontend** passes `publicUrl` in the `POST /api/reports` body

This keeps large binaries off the API server.

---

## Badges

| Badge | Condition |
|---|---|
| Trusted Reporter | `reportsCount >= 10` (configurable via `TRUSTED_REPORTER_THRESHOLD`) |
| City Sentinel | `reportsCount >= 50` |
| Community Hero | `peopleHelpedCount >= 100` |

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong random `JWT_SECRET` (64+ chars)
- [ ] Configure real AWS S3 or Cloudflare R2 credentials
- [ ] Point `OSRM_BASE_URL` to a self-hosted OSRM instance (public demo has rate limits)
- [ ] Set `REPORT_TTL_HOURS` to taste (default 6h)
- [ ] Add a process manager (PM2 / systemd) or containerise with Docker
- [ ] Put Nginx or Caddy in front for TLS termination
- [ ] Set up database backups
