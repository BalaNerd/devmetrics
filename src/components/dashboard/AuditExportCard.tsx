'use client';

import { useState } from 'react';
import { Download, FileText, CheckCircle2, Printer } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { downloadAuditMarkdown, printAuditReport } from '@/lib/exportAudit';
import type { RepoData } from '@/lib/github';

interface AuditExportCardProps {
  data: RepoData;
  embedded?: boolean;
}

export default function AuditExportCard({ data, embedded = false }: AuditExportCardProps) {
  const { audienceMode, setToast } = useAppStore();
  const isPlain = audienceMode === 'plain';
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    downloadAuditMarkdown(data);
    setDownloaded(true);
    setToast({
      message: 'Downloaded DEV_METRICS_AUDIT.md successfully!',
      type: 'success',
    });
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handlePrint = () => {
    printAuditReport(data);
    setToast({
      message: 'Opening print dialog for PDF export...',
      type: 'info',
    });
  };

  const containerClasses = embedded
    ? 'space-y-4 w-full p-4 rounded-xl bg-[#120909] border border-[#A5A79B]/15'
    : 'w-full bg-[#180d0d] border border-[#A5A79B]/15 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between gap-6';

  return (
    <div className={containerClasses}>
      <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#590907]/30 border border-[#590907] flex items-center justify-center shrink-0 text-[#E8D2B5]">
            <FileText size={18} />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#E8D2B5] font-sans flex items-center gap-2.5 flex-wrap">
              <span>{isPlain ? 'Executive Repository Audit Document' : 'Downloadable Due Diligence & Audit Report'}</span>
              <span className="bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] font-mono text-[10px] px-2 py-0.5 rounded-full">
                Markdown & PDF
              </span>
            </h4>
            <p className="font-sans text-xs text-[#A5A79B] mt-0.5 max-w-xl leading-relaxed">
              {isPlain
                ? 'Complete summary of velocity, licenses, contributors, and team safety in a single portable file.'
                : 'Full architectural report formatted for engineering directors, security reviews, and VC due-diligence.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl text-xs font-mono font-semibold bg-[#590907] hover:bg-[#77110f] border border-[#590907] text-[#E8D2B5] transition-all cursor-pointer shadow-md active:scale-95"
          >
            {downloaded ? <CheckCircle2 size={14} className="text-[#E8D2B5]" /> : <Download size={14} />}
            <span>{downloaded ? 'Downloaded!' : 'Download (.md)'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl text-xs font-mono font-semibold bg-[#120909] hover:bg-[#180d0d] border border-[#A5A79B]/20 text-[#A5A79B] hover:text-[#E8D2B5] transition-all cursor-pointer"
          >
            <Printer size={14} />
            <span>Print PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
