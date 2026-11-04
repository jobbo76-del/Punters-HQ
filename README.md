# Punters HQ

A mobile-first Australian thoroughbred racing intelligence platform. The aim is to help users research racing, understand markets and form, record their own decisions, and review performance responsibly.

## Live environments

### Production — current public app
https://punters-hq-v6odmo.v2.appdeploy.ai/

Production has deliberately been left unchanged during the recent design and backup work.

### Staging — current development build
https://punters-hq-restore-test-pgvr5z.v2.appdeploy.ai/

Staging includes the approved premium dark visual theme, Dashboard V2 layout, and the full local-data backup/restore feature. The staging changes are not yet released to production.

## Current application capabilities

- Home dashboard with personal tracker metrics, recent selections and a clearly labelled sample leaderboard.
- Personal tracker with selection, race, stake, decimal odds, bookmaker and result recording.
- Device/browser-local storage for tracker records and other supported local tools.
- Personal performance and settled-result calculations.
- Educational AI insights based on recent tracker history; example data is clearly disclosed when there is no personal history. This is not live race analysis or a prediction service.
- Manual Race Centre workspaces with runner records, user-entered ratings, running-style details, comparison and data-readiness warnings.
- Racing notebook with saved local notes.
- Race tools: decimal odds, combined odds, manual bookmaker price comparison and each-way calculation.
- Bankroll and daily/weekly personal tracking limits.
- Learning hub, challenges and achievements.
- Safer-play information and Australian support details.
- Optional read-only WebMCP tools in compatible browsers.

## Staging-only additions not yet released to production

- Dashboard V2, using the owner-approved black, midnight-navy, purple, magenta, gold and emerald visual direction.
- Full JSON backup and restore covering tracker records, racing notes, race workspaces, bankroll/limit settings and provider checklist progress.
- Full-backup Android download/import behavior still requires hands-on acceptance testing.

## Important limitations

- There is no account-based cloud sync. Saved user data remains in the browser on that device unless manually exported and restored.
- The full-backup export/import feature is in staging; do not assume it is in production.
- No licensed live Australian race feed, live bookmaker odds feed, automatic scratchings, live results, streaming or bookmaker account connection is currently verified.
- Odds comparison is manual. Race Centre data is user-entered/manual until a licensed feed is integrated.
- AI insights review personal records; they do not fetch live racecards or produce validated horse-winning probabilities.
- The leaderboard is demonstration data, not a real community leaderboard.
- The app does not place bets.
- A deployment marked ready is not proof that every user workflow has passed hands-on Android and desktop testing.

## Project standards and research

- [Master design system](docs/DESIGN-SYSTEM.md)
- [Racing data foundation and provider evaluation](docs/RACING-DATA-FOUNDATION.md)
- [Current verified status](CURRENT-STATUS.md)
- [Staged product roadmap](ROADMAP.md)
- [Free tools and reusable code register](FREE-TOOLS-AND-CODE.md)

## Source and release status

- GitHub repository: https://github.com/jobbo76-del/Punters-HQ
- Current staging branch: `staging/full-backup-restore-2026-11-03`
- Preserved AppDeploy v11 baseline: `backup/appdeploy-v11-2026-11-03`
- AppDeploy remains the live deployment owner; GitHub is not connected to automatic deployment.
- A clean standalone restore/build/deploy from GitHub has not yet been proven.

## Responsible use

Punters HQ is an educational and record-keeping companion, not financial advice. It does not promise wins or encourage chasing losses. Keep limits and seek support if gambling stops being enjoyable or controlled.

Australian Gambling Help Online: https://www.gamblinghelponline.org.au/  
Phone: 1800 858 858.
