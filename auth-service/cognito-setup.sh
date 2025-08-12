#!/bin/bash

# AWS Cognito Setup Script
# This script creates a Cognito User Pool and App Client for authentication

set -e

# Configuration
USER_POOL_NAME="JobTracker-UserPool"
APP_CLIENT_NAME="JobTracker-AuthService"
REGION="ap-southeast-2"

echo "🚀 Setting up AWS Cognito User Pool..."

# Create User Pool
echo "Creating User Pool: $USER_POOL_NAME"
USER_POOL_OUTPUT=$(aws cognito-idp create-user-pool \
  --pool-name "$USER_POOL_NAME" \
  --region "$REGION" \
  --policies PasswordPolicy='{MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}' \
  --username-attributes username \
  --alias-attributes email \
  --auto-verified-attributes email \
  --verification-message-template DefaultEmailOption=CONFIRM_WITH_CODE \
  --admin-create-user-config AllowAdminCreateUserOnly=false \
  --account-recovery-setting RecoveryMechanisms='[{Name=verified_email,Priority=1}]')

USER_POOL_ID=$(echo $USER_POOL_OUTPUT | jq -r '.UserPool.Id')
echo "✅ User Pool created with ID: $USER_POOL_ID"

# Create App Client
echo "Creating App Client: $APP_CLIENT_NAME"
APP_CLIENT_OUTPUT=$(aws cognito-idp create-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-name "$APP_CLIENT_NAME" \
  --region "$REGION" \
  --generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --prevent-user-existence-errors ENABLED \
  --enable-token-revocation)

APP_CLIENT_ID=$(echo $APP_CLIENT_OUTPUT | jq -r '.UserPoolClient.ClientId')
echo "✅ App Client created with ID: $APP_CLIENT_ID"

# Get Client Secret
CLIENT_SECRET_OUTPUT=$(aws cognito-idp describe-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-id "$APP_CLIENT_ID" \
  --region "$REGION")

CLIENT_SECRET=$(echo $CLIENT_SECRET_OUTPUT | jq -r '.UserPoolClient.ClientSecret')

# Create .env file
echo "📝 Creating .env file..."
cat > .env << EOF
# AWS Cognito Configuration
AWS_REGION=$REGION
COGNITO_USER_POOL_ID=$USER_POOL_ID
COGNITO_CLIENT_ID=$APP_CLIENT_ID
COGNITO_CLIENT_SECRET=$CLIENT_SECRET

# Service Configuration
PORT=3001
NODE_ENV=development
EOF

echo "✅ Configuration saved to .env file"

# Display configuration
echo ""
echo "🎉 Cognito setup complete!"
echo "================================"
echo "User Pool ID: $USER_POOL_ID"
echo "App Client ID: $APP_CLIENT_ID"
echo "Region: $REGION"
echo "Client Secret: $CLIENT_SECRET"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm start"
echo "3. Test with: npm test"
echo ""

# Save config for easy reference
cat > cognito-config.json << EOF
{
  "userPoolId": "$USER_POOL_ID",
  "clientId": "$APP_CLIENT_ID",
  "clientSecret": "$CLIENT_SECRET",
  "region": "$REGION"
}
EOF

echo "Configuration also saved to: cognito-config.json" 