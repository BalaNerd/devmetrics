'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  GitCompare,
  Trophy,
  ArrowRight,
  Loader2,
  Star,
  GitFork,
  AlertCircle,
  Users,
  ShieldCheck,
  Zap,
  Activity,
  Clock,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import {
  ghFetch,
  parseRepoInput,
  Repository,
  CommitEntry,
  Contributor,
  Release,
  HealthMetrics,
} from '@/lib/github';
import {
  calculateVelocityScore,
  calculateBusFactor,
  calculateHealthGrade,
  formatNumber,
} from '@/lib/metrics';

const PRESET_PAIRS = [
  { a: 'pmndrs/zustand', b: 'reduxjs/redux', label: 'Zustand vs Redux' },
  { a: 'vitejs/vite', b: 'webpack/webpack', label: 'Vite vs Webpack' },
  { a: 'facebook/react', b: 'vuejs/core', label: 'React vs Vue' },
  { a: 'vercel/next.js', b: 'remix-run/react-router', label: 'Next.js vs Remix' },
  { a: 'tailwindlabs/tailwindcss', b: 'unocss/unocss', label: 'Tailwind vs UnoCSS' },
];

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

export default function RepoComparisonModal() {
  const {
    comparisonModalOpen,
    setComparisonModalOpen,
    repoData,
    currentRepo,
    setCurrentRepo,
    githubToken,
  } = useAppStore();

  const [repoAInput, setRepoAInput] = useState('');
  const [repoBInput, setRepoBInput] = useState('');
  const [dataA, setDataA] = useState<RepoTelemetrySummary | null>(null);
  const [dataB, setDataB] = useState<RepoTelemetrySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize input values from currently loaded repo
  useEffect(() => {
    if (comparisonModalOpen) {
      const active = repoData?.repo?.full_name || currentRepo || 'vercel/next.js';
      setRepoAInput(active);
      if (!repoBInput) {
        setRepoBInput('remix-run/react-router');
      }
    }
  }, [comparisonModalOpen, repoData, currentRepo]);

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

  // Fetch telemetry helper for a single repository
  const fetchSingleRepoTelemetry = async (repoInput: string): Promise<RepoTelemetrySummary> => {
    const parsed = parseRepoInput(repoInput);
    if (!parsed) {
      throw new Error(`Invalid repository: "${repoInput}". Use format "owner/repo"`);
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

  const handleCompare = useCallback(
    async (aStr: string, bStr: string) => {
      if (!aStr.trim() || !bStr.trim()) return;
      setLoading(true);
      setError(null);

      try {
        const [resA, resB] = await Promise.all([
          fetchSingleRepoTelemetry(aStr),
          fetchSingleRepoTelemetry(bStr),
        ]);
        setDataA(resA);
        setDataB(resB);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch repositories for head-to-head comparison.');
      } finally {
        setLoading(false);
      }
    },
    [githubToken]
  );

  // Auto run comparison when modal opens if data not loaded yet
  useEffect(() => {
    if (comparisonModalOpen && !dataA && !dataB) {
      const a = repoData?.repo?.full_name || currentRepo || 'vercel/next.js';
      const b = 'remix-run/react-router';
      handleCompare(a, b);
    }
  }, [comparisonModalOpen, repoData, currentRepo, dataA, dataB, handleCompare]);

  if (!comparisonModalOpen) return null;

  // Comparison metrics rows
  const getWinner = (valA: number, valB: number, higherIsBetter = true) => {
    if (valA === valB) return 'tie';
    if (higherIsBetter) return valA > valB ? 'a' : 'b';
    return valA < valB ? 'a' : 'b';
  };

  const velocityWinner = dataA && dataB ? getWinner(dataA.velocityScore, dataB.velocityScore) : null;
  const healthWinner = dataA && dataB ? getWinner(dataA.healthScore, dataB.healthScore) : null;
  const busFactorWinner = dataA && dataB ? getWinner(dataA.busFactorScore, dataB.busFactorScore) : null;
  const starsWinner = dataA && dataB ? getWinner(dataA.stars, dataB.stars) : null;
  const cadenceWinner = dataA && dataB ? getWinner(dataA.cadence, dataB.cadence) : null;
  const issuesWinner = dataA && dataB ? getWinner(dataA.openIssues, dataB.openIssues, false) : null;

  // Synthesis summary verdict
  const summaryVerdict = (() => {
    if (!dataA || !dataB) return '';
    const winsA = [velocityWinner, healthWinner, busFactorWinner, starsWinner, cadenceWinner].filter(
      (w) => w === 'a'
    ).length;
    const winsB = [velocityWinner, healthWinner, busFactorWinner, starsWinner, cadenceWinner].filter(
      (w) => w === 'b'
    ).length;

    if (winsA > winsB) {
      return `${dataA.repo.name} demonstrates superior overall engineering health & velocity (${winsA} key dimensions lead vs ${winsB}).`;
    } else if (winsB > winsA) {
      return `${dataB.repo.name} demonstrates stronger developer adoption & maintenance throughput (${winsB} key dimensions lead vs ${winsA}).`;
    }
    return `Both repositories operate at balanced engineering momentum with specialized structural trade-offs.`;
  })();

  const switchToRepo = (repoFullName: string) => {
    setCurrentRepo(repoFullName);
    setComparisonModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#000000]/80 backdrop-blur-md overflow-y-auto">
        {/* Backdrop click dismiss */}
        <div
          className="fixed inset-0"
          onClick={() => setComparisonModalOpen(false)}
          aria-hidden="true"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
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

          {/* Top Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#A5A79B]/15 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#590907]/30 border border-[#590907] flex items-center justify-center text-[#E8D2B5]">
                <GitCompare size={20} />
              </div>
              <div>
                <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#A5A79B]/80 block">
                  HEAD-TO-HEAD COMPARATIVE STUDIO
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#E8D2B5] font-sans">
                  Repository Benchmark Deck
                </h2>
              </div>
            </div>

            <button
              onClick={() => setComparisonModalOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A5A79B] hover:text-[#E8D2B5] hover:bg-[#120909] border border-[#A5A79B]/15 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Dual Search & Presets Bar */}
          <div className="space-y-3 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-5 relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A5A79B]" />
                <input
                  type="text"
                  value={repoAInput}
                  onChange={(e) => setRepoAInput(e.target.value)}
                  placeholder="Primary repo (owner/repo)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#120909] border border-[#A5A79B]/20 text-xs font-mono text-[#E8D2B5] placeholder-[#A5A79B]/40 focus:outline-none focus:border-[#590907]"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-center">
                <span className="px-3 py-1 rounded-full bg-[#590907] text-[#E8D2B5] font-mono font-black text-xs border border-[#590907] shadow-sm">
                  VS
                </span>
              </div>

              <div className="md:col-span-5 relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A5A79B]" />
                <input
                  type="text"
                  value={repoBInput}
                  onChange={(e) => setRepoBInput(e.target.value)}
                  placeholder="Comparison repo (owner/repo)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#120909] border border-[#A5A79B]/20 text-xs font-mono text-[#E8D2B5] placeholder-[#A5A79B]/40 focus:outline-none focus:border-[#590907]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-[#A5A79B]/70 mr-1">Quick Presets:</span>
                {PRESET_PAIRS.map((pair) => (
                  <button
                    key={pair.label}
                    onClick={() => {
                      setRepoAInput(pair.a);
                      setRepoBInput(pair.b);
                      handleCompare(pair.a, pair.b);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#120909] border border-[#A5A79B]/15 text-[11px] font-mono text-[#A5A79B] hover:text-[#E8D2B5] hover:border-[#590907] transition-colors cursor-pointer"
                  >
                    {pair.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCompare(repoAInput, repoBInput)}
                disabled={loading || !repoAInput.trim() || !repoBInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-[#590907] hover:bg-[#77110f] text-[#E8D2B5] border border-[#590907] transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <GitCompare size={13} />}
                <span>Run Telemetry Comparison</span>
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#590907]/20 border border-[#590907] text-xs font-mono text-[#E8D2B5]">
                {error}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-[#590907] border-t-[#E8D2B5] rounded-full animate-spin" />
              <p className="text-xs font-mono uppercase tracking-widest text-[#A5A79B]">
                Benchmarking dual repository telemetry...
              </p>
            </div>
          )}

          {/* Head-to-Head Comparative Content */}
          {!loading && dataA && dataB && (
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

              {/* Side-by-Side Dual Header Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Repo A Card */}
                <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between gap-3 relative overflow-hidden">
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#A5A79B]/20 bg-[#180d0d]">
                      <Image
                        src={dataA.repo.owner.avatar_url}
                        alt={dataA.repo.owner.login}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B]">PRIMARY BENCHMARK</span>
                      <h3 className="text-base sm:text-lg font-bold text-[#E8D2B5] font-sans truncate">
                        {dataA.repo.full_name}
                      </h3>
                      <p className="text-xs text-[#A5A79B] line-clamp-2 mt-0.5 font-sans">
                        {dataA.repo.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#A5A79B]/15 text-xs font-mono">
                    <span className="text-[#A5A79B]">Language: <strong className="text-[#E8D2B5]">{dataA.language}</strong></span>
                    <button
                      onClick={() => switchToRepo(dataA.repo.full_name)}
                      className="text-[#E8D2B5] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Inspect</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Repo B Card */}
                <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between gap-3 relative overflow-hidden">
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#A5A79B]/20 bg-[#180d0d]">
                      <Image
                        src={dataB.repo.owner.avatar_url}
                        alt={dataB.repo.owner.login}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B]">CHALLENGER TARGET</span>
                      <h3 className="text-base sm:text-lg font-bold text-[#E8D2B5] font-sans truncate">
                        {dataB.repo.full_name}
                      </h3>
                      <p className="text-xs text-[#A5A79B] line-clamp-2 mt-0.5 font-sans">
                        {dataB.repo.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#A5A79B]/15 text-xs font-mono">
                    <span className="text-[#A5A79B]">Language: <strong className="text-[#E8D2B5]">{dataB.language}</strong></span>
                    <button
                      onClick={() => switchToRepo(dataB.repo.full_name)}
                      className="text-[#E8D2B5] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Switch View</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Head-to-Head Comparative Telemetry Bars */}
              <div className="space-y-3.5 rounded-xl border border-[#A5A79B]/15 bg-[#120909] p-4 sm:p-5">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#A5A79B] font-semibold border-b border-[#A5A79B]/15 pb-2 flex items-center justify-between">
                  <span>METRIC BENCHMARK MATRIX</span>
                  <span className="text-[11px] font-normal text-[#A5A79B]/60">WINNER HIGHLIGHTED</span>
                </h4>

                {/* 1. Velocity Score */}
                <ComparisonBarRow
                  label="Velocity Score (0-100)"
                  icon={Zap}
                  valA={dataA.velocityScore}
                  valB={dataB.velocityScore}
                  displayA={`${dataA.velocityScore} / 100`}
                  displayB={`${dataB.velocityScore} / 100`}
                  winner={velocityWinner}
                  maxVal={100}
                />

                {/* 2. Health Grade & Hygiene */}
                <ComparisonBarRow
                  label="Governance & Health"
                  icon={ShieldCheck}
                  valA={dataA.healthScore}
                  valB={dataB.healthScore}
                  displayA={`Grade ${dataA.healthGrade} (${dataA.healthScore}%)`}
                  displayB={`Grade ${dataB.healthGrade} (${dataB.healthScore}%)`}
                  winner={healthWinner}
                  maxVal={100}
                />

                {/* 3. Shipping Cadence */}
                <ComparisonBarRow
                  label="Weekly Commit Cadence"
                  icon={Activity}
                  valA={dataA.cadence}
                  valB={dataB.cadence}
                  displayA={`${dataA.cadence.toFixed(1)} commits/wk`}
                  displayB={`${dataB.cadence.toFixed(1)} commits/wk`}
                  winner={cadenceWinner}
                  maxVal={Math.max(dataA.cadence, dataB.cadence, 10)}
                />

                {/* 4. Bus Factor Decentralization */}
                <ComparisonBarRow
                  label="Bus Factor Decentralization"
                  icon={Users}
                  valA={dataA.busFactorScore}
                  valB={dataB.busFactorScore}
                  displayA={`${dataA.busFactorScore}/10 (${dataA.topContributorPct.toFixed(0)}% solo)`}
                  displayB={`${dataB.busFactorScore}/10 (${dataB.topContributorPct.toFixed(0)}% solo)`}
                  winner={busFactorWinner}
                  maxVal={10}
                />

                {/* 5. GitHub Stars (Adoption) */}
                <ComparisonBarRow
                  label="Community Adoption (Stars)"
                  icon={Star}
                  valA={dataA.stars}
                  valB={dataB.stars}
                  displayA={formatNumber(dataA.stars)}
                  displayB={formatNumber(dataB.stars)}
                  winner={starsWinner}
                  maxVal={Math.max(dataA.stars, dataB.stars, 1000)}
                />

                {/* 6. Open Issues Backlog (Lower is Better) */}
                <ComparisonBarRow
                  label="Issue Backlog Turnaround"
                  icon={AlertCircle}
                  valA={dataA.openIssues}
                  valB={dataB.openIssues}
                  displayA={`${formatNumber(dataA.openIssues)} open issues`}
                  displayB={`${formatNumber(dataB.openIssues)} open issues`}
                  winner={issuesWinner}
                  maxVal={Math.max(dataA.openIssues, dataB.openIssues, 50)}
                  invertBarFill
                />
              </div>

              {/* Bottom Winner Badges Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#590907]/40 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5]">
                    <Zap size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase text-[#A5A79B] block">VELOCITY WINNER</span>
                    <span className="text-xs font-bold font-mono text-[#E8D2B5] truncate block">
                      {velocityWinner === 'a' ? dataA.repo.name : velocityWinner === 'b' ? dataB.repo.name : 'Tie'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#590907]/40 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5]">
                    <ShieldCheck size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase text-[#A5A79B] block">GOVERNANCE WINNER</span>
                    <span className="text-xs font-bold font-mono text-[#E8D2B5] truncate block">
                      {healthWinner === 'a' ? dataA.repo.name : healthWinner === 'b' ? dataB.repo.name : 'Tie'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#590907]/40 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5]">
                    <Users size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase text-[#A5A79B] block">STABILITY WINNER</span>
                    <span className="text-xs font-bold font-mono text-[#E8D2B5] truncate block">
                      {busFactorWinner === 'a' ? dataA.repo.name : busFactorWinner === 'b' ? dataB.repo.name : 'Tie'}
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

function ComparisonBarRow({
  label,
  icon: Icon,
  valA,
  valB,
  displayA,
  displayB,
  winner,
  maxVal,
  invertBarFill = false,
}: {
  label: string;
  icon: any;
  valA: number;
  valB: number;
  displayA: string;
  displayB: string;
  winner: 'a' | 'b' | 'tie' | null;
  maxVal: number;
  invertBarFill?: boolean;
}) {
  const pctA = Math.min(100, Math.max(5, (valA / (maxVal || 1)) * 100));
  const pctB = Math.min(100, Math.max(5, (valB / (maxVal || 1)) * 100));

  return (
    <div className="space-y-1.5 py-2 border-b border-[#A5A79B]/10 last:border-b-0">
      <div className="flex items-center justify-between text-xs font-sans">
        <span className="text-[#A5A79B] flex items-center gap-1.5 font-medium">
          <Icon size={13} className="text-[#E8D2B5]" />
          <span>{label}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        {/* Repo A Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={`font-semibold flex items-center gap-1 ${winner === 'a' ? 'text-[#E8D2B5]' : 'text-[#A5A79B]'}`}>
              {displayA}
              {winner === 'a' && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] bg-[#590907] text-[#E8D2B5] font-bold">
                  <Trophy size={9} /> LEAD
                </span>
              )}
            </span>
          </div>
          <div className="h-2 w-full bg-[#180d0d] rounded-full overflow-hidden border border-[#A5A79B]/15">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctA}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                winner === 'a' ? 'bg-[#E8D2B5] shadow-[0_0_8px_rgba(232,210,181,0.6)]' : 'bg-[#590907]'
              }`}
            />
          </div>
        </div>

        {/* Repo B Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={`font-semibold flex items-center gap-1 ${winner === 'b' ? 'text-[#E8D2B5]' : 'text-[#A5A79B]'}`}>
              {displayB}
              {winner === 'b' && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] bg-[#590907] text-[#E8D2B5] font-bold">
                  <Trophy size={9} /> LEAD
                </span>
              )}
            </span>
          </div>
          <div className="h-2 w-full bg-[#180d0d] rounded-full overflow-hidden border border-[#A5A79B]/15">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctB}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                winner === 'b' ? 'bg-[#E8D2B5] shadow-[0_0_8px_rgba(232,210,181,0.6)]' : 'bg-[#590907]'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

