import { NextRequest, NextResponse } from 'next/server';
import { getGitHubHeaders } from '@/lib/github';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  // Prevent path traversal or SSRF
  const sanitized = endpoint.replace(/^\/+/, '').split('?')[0];
  const query = searchParams.get('params') ? `?${searchParams.get('params')}` : '';

  // Forward optional client token from header if provided, otherwise reads process.env.GITHUB_TOKEN on server
  const clientToken = req.headers.get('x-github-token') || undefined;
  const serverToken = process.env.GITHUB_TOKEN;
  const tokenToUse = clientToken || serverToken;
  const headers = getGitHubHeaders(tokenToUse);

  try {
    const res = await fetch(`https://api.github.com/${sanitized}${query}`, {
      headers,
      next: { revalidate: 3600 },
    });

    const data = await res.json().catch(() => null);

    if (res.status === 401) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: data?.message || 'Bad credentials' },
        { status: 401 }
      );
    }

    if (res.status === 403 || res.status === 429) {
      return NextResponse.json(
        { error: 'RATE_LIMITED', message: data?.message || 'GitHub API rate limit exceeded' },
        { status: 403 }
      );
    }

    if (res.status === 404) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Repository not found or is private' },
        { status: 404 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: 'GITHUB_API_ERROR', message: data?.message || res.statusText },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
