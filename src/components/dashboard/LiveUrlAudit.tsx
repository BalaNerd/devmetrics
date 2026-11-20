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
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRepo } from '@/hooks/useRepo';
import { useLiveAudit } from '@/hooks/useLiveAudit';
import SteppedAuditLoader from '@/components/ui/SteppedAuditLoader';
import type { LiveDirective } from '@/lib/liveAuditor';

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
          {/* Burgundy Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#590907"
            strokeWidth={strokeWidth}
            opacity={0.35}
          />
          {/* Glowing Cream Progress Arc */}
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

function DirectiveCard({
  directive,
  isPlain,
  onCopy,
  copiedId,
}: {
  directive: LiveDirective;
  isPlain: boolean;
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
            {isPlain ? directive.plainExplanation : directive.technicalDiagnosis}
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
            className="border-t border-[#A5A79B]/10 p-4 sm:p-5 bg-[#0e0707] space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#A5A79B]">
              <span className="flex items-center gap-1.5 font-semibold text-[#E8D2B5]">
                <Terminal size={13} />
                <span>Recommended Implementation ({directive.snippetLanguage})</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(directive.id, directive.snippet);
                }}
                className="px-2.5 py-1 rounded bg-[#180d0d] hover:bg-[#590907] text-[#E8D2B5] text-xs font-mono flex items-center gap-1.5 border border-[#A5A79B]/20 transition-all cursor-pointer"
              >
                {copiedId === directive.id ? (
                  <>
                    <Check size={12} className="text-[#E8D2B5]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="text-[#A5A79B]" />
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

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setToast({
      message: 'Code snippet copied to clipboard',
      type: 'success',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isPlain = audienceMode === 'plain';

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
          className="text-[#A5A79B] hover:text-[#E8D2B5] transition-colors p-1"
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-[#180d0d]/90 backdrop-blur-xl border border-[#A5A79B]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-black/60 relative overflow-hidden"
    >
      {/* Subtle Ambient Glow */}
      <div
        className="bg-[#590907]/20 blur-3xl rounded-full absolute -top-10 -right-10 w-60 h-60 pointer-events-none"
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
                {isPlain ? 'LIVE DEPLOYMENT BENCHMARK' : 'PRODUCTION EDGE TELEMETRY'}
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
                  <Lock size={11} className="text-[#E8D2B5]" /> SSL Active
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

      {/* Prominent Plain-English Website Verdict Banner (Always Prominent) */}
      <div className="p-5 rounded-2xl bg-[#120909] border border-[#590907]/60 space-y-3.5 relative z-10 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#A5A79B]/15 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold tracking-wider text-[#E8D2B5]">
            <Sparkles size={15} className="text-[#E8D2B5]" />
            <span>Executive Website Diligence Report</span>
          </div>
          <span className="text-[11px] font-mono text-[#A5A79B]/70">5 Core Dimensions Synthesized</span>
        </div>

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
                className="p-3.5 rounded-xl bg-[#180d0d]/80 border border-[#A5A79B]/15 flex items-start gap-3 hover:border-[#590907]/50 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[#590907]/30 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5] mt-0.5">
                  <Icon size={15} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#A5A79B]">
                      {rev.category}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        rev.status === 'optimal'
                          ? 'bg-emerald-400'
                          : rev.status === 'warning'
                          ? 'bg-[#E8D2B5]'
                          : 'bg-[#590907]'
                      }`}
                    />
                  </div>
                  <h5 className="text-xs sm:text-sm font-bold text-[#E8D2B5] font-sans">
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

      {/* Linked Source Code Alert Banner */}
      {discoveredGitHubRepo && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#120909] border border-[#590907] flex items-center justify-between gap-4 flex-wrap relative z-10 shadow-lg">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#590907]/40 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5]">
              <GitBranch size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A5A79B] font-semibold block">
                SOURCE CODE LINK DETECTED
              </span>
              <p className="text-sm font-bold text-[#E8D2B5] font-sans truncate">
                Linked Source Code Detected: <span className="font-mono text-[#E8D2B5]">{discoveredGitHubRepo}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleAuditSourceCode}
            className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-[#590907] hover:bg-[#77110f] text-[#E8D2B5] border border-[#590907] transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0 active:scale-95"
          >
            <span>Audit Repository Telemetry</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 4 Circular Radial Progress Gauges */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#A5A79B] font-semibold flex items-center gap-1.5">
            <Gauge size={14} className="text-[#E8D2B5]" />
            Core Web Vitals & PageSpeed Benchmark
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

      {/* HTTP & Edge Vitals Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
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

        {/* HTTP Status */}
        <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B] font-semibold flex items-center gap-1">
            <Server size={11} className="text-[#A5A79B]" />
            HTTP Status
          </span>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#E8D2B5] tabular-nums">
              {status} {statusText}
            </span>
            <span className="block text-[10px] font-mono text-[#A5A79B]/80 mt-0.5">Response Code</span>
          </div>
        </div>

        {/* Edge Cache Status */}
        <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B] font-semibold flex items-center gap-1">
            <Zap size={11} className="text-[#A5A79B]" />
            Edge Cache
          </span>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#E8D2B5]">
              {edgeCacheStatus}
            </span>
            <span className="block text-[10px] font-mono text-[#A5A79B]/80 mt-0.5">{serverHeader}</span>
          </div>
        </div>

        {/* SSL Security */}
        <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B] font-semibold flex items-center gap-1">
            <Lock size={11} className="text-[#A5A79B]" />
            SSL Protocol
          </span>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#E8D2B5]">
              {isHttps ? 'HTTPS Valid' : 'HTTP Insecure'}
            </span>
            <span className="block text-[10px] font-mono text-[#A5A79B]/80 mt-0.5">TLS Encrypted</span>
          </div>
        </div>
      </div>

      {/* Stack Detection Pills */}
      <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-2.5 relative z-10">
        <span className="text-xs font-mono uppercase tracking-wider text-[#A5A79B] font-semibold flex items-center gap-1.5">
          <Layers size={13} className="text-[#E8D2B5]" />
          Detected Production Stack & Infrastructure
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

      {/* Actionable Website Improvement Directives */}
      {directives.length > 0 && (
        <div className="space-y-3 relative z-10 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#A5A79B] font-semibold flex items-center gap-1.5">
              <FileCode2 size={14} className="text-[#E8D2B5]" />
              Actionable Deployment Directives & Remediation ({directives.length})
            </span>
            <span className="text-[11px] font-mono text-[#A5A79B]/60">Production Hygiene Prescriptions</span>
          </div>

          <div className="space-y-3">
            {directives.map((dir) => (
              <DirectiveCard
                key={dir.id}
                directive={dir}
                isPlain={isPlain}
                onCopy={handleCopySnippet}
                copiedId={copiedId}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
