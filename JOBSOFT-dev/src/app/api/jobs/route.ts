import { NextRequest, NextResponse } from 'next/server';

const JOB_SERVICE_URL =
  process.env.INTERNAL_JOB_SERVICE_URL ||
  process.env.JOB_SERVICE_URL ||
  'http://localhost:3002';

function buildProxyHeaders(request: NextRequest, token: string) {
  // Do NOT forward all incoming request headers (some hop-by-hop headers like `connection` can cause fetch() to throw).
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${token}`);

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  headers.set('accept', request.headers.get('accept') || 'application/json');
  return headers;
}

function respondWithUpstreamBody(text: string, status: number) {
  // 204/205/304 must not include a response body.
  if (status === 204 || status === 205 || status === 304) {
    return new NextResponse(null, { status });
  }

  try {
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status });
  } catch {
    return new NextResponse(text, { status });
  }
}

async function forwardRequest(request: NextRequest, path: string = '') {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const url = `${JOB_SERVICE_URL}/jobs${path}`;
  const headers = buildProxyHeaders(request, token);

  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body: request.method !== 'GET' ? await request.text() : undefined,
      cache: 'no-store',
    });

    const text = await response.text();
    return respondWithUpstreamBody(text, response.status);
  } catch (error) {
    console.error(`[Jobs API Proxy] Error forwarding request to ${url}:`, error);
    return NextResponse.json({ message: 'Error forwarding request to job service' }, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  return forwardRequest(request);
}

export async function POST(request: NextRequest) {
  return forwardRequest(request);
}
