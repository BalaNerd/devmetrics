'use client';

import { useState } from 'react';
import { Download, FileText, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { downloadAuditMarkdown } from '@/lib/exportAudit';
import type { RepoData } from '@/lib/github';

interface AuditExportCardProps {
  data: RepoData;
}

export default function AuditExportCard({ data }: AuditExportCardProps) {
  const { audienceMode, setToast } = useAppStore();
  const isPlain = audienceMode === 'plain';
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    downloadAuditMarkdown(data);
    setDownloaded(true);
    setToast({
      message: `Downloaded DEV_METRICS_AUDIT_${data.repo.name.toUpperCase()}.md`,
      type: 'success',
    });
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="glass-card p-8 h-full flex flex-col justify-between gap-6">
      <div className="flex items-start sm:items-center justify-between gap-6 flex-wrap">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3D4FE0] to-[#2A38B8] border border-[#0C1222]/20 shrink-0 shadow-[0_0_15px_rgba(61,79,224,0.4)]">
            <FileText size={22} className="text-[#0C1222]" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-[#0C1222] font-heading flex items-center gap-2.5 flex-wrap">
              <span>{isPlain ? 'Executive Repository Audit Document' : 'Downloadable Due Diligence & Audit Report'}</span>
              <span className="badge badge-burgundy text-xs px-2.5 py-0.5">
                Markdown
              </span>
            </h4>
            <p className="font-sans text-xs sm:text-sm text-[#5C6A80] mt-1 max-w-xl leading-relaxed">
              {isPlain
                ? 'Complete summary of velocity, licenses, contributors, and team safety in a single portable file.'
                : 'Full architectural report formatted for engineering directors, security reviews, and VC due-diligence.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2.5 px-6 py-3 rounded-full text-xs sm:text-sm font-mono font-semibold bg-[#3D4FE0] text-white hover:bg-[#2A38B8] transition-all shrink-0"
        >
          {downloaded ? (
            <>
              <CheckCircle2 size={16} className="text-[#0C1222]" />
              <span>Downloaded!</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Download Audit (.md)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
