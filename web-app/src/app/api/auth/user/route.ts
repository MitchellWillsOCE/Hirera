import { NextRequest, NextResponse } from 'next/server';
import { authMicroserviceClient } from '@/lib/auth-microservice-client';

export async function GET(request: NextRequest) {
  try {
    // First try to get user from session cookie (fallback for existing sessions)
    const userSession = request.cookies.get('user_session')?.value;
    
    if (userSession) {
      try {
        const user = JSON.parse(userSession);
        return NextResponse.json({
          success: true,
          user
        });
      } catch (parseError) {
        console.error('Failed to parse user session:', parseError);
      }
    }

    // Try to get user using access token
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const result = await authMicroserviceClient.getUser(accessToken);
    
    if (result.success && result.user) {
      return NextResponse.json({
        success: true,
        user: result.user
      });
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to get user' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 