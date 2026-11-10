'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { fetchRecentClosedIssues, IssueEntry } from '@/lib/github';

interface ResponseTimeTrackerProps {
  owner: string;
  repo: string;
}

export default function ResponseTimeTracker({ owner, repo }: ResponseTimeTrackerProps) {
  const { audienceMode, githubToken } = useAppStore();
  const isPlain = audienceMode === 'plain';

  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<IssueEntry[]>([]);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    fetchRecentClosedIssues(owner, repo, githubToken)
      .then((data) => {
        if (!isCancelled) {
          setIssues(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setIssues([]);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [owner, repo, githubToken]);

  const resolutionDays = issues
    .filter((issue) => issue.closed_at)
    .map((issue) => {
      const created = new Date(issue.created_at).getTime();
      const closed = new Date(issue.closed_at!).getTime();
      return Math.max(0.1, (closed - created) / (1000 * 60 * 60 * 24));
    })
    .sort((a, b) => a - b);

  const medianDays =
    resolutionDays.length > 0
      ? resolutionDays[Math.floor(resolutionDays.length / 2)]
      : 0;

  const closedFast = resolutionDays.filter((d) => d <= 2).length;
  const closedSlow = resolutionDays.filter((d) => d > 7).length;

  const grade =
    medianDays === 0
      ? 'N/A'
      : medianDays <= 2
      ? 'A+'
      : medianDays <= 5
      ? 'A'
      : medianDays <= 14
      ? 'B'
      : medianDays <= 30
      ? 'C'
      : 'D';

  if (loading) {
    return (
      <div className="glass-card p-6 sm:p-8 animate-pulse space-y-4">
        <div className="h-5 w-48 bg-[#0C1222]/20 rounded-xl" />
        <div className="h-20 bg-[#F7F8FC] rounded-2xl border border-[#5C6A80]/15" />
      </div>
    );
  }

  return (
    <div className="glass-card p-8 relative overflow-hidden flex flex-col justify-between gap-6 h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3D4FE0] to-[#2A38B8] border border-[#0C1222]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(61,79,224,0.4)]">
            <Clock size={18} className="text-[#0C1222]" />
          </div>
          <div>
            <p className="type-kicker text-xs font-semibold tracking-wider text-[#5C6A80]/80">
              {isPlain ? 'COMMUNITY RESPONSE SLA' : 'ISSUE RESOLUTION SLA'}
            </p>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#0C1222] mt-0.5">
              Turnaround Speed & Maintenance SLA
            </h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono glass-subcard text-[#0C1222]">
          <span className="font-black text-base gradient-text">{grade}</span>
          <span className="text-[#5C6A80] font-sans">Speed Grade</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl glass-subcard flex flex-col justify-between space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-[#5C6A80]">
            {isPlain ? 'Typical Resolution' : 'Median Turnaround'}
          </p>
          <p className="text-2xl sm:text-3xl font-mono font-black gradient-text">
            {medianDays ? `${medianDays.toFixed(1)}d` : 'N/A'}
          </p>
          <p className="text-xs text-[#5C6A80]/80 font-sans leading-normal">
            Creation to closed state
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-subcard flex flex-col justify-between space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-[#5C6A80]">
            {isPlain ? 'Fast Fixes (≤ 48 hrs)' : 'Triage Rate (≤ 48h)'}
          </p>
          <p className="text-2xl sm:text-3xl font-mono font-black gradient-text">
            {closedFast}
            <span className="text-xs font-normal text-[#5C6A80] ml-1.5">
              ({issues.length ? Math.round((closedFast / issues.length) * 100) : 0}%)
            </span>
          </p>
          <p className="text-xs text-[#5C6A80]/80 font-sans leading-normal">
            Shipped within 48 hours
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-subcard flex flex-col justify-between space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-[#5C6A80]">
            {isPlain ? 'Stalled (> 7 days)' : 'Long-tail (> 7d)'}
          </p>
          <p className="text-2xl sm:text-3xl font-mono font-black text-[#5C6A80]">
            {closedSlow}
            <span className="text-xs font-normal text-[#5C6A80]/80 ml-1.5">
              ({issues.length ? Math.round((closedSlow / issues.length) * 100) : 0}%)
            </span>
          </p>
          <p className="text-xs text-[#5C6A80]/80 font-sans leading-normal">
            Complex refactors or backlog
          </p>
        </div>
      </div>
    </div>
  );
}
