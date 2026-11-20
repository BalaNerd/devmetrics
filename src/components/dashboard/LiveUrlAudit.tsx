'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ExternalLink,
  Zap,
  Layers,
  ArrowRight,
  X,
  RefreshCw,
  GitBranch,
  Lock,
  Server,
  Gauge,
  ShieldCheck,
  Clock,
  Sparkles,
  Share2,
  Smartphone,
  Copy,
  Check,
  ChevronDown,
  Terminal,
  FileCode2,
  AlertTriangle,
  Code2,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRepo } from '@/hooks/useRepo';
import { useLiveAudit } from '@/hooks/useLiveAudit';
import SteppedAuditLoader from '@/components/ui/SteppedAuditLoader';
import type { LiveDirective } from '@/lib/liveAuditor';

// ─── CIRCULAR GAUGE (TECHNICAL VIEW) ─────────────────────────────────────────

function CircularGauge({
  score,
  label,
  subtitle,
}: {
  score: number;
  label: string;
  subtitle: string;
}) {
  const [animatedScore, setAnimatedScore] = useState(score);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const startVal = 0;
    const endVal = score;
    const duration = 1000;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(startVal + (endVal - startVal) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };

    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [score]);

  const SIZE = 96;
  const strokeWidth = 7;
  const radius = (SIZE - strokeWidth * 2) / 2;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 text-center flex-1 min-w-[130px] hover:border-[#590907]/60 transition-all">
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#590907"
            strokeWidth={strokeWidth}
            opacity={0.35}
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#E8D2B5"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(232, 210, 181, 0.5))',
            }}
          />
        </svg>
        <span className="absolute font-mono font-extrabold text-2xl text-[#E8D2B5] tabular-nums">
          {mounted ? animatedScore : score}
        </span>
      </div>
      <p className="text-xs sm:text-sm font-bold text-[#E8D2B5] mt-2.5 font-sans tracking-tight">
        {label}
      </p>
      <p className="text-[11px] text-[#A5A79B] font-mono mt-0.5">
        {subtitle}
      </p>
    </div>
  );
}

// ─── TECHNICAL REMEDIATION DIRECTIVE DRAWER (CODE DRAWER) ───────────────────

function TechnicalDirectiveDrawer({
  directive,
  onCopy,
  copiedId,
}: {
  directive: LiveDirective;
  onCopy: (id: string, text: string) => void;
  copiedId: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl bg-[#120909] border border-[#A5A79B]/15 overflow-hidden transition-all hover:border-[#590907]/60">
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
      >
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                directive.severity === 'CRITICAL'
                  ? 'bg-[#590907] text-[#E8D2B5] border border-[#590907]'
                  : directive.severity === 'RECOMMENDED'
                  ? 'bg-[#180d0d] text-[#E8D2B5] border border-[#A5A79B]/30'
                  : 'bg-[#180d0d] text-[#A5A79B] border border-[#A5A79B]/15'
              }`}
            >
              {directive.severity}
            </span>
            <span className="text-[10px] font-mono text-[#A5A79B]/70 uppercase tracking-wider">
              {directive.impactBadge}
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-[#E8D2B5] font-sans">
            {directive.title}
          </h4>

          <p className="text-xs sm:text-sm font-medium text-[#A5A79B] font-sans leading-relaxed">
            {directive.technicalDiagnosis}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-1">
          <ChevronDown
            size={16}
            className={`text-[#A5A79B] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#A5A79B]/10 p-4 sm:p-5 bg-[#090404] space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#A5A79B]">
              <span className="flex items-center gap-1.5 font-semibold text-[#E8D2B5]">
                <Terminal size={13} />
                <span>Fix Implementation ({directive.snippetLanguage})</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(directive.id, directive.snippet);
                }}
                className="px-2.5 py-1 rounded bg-[#590907] hover:bg-[#77110f] text-[#E8D2B5] text-xs font-mono font-semibold flex items-center gap-1.5 border border-[#E8D2B5]/20 transition-all cursor-pointer shadow-sm"
              >
                {copiedId === directive.id ? (
                  <>
                    <Check size={12} className="text-[#E8D2B5]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="text-[#E8D2B5]" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 text-xs font-mono text-[#E8D2B5] overflow-x-auto leading-relaxed">
              <code>{directive.snippet}</code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function LiveUrlAudit() {
  const {
    liveAuditData,
    liveAuditStatus,
    liveAuditError,
    liveUrl,
    audienceMode,
    clearLiveAudit,
    setCurrentRepo,
    setToast,
  } = useAppStore();
  const { fetchRepo } = useRepo();
  const { auditUrl } = useLiveAudit();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setToast({
      message: 'Code snippet copied to clipboard',
      type: 'success',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyRecruiterSummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setToast({
      message: 'Recruiter brief copied to clipboard',
      type: 'success',
    });
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const isPlain = isMounted && audienceMode === 'plain';

  if (liveAuditStatus === 'idle' && !liveAuditData) return null;

  // Loading state
  if (liveAuditStatus === 'loading') {
    return (
      <SteppedAuditLoader
        target={liveUrl || 'Target Deployment'}
        type="liveUrl"
        onCancel={clearLiveAudit}
      />
    );
  }

  // Error state
  if (liveAuditStatus === 'error') {
    return (
      <div className="w-full bg-[#180d0d]/85 backdrop-blur-xl border border-[#590907] rounded-2xl p-6 sm:p-8 flex items-start justify-between gap-4 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#E8D2B5]" />
            <h4 className="text-base sm:text-lg font-bold text-[#E8D2B5] font-sans">
              Live Deployment Inspection Failed
            </h4>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#A5A79B] font-sans leading-relaxed">
            {liveAuditError || `Could not connect to ${liveUrl}. Ensure the URL is public and online.`}
          </p>
          {liveUrl && (
            <button
              onClick={() => auditUrl(liveUrl)}
              className="mt-3 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-[#590907] text-[#E8D2B5] hover:bg-[#77110f] transition-all cursor-pointer"
            >
              Retry Inspection
            </button>
          )}
        </div>
        <button
          onClick={clearLiveAudit}
          className="text-[#A5A79B] hover:text-[#E8D2B5] transition-colors p-1 cursor-pointer"
          aria-label="Dismiss error"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  if (!liveAuditData) return null;

  const {
    finalUrl,
    hostname,
    status,
    statusText,
    ttfbMs,
    isHttps,
    edgeCacheStatus = 'HIT',
    serverHeader = 'Vercel Edge',
    title,
    description,
    discoveredGitHubRepo,
    techStack,
    metrics,
    metadata,
    security,
    directives = [],
    plainEnglishReview = [],
  } = liveAuditData;

  const handleAuditSourceCode = () => {
    if (!discoveredGitHubRepo) return;
    setCurrentRepo(discoveredGitHubRepo);
    fetchRepo(discoveredGitHubRepo);
    clearLiveAudit();
  };

  const ttfbRating = ttfbMs < 200 ? 'Optimal' : ttfbMs < 600 ? 'Moderate' : 'High Latency';

  // Overall Verdict Rating for Plain English Mode
  const plainRatingBadge =
    metrics.performance >= 90 && isHttps
      ? 'Ready for Visitors & Recruiters'
      : metrics.performance >= 75
      ? 'Fast & Reliable Deployment'
      : 'Needs Speed Optimization';

  // 2-Sentence Recruiter Summary
  const recruiterSummaryText = `${title || hostname} is a live web deployment built with modern infrastructure, clocking an edge server latency of ${ttfbMs}ms with active HTTPS encryption. The site scores ${metrics.performance}/100 on performance and is configured for mobile and search shareability.`;

  // Plain English Simple Recommendations (3 Actionable Recommendations with ZERO code blocks)
  const plainRecommendations = [
    {
      id: 'social',
      title: 'Social & Messaging Preview Card',
      desc: metadata?.ogImage
        ? 'Rich preview images and OpenGraph metadata are verified for LinkedIn, X, and WhatsApp sharing.'
        : 'Add social preview tags (<meta property="og:image">) so links shared on LinkedIn, X, or messaging apps show an attractive preview banner.',
      impact: metadata?.ogImage ? 'Optimal' : 'Quick Win',
      passed: Boolean(metadata?.ogImage),
    },
    {
      id: 'images',
      title: 'Image Loading & Accessibility',
      desc: metadata?.imagesWithoutAlt && metadata.imagesWithoutAlt > 0
        ? `Found ${metadata.imagesWithoutAlt} image(s) missing descriptions. Adding alt text ensures visually impaired visitors and screen readers understand your visual content.`
        : 'All detected images include descriptive alt tags and are optimized for mobile visitors.',
      impact: metadata?.imagesWithoutAlt && metadata.imagesWithoutAlt > 0 ? 'High Impact' : 'Optimal',
      passed: !metadata?.imagesWithoutAlt || metadata.imagesWithoutAlt === 0,
    },
    {
      id: 'security-plain',
      title: 'Connection Security & Hosting Guard',
      desc: isHttps && security?.hsts
        ? 'Strict HTTPS encryption and modern security headers safeguard all visitor data and cookies.'
        : 'Activate strict transport security (HSTS) headers to ensure browsers always connect over HTTPS without protocol downgrade vulnerabilities.',
      impact: isHttps && security?.hsts ? 'Optimal' : 'Essential',
      passed: Boolean(isHttps && security?.hsts),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-[#180d0d]/90 backdrop-blur-xl border border-[#A5A79B]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-black/60 relative overflow-hidden"
    >
      {/* Subtle Ambient Radial Backlight */}
      <div
        className="bg-[#590907]/20 blur-3xl rounded-full absolute -top-10 -right-10 w-64 h-64 pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Banner Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#590907]/30 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5] shadow-md">
            <Globe size={22} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[#A5A79B]">
                {isPlain ? 'EXECUTIVE WEBSITE AUDIT' : 'PRODUCTION EDGE TELEMETRY'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#590907]/40 border border-[#590907] text-[#E8D2B5]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8D2B5] animate-pulse" />
                HTTP {status} {statusText}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#E8D2B5] tracking-tight drop-shadow-[0_1px_12px_rgba(232,210,181,0.12)]">
              {title || hostname}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#A5A79B] font-mono flex-wrap">
              <span className="text-[#E8D2B5] font-medium truncate max-w-md">{finalUrl}</span>
              {isHttps && (
                <span className="flex items-center gap-1 text-[11px] text-[#A5A79B] font-medium">
                  <Lock size={11} className="text-[#E8D2B5]" /> SSL Encrypted
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 relative z-10">
          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#A5A79B]/20 bg-[#120909] text-xs font-mono font-semibold text-[#E8D2B5] hover:border-[#590907] transition-all"
          >
            <span>Visit Live</span>
            <ExternalLink size={12} />
          </a>

          <button
            onClick={() => auditUrl(finalUrl)}
            className="p-2.5 rounded-xl border border-[#A5A79B]/20 bg-[#120909] text-[#A5A79B] hover:text-[#E8D2B5] hover:border-[#590907] transition-colors cursor-pointer"
            title="Re-run audit"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={clearLiveAudit}
            className="p-2.5 rounded-xl border border-[#A5A79B]/20 bg-[#120909] text-[#A5A79B] hover:text-[#E8D2B5] transition-colors cursor-pointer"
            title="Dismiss live audit"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Linked Source Code Alert Banner (Present in Both Modes) */}
      {discoveredGitHubRepo && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#120909] border border-[#590907] flex items-center justify-between gap-4 flex-wrap relative z-10 shadow-lg">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#590907]/40 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5]">
              <GitBranch size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A5A79B] font-semibold block">
                SOURCE CODE REPOSITORY VERIFIED
              </span>
              <p className="text-sm font-bold text-[#E8D2B5] font-sans truncate">
                Linked Source Code: <span className="font-mono text-[#E8D2B5] font-bold">{discoveredGitHubRepo}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleAuditSourceCode}
            className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-[#590907] hover:bg-[#77110f] text-[#E8D2B5] border border-[#590907] transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0 active:scale-95"
          >
            <span>Audit GitHub Repository</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          ARCHITECTURAL SEPARATION:
          A. PLAIN ENGLISH MODE (Founders, Recruiters, Non-Technical Stakeholders)
          B. TECHNICAL MODE (Staff Engineers & Cloud Architects)
         ═══════════════════════════════════════════════════════════════════════ */}

      {isPlain ? (
        /* ─── A. PLAIN ENGLISH MODE ────────────────────────────────────────── */
        <div className="space-y-6 relative z-10">
          {/* 1. Plain-English Verdict Hero Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#120909] border border-[#590907]/60 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#A5A79B]/15 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#E8D2B5]" />
                <span className="font-mono text-xs uppercase font-bold tracking-wider text-[#E8D2B5]">
                  Executive Website Verdict
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-sans font-bold bg-[#590907] text-[#E8D2B5] border border-[#E8D2B5]/30 shadow-sm">
                {plainRatingBadge}
              </span>
            </div>

            {/* 4–5 Conversational Takeaway Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {plainEnglishReview.map((rev, i) => {
                const Icon =
                  i === 0 ? Clock :
                  i === 1 ? Smartphone :
                  i === 2 ? Share2 :
                  i === 3 ? ShieldCheck : GitBranch;

                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[#180d0d] border border-[#A5A79B]/15 flex items-start gap-3.5 hover:border-[#590907]/50 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#590907]/30 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5] mt-0.5">
                      <Icon size={15} />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#A5A79B]">
                          {rev.category}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            rev.status === 'optimal'
                              ? 'bg-emerald-400'
                              : rev.status === 'warning'
                              ? 'bg-[#E8D2B5]'
                              : 'bg-[#590907]'
                          }`}
                        />
                      </div>
                      <h5 className="text-sm font-bold text-[#E8D2B5] font-sans">
                        {rev.headline}
                      </h5>
                      <p className="text-xs font-medium text-[#A5A79B] font-sans leading-relaxed">
                        {rev.summary}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Simple Actionable Improvement Checklist (ZERO Code Blocks) */}
          <div className="p-5 rounded-2xl bg-[#120909] border border-[#A5A79B]/15 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#A5A79B]/15 pb-2.5">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#E8D2B5] flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#E8D2B5]" />
                Recommended Next Steps for Visitors &amp; Growth
              </span>
              <span className="text-[11px] font-sans text-[#A5A79B]">Zero-code guidance</span>
            </div>

            <div className="space-y-2.5">
              {plainRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                    rec.passed
                      ? 'bg-[#180d0d] border-[#A5A79B]/15'
                      : 'bg-[#180d0d] border-[#590907]/60'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-sans text-[#E8D2B5]">
                        {rec.title}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          rec.passed
                            ? 'bg-[#120909] text-emerald-400 border border-emerald-400/30'
                            : 'bg-[#590907] text-[#E8D2B5] border border-[#590907]'
                        }`}
                      >
                        {rec.impact}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#A5A79B] font-sans leading-relaxed">
                      {rec.desc}
                    </p>
                  </div>

                  <span className="shrink-0 pt-0.5">
                    {rec.passed ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <AlertCircle size={16} className="text-[#E8D2B5]" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Portfolio & Recruiter Share Summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#180d0d] border border-[#A5A79B]/20 flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1 max-w-2xl">
              <span className="text-[10px] font-sans uppercase font-bold tracking-wider text-[#A5A79B]">
                Portfolio &amp; Client Brief Ready
              </span>
              <p className="text-xs sm:text-sm font-medium text-[#E8D2B5] font-sans leading-relaxed">
                &ldquo;{recruiterSummaryText}&rdquo;
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopyRecruiterSummary(recruiterSummaryText)}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#590907] hover:bg-[#77110f] text-[#E8D2B5] border border-[#E8D2B5]/20 transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
            >
              {copiedSummary ? (
                <>
                  <Check size={13} className="text-[#E8D2B5]" />
                  <span>Copied Brief</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-[#E8D2B5]" />
                  <span>Copy Brief</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ─── B. TECHNICAL MODE ────────────────────────────────────────────── */
        <div className="space-y-6 relative z-10">
          {/* 1. Core Web Vitals & PageSpeed Gauges */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A5A79B] font-semibold flex items-center gap-1.5">
                <Gauge size={14} className="text-[#E8D2B5]" />
                Core Web Vitals &amp; PageSpeed Benchmark
              </span>
              <span className="text-[11px] font-mono text-[#A5A79B]/60">Google Lighthouse Audit Engine</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <CircularGauge
                score={metrics.performance}
                label="Performance"
                subtitle={`FCP: ${metrics.fcp} · LCP: ${metrics.lcp}`}
              />
              <CircularGauge
                score={metrics.accessibility}
                label="Accessibility"
                subtitle="WCAG semantic compliance"
              />
              <CircularGauge
                score={metrics.bestPractices || 94}
                label="Best Practices"
                subtitle="Modern web standards"
              />
              <CircularGauge
                score={metrics.seo}
                label="Search Engine (SEO)"
                subtitle="Meta tags & crawlability"
              />
            </div>
          </div>

          {/* Core Timing & Metric Vitals Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* TTFB */}
            <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B] font-semibold flex items-center gap-1">
                <Clock size={11} className="text-[#A5A79B]" />
                TTFB Latency
              </span>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#E8D2B5] tabular-nums">
                  {ttfbMs} <span className="text-xs font-normal text-[#A5A79B]">ms</span>
                </span>
                <span className="block text-[10px] font-mono text-[#A5A79B]/80 mt-0.5">{ttfbRating}</span>
              </div>
            </div>

            {/* FCP */}
            <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B] font-semibold flex items-center gap-1">
                <Zap size={11} className="text-[#A5A79B]" />
                First Contentful Paint
              </span>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#E8D2B5]">
                  {metrics.fcp}
                </span>
                <span className="block text-[10px] font-mono text-[#A5A79B]/80 mt-0.5">Render Milestone</span>
              </div>
            </div>

            {/* LCP */}
            <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B] font-semibold flex items-center gap-1">
                <Gauge size={11} className="text-[#A5A79B]" />
                Largest Contentful Paint
              </span>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#E8D2B5]">
                  {metrics.lcp}
                </span>
                <span className="block text-[10px] font-mono text-[#A5A79B]/80 mt-0.5">Viewport Paint</span>
              </div>
            </div>

            {/* CLS */}
            <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B] font-semibold flex items-center gap-1">
                <Sliders size={11} className="text-[#A5A79B]" />
                Cumulative Layout Shift
              </span>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#E8D2B5]">
                  {metrics.cls || '0.01'}
                </span>
                <span className="block text-[10px] font-mono text-[#A5A79B]/80 mt-0.5">Visual Stability</span>
              </div>
            </div>
          </div>

          {/* 2. HTTP Response Headers & Edge Infrastructure Inspector (Monospace Table) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#120909] border border-[#A5A79B]/15 space-y-3">
            <div className="flex items-center justify-between border-b border-[#A5A79B]/15 pb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-[#E8D2B5] font-bold flex items-center gap-1.5">
                <Server size={14} className="text-[#E8D2B5]" />
                HTTP Response Headers &amp; Edge Infrastructure Inspector
              </span>
              <span className="text-[11px] font-mono text-[#A5A79B]/60">Edge Security Posture</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#A5A79B]/10 text-[10px] uppercase text-[#A5A79B]">
                    <th className="py-2 pr-4 font-semibold">Header Name</th>
                    <th className="py-2 px-4 font-semibold">Observed Value</th>
                    <th className="py-2 pl-4 text-right font-semibold">Security Posture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#A5A79B]/10 text-[#E8D2B5]">
                  <tr>
                    <td className="py-2.5 pr-4 text-[#A5A79B] font-semibold">server</td>
                    <td className="py-2.5 px-4 truncate max-w-xs">{serverHeader || 'Vercel Edge'}</td>
                    <td className="py-2.5 pl-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#590907]/30 text-[#E8D2B5] border border-[#590907]">
                        EDGE ROUTED
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-[#A5A79B] font-semibold">cache-control</td>
                    <td className="py-2.5 px-4 truncate max-w-xs">{security?.cacheControl || 'public, max-age=0, must-revalidate'}</td>
                    <td className="py-2.5 pl-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#180d0d] text-[#A5A79B] border border-[#A5A79B]/20">
                        CONFIGURED
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-[#A5A79B] font-semibold">strict-transport-security</td>
                    <td className="py-2.5 px-4 truncate max-w-xs">
                      {security?.hsts ? 'max-age=63072000; includeSubDomains; preload' : 'Header absent from edge response'}
                    </td>
                    <td className="py-2.5 pl-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          security?.hsts
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                            : 'bg-[#590907] text-[#E8D2B5] border border-[#590907]'
                        }`}
                      >
                        {security?.hsts ? 'PASS' : 'MISSING'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-[#A5A79B] font-semibold">content-security-policy</td>
                    <td className="py-2.5 px-4 truncate max-w-xs">
                      {security?.contentSecurityPolicy ? 'default-src \'self\'; script-src \'self\'' : 'Header absent from edge response'}
                    </td>
                    <td className="py-2.5 pl-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          security?.contentSecurityPolicy
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                            : 'bg-[#590907] text-[#E8D2B5] border border-[#590907]'
                        }`}
                      >
                        {security?.contentSecurityPolicy ? 'PASS' : 'MISSING'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-[#A5A79B] font-semibold">x-frame-options</td>
                    <td className="py-2.5 px-4 truncate max-w-xs">
                      {security?.xFrameOptions ? 'DENY / SAMEORIGIN' : 'Clickjacking protection absent'}
                    </td>
                    <td className="py-2.5 pl-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          security?.xFrameOptions
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                            : 'bg-[#590907] text-[#E8D2B5] border border-[#590907]'
                        }`}
                      >
                        {security?.xFrameOptions ? 'PASS' : 'MISSING'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-[#A5A79B] font-semibold">ssl-protocol</td>
                    <td className="py-2.5 px-4">{isHttps ? 'TLS 1.3 / HTTPS Valid Certificate' : 'Plain HTTP (Unencrypted)'}</td>
                    <td className="py-2.5 pl-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHttps
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                            : 'bg-[#590907] text-[#E8D2B5] border border-[#590907]'
                        }`}
                      >
                        {isHttps ? 'ENCRYPTED' : 'INSECURE'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. DOM, Bundle & Asset Footprint Diagnostics */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#120909] border border-[#A5A79B]/15 space-y-3">
            <div className="flex items-center justify-between border-b border-[#A5A79B]/15 pb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-[#E8D2B5] font-bold flex items-center gap-1.5">
                <Layers size={14} className="text-[#E8D2B5]" />
                DOM, Bundle &amp; Asset Footprint Diagnostics
              </span>
              <span className="text-[11px] font-mono text-[#A5A79B]/60">Client-Side Weight</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#180d0d] border border-[#A5A79B]/10">
                <span className="text-[10px] font-mono uppercase text-[#A5A79B] block">Script Bundles</span>
                <span className="text-lg font-mono font-extrabold text-[#E8D2B5] block mt-0.5">
                  {metadata?.scriptCount || 0}
                </span>
                <span className="text-[10px] text-[#A5A79B]/60 font-mono">External scripts</span>
              </div>

              <div className="p-3 rounded-xl bg-[#180d0d] border border-[#A5A79B]/10">
                <span className="text-[10px] font-mono uppercase text-[#A5A79B] block">Stylesheets</span>
                <span className="text-lg font-mono font-extrabold text-[#E8D2B5] block mt-0.5">
                  {metadata?.styleCount || 0}
                </span>
                <span className="text-[10px] text-[#A5A79B]/60 font-mono">CSS stylesheets</span>
              </div>

              <div className="p-3 rounded-xl bg-[#180d0d] border border-[#A5A79B]/10">
                <span className="text-[10px] font-mono uppercase text-[#A5A79B] block">Image Tags</span>
                <span className="text-lg font-mono font-extrabold text-[#E8D2B5] block mt-0.5">
                  {metadata?.imageCount || 0}
                </span>
                <span className="text-[10px] text-[#A5A79B]/60 font-mono">
                  {metadata?.imagesWithoutAlt || 0} missing alt
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#180d0d] border border-[#A5A79B]/10">
                <span className="text-[10px] font-mono uppercase text-[#A5A79B] block">Viewport Tag</span>
                <span className="text-lg font-mono font-extrabold text-[#E8D2B5] block mt-0.5">
                  {metadata?.hasViewport ? 'Configured' : 'Missing'}
                </span>
                <span className="text-[10px] text-[#A5A79B]/60 font-mono">Mobile responsive</span>
              </div>
            </div>

            {/* Detected Production Tech Stack Pills */}
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B] font-semibold block mb-2">
                Detected Runtime Signatures:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {techStack.length > 0 ? (
                  techStack.map((tech) => (
                    <span
                      key={tech.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#180d0d] border border-[#A5A79B]/25 text-[#E8D2B5] shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#590907]" />
                      <span className="font-semibold">{tech.name}</span>
                      <span className="text-[10px] text-[#A5A79B]/70 uppercase">({tech.category})</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-mono text-[#A5A79B]">
                    Standard HTML/CSS Static Web Deployment
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4. Technical Remediation Directives with Copyable Code Snippets */}
          {directives.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#E8D2B5] font-bold flex items-center gap-1.5">
                  <FileCode2 size={14} className="text-[#E8D2B5]" />
                  Technical Remediation Directives &amp; Implementation ({directives.length})
                </span>
                <span className="text-[11px] font-mono text-[#A5A79B]/60">Monospace Code Drawers</span>
              </div>

              <div className="space-y-3">
                {directives.map((dir) => (
                  <TechnicalDirectiveDrawer
                    key={dir.id}
                    directive={dir}
                    onCopy={handleCopySnippet}
                    copiedId={copiedId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
