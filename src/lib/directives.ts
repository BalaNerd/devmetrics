import type { RepoData } from './github';

export type DirectiveSeverity =
  | 'CRITICAL ACTION'
  | 'VELOCITY OPTIMIZATION'
  | 'PRODUCTION HYGIENE';

export type BusinessImpact = 'High Risk' | 'Good Hygiene' | 'Needs Polish';

export interface Directive {
  id: string;
  category: 'Velocity & Cadence' | 'Architecture & CI/CD' | 'Open Source & Governance' | 'Quality & Security';
  severity: DirectiveSeverity;
  impactBadge: BusinessImpact;
  title: string;
  badge: string;
  plainExplanation: string;
  summary: string;
  diagnosis: string;
  prescription: string;
  actionFile?: string;
  actionCommand?: string;
  snippet?: string;
  snippetLanguage?: 'yaml' | 'bash' | 'markdown' | 'json';
}

export function generateEngineeringDirectives(data: RepoData): Directive[] {
  const { repo, commits, releases, health, velocity, busFactor, languages } = data;
  const directives: Directive[] = [];

  // Determine Primary Language and breakdown
  const langEntries = Object.entries(languages || {}).sort(([, a], [, b]) => b - a);
  const totalLangBytes = langEntries.reduce((sum, [, b]) => sum + b, 0);
  const topLang = langEntries[0]?.[0] || repo.language || 'TypeScript';
  const topLangBytes = langEntries[0]?.[1] || 0;
  const topLangPct = totalLangBytes > 0 ? (topLangBytes / totalLangBytes) * 100 : 100;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Velocity & Cadence Directive
  // ─────────────────────────────────────────────────────────────────────────────
  if (velocity.daysSinceLastCommit > 14) {
    directives.push({
      id: 'velocity-dormant',
      category: 'Velocity & Cadence',
      severity: 'CRITICAL ACTION',
      impactBadge: 'High Risk',
      title: 'Commit Cadence Hiatus Detected',
      badge: `${velocity.daysSinceLastCommit}d Inactive`,
      plainExplanation: 'No updates have been pushed recently, meaning development has stalled and bug fixes may take months.',
      summary: `Repository has been dormant for ${velocity.daysSinceLastCommit} days. Community velocity is stalling.`,
      diagnosis: `The repository shows a sustained commit hiatus of ${velocity.daysSinceLastCommit} days (last push: ${new Date(
        repo.pushed_at
      ).toLocaleDateString()}). Average weekly commits have dropped to ~${velocity.commitFrequency.toFixed(
        1
      )}/wk, risking loss of open-source momentum and unreviewed community PR stagnation.`,
      prescription:
        'Establish an automated release schedule and triage stale issues to revitalize engineering throughput.',
      actionFile: '.github/workflows/stale-triage.yml',
      actionCommand: 'gh workflow run stale-triage.yml',
      snippetLanguage: 'yaml',
      snippet: `name: "Stale Issue & PR Triage"
on:
  schedule:
    - cron: "0 0 * * 1" # Run weekly on Mondays

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v9
        with:
          repo-token: \${{ secrets.GITHUB_TOKEN }}
          stale-issue-message: "This issue has been automatically marked as stale due to 30 days of inactivity."
          stale-pr-message: "This PR has been inactive for 30 days. Maintainer review required."
          days-before-stale: 30
          days-before-close: 14`,
    });
  } else if (releases.length === 0 || !health.hasSemanticTags) {
    directives.push({
      id: 'velocity-no-releases',
      category: 'Velocity & Cadence',
      severity: 'CRITICAL ACTION',
      impactBadge: 'High Risk',
      title: 'Unversioned Deployments: Setup Semantic Release',
      badge: 'Zero SemVer',
      plainExplanation: 'The project does not tag formal software releases, making it difficult for downstream users to track breaking updates.',
      summary: 'No semantic release tags found. Upstream consumers cannot safely track breaking changes.',
      diagnosis:
        'Releases are unversioned or published ad-hoc without semantic versioning tags (vX.Y.Z). Downstream package consumers and contributors have no deterministic changelog for bug fixes, features, or breaking changes.',
      prescription:
        'Deploy Google Release-Please to automate GitHub Releases, Git tagging, and CHANGELOG.md generation upon merging PRs.',
      actionFile: '.github/workflows/release-please.yml',
      actionCommand: 'npx release-please-cli release-pr',
      snippetLanguage: 'yaml',
      snippet: `name: Release Please
on:
  push:
    branches:
      - ${repo.default_branch || 'main'}

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          release-type: node
          package-name: "${repo.name}"`,
    });
  } else if (!health.hasChangelog) {
    directives.push({
      id: 'velocity-changelog',
      category: 'Velocity & Cadence',
      severity: 'VELOCITY OPTIMIZATION',
      impactBadge: 'Needs Polish',
      title: 'Automated Changelog & Release Drafter',
      badge: 'Changelog Gap',
      plainExplanation: 'Engineers are shipping code fast, but there is no written changelog explaining what each update contains.',
      summary: `High commit cadence (~${velocity.commitFrequency.toFixed(1)}/wk) lacks an automated changelog generator.`,
      diagnosis:
        'Commits are actively landing on trunk without an automated changelog generator, causing release friction and undocumented regressions between release versions.',
      prescription:
        'Adopt GitHub Release Drafter to automatically categorize merged PRs by labels (features, bug fixes, breaking changes).',
      actionFile: '.github/release-drafter.yml',
      snippetLanguage: 'yaml',
      snippet: `name-template: 'v$RESOLVED_VERSION'
tag-template: 'v$RESOLVED_VERSION'
categories:
  - title: '🚀 Features'
    labels: ['enhancement', 'feature']
  - title: '🐛 Bug Fixes'
    labels: ['fix', 'bug']
  - title: '🧰 Maintenance'
    labels: ['chore', 'dependencies']
version-resolver:
  major: { labels: ['breaking'] }
  minor: { labels: ['feature'] }
  patch: { labels: ['fix'] }`,
    });
  } else {
    directives.push({
      id: 'velocity-healthy',
      category: 'Velocity & Cadence',
      severity: 'PRODUCTION HYGIENE',
      impactBadge: 'Good Hygiene',
      title: 'Release Cadence Optimization & PR Previews',
      badge: 'Cadence Engine',
      plainExplanation: 'The engineering team is consistently shipping updates with healthy velocity and active maintainer presence.',
      summary: `Healthy velocity score (${velocity.score}/100) with ~${velocity.commitFrequency.toFixed(1)} commits/week.`,
      diagnosis:
        'The repository maintains a healthy commit velocity. The next tier-1 engineering enhancement is deploying automated ephemeral PR preview environments to accelerate review feedback cycles.',
      prescription:
        'Add pull-request preview validation comments with build timing and staging artifact URLs.',
      actionFile: '.github/workflows/preview.yml',
      snippetLanguage: 'yaml',
      snippet: `name: Preview Status
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Verification
        run: |
          echo "Building preview deployment for PR #\${{ github.event.pull_request.number }}..."
          # Deploy to preview URL / Vercel Preview
      - uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Ephemeral Preview Environment Deployed successfully.'
            })`,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Architecture & CI/CD Prescription
  // ─────────────────────────────────────────────────────────────────────────────
  if (!health.hasCICD || health.workflowCount === 0) {
    let ciSnippet = '';
    const isTS = topLang.toLowerCase().includes('typescript') || topLang.toLowerCase().includes('javascript');
    const isPython = topLang.toLowerCase().includes('python');
    const isRust = topLang.toLowerCase().includes('rust');
    const isGo = topLang.toLowerCase().includes('go');

    if (isTS) {
      ciSnippet = `name: Production CI
on:
  push:
    branches: [${repo.default_branch || 'main'}]
  pull_request:
    branches: [${repo.default_branch || 'main'}]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    name: Typecheck, Lint & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: TypeScript Validation
        run: npx tsc --noEmit
      - name: ESLint Check
        run: npm run lint --if-present
      - name: Automated Tests
        run: npm test --if-present`;
    } else if (isPython) {
      ciSnippet = `name: Python CI
on:
  push:
    branches: [${repo.default_branch || 'main'}]
  pull_request:
    branches: [${repo.default_branch || 'main'}]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      - run: pip install -r requirements.txt
      - run: pytest -v`;
    } else if (isRust) {
      ciSnippet = `name: Rust CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt
      - run: cargo fmt --check
      - run: cargo clippy -- -D warnings
      - run: cargo test`;
    } else if (isGo) {
      ciSnippet = `name: Go CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - run: go test -v ./...`;
    } else {
      ciSnippet = `name: CI Matrix
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Build & Verification
        run: echo "Configuring CI for ${topLang}..."`;
    }

    directives.push({
      id: 'cicd-missing',
      category: 'Architecture & CI/CD',
      severity: 'CRITICAL ACTION',
      impactBadge: 'High Risk',
      title: `Missing Production CI/CD Pipeline (${topLang})`,
      badge: 'Zero Workflows',
      plainExplanation: 'Changes are not automatically verified by test bots before publishing, which means broken code can easily break production.',
      summary: `Zero GitHub Actions workflows detected for ${topLang} codebase (${topLangPct.toFixed(0)}% of repo).`,
      diagnosis:
        'Every pull request is currently merged without automated type validation, lint verification, or test execution. Regressions can escape to production undetected.',
      prescription: `Deploy an optimized, parallelized ${topLang} CI workflow with dependency caching and static analysis gates.`,
      actionFile: '.github/workflows/ci.yml',
      actionCommand: 'git add .github/workflows/ci.yml && git commit -m "ci: add production workflow"',
      snippetLanguage: 'yaml',
      snippet: ciSnippet,
    });
  } else {
    directives.push({
      id: 'cicd-optimized',
      category: 'Architecture & CI/CD',
      severity: 'VELOCITY OPTIMIZATION',
      impactBadge: 'Needs Polish',
      title: 'CI Matrix: Bundle Size & Performance Guard',
      badge: `${health.workflowCount} Workflows Active`,
      plainExplanation: 'Automated tests exist, but adding performance & bundle size guards will prevent the codebase from growing sluggish.',
      summary: `${health.workflowCount} active workflow(s). Add automated PR bundle size diffs and regression gates.`,
      diagnosis:
        'Existing CI runs basic tests, but lack automated bundle size budget gates and performance delta tracking across pull requests.',
      prescription:
        'Configure automated bundle analysis that generates visual size comparison diffs directly on every PR comment.',
      actionFile: '.github/workflows/bundle-size.yml',
      snippetLanguage: 'yaml',
      snippet: `name: Bundle Size Analysis
on:
  pull_request:
    branches: [${repo.default_branch || 'main'}]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build --if-present
      - name: Size Limit Check
        run: npx size-limit`,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Open Source & Governance Signal
  // ─────────────────────────────────────────────────────────────────────────────
  if (busFactor.busFactorScore <= 3 || busFactor.topContributorPct >= 65) {
    directives.push({
      id: 'governance-bus-factor',
      category: 'Open Source & Governance',
      severity: 'CRITICAL ACTION',
      impactBadge: 'High Risk',
      title: `Critical Bus Factor: Single Maintainer Hazard (${busFactor.busFactorScore}/10)`,
      badge: `Bus Factor ${busFactor.busFactorScore}/10`,
      plainExplanation: '80%+ of this project relies on a single author. If they step away or face burnout, external contributions stall.',
      summary: `@${busFactor.dominantContributor} authored ${busFactor.topContributorPct.toFixed(
        1
      )}% of all contributions. High operational fragility.`,
      diagnosis: `The project suffers from extreme single-maintainer dependency. If @${busFactor.dominantContributor} becomes unavailable or faces burnout, review throughput halts and institutional architecture knowledge is lost.`,
      prescription:
        'Establish explicit codeownership via .github/CODEOWNERS and define sub-system maintainers to distribute architectural review responsibilities.',
      actionFile: '.github/CODEOWNERS',
      snippetLanguage: 'yaml',
      snippet: `# Global repository fallback owners
* @${busFactor.dominantContributor}

# Core application & architecture
/src/ @${busFactor.dominantContributor}

# Governance & CI/CD pipelines
/.github/ @${busFactor.dominantContributor}

# Documentation & guides
*.md @${busFactor.dominantContributor}`,
    });
  } else if (!health.hasContributing || !health.hasIssueTemplates) {
    directives.push({
      id: 'governance-templates',
      category: 'Open Source & Governance',
      severity: 'VELOCITY OPTIMIZATION',
      impactBadge: 'Needs Polish',
      title: 'Community Contribution Architecture & Issue Forms',
      badge: 'Governance Gap',
      plainExplanation: 'External bug reports arrive unstructured without reproduction steps, slowing down maintainers trying to solve problems.',
      summary: 'Missing structured issue templates and contributor guidelines creates triage friction.',
      diagnosis:
        'Community contributors currently submit unstructured bug reports without environment info, stack traces, or reproduction steps, draining core team review capacity.',
      prescription:
        'Add GitHub YAML Issue Forms (.github/ISSUE_TEMPLATE) with required reproduction steps and system telemetry.',
      actionFile: '.github/ISSUE_TEMPLATE/bug_report.yml',
      snippetLanguage: 'yaml',
      snippet: `name: 🐛 Bug Report
description: File a reproducible bug report to help us resolve issues
title: "[Bug]: "
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: Thanks for filing a bug report! Please provide reproduction steps.
  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      placeholder: 1. Go to '...'\n2. Click '...'\n3. See error
    validations:
      required: true
  - type: textarea
    id: environment
    attributes:
      label: Environment Telemetry
      description: OS version, Node version, Browser version
    validations:
      required: true`,
    });
  } else {
    directives.push({
      id: 'governance-delegation',
      category: 'Open Source & Governance',
      severity: 'PRODUCTION HYGIENE',
      impactBadge: 'Good Hygiene',
      title: 'Maintainer Team Reviewer Delegation Matrix',
      badge: 'Distributed Team',
      plainExplanation: 'Multiple authors are collaborating nicely. Automating reviewer assignments will speed up pull request approvals.',
      summary: `Healthy contributor distribution (${busFactor.busFactorScore}/10 bus factor). Maintainers can automate reviewer round-robin.`,
      diagnosis:
        'The repository maintains a healthy multi-contributor base. Review turnaround time can be further halved by auto-assigning PR reviewers based on git history.',
      prescription:
        'Deploy GitHub action reviewer delegation to distribute code reviews evenly across maintainers.',
      actionFile: '.github/workflows/auto-assign.yml',
      snippetLanguage: 'yaml',
      snippet: `name: Auto Assign Reviewers
on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: kentaro-m/auto-assign-action@v2
        with:
          configuration-path: '.github/auto_assign.yml'`,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Quality & Security Prescription
  // ─────────────────────────────────────────────────────────────────────────────
  const ecoSystem = topLang.toLowerCase().includes('python')
    ? 'pip'
    : topLang.toLowerCase().includes('rust')
    ? 'cargo'
    : topLang.toLowerCase().includes('go')
    ? 'gomod'
    : 'npm';

  directives.push({
    id: 'security-dependabot',
    category: 'Quality & Security',
    severity: 'PRODUCTION HYGIENE',
    impactBadge: 'Good Hygiene',
    title: 'Automated Supply-Chain Security & Dependabot Guard',
    badge: 'Security Scan',
    plainExplanation: 'Automated bots scan dependencies weekly for known vulnerabilities, keeping the application safe from zero-day exploits.',
    summary: 'Automate weekly third-party dependency CVE audits and security patches.',
    diagnosis: `Open-source packages accumulate transitive vulnerabilities rapidly. Without automated weekly dependency security scanning in ${ecoSystem}, patches lag and security posture degrades.`,
    prescription: `Add .github/dependabot.yml configured with grouped weekly updates to minimize PR noise while eliminating zero-day dependency vulnerabilities.`,
    actionFile: '.github/dependabot.yml',
    snippetLanguage: 'yaml',
    snippet: `version: 2
updates:
  - package-ecosystem: "${ecoSystem}"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
    open-pull-requests-limit: 10
    groups:
      dependencies:
        patterns:
          - "*"
    commit-message:
      prefix: "chore(deps)"`,
  });

  return directives;
}

