'use client';

import { Star, GitFork, Bug, Eye, Tag } from 'lucide-react';
import type { Repository, Release } from '@/lib/github';
import { formatNumber, formatRelativeTime, formatStarVelocity } from '@/lib/metrics';

interface StatsPillRowProps {
  repo: Repository;
  releases: Release[];
}

function MiniSparkline({ points, color }: { points: number[]; color: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points, min + 1);
  const width = 48;
  const height = 18;

  const polyPoints = points
    .map((val, idx) => {
      const x = (idx / Math.max(points.length - 1, 1)) * width;
      const y = height - ((val - min) / (max - min)) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible opacity-80">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polyPoints}
      />
    </svg>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  sub?: string;
  badge: string;
  badgeClass: string;
  sparklineColor: string;
  sparklineData: number[];
  iconBg: string;
  iconColor: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  badge,
  badgeClass,
  sparklineColor,
  sparklineData,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="glass-card p-3.5 flex flex-col justify-between gap-3 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-lg border"
            style={{
              background: iconBg,
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <Icon size={13} style={{ color: iconColor }} />
          </div>
          <span className="type-kicker text-[10px]">
            {label}
          </span>
        </div>
        <span className={`badge ${badgeClass} text-[9px] py-0 px-1.5`}>
          {badge}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xl sm:text-2xl font-mono font-bold text-[#0C1222] tracking-tight">
            {value}
          </p>
          {sub && <p className="text-[10px] font-mono text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className="pb-1">
          <MiniSparkline points={sparklineData} color={sparklineColor} />
        </div>
      </div>
    </div>
  );
}

export default function StatsPillRow({ repo, releases }: StatsPillRowProps) {
  const starVel = formatStarVelocity(repo.stargazers_count, repo.created_at);
  const latestRelease = releases.find((r) => !r.draft && !r.prerelease);

  const isHighIssues = repo.open_issues_count > 500;
  const issueBadge = isHighIssues ? 'Triage Req' : 'Healthy';
  const issueBadgeClass = isHighIssues ? 'badge-rose' : 'badge-emerald';

  const anchorTime = repo.pushed_at ? new Date(repo.pushed_at).getTime() : 1731300000000;
  const releaseAgeDays = latestRelease
    ? Math.max(0, Math.floor((anchorTime - new Date(latestRelease.published_at).getTime()) / 86400000))
    : 999;
  const isReleaseFresh = releaseAgeDays <= 45;
  const releaseBadge = latestRelease ? (isReleaseFresh ? 'Active' : 'Stale') : 'No Tag';
  const releaseBadgeClass = isReleaseFresh ? 'badge-indigo' : 'badge-muted';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {/* Stars */}
      <StatCard
        icon={Star}
        label="Stars"
        value={formatNumber(repo.stargazers_count)}
        sub={`~${formatNumber(starVel.perMonth)} / mo`}
        badge={`+${starVel.perDay}/d`}
        badgeClass="badge-amber"
        sparklineColor="#fbbf24"
        sparklineData={[12, 18, 22, 28, 35, 42, 58]}
        iconBg="rgba(245, 158, 11, 0.15)"
        iconColor="#fbbf24"
      />

      {/* Forks */}
      <StatCard
        icon={GitFork}
        label="Forks"
        value={formatNumber(repo.forks_count)}
        sub={`${((repo.forks_count / Math.max(repo.stargazers_count, 1)) * 100).toFixed(0)}% ratio`}
        badge="Ecosystem"
        badgeClass="badge-indigo"
        sparklineColor="#818cf8"
        sparklineData={[10, 14, 16, 21, 25, 30, 36]}
        iconBg="rgba(99, 102, 241, 0.15)"
        iconColor="#818cf8"
      />

      {/* Issues */}
      <StatCard
        icon={Bug}
        label="Issues"
        value={formatNumber(repo.open_issues_count)}
        sub="Open tickets"
        badge={issueBadge}
        badgeClass={issueBadgeClass}
        sparklineColor={isHighIssues ? '#f43f5e' : '#10b981'}
        sparklineData={[30, 28, 29, 32, 26, 25, 22]}
        iconBg={isHighIssues ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)'}
        iconColor={isHighIssues ? '#fb7185' : '#34d399'}
      />

      {/* Watchers */}
      <StatCard
        icon={Eye}
        label="Watchers"
        value={formatNumber(repo.subscribers_count)}
        sub="Subscribed devs"
        badge="Monitored"
        badgeClass="badge-emerald"
        sparklineColor="#34d399"
        sparklineData={[5, 8, 9, 12, 14, 15, 17]}
        iconBg="rgba(16, 185, 129, 0.15)"
        iconColor="#34d399"
      />

      {/* Latest Release */}
      <StatCard
        icon={Tag}
        label="Release"
        value={latestRelease ? latestRelease.tag_name : 'None'}
        sub={latestRelease ? formatRelativeTime(latestRelease.published_at) : 'No tagged release'}
        badge={releaseBadge}
        badgeClass={releaseBadgeClass}
        sparklineColor={isReleaseFresh ? '#c084fc' : '#64748b'}
        sparklineData={[1, 2, 2, 3, 3, 4, 5]}
        iconBg="rgba(168, 85, 247, 0.15)"
        iconColor="#c084fc"
      />
    </div>
  );
}
