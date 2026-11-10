'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, AlertTriangle, ExternalLink, Check, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRepo } from '@/hooks/useRepo';

export default function RateLimitModal() {
  const {
    tokenModalOpen,
    setTokenModalOpen,
    setGithubToken,
    githubToken,
    currentRepo,
    tokenErrorMessage,
    setTokenErrorMessage,
  } = useAppStore();
  const { fetchRepo } = useRepo();
  const [input, setInput] = useState('');

  useEffect(() => {
    if (tokenModalOpen) {
      setInput(githubToken || '');
    }
  }, [tokenModalOpen, githubToken]);

  const handleSave = () => {
    const token = input.trim().replace(/[\r\n\t]/g, '') || null;
    setGithubToken(token);
    setTokenErrorMessage(null);
    setTokenModalOpen(false);

    if (currentRepo) {
      fetchRepo(currentRepo, token);
    }
  };

  const handleClear = () => {
    setGithubToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('github_token');
      localStorage.removeItem('dm_github_token');
    }
    setInput('');
    setTokenErrorMessage(null);
  };

  const handleClose = () => {
    setTokenModalOpen(false);
    setTokenErrorMessage(null);
  };

  return (
    <AnimatePresence>
      {tokenModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0C1222]/50 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-md rounded-2xl border border-[#5C6A80]/20 bg-[#FFFFFF] shadow-2xl pointer-events-auto overflow-hidden"
              style={{
                boxShadow: '0 25px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(12, 18, 34, 0.08)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#5C6A80]/15 bg-[#F7F8FC]/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF1FF] border border-[#3D4FE0] flex items-center justify-center">
                    <Key size={15} className="text-[#0C1222]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0C1222] font-heading">
                      GitHub Access Token
                    </h3>
                    <p className="text-xs text-[#5C6A80] font-sans">
                      Bypass API rate limits (5,000 req/hr)
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-[#5C6A80] hover:text-[#0C1222] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {tokenErrorMessage ? (
                  <div className="rounded-xl bg-[#EEF1FF] border border-[#3D4FE0] p-3.5 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-[#0C1222] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#0C1222] leading-relaxed font-sans">
                      <strong className="text-[#0C1222]">Authentication Failed:</strong> {tokenErrorMessage}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#F7F8FC] border border-[#5C6A80]/20 p-3.5 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-[#0C1222] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#5C6A80] leading-relaxed font-sans">
                      <strong className="text-[#0C1222]">Anonymous Rate Limit:</strong> GitHub limits unauthenticated requests to 60/hr. Adding a personal token increases this to 5,000/hr.
                    </div>
                  </div>
                )}

                {/* Token input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#0C1222] font-heading">
                      Personal Access Token (PAT)
                    </label>
                    {githubToken && (
                      <span className="badge badge-burgundy text-[10px]">
                        <Check size={11} /> Saved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#5C6A80]/20 bg-[#F7F8FC] focus-within:border-[#3D4FE0] transition-colors">
                    <Key size={14} className="text-[#5C6A80] shrink-0" />
                    <input
                      type="password"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="ghp_... or github_pat_..."
                      className="flex-1 bg-transparent text-sm font-mono text-[#0C1222] placeholder-[#5C6A80]/50 outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-[#5C6A80]/70 font-sans mt-1.5">
                    Stored strictly in your local browser storage. Never transmitted to third parties.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <a
                    href="https://github.com/settings/tokens/new?description=DevMetrics&scopes=public_repo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5C6A80] hover:text-[#0C1222] transition-colors"
                  >
                    <span>Generate free PAT</span>
                    <ExternalLink size={12} />
                  </a>

                  <div className="flex items-center gap-2">
                    {githubToken && (
                      <button
                        onClick={handleClear}
                        className="px-3 py-2 rounded-xl text-xs font-mono text-[#5C6A80] hover:text-[#0C1222] transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-[#3D4FE0] text-white hover:bg-[#2A38B8] transition-all shadow-sm"
                    >
                      Save & Retry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
