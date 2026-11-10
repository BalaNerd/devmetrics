'use client';

import WorkbenchLayout, { type WorkbenchTabId, type WorkbenchLayoutProps } from './WorkbenchLayout';

export type TabId = WorkbenchTabId | 'activity' | 'churn' | 'stack';
export type WorkbenchTabsProps = WorkbenchLayoutProps;

export default function WorkbenchTabs(props: WorkbenchTabsProps) {
  return <WorkbenchLayout {...props} />;
}
