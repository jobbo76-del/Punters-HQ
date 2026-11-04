# Punters HQ — Current verified status

**Snapshot date:** 4 November 2026  
**Production AppDeploy app:** `punters-hq-v6odmo`  
**Production URL:** https://punters-hq-v6odmo.v2.appdeploy.ai/  
**Staging AppDeploy app:** `punters-hq-restore-test-pgvr5z`  
**Staging URL:** https://punters-hq-restore-test-pgvr5z.v2.appdeploy.ai/  
**GitHub repository:** https://github.com/jobbo76-del/Punters-HQ  
**Working branch:** `staging/full-backup-restore-2026-11-03`

## 1. Production protection

- Production remains the existing Punters HQ v6 app.
- The recent design and full-backup work has been carried out in the separate staging app.
- No production deployment was made as part of the Dashboard V2 or full-backup work.
- Do not merge or deploy staging changes to production without the owner's explicit approval.

## 2. Staging deployment

- Latest staging snapshot: `1793772674451`.
- AppDeploy status: **ready**.
- Latest automated status check reported no frontend errors, no backend errors and no QA frontend/network errors.
- Validation warning: `tests/tests.json` currently contains six tests; AppDeploy recommends three to five.
- Automated readiness is not equivalent to hands-on Android acceptance testing.

## 3. Confirmed application capabilities

The current app source contains:
- Responsive dashboard and navigation.
- Personal tracker with create, result update and delete workflows.
- Device-local persistence for tracker data.
- Personal performance calculations and settled-entry statistics.
- Educational AI review of tracker history, with an example-data fallback clearly disclosed when there are no user entries.
- Race Centre with manually created race workspaces and runners, user-entered ratings, running-style grouping, runner comparison, completeness warnings and data-source disclosures.
- Racing notebook notes saved in browser local storage.
- Manual bookmaker odds comparison.
- Decimal odds, combined multi-leg odds and each-way calculations.
- Starting bankroll and daily/weekly personal tracking limits.
- Learning content, challenges and achievements.
- Australian safer-play resources.
- Optional read-only WebMCP tools in compatible browsers.

## 4. Staging-only work now present

### Dashboard V2
- Applies the owner-approved dark racing design system.
- Uses black and midnight navy, electric purple/violet, magenta, gold and emerald accents.
- Reorganises the dashboard around personal performance, recent selections, Race Centre, race tools, insights and learning.
- Uses existing app data and existing navigation destinations; it does not invent live racing figures.

### Full backup and restore
- Exports a JSON file containing tracker entries, racing notes, race workspaces, bankroll and limit settings, and provider checklist progress.
- Restore validates the file and asks for confirmation before replacing those saved local records.
- Data remains device/browser-local; this is a manual transfer mechanism, not automatic cloud sync.
- Android download/import flow still requires hands-on confirmation.

## 5. Racing data status

- No live licensed race-data provider is connected.
- No live bookmaker odds feed is connected.
- Race Centre is currently manual/user-entered.
- The dashboard must keep live-data status clear and must not display sample data as live information.
- A current supplier research and integration specification is in [docs/RACING-DATA-FOUNDATION.md](docs/RACING-DATA-FOUNDATION.md).
- A written quote and commercial rights review are still required before choosing or connecting a supplier.

## 6. Data persistence and backup limitations

- Local storage does not sync automatically between Joie's device and Kyle's Android phone.
- Clearing browser data may remove local records.
- Do not clear browser data while conducting backup/restore testing.
- Do not claim the full-backup feature has passed on Android until the owner confirms the download and restore test.

## 7. GitHub source status

- `backup/appdeploy-v11-2026-11-03` preserves the AppDeploy v11 baseline.
- `staging/full-backup-restore-2026-11-03` contains the full-backup work, Dashboard V2 source, tests, and current project documentation.
- The latest dashboard code files were synced from AppDeploy to this staging branch.
- GitHub is not connected to an automatic AppDeploy deployment pipeline.
- A clean standalone restore/build/deploy from GitHub remains unproven.

## 8. Known gaps and next work

1. Complete hands-on Android testing of full backup download and restore.
2. Test main workflows on Android and desktop: navigation, tracker create/update/delete, persistence, calculations, race notes, Race Centre and limits.
3. Independently validate profit/loss arithmetic for pending, won, lost, void, dead-heat and each-way settlement cases before using it for important reporting.
4. Obtain commercial proposals and written rights from suitable Australian racing data suppliers.
5. Build a provider-neutral data adapter only after source scope, cost and licence permissions are confirmed.
6. Reconcile the six-test suite and add focused tests for any changed workflow.
7. Prove a clean restore/build/deploy path from GitHub before relying on GitHub as the recovery route.

## 9. Release gate before production promotion

- Owner approves the release.
- Full backup/restore is tested on a real Android device.
- Main user journeys pass desktop and mobile checks.
- Calculations have automated test coverage and are independently checked.
- Sample/manual/live data is labelled correctly.
- Data licensing is signed off for every externally sourced field shown.
- Privacy, storage, export and recovery wording is clear.
- Responsible-play pathways are accessible.
- Rollback and recovery path is documented.
