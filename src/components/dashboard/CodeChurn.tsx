'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { GitCommit, TrendingUp, TrendingDown } from 'lucide-react';
import type { ChurnMetrics } from '@/lib/github';
import { formatNumber } from '@/lib/metrics';

interface CodeChurnProps {
  metrics?: ChurnMetrics;
  churn?: ChurnMetrics;
  embedded?: boolean;
}

export default function CodeChurn({ metrics, churn, embedded = false }: CodeChurnProps) {
  const activeMetrics = metrics || churn || {
    additions: 0,
    deletions: 0,
    netChange: 0,
    churnRatio: 0,
    weeklyData: [],
  };

  const chartData = useMemo(() => {
    return (activeMetrics.weeklyData || []).map((w, index) => {
      const dateLabel = w.week || `Wk ${index + 1}`;
      return {
        date: dateLabel,
        additions: w.additions,
        deletions: w.deletions,
        net: w.additions - w.deletions,
      };
    });
  }, [activeMetrics.weeklyData]);

  const isNetPositive = activeMetrics.netChange >= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl p-3 sm:p-4 bg-[#120909]/95 border border-[#A5A79B]/25 shadow-2xl text-xs sm:text-sm font-sans backdrop-blur-xl">
          <p className="text-[#A5A79B] mb-1.5 font-semibold">{label}</p>
          <div className="space-y-1 font-mono">
            <p className="flex items-center justify-between gap-4 text-[#E8D2B5]">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-[#E8D2B5]" />
                Additions:
              </span>
              <strong className="text-[#E8D2B5]">+{payload[0]?.value?.toLocaleString()}</strong>
            </p>
            {payload[1] && (
              <p className="flex items-center justify-between gap-4 text-[#A5A79B]">
                <span className="flex items-center gap-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full bg-[#590907]" />
                  Deletions:
                </span>
                <strong className="text-[#A5A79B]">-{payload[1]?.value?.toLocaleString()}</strong>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const containerClasses = embedded
    ? 'space-y-5 sm:space-y-6 w-full flex flex-col justify-between'
    : 'w-full bg-[#180d0d]/85 backdrop-blur-xl border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl shadow-black/50 shadow-[inset_0_1px_0_rgba(232,210,181,0.08)] relative overflow-hidden flex flex-col justify-between gap-6';

  return (
    <div className={containerClasses}>
      {/* Subheader */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center shrink-0">
            <GitCommit size={17} />
          </div>
          <div>
            <span className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#A5A79B]/80 font-mono block">
              CODEBASE VOLATILITY
            </span>
            <h3 className="font-sans text-base sm:text-lg font-bold text-[#E8D2B5] tracking-tight mt-0.5">
              Code Churn & Velocity Trends
            </h3>
          </div>
        </div>

        {/* Net Change Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#120909] border border-[#A5A79B]/20 text-[#E8D2B5]">
          {isNetPositive ? <TrendingUp size={13} className="text-[#E8D2B5]" /> : <TrendingDown size={13} className="text-[#A5A79B]" />}
          <span>Net: {isNetPositive ? '+' : ''}{formatNumber(activeMetrics.netChange)} lines</span>
        </div>
      </div>

      {/* Top Stat Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full">
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between">
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-[#A5A79B]/80 block mb-0.5">
            TOTAL ADDITIONS
          </span>
          <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#E8D2B5] tabular-nums">
            +{formatNumber(activeMetrics.additions)}
          </span>
        </div>
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between">
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-[#A5A79B]/80 block mb-0.5">
            TOTAL DELETIONS
          </span>
          <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#A5A79B] tabular-nums">
            -{formatNumber(activeMetrics.deletions)}
          </span>
        </div>
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#120909] border border-[#A5A79B]/15 flex flex-col justify-between">
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-[#A5A79B]/80 block mb-0.5">
            CHURN RATIO
          </span>
          <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#E8D2B5] tabular-nums">
            {activeMetrics.churnRatio.toFixed(2)}x
          </span>
        </div>
      </div>

      {/* Recharts Area Plot (height={260} per spec) */}
      <div className="w-full h-[260px] pt-1">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="churnGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#590907" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#590907" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="deletionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A5A79B" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#A5A79B" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(165, 167, 155, 0.12)" />

            <XAxis
              dataKey="date"
              stroke="#A5A79B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#A5A79B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatNumber(val)}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="additions"
              stroke="#E8D2B5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#churnGradient)"
            />
            <Area
              type="monotone"
              dataKey="deletions"
              stroke="#A5A79B"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#deletionsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs font-sans text-[#A5A79B] border-t border-[#A5A79B]/15 pt-3">
        <span className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-[#E8D2B5]" /> Additions (Solid)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-[#A5A79B] border-t border-dashed" /> Deletions (Dashed)
        </span>
      </div>
    </div>
  );
}
