'use client';

import { Check, X, ShieldCheck, Sparkles } from 'lucide-react';
import type { HealthMetrics } from '@/lib/github';
import { calculateHealthGrade } from '@/lib/metrics';
import { useAppStore } from '@/store/useAppStore';

interface HealthChecklistProps {
  health?: HealthMetrics;
  checklist?: any;
  grade?: string;
}

interface CheckItem {
  id: string;
  label: string;
  sub: string;
  passed: boolean;
}

export default function HealthChecklist({ health, checklist, grade: customGrade }: HealthChecklistProps) {
  const { audienceMode } = useAppStore();
  const isPlain = audienceMode === 'plain';

  const defaultHealth: HealthMetrics = health || checklist || {
    hasReadme: true,
    readmeSize: 1200,
    hasLicense: true,
    licenseName: 'MIT',
    hasCICD: true,
    hasContributing: false,
    hasIssueTemplates: false,
    hasPRTemplate: false,
    hasSemanticTags: true,
    hasCodeOfConduct: false,
    hasChangelog: true,
    workflowCount: 1,
  };

  const calculated = calculateHealthGrade(defaultHealth);
  const grade = customGrade || calculated.grade;
  const score = calculated.score;
  const passing = calculated.passing;
  const total = calculated.total;

  const readinessNarrative =
    score >= 80
      ? 'Ready for hiring managers to review; contains clear documentation and testing setups.'
      : score >= 50
      ? 'Good foundation; adding automated tests and contributor guides will elevate production readiness.'
      : 'Needs Documentation: Missing README and automated tests essential for technical review.';

  const checks: CheckItem[] = [
    {
      id: 'readme',
      label: isPlain ? 'Project Documentation (README)' : 'README.md File',
      sub: defaultHealth.hasReadme
        ? isPlain
          ? 'Comprehensive project guide'
          : `${defaultHealth.readmeSize} bytes detected`
        : 'Missing documentation',
      passed: defaultHealth.hasReadme,
    },
    {
      id: 'license',
      label: isPlain ? 'Open Source License' : 'SPDX License Specification',
      sub: defaultHealth.licenseName
        ? defaultHealth.licenseName
        : defaultHealth.hasLicense
        ? 'Detected'
        : isPlain
        ? 'No license (all rights reserved)'
        : 'None (Default Copyright)',
      passed: defaultHealth.hasLicense,
    },
    {
      id: 'cicd',
      label: isPlain ? 'Automated Test Bot (CI)' : 'CI/CD Automated Pipelines',
      sub: defaultHealth.hasCICD
        ? isPlain
          ? 'Tests verify every pull request'
          : `${defaultHealth.workflowCount || 1} workflows in .github/workflows`
        : 'No automated tests',
      passed: defaultHealth.hasCICD,
    },
    {
      id: 'contributing',
      label: isPlain ? 'Contributor Guidelines' : 'CONTRIBUTING.md Specification',
      sub: defaultHealth.hasContributing ? 'Instructions present' : 'Missing onboarding guide',
      passed: defaultHealth.hasContributing,
    },
    {
      id: 'issue-templates',
      label: isPlain ? 'Bug Reporting Forms' : 'Issue Forms (.github/ISSUE_TEMPLATE)',
      sub: defaultHealth.hasIssueTemplates ? 'Structured forms active' : 'Unstructured reporting',
      passed: defaultHealth.hasIssueTemplates,
    },
    {
      id: 'pr-template',
      label: isPlain ? 'Code Review Checklist' : 'PR Template (PULL_REQUEST_TEMPLATE.md)',
      sub: defaultHealth.hasPRTemplate ? 'Review checklist configured' : 'Missing PR template',
      passed: defaultHealth.hasPRTemplate,
    },
    {
      id: 'semantic-tags',
      label: isPlain ? 'Version Release History' : 'SemVer Git Tags (vX.Y.Z)',
      sub: defaultHealth.hasSemanticTags ? 'Version tags active' : 'No formal version tags',
      passed: defaultHealth.hasSemanticTags,
    },
    {
      id: 'changelog',
      label: isPlain ? 'Release Notes & Updates' : 'CHANGELOG.md Documentation',
      sub: defaultHealth.hasChangelog ? 'Documented version log' : 'Missing changelog',
      passed: defaultHealth.hasChangelog,
    },
  ];

  return (
    <div className="w-full bg-[#180d0d]/85 backdrop-blur-xl border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl shadow-black/50 shadow-[inset_0_1px_0_rgba(232,210,181,0.08)] relative overflow-hidden flex flex-col justify-between gap-5">
      {/* Subtle Ambient Backlight Glow */}
      <div
        className="bg-[#590907]/20 blur-3xl rounded-full absolute -top-8 -right-8 w-40 h-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Header with Letter Grade Badge */}
      <div className="flex items-center justify-between flex-wrap gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center shrink-0">
            <ShieldCheck size={17} />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#A5A79B]/80 font-mono block">
              {isPlain ? 'PORTFOLIO READINESS' : 'GOVERNANCE & COMPLIANCE AUDIT'}
            </span>
            <h3 className="text-xl font-bold tracking-tight text-[#E8D2B5] font-sans mt-0.5">
              {isPlain ? 'Portfolio Readiness Score' : 'Hygiene & Governance'}
            </h3>
          </div>
        </div>

        {/* Letter Grade Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#590907]/30 border border-[#590907] shadow-sm">
          <span className="font-mono text-base sm:text-lg font-black text-[#E8D2B5]">
            GRADE {grade}
          </span>
          <span className="text-[11px] font-mono text-[#A5A79B]">
            ({score}%)
          </span>
        </div>
      </div>

      {/* Mode-Aware Callout Banner in Plain English */}
      {isPlain && (
        <div className="p-3.5 rounded-xl bg-[#120909] border border-[#590907]/50 flex items-start gap-2.5 relative z-10">
          <Sparkles size={16} className="text-[#E8D2B5] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-sans text-[#E8D2B5] leading-relaxed">
            {readinessNarrative}
          </p>
        </div>
      )}

      {/* Responsive Checklist: 1-col on Mobile (< 640px), 2-col on Tablet & Desktop (sm:) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 relative z-10">
        {checks.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-200 ease-out ${
              item.passed
                ? 'bg-[#120909] border-[#A5A79B]/20 text-[#E8D2B5]'
                : 'bg-[#120909]/50 border-[#A5A79B]/10 opacity-60 text-[#A5A79B]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
              {item.passed ? (
                <div className="w-5 h-5 rounded-md bg-[#590907]/50 border border-[#590907] flex items-center justify-center shrink-0">
                  <Check size={12} className="text-[#E8D2B5]" strokeWidth={2.5} />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-md bg-[#180d0d] border border-[#A5A79B]/20 flex items-center justify-center shrink-0">
                  <X size={11} className="text-[#A5A79B]/40" strokeWidth={2} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <span className={`text-xs font-semibold truncate block ${item.passed ? 'text-[#E8D2B5]' : 'text-[#A5A79B]/70'}`}>
                  {item.label}
                </span>
                <span className="text-[10px] font-mono text-[#A5A79B]/80 truncate block">
                  {item.sub}
                </span>
              </div>
            </div>

            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded shrink-0 ${
              item.passed
                ? 'bg-[#590907]/30 text-[#E8D2B5] border border-[#590907]'
                : 'bg-[#180d0d] text-[#A5A79B]/40 border border-[#A5A79B]/10'
            }`}>
              {item.passed ? 'PASSED' : 'MISSING'}
            </span>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-xs font-sans pt-2.5 border-t border-[#A5A79B]/15 text-[#A5A79B] relative z-10">
        <span>{isPlain ? 'Recruiter Verification' : 'Repository Audit Compliance'}</span>
        <span className="text-[#E8D2B5] font-bold font-mono">
          {passing} of {total} Standards Met
        </span>
      </div>
    </div>
  );
}
