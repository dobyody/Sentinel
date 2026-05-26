# Sentinel - Backend & API Requirements

This document outlines the required backend infrastructure, database models, and REST/WebSocket API endpoints necessary to support the Sentinel frontend MVP. The frontend is currently a React (Vite) application utilizing Telegram WebApp SDK, meaning authentication and user identity should heavily rely on Telegram's initial payload.

## 1. Authentication & Users
The frontend operates inside a Telegram Mini App. User identity is strictly anonymous to other users but tied to a Telegram ID on the backend to prevent spam and track trustworthiness.

**Requirements:**
- Endpoint to validate the `Telegram WebApp initData` payload.
- Generate and return a secure JWT or session token.
- Generate anonymous nicknames (e.g., `Citizen #124`, `Anonymous #992`) on account creation.
- Track user trustworthiness (number of valid reports, number of people helped) to assign badges like "Trusted Reporter".

## 2. Core Entities (Database Models)

### `User`
- `id` (UUID)
- `telegramId` (String, Indexed, Unique)
- `nickname` (String, Generated)
- `reportsCount` (Int, Default 0)
- `peopleHelpedCount` (Int, Default 0)
- `isTrusted` (Boolean)
- `createdAt` (Timestamp)

### `HazardReport`
- `id` (UUID)
- `userId` (UUID, Foreign Key)
- `category` (Enum: `THREAT`, `INFRASTRUCTURE`, `ANIMAL`, `OBSTACLE`)
- `latitude` (Float)
- `longitude` (Float)
- `description` (Text, Nullable)
- `photoUrl` (String, Nullable)
- `upvotes` (Int, Default 0)
- `commentsCount` (Int, Default 0)
- `isActive` (Boolean, Default true)
- `createdAt` (Timestamp)
- `expiresAt` (Timestamp - auto-archived after e.g., 6 hours)

### `Comment` (For Report Threads)
- `id` (UUID)
- `reportId` (UUID, Foreign Key)
- `userId` (UUID, Foreign Key)
- `content` (Text)
- `createdAt` (Timestamp)

### `SavedLocation`
- `id` (UUID)
- `userId` (UUID, Foreign Key)
- `label` (String, e.g., "Home", "Work")
- `latitude` (Float)
- `longitude` (Float)

## 3. Required API Endpoints

### 🔐 Auth
- `POST /api/auth/telegram`
  - Validates `initData`. Returns JWT and User Object.

### 📍 Hazard Reports (Pulse & Map)
- `GET /api/reports?lat={lat}&lng={lng}&radius={km}&type={nearby|trending}`
  - Fetches active hazard reports for the Map and Pulse feed.
- `GET /api/reports/:id`
  - Fetch detailed data for a specific hazard when its map marker is clicked.
- `POST /api/reports`
  - Creates a new hazard report (3-Tap flow).
  - Body: `{ category, lat, lng, description, photoUrl }`
- `POST /api/reports/:id/upvote`
  - Upvotes a report (validating its accuracy).

### 💬 Threads (Comments)
- `GET /api/reports/:id/comments`
  - Fetches the discussion thread for a specific hazard.
- `POST /api/reports/:id/comments`
  - Adds a reply to a hazard thread.

### 🗺️ Safe Routing
- `GET /api/routing/safe?startLat={lat}&startLng={lng}&endLat={lat}&endLng={lng}`
  - Backend must calculate routes (potentially wrapping an external routing engine like Mapbox or OSRM) and apply penalties/avoidance polygons around active `HazardReport` coordinates.
  - Returns two GeoJSON paths: `safeRoute` and `fastestRoute` (with hazard warnings).

### 👤 Profile
- `GET /api/profile/me`
  - Returns current user stats (reports count, people helped, trusted status).
- `GET /api/profile/me/reports`
  - Returns history of reports made by the user.

## 4. Real-Time Capabilities (WebSockets/SSE) - Highly Recommended
To make the "live multiplayer mode of the city" a reality:
- Open a WebSocket connection upon app load.
- Broadcast new `HazardReport` events to users connected in the same geographic bounding box.
- Update map markers in real-time without requiring a page refresh.
- Note: The frontend relies on the Telegram SDK for live user GPS location via `WebApp.LocationManager`, but updates to hazards should come via WS.

## 5. Storage
- S3-compatible object storage (AWS S3, Cloudflare R2, MinIO) for handling optional image uploads attached to hazard reports.
