import { 
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  GetUserCommand,
  ChangePasswordCommand,
  AdminGetUserCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { createHmac } from 'crypto';

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  emailVerified?: boolean;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
}

export interface SignUpResult {
  success: boolean;
  message: string;
  userSub?: string;
  needsConfirmation?: boolean;
}

class CognitoDirectService {
  private client: CognitoIdentityProviderClient;
  private readonly userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
  private readonly clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
  private readonly clientSecret = process.env.COGNITO_CLIENT_SECRET || '';
  private readonly region = process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-southeast-2';

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    });
  }

  private calculateSecretHash(username: string): string {
    if (!this.clientSecret) return '';
    
    const message = username + this.clientId;
    return createHmac('sha256', this.clientSecret)
      .update(message)
      .digest('base64');
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const secretHash = this.calculateSecretHash(email);
      
      const authParams: any = {
        USERNAME: email,
        PASSWORD: password,
      };

      if (secretHash) {
        authParams.SECRET_HASH = secretHash;
      }

      // Try USER_PASSWORD_AUTH first, fallback to USER_SRP_AUTH if needed
      let command = new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: authParams,
      });

      let response;
      
      try {
        response = await this.client.send(command);
      } catch (flowError: any) {
        if (flowError.name === 'InvalidParameterException' && 
            flowError.message?.includes('Auth flow not enabled')) {
          // Try with SRP auth flow as fallback
          command = new InitiateAuthCommand({
            ClientId: this.clientId,
            AuthFlow: 'USER_SRP_AUTH',
            AuthParameters: {
              USERNAME: email,
              SRP_A: 'placeholder', // This would need proper SRP implementation
              ...(secretHash && { SECRET_HASH: secretHash })
            },
          });
          
          // For now, return a helpful error message
          return {
            success: false,
            message: 'Please configure USER_PASSWORD_AUTH flow in your Cognito User Pool client settings, or contact support.'
          };
        }
        throw flowError;
      }

      if (response.AuthenticationResult) {
        const { AccessToken, RefreshToken, IdToken } = response.AuthenticationResult;
        
        // Get user details
        const user = await this.getUserFromToken(AccessToken!);
        
        return {
          success: true,
          message: 'Sign in successful',
          user: user || undefined,
          accessToken: AccessToken,
          refreshToken: RefreshToken,
          idToken: IdToken
        };
      } else if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        return {
          success: false,
          message: 'New password required. Please contact support.'
        };
      } else {
        return {
          success: false,
          message: 'Authentication failed'
        };
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      switch (error.name) {
        case 'NotAuthorizedException':
          return { success: false, message: 'Invalid email or password' };
        case 'UserNotConfirmedException':
          return { success: false, message: 'Please verify your email before signing in' };
        case 'UserNotFoundException':
          return { success: false, message: 'User not found' };
        case 'TooManyRequestsException':
          return { success: false, message: 'Too many requests. Please try again later.' };
        case 'InvalidParameterException':
          if (error.message?.includes('Auth flow not enabled')) {
            return { success: false, message: 'Authentication method not configured. Please contact support.' };
          }
          return { success: false, message: 'Authentication configuration issue. Please contact support.' };
        default:
          return { success: false, message: 'Sign in failed. Please try again.' };
      }
    }
  }

  async signUp(
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string, 
    country?: string
  ): Promise<SignUpResult> {
    try {
      const attributes = [
        { Name: 'email', Value: email }
      ];

      if (firstName) attributes.push({ Name: 'given_name', Value: firstName });
      if (lastName) attributes.push({ Name: 'family_name', Value: lastName });
      if (country) attributes.push({ Name: 'custom:country', Value: country });

      const secretHash = this.calculateSecretHash(email);
      
      const commandParams: any = {
        ClientId: this.clientId,
        Username: email, // Using email as username since pool supports email aliases
        Password: password,
        UserAttributes: attributes,
      };

      if (secretHash) {
        commandParams.SecretHash = secretHash;
      }

      const command = new SignUpCommand(commandParams);

      const response = await this.client.send(command);

      return {
        success: true,
        message: 'Account created successfully. Please check your email for verification code.',
        userSub: response.UserSub,
        needsConfirmation: !response.UserConfirmed
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      switch (error.name) {
        case 'UsernameExistsException':
          return { success: false, message: 'An account with this email already exists' };
        case 'InvalidPasswordException':
          return { success: false, message: 'Password does not meet requirements' };
        case 'InvalidParameterException':
          return { success: false, message: error.message || 'Invalid email format' };
        case 'TooManyRequestsException':
          return { success: false, message: 'Too many requests. Please try again later.' };
        default:
          return { success: false, message: 'Sign up failed. Please try again.' };
      }
    }
  }

  async confirmSignUp(email: string, confirmationCode: string): Promise<{ success: boolean; message: string }> {
    try {
      const secretHash = this.calculateSecretHash(email);
      
      const commandParams: any = {
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: confirmationCode,
      };

      if (secretHash) {
        commandParams.SecretHash = secretHash;
      }

      const command = new ConfirmSignUpCommand(commandParams);

      await this.client.send(command);

      return {
        success: true,
        message: 'Email verified successfully. You can now sign in.'
      };
    } catch (error: any) {
      console.error('Confirm sign up error:', error);
      
      switch (error.name) {
        case 'CodeMismatchException':
          return { success: false, message: 'Invalid verification code' };
        case 'ExpiredCodeException':
          return { success: false, message: 'Verification code has expired' };
        case 'NotAuthorizedException':
          return { success: false, message: 'User is already confirmed' };
        default:
          return { success: false, message: 'Email verification failed. Please try again.' };
      }
    }
  }

  async resendConfirmationCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const secretHash = this.calculateSecretHash(email);
      
      const commandParams: any = {
        ClientId: this.clientId,
        Username: email,
      };

      if (secretHash) {
        commandParams.SecretHash = secretHash;
      }

      const command = new ResendConfirmationCodeCommand(commandParams);

      await this.client.send(command);

      return {
        success: true,
        message: 'Verification code sent to your email'
      };
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      return { success: false, message: 'Failed to resend verification code' };
    }
  }

  async getUserFromToken(accessToken: string): Promise<User | null> {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken
      });

      const response = await this.client.send(command);
      
      const getAttributeValue = (name: string) => {
        const attr = response.UserAttributes?.find(attr => attr.Name === name);
        return attr?.Value;
      };

      return {
        id: response.Username!,
        email: getAttributeValue('email') || '',
        name: getAttributeValue('name'),
        firstName: getAttributeValue('given_name'),
        lastName: getAttributeValue('family_name'),
        country: getAttributeValue('custom:country'),
        emailVerified: getAttributeValue('email_verified') === 'true'
      };
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  }

  async changePassword(accessToken: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const command = new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: oldPassword,
        ProposedPassword: newPassword,
      });

      await this.client.send(command);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error: any) {
      console.error('Change password error:', error);
      
      switch (error.name) {
        case 'NotAuthorizedException':
          return { success: false, message: 'Current password is incorrect' };
        case 'InvalidPasswordException':
          return { success: false, message: 'New password does not meet requirements' };
        default:
          return { success: false, message: 'Failed to change password' };
      }
    }
  }
}

export const cognitoService = new CognitoDirectService(); 