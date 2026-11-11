'use client';

import { useState, useMemo, useEffect } from 'react';
import { DollarSign, Cloud, Server, Cpu, Database, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { RepoData } from '@/lib/github';

interface CostEstimatorProps {
  data: RepoData;
  embedded?: boolean;
}

type ScaleTier = 'hobby' | 'growth' | 'scale';

export default function CostEstimator({ data, embedded = false }: CostEstimatorProps) {
  const { audienceMode } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Standardize SSR default until the client component has cleanly mounted
  const isPlain = isMounted && audienceMode === 'plain';
  const [scaleTier, setScaleTier] = useState<ScaleTier>('hobby');

  const { repo, velocity, health, languages } = data;

  // Detect architectural framework
  const detectedFramework = useMemo(() => {
    const langNames = Object.keys(languages || {});
    if (repo.topics?.includes('nextjs') || repo.topics?.includes('next') || langNames.includes('TypeScript')) {
      return 'Next.js / TypeScript (Edge & Serverless)';
    }
    if (langNames.includes('Python')) return 'Python API / ASGI Container';
    if (langNames.includes('Go')) return 'Go Compiled Binary / Docker';
    if (langNames.includes('Rust')) return 'Rust Native Binary / MicroVM';
    return `${repo.language || 'Node.js'} Full-Stack Application`;
  }, [languages, repo]);

  const monthlyCommits = Math.max(8, Math.round(velocity.commitFrequency * 4));
  const estimatedBuildMinutes = monthlyCommits * (health.hasCICD ? 5 : 2);

  const tierPricing = {
    hobby: {
      label: 'Hobby / MVP',
      totalCost: 0,
      invocations: '100,000 free invocations/mo',
      bandwidth: '100 GB Edge Bandwidth',
      database: 'Supabase / Neon Free Tier ($0)',
      vpsCost: 5,
      cloudCost: 25,
    },
    growth: {
      label: 'Growth Stage',
      totalCost: 20,
      invocations: '1,000,000 invocations ($20/mo)',
      bandwidth: '1 TB Bandwidth ($40)',
      database: 'Managed DB with Connection Pooling ($25/mo)',
      vpsCost: 15,
      cloudCost: 95,
    },
    scale: {
      label: 'Production Scale',
      totalCost: 140,
      invocations: '10,000,000 invocations/mo ($100)',
      bandwidth: '5 TB High-Throughput CDN ($120)',
      database: 'Dedicated Compute Cluster ($80/mo)',
      vpsCost: 48,
      cloudCost: 320,
    },
  }[scaleTier];

  const containerClasses = embedded
    ? 'space-y-5 sm:space-y-6 w-full flex flex-col justify-between'
    : 'w-full bg-[#180d0d] border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between gap-6';

  return (
    <div className={containerClasses}>
      {/* Subheader */}
      <div className="flex items-start justify-between gap-3 flex-wrap pb-2 border-b border-[#A5A79B]/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center shrink-0">
            <DollarSign size={17} />
          </div>
          <div>
            <span suppressHydrationWarning className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#A5A79B]/80 block">
              {isPlain ? 'CLOUD COST ESTIMATOR' : 'CLOUD INFRASTRUCTURE & RUNTIME ESTIMATOR'}
            </span>
            <h3 suppressHydrationWarning className="font-sans text-base sm:text-lg font-bold text-[#E8D2B5] tracking-tight mt-0.5">
              {isPlain ? 'Hosting Cost Projection' : `Architecture: ${detectedFramework}`}
            </h3>
          </div>
        </div>

        {/* Technical Scale Tier Switcher */}
        {!isPlain && (
          <div suppressHydrationWarning className="inline-flex items-center p-1 rounded-xl bg-[#120909] border border-[#A5A79B]/20">
            {(['hobby', 'growth', 'scale'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setScaleTier(tier)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  scaleTier === tier
                    ? 'bg-[#590907] text-[#E8D2B5] font-semibold border border-[#590907] shadow-sm'
                    : 'text-[#A5A79B] hover:text-[#E8D2B5]'
                }`}
              >
                {tier === 'hobby' ? 'Hobby' : tier === 'growth' ? 'Growth' : 'Scale'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PLAIN ENGLISH MODE: Clear Zero-Cost / Free-Tier Card */}
      <div suppressHydrationWarning>
        {isPlain ? (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-xl bg-[#120909] border border-[#590907]/60 space-y-3 shadow-md">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-sans font-semibold tracking-wider uppercase text-[#A5A79B]">
                Monthly Running Cost
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#590907] text-[#E8D2B5]">
                <ShieldCheck size={12} /> Free Tier Eligible
              </span>
            </div>

            <p className="font-sans text-base sm:text-lg font-bold text-[#E8D2B5] leading-snug">
              Estimated Running Cost: $0/month. Operates fully inside free-tier cloud limits.
            </p>

            <p className="font-sans text-xs sm:text-sm text-[#A5A79B] leading-relaxed">
              Designed for low-friction deployments. You can deploy this application publicly without entering a credit card or incurring monthly recurring cloud charges.
            </p>
          </div>

          {/* 3 Plain English Service Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-1">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#A5A79B] flex items-center gap-1">
                <Cloud size={13} className="text-[#E8D2B5]" /> Web Hosting
              </span>
              <p className="text-base font-bold text-[#E8D2B5] font-mono">$0 / mo</p>
              <p className="text-[11px] text-[#A5A79B] font-sans">
                Free on Vercel, Netlify, or GitHub Pages
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-1">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#A5A79B] flex items-center gap-1">
                <Database size={13} className="text-[#E8D2B5]" /> Database
              </span>
              <p className="text-base font-bold text-[#E8D2B5] font-mono">$0 / mo</p>
              <p className="text-[11px] text-[#A5A79B] font-sans">
                Free tier on Supabase, Neon, or PlanetScale
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-1">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#A5A79B] flex items-center gap-1">
                <Zap size={13} className="text-[#E8D2B5]" /> CI/CD Automation
              </span>
              <p className="text-base font-bold text-[#E8D2B5] font-mono">$0 / mo</p>
              <p className="text-[11px] text-[#A5A79B] font-sans">
                2,000 free build minutes/month included
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* TECHNICAL MODE: Detailed Infrastructure Breakdown */
        <div className="space-y-4">
          {/* 3 Architecture Cost Breakdown Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#120909] border border-[#590907]/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#A5A79B]">
                <Cloud size={14} className="text-[#E8D2B5]" />
                <span>Edge / Serverless</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-[#E8D2B5] tabular-nums">
                ${tierPricing.totalCost}
                <span className="text-xs text-[#A5A79B] font-normal"> / mo</span>
              </p>
              <p className="text-xs text-[#A5A79B] font-sans">
                Vercel / Cloudflare Workers runtime
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#A5A79B]">
                <Server size={14} className="text-[#A5A79B]" />
                <span>Self-Hosted VPS</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-[#E8D2B5] tabular-nums">
                ${tierPricing.vpsCost}
                <span className="text-xs text-[#A5A79B] font-normal"> / mo</span>
              </p>
              <p className="text-xs text-[#A5A79B] font-sans">
                Hetzner / DigitalOcean Linux droplet
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#A5A79B]">
                <Cpu size={14} className="text-[#A5A79B]" />
                <span>Dedicated Cloud</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-[#E8D2B5] tabular-nums">
                ${tierPricing.cloudCost}
                <span className="text-xs text-[#A5A79B] font-normal"> / mo</span>
              </p>
              <p className="text-xs text-[#A5A79B] font-sans">
                AWS ECS / GCP Cloud Run with managed DB
              </p>
            </div>
          </div>

          {/* Detailed Tier Specifications */}
          <div className="p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#A5A79B]">Serverless Invocations:</span>
              <span className="text-[#E8D2B5] font-semibold">{tierPricing.invocations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A5A79B]">Edge Network Bandwidth:</span>
              <span className="text-[#E8D2B5] font-semibold">{tierPricing.bandwidth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A5A79B]">Database Pooling Tier:</span>
              <span className="text-[#E8D2B5] font-semibold">{tierPricing.database}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#A5A79B]/10">
              <span className="text-[#A5A79B]">GitHub Actions CI/CD:</span>
              <span className="text-[#E8D2B5] font-semibold">~{estimatedBuildMinutes} min/month (0.00 within allowance)</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
