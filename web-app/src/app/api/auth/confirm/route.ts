import { NextRequest, NextResponse } from 'next/server';
import { authMicroserviceClient } from '@/lib/auth-microservice-client';

export async function POST(request: NextRequest) {
  try {
    const { email, confirmationCode, username } = await request.json();

    if (!email || !confirmationCode) {
      return NextResponse.json(
        { success: false, message: 'Email and confirmation code are required' },
        { status: 400 }
      );
    }

    // Try to get username from request body or from stored username cookie
    let authUsername = username;
    if (!authUsername) {
      const usernameCookie = request.cookies.get('auth_username')?.value;
      if (usernameCookie) {
        authUsername = usernameCookie;
      }
    }

    const result = await authMicroserviceClient.confirmSignUp(email, confirmationCode, authUsername);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    });
  } catch (error) {
    console.error('Confirm sign up API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 