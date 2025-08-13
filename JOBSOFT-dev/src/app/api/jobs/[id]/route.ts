import { NextRequest, NextResponse } from 'next/server';

const JOB_SERVICE_URL = process.env.JOB_SERVICE_URL || 'http://localhost:3002';

async function forwardRequest(request: NextRequest, jobId: string) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const url = `${JOB_SERVICE_URL}/jobs/${jobId}`;
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${token}`);

  try {
    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[Jobs API Proxy] Error forwarding request to ${url}:`, error);
    return NextResponse.json({ message: 'Error forwarding request to job service' }, { status: 502 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return forwardRequest(request, params.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return forwardRequest(request, params.id);
} 