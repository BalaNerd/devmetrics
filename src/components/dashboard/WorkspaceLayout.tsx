'use client';

import { useState } from 'react';
import type { RepoData } from '@/lib/github';
import VelocityScore from '@/components/dashboard/VelocityScore';
import BusFactor from '@/components/dashboard/BusFactor';
import HealthChecklist from '@/components/dashboard/HealthChecklist';
import WorkbenchLayout, { type WorkbenchTabId } from '@/components/dashboard/WorkbenchLayout';

interface WorkspaceLayoutProps {
  data: RepoData;
}

export default function WorkspaceLayout({ data }: WorkspaceLayoutProps) {
  const [activeTab, setActiveTab] = useState<WorkbenchTabId>('directives');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* LEFT COLUMN: Vitals Deck (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
        <VelocityScore
          score={data.velocity.score}
          velocityScore={data.velocity.score}
          trendDirection={data.velocity.trendDirection}
          cadence={data.velocity.commitFrequency}
          commitFrequency={data.velocity.commitFrequency}
          daysSinceLastCommit={data.velocity.daysSinceLastCommit}
        />
        <BusFactor
          metrics={data.busFactor}
          busFactor={data.busFactor}
          contributorCount={data.contributors.length}
          contributors={data.contributors}
        />
        <HealthChecklist health={data.health} />
      </div>

      {/* RIGHT COLUMN: Interactive Telemetry Workbench (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6 w-full">
        <WorkbenchLayout
          data={data}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
}
