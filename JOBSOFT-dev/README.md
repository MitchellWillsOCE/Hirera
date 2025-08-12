# Job Tracker Application

A modern job application tracking system built with Next.js, AWS Cognito for authentication, and DynamoDB for data storage.

## Features

- **Authentication**: Secure user authentication with AWS Cognito
- **Job Tracking**: Track job applications with status updates
- **Analytics Dashboard**: Visualize application trends and statistics
- **Goal Setting**: Set and track career goals
- **Profile Management**: Manage user profiles and settings

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Authentication**: AWS Cognito with OIDC
- **Database**: AWS DynamoDB
- **Deployment**: Serverless architecture ready

## Prerequisites

- Node.js 18+ and npm
- AWS Account with appropriate permissions
- AWS CLI configured (optional but recommended)

## AWS Cognito Setup

### 1. Create Cognito User Pool

1. Go to AWS Cognito Console
2. Click "Create user pool"
3. Configure the following settings:

**Step 1: Configure sign-in experience**
- Sign-in options: Email
- User name requirements: Allow users to sign in with email

**Step 2: Configure security requirements**
- Password policy: Use default or customize as needed
- Multi-factor authentication: Optional (recommended: Optional MFA)

**Step 3: Configure sign-up experience**
- Self-service sign-up: Enable
- Required attributes: Email
- Optional attributes: given_name, family_name (if you want to collect names)

**Step 4: Configure message delivery**
- Email provider: Send email with Cognito (for development)
- FROM email address: Use default

**Step 5: Integrate your app**
- User pool name: `JobTracker-UserPool` (or your preferred name)
- App client name: `JobTracker-Client`
- Client secret: **Generate a client secret** (Important!)
- Authentication flows:
  - ✅ ALLOW_USER_PASSWORD_AUTH
  - ✅ ALLOW_USER_SRP_AUTH  
  - ✅ ALLOW_REFRESH_TOKEN_AUTH

### 2. Configure App Client Settings

After creating the user pool:

1. Go to your User Pool → App integration → App clients
2. Select your app client
3. Ensure the following authentication flows are enabled:
   - ✅ ALLOW_USER_PASSWORD_AUTH
   - ✅ ALLOW_USER_SRP_AUTH
   - ✅ ALLOW_REFRESH_TOKEN_AUTH

### 3. Get Configuration Values

From your User Pool, collect these values:
- **User Pool ID**: Found in "General settings"
- **App Client ID**: Found in "App clients"
- **App Client Secret**: Found in "App clients" → Show Details
- **Region**: The AWS region where you created the pool

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd JOBSOFT-dev
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the `JOBSOFT-dev` directory:

```env
# Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID="your-user-pool-id"
NEXT_PUBLIC_COGNITO_CLIENT_ID="your-app-client-id"
NEXT_PUBLIC_COGNITO_REGION="your-aws-region"
NEXT_PUBLIC_COGNITO_DOMAIN="your-cognito-domain.auth.region.amazoncognito.com"

# Client Secret (Server-side only)
COGNITO_CLIENT_SECRET="your-actual-client-secret"

# AWS Credentials for DynamoDB
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"

# JWT Configuration
JWT_SECRET="your-jwt-secret-key-here"
```

**Important**: Replace all placeholder values with your actual AWS Cognito configuration.

### 3. DynamoDB Setup

The application uses DynamoDB for data storage. Ensure your AWS credentials have the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/JobTracker-*"
    }
  ]
}
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Troubleshooting

### Authentication Issues

**Error: "Auth flow not enabled for this client"**
- Solution: Ensure `ALLOW_USER_PASSWORD_AUTH` is enabled in your Cognito App Client settings

**Error: "Username cannot be of email format"**
- Solution: Configure your User Pool to allow email as username in sign-in options

**Error: "Authentication configuration issue"**
- Solution: Verify all environment variables are correctly set in `.env.local`

### Common Setup Issues

1. **Missing Client Secret**: Ensure you generated and correctly copied the client secret
2. **Wrong Region**: Verify the region matches where your Cognito resources are created
3. **Invalid Credentials**: Check your AWS access keys have the required permissions

### Testing Authentication

1. Go to `/auth/signup` to create a new account
2. Check your email for verification code
3. Use the verification code to confirm your account
4. Sign in at `/auth/signin`

## Project Structure

```
JOBSOFT-dev/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   └── dashboard/         # Dashboard pages
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   │   ├── cognito-direct.ts  # Direct Cognito integration
│   │   ├── auth-oidc.ts       # OIDC authentication
│   │   └── dynamodb.ts        # DynamoDB client
│   ├── services/              # Business logic services
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── ...config files
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create components in `src/components/`
2. Add API routes in `src/app/api/`
3. Implement business logic in `src/services/`
4. Update types in `src/types/`

## Deployment

This application is designed for serverless deployment on AWS:

1. **Frontend**: Deploy to AWS S3 + CloudFront or Vercel
2. **API**: Deploy as AWS Lambda functions
3. **Database**: Uses AWS DynamoDB
4. **Authentication**: AWS Cognito

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are correctly configured
3. Ensure AWS Cognito is properly set up with the correct authentication flows
4. Check AWS CloudWatch logs for detailed error messages

## License

[Add your license information here]
