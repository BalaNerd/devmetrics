'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  GitCompare,
  Trophy,
  ArrowRight,
  ArrowLeftRight,
  Star,
  Users,
  ShieldCheck,
  Zap,
  Activity,
  Sparkles,
  Globe,
  Gauge,
  Lock,
  ExternalLink,
  Code2,
  FileText,
  AlertCircle,
  Clock,
  Layers,
  Flame,
} from 'lucide-react';
import Image from 'next/image';
import { useAppStore, type AudienceMode } from '@/store/useAppStore';
import {
  ghFetch,
  parseRepoInput,
  type Repository,
  type CommitEntry,
  type Contributor,
  type Release,
  type HealthMetrics,
} from '@/lib/github';
import {
  calculateVelocityScore,
  calculateBusFactor,
  calculateHealthGrade,
  formatNumber,
} from '@/lib/metrics';
import { classifyInput, normalizeLiveUrl } from '@/lib/urlRouter';
import type { LiveAuditData } from '@/lib/liveAuditor';

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface RepoTelemetrySummary {
  repo: Repository;
  velocityScore: number;
  cadence: number;
  healthGrade: string;
  healthScore: number;
  busFactorScore: number;
  topContributorPct: number;
  dominantContributor: string;
  openIssues: number;
  stars: number;
  forks: number;
  language: string;
  pushedAt: string;
}

export type ComparisonTarget =
  | { type: 'repo'; raw: string; data: RepoTelemetrySummary }
  | { type: 'live'; raw: string; data: LiveAuditData };

export type MetricCategory = 'all' | 'speed' | 'architecture';

interface PresetMatchup {
  label: string;
  typeBadge: 'Repo vs Repo' | 'Live vs Live' | 'Cross Audit';
  a: string;
  b: string;
  desc: string;
}

const PRESET_MATCHUPS: PresetMatchup[] = [
  // Repo vs Repo
  { label: 'Zustand vs Redux', typeBadge: 'Repo vs Repo', a: 'pmndrs/zustand', b: 'reduxjs/redux', desc: 'State Architecture' },
  { label: 'Vite vs Webpack', typeBadge: 'Repo vs Repo', a: 'vitejs/vite', b: 'webpack/webpack', desc: 'Bundler Throughput' },
  { label: 'shadcn/ui vs Radix', typeBadge: 'Repo vs Repo', a: 'shadcn-ui/ui', b: 'radix-ui/primitives', desc: 'Component Standards' },
  { label: 'Next.js vs Remix', typeBadge: 'Repo vs Repo', a: 'vercel/next.js', b: 'remix-run/react-router', desc: 'Fullstack Frameworks' },
  // Live URL vs Live URL
  { label: 'DevMetrics vs Linear', typeBadge: 'Live vs Live', a: 'https://devmetrics.vercel.app', b: 'https://linear.app', desc: 'Production Edge Vitals' },
  { label: 'Vercel vs Netlify', typeBadge: 'Live vs Live', a: 'https://vercel.com', b: 'https://netlify.com', desc: 'Global Cloud Edge' },
  // Cross Matchup
  { label: 'DevMetrics Live vs Source', typeBadge: 'Cross Audit', a: 'https://devmetrics.vercel.app', b: 'BalaNerd/devmetrics', desc: 'Full-Stack Diligence' },
];

// ─── ANIMATED NUMBER HELPER ──────────────────────────────────────────────────

function AnimatedNumber({
  value,
  suffix = '',
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 750;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * ease;
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const handle = requestAnimationFrame(step);
    return () => cancelAnimationFrame(handle);
  }, [value]);

  return (
    <span suppressHydrationWarning className="tabular-nums">
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function RepoComparisonModal() {
  const {
    comparisonModalOpen,
    setComparisonModalOpen,
    repoData,
    currentRepo,
    setCurrentRepo,
    githubToken,
    setComparisonLoading,
    audienceMode,
    setAudienceMode,
  } = useAppStore();

  const [repoAInput, setRepoAInput] = useState('');
  const [repoBInput, setRepoBInput] = useState('');
  const [targetA, setTargetA] = useState<ComparisonTarget | null>(null);
  const [targetB, setTargetB] = useState<ComparisonTarget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MetricCategory>('all');
  const [isSwapped, setIsSwapped] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize input values from currently loaded repo
  useEffect(() => {
    if (comparisonModalOpen) {
      const active = repoData?.repo?.full_name || currentRepo || 'vercel/next.js';
      if (!repoAInput) setRepoAInput(active);
      if (!repoBInput) setRepoBInput('remix-run/react-router');
    }
  }, [comparisonModalOpen, repoData, currentRepo, repoAInput, repoBInput]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setComparisonModalOpen(false);
      }
    };
    if (comparisonModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [comparisonModalOpen, setComparisonModalOpen]);

  // Fetch telemetry for a single GitHub repo
  const fetchSingleRepoTelemetry = async (repoInput: string): Promise<RepoTelemetrySummary> => {
    const parsed = parseRepoInput(repoInput);
    if (!parsed) {
      throw new Error(`Invalid repository: "${repoInput}". Use format "owner/repo" or GitHub URL.`);
    }

    const { owner, repo } = parsed;
    const [repoRes, commitsRes, contribsRes, releasesRes, workflowsRes] = await Promise.all([
      ghFetch<Repository>(`https://api.github.com/repos/${owner}/${repo}`, githubToken),
      ghFetch<CommitEntry[]>(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=60`, githubToken).catch(() => []),
      ghFetch<Contributor[]>(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=30`, githubToken).catch(() => []),
      ghFetch<Release[]>(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=20`, githubToken).catch(() => []),
      ghFetch<any[]>(`https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows`, githubToken).catch(() => []),
    ]);

    const velocity = calculateVelocityScore(commitsRes, releasesRes, repoRes.pushed_at);
    const busFactor = calculateBusFactor(contribsRes);
    const mockHealth: HealthMetrics = {
      hasReadme: true,
      readmeSize: 2048,
      hasLicense: Boolean(repoRes.license),
      licenseName: repoRes.license?.spdx_id || repoRes.license?.name || null,
      hasCICD: Array.isArray(workflowsRes) && workflowsRes.length > 0,
      hasContributing: true,
      hasIssueTemplates: true,
      hasPRTemplate: false,
      hasSemanticTags: releasesRes.length > 0,
      hasCodeOfConduct: false,
      hasChangelog: true,
      workflowCount: Array.isArray(workflowsRes) ? workflowsRes.length : 0,
    };
    const health = calculateHealthGrade(mockHealth);

    return {
      repo: repoRes,
      velocityScore: velocity.score,
      cadence: velocity.commitFrequency,
      healthGrade: health.grade,
      healthScore: health.score,
      busFactorScore: busFactor.busFactorScore,
      topContributorPct: busFactor.topContributorPct,
      dominantContributor: busFactor.dominantContributor,
      openIssues: repoRes.open_issues_count,
      stars: repoRes.stargazers_count,
      forks: repoRes.forks_count,
      language: repoRes.language || 'Plain Text',
      pushedAt: repoRes.pushed_at,
    };
  };

  // Fetch telemetry for a live deployment / web URL
  const fetchSingleLiveTelemetry = async (urlInput: string): Promise<LiveAuditData> => {
    const normalized = normalizeLiveUrl(urlInput);
    const res = await fetch(`/api/audit-url?url=${encodeURIComponent(normalized)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || `Failed to audit live URL: ${normalized}`);
    }
    return data as LiveAuditData;
  };

  // Dispatch single target fetch based on automatic classification
  const fetchTarget = async (inputStr: string): Promise<ComparisonTarget> => {
    const classification = classifyInput(inputStr);
    if (classification.type === 'LIVE_URL') {
      const liveData = await fetchSingleLiveTelemetry(classification.normalizedUrl);
      return { type: 'live', raw: inputStr, data: liveData };
    } else {
      const repoData = await fetchSingleRepoTelemetry(inputStr);
      return { type: 'repo', raw: inputStr, data: repoData };
    }
  };

  // Concurrent dual comparison fetch
  const handleCompare = useCallback(
    async (aStr: string, bStr: string) => {
      if (!aStr.trim() || !bStr.trim()) return;
      setLoading(true);
      setComparisonLoading(true);
      setError(null);

      try {
        const [resA, resB] = await Promise.all([
          fetchTarget(aStr),
          fetchTarget(bStr),
        ]);
        setTargetA(resA);
        setTargetB(resB);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch targets for head-to-head comparison.');
      } finally {
        setLoading(false);
        setComparisonLoading(false);
      }
    },
    [githubToken, setComparisonLoading]
  );

  // Auto-run comparison on modal open if not already populated
  useEffect(() => {
    if (comparisonModalOpen && !targetA && !targetB) {
      const a = repoData?.repo?.full_name || currentRepo || 'vercel/next.js';
      const b = 'remix-run/react-router';
      handleCompare(a, b);
    }
  }, [comparisonModalOpen, repoData, currentRepo, targetA, targetB, handleCompare]);

  // Contender swap handler
  const handleSwapContenders = () => {
    setIsSwapped((prev) => !prev);
    const tempInput = repoAInput;
    setRepoAInput(repoBInput);
    setRepoBInput(tempInput);

    if (targetA && targetB) {
      const tempTarget = targetA;
      setTargetA(targetB);
      setTargetB(tempTarget);
    }
  };

  const isPlain = isMounted && audienceMode === 'plain';

  // Determine matchup type
  const matchupType = useMemo<'repo-vs-repo' | 'live-vs-live' | 'cross'>(() => {
    if (!targetA || !targetB) return 'repo-vs-repo';
    if (targetA.type === 'repo' && targetB.type === 'repo') return 'repo-vs-repo';
    if (targetA.type === 'live' && targetB.type === 'live') return 'live-vs-live';
    return 'cross';
  }, [targetA, targetB]);

  // Compute metric items based on matchup type
  const metricItems = useMemo(() => {
    if (!targetA || !targetB) return [];

    const getWinner = (vA: number, vB: number, higherIsBetter = true): 'a' | 'b' | 'tie' => {
      if (vA === vB) return 'tie';
      if (higherIsBetter) return vA > vB ? 'a' : 'b';
      return vA < vB ? 'a' : 'b';
    };

    if (targetA.type === 'repo' && targetB.type === 'repo') {
      const dA = targetA.data;
      const dB = targetB.data;

      return [
        {
          id: 'velocity',
          category: 'speed' as MetricCategory,
          label: isPlain ? 'Development Velocity' : 'Velocity Score (0–100)',
          icon: Zap,
          valA: dA.velocityScore,
          valB: dB.velocityScore,
          displayA: `${dA.velocityScore} / 100`,
          displayB: `${dB.velocityScore} / 100`,
          winner: getWinner(dA.velocityScore, dB.velocityScore),
          maxVal: 100,
          higherIsBetter: true,
          plainVerdict: dA.velocityScore > dB.velocityScore
            ? `${dA.repo.name} leads in commit vitality & cadence`
            : `${dB.repo.name} demonstrates higher code velocity`,
        },
        {
          id: 'cadence',
          category: 'speed' as MetricCategory,
          label: isPlain ? 'Weekly Shipping Cadence' : 'Weekly Commit Cadence',
          icon: Activity,
          valA: dA.cadence,
          valB: dB.cadence,
          displayA: `${dA.cadence.toFixed(1)} /wk`,
          displayB: `${dB.cadence.toFixed(1)} /wk`,
          winner: getWinner(dA.cadence, dB.cadence),
          maxVal: Math.max(dA.cadence, dB.cadence, 12),
          higherIsBetter: true,
          plainVerdict: dA.cadence > dB.cadence
            ? `${dA.repo.name} ships updates more frequently`
            : `${dB.repo.name} has more frequent weekly commit sprints`,
        },
        {
          id: 'governance',
          category: 'architecture' as MetricCategory,
          label: isPlain ? 'Governance & CI/CD Health' : 'Governance & Hygiene Grade',
          icon: ShieldCheck,
          valA: dA.healthScore,
          valB: dB.healthScore,
          displayA: `Grade ${dA.healthGrade} (${dA.healthScore}%)`,
          displayB: `Grade ${dB.healthGrade} (${dB.healthScore}%)`,
          winner: getWinner(dA.healthScore, dB.healthScore),
          maxVal: 100,
          higherIsBetter: true,
          plainVerdict: dA.healthScore > dB.healthScore
            ? `${dA.repo.name} has more comprehensive CI/CD & licenses`
            : `${dB.repo.name} has stronger documentation & workflows`,
        },
        {
          id: 'busFactor',
          category: 'architecture' as MetricCategory,
          label: isPlain ? 'Team Distribution' : 'Bus Factor Decentralization',
          icon: Users,
          valA: dA.busFactorScore,
          valB: dB.busFactorScore,
          displayA: `${dA.busFactorScore}/10 (${dA.topContributorPct.toFixed(0)}% solo)`,
          displayB: `${dB.busFactorScore}/10 (${dB.topContributorPct.toFixed(0)}% solo)`,
          winner: getWinner(dA.busFactorScore, dB.busFactorScore),
          maxVal: 10,
          higherIsBetter: true,
          plainVerdict: dA.busFactorScore > dB.busFactorScore
            ? `${dA.repo.name} has a more distributed contributor base`
            : `${dB.repo.name} carries lower single-maintainer risk`,
        },
        {
          id: 'stars',
          category: 'architecture' as MetricCategory,
          label: isPlain ? 'Community Adoption' : 'Community Adoption (Stars)',
          icon: Star,
          valA: dA.stars,
          valB: dB.stars,
          displayA: formatNumber(dA.stars),
          displayB: formatNumber(dB.stars),
          winner: getWinner(dA.stars, dB.stars),
          maxVal: Math.max(dA.stars, dB.stars, 1000),
          higherIsBetter: true,
          plainVerdict: dA.stars > dB.stars
            ? `${dA.repo.name} has greater community popularity`
            : `${dB.repo.name} has stronger open-source star count`,
        },
        {
          id: 'issues',
          category: 'speed' as MetricCategory,
          label: isPlain ? 'Issue Backlog Turnaround' : 'Open Issue Queue Turnaround',
          icon: AlertCircle,
          valA: dA.openIssues,
          valB: dB.openIssues,
          displayA: `${formatNumber(dA.openIssues)} open`,
          displayB: `${formatNumber(dB.openIssues)} open`,
          winner: getWinner(dA.openIssues, dB.openIssues, false),
          maxVal: Math.max(dA.openIssues, dB.openIssues, 50),
          higherIsBetter: false,
          plainVerdict: dA.openIssues < dB.openIssues
            ? `${dA.repo.name} maintains a leaner issue queue`
            : `${dB.repo.name} has fewer outstanding issues`,
        },
      ];
    }

    if (targetA.type === 'live' && targetB.type === 'live') {
      const dA = targetA.data;
      const dB = targetB.data;

      return [
        {
          id: 'performance',
          category: 'speed' as MetricCategory,
          label: isPlain ? 'Core Web Vitals: Page Speed' : 'Core Web Vitals: Performance (0–100)',
          icon: Gauge,
          valA: dA.metrics.performance,
          valB: dB.metrics.performance,
          displayA: `${dA.metrics.performance} / 100`,
          displayB: `${dB.metrics.performance} / 100`,
          winner: getWinner(dA.metrics.performance, dB.metrics.performance),
          maxVal: 100,
          higherIsBetter: true,
          plainVerdict: dA.metrics.performance > dB.metrics.performance
            ? `${dA.hostname} renders faster on mobile & desktop`
            : `${dB.hostname} provides a faster browser experience`,
        },
        {
          id: 'ttfb',
          category: 'speed' as MetricCategory,
          label: isPlain ? 'Server Response Latency' : 'Edge Latency (TTFB in ms)',
          icon: Clock,
          valA: dA.ttfbMs,
          valB: dB.ttfbMs,
          displayA: `${dA.ttfbMs} ms`,
          displayB: `${dB.ttfbMs} ms`,
          winner: getWinner(dA.ttfbMs, dB.ttfbMs, false),
          maxVal: Math.max(dA.ttfbMs, dB.ttfbMs, 350),
          higherIsBetter: false,
          plainVerdict: dA.ttfbMs < dB.ttfbMs
            ? `${dA.hostname} responds ${Math.abs(dB.ttfbMs - dA.ttfbMs)}ms faster`
            : `${dB.hostname} responds ${Math.abs(dA.ttfbMs - dB.ttfbMs)}ms faster`,
        },
        {
          id: 'accessibility',
          category: 'architecture' as MetricCategory,
          label: isPlain ? 'Accessibility Standards' : 'Accessibility & Semantics (0–100)',
          icon: ShieldCheck,
          valA: dA.metrics.accessibility,
          valB: dB.metrics.accessibility,
          displayA: `${dA.metrics.accessibility} / 100`,
          displayB: `${dB.metrics.accessibility} / 100`,
          winner: getWinner(dA.metrics.accessibility, dB.metrics.accessibility),
          maxVal: 100,
          higherIsBetter: true,
          plainVerdict: dA.metrics.accessibility > dB.metrics.accessibility
            ? `${dA.hostname} has higher contrast and aria hierarchy`
            : `${dB.hostname} offers superior accessibility compliance`,
        },
        {
          id: 'seo',
          category: 'architecture' as MetricCategory,
          label: isPlain ? 'Search Engine Readiness' : 'SEO Technical Indexing (0–100)',
          icon: Sparkles,
          valA: dA.metrics.seo,
          valB: dB.metrics.seo,
          displayA: `${dA.metrics.seo} / 100`,
          displayB: `${dB.metrics.seo} / 100`,
          winner: getWinner(dA.metrics.seo, dB.metrics.seo),
          maxVal: 100,
          higherIsBetter: true,
          plainVerdict: dA.metrics.seo > dB.metrics.seo
            ? `${dA.hostname} has more complete OpenGraph and meta tags`
            : `${dB.hostname} is more thoroughly search-optimized`,
        },
        {
          id: 'payload',
          category: 'architecture' as MetricCategory,
          label: isPlain ? 'Initial HTML Page Size' : 'Document Payload Weight (KB)',
          icon: Layers,
          valA: dA.metrics.htmlSizeBytes || 16000,
          valB: dB.metrics.htmlSizeBytes || 16000,
          displayA: `${((dA.metrics.htmlSizeBytes || 16000) / 1024).toFixed(1)} KB`,
          displayB: `${((dB.metrics.htmlSizeBytes || 16000) / 1024).toFixed(1)} KB`,
          winner: getWinner(dA.metrics.htmlSizeBytes || 16000, dB.metrics.htmlSizeBytes || 16000, false),
          maxVal: Math.max(dA.metrics.htmlSizeBytes || 16000, dB.metrics.htmlSizeBytes || 16000, 45000),
          higherIsBetter: false,
          plainVerdict: (dA.metrics.htmlSizeBytes || 16000) < (dB.metrics.htmlSizeBytes || 16000)
            ? `${dA.hostname} transmits a leaner initial HTML payload`
            : `${dB.hostname} has a lighter initial HTML bundle`,
        },
      ];
    }

    // Cross-Audit (Live vs Repo)
    const liveTarget = targetA.type === 'live' ? targetA.data : (targetB.data as LiveAuditData);
    const repoTarget = targetA.type === 'repo' ? targetA.data : (targetB.data as RepoTelemetrySummary);
    const isTargetALive = targetA.type === 'live';

    return [
      {
        id: 'runtime-speed',
        category: 'speed' as MetricCategory,
        label: isPlain ? 'Live Page Speed vs Code Velocity' : 'Runtime Performance vs Commit Velocity',
        icon: Zap,
        valA: isTargetALive ? liveTarget.metrics.performance : repoTarget.velocityScore,
        valB: !isTargetALive ? liveTarget.metrics.performance : repoTarget.velocityScore,
        displayA: isTargetALive ? `${liveTarget.metrics.performance} / 100 Speed` : `${repoTarget.velocityScore} / 100 Velocity`,
        displayB: !isTargetALive ? `${liveTarget.metrics.performance} / 100 Speed` : `${repoTarget.velocityScore} / 100 Velocity`,
        winner: isTargetALive
          ? getWinner(liveTarget.metrics.performance, repoTarget.velocityScore)
          : getWinner(repoTarget.velocityScore, liveTarget.metrics.performance),
        maxVal: 100,
        higherIsBetter: true,
        plainVerdict: 'Live deployment response correlates directly with repository engineering throughput.',
      },
      {
        id: 'latency-cadence',
        category: 'speed' as MetricCategory,
        label: isPlain ? 'Server Response vs Shipping Sprints' : 'Edge TTFB vs Weekly Commit Cadence',
        icon: Clock,
        valA: isTargetALive ? Math.max(10, 100 - liveTarget.ttfbMs / 10) : repoTarget.cadence * 5,
        valB: !isTargetALive ? Math.max(10, 100 - liveTarget.ttfbMs / 10) : repoTarget.cadence * 5,
        displayA: isTargetALive ? `${liveTarget.ttfbMs} ms TTFB` : `${repoTarget.cadence.toFixed(1)} commits/wk`,
        displayB: !isTargetALive ? `${liveTarget.ttfbMs} ms TTFB` : `${repoTarget.cadence.toFixed(1)} commits/wk`,
        winner: 'tie' as const,
        maxVal: 100,
        higherIsBetter: true,
        plainVerdict: `Production edge server clocks at ${liveTarget.ttfbMs}ms with ~${repoTarget.cadence.toFixed(1)} commits landing weekly.`,
      },
      {
        id: 'standards-governance',
        category: 'architecture' as MetricCategory,
        label: isPlain ? 'Web Standards vs Repo Governance' : 'Accessibility Score vs Health Grade',
        icon: ShieldCheck,
        valA: isTargetALive ? liveTarget.metrics.accessibility : repoTarget.healthScore,
        valB: !isTargetALive ? liveTarget.metrics.accessibility : repoTarget.healthScore,
        displayA: isTargetALive ? `${liveTarget.metrics.accessibility} / 100 A11y` : `Grade ${repoTarget.healthGrade} (${repoTarget.healthScore}%)`,
        displayB: !isTargetALive ? `${liveTarget.metrics.accessibility} / 100 A11y` : `Grade ${repoTarget.healthGrade} (${repoTarget.healthScore}%)`,
        winner: 'tie' as const,
        maxVal: 100,
        higherIsBetter: true,
        plainVerdict: `Accessibility scored at ${liveTarget.metrics.accessibility}/100 while repository governance rates at Grade ${repoTarget.healthGrade}.`,
      },
      {
        id: 'scale-adoption',
        category: 'architecture' as MetricCategory,
        label: isPlain ? 'Edge Architecture vs Open-Source Stars' : 'Edge Infrastructure vs Repository Scale',
        icon: Star,
        valA: isTargetALive ? 88 : repoTarget.stars,
        valB: !isTargetALive ? 88 : repoTarget.stars,
        displayA: isTargetALive ? `${liveTarget.serverHeader || 'Edge'} (${liveTarget.edgeCacheStatus || 'HIT'})` : `${formatNumber(repoTarget.stars)} stars`,
        displayB: !isTargetALive ? `${liveTarget.serverHeader || 'Edge'} (${liveTarget.edgeCacheStatus || 'HIT'})` : `${formatNumber(repoTarget.stars)} stars`,
        winner: 'tie' as const,
        maxVal: Math.max(repoTarget.stars, 100),
        higherIsBetter: true,
        plainVerdict: `Powered by ${liveTarget.serverHeader || 'Edge Network'} with a community of ${formatNumber(repoTarget.stars)} developers.`,
      },
    ];
  }, [targetA, targetB, isPlain]);

  // Filter metrics by active tab
  const filteredMetrics = useMemo(() => {
    if (selectedCategory === 'all') return metricItems;
    return metricItems.filter((m) => m.category === selectedCategory);
  }, [metricItems, selectedCategory]);

  // Overall winner computation
  const overallWinner = useMemo<'a' | 'b' | 'tie'>(() => {
    if (!metricItems || metricItems.length === 0) return 'tie';
    const winsA = metricItems.filter((m) => m.winner === 'a').length;
    const winsB = metricItems.filter((m) => m.winner === 'b').length;
    if (winsA > winsB) return 'a';
    if (winsB > winsA) return 'b';
    return 'tie';
  }, [metricItems]);

  // Synthesis summary verdict
  const summaryVerdict = useMemo(() => {
    if (!targetA || !targetB) return '';
    const nameA = targetA.type === 'repo' ? targetA.data.repo.name : targetA.data.hostname;
    const nameB = targetB.type === 'repo' ? targetB.data.repo.name : targetB.data.hostname;

    if (overallWinner === 'a') {
      return isPlain
        ? `${nameA} outperforms ${nameB} across key performance, velocity, and maintenance criteria.`
        : `${nameA} demonstrates superior engineering momentum, commanding a decisive lead across critical telemetry benchmarks.`;
    } else if (overallWinner === 'b') {
      return isPlain
        ? `${nameB} exhibits stronger velocity and operational responsiveness than ${nameA}.`
        : `${nameB} commands stronger throughput, developer adoption, and infrastructure efficiency over ${nameA}.`;
    }
    return `Both contenders display balanced metrics with complementary strengths across speed, reliability, and code hygiene.`;
  }, [targetA, targetB, overallWinner, isPlain]);

  // Auto-detect linked GitHub repo for live URL cross-audit
  const linkedRepoOffer = useMemo(() => {
    if (targetA?.type === 'live' && targetA.data.discoveredGitHubRepo) {
      return {
        sourceUrl: targetA.data.hostname,
        repo: targetA.data.discoveredGitHubRepo,
        action: () => {
          setRepoBInput(targetA.data.discoveredGitHubRepo!);
          handleCompare(targetA.raw, targetA.data.discoveredGitHubRepo!);
        },
      };
    }
    if (targetB?.type === 'live' && targetB.data.discoveredGitHubRepo) {
      return {
        sourceUrl: targetB.data.hostname,
        repo: targetB.data.discoveredGitHubRepo,
        action: () => {
          setRepoAInput(targetB.data.discoveredGitHubRepo!);
          handleCompare(targetB.data.discoveredGitHubRepo!, targetB.raw);
        },
      };
    }
    return null;
  }, [targetA, targetB, handleCompare]);

  if (!comparisonModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#000000]/85 backdrop-blur-md overflow-y-auto">
        {/* Backdrop click dismiss */}
        <div
          className="fixed inset-0"
          onClick={() => setComparisonModalOpen(false)}
          aria-hidden="true"
        />

        {/* Modal Arena Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-5xl rounded-2xl border border-[#A5A79B]/20 bg-[#180d0d] shadow-2xl p-5 sm:p-8 overflow-hidden z-10 flex flex-col gap-6 max-h-[92vh] overflow-y-auto"
          style={{
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(232, 210, 181, 0.08)',
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            className="bg-[#590907]/25 blur-3xl rounded-full absolute -top-12 -right-12 w-64 h-64 pointer-events-none"
            aria-hidden="true"
          />

          {/* Top Modal Header & Mode Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-[#A5A79B]/15 relative z-10 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#590907]/30 border border-[#590907] flex items-center justify-center text-[#E8D2B5] shadow-md">
                <GitCompare size={20} />
              </div>
              <div>
                <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#A5A79B]/80 block">
                  UNIVERSAL COMPARISON ARENA
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#E8D2B5] tracking-tight">
                  Head-to-Head Telemetry Deck
                </h2>
              </div>
            </div>

            {/* Controls: Audience Mode & Close */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center p-1 rounded-xl bg-[#120909] border border-[#A5A79B]/20">
                {(['technical', 'plain'] as const).map((mode) => {
                  const isActive = (isMounted ? audienceMode : 'technical') === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAudienceMode(mode)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#590907] text-[#E8D2B5] font-semibold shadow-sm border border-[#590907]'
                          : 'text-[#A5A79B] hover:text-[#E8D2B5]'
                      }`}
                    >
                      {mode === 'technical' ? <Code2 size={12} /> : <FileText size={12} />}
                      <span className="capitalize">{mode}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setComparisonModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A5A79B] hover:text-[#E8D2B5] hover:bg-[#120909] border border-[#A5A79B]/15 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Dual Input Hub with Center Swapper */}
          <div className="space-y-3 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Contender A Input */}
              <div className="md:col-span-5 relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A5A79B]" />
                <input
                  type="text"
                  value={repoAInput}
                  onChange={(e) => setRepoAInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCompare(repoAInput, repoBInput)}
                  placeholder="Target A: GitHub repo or live URL..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#120909] border border-[#A5A79B]/20 text-xs font-mono text-[#E8D2B5] placeholder-[#A5A79B]/40 focus:outline-none focus:border-[#590907]"
                />
              </div>

              {/* Contender Swap Button */}
              <div className="md:col-span-2 flex items-center justify-center">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSwapContenders}
                  className="w-9 h-9 rounded-full bg-[#180d0d] border border-[#590907] hover:border-[#E8D2B5] text-[#E8D2B5] flex items-center justify-center cursor-pointer shadow-lg shadow-black/50 transition-colors z-20"
                  title="Swap contenders"
                  aria-label="Swap contenders"
                >
                  <motion.div
                    animate={{ rotate: isSwapped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <ArrowLeftRight size={15} />
                  </motion.div>
                </motion.button>
              </div>

              {/* Contender B Input */}
              <div className="md:col-span-5 relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A5A79B]" />
                <input
                  type="text"
                  value={repoBInput}
                  onChange={(e) => setRepoBInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCompare(repoAInput, repoBInput)}
                  placeholder="Target B: GitHub repo or live URL..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#120909] border border-[#A5A79B]/20 text-xs font-mono text-[#E8D2B5] placeholder-[#A5A79B]/40 focus:outline-none focus:border-[#590907]"
                />
              </div>
            </div>

            {/* Smart Presets & Linked Cross-Audit Chip */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-[#A5A79B]/70 mr-1">Arena Presets:</span>
                {PRESET_MATCHUPS.map((pair) => (
                  <button
                    key={pair.label}
                    onClick={() => {
                      setRepoAInput(pair.a);
                      setRepoBInput(pair.b);
                      handleCompare(pair.a, pair.b);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#120909] hover:bg-[#180d0d] text-[#A5A79B] hover:text-[#E8D2B5] border border-[#A5A79B]/15 text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{pair.label}</span>
                    <span className="text-[9px] px-1 rounded bg-[#590907]/40 text-[#E8D2B5] border border-[#590907]/60">
                      {pair.typeBadge}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCompare(repoAInput, repoBInput)}
                disabled={loading || !repoAInput.trim() || !repoBInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-[#590907] text-[#E8D2B5] hover:bg-[#77110f] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <GitCompare size={13} />
                <span>Execute Matchup</span>
              </button>
            </div>

            {/* 1-Click Cross-Audit Offer If Available */}
            {linkedRepoOffer && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded-xl bg-[#590907]/20 border border-[#590907]/40 flex items-center justify-between gap-3 text-xs font-sans text-[#E8D2B5]"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#E8D2B5] shrink-0" />
                  <span>
                    Linked GitHub source repository detected for <strong>{linkedRepoOffer.sourceUrl}</strong>: <code className="font-mono text-[#E8D2B5]">{linkedRepoOffer.repo}</code>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={linkedRepoOffer.action}
                  className="px-3 py-1 rounded-lg bg-[#590907] text-[#E8D2B5] font-mono text-[11px] font-semibold hover:bg-[#77110f] transition-all shrink-0 cursor-pointer"
                >
                  Compare Live vs Source
                </button>
              </motion.div>
            )}
          </div>

          {/* Synchronized Dual-Stage Loader */}
          {loading && (
            <div className="py-12 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#A5A79B]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E8D2B5] animate-pulse" />
                  <span>Concurrently inspecting targets...</span>
                </div>
                <span className="text-[#E8D2B5]">Syncing Telemetry Engine</span>
              </div>
              <div className="h-2 w-full bg-[#120909] rounded-full overflow-hidden border border-[#A5A79B]/15">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#590907] via-[#E8D2B5] to-[#590907] rounded-full"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.4,
                    ease: 'easeInOut',
                  }}
                  style={{ width: '50%' }}
                />
              </div>
              <p className="text-center font-mono text-[11px] text-[#A5A79B]/60">
                Auditing {repoAInput} vs {repoBInput}
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && !loading && (
            <div className="p-4 rounded-xl bg-[#590907]/20 border border-[#590907] text-xs font-sans text-[#E8D2B5] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-[#E8D2B5] shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => handleCompare(repoAInput, repoBInput)}
                className="px-3 py-1 rounded-lg bg-[#590907] text-[#E8D2B5] font-mono text-xs font-semibold hover:bg-[#77110f] transition-all cursor-pointer shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Main Comparison Matrix Display */}
          {!loading && !error && targetA && targetB && (
            <div className="space-y-6 relative z-10">
              {/* Comparative Executive Banner */}
              <div className="p-4 rounded-xl bg-[#120909] border border-[#590907]/50 flex items-start gap-3">
                <Sparkles size={16} className="text-[#E8D2B5] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#E8D2B5] font-bold block">
                    SYNTHESIS VERDICT
                  </span>
                  <p className="font-sans text-xs sm:text-sm text-[#E8D2B5] leading-relaxed">
                    {summaryVerdict}
                  </p>
                </div>
              </div>

              {/* Side-by-Side Dual Contender Cards with Framer Motion Layout Transitions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contender A Card */}
                <ContenderCard
                  target={targetA}
                  isWinner={overallWinner === 'a'}
                  onInspect={(repoName) => {
                    setCurrentRepo(repoName);
                    setComparisonModalOpen(false);
                  }}
                  roleLabel="PRIMARY BENCHMARK"
                />

                {/* Contender B Card */}
                <ContenderCard
                  target={targetB}
                  isWinner={overallWinner === 'b'}
                  onInspect={(repoName) => {
                    setCurrentRepo(repoName);
                    setComparisonModalOpen(false);
                  }}
                  roleLabel="CHALLENGER TARGET"
                />
              </div>

              {/* Category Filter Tabs with Shared Layout Sliding Pill */}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                <div className="flex items-center p-1 rounded-xl bg-[#120909] border border-[#A5A79B]/20">
                  {(
                    [
                      { id: 'all', label: 'All Dimensions' },
                      { id: 'speed', label: 'Speed & Velocity' },
                      { id: 'architecture', label: 'Architecture & Hygiene' },
                    ] as const
                  ).map((tab) => {
                    const isActive = selectedCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedCategory(tab.id)}
                        className="relative px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="compare-category-pill"
                            className="absolute inset-0 rounded-lg bg-[#590907] border border-[#590907]"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <span className={`relative z-10 ${isActive ? 'text-[#E8D2B5] font-semibold' : 'text-[#A5A79B] hover:text-[#E8D2B5]'}`}>
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <span className="text-[11px] font-mono text-[#A5A79B]/70">
                  {filteredMetrics.length} metrics evaluated
                </span>
              </div>

              {/* Tug-of-War Comparative Telemetry Matrix */}
              <div className="space-y-4 rounded-xl border border-[#A5A79B]/15 bg-[#120909] p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-[#A5A79B]/15 pb-2.5 text-xs font-mono text-[#A5A79B]">
                  <span className="font-semibold uppercase tracking-wider">TUG-OF-WAR BENCHMARK MATRIX</span>
                  <span className="text-[11px] text-[#A5A79B]/60">CENTER-OUT EXPANSION</span>
                </div>

                <div className="space-y-4">
                  {filteredMetrics.map((item) => (
                    <TugOfWarRow key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Winner Badges Summary Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#590907]/40 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5]">
                    <Zap size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase text-[#A5A79B] block">OVERALL LEADER</span>
                    <span className="text-xs font-bold font-mono text-[#E8D2B5] truncate block">
                      {overallWinner === 'a'
                        ? targetA.type === 'repo' ? targetA.data.repo.name : targetA.data.hostname
                        : overallWinner === 'b'
                        ? targetB.type === 'repo' ? targetB.data.repo.name : targetB.data.hostname
                        : 'Balanced Matchup'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#590907]/40 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5]">
                    <ShieldCheck size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase text-[#A5A79B] block">MATCHUP ARCHITECTURE</span>
                    <span className="text-xs font-bold font-mono text-[#E8D2B5] truncate block capitalize">
                      {matchupType.replace(/-/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#590907]/40 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5]">
                    <Sparkles size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase text-[#A5A79B] block">AUDIENCE AUDIT</span>
                    <span className="text-xs font-bold font-mono text-[#E8D2B5] truncate block capitalize">
                      {isPlain ? 'Plain English Dilemma' : 'Technical Rest Telemetry'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

/**
 * Contender Display Card for Repo or Live URL
 */
function ContenderCard({
  target,
  isWinner,
  onInspect,
  roleLabel,
}: {
  target: ComparisonTarget;
  isWinner: boolean;
  onInspect: (repoName: string) => void;
  roleLabel: string;
}) {
  if (target.type === 'repo') {
    const { repo, language } = target.data;
    return (
      <motion.div
        layout
        className={`p-4 sm:p-5 rounded-2xl bg-[#120909] border flex flex-col justify-between gap-3.5 relative overflow-hidden transition-all duration-300 ${
          isWinner
            ? 'border-[#590907] ring-1 ring-[#590907] shadow-[0_0_25px_rgba(89,9,7,0.35)]'
            : 'border-[#A5A79B]/15'
        }`}
      >
        {isWinner && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#590907] text-[#E8D2B5] border border-[#E8D2B5]/30 shadow-md"
          >
            <Trophy size={11} className="text-[#E8D2B5]" />
            <span>LEADER</span>
          </motion.div>
        )}

        <div className="flex items-start gap-3.5">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#A5A79B]/20 bg-[#180d0d]">
            <Image
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B]">
              {roleLabel}
            </span>
            <h3 className="text-base sm:text-lg font-serif font-normal text-[#E8D2B5] truncate">
              {repo.full_name}
            </h3>
            <p className="text-xs text-[#A5A79B] line-clamp-2 mt-0.5 font-sans">
              {repo.description || 'Public GitHub repository'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#A5A79B]/15 text-xs font-mono">
          <span className="text-[#A5A79B]">
            Language: <strong className="text-[#E8D2B5]">{language}</strong>
          </span>
          <button
            onClick={() => onInspect(repo.full_name)}
            className="text-[#E8D2B5] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>Inspect in Dashboard</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </motion.div>
    );
  }

  // Live URL Contender
  const { data } = target;
  return (
    <motion.div
      layout
      className={`p-4 sm:p-5 rounded-2xl bg-[#120909] border flex flex-col justify-between gap-3.5 relative overflow-hidden transition-all duration-300 ${
        isWinner
          ? 'border-[#590907] ring-1 ring-[#590907] shadow-[0_0_25px_rgba(89,9,7,0.35)]'
          : 'border-[#A5A79B]/15'
      }`}
    >
      {isWinner && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#590907] text-[#E8D2B5] border border-[#E8D2B5]/30 shadow-md"
        >
          <Trophy size={11} className="text-[#E8D2B5]" />
          <span>LEADER</span>
        </motion.div>
      )}

      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-[#590907]/30 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5]">
          <Globe size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B]">
            {roleLabel} (LIVE)
          </span>
          <h3 className="text-base sm:text-lg font-serif font-normal text-[#E8D2B5] truncate">
            {data.title || data.hostname}
          </h3>
          <p className="text-xs text-[#A5A79B] line-clamp-2 mt-0.5 font-sans">
            {data.description || `Production deployment at ${data.finalUrl}`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#A5A79B]/15 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#A5A79B]">TTFB: <strong className="text-[#E8D2B5]">{data.ttfbMs}ms</strong></span>
          {data.isHttps && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#A5A79B]">
              <Lock size={10} className="text-[#E8D2B5]" /> SSL
            </span>
          )}
        </div>
        <a
          href={data.finalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E8D2B5] hover:underline flex items-center gap-1 font-semibold"
        >
          <span>Visit</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  );
}

/**
 * Tug-of-War Metric Row with Opposing Progress Bars
 */
function TugOfWarRow({ item }: { item: any }) {
  const Icon = item.icon;
  const pctA = Math.min(100, Math.max(6, (item.valA / (item.maxVal || 1)) * 100));
  const pctB = Math.min(100, Math.max(6, (item.valB / (item.maxVal || 1)) * 100));

  return (
    <div className="space-y-2 py-2 border-b border-[#A5A79B]/10 last:border-b-0">
      {/* Label and Plain Verdict */}
      <div className="flex items-center justify-between text-xs font-sans">
        <span className="text-[#E8D2B5] flex items-center gap-1.5 font-medium">
          <Icon size={14} className="text-[#E8D2B5]" />
          <span>{item.label}</span>
        </span>
        {item.plainVerdict && (
          <span className="text-[11px] font-sans text-[#A5A79B] truncate max-w-sm hidden sm:inline">
            {item.plainVerdict}
          </span>
        )}
      </div>

      {/* Opposing Metrics & Tug-of-War Dual Bars */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className={`font-semibold flex items-center gap-1.5 ${item.winner === 'a' ? 'text-[#E8D2B5]' : 'text-[#A5A79B]'}`}>
            <span>{item.displayA}</span>
            {item.winner === 'a' && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] bg-[#590907] text-[#E8D2B5] font-bold">
                <Trophy size={9} /> LEAD
              </span>
            )}
          </span>

          <span className={`font-semibold flex items-center gap-1.5 ${item.winner === 'b' ? 'text-[#E8D2B5]' : 'text-[#A5A79B]'}`}>
            {item.winner === 'b' && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] bg-[#590907] text-[#E8D2B5] font-bold">
                <Trophy size={9} /> LEAD
              </span>
            )}
            <span>{item.displayB}</span>
          </span>
        </div>

        {/* Tug-of-War Opposing Track */}
        <div className="flex items-center gap-1 w-full">
          {/* Left Bar (Contender A) expands rightwards toward center */}
          <div className="flex-1 flex justify-end h-2.5 bg-[#180d0d] rounded-l-full overflow-hidden border border-r-0 border-[#A5A79B]/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctA}%` }}
              transition={{ type: 'spring', damping: 22, stiffness: 200 }}
              className={`h-full rounded-l-full ${
                item.winner === 'a'
                  ? 'bg-[#E8D2B5] shadow-[0_0_10px_rgba(232,210,181,0.65)]'
                  : 'bg-[#590907]/80'
              }`}
            />
          </div>

          {/* Center Tug Divider */}
          <div className="w-1.5 h-4 rounded-full bg-[#A5A79B]/40 shrink-0 shadow-sm" />

          {/* Right Bar (Contender B) expands leftwards from center */}
          <div className="flex-1 flex justify-start h-2.5 bg-[#180d0d] rounded-r-full overflow-hidden border border-l-0 border-[#A5A79B]/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctB}%` }}
              transition={{ type: 'spring', damping: 22, stiffness: 200 }}
              className={`h-full rounded-r-full ${
                item.winner === 'b'
                  ? 'bg-[#E8D2B5] shadow-[0_0_10px_rgba(232,210,181,0.65)]'
                  : 'bg-[#590907]/80'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
