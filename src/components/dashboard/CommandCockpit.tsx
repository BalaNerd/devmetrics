'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Zap,
  User,
  ShieldCheck,
  Globe,
  Sparkles,
  Layers,
  Activity,
  CornerDownLeft,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRepo } from '@/hooks/useRepo';
import { useLiveAudit } from '@/hooks/useLiveAudit';
import { classifyInput } from '@/lib/urlRouter';

interface BenchmarkProfile {
  id: string;
  target: string;
  type: 'repo' | 'liveUrl';
  title: string;
  kicker: string;
  pill: string;
  pillStyle: string;
  stats: string;
  description: string;
  icon: typeof Zap;
}

const BENCHMARK_PROFILES: BenchmarkProfile[] = [
  {
    id: 'velocity-scale',
    target: 'shadcn/ui',
    type: 'repo',
    title: 'shadcn/ui',
    kicker: 'Card 1: High Velocity & Scale',
    pill: 'RAPID ITERATION',
    pillStyle: 'bg-[#590907] text-[#E8D2B5] border border-[#E8D2B5]/25 shadow-[0_0_12px_rgba(89,9,7,0.5)]',
    stats: '95/100 Velocity · Distributed Team · Grade A+',
    description: 'Exemplary modern open-source cadence with high pull-request turnaround.',
    icon: Activity,
  },
  {
    id: 'solo-creator',
    target: 'antfu/unocss',
    type: 'repo',
    title: 'antfu/unocss',
    kicker: 'Card 2: Solo Creator Core',
    pill: 'SOLO BUILDER',
    pillStyle: 'bg-[#A5A79B]/20 text-[#E8D2B5] border border-[#A5A79B]/30',
    stats: '88/100 Velocity · 1 Key Maintainer · Grade A',
    description: 'Extreme author concentration with rapid daily commits.',
    icon: User,
  },
  {
    id: 'enterprise-foundation',
    target: 'facebook/react',
    type: 'repo',
    title: 'facebook/react',
    kicker: 'Card 3: Maintenance / Established Engine',
    pill: 'ENTERPRISE FOUNDATION',
    pillStyle: 'bg-[#590907]/40 text-[#E8D2B5] border border-[#590907]',
    stats: '72/100 Velocity · 1,500+ Contributors · Grade A',
    description: 'Rigorous enterprise hygiene and multi-tier review standards.',
    icon: ShieldCheck,
  },
  {
    id: 'live-deployment',
    target: 'https://devmetrics.vercel.app',
    type: 'liveUrl',
    title: 'devmetrics.vercel.app',
    kicker: 'Card 4: Live Vercel Deployment',
    pill: 'FULL-STACK AUDIT',
    pillStyle: 'bg-[#E8D2B5]/15 text-[#E8D2B5] border border-[#E8D2B5]/20',
    stats: 'Core Web Vitals · Edge TTFB · Linked GitHub Source',
    description: 'Simultaneous deployment performance and source repository check.',
    icon: Globe,
  },
];

export default function CommandCockpit() {
  const [inputValue, setInputValue] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const { setCurrentRepo, recentSearches } = useAppStore();
  const { fetchRepo } = useRepo();
  const { auditUrl } = useLiveAudit();

  const handleDispatch = (targetString: string) => {
    const trimmed = targetString.trim();
    if (!trimmed) return;

    setSelectedTarget(trimmed);
    const classified = classifyInput(trimmed);

    if (classified.type === 'LIVE_URL') {
      auditUrl(classified.normalizedUrl);
    } else {
      const targetRepo = classified.canonical || classified.raw.trim();
      setCurrentRepo(targetRepo);
      fetchRepo(targetRepo);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDispatch(inputValue);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-14 px-2 sm:px-4 flex flex-col items-center">
      
      {/* A. Hero Command Bar & Mode Pill */}
      <div className="w-full text-center space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A5A79B]/80 block text-center mb-3">
          // DEV_METRICS TELEMETRY DISPATCH v1.0
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#E8D2B5] font-sans text-center max-w-3xl mx-auto leading-[1.12]">
          Inspect Codebase Velocity &amp; Infrastructure.
        </h1>

        <p className="text-xs sm:text-sm font-sans text-[#A5A79B] max-w-xl mx-auto leading-relaxed">
          Quantitative engineering intelligence, shipping cadence, maintainer centralization, and live edge deployment audits.
        </p>

        {/* Input Terminal Container */}
        <form
          onSubmit={handleFormSubmit}
          className="w-full max-w-2xl mx-auto mt-6 sm:mt-8 bg-[#180d0d]/90 border border-[#A5A79B]/20 rounded-2xl p-2 shadow-2xl focus-within:border-[#590907] transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 group"
        >
          <div className="flex items-center gap-2.5 flex-1 px-2 py-1 sm:py-0">
            <Search size={18} className="text-[#A5A79B] group-focus-within:text-[#E8D2B5] transition-colors shrink-0" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste GitHub repo (owner/repo) or live URL (app.vercel.app)..."
              className="w-full bg-transparent border-none text-[#E8D2B5] placeholder-[#A5A79B]/50 font-mono text-xs sm:text-sm focus:outline-none focus:ring-0 selection:bg-[#590907] selection:text-[#E8D2B5]"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-[#590907] hover:bg-[#77110f] disabled:opacity-40 disabled:hover:bg-[#590907] text-[#E8D2B5] font-mono text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#E8D2B5]/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#590907]/30 shrink-0"
          >
            <span>Analyze Telemetry</span>
            <CornerDownLeft size={13} className="opacity-80" />
          </button>
        </form>

        {/* Recent Searches mini-strip (if available) */}
        {recentSearches.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A79B]/60">Recent:</span>
            {recentSearches.slice(0, 3).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleDispatch(item)}
                className="font-mono text-[11px] text-[#A5A79B] hover:text-[#E8D2B5] bg-[#180d0d] border border-[#A5A79B]/15 hover:border-[#590907] px-2.5 py-0.5 rounded-full transition-all cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* B. Benchmark Showcase Roster (4 Diverse Live Profiles) */}
      <div className="w-full mt-12 sm:mt-16">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[#590907]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#A5A79B]/90 font-medium">
              Benchmark Profiles &amp; Reference Artifacts
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#A5A79B]/60">
            Click any profile to load immediate telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENCHMARK_PROFILES.map((profile) => {
            const Icon = profile.icon;
            const isTargetActive = selectedTarget === profile.target;

            return (
              <div
                key={profile.id}
                onClick={() => handleDispatch(profile.target)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDispatch(profile.target);
                  }
                }}
                className={`bg-[#180d0d]/60 border border-[#A5A79B]/15 hover:border-[#590907]/70 rounded-xl p-4 cursor-pointer transition-all duration-200 group flex flex-col justify-between hover:shadow-xl hover:shadow-[#590907]/10 hover:-translate-y-0.5 ${
                  isTargetActive ? 'border-[#590907] ring-1 ring-[#590907]' : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badge & Micro Icon */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${profile.pillStyle}`}>
                      {profile.pill}
                    </span>
                    <Icon size={14} className="text-[#A5A79B] group-hover:text-[#E8D2B5] transition-colors shrink-0" />
                  </div>

                  {/* Identifier & Kicker */}
                  <div>
                    <div className="font-mono font-bold text-base text-[#E8D2B5] group-hover:text-white transition-colors truncate">
                      {profile.title}
                    </div>
                    <div className="text-[10px] font-mono text-[#A5A79B]/70 mt-0.5">
                      {profile.kicker}
                    </div>
                  </div>

                  {/* Micro Stats */}
                  <div className="text-[11px] font-mono text-[#E8D2B5]/90 bg-[#120909]/80 border border-[#A5A79B]/10 rounded-lg px-2.5 py-1.5 leading-snug">
                    {profile.stats}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#A5A79B]/85 leading-relaxed font-sans line-clamp-2">
                    &ldquo;{profile.description}&rdquo;
                  </p>
                </div>

                {/* Bottom Action Hint */}
                <div className="pt-4 mt-3 border-t border-[#A5A79B]/10 flex items-center justify-between text-[11px] font-mono text-[#A5A79B] group-hover:text-[#E8D2B5] transition-colors">
                  <span>Dispatch Audit</span>
                  <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform text-[#590907] group-hover:text-[#E8D2B5]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* C. System Telemetry Status Footer */}
      <footer className="w-full mt-12 sm:mt-16 pt-6 border-t border-[#A5A79B]/10">
        <div className="font-mono text-[11px] text-[#A5A79B]/70 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>GitHub REST Engine Active (5,000 req/hr cached)</span>
          </div>
          <span className="hidden sm:inline text-[#A5A79B]/30">•</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8D2B5]" />
            <span>Google PageSpeed Core Vitals Ready</span>
          </div>
          <span className="hidden sm:inline text-[#A5A79B]/30">•</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#590907]" />
            <span>Edge Cache Hit Ratio: 99.4%</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
