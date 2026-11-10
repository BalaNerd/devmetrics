// GitHub API types and client

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  license: { spdx_id: string; name: string } | null;
  topics: string[];
  archived: boolean;
  fork: boolean;
  private: boolean;
  size: number;
  has_issues: boolean;
  has_wiki: boolean;
  subscribers_count: number;
  network_count: number;
}

export interface CommitEntry {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer?: {
      name?: string;
      email?: string;
      date?: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

export interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
}

export interface ContentEntry {
  name: string;
  type: 'file' | 'dir';
  size: number;
  path: string;
}

export type LanguageStats = Record<string, number>;

export interface WorkflowFile {
  name: string;
  path: string;
}

export interface HealthMetrics {
  hasReadme: boolean;
  readmeSize: number;
  hasLicense: boolean;
  licenseName: string | null;
  hasCICD: boolean;
  hasContributing: boolean;
  hasIssueTemplates: boolean;
  hasPRTemplate: boolean;
  hasSemanticTags: boolean;
  hasCodeOfConduct: boolean;
  hasChangelog: boolean;
  workflowCount: number;
}

export interface VelocityMetrics {
  score: number;
  commitFrequency: number; // commits per week avg (last 4 wks)
  daysSinceLastCommit: number;
  releaseCadence: number; // releases per month avg
  prFrequency: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface BusFactorMetrics {
  busFactorScore: number; // 1–10, higher is safer
  topContributorPct: number;
  top2ContributorPct: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dominantContributor: string;
}

export interface ChurnMetrics {
  additions: number;
  deletions: number;
  netChange: number;
  churnRatio: number; // deletions / additions
  weeklyData: Array<{ week: string; additions: number; deletions: number }>;
}

export interface CommitActivity {
  week: number; // Unix timestamp
  total: number;
  days: number[]; // 7 elements, Sun–Sat
}

export interface PunchCardData {
  day: number; // 0=Sunday
  hour: number; // 0–23
  count: number;
}

export interface RepoData {
  repo: Repository;
  commits: CommitEntry[];
  contributors: Contributor[];
  languages: LanguageStats;
  releases: Release[];
  health: HealthMetrics;
  commitActivity: CommitActivity[];
  punchCard: PunchCardData[];
  velocity: VelocityMetrics;
  busFactor: BusFactorMetrics;
  churn: ChurnMetrics;
}

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error' | 'rate-limited' | 'not-found';

// GitHub API fetch utility
export function getGitHubHeaders(token?: string | null): HeadersInit {
  const cleanToken = token?.trim().replace(/[\r\n\t]/g, '');
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    ...(cleanToken ? { Authorization: `Bearer ${cleanToken}` } : {}),
  };
  return headers;
}

export async function ghFetch<T>(url: string, token?: string | null): Promise<T> {
  const res = await fetch(url, {
    headers: getGitHubHeaders(token),
    next: { revalidate: 3600 },
  });

  if (res.status === 401) {
    const errorBody = await res.json().catch(() => null);
    const message =
      (errorBody && typeof errorBody.message === 'string' && errorBody.message) ||
      'Bad credentials';
    throw Object.assign(new Error(message), { code: 'UNAUTHORIZED' });
  }

  if (res.status === 403 || res.status === 429) {
    const errorBody = await res.json().catch(() => null);
    const message =
      (errorBody && typeof errorBody.message === 'string' && errorBody.message) ||
      'GitHub API rate limit exceeded';
    throw Object.assign(new Error(message), { code: 'RATE_LIMITED' });
  }

  if (res.status === 404) {
    throw Object.assign(new Error('Repository not found or is private'), { code: 'NOT_FOUND' });
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message = (errorBody && errorBody.message) || `GitHub API error: ${res.status}`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export interface RepoSearchResult {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
}

export interface IssueEntry {
  id: number;
  number: number;
  title: string;
  created_at: string;
  closed_at: string | null;
  html_url: string;
  pull_request?: { url: string };
}

export function parseRepoInput(input: string): { owner: string; repo: string } | null {
  if (!input || typeof input !== 'string') return null;

  // Strip leading/trailing whitespaces, surrounding quotes and backticks
  let cleaned = input.trim().replace(/^['"`]+|['"`]+$/g, '').trim();
  if (!cleaned) return null;

  // 1. SSH format: git@github.com:owner/repo(.git)? with optional trailing slash
  const sshMatch = cleaned.match(/^git@github\.com:([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?\/?$/i);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2].replace(/\.git$/i, '') };
  }

  // 2. Full URL (https://..., http://..., or github.com/... / www.github.com/...)
  const urlMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/i);
  if (urlMatch) {
    const owner = urlMatch[1];
    const repo = urlMatch[2].replace(/\.git$/i, '');
    return { owner, repo };
  }

  // 3. Shorthand: owner/repo (strip optional subpath/queries/hashes/trailing slashes)
  cleaned = cleaned.split('?')[0].split('#')[0].replace(/\/+$/, '');
  const shorthandMatch = cleaned.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?$/);
  if (shorthandMatch) {
    return { owner: shorthandMatch[1], repo: shorthandMatch[2].replace(/\.git$/i, '') };
  }

  return null;
}

export async function searchGitHubRepos(
  query: string,
  token?: string | null
): Promise<RepoSearchResult[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  try {
    const data = await ghFetch<{ items?: Array<{
      full_name: string;
      description: string | null;
      stargazers_count: number;
      language: string | null;
    }> }>(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=5`,
      token
    );
    return data.items || [];
  } catch {
    return [];
  }
}

export async function fetchPackageJson(
  owner: string,
  repo: string,
  token?: string | null
): Promise<Record<string, any> | null> {
  try {
    const data = await ghFetch<{ content?: string; encoding?: string }>(
      `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
      token
    );
    if (data?.content && data.encoding === 'base64') {
      const decoded = atob(data.content.replace(/\s/g, ''));
      return JSON.parse(decoded);
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchRecentClosedIssues(
  owner: string,
  repo: string,
  token?: string | null
): Promise<IssueEntry[]> {
  try {
    const data = await ghFetch<IssueEntry[]>(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&per_page=30`,
      token
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

