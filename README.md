# DevMetrics

> **Quantitative Engineering Intelligence, Repository Velocity & Live Deployment Telemetry**

DevMetrics is an executive-grade engineering intelligence platform and live web diligence engine designed with the aesthetics of tier-1 developer platforms (Linear, Raycast, Vercel). It analyzes GitHub repositories and live web deployments to deliver deep velocity metrics, contributor distribution models, governance hygiene audits, Core Web Vitals, and actionable engineering directives.

DevMetrics offers genuine **Dual-Audience Architecture**: seamless toggling between an uncompromising **Technical Mode** for staff engineers and cloud architects, and a jargon-free **Plain English Mode** tailored for founders, recruiters, and non-technical stakeholders.

---

## Key Capabilities

### 1. Engineering Command Cockpit
- **Universal Telemetry Dispatch**: Accepts GitHub repositories (`owner/repo`, GitHub URLs) and live websites (`https://my-app.vercel.app`, custom domains).
- **Instant Reference Artifacts**: One-click benchmark profiles representing distinct architectural archetypes:
  - High Velocity & Scale (`shadcn/ui`)
  - Solo Creator Concentration (`antfu/unocss`)
  - Established Enterprise Engine (`facebook/react`)
  - Full-Stack Live Vercel Deployment (`devmetrics.vercel.app`)
- **Cached Telemetry Engine**: LocalStorage search history and GitHub REST integration with rate-limit status telemetry.

### 2. Dual-Audience Architectural Separation
DevMetrics enforces two completely distinct rendering pipelines across all telemetry views:

#### Plain English Mode (Founders, Recruiters & Executives)
- **Executive Dilemma & Verdict Cards**: Clear project health classifications (*Ready for Visitors & Recruiters*, *Fast & Reliable*, *Active Shipping*).
- **Conversational Takeaways**: Everyday language breakdowns covering visitor speed, mobile responsiveness, social sharing previews, and operational security.
- **Team Dynamics**: Evaluates solo builder bottlenecks vs. distributed maintainer resilience without academic formulas.
- **Actionable Next Steps**: Plain-language recommendations with impact badges (*Quick Win*, *High Impact*) and zero code syntax.
- **Recruiter Brief Generator**: One-click copyable portfolio summaries ready for client proposals and hiring manager reviews.

#### Technical Mode (Staff Engineers & Cloud Architects)
- **Commit Telemetry & Velocity Cadence**: Exact commit velocity (commits/week), 30-day commit variance, churn ratio (del/add), and recent commit SHA signatures.
- **Pareto Bus Factor & Governance Risk**: Pareto top 20% commit concentration, Gini inequality coefficient curve, decentralization index (1-10), and CODEOWNERS governance assessment.
- **Hygiene & Compliance Checklist**: SPDX license verification, GitHub Actions CI/CD workflows, branch protection rules, and SemVer tag auditing.
- **DOM & Bundle Footprint**: Exact counts of external script bundles, stylesheets, unoptimized images, missing alt attributes, and viewport configurations.
- **HTTP Response & Edge Inspector**: Monospace table inspecting Edge server headers, cache-control directives, HSTS, CSP, and X-Frame-Options with explicit `PASS` / `MISSING` posture badges.
- **Remediation Directives with Code Drawers**: Actionable technical directives with copyable Next.js and TypeScript configurations.

### 3. Universal Comparison Arena (Head-to-Head Telemetry Deck)
- **Multi-Target Matchups**: Compare Repo vs. Repo, Live URL vs. Live URL, or cross-audit Live Deployment vs. Source Repository.
- **Overall Matchup Scoreboard**: Live category win counter (`winsA — winsB`) with an animated crown badge on the leading contender.
- **Center "VS" Swap Reactor**: Interactive swap medallion with 180-degree spring physics and smooth Framer Motion layout gliding.
- **Center-Outward Tug-of-War Bars**: Animated dual-progress bars expanding symmetrically from center zero-axis with numeric delta badges (`+18 pts`, `-240ms faster`, `+45.2k stars`).
- **Resilient Concurrency**: Per-contender error handling via `Promise.allSettled` ensures one mistyped target never breaks the matchup.
- **Clean Input State**: Zero auto-refill on erase with dedicated clear buttons and quick-preset matchup chips.

### 4. Live Deployment & Vercel Diligence Engine
- **Core Web Vitals & PageSpeed Gauges**: 4 circular radial gauges evaluating Performance, Accessibility, Best Practices, and SEO.
- **Edge Latency & Infrastructure**: Server response timing (TTFB ms), HTTP status codes, edge cache hit ratio, and SSL/TLS protocol verification.
- **Linked Repository Discovery**: Automated HTML heuristics scan public navbars, footers, and ribbons to surface linked GitHub source repositories with a 1-click cross-audit offer.
- **OpenGraph & Social Preview Audit**: Inspects `og:title`, `og:description`, `og:image`, `twitter:card`, and canonical URL configurations.

### 5. Developer Intelligence Workbench
- **7x24 Activity Matrix**: Hourly punch-card heat map tracking shipping rhythm and distribution across weekdays and weekends, equipped with a 30-day, 90-day, and full-history timeline scrubber.
- **Code Churn & Velocity**: Analyzes code additions vs. deletions to highlight refactoring cycles and codebase growth trends.
- **Security & Dependency Auditor**: Scans dependency manifests for potential vulnerabilities and outdated packages.
- **Cloud Cost Estimator**: Estimates monthly operational server, database, and bandwidth expenditures.
- **Shields.io Badge Generator**: Copyable SVG and Markdown shields for repository READMEs showcasing DevMetrics health scores.
- **Export Engine**: Export comprehensive audit reports in formatted Markdown (`DEV_METRICS_AUDIT.md`) or print-ready PDF formats.

---

## Design System & Aesthetics

DevMetrics is crafted around a bespoke **Obsidian Burgundy** dark palette, engineered for high contrast and executive authority:

| Token | Hex Value | Purpose |
| :--- | :--- | :--- |
| **Base Canvas** | `#120909` | Deep obsidian backdrop |
| **Surface** | `#180d0d` | Elevated card containers & modules |
| **Deep Burgundy** | `#590907` | Primary action fills, active borders & glows |
| **Warm Cream** | `#E8D2B5` | Primary typographic hierarchy & metric readouts |
| **Muted Sage** | `#A5A79B` | Secondary labels, descriptions & subtle borders |

### Typography System
- **Display & Hero**: *Instrument Serif* - Editorial elegance for hero headlines and repository titles.
- **Interface & Narrative**: *Inter* - Clean legibility for primary navigation, cards, and summaries.
- **Telemetry & Code**: *IBM Plex Mono* - Tabular numbers for financial metrics, latency times, and code snippets.

---

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with persistent storage)
- **Visualizations**: [Recharts](https://recharts.org/) & Custom SVG Radial Gauges
- **Iconography**: [Lucide React](https://lucide.dev/) (Strictly vector icons, zero emojis)
- **Type Safety**: [TypeScript 5](https://www.typescriptlang.org/)

---

## Project Structure

```text
devmetrics/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── audit-url/        # Live website crawling & metadata extraction
│   │   │   └── github/           # GitHub REST API proxy & caching
│   │   ├── globals.css           # Tailwind v4 theme tokens & glassmorphic utilities
│   │   ├── layout.tsx            # Font variable configuration & global shell
│   │   └── page.tsx              # Main dashboard router (Cockpit vs. Telemetry View)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── BusFactor.tsx             # Contributor centralization & Gini index
│   │   │   ├── CommandCockpit.tsx        # Executive home dispatch cockpit
│   │   │   ├── HealthChecklist.tsx       # SPDX & CI/CD compliance checklist
│   │   │   ├── HumanReadableSummary.tsx  # Executive portfolio brief & dilemma card
│   │   │   ├── LiveUrlAudit.tsx          # Live web deployment audit console
│   │   │   ├── PunchCard.tsx             # 7x24 weekly commit rhythm matrix
│   │   │   ├── RepoComparisonModal.tsx   # Universal comparison arena
│   │   │   ├── RepoHeader.tsx            # Repository avatar, stats & action bar
│   │   │   ├── VelocityScore.tsx         # Commit velocity gauge & variance tracker
│   │   │   ├── WorkbenchLayout.tsx       # Detail tabs (Churn, Directives, Stack, etc.)
│   │   │   └── WorkbenchTabs.tsx         # Multi-row wrapped navigation tab pill strip
│   │   ├── layout/
│   │   │   ├── AppModals.tsx             # Global modal mounting layer
│   │   │   ├── CommandBar.tsx            # Command palette (Cmd+K)
│   │   │   └── Header.tsx                # Sticky top navbar with permanent Compare trigger
│   │   └── ui/
│   │       ├── PullToRefresh.tsx         # Tactile mobile pull-to-refresh
│   │       ├── SteppedAuditLoader.tsx    # Multi-stage deterministic progress loader
│   │       ├── Toast.tsx                 # Non-intrusive notifications
│   │       └── TopProgressBar.tsx        # Viewport progress line indicator
│   ├── hooks/
│   │   ├── useLiveAudit.ts       # Live URL audit dispatch hook
│   │   └── useRepo.ts            # GitHub repository data fetching hook
│   ├── lib/
│   │   ├── directives.ts         # Automated engineering recommendations generator
│   │   ├── exportAudit.ts        # Markdown and PDF export generators
│   │   ├── github.ts             # GitHub API client & TypeScript interfaces
│   │   ├── liveAuditor.ts        # HTML parsing, security headers & Core Web Vitals
│   │   ├── metrics.ts            # Algorithmic scoring models (Velocity, Bus Factor, Grade)
│   │   └── urlRouter.ts          # Auto-classification (GitHub repo vs. live URL)
│   └── store/
│       └── useAppStore.ts        # Central Zustand application state store
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm`, `pnpm`, or `bun`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BalaNerd/devmetrics.git
   cd devmetrics
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Create a `.env.local` file in the root directory:
   ```env
   # Increases GitHub API rate limits from 60 req/hr to 5,000 req/hr
   GITHUB_TOKEN=your_github_personal_access_token
   ```
   *Note: DevMetrics functions out-of-the-box without a token using public GitHub endpoints and local in-app token configuration.*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Dev** | `npm run dev` | Launches local Turbopack development server on port 3000 |
| **Build** | `npm run build` | Compiles optimized production bundle with type validation |
| **Start** | `npm run start` | Boots production server |
| **Lint** | `npm run lint` | Runs ESLint analysis across codebase |

---

## License

This project is licensed under the [MIT License](LICENSE).
