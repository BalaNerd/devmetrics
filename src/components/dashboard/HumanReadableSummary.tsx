'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Activity, Users, ShieldCheck } from 'lucide-react';
import type { RepoData } from '@/lib/github';
import { calculateHealthGrade, formatRelativeTime } from '@/lib/metrics';
import { useAppStore, type AudienceMode } from '@/store/useAppStore';

interface HumanReadableSummaryProps {
  data?: RepoData | null;
}

export default function HumanReadableSummary({ data }: HumanReadableSummaryProps) {
  const { audienceMode, setAudienceMode } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Standardize SSR default until the client component has cleanly mounted
  const isPlain = isMounted && audienceMode === 'plain';

  if (!data) return null;

  const { velocity, busFactor, health, repo } = data;
  const { grade, score: healthPct } = calculateHealthGrade(health);

  const isSolo = busFactor.busFactorScore <= 3 || busFactor.topContributorPct >= 65;
  const isHealthyCadence = velocity.daysSinceLastCommit <= 14 && velocity.commitFrequency >= 1.5;
  const isDormant = velocity.daysSinceLastCommit > 60;

  const topPct = Math.round(busFactor.topContributorPct || 100);

  return (
    <div className="w-full bg-[#180d0d]/85 backdrop-blur-xl border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl shadow-black/50 shadow-[inset_0_1px_0_rgba(232,210,181,0.08)] relative overflow-hidden flex flex-col gap-5">
      {/* Subtle Ambient Backlight Glow */}
      <div
        className="bg-[#590907]/20 blur-3xl rounded-full absolute -top-8 -right-8 w-40 h-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Header with Segmented View Switcher */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#A5A79B]/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center shrink-0">
            <Sparkles size={17} />
          </div>
          <div>
            <span suppressHydrationWarning className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#A5A79B]/80 font-mono block">
              {isPlain ? 'EXECUTIVE PORTFOLIO BRIEF' : 'EXECUTIVE DILIGENCE SUMMARY'}
            </span>
            <h2 suppressHydrationWarning className="text-xl font-bold tracking-tight text-[#E8D2B5] font-sans mt-0.5">
              {isPlain ? 'Plain English Dilemma Assessment' : 'Codebase Health & Dilemma Assessment'}
            </h2>
          </div>
        </div>

        {/* Segmented Switch: Technical Mode vs Plain English Mode */}
        <div suppressHydrationWarning className="flex items-center p-1 rounded-xl bg-[#120909] border border-[#A5A79B]/20 shrink-0 self-start sm:self-auto w-full sm:w-auto">
          {(['technical', 'plain'] as const).map((mode: AudienceMode) => {
            const isActive = (isMounted ? audienceMode : 'technical') === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setAudienceMode(mode)}
                className={`flex-1 sm:flex-initial min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 ease-out cursor-pointer ${
                  isActive
                    ? 'bg-[#590907] text-[#E8D2B5] font-semibold shadow-md shadow-black/40 border border-[#590907]'
                    : 'text-[#A5A79B] hover:text-[#E8D2B5]'
                }`}
              >
                {mode === 'technical' ? 'Technical Mode' : '✦ Plain English Mode'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulleted Executive Takeaways */}
      <div suppressHydrationWarning className="relative z-10 space-y-3">
        {/* Bullet 1: Cadence */}
        <div className="flex items-start gap-3 text-sm text-[#A5A79B] font-sans leading-relaxed">
          <span className="mt-1.5 w-2 h-2 rounded-full bg-[#E8D2B5] shrink-0 shadow-[0_0_6px_rgba(232,210,181,0.5)]" />
          <p>
            {isPlain ? (
              <>
                <strong className="text-[#E8D2B5] font-semibold">
                  {isDormant
                    ? 'Project Momentum: Inactive'
                    : isHealthyCadence
                    ? 'Project Momentum: Active Shipping'
                    : 'Project Momentum: Steady Updates'}
                </strong>
                : This repository receives{' '}
                <strong className="text-[#E8D2B5]">{isDormant ? 'no recent updates' : 'steady contributions'}</strong>{' '}
                and is {isDormant ? 'in maintenance mode' : 'actively developed'}. Most recent push was{' '}
                <strong className="text-[#E8D2B5]">{formatRelativeTime(repo.pushed_at)}</strong>.
              </>
            ) : (
              <>
                <strong className="text-[#E8D2B5] font-semibold">
                  {isDormant
                    ? 'Dormant Shipping Momentum'
                    : isHealthyCadence
                    ? 'Active Weekly Cadence'
                    : 'Steady Development Velocity'}
                </strong>
                : Repository records a Throughput Index of{' '}
                <strong className="font-mono text-[#E8D2B5] font-bold">{velocity.score}/100</strong> (~
                <span className="font-mono text-[#E8D2B5] font-medium">{velocity.commitFrequency.toFixed(1)}</span> commits/week). Latest commit pushed{' '}
                <strong className="text-[#E8D2B5] font-medium">{formatRelativeTime(repo.pushed_at)}</strong>.
              </>
            )}
          </p>
        </div>

        {/* Bullet 2: Contributor Risk */}
        <div className="flex items-start gap-3 text-sm text-[#A5A79B] font-sans leading-relaxed">
          <span className="mt-1.5 w-2 h-2 rounded-full bg-[#590907] shrink-0" />
          <p>
            {isPlain ? (
              <>
                <strong className="text-[#E8D2B5] font-semibold">
                  {isSolo ? 'Team Structure: Solo Builder' : 'Team Structure: Distributed Team'}
                </strong>
                : {isSolo ? (
                  <>
                    <strong className="text-[#E8D2B5]">{topPct}%</strong> of this codebase is written by one person. Low collaboration, high autonomy.
                  </>
                ) : (
                  <>
                    Work is balanced across multiple contributors. High operational resilience.
                  </>
                )}
              </>
            ) : (
              <>
                <strong className="text-[#E8D2B5] font-semibold">
                  {isSolo ? 'Solo Builder Bottleneck' : 'Distributed Contributor Architecture'}
                </strong>
                : {isSolo ? (
                  <>
                    Key-person dependency identified. Primary maintainer accounts for{' '}
                    <strong className="font-mono text-[#E8D2B5] font-bold">{topPct}%</strong> of all commits. Setting up review assignments mitigates bus-factor risk.
                  </>
                ) : (
                  <>
                    Healthy decentralization across {data.contributors?.length || 5}+ active maintainers ensures rapid reviews and operational resilience.
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {/* Bullet 3: Automated Testing & CI/CD */}
        <div className="flex items-start gap-3 text-sm text-[#A5A79B] font-sans leading-relaxed">
          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${health.hasCICD ? 'bg-[#E8D2B5]' : 'bg-[#590907]'}`} />
          <p>
            {isPlain ? (
              <>
                <strong className="text-[#E8D2B5] font-semibold">
                  {health.hasCICD ? 'Automated Testing: Protected' : 'Automated Testing: Missing'}
                </strong>
                : {health.hasCICD ? (
                  <>
                    Code changes are automatically verified by test bots before merging, ensuring software quality.
                  </>
                ) : (
                  <>
                    Changes are merged without automated test screening, elevating the risk of software regressions.
                  </>
                )}
              </>
            ) : (
              <>
                <strong className="text-[#E8D2B5] font-semibold">
                  {health.hasCICD ? 'Automated CI/CD Configured' : 'Missing CI/CD Workflows'}
                </strong>
                : {health.hasCICD ? (
                  <>
                    Validation test bot is active with <strong className="font-mono text-[#E8D2B5]">{health.workflowCount || 1}</strong> automated workflows running on every pull request.
                  </>
                ) : (
                  <>
                    Code merges are not pre-screened by automated tests, creating a risk of untested production regressions.
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {/* Bullet 4: Open Source Governance */}
        <div className="flex items-start gap-3 text-sm text-[#A5A79B] font-sans leading-relaxed">
          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${health.hasLicense ? 'bg-[#E8D2B5]' : 'bg-[#590907]'}`} />
          <p>
            {isPlain ? (
              <>
                <strong className="text-[#E8D2B5] font-semibold">
                  {health.hasLicense ? 'Open Source License: Active' : 'Open Source License: Missing'}
                </strong>
                : Portfolio Readiness rates at{' '}
                <strong className="font-mono text-[#E8D2B5] font-bold">Grade {grade} ({healthPct}%)</strong>. {health.hasLicense ? `Permissive ${health.licenseName || 'license'} detected for safe public use.` : 'No license found, restricting public use.'}
              </>
            ) : (
              <>
                <strong className="text-[#E8D2B5] font-semibold">
                  {health.hasLicense ? `SPDX ${health.licenseName || 'License'} Active` : 'Missing Open-Source License'}
                </strong>
                : Overall governance audit rates at{' '}
                <strong className="font-mono text-[#E8D2B5] font-bold">Grade {grade} ({healthPct}%)</strong>. {health.hasLicense ? 'Legal permissions allow commercial reuse and packaging.' : 'Lack of explicit SPDX license legally blocks enterprise adoption.'}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Quick Status Chips Strip */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 pt-3 border-t border-[#A5A79B]/15">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#120909] border border-[#A5A79B]/20 text-xs font-mono text-[#E8D2B5]">
          <Activity size={13} className="text-[#E8D2B5]" />
          <span>{isPlain ? 'Pulse: ' : 'Velocity: '}<strong>{velocity.score}/100</strong></span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#590907]/30 border border-[#590907] text-xs font-mono text-[#E8D2B5]">
          <Users size={13} className="text-[#E8D2B5]" />
          <span>{isSolo ? (isPlain ? 'Solo Builder' : 'Solo Maintainer') : 'Distributed Team'}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#120909] border border-[#A5A79B]/20 text-xs font-mono text-[#E8D2B5]">
          <ShieldCheck size={13} className="text-[#E8D2B5]" />
          <span>{isPlain ? 'Readiness: ' : 'Governance: '}<strong>Grade {grade}</strong> ({healthPct}%)</span>
        </div>
      </div>
    </div>
  );
}
