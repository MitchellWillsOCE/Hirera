# Hirera Deployment (AWS ECS/Fargate)

This folder contains ECS task definitions and a checklist to deploy the web, auth, and jobs services per the operations plan.

## Prerequisites
- AWS account (Region: ap-southeast-2)
- ECR repositories: `hirera-web`, `hirera-auth`, `hirera-jobs`
- ECS cluster: `hirera-cluster`
- ALB with host rules:
  - `hirera.net`, `www.hirera.net` → web target group (3000)
  - `auth.hirera.net` → auth target group (3001)
  - `jobs.hirera.net` → jobs target group (3002)
- IAM roles:
  - `ecsTaskExecutionRole`
  - `hirera-web-task-role`, `hirera-auth-task-role`, `hirera-jobs-task-role`
- SSM Parameter Store values defined under `/hirera/prod/...` (see OPERATIONS_PLAN.md)

## Build and push images
```bash
# Authenticate to ECR
aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com

# Build
docker build -t hirera-web:latest Hirera/JOBSOFT-dev
docker build -t hirera-auth:latest Hirera/auth-service
docker build -t hirera-jobs:latest Hirera/job-service

# Tag
docker tag hirera-web:latest ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/hirera-web:latest
docker tag hirera-auth:latest ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/hirera-auth:latest
docker tag hirera-jobs:latest ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/hirera-jobs:latest

# Push
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/hirera-web:latest
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/hirera-auth:latest
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/hirera-jobs:latest
```

## Register task definitions
Replace `ACCOUNT_ID` then run:
```bash
aws ecs register-task-definition --cli-input-json file://Hirera/deploy/ecs-task-def-auth.json
aws ecs register-task-definition --cli-input-json file://Hirera/deploy/ecs-task-def-jobs.json
aws ecs register-task-definition --cli-input-json file://Hirera/deploy/ecs-task-def-web.json
```

## Create/Update ECS services
```bash
aws ecs create-service \
  --cluster hirera-cluster \
  --service-name auth-svc \
  --task-definition hirera-auth \
  --launch-type FARGATE \
  --desired-count 1 \
  --network-configuration awsvpcConfiguration={subnets=[SUBNET_IDS],securityGroups=[SG_ID],assignPublicIp=ENABLED} \
  --load-balancers targetGroupArn=TG_AUTH,containerName=auth,containerPort=3001

aws ecs create-service \
  --cluster hirera-cluster \
  --service-name jobs-svc \
  --task-definition hirera-jobs \
  --launch-type FARGATE \
  --desired-count 1 \
  --network-configuration awsvpcConfiguration={subnets=[SUBNET_IDS],securityGroups=[SG_ID],assignPublicIp=ENABLED} \
  --load-balancers targetGroupArn=TG_JOBS,containerName=jobs,containerPort=3002

aws ecs create-service \
  --cluster hirera-cluster \
  --service-name web-svc \
  --task-definition hirera-web \
  --launch-type FARGATE \
  --desired-count 1 \
  --network-configuration awsvpcConfiguration={subnets=[SUBNET_IDS],securityGroups=[SG_ID],assignPublicIp=ENABLED} \
  --load-balancers targetGroupArn=TG_WEB,containerName=web,containerPort=3000
```

To update services after new images:
```bash
aws ecs update-service --cluster hirera-cluster --service auth-svc --force-new-deployment
aws ecs update-service --cluster hirera-cluster --service jobs-svc --force-new-deployment
aws ecs update-service --cluster hirera-cluster --service web-svc --force-new-deployment
```

## Smoke tests
- Web: `https://hirera.net/api/health`
- Auth: `https://auth.hirera.net/health?deep=true`
- Jobs: `https://jobs.hirera.net/health`

## Notes
- Ensure ACM certs are attached to ALB and DNS A/ALIAS records point to ALB.
- If behind a proxy and push fails, retry from a stable network or an EC2 builder.




