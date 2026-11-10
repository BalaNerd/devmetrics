'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Key, GitCompare, Download, Zap, ChevronDown, FileText, Printer } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { downloadAuditMarkdown, printAuditReport } from '@/lib/exportAudit';

function StatusDot() {
  const [status, setStatus] = useState<'operational' | 'degraded' | 'outage' | 'loading'>('loading');

  useEffect(() => {
    fetch('https://www.githubstatus.com/api/v2/status.json')
      .then((r) => r.json())
      .then((data) => {
        const ind = data?.status?.indicator;
        if (ind === 'none') setStatus('operational');
        else if (ind === 'minor' || ind === 'major') setStatus('degraded');
        else setStatus('outage');
      })
      .catch(() => setStatus('operational'));
  }, []);

  const color =
    status === 'operational' ? '#E8D2B5' :
    status === 'degraded'    ? '#A5A79B' :
    status === 'outage'      ? '#590907' : '#A5A79B';

  const label =
    status === 'loading' ? 'Checking API' :
    status === 'operational' ? 'GitHub nominal' :
    status === 'degraded' ? 'GitHub degraded' : 'GitHub outage';

  return (
    <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#180d0d] border border-[#A5A79B]/20 text-xs font-mono text-[#A5A79B]">
      <span className="relative flex h-2 w-2">
        {status === 'operational' && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40"
            style={{ background: color }}
          />
        )}
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
      </span>
      <span>{label}</span>
    </div>
  );
}

export default function Header() {
  const {
    setCommandBarOpen, currentRepo, githubToken, setTokenModalOpen,
    audienceMode, setAudienceMode, repoData, setComparisonModalOpen, setToast,
  } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayRepo = isMounted ? currentRepo : '';

  const handleExportMarkdown = () => {
    if (!repoData) return;
    downloadAuditMarkdown(repoData);
    setExportMenuOpen(false);
    setToast({ message: `Exported DEV_METRICS_AUDIT.md for ${repoData.repo.full_name}`, type: 'success' });
  };

  const handleExportPDF = () => {
    if (!repoData) return;
    setExportMenuOpen(false);
    printAuditReport(repoData);
    setToast({ message: 'Opening print dialog for PDF export...', type: 'info' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#A5A79B]/15 bg-[#120909]/85 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#590907] to-[#77110f] border border-[#E8D2B5]/20 text-[#E8D2B5] shadow-[0_0_15px_rgba(89,9,7,0.45)]">
            <Zap size={16} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="font-heading font-extrabold text-base tracking-tight text-[#E8D2B5] leading-none">
              DevMetrics
            </div>
            {displayRepo && (
              <div className="text-[11px] font-mono text-[#A5A79B] truncate max-w-[140px] sm:max-w-[200px] mt-0.5">
                {displayRepo}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <button
          onClick={() => setCommandBarOpen(true)}
          className="hidden sm:flex items-center gap-2.5 px-4 h-10 rounded-full border border-[#A5A79B]/20 bg-[#180d0d] hover:border-[#E8D2B5]/30 hover:bg-[#180d0d]/80 transition-all max-w-[360px] w-full text-left cursor-pointer group"
        >
          <Search size={14} className="text-[#A5A79B] group-hover:text-[#E8D2B5] transition-colors shrink-0" />
          <span className="flex-1 truncate font-mono text-xs text-[#A5A79B]/80 group-hover:text-[#A5A79B] transition-colors">
            {displayRepo || 'Search repository or paste URL…'}
          </span>
          <kbd className="shrink-0 px-2 py-0.5 rounded-md font-mono text-[10px] bg-[#120909] border border-[#A5A79B]/20 text-[#E8D2B5]">
            ⌘K
          </kbd>
        </button>

        {/* Audience Mode Switcher (Header Requirement: [ Technical Mode | Plain English Mode ]) */}
        {!isMounted ? (
          <div className="hidden md:block h-9 w-48 rounded-full bg-[#180d0d] border border-[#A5A79B]/15 opacity-40" />
        ) : (
          <div className="hidden md:flex items-center p-1 rounded-full bg-[#180d0d] border border-[#A5A79B]/20 shrink-0">
            {(['technical', 'plain'] as const).map((mode) => {
              const isActive = audienceMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAudienceMode(mode)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#590907] text-[#E8D2B5] font-semibold shadow-sm border border-[#590907]'
                      : 'text-[#A5A79B] hover:text-[#E8D2B5]'
                  }`}
                >
                  {mode === 'technical' ? 'Technical Mode' : '✦ Plain English Mode'}
                </button>
              );
            })}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {repoData && (
            <>
              <button
                onClick={() => setComparisonModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-[#180d0d] border border-[#A5A79B]/20 text-[#A5A79B] hover:text-[#E8D2B5] hover:border-[#590907] transition-all cursor-pointer"
              >
                <GitCompare size={13} />
                <span>Compare</span>
              </button>

              {/* Export Audit Dropdown */}
              <div className="relative" ref={exportDropdownRef}>
                <button
                  type="button"
                  onClick={() => setExportMenuOpen((prev) => !prev)}
                  className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-[#180d0d] border border-[#A5A79B]/20 text-[#A5A79B] hover:text-[#E8D2B5] hover:border-[#590907] transition-all cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export Audit</span>
                  <ChevronDown size={11} className={`transition-transform duration-200 ${exportMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#180d0d] border border-[#A5A79B]/20 shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-2xl">
                    <button
                      type="button"
                      onClick={handleExportMarkdown}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-left text-[#E8D2B5] hover:bg-[#590907] hover:text-[#E8D2B5] transition-colors cursor-pointer"
                    >
                      <FileText size={14} className="text-[#E8D2B5]" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Markdown (.md)</span>
                        <span className="text-[10px] text-[#A5A79B]">DEV_METRICS_AUDIT.md</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-left text-[#E8D2B5] hover:bg-[#590907] hover:text-[#E8D2B5] transition-colors cursor-pointer"
                    >
                      <Printer size={14} className="text-[#E8D2B5]" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Print / PDF Report</span>
                        <span className="text-[10px] text-[#A5A79B]">Formatted PDF export</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <StatusDot />

          {/* GitHub Token Button */}
          {!isMounted ? (
            <div className="w-24 h-8 rounded-full bg-[#180d0d] border border-[#A5A79B]/15 opacity-40" />
          ) : githubToken ? (
            <button
              onClick={() => setTokenModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-[#180d0d] border border-[#E8D2B5]/30 text-[#E8D2B5] hover:border-[#E8D2B5] transition-all cursor-pointer"
            >
              <Key size={12} className="text-[#E8D2B5]" />
              <span className="hidden sm:inline">Token ✓</span>
            </button>
          ) : (
            <button
              onClick={() => setTokenModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#590907] hover:bg-[#77110f] border border-[#590907] text-[#E8D2B5] transition-all cursor-pointer shadow-sm"
            >
              <Key size={12} />
              <span className="hidden sm:inline">Add Token</span>
            </button>
          )}

          <button
            onClick={() => setCommandBarOpen(true)}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-[#180d0d] border border-[#A5A79B]/20 text-[#A5A79B] hover:text-[#E8D2B5]"
            aria-label="Search"
          >
            <Search size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
