'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Zap,
  Shield,
  GitMerge,
  Layers,
  Terminal,
  Globe,
  ArrowRight,
  AlertTriangle,
  Lock,
  AlertCircle,
  Key,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRepo } from '@/hooks/useRepo';
import { useLiveAudit } from '@/hooks/useLiveAudit';
import { PRESET_REPOS, PRESET_LIVE_URLS } from '@/lib/constants';
import { classifyInput } from '@/lib/urlRouter';

interface EmptyStateProps {
  type: 'idle' | 'not-found' | 'error' | 'rate-limited';
  message?: string;
}

const FEATURE_CARDS = [
  {
    icon: Zap,
    title: 'Velocity Score',
    desc: 'Composite shipping throughput & commit cadence algorithm',
  },
  {
    icon: Shield,
    title: 'Health Audit',
    desc: 'Automated CI/CD checks, legal licensing, and governance',
  },
  {
    icon: GitMerge,
    title: 'Bus Factor',
    desc: 'Contributor centralization and solo maintainer risk scoring',
  },
  {
    icon: Layers,
    title: 'Stack Analysis',
    desc: 'Package dependencies, bundle bloat, and language distribution',
  },
  {
    icon: Terminal,
    title: 'Commit Heatmap',
    desc: '7-day × 24-hour coding rhythm matrix with timeline scrubbing',
  },
  {
    icon: Globe,
    title: 'Live Deployment',
    desc: 'Inspect any live URL for TTFB latency, stack, and Web Vitals',
  },
];

export default function EmptyState({ type, message }: EmptyStateProps) {
  const { setTokenModalOpen, setCommandBarOpen } = useAppStore();
  const { fetchRepo } = useRepo();
  const { auditUrl } = useLiveAudit();
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const classified = classifyInput(trimmed);
    if (classified.type === 'LIVE_URL') {
      auditUrl(classified.normalizedUrl);
    } else {
      const target = classified.canonical || classified.raw.trim();
      fetchRepo(target);
    }
  };

  const handlePresetRepo = (repoValue: string) => {
    setQuery(repoValue);
    fetchRepo(repoValue);
  };

  const handlePresetLive = (urlValue: string) => {
    setQuery(urlValue);
    auditUrl(urlValue);
  };

  if (type === 'idle') {
    return (
      <div className="relative w-full overflow-hidden">
        {/* Centered Hero Container */}
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4 text-center relative py-16">
          {/* Ambient Spotlight Glow */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(61, 79, 224, 0.35) 0%, rgba(61, 79, 224, 0.1) 45%, transparent 70%)',
              filter: 'blur(90px)',
            }}
          />

          {/* Micro Kicker Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.1] bg-[#FFFFFF]/80 backdrop-blur-xl mb-6 shadow-xl"
          >
            <Sparkles size={14} className="text-[#0C1222]" />
            <span className="text-xs font-mono tracking-wider uppercase gradient-text font-bold">
              Executive Developer Intelligence & Repository Velocity
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] font-heading"
          >
            Analyze Repository Velocity &
            <br />
            <span className="gradient-text">Developer Telemetry</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-base sm:text-lg text-[#5C6A80] max-w-2xl mx-auto mt-4 font-sans leading-relaxed"
          >
            Instant code cadence audit, key-person continuity, legal compliance checks, and live deployment inspection for any public GitHub repository.
          </motion.p>

          {/* Expand Search Input */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl mt-10 p-2 rounded-full bg-white border border-[#E3E8F2] focus-within:border-[#3D4FE0] focus-within:ring-2 focus-within:ring-[#3D4FE0]/25 text-[#0C1222] shadow-lg flex items-center gap-3 transition-all"
          >
            <Search size={18} className="text-[#5C6A80] shrink-0 ml-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter owner/repo or paste URL (e.g. vercel/next.js, linear.app)..."
              className="flex-1 bg-transparent text-sm sm:text-base font-mono text-[#0C1222] placeholder-[#5C6A80]/50 outline-none py-2"
            />
            <div className="flex items-center gap-2 shrink-0 pr-1">
              <button
                type="button"
                onClick={() => setCommandBarOpen(true)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F7F8FC] border border-white/[0.1] font-mono text-xs text-[#5C6A80] hover:text-[#0C1222] transition-colors"
                title="Open Command Bar"
              >
                <span>⌘K</span>
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold font-mono bg-[#3D4FE0] text-white hover:bg-[#2A38B8] transition-all"
              >
                <span>Analyze</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.form>

          {/* Quick Launch Preset Chips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 flex flex-col items-center gap-3 w-full max-w-3xl"
          >
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs font-mono uppercase tracking-wider text-[#5C6A80]/70 mr-1">
                Presets:
              </span>
              {PRESET_REPOS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetRepo(preset.value)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E3E8F2] bg-white hover:bg-[#EEF1FF] hover:border-[#D5DCFF] text-xs font-medium text-[#0C1222] transition-all"
                >
                  <span className="text-sm">{preset.emoji}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs font-mono uppercase tracking-wider text-[#5C6A80]/70 mr-1">
                Live URLs:
              </span>
              {PRESET_LIVE_URLS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetLive(preset.value)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E3E8F2] bg-white hover:bg-[#EEF1FF] hover:border-[#D5DCFF] text-xs font-medium text-[#0C1222] transition-all"
                >
                  <span className="text-sm">{preset.emoji}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Feature Cards Grid: Centered 3x2 Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16 w-full max-w-4xl mx-auto"
          >
            {FEATURE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="p-6 rounded-3xl glass-card text-left flex items-start gap-4 transition-all hover:-translate-y-1 group"
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-[#0C1222]/20 bg-gradient-to-br from-[#3D4FE0] to-[#2A38B8] text-white shadow-lg group-hover:scale-110 transition-transform"
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="text-sm font-bold text-[#0C1222] tracking-tight font-heading"
                    >
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#5C6A80] mt-1.5 leading-relaxed font-sans">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    );
  }

  if (type === 'rate-limited') {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] px-4 text-center py-16">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[#3D4FE0]/25 border border-[#3D4FE0]/60 shadow-[0_0_30px_rgba(61,79,224,0.3)]">
          <AlertTriangle size={28} className="text-[#0C1222]" />
        </div>
        <div className="badge badge-burgundy mb-3">HTTP 403 · Rate Limit Exceeded</div>
        <h2 className="text-2xl font-bold mb-2 text-[#0C1222] font-heading">
          GitHub API Rate Limit Reached
        </h2>
        <p className="text-sm mb-6 max-w-md leading-relaxed text-[#5C6A80] font-sans">
          GitHub restricts anonymous API requests to 60/hr. Add a free Personal Access Token to unlock 5,000 requests per hour. Your token is stored strictly in your browser&apos;s local storage.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setTokenModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs font-mono bg-[#3D4FE0] text-white hover:bg-[#2A38B8] shadow-lg transition-all"
          >
            <Key size={14} />
            <span>Enter GitHub Token</span>
          </button>
          <button
            onClick={() => setCommandBarOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono text-[#0C1222] bg-[#FFFFFF] border border-[#5C6A80]/25 hover:border-[#3D4FE0] transition-colors"
          >
            <Search size={14} />
            <span>Search Another Repo</span>
          </button>
        </div>
      </div>
    );
  }

  if (type === 'not-found') {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] px-4 text-center py-16">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[#FFFFFF] border border-[#5C6A80]/20">
          <Lock size={26} className="text-[#5C6A80]" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-[#0C1222] font-heading">
          Repository Not Found
        </h2>
        <p className="text-sm mb-6 max-w-sm leading-relaxed text-[#5C6A80] font-sans">
          {message || "This repository doesn't exist, is private, or was mistyped. Only public GitHub repositories are supported."}
        </p>
        <button
          onClick={() => setCommandBarOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs font-mono bg-[#3D4FE0] text-white hover:bg-[#2A38B8] shadow-lg transition-all"
        >
          <Search size={14} />
          <span>Try Another Repository</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] px-4 text-center py-16">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[#EEF1FF] border border-[#3D4FE0]">
        <AlertCircle size={26} className="text-[#0C1222]" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-[#0C1222] font-heading">
        Telemetry Pipeline Error
      </h2>
      <p className="text-sm mb-6 max-w-sm leading-relaxed text-[#5C6A80] font-sans">
        {message || 'Failed to fetch repository telemetry. Verify your internet connection or access token and retry.'}
      </p>
      <button
        onClick={() => setCommandBarOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs font-mono bg-[#3D4FE0] text-white hover:bg-[#2A38B8] shadow-lg transition-all"
      >
        <Search size={14} />
        <span>Search A Repository</span>
      </button>
    </div>
  );
}
