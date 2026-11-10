'use client';

import { create } from 'zustand';
import type { RepoData, FetchStatus } from '@/lib/github';
import type { LiveAuditData } from '@/lib/liveAuditor';

export type AudienceMode = 'technical' | 'plain';

export interface ToastInfo {
  message: string;
  type?: 'info' | 'error' | 'success';
}

interface AppState {
  // Repo search
  currentRepo: string; // "owner/repo"
  repoData: RepoData | null;
  fetchStatus: FetchStatus;
  errorMessage: string | null;

  // Live URL Audit
  liveUrl: string | null;
  liveAuditData: LiveAuditData | null;
  liveAuditStatus: 'idle' | 'loading' | 'success' | 'error';
  liveAuditError: string | null;
  setLiveUrl: (url: string | null) => void;
  setLiveAuditData: (data: LiveAuditData | null) => void;
  setLiveAuditStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void;
  setLiveAuditError: (msg: string | null) => void;
  clearLiveAudit: () => void;

  // Audience Mode (Technical vs Plain English / Recruiter)
  audienceMode: AudienceMode;
  setAudienceMode: (mode: AudienceMode) => void;

  // Recent Searches
  recentSearches: string[];
  addRecentSearch: (repo: string) => void;
  clearRecentSearches: () => void;

  // GitHub token
  githubToken: string | null;
  tokenModalOpen: boolean;
  tokenErrorMessage: string | null;

  // Toast Notification
  toast: ToastInfo | null;
  setToast: (toast: ToastInfo | null) => void;

  // Command bar
  commandBarOpen: boolean;
  commandQuery: string;

  // Comparison Modal
  comparisonModalOpen: boolean;
  comparisonTargetRepo: string;

  // Badge modal
  badgeModalOpen: boolean;

  // Actions
  setCurrentRepo: (repo: string) => void;
  setRepoData: (data: RepoData | null) => void;
  setFetchStatus: (status: FetchStatus) => void;
  setErrorMessage: (msg: string | null) => void;
  setGithubToken: (token: string | null) => void;
  setTokenModalOpen: (open: boolean) => void;
  setTokenErrorMessage: (msg: string | null) => void;
  setCommandBarOpen: (open: boolean) => void;
  setCommandQuery: (q: string) => void;
  setComparisonModalOpen: (open: boolean) => void;
  setComparisonTargetRepo: (repo: string) => void;
  setBadgeModalOpen: (open: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentRepo: '',
  repoData: null,
  fetchStatus: 'idle',
  errorMessage: null,

  liveUrl: null,
  liveAuditData: null,
  liveAuditStatus: 'idle',
  liveAuditError: null,
  setLiveUrl: (url) => set({ liveUrl: url }),
  setLiveAuditData: (data) => set({ liveAuditData: data }),
  setLiveAuditStatus: (status) => set({ liveAuditStatus: status }),
  setLiveAuditError: (msg) => set({ liveAuditError: msg }),
  clearLiveAudit: () =>
    set({
      liveUrl: null,
      liveAuditData: null,
      liveAuditStatus: 'idle',
      liveAuditError: null,
    }),

  audienceMode:
    typeof window !== 'undefined'
      ? (localStorage.getItem('dm_audience_mode') as AudienceMode) || 'technical'
      : 'technical',
  setAudienceMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dm_audience_mode', mode);
    }
    set({ audienceMode: mode });
  },

  recentSearches:
    typeof window !== 'undefined'
      ? (() => {
          try {
            return JSON.parse(localStorage.getItem('dm_recent_searches') || '[]');
          } catch {
            return [];
          }
        })()
      : [],
  addRecentSearch: (repo) => {
    if (!repo) return;
    const current = get().recentSearches.filter(
      (r) => r.toLowerCase() !== repo.toLowerCase()
    );
    const updated = [repo, ...current].slice(0, 5);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dm_recent_searches', JSON.stringify(updated));
    }
    set({ recentSearches: updated });
  },
  clearRecentSearches: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dm_recent_searches');
    }
    set({ recentSearches: [] });
  },

  githubToken:
    typeof window !== 'undefined'
      ? localStorage.getItem('github_token') || localStorage.getItem('dm_github_token')
      : null,
  tokenModalOpen: false,
  tokenErrorMessage: null,

  toast: null,
  setToast: (toast) => set({ toast }),

  commandBarOpen: false,
  commandQuery: '',

  comparisonModalOpen: false,
  comparisonTargetRepo: '',

  badgeModalOpen: false,

  setCurrentRepo: (repo) => set({ currentRepo: repo }),
  setRepoData: (data) => set({ repoData: data }),
  setFetchStatus: (status) => set({ fetchStatus: status }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),
  setGithubToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('github_token', token);
        localStorage.setItem('dm_github_token', token);
      } else {
        localStorage.removeItem('github_token');
        localStorage.removeItem('dm_github_token');
      }
    }
    set({ githubToken: token });
  },
  setTokenModalOpen: (open) =>
    set({ tokenModalOpen: open, ...(!open ? { tokenErrorMessage: null } : {}) }),
  setTokenErrorMessage: (msg) => set({ tokenErrorMessage: msg }),
  setCommandBarOpen: (open) => set({ commandBarOpen: open }),
  setCommandQuery: (q) => set({ commandQuery: q }),
  setComparisonModalOpen: (open) => set({ comparisonModalOpen: open }),
  setComparisonTargetRepo: (repo) => set({ comparisonTargetRepo: repo }),
  setBadgeModalOpen: (open) => set({ badgeModalOpen: open }),
  reset: () =>
    set({
      repoData: null,
      fetchStatus: 'idle',
      errorMessage: null,
      currentRepo: '',
    }),
}));

