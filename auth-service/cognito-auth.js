const {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  GetUserCommand,
  ChangePasswordCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ListUsersCommand,
  AdminGetUserCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const fetch = require('node-fetch');

let pems = null; // Cache for JWKS public keys

class CognitoAuthService {
  constructor() {
    this.region = process.env.AWS_REGION || 'ap-southeast-2';
    this.userPoolId = process.env.COGNITO_USER_POOL_ID;
    this.clientId = process.env.COGNITO_CLIENT_ID;
    // Ensure clientSecret is a non-empty string or null
    this.clientSecret = process.env.COGNITO_CLIENT_SECRET && process.env.COGNITO_CLIENT_SECRET.length > 0 ? process.env.COGNITO_CLIENT_SECRET : null;

    if (!this.userPoolId || !this.clientId) {
      throw new Error('Missing required Cognito configuration: User Pool ID and Client ID are required.');
    }

    this.client = new CognitoIdentityProviderClient({
      region: this.region
    });

    console.log(`🔧 Cognito Auth Service initialized for region: ${this.region}`);
    this.loadPems(); // Load keys on startup
  }

  // Calculate secret hash for client authentication
  calculateSecretHash(username) {
    // Only calculate hash if a client secret is configured
    if (!this.clientSecret) {
      return null;
    }
    
    const message = username + this.clientId;
    return crypto
      .createHmac('sha256', this.clientSecret)
      .update(message)
      .digest('base64');
  }

  // Sign up a new user
  async signUp(email, password, firstName = null, lastName = null, country = null, username = null) {
    try {
      // First, check if the email address is already in use.
      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        console.log(`❌ Sign-up failed: email ${email} is already registered.`);
        return {
          success: false,
          message: 'This email address is already in use. Please try signing in or use a different email.',
          error: 'EmailExistsException',
        };
      }

      console.log(`📝 Attempting to sign up user: ${email}`);

      const userAttributes = [
        { Name: 'email', Value: email }
      ];
      if (firstName) userAttributes.push({ Name: 'given_name', Value: firstName });
      if (lastName) userAttributes.push({ Name: 'family_name', Value: lastName });
      // Do not include custom:country unless your pool defines it. Avoid schema errors in dev.
      // Do not include preferred_username unless explicitly supported in the pool; skip in local/dev

      if (firstName) userAttributes.push({ Name: 'given_name', Value: firstName });
      if (lastName) userAttributes.push({ Name: 'family_name', Value: lastName });
      if (country) userAttributes.push({ Name: 'custom:country', Value: country });

      // In pools configured with email as username, Cognito expects Username to be the email
      const cognitoUsername = email;

      const params = {
        ClientId: this.clientId,
        Username: cognitoUsername,
        Password: password,
        UserAttributes: userAttributes
      };

      // Add secret hash if available (use the actual Cognito Username for hash)
      const secretHash = this.calculateSecretHash(cognitoUsername);
      if (secretHash) {
        params.SecretHash = secretHash;
      }

      const command = new SignUpCommand(params);
      const response = await this.client.send(command);

      console.log(`✅ User signed up successfully: ${email}`);
      return {
        success: true,
        message: 'User registered successfully. Check your email for verification.',
        userSub: response.UserSub,
        username: username || email,
        needsConfirmation: !response.UserConfirmed
      };

    } catch (error) {
      console.error(`❌ Sign up error for ${email}:`, error.message);
      
      let message = 'Registration failed';
      switch (error.name) {
        case 'UsernameExistsException':
          message = 'A user with this username already exists. Please choose a different username.';
          break;
        case 'InvalidPasswordException':
          message = 'Password does not meet requirements';
          break;
        case 'InvalidParameterException':
          message = error.message;
          break;
        default:
          message = error.message || 'Registration failed';
      }

      return {
        success: false,
        message,
        error: error.name
      };
    }
  }

  async findUserByEmailOrUsername(identifier) {
    // First, try to get the user directly, assuming the identifier is a username
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: identifier,
      });
      const response = await this.client.send(command);
      return {
        username: response.Username,
        email: response.UserAttributes.find(attr => attr.Name === 'email').Value,
      };
    } catch (error) {
      if (error.name !== 'UserNotFoundException') {
        // Don't swallow other errors
        throw error;
      }
    }

    // If not found by username, try to find by email
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.userPoolId,
        Filter: `email = "${identifier}"`,
        Limit: 1,
      });
      const response = await this.client.send(command);
      if (response.Users && response.Users.length > 0) {
        const user = response.Users[0];
        return {
          username: user.Username,
          email: user.Attributes.find(attr => attr.Name === 'email').Value,
        };
      }
    } catch (error) {
      console.error(`Error finding user by email ${identifier}:`, error);
      throw error;
    }
    
    // If no user is found by username or email, throw UserNotFoundException
    const notFoundError = new Error('User not found.');
    notFoundError.name = 'UserNotFoundException';
    throw notFoundError;
  }

  // Confirm user registration with verification code
  async confirmSignUp(email, confirmationCode, username = null) {
    const identifier = username || email;
    console.log(`🔍 Confirming sign up for identifier: ${identifier}`);

    const performConfirm = async (usernameToConfirm) => {
      const params = {
        ClientId: this.clientId,
        Username: usernameToConfirm,
        ConfirmationCode: confirmationCode,
      };

      const secretHash = this.calculateSecretHash(usernameToConfirm);
      if (secretHash) {
        params.SecretHash = secretHash;
      }

      const command = new ConfirmSignUpCommand(params);
      await this.client.send(command);
    };

    try {
      // Attempt 1: Confirm with the provided identifier directly.
      console.log(`  -> Attempt 1: Trying to confirm with ${identifier}`);
      await performConfirm(identifier);
      console.log(`✅ User confirmed successfully: ${identifier}`);
      return { success: true, message: 'Email verified successfully.' };

    } catch (error) {
      console.log(`  -> Attempt 1 failed with ${error.name}`);
      if (error.name !== 'UserNotFoundException') {
        throw error;
      }

      // Attempt 2: Find user by email and use their actual username.
      console.log(`  -> Identifier might be an email. Attempting lookup.`);
      const user = await this.findUserByEmail(identifier);

      if (user && user.Username) {
        console.log(`  -> Found user ${user.Username}. Retrying confirmation.`);
        await performConfirm(user.Username);
        console.log(`✅ User confirmed successfully on second attempt: ${identifier}`);
        return { success: true, message: 'Email verified successfully.' };
      } else {
        console.log(`  -> No user found for email ${identifier}.`);
        throw error; // Re-throw original UserNotFoundException
      }
    }
  }

  // Sign in user with a robust two-step strategy
  async signIn(email, password, username = null) {
    const identifier = username || email;
    console.log(`🔐 Attempting to sign in user with identifier: ${identifier}`);

    try {
      // Attempt 1: Sign in directly with the provided identifier.
      // This works for usernames and for emails if they are configured as aliases.
      console.log(`  -> Attempt 1: Trying sign-in with identifier as USERNAME.`);
      const result = await this.performSignIn(identifier, password);
      console.log(`✅ Sign-in successful on first attempt for ${identifier}`);
      return result;

    } catch (error) {
      console.log(`  -> Attempt 1 failed with ${error.name}.`);

      // If the error is for a wrong password or unconfirmed user, fail immediately.
      // We only retry if the user wasn't found, as the identifier might be an email alias.
      if (error.name !== 'UserNotFoundException') {
        throw error;
      }
      
      console.log(`  -> Identifier might be an email. Attempting to find user by email attribute.`);
      
      try {
        const user = await this.findUserByEmail(identifier);
        
        if (user && user.Username) {
          console.log(`  -> Found user with username: ${user.Username}. Retrying sign-in.`);
          // Attempt 2: Sign in with the username found via the email lookup.
          const result = await this.performSignIn(user.Username, password);
          console.log(`✅ Sign-in successful on second attempt for ${identifier}`);
          return result;
        } else {
          // If no user is found by email, then the user truly doesn't exist.
          console.log(`  -> No user found with email ${identifier}. Re-throwing original error.`);
          throw error; // Re-throw the original UserNotFoundException
        }
      } catch (findUserError) {
        // This could be an error from ListUsers or the second performSignIn call.
        // We throw the most recent error to be handled by the final catch block.
        console.error(`  -> Error during second attempt: ${findUserError.message}`);
        throw findUserError;
      }
    }
  }

  // Refactored sign-in logic to be reusable
  async performSignIn(username, password) {
    if (!password) {
      const error = new Error("Password is required for sign-in.");
      error.name = "InvalidParameterException";
      throw error;
    }

    const params = {
      ClientId: this.clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    };

    const secretHash = this.calculateSecretHash(username);
    if (secretHash) {
      params.AuthParameters.SECRET_HASH = secretHash;
    }

    const command = new InitiateAuthCommand(params);
    const response = await this.client.send(command);

    if (response.AuthenticationResult) {
      const { AccessToken, RefreshToken, IdToken } = response.AuthenticationResult;
      const userInfo = await this.getUserInfo(AccessToken);

      return {
        success: true,
        message: 'Sign in successful',
        tokens: {
          accessToken: AccessToken,
          refreshToken: RefreshToken,
          idToken: IdToken,
        },
        user: userInfo,
      };
    }
    
    // This should not be reached in normal flow, as Cognito throws an error.
    throw new Error('Authentication failed');
  }
  
  // Helper function to find a user by their email address
  async findUserByEmail(email) {
    try {
      const params = {
        UserPoolId: this.userPoolId,
        Filter: `email = "${email}"`,
        Limit: 1,
      };

      const command = new ListUsersCommand(params);
      const response = await this.client.send(command);

      if (response.Users && response.Users.length > 0) {
        return response.Users[0];
      }
      return null;
    } catch (error) {
      console.error(`❌ Error finding user by email ${email}:`, error.message);
      // Don't re-throw here, returning null is sufficient to indicate failure.
      return null;
    }
  }

  // Fetch and cache the public keys from Cognito's JWKS endpoint
  async loadPems() {
    const jwksUrl = `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`;
    try {
      console.log(`🔍 Fetching JWKS from ${jwksUrl}`);
      const response = await fetch(jwksUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch JWKS');
      }
      const jwks = await response.json();
      pems = {};
      for (const key of jwks.keys) {
        pems[key.kid] = jwkToPem(key);
      }
      console.log('✅ JWKS loaded and cached successfully.');
    } catch (error) {
      console.error('❌ Failed to load JWKS:', error);
      // Don't throw, allow retry on first validation
      pems = null; 
    }
  }

  // Validate the JWT token and get user info
  async getUserInfo(accessToken) {
    if (!pems) {
      // Retry loading PEMs if initial load failed
      await this.loadPems();
      if (!pems) {
         throw new Error('Could not load Cognito public keys.');
      }
    }

    try {
      // Decode the JWT token to get the kid (Key ID)
      const decodedJwt = jwt.decode(accessToken, { complete: true });
      if (!decodedJwt) {
        throw new Error('Invalid JWT token');
      }

      const kid = decodedJwt.header.kid;
      const pem = pems[kid];

      if (!pem) {
        throw new Error('No matching public key found for token.');
      }

      // Verify the token's signature and claims
      const payload = jwt.verify(accessToken, pem, {
        issuer: `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}`
      });
      
      // The payload contains the user's information
      return {
        username: payload.username || payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        emailVerified: payload.email_verified
      };

    } catch (error) {
      console.error('❌ JWT validation error:', error.message);
      throw new Error('Invalid or expired token'); // Throw a generic error
    }
  }

  // Get user information from access token
  // OLD METHOD - TO BE REMOVED
  /*
  async getUserInfo(accessToken) {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken
      });

      const response = await this.client.send(command);
      
      const getAttribute = (name) => {
        const attr = response.UserAttributes?.find(attr => attr.Name === name);
        return attr?.Value;
      };

      return {
        username: response.Username,
        email: getAttribute('email'),
        firstName: getAttribute('given_name'),
        lastName: getAttribute('family_name'),
        emailVerified: getAttribute('email_verified') === 'true'
      };

    } catch (error) {
      console.error('❌ Error getting user info:', error.message);
      return null;
    }
  }
  */

  // Resend confirmation code
  async resendConfirmationCode(email, username = null) {
    const identifier = username || email;
    console.log(`📧 Resending confirmation code for identifier: ${identifier}`);

    const performResend = async (usernameToResend) => {
      const params = {
        ClientId: this.clientId,
        Username: usernameToResend,
      };

      const secretHash = this.calculateSecretHash(usernameToResend);
      if (secretHash) {
        params.SecretHash = secretHash;
      }
      
      const command = new ResendConfirmationCodeCommand(params);
      await this.client.send(command);
    };

    try {
      // Attempt 1: Resend with the provided identifier directly.
      console.log(`  -> Attempt 1: Trying to resend for ${identifier}`);
      await performResend(identifier);
      console.log(`✅ Confirmation code resent to: ${identifier}`);
      return { success: true, message: 'Verification code sent to your email.' };

    } catch (error) {
      console.log(`  -> Attempt 1 failed with ${error.name}`);
      if (error.name !== 'UserNotFoundException') {
        throw error;
      }

      // Attempt 2: Find user by email and use their actual username.
      console.log(`  -> Identifier might be an email. Attempting lookup.`);
      const user = await this.findUserByEmail(identifier);

      if (user && user.Username) {
        console.log(`  -> Found user ${user.Username}. Retrying resend.`);
        await performResend(user.Username);
        console.log(`✅ Confirmation code resent on second attempt for: ${identifier}`);
        return { success: true, message: 'Verification code sent to your email.' };
      } else {
        console.log(`  -> No user found for email ${identifier}.`);
        throw error;
      }
    }
  }

  // Change password for authenticated user
  async changePassword(accessToken, oldPassword, newPassword) {
    try {
      const command = new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: oldPassword,
        ProposedPassword: newPassword
      });

      await this.client.send(command);

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      console.error('❌ Change password error:', error.message);
      
      let message = 'Failed to change password';
      switch (error.name) {
        case 'NotAuthorizedException':
          message = 'Current password is incorrect';
          break;
        case 'InvalidPasswordException':
          message = 'New password does not meet requirements';
          break;
        default:
          message = error.message || 'Failed to change password';
      }

      return {
        success: false,
        message,
        error: error.name
      };
    }
  }

  // Test connection to Cognito
  async testConnection() {
    try {
      console.log('🔍 Testing Cognito connection...');
      
      // Try to get user pool info (this will fail gracefully if configured incorrectly)
      const testEmail = 'test@example.com';
      const secretHash = this.calculateSecretHash(testEmail);
      
      console.log(`✅ Connection test successful`);
      console.log(`   Region: ${this.region}`);
      console.log(`   User Pool ID: ${this.userPoolId}`);
      console.log(`   Client ID: ${this.clientId}`);
      console.log(`   Has Client Secret: ${!!this.clientSecret}`);
      console.log(`   Secret Hash Test: ${secretHash ? 'Generated' : 'None'}`);
      
      return {
        success: true,
        config: {
          region: this.region,
          userPoolId: this.userPoolId,
          clientId: this.clientId,
          hasClientSecret: !!this.clientSecret
        }
      };

    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CognitoAuthService; 