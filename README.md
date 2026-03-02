# TogetherOS

A **persistent virtual home for long-distance couples**. Share a pixel-art 2D apartment, move in real time, and unlock interaction zones -- watch YouTube together, run focus timers, and video-call from the balcony.

## Features

| Zone | Mode | What it does |
|------|------|--------------|
| Lounge (couch) | Watch Mode | Synced YouTube player -- paste a link, play/pause/seek together |
| Office (desk) | Focus Mode | Shared Pomodoro timer (15/25/45/60 min) with server-authoritative countdown |
| Garden (balcony) | Video Chat | WebRTC peer-to-peer video call, auto-starts when both enter the zone |
| Kitchen | (planned) | Challenge / shared task mode |

**Also includes:**
- Email auth (register/login with JWT)
- Couple system with invite codes (create space, share code, partner joins)
- Phaser.js 2D game with tile-based movement and collision detection
- Real-time multiplayer movement via Socket.io + Redis
- Session persistence (focus & watch sessions saved to PostgreSQL)
- HUD toolbar with mic/cam toggle, fullscreen, space switching

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React (Vite), Phaser.js, Zustand, TailwindCSS |
| Backend | Node.js, Express, Socket.io |
| Database | PostgreSQL (persistent data), Redis (live state) |
| Media | Native WebRTC API (no external dependencies) |
| Infra | Docker Compose (Postgres + Redis) |

## Quick Start

### 1. Start Docker Desktop (required)

**PostgreSQL and Redis run in Docker.** You must have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and **running** before the next steps.

On Windows: open Docker Desktop from the Start menu and wait until it shows "Docker Desktop is running".

### 2. Start Postgres and Redis

```bash
docker-compose up -d
```

Check that containers are running: `docker ps` — you should see `postgres` and `redis`.

### 3. One-time setup

```bash
cd backend
cp .env.example .env
# .env is preconfigured for docker-compose (port 4001 matches Vite proxy)
npm install
npm run db:migrate
cd ..
```

### 4. Run the app

From the **project root**:

```bash
npm install
npm run dev
```

This starts both backend (port 4001) and frontend (port 5173) concurrently.

Open **http://localhost:5173**, register an account, create a space, copy the invite code, then open another browser/incognito window to join as your partner.

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL not running | Start Docker Desktop, then run `docker-compose up -d` |
| `Backend not running at localhost:4001` | Backend crashed (usually due to DB) | Fix PostgreSQL first; ensure `backend/.env` has `PORT=4001` |
| `open //./pipe/dockerDesktopLinuxEngine` | Docker Desktop not running | Launch Docker Desktop and wait for it to be ready |

## Project Structure

```
Together/
├── backend/
│   └── src/
│       ├── app.js                    Express app setup + route registration
│       ├── server.js                 HTTP server + socket init
│       ├── socket.js                 Socket.io setup + handler registration
│       ├── db/
│       │   ├── client.js             PostgreSQL connection pool
│       │   ├── redis.js              Redis client + key helpers
│       │   ├── schema.sql            Database schema
│       │   └── migrate.js            Migration runner
│       └── modules/
│           ├── auth/                 Login, register, couples, JWT, socket auth
│           ├── room/                 Room routes, service, session routes
│           └── socket/
│               ├── room-handlers.js       Join/leave rooms
│               ├── movement-handlers.js   Avatar position sync
│               ├── zone-handlers.js       Zone enter/leave detection
│               ├── watch-handlers.js      YouTube sync events
│               ├── focus-handlers.js      Pomodoro timer (server-authoritative)
│               └── webrtc-handlers.js     WebRTC signaling relay
├── frontend/
│   └── src/
│       ├── api/client.js             REST API helpers
│       ├── components/
│       │   ├── GameHUD.jsx           Top bar + bottom toolbar
│       │   ├── WatchMode.jsx         YouTube sync overlay (lounge zone)
│       │   ├── FocusMode.jsx         Pomodoro timer overlay (office zone)
│       │   └── ProximityVideo.jsx    WebRTC video chat (garden zone)
│       ├── game/
│       │   ├── Game.jsx              Phaser game wrapper
│       │   ├── config.js             Tile map, furniture, zones, colors
│       │   ├── characters.js         Pixel character rendering
│       │   └── scenes/RoomScene.js   Main game scene (rendering, movement, collision, zones)
│       ├── hooks/useSocket.js        Socket.io hook
│       ├── pages/
│       │   ├── Home.jsx              Landing page
│       │   ├── Login.jsx             Login form
│       │   ├── Register.jsx          Registration form
│       │   └── Apartment.jsx         Main game view (socket, zone overlays, HUD)
│       └── store/authStore.js        Zustand auth state
├── docker-compose.yml
├── package.json                      Workspaces: backend, frontend
└── .gitignore
```

## Environment Variables

See `backend/.env.example` for all options.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql://postgres:postgres@localhost:5432/togetheros` | PostgreSQL connection |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection |
| `JWT_SECRET` | No | `togetheros-secret` | JWT signing key |
| `PORT` | No | `4000` | Backend port |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS origin |

## How It Works

1. **Auth**: Users register/login and receive a JWT token
2. **Couples**: One user creates a space (gets invite code), partner joins with the code
3. **Room**: Each couple gets a persistent room with a 2D apartment layout stored as JSONB
4. **Movement**: Arrow keys / WASD move the avatar; positions broadcast via Socket.io and cached in Redis
5. **Zones**: Walking into a zone triggers `zone:enter`; when both partners are in the same zone, the zone overlay activates
6. **Watch Mode**: YouTube IFrame API with synced play/pause/seek via socket events; video state cached in Redis
7. **Focus Mode**: Server runs a `setInterval` timer, emits `focus:tick` every second; completed sessions saved to DB
8. **Video Chat**: Native WebRTC with signaling relayed through Socket.io; auto-starts when both enter the garden zone

## License

MIT
