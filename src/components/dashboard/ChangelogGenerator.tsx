'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Download, ChevronDown, ChevronUp } from 'lucide-react';
import type { CommitEntry, Release } from '@/lib/github';
import { useAppStore } from '@/store/useAppStore';

interface ChangelogGeneratorProps {
  commits: CommitEntry[];
  releases: Release[];
  repoName: string;
}

export default function ChangelogGenerator({
  commits,
  releases,
  repoName,
}: ChangelogGeneratorProps) {
  const { audienceMode, setToast } = useAppStore();
  const isPlain = audienceMode === 'plain';
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'markdown'>('preview');
  const [isExpanded, setIsExpanded] = useState(false);

  // Categorize commits
  const features: string[] = [];
  const fixes: string[] = [];
  const performance: string[] = [];
  const chores: string[] = [];

  commits.forEach((c) => {
    const rawMsg = c.commit.message.split('\n')[0].trim();
    const lower = rawMsg.toLowerCase();

    if (/^(feat|feature|add)(\(.*\))?:/i.test(lower) || lower.startsWith('add ') || lower.includes('implement')) {
      features.push(rawMsg);
    } else if (/^(fix|bug|hotfix)(\(.*\))?:/i.test(lower) || lower.includes('resolve ') || lower.includes('patch')) {
      fixes.push(rawMsg);
    } else if (/^(perf|refactor|optimize)(\(.*\))?:/i.test(lower) || lower.includes('speed') || lower.includes('clean')) {
      performance.push(rawMsg);
    } else {
      chores.push(rawMsg);
    }
  });

  const latestTag = releases[0]?.tag_name || 'v1.0.0';
  const targetTag = latestTag.startsWith('v') ? `v${parseInt(latestTag.slice(1)) || 1}.1.0` : 'vNext';

  const generatedMarkdown = `# Release Notes - ${targetTag} (${new Date().toISOString().split('T')[0]})
Project: [${repoName}](https://github.com/${repoName})

${
  features.length > 0
    ? `### 🚀 Features & Enhancements\n${features.slice(0, 8).map((f) => `- ${f}`).join('\n')}\n\n`
    : ''
}${
  fixes.length > 0
    ? `### 🐛 Bug Fixes & Stability\n${fixes.slice(0, 8).map((f) => `- ${f}`).join('\n')}\n\n`
    : ''
}${
  performance.length > 0
    ? `### ⚡ Performance & Refactoring\n${performance.slice(0, 8).map((p) => `- ${p}`).join('\n')}\n\n`
    : ''
}Generated automatically by DevMetrics`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopied(true);
    setToast({
      message: 'Generated release notes copied to clipboard!',
      type: 'success',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CHANGELOG_${targetTag}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({
      message: `Downloaded CHANGELOG_${targetTag}.md`,
      type: 'success',
    });
  };

  return (
    <div className="glass-card p-6 sm:p-8 flex flex-col justify-between gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EEF1FF] border border-[#3D4FE0]/60 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-[#0C1222]" />
          </div>
          <div>
            <p className="type-kicker text-xs font-semibold tracking-wider text-[#5C6A80]/80">
              {isPlain ? 'AUTOMATED RELEASE SUMMARY' : 'SEMANTIC CHANGELOG SYNTHESIZER'}
            </p>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#0C1222] mt-0.5">
              Auto-Generated Release Notes ({targetTag})
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#F7F8FC] border border-[#5C6A80]/20 text-xs font-mono">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'preview'
                  ? 'bg-[#3D4FE0] text-white font-semibold shadow-sm'
                  : 'text-[#5C6A80] hover:text-[#0C1222]'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'markdown'
                  ? 'bg-[#3D4FE0] text-white font-semibold shadow-sm'
                  : 'text-[#5C6A80] hover:text-[#0C1222]'
              }`}
            >
              Markdown
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-[#3D4FE0] text-white hover:bg-[#2A38B8] transition-all shadow-sm"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-[#F7F8FC] border border-[#5C6A80]/25 text-[#5C6A80] hover:text-[#0C1222] transition-colors"
            title="Download .md"
          >
            <Download size={15} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-[#F7F8FC] border border-[#5C6A80]/25 text-[#5C6A80] hover:text-[#0C1222] transition-colors"
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Target version tag pill */}
      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-mono">
        <span className="badge badge-burgundy text-xs px-2.5 py-0.5">
          Target: {targetTag}
        </span>
        <span className="text-[#5C6A80]/40">·</span>
        <span className="text-[#5C6A80]">
          {features.length} features, {fixes.length} fixes, {performance.length} performance items
        </span>
      </div>

      {/* Content drawer */}
      <div>
        {viewMode === 'preview' ? (
          <div className="space-y-4">
            {features.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F8FC] border border-[#5C6A80]/20">
                <p className="text-xs sm:text-sm font-mono font-semibold text-[#0C1222] flex items-center gap-2 mb-3">
                  <span>🚀</span> Features & Enhancements ({features.length})
                </p>
                <ul className="space-y-2 text-xs sm:text-sm font-mono text-[#5C6A80]">
                  {(isExpanded ? features : features.slice(0, 3)).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-[#0C1222] font-bold">›</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {fixes.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F8FC] border border-[#5C6A80]/20">
                <p className="text-xs sm:text-sm font-mono font-semibold text-[#0C1222] flex items-center gap-2 mb-3">
                  <span>🐛</span> Bug Fixes & Stability ({fixes.length})
                </p>
                <ul className="space-y-2 text-xs sm:text-sm font-mono text-[#5C6A80]">
                  {(isExpanded ? fixes : fixes.slice(0, 3)).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-[#0C1222] font-bold">›</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isExpanded && (features.length > 3 || fixes.length > 3) && (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full py-2.5 text-center text-xs sm:text-sm font-mono text-[#0C1222] hover:underline border border-dashed border-[#5C6A80]/30 rounded-xl hover:bg-[#F7F8FC] transition-colors"
              >
                + Expand all {commits.length} categorized commit items
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <pre className="p-5 rounded-2xl bg-[#0F172A] border border-[#94A3B8]/20 font-mono text-xs sm:text-sm text-[#E8EEF9] overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap">
              {generatedMarkdown}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
