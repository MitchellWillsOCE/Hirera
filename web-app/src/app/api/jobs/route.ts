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

function mapUiPayloadToJobService(body: any) {
  if (!body || typeof body !== 'object') return body;

  const mapped: any = { ...body };
  if (mapped.title === undefined && mapped.jobTitle !== undefined) mapped.title = mapped.jobTitle;
  if (mapped.url === undefined && mapped.jobPostUrl !== undefined) mapped.url = mapped.jobPostUrl;
  return mapped;
}

async function forwardRequest(request: NextRequest, path: string = '') {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const url = `${JOB_SERVICE_URL}/jobs${path}`;
  const headers = buildProxyHeaders(request, token);

  try {
    let bodyToSend: string | undefined = undefined;
    if (request.method !== 'GET') {
      const ct = headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const parsed = await request.json().catch(() => null);
        bodyToSend = JSON.stringify(mapUiPayloadToJobService(parsed));
      } else {
        bodyToSend = await request.text();
      }
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

export async function GET(request: NextRequest) {
  return forwardRequest(request);
}

export async function POST(request: NextRequest) {
  return forwardRequest(request);
}
