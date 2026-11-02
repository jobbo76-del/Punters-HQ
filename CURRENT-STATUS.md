# Punters HQ — Current verified status

**Snapshot date:** 2 November 2026  
**AppDeploy app:** `punters-hq-v6odmo`  
**Live URL:** https://punters-hq-v6odmo.v2.appdeploy.ai/  
**Workspace:** AppDeploy Primary

## Deployment
- AppDeploy returned deployment status **ready**.
- The current live URL is unchanged.
- No validation or E2E test results were supplied in the status response.
- Do not claim full manual or end-to-end testing has passed.

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
1. Full source code has not yet been exported into this GitHub repository.
2. GitHub is not connected to an automatic AppDeploy deployment pipeline.
3. Tracker data does not sync between devices.
4. Race notes are temporary and are not saved permanently.
5. Racing data, odds, leaderboard and examples are not live feeds.
6. No live betting or bookmaker integration exists.
7. Hands-on mobile testing and systematic E2E execution still need to be completed.
8. The app icon upload was previously left pending; do not assume it is installed until verified.

## Release gate before public promotion
- Test on Android: navigation, add/edit/delete tracker records, refresh persistence, JSON export, calculations and mobile layout.
- Test on desktop: same core flows and keyboard/accessibility basics.
- Confirm local-storage and privacy wording is clear.
- Confirm all sample data is visibly labelled.
- Confirm safer-play information is reachable.
- Export the full app source and verify that the repository can restore the app.
