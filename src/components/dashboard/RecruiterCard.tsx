'use client';

import { useState } from 'react';
import { Briefcase, Copy, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { RepoData } from '@/lib/github';

interface RecruiterCardProps {
  data: RepoData;
}

export default function RecruiterCard({ data }: RecruiterCardProps) {
  const { audienceMode, setToast } = useAppStore();
  const isPlain = audienceMode === 'plain';
  const [copied, setCopied] = useState(false);

  const { repo, velocity, health, churn, contributors, languages, releases } = data;

  const topLanguages = Object.keys(languages).slice(0, 3).join(', ') || repo.language || 'TypeScript';
  const starsFormatted = repo.stargazers_count > 1000
    ? `${(repo.stargazers_count / 1000).toFixed(1)}k+`
    : `${repo.stargazers_count}`;
  const forksFormatted = repo.forks_count > 1000
    ? `${(repo.forks_count / 1000).toFixed(1)}k+`
    : `${repo.forks_count}`;

  const bullets = [
    `Architected and scaled ${repo.name} (${topLanguages}), sustaining a high-cadence velocity score of ${velocity.score}/100 with ~${velocity.commitFrequency.toFixed(1)} weekly commits across ${releases.length || 'multiple'} production releases.`,
    `Engineered automated repository hygiene and governance with CI/CD pipeline verification, semantic release standards, and ${health.hasReadme ? 'production-grade documentation' : 'structured codebase layout'}.`,
    `Fostered an open-source footprint of ${starsFormatted} stars and ${forksFormatted} forks across ${contributors.length}+ contributors, processing +${churn.additions.toLocaleString()} lines of additions with a balanced refactoring churn ratio of ${churn.churnRatio.toFixed(2)}.`,
  ];

  const fullText = bullets.map((b) => `• ${b}`).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setToast({
      message: 'Resume bullet points copied to clipboard!',
      type: 'success',
    });
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="glass-card p-8 sm:p-10 relative overflow-hidden">
      {/* Soft Accent Glow */}
      <div
        className="absolute top-0 right-0 w-[400px] h-[300px] pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(61, 79, 224, 0.2) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3D4FE0] to-[#2A38B8] border border-[#0C1222]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(61,79,224,0.4)]">
              <Briefcase size={18} className="text-[#0C1222]" />
            </div>
            <div>
              <p className="type-kicker text-xs">
                {isPlain ? 'CAREER & PORTFOLIO IMPACT' : 'EXECUTIVE RESUME ARTIFACTS'}
              </p>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#0C1222] mt-0.5">
                Quantified Impact for Resume & LinkedIn
              </h3>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-mono font-semibold bg-[#3D4FE0] text-white hover:bg-[#2A38B8] transition-all"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Resume Bullets'}</span>
          </button>
        </div>

        <div className="space-y-4">
          {bullets.map((b, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl glass-subcard flex items-start gap-4 transition-all hover:translate-x-1"
            >
              <span className="font-mono text-base font-black gradient-text shrink-0 mt-0.5">
                0{i + 1}
              </span>
              <p className="font-sans text-sm sm:text-base text-[#5C6A80] leading-relaxed">
                {b}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
