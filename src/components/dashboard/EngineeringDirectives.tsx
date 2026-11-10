'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  ChevronDown,
  Copy,
  Check,
  FileCode2,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Bot,
  Scale,
  FileText,
  Sparkles,
} from 'lucide-react';
import type { RepoData } from '@/lib/github';
import { generateEngineeringDirectives, type Directive } from '@/lib/directives';
import { useAppStore } from '@/store/useAppStore';

interface EngineeringDirectivesProps {
  data?: RepoData | null;
  directives?: Directive[];
  embedded?: boolean;
}

export default function EngineeringDirectives({
  data,
  directives: propDirectives,
  embedded = false,
}: EngineeringDirectivesProps) {
  const directives = propDirectives || (data ? generateEngineeringDirectives(data) : []);
  const { audienceMode } = useAppStore();
  const isPlain = audienceMode === 'plain';
  const [openIds, setOpenIds] = useState<string[]>([directives[0]?.id || '']);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleDirective = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopy = (id: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const primaryBottleneck = (() => {
    if (!data) {
      const first = directives[0];
      return {
        title: first?.title || 'System Bottleneck Analysis',
        summary: first?.summary || 'Algorithmic telemetry audit identified key areas for remediation.',
      };
    }
    if (!data.health?.hasCICD) {
      return {
        title: 'Untested Codebase Risk',
        summary: 'Pull requests are merged without automated CI verification, elevating regression risks. Configure GitHub Actions workflows immediately.',
      };
    }
    if (data.busFactor && data.busFactor.topContributorPct >= 65) {
      return {
        title: 'Solo Maintainer Centralization',
        summary: `Over ${Math.round(data.busFactor.topContributorPct)}% of all codebase commits originate from a single contributor. Setting up CODEOWNERS will mitigate key-person risk.`,
      };
    }
    if (data.velocity && data.velocity.daysSinceLastCommit > 60) {
      return {
        title: 'Shipping Cadence Deceleration',
        summary: `No new commits or releases have been recorded in over ${data.velocity.daysSinceLastCommit} days. Revitalizing release automation will signal active momentum.`,
      };
    }
    if (!data.health?.hasLicense) {
      return {
        title: 'Missing Legal Governance',
        summary: 'This repository lacks an explicit open-source SPDX license, legally preventing organizations from safely using or contributing to it.',
      };
    }
    return {
      title: 'Maintainer Velocity Baseline',
      summary: 'Repository governance and automated pipelines are stable. Focus on scheduled dependency auditing and changelog generation.',
    };
  })();

  const renderSeverityTag = (severity: string) => {
    if (severity === 'CRITICAL ACTION') {
      return (
        <span className="bg-[#590907] text-[#E8D2B5] font-mono text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-md font-semibold border border-[#590907]">
          CRITICAL ACTION
        </span>
      );
    }
    if (severity === 'PRODUCTION HYGIENE') {
      return (
        <span className="bg-[#A5A79B]/20 text-[#E8D2B5] font-mono text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-md font-semibold border border-[#A5A79B]/30">
          PRODUCTION HYGIENE
        </span>
      );
    }
    return (
      <span className="bg-[#590907]/40 border border-[#590907] text-[#E8D2B5] font-mono text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-md font-semibold">
        {severity}
      </span>
    );
  };

  const containerClasses = embedded
    ? 'space-y-5 sm:space-y-6 w-full'
    : 'w-full bg-[#180d0d] border border-[#A5A79B]/15 rounded-2xl overflow-hidden shadow-2xl space-y-5 sm:space-y-6 p-4 sm:p-6';

  return (
    <div className={containerClasses}>
      {/* Subheader Rail */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#A5A79B]/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center shrink-0">
            <Terminal size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans text-base sm:text-lg font-bold text-[#E8D2B5] tracking-tight">
                {isPlain ? 'Executive Directives & Fixes' : 'Engineering Directives & Architecture Fixes'}
              </h3>
              <span className="bg-[#120909] border border-[#A5A79B]/20 text-[#E8D2B5] font-mono text-[11px] px-2.5 py-0.5 rounded-full">
                {directives.length} Prescriptions
              </span>
            </div>
            <p className="font-sans text-xs text-[#A5A79B] mt-0.5 hidden sm:block">
              {isPlain
                ? 'High-level improvement takeaways for recruiters, non-technical stakeholders, and founders'
                : 'Algorithmic telemetry audit, CI/CD gap detection & automated production prescriptions'}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#120909] border border-[#A5A79B]/20 text-[#E8D2B5]">
          <span className="w-2 h-2 rounded-full bg-[#E8D2B5] shadow-[0_0_8px_rgba(232,210,181,0.6)]" />
          <span>{isPlain ? 'Plain English Mode' : 'Automated CI/CD Ready'}</span>
        </div>
      </div>

      {/* PLAIN ENGLISH MODE: 3 Clean Improvement Cards + Simplified Directives */}
      {isPlain ? (
        <div className="space-y-5">
          {/* 3 Core Plain English Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between gap-3 shadow-md hover:border-[#590907]/60 transition-all">
              <div className="flex items-center gap-2.5 text-[#E8D2B5]">
                <div className="w-7 h-7 rounded-lg bg-[#590907]/40 border border-[#590907] flex items-center justify-center shrink-0">
                  <Bot size={15} />
                </div>
                <span className="text-xs font-sans font-bold uppercase tracking-wider">Automated Testing</span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#A5A79B] leading-relaxed">
                Add automated testing bots so broken features aren&apos;t released to users.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#A5A79B]/10 text-[11px] font-sans">
                <span className="text-[#A5A79B]">Status:</span>
                <span className={data?.health?.hasCICD ? 'text-[#E8D2B5] font-semibold' : 'text-[#590907] font-semibold'}>
                  {data?.health?.hasCICD ? 'Configured ✓' : 'Action Needed'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between gap-3 shadow-md hover:border-[#590907]/60 transition-all">
              <div className="flex items-center gap-2.5 text-[#E8D2B5]">
                <div className="w-7 h-7 rounded-lg bg-[#590907]/40 border border-[#590907] flex items-center justify-center shrink-0">
                  <Scale size={15} />
                </div>
                <span className="text-xs font-sans font-bold uppercase tracking-wider">Legal Clarity</span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#A5A79B] leading-relaxed">
                Add a license so others know how they can legally use this project.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#A5A79B]/10 text-[11px] font-sans">
                <span className="text-[#A5A79B]">Status:</span>
                <span className={data?.health?.hasLicense ? 'text-[#E8D2B5] font-semibold' : 'text-[#590907] font-semibold'}>
                  {data?.health?.hasLicense ? `${data.health.licenseName || 'Detected'} ✓` : 'Missing'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between gap-3 shadow-md hover:border-[#590907]/60 transition-all">
              <div className="flex items-center gap-2.5 text-[#E8D2B5]">
                <div className="w-7 h-7 rounded-lg bg-[#590907]/40 border border-[#590907] flex items-center justify-center shrink-0">
                  <FileText size={15} />
                </div>
                <span className="text-xs font-sans font-bold uppercase tracking-wider">Contribution Guide</span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#A5A79B] leading-relaxed">
                Document contribution steps so other developers can help build this.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#A5A79B]/10 text-[11px] font-sans">
                <span className="text-[#A5A79B]">Status:</span>
                <span className={data?.health?.hasContributing ? 'text-[#E8D2B5] font-semibold' : 'text-[#A5A79B]'}>
                  {data?.health?.hasContributing ? 'Present ✓' : 'Recommended'}
                </span>
              </div>
            </div>
          </div>

          {/* Plain English Directives Accordion (Zero Raw Code Blocks) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-sans text-xs uppercase tracking-wider font-semibold text-[#A5A79B]">
              Detailed Recommendations & Impact
            </h4>
            {directives.map((directive, index) => {
              const isOpen = openIds.includes(directive.id);

              return (
                <div
                  key={directive.id}
                  className="rounded-xl border border-[#A5A79B]/15 bg-[#120909] overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleDirective(directive.id)}
                    className="w-full text-left p-4 min-h-[44px] flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#E8D2B5] shrink-0 w-5">
                        0{index + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sans text-sm sm:text-base font-bold text-[#E8D2B5] truncate">
                            {directive.title}
                          </span>
                          {renderSeverityTag(directive.severity)}
                        </div>
                        <p className="font-sans text-xs text-[#A5A79B] truncate leading-relaxed">
                          {directive.plainExplanation || directive.summary}
                        </p>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[#A5A79B]">
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#A5A79B]/15">
                          <div className="p-3.5 rounded-xl bg-[#180d0d] border border-[#A5A79B]/15 space-y-1">
                            <span className="font-sans text-[11px] font-semibold tracking-wider uppercase text-[#E8D2B5] flex items-center gap-1.5">
                              <HelpCircle size={13} className="text-[#E8D2B5]" />
                              Why This Matters
                            </span>
                            <p className="font-sans text-xs sm:text-sm text-[#A5A79B] leading-relaxed">
                              {directive.plainExplanation || directive.summary}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-[#180d0d] border border-[#590907]/60 space-y-1">
                            <span className="font-sans text-[11px] font-semibold tracking-wider uppercase text-[#E8D2B5] flex items-center gap-1.5">
                              <ArrowRight size={13} className="text-[#E8D2B5]" />
                              Executive Recommendation
                            </span>
                            <p className="font-sans text-xs sm:text-sm text-[#E8D2B5] leading-relaxed">
                              {directive.prescription}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TECHNICAL MODE: Diagnostic Telemetry, Bottleneck Analysis & Copyable Code Drawers */
        <div className="space-y-4">
          {/* Primary Bottleneck Callout */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#120909] border border-[#590907]/60 flex items-start gap-3 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-[#590907]/30 border border-[#590907] flex items-center justify-center shrink-0 mt-0.5 text-[#E8D2B5]">
              <Sparkles size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8D2B5] block mb-0.5">
                PRIMARY ARCHITECTURE BOTTLENECK · {primaryBottleneck.title}
              </span>
              <p className="font-sans text-xs sm:text-sm text-[#A5A79B] leading-relaxed">
                {primaryBottleneck.summary}
              </p>
            </div>
          </div>

          {/* Technical Directives List with Code Snippet Drawers */}
          <div className="space-y-3">
            {directives.map((directive, index) => {
              const isOpen = openIds.includes(directive.id);
              const isCopied = copiedId === directive.id;

              return (
                <div
                  key={directive.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#120909] border-[#A5A79B]/25 shadow-md'
                      : 'bg-[#120909]/60 border-[#A5A79B]/15 hover:border-[#A5A79B]/30'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleDirective(directive.id)}
                    className="w-full text-left p-3.5 sm:p-4 min-h-[44px] flex items-center justify-between gap-3 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#E8D2B5] shrink-0 w-5">
                        0{index + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sans text-sm sm:text-base font-bold text-[#E8D2B5] truncate">
                            {directive.title}
                          </span>
                          {renderSeverityTag(directive.severity)}
                          <span className="text-[10px] sm:text-xs font-mono text-[#A5A79B] px-2 py-0.5 rounded-full bg-[#180d0d] border border-[#A5A79B]/15">
                            {directive.impactBadge}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-[#A5A79B] truncate leading-relaxed">
                          {directive.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block text-[11px] font-mono text-[#A5A79B] px-2.5 py-0.5 rounded-full bg-[#180d0d] border border-[#A5A79B]/15">
                        {directive.category}
                      </span>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[#A5A79B]">
                        <ChevronDown size={16} />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-3.5 sm:px-4 pb-4 pt-1 space-y-3.5 border-t border-[#A5A79B]/15">
                          {/* Diagnostic & Prescription Flex Stack */}
                          <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <div className="flex-1 p-3.5 rounded-xl bg-[#180d0d] border border-[#A5A79B]/15 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-sans text-[#A5A79B] font-semibold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#A5A79B]" />
                                Diagnostic Telemetry
                              </div>
                              <p className="font-sans text-xs text-[#A5A79B] leading-relaxed">
                                {directive.diagnosis}
                              </p>
                            </div>

                            <div className="flex-1 p-3.5 rounded-xl bg-[#180d0d] border border-[#590907]/60 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-sans text-[#E8D2B5] font-semibold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#E8D2B5] shadow-[0_0_6px_rgba(232,210,181,0.6)]" />
                                Prescription
                              </div>
                              <p className="font-sans text-xs text-[#E8D2B5] leading-relaxed">
                                {directive.prescription}
                              </p>
                            </div>
                          </div>

                          {/* Terminal Code Drawer with Copy Button in #590907 */}
                          {directive.snippet && (
                            <div className="rounded-xl border border-[#A5A79B]/15 bg-[#0a0505] overflow-hidden shadow-xl">
                              <div className="px-3.5 py-2.5 border-b border-[#A5A79B]/15 bg-[#120909] flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileCode2 size={13} className="text-[#E8D2B5] shrink-0" />
                                  <span className="font-mono text-[11px] font-semibold text-[#E8D2B5] truncate">
                                    {directive.actionFile || 'Directive Configuration'}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleCopy(directive.id, directive.snippet)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-mono font-semibold bg-[#590907] hover:bg-[#77110f] text-[#E8D2B5] border border-[#590907] transition-all duration-200 ease-out cursor-pointer shadow-sm shrink-0 active:scale-95"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check size={12} className="text-[#E8D2B5]" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={12} className="text-[#E8D2B5]" />
                                      <span>Copy Snippet</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <pre className="p-4 font-mono text-xs text-[#E8D2B5] leading-relaxed overflow-x-auto selection:bg-[#590907]">
                                <code>{directive.snippet}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
