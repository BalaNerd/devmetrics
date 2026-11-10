'use client';

import { motion } from 'framer-motion';
import type { LanguageStats } from '@/lib/github';
import { Code2 } from 'lucide-react';

interface LanguageBarProps {
  languages?: LanguageStats;
  embedded?: boolean;
}

const PALETTE_COLORS = [
  '#E8D2B5', // Warm Cream Beige
  '#590907', // Deep Burgundy
  '#A5A79B', // Muted Sage Grey
  '#77110f', // Burgundy Light
  'rgba(232, 210, 181, 0.7)',
  'rgba(165, 167, 155, 0.7)',
  'rgba(89, 9, 7, 0.6)',
  '#2a1212',
];

export default function LanguageBar({ languages = {}, embedded = false }: LanguageBarProps) {
  const safeLanguages = languages || {};
  const total = Object.values(safeLanguages).reduce((s, v) => s + v, 0) || 1;
  const sorted = Object.entries(safeLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const containerClasses = embedded
    ? 'bg-[#120909] border border-[#A5A79B]/15 rounded-xl p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 w-full'
    : 'w-full bg-[#180d0d] border border-[#A5A79B]/15 rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/40 shadow-[inset_0_1px_0_rgba(232,210,181,0.08)] flex flex-col justify-between gap-5 sm:gap-6';

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center shrink-0">
            <Code2 size={17} />
          </div>
          <div>
            <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#A5A79B]/80 block">
              LANGUAGE DISTRIBUTION
            </span>
            <h3 className="font-sans text-base sm:text-lg font-bold text-[#E8D2B5] tracking-tight mt-0.5">
              Byte-Share Composition
            </h3>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#180d0d] border border-[#A5A79B]/20 text-[#E8D2B5]">
          {sorted.length} Languages
        </span>
      </div>

      {/* Multi-segment horizontal progress bar */}
      <div className="flex h-3.5 rounded-full overflow-hidden gap-0.5 bg-[#180d0d] p-0.5 border border-[#A5A79B]/20 w-full">
        {sorted.map(([lang, bytes], i) => {
          const pct = (bytes / total) * 100;
          if (pct < 0.5) return null;
          return (
            <motion.div
              key={lang}
              className="h-full rounded-sm"
              style={{ background: PALETTE_COLORS[i % PALETTE_COLORS.length] }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
              title={`${lang}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Language list with percentage badges */}
      <div className="flex flex-wrap gap-2 sm:gap-2.5 w-full">
        {sorted.map(([lang, bytes], i) => {
          const pct = (bytes / total) * 100;
          return (
            <div
              key={lang}
              className="flex-1 min-w-[140px] sm:min-w-[170px] flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#180d0d] border border-[#A5A79B]/15 text-xs font-sans"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: PALETTE_COLORS[i % PALETTE_COLORS.length] }}
                />
                <span className="text-[#E8D2B5] font-semibold truncate">{lang}</span>
              </div>
              <span className="text-[#A5A79B] font-mono font-bold tabular-nums shrink-0 ml-2">
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
