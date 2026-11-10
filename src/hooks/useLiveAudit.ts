'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { normalizeLiveUrl } from '@/lib/urlRouter';
import type { LiveAuditData } from '@/lib/liveAuditor';

export function useLiveAudit() {
  const {
    setLiveUrl,
    setLiveAuditData,
    setLiveAuditStatus,
    setLiveAuditError,
    setToast,
    addRecentSearch,
  } = useAppStore();

  const auditUrl = useCallback(
    async (rawUrl: string) => {
      const normalized = normalizeLiveUrl(rawUrl);
      setLiveUrl(normalized);
      setLiveAuditStatus('loading');
      setLiveAuditError(null);

      // Persist in recent searches
      addRecentSearch(normalized);

      try {
        const res = await fetch(`/api/audit-url?url=${encodeURIComponent(normalized)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || data.error || 'Failed to inspect live URL');
        }

        setLiveAuditData(data as LiveAuditData);
        setLiveAuditStatus('success');
        setToast({
          message: `Inspected ${data.hostname || normalized} successfully`,
          type: 'success',
        });
      } catch (err: any) {
        const msg = err?.message || 'Unable to reach target URL';
        setLiveAuditError(msg);
        setLiveAuditStatus('error');
        setToast({
          message: msg,
          type: 'error',
        });
      }
    },
    [setLiveUrl, setLiveAuditStatus, setLiveAuditError, setLiveAuditData, setToast, addRecentSearch]
  );

  return { auditUrl };
}

