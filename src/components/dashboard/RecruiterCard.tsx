'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Copy, Check, Award, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { RepoData } from '@/lib/github';

interface RecruiterCardProps {
  data: RepoData;
  embedded?: boolean;
}

export default function RecruiterCard({ data, embedded = false }: RecruiterCardProps) {
  const { audienceMode, setToast } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Standardize SSR default until the client component has cleanly mounted
  const isPlain = isMounted && audienceMode === 'plain';
  const [copied, setCopied] = useState(false);

  const { repo, velocity, health, churn, contributors, languages, releases } = data;

  const topLanguages = Object.keys(languages || {}).slice(0, 3).join(', ') || repo.language || 'TypeScript';

  const technicalBullets = [
    `Architected a full-stack ${topLanguages} application (${repo.name}), implementing static typing, modular state management, and automated CI test verification.`,
    `Scaled trunk shipping cadence to a Throughput Index of ${velocity.score}/100 (~${velocity.commitFrequency.toFixed(1)} commits/wk) across ${releases.length || 'multiple'} production releases.`,
    `Engineered repository governance with automated GitHub Actions workflows, SPDX licensing, and refactoring (+${churn.additions.toLocaleString()} lines processed with a ${churn.churnRatio.toFixed(2)}x churn ratio).`,
  ];

  const plainBullets = [
    `Single-handedly built and launched an analytics platform from scratch, managing all feature development, code quality, and cloud deployments.`,
    `Maintained an active shipping schedule with consistent weekly updates and high reliability for users and portfolio reviewers.`,
    `Established clear documentation, open-source licensing, and automated quality checks to ensure the project is production-ready for hiring managers.`,
  ];

  const activeBullets = isPlain ? plainBullets : technicalBullets;
  const fullText = activeBullets.map((b) => `• ${b}`).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setToast({
      message: 'Resume accomplishment bullets copied to clipboard!',
      type: 'success',
    });
    setTimeout(() => setCopied(false), 2200);
  };

  const containerClasses = embedded
    ? 'space-y-5 sm:space-y-6 w-full flex flex-col justify-between'
    : 'w-full bg-[#180d0d] border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between gap-6';

  return (
    <div className={containerClasses}>
      {/* Subheader */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-2 border-b border-[#A5A79B]/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center shrink-0">
            <Briefcase size={17} />
          </div>
          <div>
            <span suppressHydrationWarning className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#A5A79B]/80 block">
              {isPlain ? 'RESUME & PORTFOLIO BUILDER' : 'RECRUITER ACCOMPLISHMENT ARTIFACTS'}
            </span>
            <h3 suppressHydrationWarning className="font-sans text-base sm:text-lg font-bold text-[#E8D2B5] tracking-tight mt-0.5">
              {isPlain ? 'Portfolio-Ready Accomplishment Bullets' : 'Quantified Engineering Impact Bullets'}
            </h3>
          </div>
        </div>

        {/* Copy for Resume Button in #590907 */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-mono font-semibold bg-[#590907] hover:bg-[#77110f] border border-[#590907] text-[#E8D2B5] transition-all cursor-pointer shadow-md active:scale-95"
        >
          {copied ? <Check size={14} className="text-[#E8D2B5]" /> : <Copy size={14} className="text-[#E8D2B5]" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy for Resume'}</span>
        </button>
      </div>

      {/* Mode Callout Banner */}
      <div suppressHydrationWarning className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex items-center gap-2.5 text-xs font-sans text-[#A5A79B]">
        <Award size={15} className="text-[#E8D2B5] shrink-0" />
        <span>
          {isPlain
            ? 'Plain English Mode: Focuses on ownership, project impact, and leadership skills for recruiters and founders.'
            : 'Technical Mode: Focuses on architecture, frameworks, and deployment hygiene for engineering leaders.'}
        </span>
      </div>

      {/* 3 Quantified Bullet Points Cards */}
      <div suppressHydrationWarning className="space-y-3">
        {activeBullets.map((bullet, i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex items-start gap-3.5 hover:border-[#590907]/60 transition-all shadow-sm"
          >
            <span className="font-mono text-sm sm:text-base font-bold text-[#E8D2B5] shrink-0 w-6 mt-0.5">
              0{i + 1}
            </span>
            <p className="font-sans text-xs sm:text-sm text-[#E8D2B5] leading-relaxed">
              {bullet}
            </p>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div className="flex items-center justify-between text-xs font-sans text-[#A5A79B] pt-2 border-t border-[#A5A79B]/15">
        <span>Ready to paste directly into your resume, LinkedIn, or portfolio</span>
        <span className="text-[#E8D2B5] font-mono text-[11px]">3 bullets generated</span>
      </div>
    </div>
  );
}
