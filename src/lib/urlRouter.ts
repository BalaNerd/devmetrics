// Input classifier and router: Distinguishes GitHub repos vs Live Web URLs

import { parseRepoInput } from './github';

export type ClassifiedInputType = 'GITHUB_REPO' | 'LIVE_URL';

export interface ClassifiedGitHubRepo {
  type: 'GITHUB_REPO';
  raw: string;
  owner?: string;
  repo?: string;
  canonical?: string; // "owner/repo"
}

export interface ClassifiedLiveUrl {
  type: 'LIVE_URL';
  raw: string;
  normalizedUrl: string; // "https://example.com"
  hostname: string;
}

export type ClassifiedInput = ClassifiedGitHubRepo | ClassifiedLiveUrl;

// Common top-level domains & deployment platforms
const COMMON_TLDS = new Set([
  'com',
  'org',
  'net',
  'io',
  'dev',
  'app',
  'co',
  'ai',
  'tech',
  'me',
  'xyz',
  'info',
  'page',
  'site',
  'online',
  'run',
  'cloud',
  'sh',
  'so',
  'gg',
  'fm',
]);

const HOSTING_DOMAINS = [
  'vercel.app',
  'netlify.app',
  'railway.app',
  'pages.dev',
  'render.com',
  'fly.dev',
  'surge.sh',
  'github.io',
  'onrender.com',
];

export function isLiveUrl(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim().replace(/^['"`]+|['"`]+$/g, '').trim();

  // 1. Explicit protocol
  if (/^https?:\/\//i.test(trimmed)) {
    // If it's a github.com repo link, that's handled by parseRepoInput
    const parsedRepo = parseRepoInput(trimmed);
    if (parsedRepo) return false;
    return true;
  }

  // 2. Contains hosting domains
  const lower = trimmed.toLowerCase();
  for (const host of HOSTING_DOMAINS) {
    if (lower.includes(host)) return true;
  }

  // 3. Domain pattern (e.g. "my-app.com", "portfolio.dev/projects")
  // Exclude single word searches like "react" or shorthand like "facebook/react"
  const domainMatch = trimmed.match(/^([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,})(\/.*)?$/);
  if (domainMatch) {
    const tld = domainMatch[2].toLowerCase();
    // If it's github.com, let parseRepoInput decide
    if (lower.startsWith('github.com')) {
      return !parseRepoInput(trimmed);
    }
    if (COMMON_TLDS.has(tld)) {
      return true;
    }
  }

  return false;
}

export function normalizeLiveUrl(input: string): string {
  let cleaned = input.trim().replace(/^['"`]+|['"`]+$/g, '').trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

export function classifyInput(input: string): ClassifiedInput {
  const trimmed = (input || '').trim().replace(/^['"`]+|['"`]+$/g, '').trim();

  // Check if it qualifies as a live URL first
  if (isLiveUrl(trimmed)) {
    const normalized = normalizeLiveUrl(trimmed);
    let hostname = '';
    try {
      hostname = new URL(normalized).hostname;
    } catch {
      hostname = trimmed.split('/')[0];
    }
    return {
      type: 'LIVE_URL',
      raw: trimmed,
      normalizedUrl: normalized,
      hostname,
    };
  }

  // Otherwise, it is a GitHub repository or search term
  const parsed = parseRepoInput(trimmed);
  if (parsed) {
    return {
      type: 'GITHUB_REPO',
      raw: trimmed,
      owner: parsed.owner,
      repo: parsed.repo,
      canonical: `${parsed.owner}/${parsed.repo}`,
    };
  }

  return {
    type: 'GITHUB_REPO',
    raw: trimmed,
  };
}

