# Punters HQ — Staged roadmap

This roadmap preserves the current working application and separates low-risk improvements from work that requires paid services, commercial data licences or additional privacy/security design.

## Stage 1 — Protect and verify the existing app
- [x] Preserve the AppDeploy v11 source baseline.
- [x] Create a separate staging/recovery app without changing production.
- [x] Add full JSON backup and restore for supported device-local records in staging.
- [x] Keep racing notes and Race Centre workspaces in the full staging backup.
- [ ] Confirm the full backup file downloads on Kyle's Android phone.
- [ ] Complete a safe restore test on a second browser/device.
- [ ] Run hands-on Android and desktop checks for tracker, calculations, race notes, Race Centre and bankroll limits.
- [ ] Independently verify P/L and settlement edge cases.
- [ ] Prove a repeatable clean restore/build/deploy from GitHub.
- [ ] Verify app icon and PWA install behavior.

## Stage 2 — Apply the approved product design
- [x] Record the owner-approved master visual reference.
- [x] Create the master design-system specification in `docs/DESIGN-SYSTEM.md`.
- [x] Apply the premium dark visual theme to staging.
- [x] Build Dashboard V2 around existing, correctly labelled app data.
- [ ] Review the new dashboard on an actual Android phone.
- [ ] Bring any remaining screen-level inconsistencies into line with the master design system.
- [ ] Refine navigation, page headings, empty states and mobile density after hands-on review.

## Stage 3 — Licensed Australian racing data foundation
- [x] Research the Racing Australia authorised wholesaler framework.
- [x] Prepare provider comparison and data-integration requirements in `docs/RACING-DATA-FOUNDATION.md`.
- [ ] Obtain written commercial proposals from BetMakers and Mediality Racing.
- [ ] Obtain commercial sectional/API pricing from Punting Form if needed.
- [ ] Confirm commercial rights for live odds and historical exchange data with Betfair or another approved supplier.
- [ ] Compare rights for display, freemium/premium tiers, storage, retention, AI-derived outputs, attribution and redistribution.
- [ ] Select the smallest commercially licensed package that covers the launch requirements.
- [ ] Build provider adapters and normalised race/runner/horse/person data only after provider selection and licence review.

## Stage 4 — Real racing intelligence
- Australian meetings, racecards, runners, scratchings and results.
- Horse profiles and historical starts.
- Jockey, trainer and owner profiles and statistics where licensed.
- Track/distance/class/going suitability.
- Sectionals, pace, race shape and speed maps where data rights and coverage permit.
- Clearly explained data quality, source, timestamp and confidence.

## Stage 5 — Markets and personal intelligence
- Licensed live bookmaker odds and historical price movement.
- Best-price comparisons and market movement views.
- Closing-line-value and price history where permitted.
- Blackbook entries and future-race alerts.
- Stronger performance reporting, filters and date ranges.
- Independently validated settlement and P/L for voids, dead heats and each-way bets.

## Stage 6 — Optional accounts and cross-device sync
Only after privacy and security design:
- User-controlled accounts and secure sync.
- User export and account deletion.
- Keep basic public use low-friction where possible.
- No sign-up requirement unless the product decision changes.

## Stage 7 — Optional paid features
- Define Free, Pro and any future higher tier before building paywalls.
- Obtain explicit approval before adding Stripe or paid subscriptions.
- Use test mode first; no live charges until pricing, cancellation, refunds, tax and support are agreed.
- Keep core safer-play information available without payment.

## Stage 8 — Advanced features and international expansion
- Extend the provider-neutral model to selected international jurisdictions.
- Historical modelling and prediction validation with no data leakage.
- Licensed replays, content and visualisation.
- Community and verified tipster features only with trustworthy performance evidence and suitable moderation.
- Add mobile app packaging only if the responsive web app proves its value first.

## Product principles

- Mobile-first and fast on Android.
- Plain-language screens and predictable navigation.
- Premium black, midnight-navy, purple, magenta, gold and emerald design system.
- No guaranteed-win claims.
- Distinguish user records, manual data, samples, licensed external data and AI analysis.
- Safer-play tools must not encourage increased betting.
- No scraping or redistributing protected racing material without permission.
- No paid infrastructure or data subscriptions without a clear reason and owner approval.
- Preserve working features; stage changes before production release.
