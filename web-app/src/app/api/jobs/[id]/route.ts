import { NextRequest, NextResponse } from 'next/server';

const JOB_SERVICE_URL =
  process.env.INTERNAL_JOB_SERVICE_URL || process.env.JOB_SERVICE_URL || 'http://localhost:3002';

function buildProxyHeaders(request: NextRequest, token: string) {
  const headers = new Headers();
  headers.set('authorization', `Bearer ${token}`);

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  headers.set('accept', request.headers.get('accept') || 'application/json');
  return headers;
}

function respondWithUpstreamBody(text: string, status: number) {
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

async function forwardRequest(request: NextRequest, jobId: string) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const url = `${JOB_SERVICE_URL}/jobs/${jobId}`;
  const headers = buildProxyHeaders(request, token);

  try {
    let bodyToSend: string | undefined = undefined;
    if (request.method !== 'GET') {
      bodyToSend = await request.text();
    }

    const response = await fetch(url, {
      method: request.method,
      headers,
      body: bodyToSend,
      cache: 'no-store',
    });

    const text = await response.text();
    return respondWithUpstreamBody(text, response.status);
  } catch (error) {
    console.error(`[Jobs API Proxy] Error forwarding request to ${url}:`, error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Error forwarding request to job service', error: errMsg },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return forwardRequest(request, params.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return forwardRequest(request, params.id);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return forwardRequest(request, params.id);
}
