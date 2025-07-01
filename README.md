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

### Planned Microservices

- **auth-service/**: Authentication and authorization service
- **notification-service/**: Email and in-app notifications
- **analytics-service/**: Data analytics and insights
- **document-service/**: Resume and document management
- **integration-service/**: Third-party integrations (LinkedIn, job boards)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Running the Main Application

```bash
cd JOBSOFT-dev
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### Development

Each microservice can be developed and deployed independently. The main application (JOBSOFT-dev) contains the frontend and core API functionality.

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
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: Framer Motion

## Contributing

1. Choose the appropriate microservice directory
2. Make your changes
3. Test locally
4. Submit a pull request

## License

MIT License
