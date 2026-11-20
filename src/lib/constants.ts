// App constants

export const PRESET_REPOS = [
  { label: 'facebook/react', value: 'facebook/react' },
  { label: 'vercel/next.js', value: 'vercel/next.js' },
  { label: 'shadcn/ui', value: 'shadcn-ui/ui' },
  { label: 'tailwindlabs/tailwindcss', value: 'tailwindlabs/tailwindcss' },
  { label: 'microsoft/typescript', value: 'microsoft/TypeScript' },
  { label: 'vitejs/vite', value: 'vitejs/vite' },
] as const;

export const PRESET_LIVE_URLS = [
  { label: 'devmetrics.vercel.app', value: 'https://devmetrics.vercel.app', desc: 'Live Production' },
  { label: 'linear.app', value: 'https://linear.app', desc: 'Issue Tracking Platform' },
] as const;

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const HOURS_OF_DAY = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return '12a';
  if (i < 12) return `${i}a`;
  if (i === 12) return '12p';
  return `${i - 12}p`;
});

export const GITHUB_STATUS_API = 'https://www.githubstatus.com/api/v2/status.json';

export const API_BASE = 'https://api.github.com';
