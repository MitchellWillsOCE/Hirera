import { NextRequest, NextResponse } from 'next/server';
import { authMicroserviceClient } from '@/lib/auth-microservice-client';

export async function POST(request: NextRequest) {
  try {
    const { field, value } = await request.json();

    if (field !== 'email' && field !== 'username') {
      return NextResponse.json({ available: false, message: 'Invalid field for availability check.' }, { status: 400 });
    }

    if (!value) {
      return NextResponse.json({ available: false, message: 'Value is required.' }, { status: 400 });
    }

    const result = await authMicroserviceClient.checkAvailability(field, value);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API availability check error:', error);
    return NextResponse.json(
      { available: false, message: 'Internal server error during availability check.' },
      { status: 500 }
    );
  }
} 