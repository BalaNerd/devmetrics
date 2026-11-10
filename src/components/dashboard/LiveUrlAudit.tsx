'use client';

import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRepo } from '@/hooks/useRepo';
import { useLiveAudit } from '@/hooks/useLiveAudit';

function CircularGauge({
  score,
  label,
  subtitle,
}: {
  score: number;
  label: string;
  subtitle: string;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? '#0C1222' : score >= 50 ? '#5C6A80' : '#3D4FE0';

  return (
    <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#F7F8FC]/90 border border-[#5C6A80]/20 text-center">
      <div className="relative w-22 h-22 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
          <circle
            cx="42"
            cy="42"
            r={radius}
            stroke="#3D4FE0"
            strokeWidth="6"
            fill="transparent"
            opacity={0.35}
          />
          <motion.circle
            cx="42"
            cy="42"
            r={radius}
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
            style={{ filter: `drop-shadow(0 0 8px rgba(12,18,34,0.3))` }}
          />
        </svg>
        <span className="absolute font-mono font-extrabold text-lg text-[#0C1222]">
          {score}
        </span>
      </div>
      <p className="text-xs sm:text-sm font-bold text-[#0C1222] mt-2.5 font-heading">
        {label}
      </p>
      <p className="text-xs text-[#5C6A80]/80 font-mono mt-0.5">
        {subtitle}
      </p>
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
  } = useAppStore();
  const { fetchRepo } = useRepo();
  const { auditUrl } = useLiveAudit();

  const isPlain = audienceMode === 'plain';

  if (liveAuditStatus === 'idle' && !liveAuditData) return null;

  // Loading state
  if (liveAuditStatus === 'loading') {
    return (
      <div className="glass-card p-6 sm:p-8 space-y-5 relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#EEF1FF] border border-[#3D4FE0]/60 flex items-center justify-center animate-spin">
            <RefreshCw size={18} className="text-[#0C1222]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#0C1222] font-heading">
              Inspecting Live Deployment: {liveUrl}
            </p>
            <p className="text-xs sm:text-sm text-[#5C6A80] font-sans">
              Pinging domain, measuring TTFB, scanning tech stack & PageSpeed vitals...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-[#F7F8FC] rounded-2xl border border-[#5C6A80]/15 animate-pulse" />
          <div className="h-28 bg-[#F7F8FC] rounded-2xl border border-[#5C6A80]/15 animate-pulse" />
          <div className="h-28 bg-[#F7F8FC] rounded-2xl border border-[#5C6A80]/15 animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (liveAuditStatus === 'error') {
    return (
      <div className="glass-card p-6 sm:p-8 border-[#3D4FE0]/60 flex items-start justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-[#0C1222] font-heading">
            Live Deployment Inspection Failed
          </h4>
          <p className="text-xs sm:text-sm text-[#5C6A80] mt-1 font-sans">
            {liveAuditError || `Could not connect to ${liveUrl}. Ensure the URL is live and public.`}
          </p>
          {liveUrl && (
            <button
              onClick={() => auditUrl(liveUrl)}
              className="mt-3.5 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-[#3D4FE0] text-white hover:bg-[#2A38B8] transition-all"
            >
              Retry Inspection
            </button>
          )}
        </div>
        <button
          onClick={clearLiveAudit}
          className="text-[#5C6A80] hover:text-[#0C1222] transition-colors p-1"
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
    title,
    discoveredGitHubRepo,
    techStack,
    metrics,
    plainEnglishReview,
  } = liveAuditData;

  const handleAuditSourceCode = () => {
    if (!discoveredGitHubRepo) return;
    setCurrentRepo(discoveredGitHubRepo);
    fetchRepo(discoveredGitHubRepo);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 sm:p-8 space-y-6"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF1FF] border border-[#3D4FE0]/60 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(61,79,224,0.3)]">
            <Globe size={22} className="text-[#0C1222]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="type-kicker text-xs font-semibold tracking-wider text-[#5C6A80]">
                {isPlain ? 'LIVE DEPLOYMENT BENCHMARK' : 'PRODUCTION TELEMETRY'}
              </span>
              <span className="badge badge-burgundy text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0C1222] animate-pulse" />
                Live ({status} {statusText})
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0C1222] mt-1 font-heading">
              {title || hostname}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C6A80] flex items-center gap-2 mt-1 font-mono">
              <span className="text-[#0C1222]">{finalUrl}</span>
              {isHttps && (
                <span className="flex items-center gap-1 text-xs text-[#5C6A80]">
                  <Lock size={11} className="text-[#0C1222]" /> SSL Active
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#5C6A80]/25 bg-[#FFFFFF] text-xs font-mono text-[#0C1222] hover:border-[#3D4FE0] transition-all"
          >
            <span>Visit Live</span>
            <ExternalLink size={13} />
          </a>

          <button
            onClick={() => auditUrl(finalUrl)}
            className="p-2.5 rounded-xl border border-[#5C6A80]/25 bg-[#FFFFFF] text-[#5C6A80] hover:text-[#0C1222] hover:border-[#3D4FE0] transition-colors"
            title="Re-run audit"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={clearLiveAudit}
            className="p-2.5 rounded-xl border border-[#5C6A80]/25 bg-[#FFFFFF] text-[#5C6A80] hover:text-[#0C1222] transition-colors"
            title="Dismiss live audit"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Connected Source Code Alert Banner (If Discovered) */}
      {discoveredGitHubRepo && (
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#3D4FE0] flex items-center justify-between gap-4 flex-wrap shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF1FF] border border-[#3D4FE0]/60 flex items-center justify-center shrink-0">
              <GitBranch size={18} className="text-[#0C1222]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0C1222] font-heading">
                Source Code Detected
              </p>
              <p className="text-xs sm:text-sm text-[#5C6A80] font-mono mt-0.5">
                Linked repository: <strong className="text-[#0C1222]">github.com/{discoveredGitHubRepo}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleAuditSourceCode}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold font-mono bg-[#3D4FE0] text-white hover:bg-[#2A38B8] transition-all shadow-md"
          >
            <span>Audit Source Code</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Metrics & Speed Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <CircularGauge score={metrics.performance} label="Performance" subtitle={`FCP: ${metrics.fcp}`} />
        <CircularGauge score={metrics.accessibility} label="Accessibility" subtitle="Semantic & ARIA" />
        <CircularGauge score={metrics.seo} label="SEO & Search" subtitle="Meta & Indexing" />

        {/* Network & Latency Card */}
        <div className="p-5 rounded-2xl bg-[#F7F8FC]/90 border border-[#5C6A80]/20 flex flex-col justify-between text-xs font-mono space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-[#5C6A80] mb-1">
              <span className="flex items-center gap-1.5 text-[#0C1222] font-semibold">
                <Zap size={14} className="text-[#0C1222]" />
                TTFB Latency
              </span>
              <span className="text-[#0C1222] font-extrabold">{ttfbMs} ms</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0C1222] mt-1">
              {ttfbMs < 300 ? 'Ultra Fast' : ttfbMs < 800 ? 'Normal' : 'High Latency'}
            </p>
            <p className="text-xs text-[#5C6A80]/80 font-sans mt-0.5">Time to First Byte</p>
          </div>
          <div className="pt-3 border-t border-[#5C6A80]/15 flex items-center justify-between text-xs text-[#5C6A80]">
            <span>Payload Size:</span>
            <span className="text-[#0C1222] font-bold">{(metrics.htmlSizeBytes / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      </div>

      {/* Tech Stack Detection */}
      <div>
        <p className="type-kicker mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-[#5C6A80]">
          <Layers size={14} className="text-[#0C1222]" />
          <span>Detected Architecture & Tech Stack</span>
        </p>
        <div className="flex flex-wrap gap-2.5">
          {techStack.length > 0 ? (
            techStack.map((tech) => (
              <span
                key={tech.name}
                className="px-3.5 py-2 rounded-xl bg-[#F7F8FC]/90 border border-[#5C6A80]/20 text-xs font-mono text-[#0C1222] flex items-center gap-2 hover:border-[#3D4FE0] transition-colors"
              >
                <span className="text-[#0C1222] font-bold">▲</span>
                <span className="font-semibold">{tech.name}</span>
                <span className="text-[11px] text-[#5C6A80]">({tech.category})</span>
              </span>
            ))
          ) : (
            <span className="text-xs sm:text-sm text-[#5C6A80]">
              Standard static HTML/CSS deployment
            </span>
          )}
        </div>
      </div>

      {/* Plain English Review */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F8FC]/70 border border-[#5C6A80]/20 space-y-3">
        <p className="text-xs sm:text-sm font-bold text-[#0C1222] uppercase tracking-wider font-heading">
          {isPlain ? 'Website Experience Review' : 'Live Diagnostics Overview'}
        </p>
        <ul className="space-y-2">
          {plainEnglishReview.map((rev, idx) => (
            <li key={idx} className="text-xs sm:text-sm text-[#5C6A80] flex items-start gap-2.5 font-sans leading-relaxed">
              <span className="text-[#0C1222] font-bold shrink-0 mt-0.5">›</span>
              <span>{rev}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
