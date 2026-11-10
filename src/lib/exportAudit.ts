import type { RepoData } from './github';
import { calculateHealthGrade } from './metrics';
import { generateEngineeringDirectives } from './directives';

export function generateAuditMarkdown(data: RepoData): string {
  const { repo, contributors, languages, releases, health, velocity, busFactor, churn } = data;
  const { grade, score, passing, total } = calculateHealthGrade(health);
  const directives = generateEngineeringDirectives(data);

  const langList = Object.entries(languages || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([lang, bytes]) => `- **${lang}**: ${bytes.toLocaleString()} bytes`)
    .join('\n') || '- No language bytes recorded';

  const topContributors = (contributors || [])
    .slice(0, 5)
    .map((c, i) => `${i + 1}. **@${c.login}** (${c.contributions.toLocaleString()} commits)`)
    .join('\n') || '- Single maintainer';

  const directivesMarkdown = directives.length > 0
    ? directives.map((d, i) => `### ${i + 1}. [${d.severity}] ${d.title}
**Impact:** ${d.impactBadge}  
**Diagnosis:** ${d.diagnosis}  
**Prescription:** ${d.prescription}  
${d.actionFile ? `**Action Target File:** \`${d.actionFile}\`  ` : ''}
${d.actionCommand ? `**Recommended Terminal Command:** \`${d.actionCommand}\`  ` : ''}
`).join('\n')
    : 'No critical architectural bottlenecks identified.';

  return `# DevMetrics Executive Audit Report: DEV_METRICS_AUDIT.md
**Repository:** [${repo.full_name}](https://github.com/${repo.full_name})  
**Generated On:** ${new Date().toUTCString()}  
**Overall Velocity Score:** ${velocity.score} / 100  
**Repository Hygiene Grade:** Grade ${grade} (${score}%, ${passing}/${total} compliance checks passing)

---

## 1. Executive Dilemma & Repository Summary
- **Stars:** ${repo.stargazers_count.toLocaleString()}
- **Forks:** ${repo.forks_count.toLocaleString()}
- **Open Issues:** ${repo.open_issues_count.toLocaleString()}
- **Primary Language:** ${repo.language || 'TypeScript / Multi-stack'}
- **Open-Source License:** ${repo.license?.name || (health.hasLicense ? 'Detected' : 'No license detected (High Legal Risk)')}
- **Trunk Branch:** \`${repo.default_branch || 'main'}\`
- **Last Pushed:** ${new Date(repo.pushed_at).toUTCString()}

---

## 2. Velocity & Cadence Telemetry
- **Composite Velocity Score:** ${velocity.score} / 100
- **Trend Momentum:** ${velocity.trendDirection.toUpperCase()}
- **Commit Cadence:** ~${velocity.commitFrequency.toFixed(1)} commits / week
- **Days Since Last Commit:** ${velocity.daysSinceLastCommit} days
- **Release Cadence:** ~${velocity.releaseCadence.toFixed(1)} releases / month
- **Tracked Production Releases:** ${releases.length}

---

## 3. Bus Factor & Contributor Risk Analysis
- **Bus Factor Score:** ${busFactor.busFactorScore} / 10 (${busFactor.riskLevel.toUpperCase()} RISK)
- **Primary Contributor Pareto Share:** ${busFactor.topContributorPct.toFixed(1)}% (@${busFactor.dominantContributor})
- **Top 2 Maintainers Share:** ${busFactor.top2ContributorPct.toFixed(1)}%
- **Tracked Contributor Pool:** ${contributors.length} active contributors

### Top Commit Authors:
${topContributors}

---

## 4. Code Churn & Volatility Telemetry
- **Total Net Additions:** +${churn.additions.toLocaleString()} lines
- **Total Net Deletions:** -${churn.deletions.toLocaleString()} lines
- **Net Codebase Delta:** ${churn.netChange > 0 ? '+' : ''}${churn.netChange.toLocaleString()} lines
- **Code Churn Ratio:** ${churn.churnRatio.toFixed(2)}x

---

## 5. Technology Stack & Byte-Share
${langList}

---

## 6. Repository Compliance & Hygiene Audit
- **README Documentation:** ${health.hasReadme ? `Passed (${health.readmeSize.toLocaleString()} bytes)` : 'FAILED - Missing'}
- **SPDX Open Source License:** ${health.hasLicense ? `Passed (${health.licenseName || 'Detected'})` : 'FAILED - Missing'}
- **Automated CI/CD Workflows:** ${health.hasCICD ? `Passed (${health.workflowCount} workflows in .github/workflows)` : 'FAILED - Zero workflows'}
- **CONTRIBUTING.md:** ${health.hasContributing ? 'Passed' : 'Missing'}
- **Issue Templates:** ${health.hasIssueTemplates ? 'Passed' : 'Missing'}
- **Pull Request Template:** ${health.hasPRTemplate ? 'Passed' : 'Missing'}
- **SemVer Git Release Tags:** ${health.hasSemanticTags ? 'Passed' : 'Missing'}
- **Code of Conduct:** ${health.hasCodeOfConduct ? 'Passed' : 'Missing'}
- **Release Changelog:** ${health.hasChangelog ? 'Passed' : 'Missing'}

---

## 7. Actionable Engineering Directives & Prescriptions
${directivesMarkdown}

---
*Generated automatically by DevMetrics Enterprise Terminal Intelligence Studio.*
`;
}

export function downloadAuditMarkdown(data: RepoData): void {
  const markdown = generateAuditMarkdown(data);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'DEV_METRICS_AUDIT.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printAuditReport(data: RepoData): void {
  if (typeof window === 'undefined') return;
  window.print();
}
