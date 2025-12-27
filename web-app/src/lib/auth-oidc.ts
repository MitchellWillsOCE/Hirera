import { Issuer, Client, generators } from 'openid-client';

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

class OIDCAuthService {
  private client: Client | null = null;
  private initialized = false;

  private readonly config = {
    issuerUrl: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_2crlAC0JH',
    clientId: 'fivu1tamshltc854dak86c1um',
    clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_BASE_URL ? 
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` : 
      'http://localhost:3000/auth/callback',
    logoutUri: process.env.NEXT_PUBLIC_BASE_URL ? 
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout` : 
      'http://localhost:3000/auth/logout',
    scopes: 'openid profile email'
  };

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const issuer = await Issuer.discover(this.config.issuerUrl);
      
      this.client = new issuer.Client({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uris: [this.config.redirectUri],
        response_types: ['code']
      });

      this.initialized = true;
      console.log('OIDC client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OIDC client:', error);
      throw error;
    }
  }

  async getAuthorizationUrl(): Promise<{ url: string; state: string; nonce: string }> {
    await this.initialize();
    
    if (!this.client) {
      throw new Error('OIDC client not initialized');
    }

    const nonce = generators.nonce();
    const state = generators.state();

    const authUrl = this.client.authorizationUrl({
      scope: this.config.scopes,
      state: state,
      nonce: nonce,
    });

    return { url: authUrl, state, nonce };
  }

  async handleCallback(
    callbackParams: any, 
    storedState: string, 
    storedNonce: string
  ): Promise<AuthResult> {
    try {
      await this.initialize();
      
      if (!this.client) {
        throw new Error('OIDC client not initialized');
      }

      const tokenSet = await this.client.callback(
        this.config.redirectUri,
        callbackParams,
        {
          nonce: storedNonce,
          state: storedState
        }
      );

      const userInfo = await this.client.userinfo(tokenSet.access_token!);
      
      const user: User = {
        id: userInfo.sub as string,
        email: userInfo.email as string,
        name: userInfo.name as string,
        firstName: userInfo.given_name as string,
        lastName: userInfo.family_name as string,
        country: userInfo['custom:country'] as string
      };

      return {
        success: true,
        message: 'Authentication successful',
        user
      };
    } catch (error) {
      console.error('Callback error:', error);
      return {
        success: false,
        message: 'Authentication failed'
      };
    }
  }

  getLogoutUrl(): string {
    return `https://jobsoft-dev-hirera-2024.auth.ap-southeast-2.amazoncognito.com/logout?client_id=${this.config.clientId}&logout_uri=${encodeURIComponent(this.config.logoutUri)}`;
  }

  getSignUpUrl(): string {
    return `https://jobsoft-dev-hirera-2024.auth.ap-southeast-2.amazoncognito.com/signup?client_id=${this.config.clientId}&redirect_uri=${encodeURIComponent(this.config.redirectUri)}`;
  }
}

export const authService = new OIDCAuthService(); 