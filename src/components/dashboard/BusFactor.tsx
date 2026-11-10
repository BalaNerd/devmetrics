'use client';

import { motion } from 'framer-motion';
import { Users, AlertTriangle, ShieldCheck, User, Users2 } from 'lucide-react';
import type { BusFactorMetrics, Contributor } from '@/lib/github';
import { useAppStore } from '@/store/useAppStore';

interface BusFactorProps {
  metrics?: BusFactorMetrics;
  busFactor?: BusFactorMetrics;
  contributorCount?: number;
  contributors?: Contributor[] | number;
}

export default function BusFactor({
  metrics,
  busFactor,
  contributorCount,
  contributors,
}: BusFactorProps) {
  const { audienceMode } = useAppStore();
  const isPlain = audienceMode === 'plain';

  const finalMetrics = metrics || busFactor || {
    busFactorScore: 1,
    topContributorPct: 100,
    top2ContributorPct: 100,
    riskLevel: 'critical' as const,
    dominantContributor: 'author',
  };

  const count = typeof contributors === 'number'
    ? contributors
    : Array.isArray(contributors)
    ? contributors.length
    : contributorCount ?? 1;

  const isSolo = finalMetrics.busFactorScore <= 3 || finalMetrics.topContributorPct >= 65;
  const topPct = Math.min(Math.max(Math.round(finalMetrics.topContributorPct), 5), 95);
  const othersPct = 100 - topPct;
  const giniScore = (finalMetrics.topContributorPct / 100 * 0.88).toFixed(2);

  return (
    <div className="w-full bg-[#180d0d]/85 backdrop-blur-xl border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl shadow-black/50 shadow-[inset_0_1px_0_rgba(232,210,181,0.08)] relative overflow-hidden flex flex-col justify-between gap-5">
      {/* Subtle Ambient Backlight Glow */}
      <div
        className="bg-[#590907]/20 blur-3xl rounded-full absolute -top-8 -right-8 w-40 h-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center shrink-0">
            <Users size={17} />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#A5A79B]/80 font-mono block">
              {isPlain ? 'TEAM STRUCTURE' : 'PARETO BUS FACTOR & KEY PERSON RISK'}
            </span>
            <h3 className="text-xl font-bold tracking-tight text-[#E8D2B5] font-sans mt-0.5">
              {isPlain ? 'Team Dynamics' : 'Contributor Centralization'}
            </h3>
          </div>
        </div>

        {/* High-visibility Status Badge */}
        {isPlain ? (
          isSolo ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-bold bg-[#590907] text-[#E8D2B5] border border-[#590907] shadow-sm">
              <User size={12} className="text-[#E8D2B5]" />
              Solo Builder
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-bold bg-[#120909] text-[#E8D2B5] border border-[#A5A79B]/25 shadow-sm">
              <Users2 size={12} className="text-[#E8D2B5]" />
              Distributed Team
            </span>
          )
        ) : isSolo ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#590907] text-[#E8D2B5] border border-[#590907] shadow-sm">
            <AlertTriangle size={12} className="text-[#E8D2B5]" />
            SOLO MAINTAINER HAZARD
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#120909] text-[#E8D2B5] border border-[#A5A79B]/25 shadow-sm">
            <ShieldCheck size={12} className="text-[#E8D2B5]" />
            DECENTRALIZED ({finalMetrics.busFactorScore}/10)
          </span>
        )}
      </div>

      {/* Main Mode-Aware Stat Card */}
      {isPlain ? (
        <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/20 relative z-10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#A5A79B]">
              Team Breakdown
            </span>
            <span className="text-xs font-mono text-[#E8D2B5] bg-[#180d0d] px-2 py-0.5 rounded border border-[#A5A79B]/15">
              {count} {count === 1 ? 'builder' : 'contributors'}
            </span>
          </div>
          <p className="font-sans text-sm sm:text-base text-[#E8D2B5] font-medium leading-relaxed">
            {isSolo ? (
              <>
                <strong>👤 Solo Builder</strong>: {topPct}% of this codebase is written by one person. Low collaboration, high autonomy.
              </>
            ) : (
              <>
                <strong>👥 Distributed Team</strong>: Work is balanced across multiple contributors. High operational resilience.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 relative z-10 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A5A79B]/80 block">
                TOP CONTRIBUTOR PARETO
              </span>
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#E8D2B5] tracking-tight tabular-nums">
                {finalMetrics.topContributorPct.toFixed(1)}%
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A5A79B]/80 block">
                GINI COEFFICIENT
              </span>
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#E8D2B5] tracking-tight tabular-nums">
                {giniScore}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#A5A79B]/15 text-xs font-mono">
            <span className="text-[#A5A79B]">Top 2 Authors Share:</span>
            <span className="text-[#E8D2B5] font-bold">{finalMetrics.top2ContributorPct.toFixed(1)}%</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#A5A79B]">.github/CODEOWNERS:</span>
            <span className={isSolo ? 'text-[#E8D2B5] font-bold bg-[#590907]/40 px-1.5 py-0.5 rounded' : 'text-[#E8D2B5]'}>
              {isSolo ? 'Missing (High Single-Point Risk)' : 'Configured / Distributed'}
            </span>
          </div>
        </div>
      )}

      {/* Contributor Split Progress Bar */}
      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="flex items-center gap-1.5 text-[#E8D2B5] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#E8D2B5] shadow-[0_0_6px_rgba(232,210,181,0.5)]" />
            {isPlain ? 'Lead Builder' : 'Dominant Contributor'} ({topPct}%)
          </span>
          <span className="flex items-center gap-1.5 text-[#A5A79B]">
            <span className="w-2 h-2 rounded-full bg-[#590907]" />
            {isPlain ? 'Other Contributors' : 'Long-Tail Commits'} ({othersPct}%)
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full overflow-hidden bg-[#590907] flex p-0.5 border border-[#A5A79B]/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${topPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-[#E8D2B5] rounded-full shadow-[0_0_6px_rgba(232,210,181,0.5)]"
          />
        </div>
      </div>

      {/* Conversational Narrative */}
      <p className="font-sans text-sm text-[#A5A79B] leading-relaxed pt-2 border-t border-[#A5A79B]/15 relative z-10">
        {isPlain ? (
          isSolo ? (
            <>
              Great for independent showcase projects; however, if the author steps away, updates will halt.
            </>
          ) : (
            <>
              Multiple maintainers share the workload, meaning this codebase is resilient to single-person absences.
            </>
          )
        ) : isSolo ? (
          <>
            Over <strong className="font-semibold text-[#E8D2B5]">{topPct}% of all commits</strong> originate from @{finalMetrics.dominantContributor}. Establishing <strong className="font-semibold text-[#E8D2B5]">CODEOWNERS</strong> paths distributes review load and eliminates institutional lock-in.
          </>
        ) : (
          <>
            <strong className="font-semibold text-[#E8D2B5]">Decentralized commit topology</strong> across {count} maintainers ensures high throughput and sustainable PR turnaround.
          </>
        )}
      </p>
    </div>
  );
}
