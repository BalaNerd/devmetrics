'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Badge } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { RepoData } from '@/lib/github';
import { calculateHealthGrade } from '@/lib/metrics';

interface BadgeGeneratorProps {
  data: RepoData;
}

type BadgeStyle = 'flat-square' | 'flat' | 'for-the-badge' | 'plastic';

const COLOR_OPTIONS = [
  { label: 'Deep Burgundy', hex: '590907' },
  { label: 'Warm Cream', hex: 'e8d2b5' },
  { label: 'Muted Sage', hex: 'a5a79b' },
  { label: 'Obsidian Night', hex: '180d0d' },
];

export default function BadgeGenerator({ data }: BadgeGeneratorProps) {
  const { badgeModalOpen, setBadgeModalOpen, setToast } = useAppStore();
  const [badgeStyle, setBadgeStyle] = useState<BadgeStyle>('flat-square');
  const [badgeColor, setBadgeColor] = useState('590907');
  const [customLabel, setCustomLabel] = useState('DevMetrics Velocity');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const { grade } = calculateHealthGrade(data.health);
  const velocity = data.velocity.score;
  const repo = data.repo.full_name;

  const encodedLabel = encodeURIComponent(customLabel || 'DevMetrics Velocity');
  const badgeUrl = `https://img.shields.io/badge/${encodedLabel}-${velocity}%2F100-${badgeColor}?style=${badgeStyle}&logo=github&logoColor=fff&labelColor=180d0d`;
  const healthBadgeUrl = `https://img.shields.io/badge/Health-${grade}-${badgeColor}?style=${badgeStyle}&color=${badgeColor}&labelColor=180d0d`;

  const markdown = `[![${customLabel}](${badgeUrl})](https://github.com/${repo}) [![Health](${healthBadgeUrl})](https://github.com/${repo})`;
  const html = `<a href="https://github.com/${repo}"><img src="${badgeUrl}" alt="${customLabel}" /></a> <a href="https://github.com/${repo}"><img src="${healthBadgeUrl}" alt="Health" /></a>`;

  const copy = (text: string, type: 'md' | 'html') => {
    navigator.clipboard.writeText(text);
    if (type === 'md') {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } else {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    }
    setToast({
      message: `Shields.io ${type.toUpperCase()} badge code copied!`,
      type: 'success',
    });
  };

  return (
    <AnimatePresence>
      {badgeModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0C1222]/50 backdrop-blur-md"
            onClick={() => setBadgeModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-xl rounded-2xl border border-[#5C6A80]/20 bg-[#FFFFFF] shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto"
              style={{
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(12, 18, 34, 0.08)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#5C6A80]/15 bg-[#F7F8FC]/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF1FF] border border-[#3D4FE0] flex items-center justify-center">
                    <Badge size={16} className="text-[#0C1222]" />
                  </div>
                  <span className="text-sm font-bold text-[#0C1222] font-heading">
                    Shields.io Badge Customizer
                  </span>
                </div>
                <button
                  onClick={() => setBadgeModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#5C6A80] hover:text-[#0C1222] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Live Preview */}
                <div>
                  <p className="type-kicker text-[10px] mb-2 text-[#5C6A80]">
                    LIVE DYNAMIC SHIELDS PREVIEW
                  </p>
                  <div className="rounded-xl bg-[#F7F8FC] border border-[#5C6A80]/15 p-5 flex flex-wrap items-center gap-3 justify-center min-h-[64px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={badgeUrl} alt="DevMetrics Velocity" className="max-h-7" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={healthBadgeUrl} alt="Health" className="max-h-7" />
                  </div>
                </div>

                {/* Customizer Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#0C1222] block mb-1.5 font-heading">
                      Badge Style
                    </label>
                    <select
                      value={badgeStyle}
                      onChange={(e) => setBadgeStyle(e.target.value as BadgeStyle)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F8FC] border border-[#5C6A80]/20 font-mono text-xs text-[#0C1222] focus:outline-none focus:border-[#3D4FE0]"
                    >
                      <option value="flat-square">Flat Square (Modern Terminal)</option>
                      <option value="flat">Flat (Standard Shields)</option>
                      <option value="for-the-badge">For The Badge (Uppercase Large)</option>
                      <option value="plastic">Plastic (Classic Rounded)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#0C1222] block mb-1.5 font-heading">
                      Custom Label
                    </label>
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="DevMetrics Velocity"
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F8FC] border border-[#5C6A80]/20 font-mono text-xs text-[#0C1222] focus:outline-none focus:border-[#3D4FE0]"
                    />
                  </div>
                </div>

                {/* Color Palette Selector */}
                <div>
                  <label className="text-xs font-semibold text-[#0C1222] block mb-1.5 font-heading">
                    Accent Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setBadgeColor(c.hex)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                          badgeColor === c.hex
                            ? 'border-[#3D4FE0] bg-[#3D4FE0] text-white font-semibold'
                            : 'border-[#5C6A80]/20 bg-[#F7F8FC] text-[#5C6A80] hover:text-[#0C1222]'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ background: `#${c.hex}` }}
                        />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Markdown snippet */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-[#5C6A80]">Markdown</span>
                    <button
                      onClick={() => copy(markdown, 'md')}
                      className="flex items-center gap-1 text-xs font-mono text-[#0C1222] hover:text-[#0C1222]/80 transition-colors"
                    >
                      {copiedMd ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedMd ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-[#0F172A] border border-[#94A3B8]/15 text-[11px] font-mono text-[#E8EEF9] overflow-x-auto whitespace-pre-wrap break-all">
                    {markdown}
                  </pre>
                </div>

                {/* HTML snippet */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-[#5C6A80]">HTML</span>
                    <button
                      onClick={() => copy(html, 'html')}
                      className="flex items-center gap-1 text-xs font-mono text-[#0C1222] hover:text-[#0C1222]/80 transition-colors"
                    >
                      {copiedHtml ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedHtml ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-[#0F172A] border border-[#94A3B8]/15 text-[11px] font-mono text-[#E8EEF9] overflow-x-auto whitespace-pre-wrap break-all">
                    {html}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
