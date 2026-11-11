'use client';

import { motion } from 'framer-motion';
import { Star, GitFork, AlertCircle, Eye, Tag, ExternalLink, Share2, Archive, GitCompare } from 'lucide-react';
import type { Repository } from '@/lib/github';
import { formatNumber, formatRelativeTime } from '@/lib/metrics';
import { useAppStore } from '@/store/useAppStore';
import Image from 'next/image';

interface RepoHeaderProps {
  repo: Repository;
}

export default function RepoHeader({ repo }: RepoHeaderProps) {
  const { setBadgeModalOpen, setComparisonModalOpen } = useAppStore();

  const statCards = [
    { label: 'STARS', value: formatNumber(repo.stargazers_count), icon: Star },
    { label: 'FORKS', value: formatNumber(repo.forks_count), icon: GitFork },
    { label: 'OPEN ISSUES', value: formatNumber(repo.open_issues_count), icon: AlertCircle },
    { label: 'WATCHERS', value: formatNumber(repo.watchers_count), icon: Eye },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full bg-[#180d0d]/85 backdrop-blur-xl border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl shadow-black/50 shadow-[inset_0_1px_0_rgba(232,210,181,0.08)] relative overflow-hidden flex flex-col gap-6"
    >
      {/* Subtle Ambient Backlight Glow */}
      <div
        className="bg-[#590907]/20 blur-3xl rounded-full absolute -top-8 -right-8 w-40 h-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Section: Avatar, Title, Badges, and Action Buttons */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
          {/* Avatar */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-[#A5A79B]/20 bg-[#120909] shadow-md">
            <Image
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 56px, 64px"
              priority
            />
          </div>

          {/* Repo Info */}
          <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#E8D2B5] font-sans break-words tracking-tight leading-snug">
                <span className="text-[#A5A79B]/80 font-normal">{repo.owner.login}</span>
                <span className="text-[#590907] mx-1.5 font-mono font-light">/</span>
                <span>{repo.name}</span>
              </h1>

              {/* License Pill */}
              {repo.license ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#120909] border border-[#A5A79B]/20 text-[#E8D2B5]">
                  <Tag size={11} className="text-[#A5A79B]" />
                  {repo.license.spdx_id || repo.license.name}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#590907]/30 border border-[#590907] text-[#E8D2B5]">
                  No License
                </span>
              )}

              {repo.archived && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#590907] text-[#E8D2B5]">
                  <Archive size={11} /> Archived
                </span>
              )}
            </div>

            {/* Subline: Language & Recency */}
            <div className="flex items-center gap-3 text-xs font-mono text-[#A5A79B] flex-wrap">
              {repo.language && (
                <span className="flex items-center gap-1.5 text-[#E8D2B5] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#E8D2B5] shadow-[0_0_6px_rgba(232,210,181,0.6)]" />
                  {repo.language}
                </span>
              )}
              <span className="text-[#A5A79B]/40">•</span>
              <span suppressHydrationWarning>Updated {formatRelativeTime(repo.pushed_at)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Touch Friendly: min-h-[44px]) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-stretch sm:self-auto flex-wrap">
          <button
            onClick={() => setComparisonModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-mono font-semibold bg-[#120909] hover:bg-[#180d0d] text-[#E8D2B5] border border-[#A5A79B]/25 hover:border-[#590907] transition-all duration-200 ease-out shadow-sm cursor-pointer shrink-0 active:scale-95"
          >
            <GitCompare size={13} className="text-[#E8D2B5]" />
            <span>Compare</span>
          </button>
          <button
            onClick={() => setBadgeModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-mono font-semibold bg-[#590907] hover:bg-[#77110f] text-[#E8D2B5] border border-[#590907] transition-all duration-200 ease-out shadow-md cursor-pointer shrink-0 active:scale-95"
          >
            <Share2 size={13} />
            <span>Shields Badge</span>
          </button>
          <a
            href={`https://github.com/${repo.full_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-mono bg-[#120909] text-[#A5A79B] border border-[#A5A79B]/20 hover:text-[#E8D2B5] hover:border-[#590907] transition-all duration-200 ease-out shrink-0 active:scale-95"
          >
            <ExternalLink size={13} />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="font-sans text-xs sm:text-sm text-[#A5A79B] leading-relaxed break-words relative z-10">
          {repo.description}
        </p>
      )}

      {/* Responsive Stats Strip: 2x2 Grid on Mobile (< 640px), Horizontal Flex Strip on Tablet/Desktop */}
      <div className="relative z-10 grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#A5A79B]/15">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#120909] border border-[#A5A79B]/15 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between gap-1 flex-1 min-w-0"
            >
              <span className="font-mono text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-[#A5A79B]/80 flex items-center gap-1.5 truncate">
                <Icon size={12} className="text-[#A5A79B] shrink-0" />
                <span className="truncate">{stat.label}</span>
              </span>
              <span className="font-mono text-xl sm:text-2xl md:text-3xl font-extrabold text-[#E8D2B5] tracking-tight tabular-nums">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
