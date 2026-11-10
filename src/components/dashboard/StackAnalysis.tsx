'use client';

import type { LanguageStats, RepoData } from '@/lib/github';
import LanguageBar from './LanguageBar';
import DependencyAuditor from './DependencyAuditor';
import LicenseScanner from './LicenseScanner';

interface StackAnalysisProps {
  languages?: LanguageStats;
  data?: RepoData | null;
  embedded?: boolean;
}

export default function StackAnalysis({ languages, data, embedded = false }: StackAnalysisProps) {
  const resolvedLanguages = languages || data?.languages || {};
  const owner = data?.repo?.owner?.login || '';
  const repoName = data?.repo?.name || '';
  const license = data?.repo?.license || null;

  return (
    <div className="flex flex-col gap-6 w-full">
      <LanguageBar languages={resolvedLanguages} embedded={embedded} />

      {owner && repoName && (
        <div className="flex flex-col md:flex-row gap-5 items-stretch w-full">
          <div className="flex-1 w-full">
            <DependencyAuditor owner={owner} repo={repoName} embedded={embedded} />
          </div>
          <div className="flex-1 w-full">
            <LicenseScanner license={license} embedded={embedded} />
          </div>
        </div>
      )}
    </div>
  );
}
