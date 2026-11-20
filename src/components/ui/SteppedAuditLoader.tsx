'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Zap,
  GitBranch,
  ShieldCheck,
  Activity,
  FileText,
  Globe,
  Gauge,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SteppedAuditLoaderProps {
  target: string;
  type?: 'repo' | 'liveUrl';
  onCancel?: () => void;
}

interface StepDef {
  title: string;
  desc: string;
  icon: typeof Zap;
}

const REPO_STEPS: StepDef[] = [
  {
    title: 'Fetching Git Tree & Commits',
    desc: 'Ingesting last 100 commits, branches & author distributions',
    icon: GitBranch,
  },
  {
    title: 'Scanning Dependencies & Governance',
    desc: 'Auditing manifest vulnerabilities, licenses & CI/CD workflows',
    icon: ShieldCheck,
  },
  {
    title: 'Calculating Velocity & Bus Factor',
    desc: 'Simulating maintainer centralization & shipping cadence',
    icon: Activity,
  },
  {
    title: 'Synthesizing Telemetry Report',
    desc: 'Formulating directives, health grade & dual audience briefs',
    icon: FileText,
  },
];

const LIVE_STEPS: StepDef[] = [
  {
    title: 'Resolving DNS & Edge Headers',
    desc: 'Measuring TTFB, TLS certificate & edge server headers',
    icon: Globe,
  },
  {
    title: 'Scanning Tech Stack & Manifest',
    desc: 'Detecting frameworks, analytics, meta tags & linked repository',
    icon: Layers,
  },
  {
    title: 'Running PageSpeed Core Vitals',
    desc: 'Evaluating LCP, FCP, CLS, Performance & Accessibility',
    icon: Gauge,
  },
  {
    title: 'Synthesizing Telemetry Report',
    desc: 'Formulating deployment health, speed index & plain-English review',
    icon: Sparkles,
  },
];

export default function SteppedAuditLoader({
  target,
  type = 'repo',
  onCancel,
}: SteppedAuditLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2, 3
  const [progressPercent, setProgressPercent] = useState(15);

  const steps = type === 'liveUrl' ? LIVE_STEPS : REPO_STEPS;

  useEffect(() => {
    // Realistic multi-stage audit progress simulation
    const timer1 = setTimeout(() => {
      setCurrentStep(1);
      setProgressPercent(38);
    }, 600);

    const timer2 = setTimeout(() => {
      setCurrentStep(2);
      setProgressPercent(64);
    }, 1400);

    const timer3 = setTimeout(() => {
      setCurrentStep(3);
      setProgressPercent(88);
    }, 2400);

    const interval = setInterval(() => {
      setProgressPercent((prev) => (prev < 94 ? prev + 1 : prev));
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#180d0d]/90 backdrop-blur-xl border border-[#A5A79B]/15 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 shadow-[inset_0_1px_0_rgba(232,210,181,0.08)] relative overflow-hidden space-y-6">
      {/* Subtle Ambient Backlight Glow */}
      <div
        className="bg-[#590907]/20 blur-3xl rounded-full absolute -top-12 -right-12 w-64 h-64 pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header Rail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E8D2B5] animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A5A79B] font-semibold">
              TELEMETRY AUDIT IN FLIGHT
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#E8D2B5] font-sans tracking-tight mt-1 truncate max-w-xl">
            {target || 'Active Inspection Target'}
          </h2>
        </div>

        {/* Live Percentage & Stage Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#120909] border border-[#A5A79B]/20 flex items-center gap-2 text-right">
            <span className="text-[10px] font-mono uppercase text-[#A5A79B] tracking-wider">
              Stage {currentStep + 1} of 4
            </span>
            <span className="text-sm font-mono font-extrabold text-[#E8D2B5] tabular-nums">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* 4-Stage Connected Milestones */}
      <div className="relative z-10 pt-2 pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative">
          
          {/* Background Connecting Line for Desktop */}
          <div className="hidden sm:block absolute top-5 left-8 right-8 h-0.5 bg-[#A5A79B]/15 -z-1" />

          {/* Active Gradient Connecting Line */}
          <motion.div
            className="hidden sm:block absolute top-5 left-8 h-0.5 bg-gradient-to-r from-[#590907] via-[#E8D2B5] to-[#590907] -z-1"
            initial={{ width: '0%' }}
            animate={{
              width: `${(currentStep / (steps.length - 1)) * 82}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="flex sm:flex-col items-center sm:items-start sm:text-left gap-3 sm:gap-2.5 p-2 rounded-xl transition-all"
              >
                {/* Milestone Node */}
                <div className="relative shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#590907] text-[#E8D2B5] border border-[#E8D2B5]/30 shadow-[0_0_12px_rgba(89,9,7,0.6)]'
                        : isActive
                        ? 'bg-[#590907] text-[#E8D2B5] border-2 border-[#E8D2B5] shadow-[0_0_15px_rgba(232,210,181,0.5)]'
                        : 'bg-[#120909] text-[#A5A79B]/60 border border-[#A5A79B]/20'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={16} strokeWidth={3} className="text-[#E8D2B5]" />
                    ) : (
                      <Icon size={16} className={isActive ? 'animate-pulse text-[#E8D2B5]' : 'text-[#A5A79B]/60'} />
                    )}
                  </div>

                  {/* Pulsing Aura on Active Node */}
                  {isActive && (
                    <span className="absolute -inset-1 rounded-full border border-[#E8D2B5]/40 animate-ping pointer-events-none" />
                  )}
                </div>

                {/* Step Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#A5A79B]/70 uppercase tracking-wider">
                      0{idx + 1}.
                    </span>
                    <span
                      className={`text-xs font-sans font-bold leading-tight truncate block ${
                        isActive
                          ? 'text-[#E8D2B5]'
                          : isCompleted
                          ? 'text-[#E8D2B5]/90'
                          : 'text-[#A5A79B]/50'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] font-sans leading-snug mt-0.5 line-clamp-2 ${
                      isActive ? 'text-[#A5A79B]' : 'text-[#A5A79B]/50'
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Striped / Candy-Cane Linear Progress Bar */}
      <div className="relative z-10 space-y-2 pt-2">
        <div className="w-full h-3 bg-[#120909] border border-[#A5A79B]/15 rounded-full overflow-hidden relative p-0.5">
          <motion.div
            className="h-full rounded-full candy-stripe-bar relative"
            style={{ width: `${progressPercent}%` }}
            initial={{ width: '10%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Bright cream leading edge accent */}
            <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-[#E8D2B5] rounded-full shadow-[0_0_8px_#E8D2B5]" />
          </motion.div>
        </div>

        {/* Live Status Ticker Underneath */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#A5A79B]/80 pt-1">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">
              {steps[currentStep]?.desc || 'Telemetry execution pipeline running...'}
            </span>
          </div>
          <span className="shrink-0 text-[#E8D2B5]/90 tabular-nums">
            {progressPercent}% completed
          </span>
        </div>
      </div>

      {/* Cancel or Fallback hint (if provided) */}
      {onCancel && (
        <div className="flex justify-end pt-2 border-t border-[#A5A79B]/10">
          <button
            onClick={onCancel}
            className="text-xs font-mono text-[#A5A79B] hover:text-[#E8D2B5] transition-colors cursor-pointer"
          >
            Cancel inspection
          </button>
        </div>
      )}
    </div>
  );
}
