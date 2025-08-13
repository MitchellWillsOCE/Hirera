import { NextRequest, NextResponse } from 'next/server';
import { authMicroserviceClient } from '@/lib/auth-microservice-client';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await authMicroserviceClient.signIn(email, password, username);

    if (result.success && result.user && result.tokens) {
      // Create response
      const response = NextResponse.json({
        success: true,
        message: result.message,
        user: result.user
      });

      // Store tokens in secure HTTP-only cookies
      const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
      const cookieSecure = (process.env.COOKIE_SECURE || 'true') === 'true';

      if (result.tokens.accessToken) {
        response.cookies.set('access_token', result.tokens.accessToken, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: 'lax',
          maxAge: 3600, // 1 hour
          path: '/',
          domain: cookieDomain
        });
      }

      if (result.tokens.refreshToken) {
        response.cookies.set('refresh_token', result.tokens.refreshToken, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: 'lax',
          maxAge: 2592000, // 30 days
          path: '/',
          domain: cookieDomain
        });
      }

      if (result.tokens.idToken) {
        response.cookies.set('id_token', result.tokens.idToken, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: 'lax',
          maxAge: 3600, // 1 hour
          path: '/',
          domain: cookieDomain
        });
      }

      // Store user session
      response.cookies.set('user_session', JSON.stringify(result.user), {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: 'lax',
        maxAge: 86400, // 24 hours
        path: '/',
        domain: cookieDomain
      });

      // Store username for future auth operations
      if (result.user.username) {
        response.cookies.set('auth_username', result.user.username, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: 'lax',
          maxAge: 2592000, // 30 days
          path: '/',
          domain: cookieDomain
        });
      }

      return response;
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Sign in API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 