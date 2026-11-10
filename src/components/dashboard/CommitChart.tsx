'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CommitActivity } from '@/lib/github';
import { useState } from 'react';
import { Activity } from 'lucide-react';

interface CommitChartProps {
  activity: CommitActivity[];
}

type ChartMode = 'area' | 'bar';

export default function CommitChart({ activity }: CommitChartProps) {
  const [mode, setMode] = useState<ChartMode>('area');

  const data = activity.slice(-16).map((w) => ({
    week: new Date(w.week * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    commits: w.total,
  }));

  const totalCommits = data.reduce((sum, item) => sum + item.commits, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-xl p-3 bg-[#FFFFFF] border border-[#5C6A80]/25 shadow-xl text-xs font-mono">
          <p className="text-[#5C6A80] mb-1">{label}</p>
          <p className="font-mono font-bold text-[#0C1222] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0C1222]" />
            <span className="text-sm text-[#0C1222]">{payload[0].value}</span>
            <span className="text-[#5C6A80] font-normal">commits</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EEF1FF] border border-[#3D4FE0] flex items-center justify-center">
            <Activity size={16} className="text-[#0C1222]" />
          </div>
          <div>
            <p className="type-kicker text-[10px]">VELOCITY CADENCE</p>
            <h3 className="font-heading text-base font-bold text-[#0C1222]">
              16-Week Commit Trend ({totalCommits} total)
            </h3>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center p-1 rounded-xl bg-[#F7F8FC] border border-[#5C6A80]/15">
          {(['area', 'bar'] as ChartMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                mode === m
                  ? 'bg-[#3D4FE0] text-white font-semibold'
                  : 'text-[#5C6A80] hover:text-[#0C1222]'
              }`}
            >
              {m === 'area' ? 'Area' : 'Bar'}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3D4FE0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3D4FE0" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(92, 106, 128, 0.1)" />
              <XAxis dataKey="week" stroke="#5C6A80" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#5C6A80" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="commits"
                stroke="#0C1222"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#velocityGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(92, 106, 128, 0.1)" />
              <XAxis dataKey="week" stroke="#5C6A80" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#5C6A80" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="commits" fill="#3D4FE0" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
