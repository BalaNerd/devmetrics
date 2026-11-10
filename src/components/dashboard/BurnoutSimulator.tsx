'use client';

import { useState } from 'react';
import { Flame } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { RepoData } from '@/lib/github';

interface BurnoutSimulatorProps {
  data: RepoData;
}

export default function BurnoutSimulator({ data }: BurnoutSimulatorProps) {
  const { audienceMode } = useAppStore();
  const isPlain = audienceMode === 'plain';
  const [absenceMonths, setAbsenceMonths] = useState(3);

  const { velocity, busFactor, repo } = data;

  const monthlyPRs = Math.max(2, Math.round(velocity.prFrequency * 4 || 6));
  const monthlyIssues = Math.max(3, Math.round((repo.open_issues_count / 12) || 8));

  const accumulatedPRBacklog = Math.round(monthlyPRs * absenceMonths * (busFactor.topContributorPct / 100));
  const accumulatedIssues = Math.round(monthlyIssues * absenceMonths * 0.85);

  const initialHealth = Math.round((busFactor.busFactorScore / 10) * 100);
  const healthDrop = Math.min(85, Math.round(absenceMonths * (busFactor.topContributorPct / 10)));
  const projectedHealth = Math.max(10, initialHealth - healthDrop);

  const riskLabel =
    absenceMonths >= 6 || busFactor.riskLevel === 'critical'
      ? 'Severe Gridlock'
      : absenceMonths >= 3
      ? 'Moderate Stagnation'
      : 'Manageable Transition';

  return (
    <div className="glass-card p-8 relative overflow-hidden flex flex-col justify-between gap-6 h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3D4FE0] to-[#2A38B8] border border-[#0C1222]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(61,79,224,0.4)]">
            <Flame size={18} className="text-[#0C1222]" />
          </div>
          <div>
            <p className="type-kicker text-xs font-semibold tracking-wider text-[#5C6A80]/80">
              {isPlain ? 'ABSENCE & SUCCESSION SIMULATOR' : 'MAINTAINER BURNOUT SIMULATION'}
            </p>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#0C1222] mt-0.5">
              If the Lead Maintainer Departs Tomorrow
            </h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono glass-subcard text-[#0C1222] font-semibold">
          <span>{riskLabel}</span>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-3 p-5 sm:p-6 rounded-2xl glass-subcard">
        <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
          <span className="text-[#5C6A80]">Lead Maintainer Sabbatical / Absence:</span>
          <span className="font-black gradient-text text-sm sm:text-base">{absenceMonths} months</span>
        </div>
        <input
          type="range"
          min={1}
          max={12}
          value={absenceMonths}
          onChange={(e) => setAbsenceMonths(Number(e.target.value))}
          className="w-full h-2 rounded-full accent-[#0C1222] cursor-pointer bg-[#FFFFFF]"
        />
        <div className="flex justify-between text-xs font-mono text-[#5C6A80]/70">
          <span>1 Month</span>
          <span>6 Months</span>
          <span>12 Months</span>
        </div>
      </div>

      {/* Projected Impacts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl glass-subcard flex flex-col justify-between space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-[#5C6A80]">Unreviewed PRs</p>
          <p className="text-2xl sm:text-3xl font-mono font-black gradient-text">
            +{accumulatedPRBacklog}
          </p>
          <p className="text-xs text-[#5C6A80]/80 font-sans leading-normal">
            Bottlenecked in triage queue
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-subcard flex flex-col justify-between space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-[#5C6A80]">Unanswered Issues</p>
          <p className="text-2xl sm:text-3xl font-mono font-black text-[#5C6A80]">
            +{accumulatedIssues}
          </p>
          <p className="text-xs text-[#5C6A80]/80 font-sans leading-normal">
            Pending triage or patch
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-subcard flex flex-col justify-between space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-[#5C6A80]">Projected Health</p>
          <p className="text-2xl sm:text-3xl font-mono font-black gradient-text">
            {projectedHealth}%
          </p>
          <p className="text-xs text-[#5C6A80]/80 font-sans leading-normal">
            Decentralization index
          </p>
        </div>
      </div>
    </div>
  );
}
