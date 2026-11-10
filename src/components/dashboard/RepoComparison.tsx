'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, GitCompare, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ghFetch, parseRepoInput, Repository, CommitEntry, Contributor, Release } from '@/lib/github';
import { calculateVelocityScore, calculateBusFactor } from '@/lib/metrics';

const PRESET_COMPARISONS = [
  'facebook/react',
  'vuejs/core',
  'vercel/next.js',
  'remix-run/react-router',
  'shadcn/ui',
  'tailwindlabs/tailwindcss',
];

interface ComparisonRepoMetrics {
  repo: Repository;
  velocityScore: number;
  busFactorScore: number;
  releasesCount: number;
  topContributorPct: number;
}

export default function RepoComparison() {
  const {
    comparisonModalOpen,
    setComparisonModalOpen,
    repoData,
    githubToken,
    setCurrentRepo,
  } = useAppStore();
  const [targetInput, setTargetInput] = useState('');
  const [targetMetrics, setTargetMetrics] = useState<ComparisonRepoMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!comparisonModalOpen || !repoData) return null;

  const handleFetchComparison = async (inputStr: string) => {
    const parsed = parseRepoInput(inputStr);
    if (!parsed) {
      setError('Invalid format. Enter owner/repo (e.g. vuejs/core)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { owner, repo } = parsed;
      const [repoRes, commitsRes, contribsRes, releasesRes] = await Promise.all([
        ghFetch<Repository>(`https://api.github.com/repos/${owner}/${repo}`, githubToken),
        ghFetch<CommitEntry[]>(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`, githubToken).catch(() => []),
        ghFetch<Contributor[]>(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=20`, githubToken).catch(() => []),
        ghFetch<Release[]>(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=20`, githubToken).catch(() => []),
      ]);

      const velocity = calculateVelocityScore(commitsRes, releasesRes, repoRes.pushed_at);
      const busFactor = calculateBusFactor(contribsRes);

      setTargetMetrics({
        repo: repoRes,
        velocityScore: velocity.score,
        busFactorScore: busFactor.busFactorScore,
        releasesCount: releasesRes.length,
        topContributorPct: busFactor.topContributorPct,
      });
    } catch (err: any) {
      setError(err?.message || 'Could not fetch target repository for comparison.');
    } finally {
      setLoading(false);
    }
  };

  const current = {
    repo: repoData.repo,
    velocityScore: repoData.velocity.score,
    busFactorScore: repoData.busFactor.busFactorScore,
    releasesCount: repoData.releases.length,
    topContributorPct: repoData.busFactor.topContributorPct,
  };

  const rows = [
    {
      metric: 'Velocity Index',
      val1: `${current.velocityScore}/100`,
      val2: targetMetrics ? `${targetMetrics.velocityScore}/100` : '-',
      winner: targetMetrics
        ? current.velocityScore >= targetMetrics.velocityScore
          ? 'current'
          : 'target'
        : null,
    },
    {
      metric: 'Stars (Adoption)',
      val1: current.repo.stargazers_count.toLocaleString(),
      val2: targetMetrics ? targetMetrics.repo.stargazers_count.toLocaleString() : '-',
      winner: targetMetrics
        ? current.repo.stargazers_count >= targetMetrics.repo.stargazers_count
          ? 'current'
          : 'target'
        : null,
    },
    {
      metric: 'Forks (Ecosystem)',
      val1: current.repo.forks_count.toLocaleString(),
      val2: targetMetrics ? targetMetrics.repo.forks_count.toLocaleString() : '-',
      winner: targetMetrics
        ? current.repo.forks_count >= targetMetrics.repo.forks_count
          ? 'current'
          : 'target'
        : null,
    },
    {
      metric: 'Open Issues',
      val1: current.repo.open_issues_count.toLocaleString(),
      val2: targetMetrics ? targetMetrics.repo.open_issues_count.toLocaleString() : '-',
      winner: targetMetrics
        ? current.repo.open_issues_count <= targetMetrics.repo.open_issues_count
          ? 'current'
          : 'target'
        : null,
    },
    {
      metric: 'Bus Factor (Decentralization)',
      val1: `${current.busFactorScore}/10 (${current.topContributorPct.toFixed(0)}% solo)`,
      val2: targetMetrics
        ? `${targetMetrics.busFactorScore}/10 (${targetMetrics.topContributorPct.toFixed(0)}% solo)`
        : '-',
      winner: targetMetrics
        ? current.busFactorScore >= targetMetrics.busFactorScore
          ? 'current'
          : 'target'
        : null,
    },
    {
      metric: 'Primary Language',
      val1: current.repo.language || 'N/A',
      val2: targetMetrics ? targetMetrics.repo.language || 'N/A' : '-',
      winner: null,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C1222]/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl rounded-2xl border border-[#5C6A80]/20 bg-[#FFFFFF] shadow-2xl p-6 overflow-hidden"
          style={{
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(12, 18, 34, 0.08)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#5C6A80]/15">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EEF1FF] border border-[#3D4FE0] flex items-center justify-center">
                <GitCompare size={16} className="text-[#0C1222]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0C1222] font-heading">
                  Head-to-Head Repository Comparison
                </h3>
                <p className="text-xs text-[#5C6A80] font-sans">
                  Benchmark velocity, bus-factor resilience, and community adoption
                </p>
              </div>
            </div>
            <button
              onClick={() => setComparisonModalOpen(false)}
              className="p-1.5 rounded-lg text-[#5C6A80] hover:text-[#0C1222] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search bar & Presets */}
          <div className="mt-4 space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFetchComparison(targetInput);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C6A80]"
                />
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Enter comparison repository (e.g. vuejs/core or URL)..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#5C6A80]/20 font-mono text-xs text-[#0C1222] placeholder-[#5C6A80]/50 focus:outline-none focus:border-[#3D4FE0]"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !targetInput.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold font-mono bg-[#3D4FE0] text-white hover:bg-[#2A38B8] transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                <span>Compare</span>
              </button>
            </form>

            <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono text-[#5C6A80]">
              <span className="text-[#5C6A80]/60">Presets:</span>
              {PRESET_COMPARISONS.filter((p) => p !== current.repo.full_name)
                .slice(0, 4)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setTargetInput(p);
                      handleFetchComparison(p);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#F7F8FC] border border-[#5C6A80]/15 text-[#5C6A80] hover:border-[#3D4FE0] hover:text-[#0C1222] transition-colors"
                  >
                    {p}
                  </button>
                ))}
            </div>

            {error && (
              <p className="text-xs font-mono text-[#3D4FE0] bg-[#EEF1FF] p-3 rounded-xl border border-[#3D4FE0]">
                {error}
              </p>
            )}
          </div>

          {/* Matrix */}
          <div className="mt-4 rounded-xl border border-[#5C6A80]/15 bg-[#F7F8FC] overflow-hidden">
            <div className="grid grid-cols-3 bg-[#FFFFFF] p-3 text-xs font-mono font-semibold text-[#5C6A80] border-b border-[#5C6A80]/15">
              <span>Metric</span>
              <span className="text-[#0C1222] truncate">{current.repo.full_name}</span>
              <span className="text-[#5C6A80] truncate">
                {targetMetrics ? targetMetrics.repo.full_name : 'Target Benchmark'}
              </span>
            </div>

            <div className="divide-y divide-[#5C6A80]/10 max-h-72 overflow-y-auto">
              {rows.map((r, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 p-3 text-xs font-mono items-center hover:bg-[#FFFFFF]/50 transition-colors"
                >
                  <span className="text-[#5C6A80] font-sans">{r.metric}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={
                        r.winner === 'current'
                          ? 'text-[#0C1222] font-bold'
                          : 'text-[#5C6A80]'
                      }
                    >
                      {r.val1}
                    </span>
                    {r.winner === 'current' && (
                      <Trophy size={12} className="text-[#0C1222] shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={
                        r.winner === 'target'
                          ? 'text-[#0C1222] font-bold'
                          : 'text-[#5C6A80]'
                      }
                    >
                      {r.val2}
                    </span>
                    {r.winner === 'target' && (
                      <Trophy size={12} className="text-[#0C1222] shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Switch current repo shortcut */}
          {targetMetrics && (
            <div className="mt-4 flex items-center justify-between text-xs font-mono text-[#5C6A80]">
              <span>Switch active repository view?</span>
              <button
                onClick={() => {
                  setCurrentRepo(targetMetrics.repo.full_name);
                  setComparisonModalOpen(false);
                  window.location.reload();
                }}
                className="flex items-center gap-1.5 text-[#0C1222] hover:underline font-semibold"
              >
                <span>Switch to {targetMetrics.repo.full_name}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
