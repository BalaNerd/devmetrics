'use client';

import { useState, useRef, useEffect } from 'react';
import { Terminal, Activity, ShieldCheck, Cpu, Briefcase, Flame, Timer, ChevronLeft, ChevronRight } from 'lucide-react';
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
  { id: 'directives' as const, label: 'Directives & Fixes', shortLabel: 'Directives', icon: Terminal },
  { id: 'cadence' as const, label: '7×24 Activity Cadence', shortLabel: '7×24 Cadence', icon: Activity },
  { id: 'dependencies' as const, label: 'Dependency & Security Audit', shortLabel: 'Dependencies', icon: ShieldCheck },
  { id: 'recruiter' as const, label: 'Resume & Recruiter Brief', shortLabel: 'Resume Bullets', icon: Briefcase },
  { id: 'cost' as const, label: 'Cloud Cost Estimator', shortLabel: 'Cost Estimator', icon: Cpu },
  { id: 'turnaround' as const, label: 'Turnaround & PR Response', shortLabel: 'Turnaround SLA', icon: Timer },
  { id: 'burnout' as const, label: 'Burnout Simulator', shortLabel: 'Burnout Sim', icon: Flame },
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth',
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    if (scrollRef.current.scrollWidth > scrollRef.current.clientWidth) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        scrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  return (
    <div className="w-full bg-[#180d0d] border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl min-h-[640px] flex flex-col justify-start relative overflow-hidden gap-6">
      {/* Subtle Ambient Backlight Glow */}
      <div
        className="bg-[#590907]/20 blur-3xl rounded-full absolute -top-8 -right-8 w-40 h-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Segmented Tab Switcher with Desktop Multi-Row Wrap & Mobile Controls */}
      <div className="relative z-10 pb-3 border-b border-[#A5A79B]/15">
        <div className="relative flex items-center w-full">
          {/* Mobile Left Chevron */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="md:hidden absolute -left-2 z-20 w-8 h-8 rounded-full bg-[#180d0d] border border-[#590907] text-[#E8D2B5] shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#590907] transition-all"
              aria-label="Scroll tabs left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Tab container: Multi-row wrap on desktop (md:flex-wrap), smooth horizontal scroll on mobile */}
          <div
            ref={scrollRef}
            onWheel={handleWheel}
            className="flex md:flex-wrap items-center gap-2 overflow-x-auto md:overflow-visible no-scrollbar w-full p-1.5 bg-[#120909] rounded-2xl border border-[#A5A79B]/15"
          >
            {WORKBENCH_TABS.map((tab) => {
              const isTabActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 min-h-[38px] rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all duration-200 ease-out cursor-pointer shrink-0 active:scale-95
                    ${
                      isTabActive
                        ? 'bg-[#590907] text-[#E8D2B5] shadow-md shadow-[#590907]/30 border border-[#590907]'
                        : 'bg-[#120909]/60 border border-[#A5A79B]/15 text-[#A5A79B] hover:text-[#E8D2B5] hover:border-[#590907]/50'
                    }
                  `}
                >
                  <Icon size={14} className={isTabActive ? 'text-[#E8D2B5]' : 'text-[#A5A79B]'} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="inline sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Right Chevron */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="md:hidden absolute -right-2 z-20 w-8 h-8 rounded-full bg-[#180d0d] border border-[#590907] text-[#E8D2B5] shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#590907] transition-all"
              aria-label="Scroll tabs right"
            >
              <ChevronRight size={16} />
            </button>
          )}
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
