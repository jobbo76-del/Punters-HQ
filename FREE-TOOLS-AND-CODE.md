# Punters HQ — Free tools and reusable code register

Updated: 2 November 2026

This register prioritises tools that can be used without buying a paid racing-data subscription. Check each project's current licence, maintenance status and hosting limits before adding it. A free/open-source software licence does not grant rights to third-party racing data.

## Current code we already own

The main application source is in `src/App.tsx`, with the racing workspace in `src/RaceCentre.tsx`, backend routes in `backend/index.ts`, and styles in `src/index.css`.

Existing reusable features include:
- Local bet records, result updates, delete confirmation and JSON export.
- Decimal and multi-leg odds arithmetic.
- Educational record-review endpoint with responsible AI instructions.
- Race workspaces with manual runner details, running-style grouping, ratings comparison and completeness warnings.
- Provider-neutral racing connection status and a BetMakers CoreAPI onboarding checklist.
- Optional read-only WebMCP tools for tracker summary and decimal odds calculation.

Use these as the first source of truth. Avoid rebuilding an existing feature from scratch in a second app.

## Free/open-source software candidates

These are software components, not racing data feeds.

| Need | Candidate | Why it may help | Cost/licence note |
|---|---|---|---|
| Form validation | Zod | Validate user-entered race, runner, odds and bet records before saving | Open-source; MIT licence |
| Date and time handling | date-fns | Reliable local-day/week ranges, timestamps and display formatting | Open-source; MIT licence |
| Charts | Recharts | Show personal performance trends and Edge Lab summaries | Open-source; MIT licence |
| Accessible icons | Lucide React | Consistent icons without a paid icon service | Open-source; ISC licence |
| Unit testing | Vitest | Test odds, returns, P/L, date boundaries and stake-limit calculations | Open-source; MIT licence |
| Browser workflow testing | Playwright | Automate Android-sized and desktop browser journeys | Open-source; Apache-2.0 licence |
| Lightweight local storage | IndexedDB via browser APIs or idb | More robust structured local data than large localStorage blobs | idb is open-source; ISC licence |
| CSV export | Browser Blob / CSV string utility | Let punters export their own tracker data | Can be implemented with native browser APIs; no paid service required |

Do not add a dependency just because it exists. Prefer native browser features or libraries already installed where they are sufficient. Keep the mobile app lightweight.

## Copy-ready calculation examples

### Decimal odds

```ts
export function calculateDecimalOdds(stake: number, odds: number) {
  if (!Number.isFinite(stake) || stake < 0) throw new Error('Stake must be zero or more.');
  if (!Number.isFinite(odds) || odds < 1) throw new Error('Decimal odds must be 1.00 or higher.');
  const grossReturn = stake * odds;
  return {
    impliedProbabilityPercent: 100 / odds,
    grossReturn,
    netProfit: grossReturn - stake,
  };
}
```

### Settled-only profit/loss

```ts
type Result = 'Pending' | 'Won' | 'Lost';

type BetRecord = {
  stake: number;
  odds: number;
  result: Result;
};

export function calculateSettledPerformance(records: BetRecord[]) {
  const settled = records.filter(record => record.result !== 'Pending');
  const stake = settled.reduce((sum, record) => sum + record.stake, 0);
  const returns = settled
    .filter(record => record.result === 'Won')
    .reduce((sum, record) => sum + record.stake * record.odds, 0);

  return {
    settledBets: settled.length,
    settledStake: stake,
    returns,
    netProfitLoss: returns - stake,
    pendingExposure: records
      .filter(record => record.result === 'Pending')
      .reduce((sum, record) => sum + record.stake, 0),
  };
}
```

### Safe date-only comparison

```ts
export function localDayKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

These examples are starting points. Add automated tests for invalid values, refunds/voids, dead heats, partial returns, daylight-saving transitions and local week boundaries before relying on calculations.

## GitHub Actions — free CI starting point

GitHub Actions can run a build and automated tests whenever code is pushed. Public repositories have standard GitHub-hosted runner usage available subject to GitHub's current plan and usage rules. Private repositories may have included minutes and storage limits. Confirm the account's current quota before relying on it.

A starter workflow can be added once the GitHub source has a reproducible clean install and build:

```yaml
name: Punters HQ checks

on:
  push:
    branches: [main]
  pull_request:

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
```

Do not add this workflow until the GitHub source can install and build independently. The current source snapshot uses AppDeploy-specific SDK imports and the checked-in package manifest does not yet prove a standalone restore. First reconcile the AppDeploy SDK dependencies and document the supported restore path.

## What free code cannot replace

- Official Australian race fields, scratchings, results and protected form material.
- Licensed odds and market movements.
- Licensed sectional timing, GPS and replay content.
- Commercial redistribution rights, data warranties or provider support.

Do not scrape sites or republish protected material. Use manual race workspaces, user-entered notes, educational examples, calculations and personal record analysis while no commercial feed is authorised.

## Implementation order

1. Reuse and test the existing tracker, calculators and Race Centre.
2. Add unit tests for calculations and date/limit rules.
3. Persist race notes and provide backup/restore.
4. Prove a clean GitHub restore/build without the existing AppDeploy deployment.
5. Add CI after the clean build works.
6. Keep licensed data integration behind an explicit provider approval and secure backend credentials.
