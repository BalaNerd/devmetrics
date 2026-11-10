'use client';

import { Scale, CheckCircle2, ShieldCheck, XCircle, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface LicenseScannerProps {
  license: { spdx_id: string; name: string } | null;
  embedded?: boolean;
}

export default function LicenseScanner({ license, embedded = false }: LicenseScannerProps) {
  const { audienceMode } = useAppStore();
  const isPlain = audienceMode === 'plain';

  const spdx = (license?.spdx_id || '').toUpperCase();

  const isPermissive = ['MIT', 'APACHE-2.0', 'BSD-2-CLAUSE', 'BSD-3-CLAUSE', 'ISC'].includes(spdx);
  const isCopyleft = ['GPL-3.0', 'AGPL-3.0', 'LGPL-3.0', 'MPL-2.0'].includes(spdx);
  const isMissing = !license || !license.spdx_id || license.spdx_id === 'NOASSERTION';

  const permissions = [
    {
      label: 'Commercial Use',
      allowed: !isMissing,
      desc: isMissing
        ? 'Unclear rights without explicit license grant'
        : 'Can be used for commercial software and SaaS products',
    },
    {
      label: 'Proprietary SaaS Integration',
      allowed: isPermissive,
      desc: isPermissive
        ? 'Can be embedded into proprietary software without open-sourcing code'
        : isCopyleft
        ? 'Copyleft requires sharing modifications under the same license'
        : 'All rights reserved by default copyright',
    },
    {
      label: 'Patent Grants',
      allowed: spdx === 'APACHE-2.0',
      desc:
        spdx === 'APACHE-2.0'
          ? 'Explicit patent grant protecting downstream contributors'
          : 'No explicit patent grant included',
    },
    {
      label: 'Modification & Distribution',
      allowed: !isMissing,
      desc: !isMissing
        ? 'Can be modified, packaged, and distributed freely'
        : 'Modifications strictly unauthorized without license',
    },
  ];

  const containerClasses = embedded
    ? 'bg-[#120909] border border-[#A5A79B]/15 rounded-xl p-4 sm:p-5 space-y-4'
    : 'w-full bg-[#180d0d] border border-[#A5A79B]/15 rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/40 shadow-[inset_0_1px_0_rgba(232,210,181,0.08)] flex flex-col justify-between gap-5 sm:gap-6';

  return (
    <div className={containerClasses}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#590907]/30 border border-[#590907] text-[#E8D2B5] flex items-center justify-center shrink-0">
            <Scale size={17} />
          </div>
          <div>
            <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#A5A79B]/80 block">
              {isPlain ? 'COMMERCIAL SAFETY' : 'LEGAL COMPLIANCE'}
            </span>
            <h3 className="font-sans text-base sm:text-lg font-bold text-[#E8D2B5] tracking-tight mt-0.5">
              License: {license?.spdx_id || 'Unlicensed'}
            </h3>
          </div>
        </div>

        <div>
          {isPermissive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold bg-[#590907]/30 border border-[#590907] text-[#E8D2B5]">
              <ShieldCheck size={12} />
              <span>Commercial Safe</span>
            </span>
          ) : isCopyleft ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold bg-[#120909] border border-[#A5A79B]/20 text-[#E8D2B5]">
              <AlertTriangle size={12} />
              <span>Copyleft Notice</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold bg-[#590907] text-[#E8D2B5]">
              <XCircle size={12} />
              <span>High Legal Risk</span>
            </span>
          )}
        </div>
      </div>

      {/* Permissions Flex Stack */}
      <div className="flex flex-wrap gap-2.5 w-full">
        {permissions.map((p, i) => (
          <div
            key={i}
            className="flex-1 min-w-[170px] sm:min-w-[200px] p-3 rounded-xl bg-[#180d0d] border border-[#A5A79B]/15 flex items-start gap-2.5"
          >
            {p.allowed ? (
              <CheckCircle2 size={15} className="text-[#E8D2B5] shrink-0 mt-0.5" />
            ) : (
              <XCircle size={15} className="text-[#590907] shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-semibold text-[#E8D2B5] font-sans">
                {p.label}
              </p>
              <p className="text-[11px] text-[#A5A79B] mt-0.5 leading-relaxed font-sans">
                {p.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Commercial Verdict */}
      <div className="p-3.5 rounded-xl text-xs leading-relaxed font-sans bg-[#180d0d] border border-[#A5A79B]/15">
        <strong className="text-[#E8D2B5] font-sans text-xs uppercase tracking-wider block mb-0.5">
          Enterprise Compliance Verdict:
        </strong>
        {isPermissive ? (
          <span className="text-[#A5A79B]">
            Enterprise Safe. Your business can safely vendor, package, or build proprietary SaaS products with this code under standard attribution terms.
          </span>
        ) : isCopyleft ? (
          <span className="text-[#A5A79B]">
            Copyleft Warning. Commercial apps linking or modifying this code may be legally obligated to release their own source code under the same license.
          </span>
        ) : (
          <span className="text-[#E8D2B5]">
            Unlicensed / All Rights Reserved. Without an explicit open-source license, enterprises cannot legally use or redistribute this codebase.
          </span>
        )}
      </div>
    </div>
  );
}
