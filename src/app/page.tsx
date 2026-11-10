"use client";

import React from "react";
import Header from "@/components/layout/Header";
import RepoHeader from "@/components/dashboard/RepoHeader";
import HumanReadableSummary from "@/components/dashboard/HumanReadableSummary";
import VelocityScore from "@/components/dashboard/VelocityScore";
import BusFactor from "@/components/dashboard/BusFactor";
import HealthChecklist from "@/components/dashboard/HealthChecklist";
import WorkbenchLayout from "@/components/dashboard/WorkbenchLayout";
import { useRepo } from "@/hooks/useRepo";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const { currentRepo } = useAppStore();
  const { data, loading } = useRepo(currentRepo || "vercel/next.js");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#120909] text-[#E8D2B5] flex items-center justify-center font-sans antialiased">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#590907] border-t-[#E8D2B5] rounded-full animate-spin" />
          <p className="text-xs sm:text-sm font-sans tracking-[0.18em] uppercase text-[#A5A79B] font-semibold">
            Loading repository telemetry...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#120909] text-[#E8D2B5] antialiased selection:bg-[#590907] selection:text-[#E8D2B5] overflow-x-hidden relative">
      {/* Ambient Backlight Radiance */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(89,9,7,0.32) 0%, rgba(89,9,7,0.06) 50%, transparent 75%)',
            filter: 'blur(120px)',
          }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[650px] h-[450px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(232,210,181,0.04) 0%, transparent 70%)',
            filter: 'blur(130px)',
          }}
        />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Fluid Responsive Canvas */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          
          {/* 1. Repository Meta Hero */}
          {data?.repo && <RepoHeader repo={data.repo} />}

          {/* 2. Plain-English Executive Dilemma Card */}
          {data && <HumanReadableSummary data={data} />}

          {/* 3. Responsive Master-Detail Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Vitals Pane: 100% width on Mobile/Tablet (< 1024px), 5 Cols on Desktop (lg:) */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full lg:sticky lg:top-24">
              <VelocityScore
                score={data?.velocityScore}
                velocityScore={data?.velocityScore}
                cadence={data?.cadence}
                commitFrequency={data?.cadence}
                daysSinceLastCommit={data?.velocity?.daysSinceLastCommit}
                trendDirection={data?.velocity?.trendDirection}
              />

              <BusFactor
                busFactor={data?.busFactor}
                metrics={data?.busFactor}
                contributors={data?.contributors}
                contributorCount={data?.contributors?.length}
              />

              <HealthChecklist
                checklist={data?.checklist}
                health={data?.health}
                grade={data?.healthGrade}
              />
            </div>

            {/* Right Detail Workbench: 100% width on Mobile/Tablet (< 1024px), 7 Cols on Desktop (lg:) */}
            <div className="lg:col-span-7 flex flex-col gap-6 w-full min-w-0">
              <WorkbenchLayout data={data} />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
