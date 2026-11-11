import { NextRequest, NextResponse } from 'next/server';
import {
  extractGitHubRepoFromHtml,
  detectTechStack,
  extractMetaInfo,
  fetchPageSpeedMetrics,
  buildPlainEnglishReview,
  type LiveAuditData,
} from '@/lib/liveAuditor';
import { normalizeLiveUrl } from '@/lib/urlRouter';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('url');

  if (!target) {
    return NextResponse.json({ error: 'Missing "url" parameter' }, { status: 400 });
  }

  const normalizedUrl = normalizeLiveUrl(target);
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const startTime = performance.now();
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (DevMetrics Live Auditor)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    const ttfbMs = Math.round(performance.now() - startTime);
    clearTimeout(timeout);

    const finalUrl = response.url || normalizedUrl;
    const finalHostname = new URL(finalUrl).hostname;
    const isHttps = finalUrl.startsWith('https://');

    const html = await response.text();
    const htmlSizeBytes = new Blob([html]).size;

    // 1. Meta information
    const { title, description } = extractMetaInfo(html);

    // 2. Discover GitHub Source Repository
    const discoveredGitHubRepo = extractGitHubRepoFromHtml(html);

    // 3. Tech stack detection
    const techStack = detectTechStack(response.headers, html);

    // 4. PageSpeed & Core Web Vitals
    const metrics = await fetchPageSpeedMetrics(
      finalUrl,
      ttfbMs,
      htmlSizeBytes,
      Boolean(title && description)
    );

    // 5. Plain English Website Review
    const plainEnglishReview = buildPlainEnglishReview(
      finalUrl,
      ttfbMs,
      metrics,
      techStack,
      discoveredGitHubRepo
    );

    const vercelCache = response.headers.get('x-vercel-cache');
    const cfCache = response.headers.get('cf-cache-status');
    const genericCache = response.headers.get('x-cache');
    const edgeCacheStatus = (vercelCache || cfCache || genericCache || (ttfbMs < 150 ? 'HIT' : 'MISS')).toUpperCase();
    const serverHeader = response.headers.get('server') || (response.headers.get('x-vercel-id') ? 'Vercel Edge' : 'Edge Origin');

    const auditData: LiveAuditData = {
      url: target,
      finalUrl,
      hostname: finalHostname,
      status: response.status,
      statusText: response.statusText || 'OK',
      ttfbMs,
      isHttps,
      edgeCacheStatus,
      serverHeader,
      title: title || finalHostname,
      description,
      discoveredGitHubRepo,
      techStack,
      metrics,
      plainEnglishReview,
      inspectedAt: new Date().toISOString(),
    };

    return NextResponse.json(auditData);
  } catch (err: any) {
    const isTimeout = err?.name === 'AbortError';
    return NextResponse.json(
      {
        error: isTimeout ? 'Connection timed out (10s)' : 'Failed to reach website',
        message: err?.message || 'Unable to complete live deployment inspection',
      },
      { status: 502 }
    );
  }
}

