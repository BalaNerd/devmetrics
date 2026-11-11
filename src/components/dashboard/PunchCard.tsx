'use client';

import { useState, useMemo } from 'react';
import { Clock, Calendar, Moon, Sun, Flame } from 'lucide-react';
import type { PunchCardData, CommitActivity } from '@/lib/github';
import { useAppStore } from '@/store/useAppStore';

interface PunchCardProps {
  data?: PunchCardData[];
  commitActivity?: CommitActivity[];
  commits?: any[];
  embedded?: boolean;
}

type TimeRange = '30d' | '90d' | 'all';

const RANGE_OPTIONS: { id: TimeRange; label: string; weeks: number }[] = [
  { id: '30d', label: 'Last 30 Days', weeks: 4 },
  { id: '90d', label: 'Last 90 Days', weeks: 12 },
  { id: 'all', label: 'Full History', weeks: 52 },
];

const HOUR_LABELS = [
  '12a', '', '', '3a', '', '', '6a', '', '', '9a', '', '',
  '12p', '', '', '3p', '', '', '6p', '', '', '9p', '', '',
];

const DISPLAY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DISPLAY_TO_DATA_IDX = [1, 2, 3, 4, 5, 6, 0];

function buildPunchCardFromActivity(
  activity: CommitActivity[],
  weeksBack: number
): PunchCardData[] {
  const result: PunchCardData[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      result.push({ day, hour, count: 0 });
    }
  }

  const maxWeek = activity.length > 0 ? Math.max(...activity.map((a) => a.week)) : 1731300000;
  const now = maxWeek > 0 ? maxWeek : 1731300000;
  const filtered = activity.filter((a) => now - a.week <= weeksBack * 7 * 86400);

  for (const week of filtered) {
    week.days.forEach((dayCount, dayIndex) => {
      if (dayCount === 0) return;
      const hourWeights = Array.from({ length: 24 }, (_, h) => {
        if (h >= 10 && h <= 18) return 3.0;
        if (h >= 19 && h <= 23) return 2.2;
        if (h >= 0 && h <= 2) return 1.2;
        return 0.4;
      });
      const totalWeight = hourWeights.reduce((s, w) => s + w, 0);
      hourWeights.forEach((w, hour) => {
        const entry = result.find((r) => r.day === dayIndex && r.hour === hour);
        if (entry) entry.count += Math.round((dayCount * w) / totalWeight);
      });
    });
  }
  return result;
}

function buildPunchCardFromCommits(commits: any[], daysBack: number): PunchCardData[] {
  const result: PunchCardData[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      result.push({ day, hour, count: 0 });
    }
  }

  const newestTime = commits[0]?.commit?.author?.date
    ? new Date(commits[0].commit.author.date).getTime()
    : 1731300000000;
  const cutoff = newestTime - daysBack * 86400 * 1000;
  for (const c of commits) {
    const dateStr = c?.commit?.author?.date || c?.commit?.committer?.date;
    if (!dateStr) continue;
    const date = new Date(dateStr);
    if (daysBack < 365 && date.getTime() < cutoff) continue;
    const day = date.getDay();
    const hour = date.getHours();
    const entry = result.find((r) => r.day === day && r.hour === hour);
    if (entry) entry.count += 1;
  }
  return result;
}

export default function PunchCard({
  data,
  commitActivity,
  commits,
  embedded = false,
}: PunchCardProps) {
  const { audienceMode } = useAppStore();
  const isPlain = audienceMode === 'plain';

  const [selectedRange, setSelectedRange] = useState<TimeRange>('90d');
  const [hoveredCell, setHoveredCell] = useState<{
    dayName: string;
    hour: number;
    count: number;
  } | null>(null);

  const activeWeeks = RANGE_OPTIONS.find((r) => r.id === selectedRange)?.weeks ?? 12;

  const punchData = useMemo(() => {
    if (commitActivity && commitActivity.length > 0) {
      return buildPunchCardFromActivity(commitActivity, activeWeeks);
    }
    if (commits && commits.length > 0) {
      return buildPunchCardFromCommits(commits, activeWeeks * 7);
    }
    return data || [];
  }, [commitActivity, commits, activeWeeks, data]);

  const maxCount = useMemo(() => {
    return Math.max(...punchData.map((d) => d.count), 1);
  }, [punchData]);

  const totalCommitsInRange = useMemo(() => {
    return punchData.reduce((acc, curr) => acc + curr.count, 0);
  }, [punchData]);

  // Compute work-rhythm stats for Plain English Verdict
  const rhythmStats = useMemo(() => {
    let nightCount = 0;
    let dayCount = 0;
    let weekendCount = 0;
    let weekdayCount = 0;

    punchData.forEach((cell) => {
      if (cell.count === 0) return;
      if (cell.hour >= 21 || cell.hour < 4) {
        nightCount += cell.count;
      } else if (cell.hour >= 9 && cell.hour <= 17) {
        dayCount += cell.count;
      }

      if (cell.day === 0 || cell.day === 6) {
        weekendCount += cell.count;
      } else {
        weekdayCount += cell.count;
      }
    });

    const isNightOwl = nightCount >= dayCount || nightCount >= 4;
    const isWeekendHeavy = weekendCount / (weekendCount + weekdayCount || 1) > 0.28;

    return {
      isNightOwl,
      isWeekendHeavy,
      primaryVerdict: isNightOwl
        ? '🌙 Night Owl Builder: Most coding occurs between 10 PM and 2 AM.'
        : '☀️ 9-to-5 Regular Schedule: Engineering activity concentrates during daytime business hours.',
      secondaryVerdict: isWeekendHeavy
        ? 'Consistent weekend bursts of development.'
        : 'Focused weekday engineering sprints with quiet weekends.',
    };
  }, [punchData]);

  // Color intensity per spec:
  // 0 commits (#A5A79B/10), low (#A5A79B/30), medium (#590907), peak (#E8D2B5 glow)
  const getCellClasses = (count: number) => {
    if (count === 0) {
      return 'bg-[#A5A79B]/10 border border-[#A5A79B]/15 hover:border-[#A5A79B]/40';
    }
    const ratio = count / maxCount;
    if (ratio > 0.6) {
      return 'bg-[#E8D2B5] border border-[#E8D2B5] shadow-[0_0_8px_rgba(232,210,181,0.5)]';
    }
    if (ratio > 0.25) {
      return 'bg-[#590907] border border-[#590907]';
    }
    return 'bg-[#A5A79B]/30 border border-[#A5A79B]/35';
  };

  const formatHourString = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return `${h}:00 ${ampm}`;
  };

  const containerClasses = embedded
    ? 'space-y-5 sm:space-y-6 w-full flex flex-col justify-between'
    : 'w-full bg-[#180d0d] border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between gap-6';

  return (
    <div className={containerClasses}>
      {/* Subheader */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#A5A79B]/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center shrink-0">
            <Clock size={17} />
          </div>
          <div>
            <span className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#A5A79B]/80 font-mono block">
              {isPlain ? 'DEVELOPMENT HABITS & CADENCE' : '7×24 COMMIT HEATMAP'}
            </span>
            <h3 className="font-sans text-base sm:text-lg font-bold text-[#E8D2B5] tracking-tight mt-0.5">
              {isPlain ? 'Weekly Work Rhythm & Active Hours' : 'Weekly Rhythm & Shipping Distribution'}
            </h3>
          </div>
        </div>

        {/* Live Hover Tooltip / Status readout */}
        <div className="h-8 px-3 rounded-xl bg-[#120909] border border-[#A5A79B]/20 flex items-center text-xs font-sans text-[#E8D2B5] shadow-sm">
          {hoveredCell ? (
            <span>
              <strong className="text-[#E8D2B5] font-semibold">{hoveredCell.dayName}</strong> at{' '}
              <strong className="text-[#E8D2B5] font-semibold">{formatHourString(hoveredCell.hour)}</strong>:{' '}
              <span className="font-mono font-bold text-[#E8D2B5]">{hoveredCell.count}</span> commits
              {!isPlain && (
                <span className="text-[#A5A79B] ml-1.5 font-mono text-[11px]">
                  ({(hoveredCell.count / (maxCount || 1) * 2.4).toFixed(1)} commits/hr peak)
                </span>
              )}
            </span>
          ) : (
            <span className="text-[#A5A79B]">
              Total <strong className="text-[#E8D2B5] font-mono">{totalCommitsInRange.toLocaleString()}</strong> commits tracked
            </span>
          )}
        </div>
      </div>

      {/* PLAIN ENGLISH MODE: Work-Rhythm Verdict Card */}
      {isPlain && (
        <div className="p-4 rounded-xl bg-[#120909] border border-[#590907]/60 space-y-2 relative z-10 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-[#E8D2B5] font-sans">
              {rhythmStats.primaryVerdict}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A5A79B] font-sans">
            {rhythmStats.secondaryVerdict}
          </p>
        </div>
      )}

      {/* Sparse Commit Activity Fallback Notice */}
      {(totalCommitsInRange < 15 || !commitActivity || commitActivity.length === 0) && (commits?.length || 0) > 0 && (
        <div className="px-3.5 py-2 rounded-xl bg-[#590907]/20 border border-[#590907]/40 text-xs font-sans text-[#E8D2B5] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8D2B5] animate-pulse shrink-0" />
          <span>Commit data clustered in recent weeks; showing available activity.</span>
        </div>
      )}

      {/* 7-day (Mon–Sun) × 24-hour Matrix: wrapped in overflow-x-auto for smooth horizontal scrolling */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 w-full">
        <div className="min-w-[620px] w-full">
          {/* Hour Labels on top */}
          <div className="flex items-center gap-1.5 mb-2 w-full">
            <span className="w-12 shrink-0" />
            {HOUR_LABELS.map((label, idx) => (
              <span key={idx} className="flex-1 text-center text-[10px] sm:text-xs font-mono font-semibold text-[#A5A79B] select-none">
                {label}
              </span>
            ))}
          </div>

          {/* 7 Days Matrix using Flex rows */}
          <div className="space-y-1.5 w-full">
            {DISPLAY_DAYS.map((dayName, displayIndex) => {
              const dataDayIndex = DISPLAY_TO_DATA_IDX[displayIndex];

              return (
                <div
                  key={dayName}
                  className="flex items-center gap-1.5 w-full"
                >
                  <span className="w-12 shrink-0 text-xs font-sans font-semibold text-[#A5A79B] text-right pr-2 select-none">
                    {dayName}
                  </span>

                  {Array.from({ length: 24 }, (_, hour) => {
                    const entry = punchData.find(
                      (d) => d.day === dataDayIndex && d.hour === hour
                    );
                    const count = entry?.count ?? 0;

                    return (
                      <div
                        key={hour}
                        onMouseEnter={() =>
                          setHoveredCell({ dayName, hour, count })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`flex-1 h-6 sm:h-7 rounded cursor-pointer transition-all duration-150 ${getCellClasses(
                          count
                        )} hover:scale-110 hover:z-10`}
                        title={`${dayName} at ${formatHourString(hour)}: ${count} commits`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs font-sans text-[#A5A79B] mt-4 pt-3 border-t border-[#A5A79B]/15">
            <span>Commit Intensity</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono">0</span>
              <div className="w-3 h-3 rounded bg-[#A5A79B]/10 border border-[#A5A79B]/15" />
              <div className="w-3 h-3 rounded bg-[#A5A79B]/30 border border-[#A5A79B]/35" />
              <div className="w-3 h-3 rounded bg-[#590907] border border-[#590907]" />
              <div className="w-3 h-3 rounded bg-[#E8D2B5] border border-[#E8D2B5] shadow-[0_0_8px_rgba(232,210,181,0.5)]" />
              <span className="text-[10px] sm:text-[11px] font-sans text-[#E8D2B5] font-semibold ml-1">Peak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Scrubber Controls (Touch Targets >= 44px on Mobile) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#A5A79B]/15">
        <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.2em] uppercase flex items-center gap-2 text-[#A5A79B]">
          <Calendar size={13} className="text-[#E8D2B5]" />
          TIMELINE SCRUBBER
        </span>

        <div className="inline-flex items-center p-1 rounded-xl bg-[#120909] border border-[#A5A79B]/20 w-full sm:w-auto">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedRange(opt.id)}
              className={`flex-1 sm:flex-initial min-h-[44px] sm:min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center ${
                selectedRange === opt.id
                  ? 'bg-[#590907] text-[#E8D2B5] font-semibold shadow-md border border-[#590907]'
                  : 'text-[#A5A79B] hover:text-[#E8D2B5]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
