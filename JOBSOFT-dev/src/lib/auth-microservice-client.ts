export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  emailVerified?: boolean;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
  };
}

export interface SignUpResult {
  success: boolean;
  message: string;
  username?: string;
  needsConfirmation?: boolean;
}

export interface ConfirmResult {
  success: boolean;
  message: string;
}

class AuthMicroserviceClient {
  private readonly baseUrl: string;

  constructor() {
    // Use environment variable for auth service URL, defaulting to local development
    this.baseUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001';
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async signUp(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    country?: string,
    username?: string
  ): Promise<SignUpResult> {
    try {
      const result = await this.makeRequest<SignUpResult>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          country,
          username,
        }),
      });

      return result;
    } catch (error) {
      console.error('SignUp error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  }

  async signIn(email: string, password: string, username?: string): Promise<AuthResult> {
    try {
      const result = await this.makeRequest<AuthResult>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      });

      return result;
    } catch (error) {
      console.error('SignIn error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  async checkUserExists(email: string): Promise<AuthResult> {
    // This re-uses the signIn endpoint which has special handling for no password.
    return this.signIn(email, "");
  }

  async confirmSignUp(
    email: string,
    confirmationCode: string,
    username?: string
  ): Promise<ConfirmResult> {
    try {
      const result = await this.makeRequest<ConfirmResult>('/auth/confirm', {
        method: 'POST',
        body: JSON.stringify({
          email,
          confirmationCode,
          username,
        }),
      });

      return result;
    } catch (error) {
      console.error('Confirm SignUp error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Email confirmation failed',
      };
    }
  }

  async resendConfirmationCode(email: string, username?: string): Promise<ConfirmResult> {
    try {
      const result = await this.makeRequest<ConfirmResult>('/auth/resend-code', {
        method: 'POST',
        body: JSON.stringify({
          email,
          username,
        }),
      });

      return result;
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to resend confirmation code',
      };
    }
  }

  async getUser(accessToken: string): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const result = await this.makeRequest<{ success: boolean; user: User }>('/auth/user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return result;
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user',
      };
    }
  }

  async changePassword(
    accessToken: string,
    oldPassword: string,
    newPassword: string
  ): Promise<ConfirmResult> {
    try {
      const result = await this.makeRequest<ConfirmResult>('/auth/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      return result;
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to change password',
      };
    }
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const result = await this.makeRequest<{ status: string; message: string }>('/health');
      return result;
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  async checkAvailability(field: 'email' | 'username', value: string): Promise<{ available: boolean }> {
    try {
      const result = await this.makeRequest<{ available: boolean }>('/auth/check-availability', {
        method: 'POST',
        body: JSON.stringify({ field, value }),
      });
      return result;
    } catch (error) {
      console.error(`Availability check error for ${field}:`, error);
      return { available: false };
    }
  }

  // Test connection to Cognito
  async testConnection() {
    try {
      // ... existing code ...
    } catch (error) {
      console.error('Test connection error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Test connection failed',
      };
    }
  }
}

export const authMicroserviceClient = new AuthMicroserviceClient(); 