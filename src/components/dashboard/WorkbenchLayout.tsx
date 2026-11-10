'use client';

import { useState } from 'react';
import { Terminal, Clock, Package, DollarSign, Briefcase, Flame, Timer } from 'lucide-react';
import type { RepoData } from '@/lib/github';
import EngineeringDirectives from './EngineeringDirectives';
import PunchCard from './PunchCard';
import DependencyAuditor from './DependencyAuditor';
import CostEstimator from './CostEstimator';
import RecruiterCard from './RecruiterCard';
import ResponseTimeTracker from './ResponseTimeTracker';
import BusFactorSimulator from './BusFactorSimulator';

export type WorkbenchTabId =
  | 'directives'
  | 'cadence'
  | 'dependencies'
  | 'recruiter'
  | 'cost'
  | 'turnaround'
  | 'burnout';

export interface WorkbenchLayoutProps {
  data?: RepoData | null;
  activeTab?: WorkbenchTabId;
  setActiveTab?: (tab: WorkbenchTabId) => void;
  defaultTab?: WorkbenchTabId;
}

const WORKBENCH_TABS = [
  { id: 'directives' as const, label: '⚡ Directives & Fixes', shortLabel: 'Directives', icon: Terminal },
  { id: 'cadence' as const, label: '📅 7×24 Activity Cadence', shortLabel: '7×24 Cadence', icon: Clock },
  { id: 'dependencies' as const, label: '📦 Dependency & Security', shortLabel: 'Dependencies', icon: Package },
  { id: 'recruiter' as const, label: '💼 Resume & Recruiter Brief', shortLabel: 'Resume Bullets', icon: Briefcase },
  { id: 'cost' as const, label: '💵 Cloud Cost Estimator', shortLabel: 'Cost Estimator', icon: DollarSign },
  { id: 'turnaround' as const, label: '⏱️ Turnaround & PR Response', shortLabel: 'Turnaround SLA', icon: Timer },
  { id: 'burnout' as const, label: '🔥 Burnout Simulator', shortLabel: 'Burnout Sim', icon: Flame },
];

export default function WorkbenchLayout({
  data,
  activeTab: controlledTab,
  setActiveTab: setControlledTab,
  defaultTab = 'directives',
}: WorkbenchLayoutProps) {
  const [internalTab, setInternalTab] = useState<WorkbenchTabId>(defaultTab);

  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = setControlledTab ?? setInternalTab;

  return (
    <div className="w-full bg-[#180d0d] border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl min-h-[640px] flex flex-col justify-start relative overflow-hidden gap-6">
      {/* Subtle Ambient Backlight Glow */}
      <div
        className="bg-[#590907]/20 blur-3xl rounded-full absolute -top-8 -right-8 w-40 h-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Horizontally scrollable segmented tab switcher at the top */}
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#A5A79B]/15">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full p-1 bg-[#120909] rounded-xl border border-[#A5A79B]/15">
          {WORKBENCH_TABS.map((tab) => {
            const isTabActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-mono font-medium whitespace-nowrap transition-all duration-200 ease-out cursor-pointer shrink-0 active:scale-95
                  ${
                    isTabActive
                      ? 'bg-[#590907] text-[#E8D2B5] font-semibold shadow-md shadow-black/40 border border-[#590907]'
                      : 'text-[#A5A79B] hover:text-[#E8D2B5] hover:bg-[#180d0d]'
                  }
                `}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="inline sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content Area */}
      <div className="relative z-10 w-full flex-1 flex flex-col">
        {!data ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-8 h-8 border-2 border-[#590907] border-t-[#E8D2B5] rounded-full animate-spin" />
            <p className="text-xs font-mono uppercase tracking-wider text-[#A5A79B]">
              Loading Engineering Intelligence Telemetry...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'directives' && (
              <EngineeringDirectives data={data} embedded={true} />
            )}

            {activeTab === 'cadence' && (
              <PunchCard
                data={data.punchCard}
                commitActivity={data.commitActivity}
                commits={data.commits}
                embedded={true}
              />
            )}

            {activeTab === 'dependencies' && (
              <DependencyAuditor
                owner={data.repo?.owner?.login || ''}
                repo={data.repo?.name || ''}
                data={data}
                embedded={true}
              />
            )}

            {activeTab === 'recruiter' && (
              <RecruiterCard data={data} embedded={true} />
            )}

            {activeTab === 'cost' && (
              <CostEstimator data={data} embedded={true} />
            )}

            {activeTab === 'turnaround' && (
              <ResponseTimeTracker
                owner={data.repo?.owner?.login || ''}
                repo={data.repo?.name || ''}
                embedded={true}
              />
            )}

            {activeTab === 'burnout' && (
              <BusFactorSimulator
                data={data}
                embedded={true}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
