# Punters HQ

A mobile-first Australian racing companion designed to help punters learn, calculate, record and review their own decisions.

## Live app

https://punters-hq-v6odmo.v2.appdeploy.ai/

Hosted on AppDeploy. The current deployment was reported as **ready** on 2 November 2026.

## Current MVP features

- Home dashboard with personal statistics, recent selections and a clearly labelled sample leaderboard.
- Personal tracker with add, edit, delete, stake, decimal odds and result recording.
- Browser-local tracker storage and JSON backup export.
- Educational AI insights based on recorded history; demo information is used when there are no personal records.
- Starter Learning Hub, challenges and achievement progress.
- Safer-play weekly tracking-limit reminder and Australian support details.
- Decimal odds and combined multi-leg calculators.
- Educational speed-map guide, Australian track-rating guide and race-day checklist.
- Manual race notes (temporary while the page remains open).
- Optional sound/animation and reduced-motion support.
- Optional read-only WebMCP tools in compatible browsers: tracker summary and decimal-odds calculation.

## Important limitations

- Tracker data is device/browser-local; there is no account-based cloud sync.
- Demo leaderboard and racing examples are not live results.
- No live odds, live race feeds, scratchings feed, streaming, bookmaker connection or bet placement.
- AI insights are educational summaries, not reliable predictions or betting recommendations.
- Race notes are not currently saved permanently.
- WebMCP tools only appear in compatible browser environments and are read-only.
- A deployment marked ready is not proof that every user workflow has passed hands-on testing.

## Source and release status

The current AppDeploy source snapshot has now been exported into this repository, including the React application, stylesheet, backend handler, project configuration, PWA manifest and test definitions. This is a source-code checkpoint, not yet a proven restore: a clean restore/build/deploy test still needs to be completed. GitHub is not connected to an automatic AppDeploy deployment pipeline; AppDeploy remains the live deployment owner.

- [Current verified status](CURRENT-STATUS.md)
- [Staged product roadmap](ROADMAP.md)
- [Free tools and reusable code register](FREE-TOOLS-AND-CODE.md)

## Responsible use

Punters HQ is an educational and record-keeping companion, not financial advice. It does not promise wins or encourage chasing losses. Users should set limits and seek support if gambling stops being enjoyable or controlled.

Australian Gambling Help Online: https://www.gamblinghelponline.org.au/  
Phone: 1800 858 858.
