# Hirera

Hirera is a job-application tracking platform built as a small local-first microservices stack.

## Repository layout

- `web-app/`: Next.js web application (UI + Next.js API routes that proxy to the microservices)
- `auth-service/`: Express authentication service (local file-backed auth for dev; Cognito-compatible interface)
- `job-service/`: Express job application API (DynamoDB Local in dev)
- `docker-compose.yml`: Local development stack
- `Caddyfile`: Reverse proxy configuration (local HTTPS domains + `http://localhost:8080`)

## Quick start (recommended)

### Prerequisites

- Docker Desktop

### Start the stack

```bash
docker compose up --build
```

### Open the app

- Web app: `http://localhost:8080`

(You can also use local HTTPS domains via Caddy: `https://web.local.hirera`, `https://auth.local.hirera`, `https://jobs.local.hirera`.)

## Local authentication

This repo defaults to **local auth mode** when running with Docker Compose.

- Users are stored in a Docker volume at `auth-service:/data/users.json`
- JWTs are signed with `JWT_SECRET` from `docker-compose.yml`

### Create an account

Use the **Sign up** page in the UI.

- Your user will be persisted to the local auth store.

## Services & ports (Docker)

- `reverse-proxy` (Caddy): exposes `http://localhost:8080` and local HTTPS domains
- `web` (Next.js): internal `:3000`
- `auth` (Express): internal `:3001`
- `jobs` (Express): internal `:3002`
- `dynamodb-local`: `:8000`

## API overview

The browser talks to the Next.js API routes on the web app, which proxy to the microservices.

- Auth
  - `POST /api/auth/signup`
  - `POST /api/auth/signin`
  - `GET /api/auth/user`
- Job applications
  - `GET /api/jobs`
  - `POST /api/jobs`
  - `PUT /api/jobs/:id`
  - `DELETE /api/jobs/:id`
- Leaderboards
  - `GET /api/leaderboards`

## Development notes

- The `web-app` API routes read `access_token` from cookies and forward it to microservices as a Bearer token.
- The job service accepts UI payload fields (`jobTitle`, `jobPostUrl`) and maps them to service fields (`title`, `url`).

## License

MIT
