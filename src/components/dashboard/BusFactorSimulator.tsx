'use client';

import { useState, useMemo } from 'react';
import { Flame, AlertTriangle, ShieldCheck, UserX, TrendingDown, GitPullRequest, HelpCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { RepoData } from '@/lib/github';

interface BusFactorSimulatorProps {
  data: RepoData;
  embedded?: boolean;
}

export default function BusFactorSimulator({ data, embedded = false }: BusFactorSimulatorProps) {
  const { audienceMode } = useAppStore();
  const isPlain = audienceMode === 'plain';
  const [absenceDays, setAbsenceDays] = useState(30);

  const { velocity, busFactor, repo } = data;

  const topPct = Math.min(Math.max(Math.round(busFactor.topContributorPct), 5), 100);
  const isHighRisk = busFactor.busFactorScore <= 3 || topPct >= 65;

  const simulation = useMemo(() => {
    const monthlyPRs = Math.max(3, Math.round(velocity.prFrequency * 4 || 6));
    const monthlyIssues = Math.max(4, Math.round(repo.open_issues_count / 10 || 8));

    const factorRatio = topPct / 100;
    const months = absenceDays / 30;

    const accumulatedPRs = Math.round(monthlyPRs * months * factorRatio);
    const accumulatedIssues = Math.round(monthlyIssues * months * factorRatio * 0.9);

    // Dynamic velocity drop
    const rawVelocityDrop = Math.round((absenceDays / 90) * 40 + factorRatio * 50);
    const velocityDropPct = Math.min(95, Math.max(15, rawVelocityDrop));

    // Projected Health calculation
    const baseHealth = Math.round((busFactor.busFactorScore / 10) * 100);
    const healthPenalty = Math.round((absenceDays / 90) * 45 * factorRatio);
    const projectedHealth = Math.max(10, baseHealth - healthPenalty);

    return {
      accumulatedPRs,
      accumulatedIssues,
      velocityDropPct,
      projectedHealth,
    };
  }, [absenceDays, topPct, velocity.prFrequency, repo.open_issues_count, busFactor.busFactorScore]);

  const containerClasses = embedded
    ? 'space-y-5 sm:space-y-6 w-full flex flex-col justify-between'
    : 'w-full bg-[#180d0d] border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between gap-6';

  return (
    <div className={containerClasses}>
      {/* Subheader */}
      <div className="flex items-start justify-between gap-3 flex-wrap pb-2 border-b border-[#A5A79B]/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center shrink-0">
            <Flame size={17} />
          </div>
          <div>
            <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#A5A79B]/80 block">
              {isPlain ? 'SUCCESSION PLANNING & RESILIENCE' : 'KEY-PERSON BURNOUT & BUS FACTOR SIMULATION'}
            </span>
            <h3 className="font-sans text-base sm:text-lg font-bold text-[#E8D2B5] tracking-tight mt-0.5">
              {isPlain ? 'What Happens If the Lead Developer Steps Away?' : `Simulating Absence: @${busFactor.dominantContributor}`}
            </h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#120909] border border-[#A5A79B]/20 text-[#E8D2B5]">
          <span className={isHighRisk ? 'text-[#E8D2B5] font-bold' : 'text-[#E8D2B5] font-semibold'}>
            {isHighRisk ? 'Critical Maintainer Lock-In' : 'Decentralized Resilience'}
          </span>
        </div>
      </div>

      {/* Interactive Absence Slider Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-3 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <span className="text-[#E8D2B5] font-semibold flex items-center gap-2">
            <UserX size={14} className="text-[#E8D2B5]" />
            Simulate lead maintainer absence:
          </span>
          <span className="px-3 py-1 rounded-full bg-[#590907] text-[#E8D2B5] font-bold text-xs">
            {absenceDays} Days Sabbatical
          </span>
        </div>

        <input
          type="range"
          min={15}
          max={90}
          step={15}
          value={absenceDays}
          onChange={(e) => setAbsenceDays(Number(e.target.value))}
          className="w-full h-2 rounded-full cursor-pointer accent-[#E8D2B5] bg-[#180d0d] border border-[#A5A79B]/20"
        />

        <div className="flex justify-between text-[11px] font-mono text-[#A5A79B]/80 pt-1">
          <span>15 Days</span>
          <span>30 Days (1 mo)</span>
          <span>60 Days (2 mo)</span>
          <span>90 Days (Quarter)</span>
        </div>
      </div>

      {/* PLAIN ENGLISH MODE: Conversational Impact Cards */}
      {isPlain ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#120909] border border-[#590907]/60 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-[#E8D2B5]" />
              <h4 className="text-sm sm:text-base font-bold text-[#E8D2B5] font-sans">
                {isHighRisk
                  ? `High Fragility: Development slows by ~${simulation.velocityDropPct}% without the primary builder.`
                  : `Steady Continuity: Multi-maintainer coverage ensures development continues.`}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-[#A5A79B] font-sans leading-relaxed">
              Because @{busFactor.dominantContributor} authors {topPct}% of all code, an absence of {absenceDays} days will lead to ~{simulation.accumulatedPRs} unreviewed pull requests and {simulation.accumulatedIssues} unresolved user issues.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-1">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#A5A79B] block">
                Velocity Slowdown
              </span>
              <p className="text-xl sm:text-2xl font-bold font-mono text-[#E8D2B5] tabular-nums">
                -{simulation.velocityDropPct}%
              </p>
              <p className="text-[11px] text-[#A5A79B] font-sans">
                Drop in shipping pace
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-1">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#A5A79B] block">
                Stalled Pull Requests
              </span>
              <p className="text-xl sm:text-2xl font-bold font-mono text-[#E8D2B5] tabular-nums">
                +{simulation.accumulatedPRs} PRs
              </p>
              <p className="text-[11px] text-[#A5A79B] font-sans">
                Waiting on code reviews
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-1">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#A5A79B] block">
                Project Resilience
              </span>
              <p className="text-xl sm:text-2xl font-bold font-mono text-[#E8D2B5] tabular-nums">
                {simulation.projectedHealth}%
              </p>
              <p className="text-[11px] text-[#A5A79B] font-sans">
                Estimated health index
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* TECHNICAL MODE: Pareto Decimals, Queue Depth & Bottleneck Metrics */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#120909] border border-[#590907]/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#A5A79B]">
                <TrendingDown size={14} className="text-[#E8D2B5]" />
                <span>THROUGHPUT COLLAPSE</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-[#E8D2B5] tabular-nums">
                -{simulation.velocityDropPct}%
              </p>
              <p className="text-xs text-[#A5A79B] font-sans">
                Trunk commit velocity drop
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#A5A79B]">
                <GitPullRequest size={14} className="text-[#E8D2B5]" />
                <span>TRIAGE BACKLOG</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-[#E8D2B5] tabular-nums">
                +{simulation.accumulatedPRs} PRs
              </p>
              <p className="text-xs text-[#A5A79B] font-sans">
                Unreviewed pull requests
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#A5A79B]">
                <ShieldCheck size={14} className="text-[#A5A79B]" />
                <span>RESILIENCE RATING</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-[#E8D2B5] tabular-nums">
                {simulation.projectedHealth}%
              </p>
              <p className="text-xs text-[#A5A79B] font-sans">
                Projected decentralization score
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#A5A79B]">Dominant Contributor Dependency:</span>
              <span className="text-[#E8D2B5] font-semibold">{topPct}% of all commit volume</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A5A79B]">Accumulated Issue Queue ({absenceDays}d):</span>
              <span className="text-[#E8D2B5] font-semibold">+{simulation.accumulatedIssues} untriaged issues</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#A5A79B]/10">
              <span className="text-[#A5A79B]">Succession Remediation:</span>
              <span className="text-[#E8D2B5] font-semibold">Add .github/CODEOWNERS paths & auto-assign reviewers</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

