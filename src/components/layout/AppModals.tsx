'use client';

import CommandBar from '@/components/layout/CommandBar';
import RateLimitModal from '@/components/ui/RateLimitModal';
import Toast from '@/components/ui/Toast';
import BadgeGenerator from '@/components/dashboard/BadgeGenerator';
import RepoComparisonModal from '@/components/dashboard/RepoComparisonModal';
import { useAppStore } from '@/store/useAppStore';

export default function AppModals() {
  const { repoData } = useAppStore();
  return (
    <>
      <Toast />
      <CommandBar />
      <RateLimitModal />
      <RepoComparisonModal />
      {repoData && <BadgeGenerator data={repoData} />}
    </>
  );
}

