# Deployment Guide - Hirera Authentication System

## Overview

This guide covers deploying the Hirera job tracking application with the microservices. The system consists of:

1. **Authentication Microservice** (Node.js/Express)
2. **Main Application** (Next.js)
3. **AWS Cognito** (User management)

## Architecture

```
web (Next.js) ←→ auth (Cognito proxy) ←→ AWS Cognito
               ↘︎ jobs (DynamoDB API) ←→ DynamoDB
```

## Prerequisites

### AWS Cognito Setup
- User Pool: `jobsoft-dev-pool` (ap-southeast-2_2crlAC0JH)
- App Client: `jobsoft-dev-client` (fivu1tamshltc854dak86c1um)
- Region: ap-southeast-2
- Auth flows enabled: `USER_PASSWORD_AUTH`, `USER_SRP_AUTH`, `REFRESH_TOKEN_AUTH`

### Domain Configuration
- **Main App**: `https://hirera.net`
- **Auth Service**: `https://auth.hirera.net`

## Deployment Steps

### 1. Containerized Microservices (Local + Prod)

#### Environment Variables
Create `.env` file for the auth service:

```bash
# AWS Configuration
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Cognito Configuration
COGNITO_USER_POOL_ID=ap-southeast-2_2crlAC0JH
COGNITO_CLIENT_ID=fivu1tamshltc854dak86c1um
COGNITO_CLIENT_SECRET=your_client_secret

# Server Configuration
PORT=3001
NODE_ENV=production
```

#### Deploy Options

**Local Docker (with HTTPS via Caddy)**
```bash
cd ..
docker compose up --build
# Open: https://web.local.hirera (Caddy provides local TLS)
```

**Production via ECS/Fargate**
1. Build and push images to ECR for `web`, `auth`, `jobs`
2. Deploy with ECS services behind an ALB
3. Configure ACM certificates for your domains

**Option C: VPS/Server**
```bash
# Install PM2 for process management
npm install -g pm2

# Deploy and start
pm2 start server.js --name "hirera-auth"
pm2 startup
pm2 save
```

### 2. Main Application Deployment

#### Environment Variables
Update `.env.production`:

```bash
# Auth Service Configuration
NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth.hirera.net
JOB_SERVICE_URL=https://jobs.hirera.net

# AWS Configuration (for other services)
AWS_REGION=ap-southeast-2
NEXT_PUBLIC_COGNITO_REGION=ap-southeast-2

# Database and other configurations
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://hirera.net
```

#### Deploy Options

**Option A: Vercel (Frontend only)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

**Option B: AWS Amplify**
```bash
# Connect GitHub repo in AWS Amplify console
# Configure build settings and environment variables
```

**Option C: Self-hosted**
```bash
# Build the application
npm run build

# Start with PM2
pm2 start npm --name "hirera-app" -- start
```

### 3. DNS Configuration

#### DNS Records
```
hirera.net          A      your-main-app-ip
www.hirera.net      CNAME  hirera.net
auth.hirera.net     A      your-auth-service-ip
```

#### SSL Certificates
- Use Let's Encrypt or AWS Certificate Manager
- Ensure both domains have valid SSL certificates

### 4. CORS Configuration

The auth service is configured to accept requests from:
- `https://hirera.net`
- `https://www.hirera.net`
- `https://auth.hirera.net`
- Local development URLs

## Testing the Deployment

### 1. Health Checks
```bash
# Test auth service
curl https://auth.hirera.net/health

# Test main application
curl https://hirera.net/api/health
```

### 2. Authentication Flow Test
```bash
# 1. Sign up
curl -X POST https://auth.hirera.net/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# 2. Sign in (after email confirmation)
curl -X POST https://auth.hirera.net/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "username": "generated_username_from_signup"
  }'
```

### 3. Frontend Testing
1. Visit `https://hirera.net`
2. Navigate to signup/signin pages
3. Test complete authentication flow
4. Verify cookie handling and redirects

## Monitoring and Logs

### CloudWatch (AWS)
- Set up CloudWatch for both services
- Monitor API Gateway logs
- Set up alarms for error rates

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs hirera-auth
pm2 logs hirera-app
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use AWS Systems Manager Parameter Store or similar for secrets
- Rotate AWS credentials regularly

### 2. CORS Security
- Verify CORS origins in production
- Use specific domain names, not wildcards

### 3. Cookie Security
- `httpOnly: true` for all auth cookies
- `secure: true` in production
- `sameSite: 'lax'` for cross-subdomain compatibility

### 4. HTTPS Only
- Enforce HTTPS redirects
- Use HSTS headers
- Validate SSL certificates

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Check auth service CORS configuration
- Verify domain names match exactly
- Ensure both services use HTTPS

**2. Authentication Failures**
- Check AWS Cognito configuration
- Verify environment variables
- Check auth service logs

**3. Username Issues**
- Users must use generated username for authentication
- Provide clear error messages
- Store username in cookies after signup

**4. Cookie Issues**
- Check domain configuration
- Verify secure/httpOnly settings
- Test cross-subdomain functionality

### Debug Commands
```bash
# Check auth service configuration
curl https://auth.hirera.net/test-config

# Test CORS
curl -H "Origin: https://hirera.net" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://auth.hirera.net/auth/signin

# View server logs
pm2 logs hirera-auth --lines 100
```

## Scaling Considerations

### Load Balancing
- Use Application Load Balancer for auth service
- Configure health checks
- Set up auto-scaling groups

### Database
- Consider read replicas for high traffic
- Use connection pooling
- Monitor query performance

### Caching
- Implement Redis for session storage
- Cache user data appropriately
- Use CDN for static assets

## Backup and Recovery

### AWS Cognito
- Export user pool configuration
- Set up automated backups
- Document recovery procedures

### Application Data
- Regular database backups
- Test restore procedures
- Monitor backup integrity

---

## Quick Start Commands

```bash
# Development
npm run dev                    # Start Next.js app
cd auth-service && npm start   # Start auth service

# Production Build
npm run build                  # Build Next.js app
cd auth-service && npm run production  # Start auth service in production

# Testing
npm run test                   # Run tests
cd auth-service && npm test    # Test auth service
```

## Support

For deployment issues:
1. Check this guide first
2. Review application logs
3. Test individual components
4. Contact development team with specific error messages

Remember to update this guide when making changes to the authentication system or deployment process. 