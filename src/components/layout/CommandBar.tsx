'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Zap, Clock, Star, Trash2, Loader2, Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRepo } from '@/hooks/useRepo';
import { useLiveAudit } from '@/hooks/useLiveAudit';
import { PRESET_REPOS, PRESET_LIVE_URLS } from '@/lib/constants';
import { searchGitHubRepos, type RepoSearchResult } from '@/lib/github';
import { classifyInput } from '@/lib/urlRouter';

export default function CommandBar() {
  const {
    commandBarOpen,
    commandQuery,
    setCommandBarOpen,
    setCommandQuery,
    setCurrentRepo,
    recentSearches,
    clearRecentSearches,
    githubToken,
  } = useAppStore();
  const { fetchRepo } = useRepo();
  const { auditUrl } = useLiveAudit();
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchResults, setSearchResults] = useState<RepoSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea';

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen(!commandBarOpen);
      } else if (e.key === '/' && !commandBarOpen && !isInputFocused) {
        e.preventDefault();
        setCommandBarOpen(true);
      }

      if (e.key === 'Escape' && commandBarOpen) {
        setCommandBarOpen(false);
        setCommandQuery('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [commandBarOpen, setCommandBarOpen, setCommandQuery]);

  useEffect(() => {
    if (commandBarOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [commandBarOpen]);

  // Debounced auto-search
  useEffect(() => {
    const trimmed = commandQuery.trim();
    if (!trimmed || trimmed.includes('/') || trimmed.includes('.') || trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      const results = await searchGitHubRepos(trimmed, githubToken);
      setSearchResults(results);
      setIsSearching(false);
    }, 320);

    return () => clearTimeout(timeout);
  }, [commandQuery, githubToken]);

  const handleSubmit = (inputVal?: string) => {
    const raw = inputVal || commandQuery;
    if (!raw.trim()) return;

    const classified = classifyInput(raw);

    if (classified.type === 'LIVE_URL') {
      auditUrl(classified.normalizedUrl);
      setCommandBarOpen(false);
      setCommandQuery('');
      return;
    }

    const target = classified.canonical || classified.raw.trim();
    setCurrentRepo(target);
    fetchRepo(target);
    setCommandBarOpen(false);
    setCommandQuery('');
  };

  return (
    <AnimatePresence>
      {commandBarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandBarOpen(false)}
            className="fixed inset-0 z-50 bg-[#0C1222]/50 backdrop-blur-md"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-24 z-50 w-full max-w-2xl -translate-x-1/2 px-4"
          >
            <div
              className="rounded-3xl border border-[#E3E8F2] bg-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
              style={{
                boxShadow: '0 35px 80px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(12, 18, 34, 0.15)',
              }}
            >
              {/* Search input bar */}
              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-[#E3E8F2] shrink-0 bg-[#F7F8FC]">
                {isSearching ? (
                  <Loader2 size={18} className="text-[#0C1222] animate-spin shrink-0" />
                ) : (
                  <Search size={18} className="text-[#5C6A80] shrink-0" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit(commandQuery);
                  }}
                  placeholder="Search repository or paste live URL (e.g. vercel/next.js, linear.app)..."
                  className="flex-1 bg-transparent text-sm sm:text-base text-[#0C1222] placeholder-[#5C6A80]/50 outline-none font-mono"
                />
                {commandQuery && (
                  <button
                    onClick={() => {
                      setCommandQuery('');
                      setSearchResults([]);
                    }}
                    className="text-[#5C6A80] hover:text-[#0C1222] transition-colors p-1"
                  >
                    <X size={15} />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[#5C6A80] bg-[#F7F8FC] border border-white/[0.1] text-xs font-mono">
                  ESC
                </kbd>
              </div>

              {/* Scrollable results */}
              <div className="p-3 overflow-y-auto space-y-3 divide-y divide-[#5C6A80]/10">
                {/* Auto Search Results */}
                {searchResults.length > 0 && (
                  <div className="pb-2">
                    <p className="type-kicker text-[10px] mb-2 px-1 flex items-center justify-between text-[#5C6A80]">
                      <span>Matching Repositories</span>
                      <span className="text-[10px] text-[#5C6A80]/60 font-mono">Top 5 by Stars</span>
                    </p>
                    <div className="space-y-1">
                      {searchResults.map((res) => (
                        <button
                          key={res.full_name}
                          onClick={() => handleSubmit(res.full_name)}
                          className="group w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-transparent hover:border-[#3D4FE0] hover:bg-[#EEF1FF] transition-all text-left"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-semibold text-[#0C1222] truncate">
                                {res.full_name}
                              </span>
                              {res.language && (
                                <span className="badge badge-burgundy text-[9px] py-0 px-1.5">
                                  {res.language}
                                </span>
                              )}
                            </div>
                            {res.description && (
                              <p className="text-xs text-[#5C6A80] truncate mt-0.5 font-sans">
                                {res.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono text-[#5C6A80]">
                            <Star size={12} className="text-[#0C1222]" />
                            <span>{res.stargazers_count.toLocaleString()}</span>
                            <ArrowRight
                              size={13}
                              className="text-[#5C6A80]/60 group-hover:text-[#0C1222] group-hover:translate-x-0.5 transition-all ml-1"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {isMounted && recentSearches && recentSearches.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="type-kicker text-[10px] flex items-center gap-1.5 text-[#5C6A80]">
                        <Clock size={11} className="text-[#5C6A80]" />
                        Recent Searches
                      </p>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[10px] font-mono text-[#5C6A80]/60 hover:text-[#0C1222] flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={10} />
                        Clear
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {recentSearches.map((item) => {
                        const isUrl = item.startsWith('http://') || item.startsWith('https://');
                        return (
                          <button
                            key={item}
                            onClick={() => handleSubmit(item)}
                            className="group w-full flex items-center gap-3 px-3 py-1.5 rounded-xl border border-transparent hover:border-[#3D4FE0] hover:bg-[#F4F6FB] transition-all text-left"
                          >
                            {isUrl ? (
                              <Globe size={13} className="text-[#0C1222] shrink-0" />
                            ) : (
                              <Clock size={13} className="text-[#5C6A80] shrink-0" />
                            )}
                            <span className="text-xs font-mono text-[#0C1222] flex-1 truncate">
                              {item}
                            </span>
                            <ArrowRight
                              size={12}
                              className="text-[#5C6A80]/40 group-hover:text-[#0C1222] group-hover:translate-x-0.5 transition-all shrink-0"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="pt-2 space-y-3">
                  <div>
                    <p className="type-kicker text-[10px] mb-2 px-1 text-[#5C6A80]">
                      Preset Repositories
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {PRESET_REPOS.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => handleSubmit(preset.value)}
                          className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-[#5C6A80]/15 bg-[#F7F8FC]/40 hover:border-[#3D4FE0] hover:bg-[#EEF1FF] transition-all text-left"
                        >
                          <span className="text-base w-5 text-center shrink-0">{preset.emoji}</span>
                          <span className="text-xs font-mono text-[#0C1222] flex-1 truncate">
                            {preset.label}
                          </span>
                          <ArrowRight
                            size={12}
                            className="text-[#5C6A80]/40 group-hover:text-[#0C1222] group-hover:translate-x-0.5 transition-all shrink-0"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="type-kicker text-[10px] mb-2 px-1 flex items-center gap-1.5 text-[#0C1222]">
                      <Globe size={11} />
                      <span>Live Deployments</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {PRESET_LIVE_URLS.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => handleSubmit(preset.value)}
                          className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-[#5C6A80]/15 bg-[#F7F8FC]/40 hover:border-[#3D4FE0] hover:bg-[#EEF1FF] transition-all text-left"
                        >
                          <span className="text-base w-5 text-center shrink-0">{preset.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-[#0C1222] truncate">
                              {preset.label}
                            </p>
                            <p className="text-[10px] text-[#5C6A80] truncate font-sans">
                              {preset.desc}
                            </p>
                          </div>
                          <ArrowRight
                            size={12}
                            className="text-[#5C6A80]/40 group-hover:text-[#0C1222] group-hover:translate-x-0.5 transition-all shrink-0"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#5C6A80]/15 px-4 py-2.5 flex items-center justify-between bg-[#F7F8FC]/80 shrink-0">
                <div className="flex items-center gap-3 text-xs font-mono text-[#5C6A80]">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-[#FFFFFF] border border-[#5C6A80]/20 font-mono text-[#0C1222] text-[10px]">
                      ↵
                    </kbd>
                    analyze
                  </span>
                  <span className="hidden sm:inline text-[#5C6A80]/60">repo or live URL</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#0C1222]">
                  <Zap size={12} className="text-[#0C1222]" />
                  <span>DevMetrics Command Engine</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
