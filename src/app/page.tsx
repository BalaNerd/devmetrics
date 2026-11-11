"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import RepoHeader from "@/components/dashboard/RepoHeader";
import HumanReadableSummary from "@/components/dashboard/HumanReadableSummary";
import VelocityScore from "@/components/dashboard/VelocityScore";
import BusFactor from "@/components/dashboard/BusFactor";
import HealthChecklist from "@/components/dashboard/HealthChecklist";
import WorkbenchLayout from "@/components/dashboard/WorkbenchLayout";
import LiveUrlAudit from "@/components/dashboard/LiveUrlAudit";
import CommandCockpit from "@/components/dashboard/CommandCockpit";
import { useRepo } from "@/hooks/useRepo";
import { useAppStore } from "@/store/useAppStore";
import { Zap, AlertCircle, RefreshCw, Key } from "lucide-react";

export default function DashboardPage() {
  const {
    currentRepo,
    liveAuditData,
    liveAuditStatus,
    liveUrl,
    fetchStatus,
    errorMessage,
    setTokenModalOpen,
    reset,
    clearLiveAudit,
  } = useAppStore();

  const { data, loading, fetchRepo } = useRepo(currentRepo || undefined);

  const hasLiveAuditActive = Boolean(
    liveAuditData || liveAuditStatus === "loading" || liveAuditStatus === "error" || liveUrl
  );

  const hasActiveQuery = Boolean(currentRepo || hasLiveAuditActive);

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
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AnimatePresence mode="wait">
            {!hasActiveQuery ? (
              <motion.div
                key="command-cockpit"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <CommandCockpit />
              </motion.div>
            ) : (
              <motion.div
                key="workspace-dashboard"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Live URL Inspection View */}
                {hasLiveAuditActive && <LiveUrlAudit />}

                {/* Loading State for Repository Telemetry */}
                {loading && !hasLiveAuditActive && (
                  <div className="w-full min-h-[460px] flex flex-col items-center justify-center p-8 bg-[#180d0d]/80 border border-[#A5A79B]/15 rounded-2xl backdrop-blur-xl shadow-2xl">
                    <div className="relative flex items-center justify-center w-14 h-14 mb-4">
                      <div className="absolute inset-0 rounded-full border-2 border-[#590907] border-t-[#E8D2B5] animate-spin" />
                      <Zap size={22} className="text-[#E8D2B5] animate-pulse" />
                    </div>
                    <h3 className="font-sans font-bold text-lg text-[#E8D2B5]">
                      Ingesting Repository Telemetry
                    </h3>
                    <p className="font-mono text-xs text-[#A5A79B] mt-1 tracking-wider text-center max-w-md">
                      Resolving <span className="text-[#E8D2B5] font-semibold">{currentRepo}</span> · Commits, Contributors, Directives, CI/CD...
                    </p>
                  </div>
                )}

                {/* Error State for Repository Telemetry */}
                {!loading && fetchStatus === "error" && !hasLiveAuditActive && (
                  <div className="w-full bg-[#180d0d]/90 border border-[#590907] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center space-y-4 max-w-xl mx-auto my-12">
                    <div className="w-12 h-12 rounded-full bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center mx-auto">
                      <AlertCircle size={24} />
                    </div>
                    <h3 className="font-sans font-bold text-lg text-[#E8D2B5]">
                      Telemetry Retrieval Error
                    </h3>
                    <p className="font-mono text-xs text-[#A5A79B] leading-relaxed">
                      {errorMessage || "Unable to resolve repository telemetry from GitHub API."}
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => fetchRepo(currentRepo)}
                        className="px-4 py-2 rounded-xl bg-[#590907] hover:bg-[#77110f] text-[#E8D2B5] font-mono text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <RefreshCw size={13} />
                        <span>Retry</span>
                      </button>
                      <button
                        onClick={() => {
                          reset();
                          clearLiveAudit();
                        }}
                        className="px-4 py-2 rounded-xl bg-[#180d0d] border border-[#A5A79B]/20 hover:border-[#E8D2B5]/40 text-[#A5A79B] hover:text-[#E8D2B5] font-mono text-xs cursor-pointer transition-all"
                      >
                        Return to Cockpit
                      </button>
                    </div>
                  </div>
                )}

                {/* Rate Limited State */}
                {!loading && fetchStatus === "rate-limited" && !hasLiveAuditActive && (
                  <div className="w-full bg-[#180d0d]/90 border border-[#590907] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center space-y-4 max-w-xl mx-auto my-12">
                    <div className="w-12 h-12 rounded-full bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center mx-auto">
                      <Key size={24} />
                    </div>
                    <h3 className="font-sans font-bold text-lg text-[#E8D2B5]">
                      GitHub Rate Limit Exceeded
                    </h3>
                    <p className="font-mono text-xs text-[#A5A79B] leading-relaxed">
                      GitHub public API rate limit reached. Add a Personal Access Token to get 5,000 req/hr.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setTokenModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-[#590907] hover:bg-[#77110f] text-[#E8D2B5] font-mono text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Key size={13} />
                        <span>Add GitHub Token</span>
                      </button>
                      <button
                        onClick={() => {
                          reset();
                          clearLiveAudit();
                        }}
                        className="px-4 py-2 rounded-xl bg-[#180d0d] border border-[#A5A79B]/20 hover:border-[#E8D2B5]/40 text-[#A5A79B] hover:text-[#E8D2B5] font-mono text-xs cursor-pointer transition-all"
                      >
                        Return to Cockpit
                      </button>
                    </div>
                  </div>
                )}

                {/* 1. Repository Meta Hero */}
                {data?.repo && <RepoHeader repo={data.repo} />}

                {/* 2. Plain-English Executive Dilemma Card */}
                {data && <HumanReadableSummary data={data} />}

                {/* 3. Responsive Master-Detail Split Workspace */}
                {data && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left Vitals Pane: 100% width on Mobile/Tablet (< 1024px), 5 Cols on Desktop (lg:) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 w-full lg:sticky lg:top-24">
                      <VelocityScore
                        score={data.velocityScore}
                        velocityScore={data.velocityScore}
                        cadence={data.cadence}
                        commitFrequency={data.cadence}
                        daysSinceLastCommit={data.velocity?.daysSinceLastCommit}
                        trendDirection={data.velocity?.trendDirection}
                        commits={data.commits}
                        churn={data.churn}
                      />

                      <BusFactor
                        busFactor={data.busFactor}
                        metrics={data.busFactor}
                        contributors={data.contributors}
                        contributorCount={data.contributors?.length}
                      />

                      <HealthChecklist
                        checklist={data.checklist}
                        health={data.health}
                        grade={data.healthGrade}
                      />
                    </div>

                    {/* Right Detail Workbench: 100% width on Mobile/Tablet (< 1024px), 7 Cols on Desktop (lg:) */}
                    <div className="lg:col-span-7 flex flex-col gap-6 w-full min-w-0">
                      <WorkbenchLayout data={data} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
