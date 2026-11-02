# Punters HQ — Current verified status

**Snapshot date:** 3 November 2026  
**AppDeploy app:** `punters-hq-v6odmo`  
**Live URL:** https://punters-hq-v6odmo.v2.appdeploy.ai/  
**Workspace:** AppDeploy Primary  
**GitHub source repository:** https://github.com/jobbo76-del/Punters-HQ

## Deployment
- AppDeploy returned deployment status **ready**.
- The current live URL is unchanged.
- The latest status response reported no frontend or backend errors and no QA frontend/network errors.
- This does not establish that all user journeys have passed hands-on testing.

## Source export — completed checkpoint
- Re-read the current AppDeploy snapshot (version `1793598045988`) and synchronised all 13 source/configuration/test files into GitHub.
- Compared all 13 files byte-for-byte between AppDeploy and GitHub `main`; every comparison matched.
- Updated the previously stale versions of `src/App.tsx`, `src/RaceCentre.tsx`, `src/index.css`, `backend/index.ts` and `tests/tests.json` to match the current AppDeploy source.
- Created recovery branch `appdeploy-source-backup-2026-11-03` from the synchronised `main` branch.
- A clean restore/build/deploy has not yet been tested.
- `package.json` does not list the AppDeploy-specific `@appdeploy/client` and `@appdeploy/sdk` packages imported by the source, and there is no verified lockfile. AppDeploy supplies these runtime integrations in its own environment. A standalone build therefore remains unproven and must not be represented as ready.
- GitHub is not connected to an automatic AppDeploy deployment pipeline. AppDeploy remains the live deployment owner.

## Confirmed MVP scope
- Dashboard, personal tracker, browser-local persistence and JSON export.
- Sample leaderboard, labelled as sample data.
- Educational AI record insights.
- Starter lessons, challenges and achievements.
- Safer-play reminder and Australian support details.
- Decimal and combined odds calculators.
- Speed-map and track-rating education.
- Race-day checklist and manual race notes.
- Optional read-only WebMCP tracker-summary and odds-calculation tools for compatible browsers.

## Known gaps
1. Clean restore/build/deploy from the GitHub source has not yet been proven.
2. No automatic GitHub-to-AppDeploy deployment pipeline is configured.
3. Tracker data does not sync between devices.
4. Race notes are temporary and are not saved permanently.
5. Racing data, odds, leaderboard and examples are not live feeds.
6. No live betting or bookmaker integration exists.
7. Hands-on Android and desktop testing and systematic E2E execution still need to be completed.
8. The app icon upload was previously left pending; do not assume it is installed until verified.

## Release gate before public promotion
- Prove the GitHub source can restore/build/deploy without relying on the existing live snapshot.
- Test on Android: navigation, add/edit/delete tracker records, refresh persistence, JSON export, calculations and mobile layout.
- Test on desktop: same core flows and keyboard/accessibility basics.
- Confirm local-storage and privacy wording is clear.
- Confirm all sample data is visibly labelled.
- Confirm safer-play information is reachable.
- Verify the app icon and PWA install experience.
