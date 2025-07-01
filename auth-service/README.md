# Authentication Service

## Purpose

This microservice will handle all authentication and authorization functionality for the Hirera platform.

## Planned Features

- User registration and login
- JWT token management
- OAuth integrations (Google, LinkedIn, GitHub)
- Role-based access control
- Password reset functionality
- Session management
- Multi-factor authentication (MFA)

## Tech Stack (Planned)

- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **OAuth**: Passport.js
- **Documentation**: Swagger/OpenAPI

## Status

🚧 **Coming Soon** - Currently authentication is handled within the main JOBSOFT-dev application.

## Migration Plan

1. Extract authentication logic from JOBSOFT-dev
2. Create standalone auth service
3. Implement OAuth providers
4. Add advanced security features
5. Deploy as independent service

## Development

*This service is not yet implemented. Authentication is currently handled in the main application.* 