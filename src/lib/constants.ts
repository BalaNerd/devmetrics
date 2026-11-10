// App constants

export const PRESET_REPOS = [
  { label: 'facebook/react', value: 'facebook/react', emoji: '⚛️' },
  { label: 'vercel/next.js', value: 'vercel/next.js', emoji: '▲' },
  { label: 'shadcn/ui', value: 'shadcn-ui/ui', emoji: '🎨' },
  { label: 'tailwindlabs/tailwindcss', value: 'tailwindlabs/tailwindcss', emoji: '🌊' },
  { label: 'microsoft/typescript', value: 'microsoft/TypeScript', emoji: '𝑇' },
  { label: 'vitejs/vite', value: 'vitejs/vite', emoji: '⚡' },
] as const;

export const PRESET_LIVE_URLS = [
  { label: 'devmetrics.vercel.app', value: 'https://devmetrics.vercel.app', emoji: '▲', desc: 'Live Production' },
  { label: 'linear.app', value: 'https://linear.app', emoji: '📐', desc: 'Issue Tracking Platform' },
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
