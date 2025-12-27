# Hirera Microservices: Operations Plan and Handover

This document summarizes the architecture, endpoints, environment variables, AWS setup, and runbooks for continuing deployment of Hirera at the following domains:

- Web (Next.js): https://hirera.net and https://www.hirera.net
- Auth API (Express â†’ AWS Cognito): https://auth.hirera.net
- Jobs API (Express â†’ DynamoDB): https://jobs.hirera.net

## 1) Architecture Overview

- Web app (`web-app`)
  - Next.js 15 app serving UI and thin API proxy routes
  - Proxies to microservices using envs:
    - `NEXT_PUBLIC_AUTH_SERVICE_URL` â†’ Auth API
    - `JOB_SERVICE_URL` â†’ Jobs API
  - HTTPS/cookies handled behind a load balancer

- Auth microservice (`auth-service`)
  - Node/Express; integrates with AWS Cognito (User Pool + App Client w/secret)
  - Endpoints for signup, confirm, signin, get user, resend code, change password
  - Env-driven CORS and proxy-aware headers (`helmet`, `trust proxy`)

- Jobs microservice (`job-service`)
  - Node/Express; integrates with AWS DynamoDB table `hirera-jobs`
  - Endpoints for CRUD on jobs for authenticated users
  - Env-driven CORS and proxy-aware headers (`helmet`, `trust proxy`)

- AWS Load Balancer (ALB)
  - Host-based routing by hostname to each service target group
  - TLS termination with ACM certificates:
    - Wildcard: `*.hirera.net` (66eee1a2-ac68-47bc-b769-24a0c6264ba5)
    - Apex: `hirera.net` (8424a415-88ae-4815-aa51-eb4e659c6597)

## 2) Public API Endpoints

Auth service (https://auth.hirera.net)
- `GET /health` (optionally `?deep=true` to test Cognito connectivity)
- `GET /test-config`
- `POST /auth/signup`
- `POST /auth/confirm`
- `POST /auth/signin`
- `GET /auth/user` (Authorization: Bearer <access_token>)
- `POST /auth/resend-code`
- `POST /auth/change-password` (Authorization: Bearer <access_token>)

Jobs service (https://jobs.hirera.net)
- `GET /health`
- `GET /jobs` (Authorization: Bearer)
- `POST /jobs` (Authorization: Bearer)
- `GET /jobs/:jobId` (Authorization: Bearer)
- `PUT /jobs/:jobId` (Authorization: Bearer)

Web app (https://hirera.net)
- UI pages and API proxies
- Health: `GET /api/health` (aggregated status of auth/jobs)
- Auth proxy routes: `/api/auth/*`
- Jobs proxy routes: `/api/jobs` and `/api/jobs/[id]`

## 3) Environment Variables

Provided values to use (prod):
- AWS Region: `ap-southeast-2`
- Cognito User Pool ID: `ap-southeast-2_mgpu7nJ6g`
- Cognito App Client ID: `f9d6d8k44b4itkipjnljkmd9r`
- Cognito App Client Secret: `n9b5vlish4ddi0pr92m37ami305pqfpuhqg884scdeu55n2pqju`
- DynamoDB Table Name: `hirera-jobs`
- Cognito JWKS URL: `https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_mgpu7nJ6g/.well-known/jwks.json`

Auth service (`auth-service`)
```
AWS_REGION=ap-southeast-2
COGNITO_USER_POOL_ID=ap-southeast-2_mgpu7nJ6g
COGNITO_CLIENT_ID=f9d6d8k44b4itkipjnljkmd9r
COGNITO_CLIENT_SECRET=n9b5vlish4ddi0pr92m37ami305pqfpuhqg884scdeu55n2pqju
PORT=3001
NODE_ENV=production
CORS_ALLOWED_ORIGINS=https://hirera.net,https://www.hirera.net
```

Jobs service (`job-service`)
```
AWS_REGION=ap-southeast-2
COGNITO_USER_POOL_ID=ap-southeast-2_mgpu7nJ6g
DYNAMODB_TABLE_NAME=hirera-jobs
PORT=3002
NODE_ENV=production
CORS_ALLOWED_ORIGINS=https://hirera.net,https://www.hirera.net
```

Web app (`web-app`)
```
NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth.hirera.net
JOB_SERVICE_URL=https://jobs.hirera.net
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-2_mgpu7nJ6g
NEXT_PUBLIC_COGNITO_CLIENT_ID=f9d6d8k44b4itkipjnljkmd9r
NEXT_PUBLIC_COGNITO_REGION=ap-southeast-2
COGNITO_CLIENT_SECRET=n9b5vlish4ddi0pr92m37ami305pqfpuhqg884scdeu55n2pqju
COOKIE_DOMAIN=.hirera.net
COOKIE_SECURE=true
NODE_ENV=production
```

All secrets should be stored in AWS SSM Parameter Store as SecureString and injected via ECS Task Definition `secrets`.

## 4) AWS Parameter Store Paths (already created)

Auth
- `/hirera/prod/auth/AWS_REGION`
- `/hirera/prod/auth/COGNITO_USER_POOL_ID`
- `/hirera/prod/auth/COGNITO_CLIENT_ID`
- `/hirera/prod/auth/COGNITO_CLIENT_SECRET` (SecureString)
- `/hirera/prod/auth/PORT`
- `/hirera/prod/auth/NODE_ENV`
- `/hirera/prod/auth/CORS_ALLOWED_ORIGINS`

Jobs
- `/hirera/prod/jobs/AWS_REGION`
- `/hirera/prod/jobs/COGNITO_USER_POOL_ID`
- `/hirera/prod/jobs/DYNAMODB_TABLE_NAME`
- `/hirera/prod/jobs/PORT`
- `/hirera/prod/jobs/NODE_ENV`
- `/hirera/prod/jobs/CORS_ALLOWED_ORIGINS`

Web
- `/hirera/prod/web/NEXT_PUBLIC_AUTH_SERVICE_URL`
- `/hirera/prod/web/JOB_SERVICE_URL`
- `/hirera/prod/web/NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `/hirera/prod/web/NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `/hirera/prod/web/NEXT_PUBLIC_COGNITO_REGION`
- `/hirera/prod/web/COGNITO_CLIENT_SECRET` (SecureString)
- `/hirera/prod/web/COOKIE_DOMAIN`
- `/hirera/prod/web/COOKIE_SECURE`
- `/hirera/prod/web/NODE_ENV`

## 5) Container Images (ECR)

- `hirera-auth:latest` (pushed)
- `hirera-jobs:latest` (pushed)
- `hirera-web:latest` (build fixed; push success may require retry from stable network)

If pushing from a machine behind a proxy causes broken pipe, push from a clean network or an EC2 builder.

## 6) ALB and Routing

- Security group `hirera-alb-sg` allowing inbound 80/443
- Target groups:
  - `tg-web` (HTTP 3000)
  - `tg-auth` (HTTP 3001)
  - `tg-jobs` (HTTP 3002)
- ACM certs:
  - wildcard: `*.hirera.net` (66eee1a2-ac68-47bc-b769-24a0c6264ba5)
  - apex: `hirera.net` (8424a415-88ae-4815-aa51-eb4e659c6597)
- Listeners:
  - 80 â†’ redirect to 443
  - 443 â†’ host rules
    - `hirera.net`, `www.hirera.net` â†’ `tg-web`
    - `auth.hirera.net` â†’ `tg-auth`
    - `jobs.hirera.net` â†’ `tg-jobs`

## 7) ECS/Fargate

- Cluster: `hirera-cluster`
- Task definitions: `web`, `auth`, `jobs` (each with execution role, task role, and envs/secrets from SSM)
- Services:
  - `web-svc` â†’ `tg-web`
  - `auth-svc` â†’ `tg-auth`
  - `jobs-svc` â†’ `tg-jobs`

IAM task role perms
- Auth: SSM read on `/hirera/prod/auth/*` + Cognito IDP actions listed in code
- Jobs: SSM read on `/hirera/prod/jobs/*` + DynamoDB CRUD on table `hirera-jobs`
- Web: SSM read on `/hirera/prod/web/*` (for secret if needed)

## 8) DNS (Route 53)

Point ALIAS A records to the ALB for:
- `hirera.net`, `www.hirera.net`, `auth.hirera.net`, `jobs.hirera.net`

## 9) Local development

- Compose file (`Hirera/docker-compose.yml`) with Caddy proxy for local TLS and `dynamodb-local`
- Local envs:
  - `Hirera/auth-service/.env.docker`
  - `Hirera/job-service/.env.docker`
  - `Hirera/web-app/.env.docker`
- Start: `docker compose up --build`

## 10) Runbooks

Smoke tests
- Web health: `GET https://hirera.net/api/health`
- Auth health: `GET https://auth.hirera.net/health?deep=true`
- Jobs health: `GET https://jobs.hirera.net/health`

Auth flow
- Sign up: `POST https://hirera.net/api/auth/signup`
- Confirm: `POST https://hirera.net/api/auth/confirm`
- Sign in: `POST https://hirera.net/api/auth/signin` (sets cookies)

Jobs
- `GET/POST https://hirera.net/api/jobs`
- `GET/PUT https://hirera.net/api/jobs/{id}`

## 11) Known follow-ups

- Finish pushing `hirera-web:latest` if not yet in ECR (retry push from stable network)
- Create/validate ECS task definitions and services
- Confirm DNS and ACM validation done
- Optionally add CI/CD (build + push + deploy) and CloudWatch log groups/alarms


