import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-oidc';

export async function GET(request: NextRequest) {
  try {
    const { url, state, nonce } = await authService.getAuthorizationUrl();
    
    // Create response with redirect
    const response = NextResponse.redirect(url);
    
    // Store state and nonce in secure httpOnly cookies
    response.cookies.set('auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    });
    
    response.cookies.set('auth_nonce', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication service unavailable' },
      { status: 500 }
    );
  }
} 