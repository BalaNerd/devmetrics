'use client';

import { motion } from 'framer-motion';
import { Users, ExternalLink } from 'lucide-react';
import type { Contributor } from '@/lib/github';
import { formatNumber } from '@/lib/metrics';
import Image from 'next/image';

interface ContributorChartProps {
  contributors: Contributor[];
}

export default function ContributorChart({ contributors }: ContributorChartProps) {
  const top = contributors.slice(0, 8);
  const max = top[0]?.contributions ?? 1;
  const total = contributors.reduce((s, c) => s + c.contributions, 0) || 1;

  return (
    <div className="glass-card p-6 sm:p-8 flex flex-col justify-between gap-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EEF1FF] border border-[#3D4FE0]/60 flex items-center justify-center shrink-0">
            <Users size={20} className="text-[#0C1222]" />
          </div>
          <div>
            <p className="type-kicker text-xs font-semibold tracking-wider text-[#5C6A80]/80">CONTRIBUTOR MATRIX</p>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#0C1222] mt-0.5">
              Top Contributors by Commit Share
            </h3>
          </div>
        </div>
        <span className="badge badge-burgundy text-xs px-3 py-1 font-mono">
          {contributors.length} Total Contributors
        </span>
      </div>

      <div className="space-y-3">
        {top.map((contributor, i) => {
          const pct = (contributor.contributions / total) * 100;
          const barWidth = (contributor.contributions / max) * 100;

          return (
            <div
              key={contributor.login}
              className="p-3 sm:p-3.5 rounded-2xl bg-[#F7F8FC] border border-[#5C6A80]/20 hover:border-[#3D4FE0] transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-semibold text-[#5C6A80] w-4 text-right">
                    {i + 1}
                  </span>
                  <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#5C6A80]/25">
                    <Image
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      fill
                      className="object-cover"
                      sizes="28px"
                    />
                  </div>
                  <a
                    href={`https://github.com/${contributor.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs sm:text-sm text-[#0C1222] hover:underline truncate font-semibold"
                  >
                    {contributor.login}
                  </a>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-[#5C6A80] shrink-0">
                  <span className="font-bold text-[#0C1222]">
                    {formatNumber(contributor.contributions)}
                  </span>
                  <span>({pct.toFixed(1)}%)</span>
                </div>
              </div>

              <div className="w-full h-2 rounded-full overflow-hidden bg-[#FFFFFF]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="h-full bg-[#0C1222]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
