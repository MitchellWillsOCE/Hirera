# Hirera - Job Tracking Platform

A comprehensive job tracking platform built with modern microservices architecture.

## Architecture

This project is organized as a microservices architecture:

### Core Services

- **JOBSOFT-dev/**: Main application service (Next.js frontend + API)
  - Job tracking dashboard
  - User authentication
  - Application management
  - Analytics and reporting

### Microservices

- **auth-service/**: Authentication and authorization service (Express → AWS Cognito)
- **job-service/**: Job data API (Express → DynamoDB)
- Reverse proxy: Caddy for local HTTPS and domain routing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Run locally (Docker, with HTTPS)

```bash
docker compose up --build
```

Open `https://web.local.hirera` (Caddy provides certificates). Services:
- Web: `https://web.local.hirera`
- Auth: `https://auth.local.hirera`
- Jobs: `https://jobs.local.hirera`

### Development

Each microservice can be developed and deployed independently. The main application (JOBSOFT-dev) contains the frontend and proxies requests to the microservices.

## Features

- ✅ Job application tracking
- ✅ Analytics dashboard
- ✅ Document management
- ✅ Interview scheduling
- ✅ Goal setting and tracking
- 🚧 LinkedIn integration
- 🚧 Email notifications
- 🚧 Advanced analytics

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **APIs**: Express microservices (auth → Cognito, jobs → DynamoDB)
- **Database**: DynamoDB (local in dev via DynamoDB Local)
- **Authentication**: AWS Cognito (via `auth-service`)
- **Reverse Proxy**: Caddy (local HTTPS)
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: Framer Motion

## Contributing

1. Choose the appropriate microservice directory
2. Make your changes
3. Test locally
4. Submit a pull request

## License

MIT License
