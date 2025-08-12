import { Amplify } from 'aws-amplify';
import { signUp, signIn, signOut, confirmSignUp, getCurrentUser, fetchAuthSession, type AuthError } from 'aws-amplify/auth';

// Configure Amplify
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      loginWith: {
        email: true,
        username: true
      }
    }
  }
};

// Initialize Amplify
Amplify.configure(amplifyConfig);

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  country?: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  country?: string;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  userSub?: string;
  username?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export class CognitoService {
  /**
   * Sign up a new user
   */
  static async signUp(request: SignUpRequest): Promise<SignUpResponse> {
    try {
      // Create a deterministic username based on email for consistency
      const emailPrefix = request.email.split('@')[0];
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const username = `${emailPrefix}_${timestamp}_${randomSuffix}`.toLowerCase();
      
      console.log('Creating user with username:', username, 'and email:', request.email);
      
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: username,
        password: request.password,
        options: {
          userAttributes: {
            email: request.email,
            given_name: request.firstName,
            family_name: request.lastName,
            'custom:country': request.country || 'US'
          },
          autoSignIn: false // Disable auto sign-in for proper verification flow
        }
      });

      console.log('Sign up result:', { isSignUpComplete, userId, nextStep });

      if (nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
        return {
          success: true,
          message: 'Please check your email for verification code',
          userSub: userId,
          username: username
        };
      }

      return {
        success: true,
        message: 'Sign up successful',
        userSub: userId,
        username: username
      };
    } catch (error) {
      console.error('Sign up error:', error);
      const authError = error as AuthError;
      return {
        success: false,
        message: authError.message || 'Sign up failed'
      };
    }
  }

  /**
   * Confirm sign up with verification code
   * This should use the exact username that was generated during signup
   */
  static async confirmSignUp(username: string, confirmationCode: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Confirming signup with username:', username, 'and code:', confirmationCode);
      
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: username, // Use the exact username from signup
        confirmationCode
      });

      console.log('Confirm sign up result:', { isSignUpComplete, nextStep });

      if (isSignUpComplete) {
        return {
          success: true,
          message: 'Email verified successfully. You can now sign in with your email.'
        };
      }

      return {
        success: false,
        message: 'Email verification incomplete'
      };
    } catch (error) {
      console.error('Confirm sign up error:', error);
      const authError = error as AuthError;
      return {
        success: false,
        message: authError.message || 'Email verification failed'
      };
    }
  }

  /**
   * Sign in user
   */
  static async signIn(request: SignInRequest): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: request.email,
        password: request.password
      });

      console.log('Sign in result:', { isSignedIn, nextStep });

      if (isSignedIn) {
        const user = await this.getCurrentUser();
        return {
          success: true,
          message: 'Sign in successful',
          user: user || undefined
        };
      }

      if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        return {
          success: false,
          message: 'Please verify your email before signing in'
        };
      }

      return {
        success: false,
        message: 'Sign in incomplete'
      };
    } catch (error) {
      console.error('Sign in error:', error);
      const authError = error as AuthError;
      return {
        success: false,
        message: authError.message || 'Sign in failed'
      };
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<{ success: boolean; message: string }> {
    try {
      await signOut();
      return {
        success: true,
        message: 'Signed out successfully'
      };
    } catch (error) {
      console.error('Sign out error:', error);
      const authError = error as AuthError;
      return {
        success: false,
        message: authError.message || 'Sign out failed'
      };
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { username, userId, signInDetails } = await getCurrentUser();
      
      // Get user attributes from the session
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken;
      
      if (!token) {
        return null;
      }

      // Parse user attributes from JWT token
      const payload = JSON.parse(atob(token.toString().split('.')[1]));
      
      return {
        id: userId || username,
        email: payload.email || username,
        firstName: payload.given_name,
        lastName: payload.family_name,
        country: payload['custom:country']
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get access token for API calls
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Note: This requires the user to be signed in
      // AWS Amplify doesn't export changePassword directly in v6
      // We'll need to implement this using the underlying Cognito client
      // For now, return a placeholder
      return {
        success: false,
        message: 'Password change not implemented yet'
      };
    } catch (error) {
      console.error('Change password error:', error);
      const authError = error as AuthError;
      return {
        success: false,
        message: authError.message || 'Password change failed'
      };
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      // Note: This requires the user to be signed in
      // AWS Amplify doesn't export deleteUser directly in v6
      // We'll need to implement this using the underlying Cognito client
      // For now, return a placeholder
      return {
        success: false,
        message: 'Account deletion not implemented yet'
      };
    } catch (error) {
      console.error('Delete account error:', error);
      const authError = error as AuthError;
      return {
        success: false,
        message: authError.message || 'Account deletion failed'
      };
    }
  }
}

// Export functions for API routes
export const changePassword = async (email: string, oldPassword: string, newPassword: string) => {
  return CognitoService.changePassword(oldPassword, newPassword);
};

export const deleteUser = async (email: string) => {
  return CognitoService.deleteAccount();
}; 




