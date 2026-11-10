'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { parseRepoInput, ghFetch } from '@/lib/github';
import {
  calculateVelocityScore,
  calculateBusFactor,
  calculateChurn,
  buildPunchCard,
  calculateHealthGrade,
} from '@/lib/metrics';
import { generateEngineeringDirectives } from '@/lib/directives';
import type {
  Repository,
  CommitEntry,
  Contributor,
  Release,
  HealthMetrics,
  CommitActivity,
  ContentEntry,
  RepoData,
} from '@/lib/github';

const API = 'https://api.github.com';

export function useRepo(repoToFetch?: string) {
  const {
    repoData,
    fetchStatus,
    errorMessage,
    setRepoData,
    setFetchStatus,
    setErrorMessage,
    setTokenModalOpen,
    setTokenErrorMessage,
    setGithubToken,
    setCurrentRepo,
    addRecentSearch,
    setToast,
    currentRepo,
  } = useAppStore();

  const fetchRepo = useCallback(
    async (input: string, tokenOverride?: string | null) => {
      const parsed = parseRepoInput(input);
      if (!parsed) {
        setErrorMessage('Invalid repository format. Please use "owner/repo" or a GitHub repository URL.');
        setFetchStatus('error');
        return;
      }

      const { owner, repo } = parsed;
      const canonicalRepo = `${owner}/${repo}`;
      
      // Update repo name & trigger immediate loading state
      setCurrentRepo(canonicalRepo);
      setFetchStatus('loading');
      setErrorMessage(null);
      setRepoData(null);

      // Determine active token (prefer explicit override, fallback to store state)
      const rawToken =
        tokenOverride !== undefined ? tokenOverride : useAppStore.getState().githubToken;
      const activeToken = rawToken?.trim().replace(/[\r\n\t]/g, '') || null;

      const safeFetch = async <T,>(p: Promise<T>, fallback: T): Promise<T> => {
        try {
          const res = await p;
          return res ?? fallback;
        } catch (err: any) {
          if (err?.code === 'RATE_LIMITED' || err?.code === 'UNAUTHORIZED') {
            throw err;
          }
          return fallback;
        }
      };

      const executeFetch = async (token: string | null): Promise<RepoData> => {
        // Parallel fetch all essential GitHub REST endpoints simultaneously
        const [
          repoDataResult,
          commitsRaw,
          contributorsRaw,
          languagesRaw,
          releasesRaw,
          workflowsRaw,
          activityRaw,
          rootContentsRaw,
          githubDirRaw,
        ] = await Promise.all([
          // Main repository metadata (only this throws on 404)
          ghFetch<Repository>(`${API}/repos/${owner}/${repo}`, token),
          // Commits (Last 100)
          safeFetch<CommitEntry[]>(
            ghFetch<CommitEntry[]>(`${API}/repos/${owner}/${repo}/commits?per_page=100`, token),
            []
          ),
          // Contributors (Top 30)
          safeFetch<Contributor[]>(
            ghFetch<Contributor[]>(`${API}/repos/${owner}/${repo}/contributors?per_page=30`, token),
            []
          ),
          // Languages
          safeFetch<Record<string, number>>(
            ghFetch<Record<string, number>>(`${API}/repos/${owner}/${repo}/languages`, token),
            {}
          ),
          // Releases
          safeFetch<Release[]>(
            ghFetch<Release[]>(`${API}/repos/${owner}/${repo}/releases?per_page=30`, token),
            []
          ),
          // Workflow Files (CI Check)
          safeFetch<ContentEntry[]>(
            ghFetch<ContentEntry[]>(`${API}/repos/${owner}/${repo}/contents/.github/workflows`, token),
            []
          ),
          // Optional commit activity stats
          safeFetch<CommitActivity[]>(
            ghFetch<CommitActivity[]>(`${API}/repos/${owner}/${repo}/stats/commit_activity`, token),
            []
          ),
          // Root contents
          safeFetch<ContentEntry[]>(
            ghFetch<ContentEntry[]>(`${API}/repos/${owner}/${repo}/contents/`, token),
            []
          ),
          // .github directory
          safeFetch<ContentEntry[]>(
            ghFetch<ContentEntry[]>(`${API}/repos/${owner}/${repo}/contents/.github`, token),
            []
          ),
        ]);

        const commits = Array.isArray(commitsRaw) ? commitsRaw : [];
        const contributors = Array.isArray(contributorsRaw) ? contributorsRaw : [];
        const languages =
          languagesRaw && typeof languagesRaw === 'object' && !Array.isArray(languagesRaw)
            ? languagesRaw
            : {};
        const releases = Array.isArray(releasesRaw) ? releasesRaw : [];
        const workflows = Array.isArray(workflowsRaw) ? workflowsRaw : [];
        const activity = Array.isArray(activityRaw) ? activityRaw : [];
        const rootContents = Array.isArray(rootContentsRaw) ? rootContentsRaw : [];
        const githubDir = Array.isArray(githubDirRaw) ? githubDirRaw : [];

        const rootNames = rootContents.map((f) => f.name.toLowerCase());
        const githubNames = githubDir.map((f) => f.name.toLowerCase());

        const workflowCount = workflows.length;
        const hasWorkflows = workflowCount > 0;

        const hasIssueTemplates =
          githubNames.includes('issue_template') ||
          githubNames.includes('issue_template.md') ||
          githubNames.some((n) => n.startsWith('issue_template'));
        const hasPRTemplate =
          rootNames.includes('pull_request_template.md') ||
          githubNames.includes('pull_request_template.md') ||
          rootNames.some((n) => n.startsWith('pull_request_template'));

        const readmeFile = rootContents.find((f) => f.name.toLowerCase().startsWith('readme'));

        const health: HealthMetrics = {
          hasReadme: !!readmeFile,
          readmeSize: readmeFile?.size ?? 0,
          hasLicense: !!repoDataResult.license || rootNames.some((n) => n.startsWith('license')),
          licenseName:
            repoDataResult.license?.name ??
            (rootNames.some((n) => n.startsWith('license')) ? 'Detected' : null),
          hasCICD: hasWorkflows,
          hasContributing:
            rootNames.includes('contributing.md') ||
            githubNames.includes('contributing.md') ||
            rootNames.some((n) => n.startsWith('contributing')),
          hasIssueTemplates,
          hasPRTemplate,
          hasSemanticTags: releases.some((r) => /^v?\d+\.\d+\.\d+/.test(r.tag_name)),
          hasCodeOfConduct:
            rootNames.includes('code_of_conduct.md') ||
            githubNames.includes('code_of_conduct.md') ||
            rootNames.some((n) => n.startsWith('code_of_conduct')),
          hasChangelog:
            rootNames.includes('changelog.md') ||
            rootNames.includes('changelog') ||
            rootNames.includes('history.md'),
          workflowCount,
        };

        const velocity = calculateVelocityScore(commits, releases, repoDataResult.pushed_at);
        const busFactor = calculateBusFactor(contributors);
        const churn = calculateChurn(activity, commits);
        const punchCard = buildPunchCard(activity, commits);

        return {
          repo: repoDataResult,
          commits,
          contributors,
          languages,
          releases,
          health,
          commitActivity: activity,
          punchCard,
          velocity,
          busFactor,
          churn,
        };
      };

      try {
        const fetchedData = await executeFetch(activeToken);
        setRepoData(fetchedData);
        setFetchStatus('success');
        addRecentSearch(canonicalRepo);
      } catch (err: unknown) {
        const e = err as Error & { code?: string };

        // Handle 401 Unauthorized / Bad credentials
        if (
          e.code === 'UNAUTHORIZED' ||
          (e.message && e.message.toLowerCase().includes('bad credentials'))
        ) {
          // Immediately clear the bad token from localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('github_token');
            localStorage.removeItem('dm_github_token');
          }
          // Reset the store state and notify user with toast
          setGithubToken(null);
          setTokenErrorMessage('Invalid or expired GitHub Token. Please re-enter a valid classic PAT.');
          setToast({
            message: 'GitHub token expired or invalid; switched to unauthenticated mode',
            type: 'error',
          });

          // Fall back to unauthenticated public fetching instead of freezing in an error state
          try {
            const fallbackData = await executeFetch(null);
            setRepoData(fallbackData);
            setFetchStatus('success');
            addRecentSearch(canonicalRepo);
            return;
          } catch (fallbackErr: unknown) {
            const fe = fallbackErr as Error & { code?: string };
            if (fe.code === 'RATE_LIMITED') {
              setFetchStatus('rate-limited');
              setErrorMessage('GitHub API rate limit exceeded. Please add a valid Personal Access Token.');
              setTokenModalOpen(true);
            } else if (fe.code === 'NOT_FOUND') {
              setFetchStatus('not-found');
              setErrorMessage(
                'Repository not found or private. Please check the spelling or provide a PAT with repo scope.'
              );
            } else {
              setFetchStatus('error');
              setErrorMessage(fe.message || 'Unknown error occurred while fetching repository data.');
            }
            return;
          }
        }

        if (e.code === 'RATE_LIMITED') {
          setFetchStatus('rate-limited');
          setErrorMessage('GitHub API rate limit exceeded. Please add a Personal Access Token to continue.');
          setTokenModalOpen(true);
        } else if (e.code === 'NOT_FOUND') {
          setFetchStatus('not-found');
          setErrorMessage(
            'Repository not found or private. Please check the spelling or provide a PAT with repo scope.'
          );
        } else {
          setFetchStatus('error');
          setErrorMessage(e.message || 'Unknown error occurred while fetching repository data.');
        }
      }
    },
    [
      setRepoData,
      setFetchStatus,
      setErrorMessage,
      setTokenModalOpen,
      setTokenErrorMessage,
      setGithubToken,
      setCurrentRepo,
      addRecentSearch,
      setToast,
    ]
  );

  // Auto-fetch if repoToFetch is provided and store is idle
  useEffect(() => {
    if (!repoToFetch) return;
    if (fetchStatus === 'idle' && !repoData) {
      fetchRepo(repoToFetch);
    }
  }, [repoToFetch, fetchStatus, repoData, fetchRepo]);

  const enrichedData = useMemo(() => {
    if (!repoData) return null;
    return {
      ...repoData,
      cadence: repoData.velocity?.commitFrequency ?? 0,
      velocityScore: repoData.velocity?.score ?? 0,
      checklist: repoData.health,
      healthGrade: calculateHealthGrade(repoData.health).grade,
      directives: generateEngineeringDirectives(repoData),
      codeChurn: repoData.churn,
    };
  }, [repoData]);

  return {
    data: enrichedData,
    loading: fetchStatus === 'loading',
    error: errorMessage,
    fetchRepo,
    currentRepo,
  };
}
