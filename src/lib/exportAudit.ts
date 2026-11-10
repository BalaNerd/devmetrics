import type { RepoData } from './github';
import { calculateHealthGrade } from './metrics';

export function generateAuditMarkdown(data: RepoData): string {
  const { repo, commits, contributors, languages, releases, health, velocity, busFactor, churn } = data;
  const { grade, score, passing, total } = calculateHealthGrade(health);

  const langList = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang, bytes]) => `- **${lang}**: ${bytes.toLocaleString()} bytes`)
    .join('\n');

  const topContributors = contributors
    .slice(0, 5)
    .map((c, i) => `${i + 1}. **@${c.login}** (${c.contributions.toLocaleString()} commits)`)
    .join('\n');

  return `# DevMetrics Executive Audit Report
**Repository:** [${repo.full_name}](https://github.com/${repo.full_name})  
**Generated On:** ${new Date().toUTCString()}  
**Overall Velocity Score:** ${velocity.score}/100  
**Repository Hygiene Grade:** ${grade} (${score}%, ${passing}/${total} checks passing)

---

## 1. Executive Summary
- **Stars:** ${repo.stargazers_count.toLocaleString()}
- **Forks:** ${repo.forks_count.toLocaleString()}
- **Open Issues:** ${repo.open_issues_count.toLocaleString()}
- **Primary Language:** ${repo.language || 'Unknown'}
- **License:** ${repo.license?.name || 'No license detected (High Legal Risk)'}
- **Default Branch:** \`${repo.default_branch}\`
- **Last Pushed:** ${new Date(repo.pushed_at).toUTCString()}

---

## 2. Velocity & Cadence Telemetry
- **Composite Velocity Score:** ${velocity.score} / 100
- **Trend Direction:** ${velocity.trendDirection.toUpperCase()}
- **Commit Frequency (Avg):** ~${velocity.commitFrequency.toFixed(1)} commits / week
- **Days Since Last Commit:** ${velocity.daysSinceLastCommit} days
- **Release Cadence:** ~${velocity.releaseCadence.toFixed(1)} releases / month
- **Total Releases Detected:** ${releases.length}

---

## 3. Bus Factor & Team Concentration
- **Bus Factor Score:** ${busFactor.busFactorScore} / 10 (${busFactor.riskLevel.toUpperCase()} RISK)
- **Top 1 Contributor Share:** ${busFactor.topContributorPct.toFixed(1)}% (@${busFactor.dominantContributor})
- **Top 2 Contributors Share:** ${busFactor.top2ContributorPct.toFixed(1)}%
- **Total Tracked Contributors:** ${contributors.length}

### Top Contributors:
${topContributors}

---

## 4. Code Churn & Refactoring Activity
- **Total Net Additions:** +${churn.additions.toLocaleString()} lines
- **Total Net Deletions:** -${churn.deletions.toLocaleString()} lines
- **Net Codebase Growth:** ${churn.netChange > 0 ? '+' : ''}${churn.netChange.toLocaleString()} lines
- **Churn Ratio (Deletions / Additions):** ${churn.churnRatio.toFixed(2)}

---

## 5. Technology Stack & Language Share
${langList}

---

## 6. Repository Compliance & Hygiene Audit
- **README File:** ${health.hasReadme ? 'Passed (' + health.readmeSize.toLocaleString() + ' bytes)' : 'FAILED - Missing'}
- **License File:** ${health.hasLicense ? 'Passed (' + (health.licenseName || 'Detected') + ')' : 'FAILED - Missing'}
- **CI/CD Workflows:** ${health.hasCICD ? 'Passed (' + health.workflowCount + ' workflows in .github/workflows)' : 'FAILED - No GitHub Actions'}
- **CONTRIBUTING.md:** ${health.hasContributing ? 'Passed' : 'Missing'}
- **Issue Templates:** ${health.hasIssueTemplates ? 'Passed' : 'Missing'}
- **PR Template:** ${health.hasPRTemplate ? 'Passed' : 'Missing'}
- **Semantic Versioning Tags:** ${health.hasSemanticTags ? 'Passed' : 'Missing'}
- **Code of Conduct:** ${health.hasCodeOfConduct ? 'Passed' : 'Missing'}
- **Changelog:** ${health.hasChangelog ? 'Passed' : 'Missing'}

---
*Report generated automatically by DevMetrics Terminal Intelligence.*
`;
}

export function downloadAuditMarkdown(data: RepoData): void {
  const markdown = generateAuditMarkdown(data);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = data.repo.full_name.replace('/', '_');
  a.href = url;
  a.download = `DEV_METRICS_AUDIT_${safeName}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

