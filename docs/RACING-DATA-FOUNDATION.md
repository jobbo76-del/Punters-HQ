# Punters HQ — Racing Data Foundation
**Status:** Research and integration specification  
**Scope:** Australian thoroughbred racing first; architecture must allow international coverage  
**Prepared:** 4 November 2026  
**Applies to:** Staging and future production builds. No provider is connected or commercially approved by this document.

## 1. Decision summary

Punters HQ must use a properly licensed racing-data supply chain. Race fields, form and results are protected racing materials; a website being publicly accessible, or an API endpoint being technically reachable, does not grant permission to reproduce or redistribute its information.

Racing Australia announced that five authorised wholesalers would distribute Australian Thoroughbred Racing Materials from 1 July 2025:
- BettorData
- BetMakers
- Mediality Racing
- News Perform (Punters Paradise)
- Racing and Sports

Reference: https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf

**Shortlist for commercial quote and technical discovery:**
1. **BetMakers CoreAPI** — best first enquiry for a consolidated official-data and racing-intelligence stack.
2. **Mediality Racing** — best second enquiry for official material, XML delivery, historical results and documented AU/NZ/HK/SG coverage.
3. **Punting Form** — specialist enquiry for sectionals and historical point-in-time data, with a separate commercial API quote required.
4. **Betfair** — separate exchange-market and historical-price option, subject to explicit commercial data rights and applicable fees.

No supplier is selected yet. Public plan prices must not be confused with commercial redistribution rights.

## 2. Supplier evidence and current status

### A. BetMakers — first commercial enquiry

BetMakers states that it is one of Racing Australia's five authorised wholesalers. Its CoreAPI and managed trading APIs are described as providing official Racing Australia data including nominations, acceptances, trials, results and form. The company also describes integration options for Punting Form and Racelab, including Racelab Live; dynamic form and sectional data; live pricing feeds; and wider racing technology products.

Source: https://betmakers.com/articles/betmakers-appointed-racing-australia-data-wholesaler

**Why it is on the shortlist:** It may cover a large portion of the core data and intelligence stack through one supplier.

**Not yet confirmed:** Punters HQ pricing, API documentation access, exact fields, refresh frequency, historical depth, bookmaker coverage, sectionals coverage, commercial display rights, AI-derived output rights, retention/caching rules, and whether all products can be licensed for a freemium/premium consumer application.

**Enquiry:** Ask for a written proposal for an Australian thoroughbred racing intelligence app with free and paid customer tiers.

### B. Mediality Racing — second commercial enquiry

Mediality says it is an authorised agent of official Racing Australia data. Its published product list includes:
- Australian TAB and non-TAB thoroughbred fields
- Complete form
- Full race results
- Pre-post markets set at acceptance for Australian TAB meetings
- Historical and predictive ratings
- Race commentary and jockey silks
- Data supplied in XML for several products

Its FAQ states that its results database starts in January 1982. It also documents fields, form and results for New Zealand, Hong Kong and Singapore. Its published operational estimates are approximately five minutes after acceptances for a field file and approximately twenty minutes after correct weight for results.

Sources:
- https://medialityracing.com.au/
- https://medialityracing.com.au/our-services/
- https://medialityracing.com.au/data-faq/
- https://medialityracing.com.au/contact/

**Why it is on the shortlist:** It has published coverage that fits an Australian-first product while giving a possible path to selected international racing.

**Not yet confirmed:** API versus file/FTP delivery options for this use case, commercial app display and redistribution rights, per-user or per-request pricing, exact historical form depth, owner/horse profiles, sectionals, odds snapshots, live odds coverage, and derived-AI permissions.

### C. Punting Form — specialist sectionals and modelling data

Punting Form's Modeller product describes API access to sectional data, Punting Form Analytics, optional purchase of over ten years of historical data, and modeller-ready point-in-time data. Its page states that Modeller is for personal use only and that companies requiring sectional API access must contact sales for commercial pricing. Its Professional subscription is publicly listed at A$297/month and describes sectional data for Australian, Hong Kong and Singapore meetings, 200m raw times, benchmark data, run-style analysis and jockey/trainer performance analysis. That public price does **not** establish commercial API or redistribution rights.

Sources:
- https://puntingform.com.au/products/modeller
- https://docs.puntingform.com.au/

**Recommendation:** Obtain a separate commercial quote if BetMakers' proposal does not cover the required depth of sectional and historical modelling data.

### D. Betfair — exchange odds and historical market research

Betfair's developer programme provides an Exchange API and historical data products. Its developer site says exchange data used as part of a business attracts fees and lists commercial licence options. The published comparison includes an Exchange API activation fee of £499; the actual commercial arrangement, data entitlements and current fees must be confirmed directly. Betfair's Australian terms also restrict commercial use of Betfair data without specific prior written consent.

Sources:
- https://developer.betfair.com.au/
- https://www.betfair.com.au/AUS_NZL/aboutUs/Terms.and.Conditions/

**Recommendation:** Treat Betfair as a separate exchange-market source, not as a substitute for official race form/results or a multi-bookmaker feed. Do not display or distribute exchange data commercially until written rights are in place.

### E. Low-cost odds API candidates — verify before use

Public search results currently advertise:
- Krok Odds: a racing API with meetings, runner form/stats, sectionals, results, connections, ratings and odds history; its page advertises a free tier and an A$49/month API plan.
- HaterPicks API: a racing odds endpoint and public Starter/Pro/Business pricing, with Starter advertised at A$29/month.
- PuntersEdge: public API tiers distinguish personal use, display with attribution, commercial use and redistribution.

Sources:
- https://krokodds.com.au/data-api/racing
- https://www.haterpicks.app/haterpicks-api/horse-racing
- https://puntersedge.online/api/pricing

These are **discovery candidates only**, not approved suppliers. The public material reviewed does not settle whether the vendor has the necessary upstream licences for every field, bookmaker price, historical record or derived output Punters HQ wants to display. Before any integration, obtain written confirmation of:
- Upstream source and data-owner permissions
- Commercial use in a customer-facing app
- Display to both free and paid users
- Caching and historical retention
- Redistribution and exports
- AI/model training and derived analytics
- Bookmaker-specific coverage and update intervals
- Service levels, outage handling and termination rights

## 3. Required Punters HQ data coverage

The integration must be staged. Do not make the dashboard look live until its data source is connected, tested and timestamped.

### Phase 1 — Core Australian race data
- Meetings and venues
- Race number, name, start time, distance and class
- Nominations, acceptances and final fields
- Runner number, barrier, weight, jockey and trainer
- Scratchings and late changes
- Track rating and rail position where licensed
- Official results, margins, dividends and placing status
- Historical race and horse starts

### Phase 2 — Horse and participant intelligence
- Stable horse identity and aliases/renamed horses
- Career record and race-by-race form
- Distance, track, going, class and venue performance splits
- Jockey and trainer records and relevant combinations
- Owner/ownership information where licensed
- Preparation and campaign history where supported
- Data provenance and last-updated timestamps

### Phase 3 — Markets and price intelligence
- Fixed-odds win and place markets
- Bookmaker identity and market/runner matching
- Opening, intermediate and near-jump price snapshots where licensed
- Best available price and price movement
- Betfair Exchange back/lay prices and traded volume, if separately licensed
- Starting price/BSP and settlement data
- Suspended, withdrawn and unavailable market states

### Phase 4 — Advanced performance data
- Sectional times and 200m splits
- Overall and in-run pace measurements
- Race speed ratings and benchmark comparisons
- Running-style and speed-map inputs
- Historical point-in-time datasets for model development
- Replay/video links only where the relevant rights are granted

## 4. Provider-neutral data model

The product must not be hard-wired to one supplier. Build provider adapters that map licensed source formats into a consistent internal structure.

Core entities:
- Jurisdiction
- Meeting
- Venue
- Race
- Runner
- Horse
- Person (with roles such as jockey, trainer and owner)
- HorsePerformance / RaceStart
- Sectional
- TrackCondition
- ScratchingsAndChanges
- Market
- MarketRunner
- OddsSnapshot
- Result
- DataSource
- DataLicence / UsagePolicy

Every imported record should carry, where available:
- Provider/source name
- Provider record ID
- Internal canonical ID
- Event/race date and local timezone
- Source timestamp and retrieval timestamp
- Effective time / observation time
- Data status and quality flags
- Applicable licence or usage-policy reference

Do not merge horse, jockey or trainer identities based on name alone. Use stable provider identifiers where available and retain a traceable cross-reference when records are matched across providers.

## 5. Integration architecture

1. Provider API keys and credentials remain server-side. Never place supplier secrets in browser code.
2. Each provider gets a separate adapter so a replacement supplier does not require rebuilding the app.
3. Normalise provider records into the common data model.
4. Retain source provenance and timestamps for every market and racing-data record.
5. Store historical snapshots only for the period and purposes permitted by the licence.
6. Expose app-ready data through Punters HQ's backend rather than calling vendors directly from the user's phone.
7. Add health checks, missing-data alerts, retry handling and a clearly labelled stale/unavailable state.
8. Keep demo/sample data physically and visually separate from licensed live data.
9. Apply access controls so data is shown only to the user groups and jurisdictions permitted by the relevant contract.

## 6. Written questions for each provider

Request written answers to all of the following before selecting a supplier:

1. What exact Australian thoroughbred jurisdictions and meeting types are covered, including TAB and non-TAB?
2. Which entities and fields are included for meetings, races, runners, horses, jockeys, trainers and owners?
3. How much historical form, results, sectional and odds data is available?
4. What are the delivery methods, API formats, update frequencies and typical latencies?
5. Can the data be displayed in a public consumer app with free and paid membership tiers?
6. Can Punters HQ store/cache records and historical snapshots? For how long?
7. Can the app create derived ratings, statistics, comparison tools, AI summaries and model probabilities from the data?
8. Can derived outputs be displayed to users after the source subscription ends?
9. Are data export, downloads, notifications, screenshots and partner/API redistribution permitted?
10. Which bookmaker odds are supplied, which markets are included, and what are their update intervals?
11. What are the setup fee, monthly minimum, usage charges, per-user charges, overage rates and price-review terms?
12. What are the uptime/support commitments, outage process, data correction process and termination/data-deletion requirements?
13. Is there a sandbox, sample feed and test environment?
14. What is the required attribution and branding?
15. Can the provider confirm its upstream rights for the exact use case in writing?

## 7. International readiness

Keep Australia as the launch jurisdiction. The data model should already support:
- Country and jurisdiction
- Local race timezone and UTC conversion
- Currency and market rules
- Provider-specific race codes
- Different field/result publication timing
- Jurisdiction-specific licensing and display rules

Mediality publicly documents New Zealand, Hong Kong and Singapore fields/form/results. That is useful evidence for future expansion, but Punters HQ must obtain pricing and written commercial rights for those territories before switching them on.

## 8. Budget and approval guardrails

- Do not buy a subscription, sign a licence or create a paid provider account without the owner's express approval.
- Prefer a written commercial quote and sandbox before committing.
- Compare total cost at launch scale and at projected premium-member scale.
- Do not assume an inexpensive personal subscription includes commercial display, redistribution or AI use.
- No scraping of bookmaker or racing websites as a substitute for a licensed feed.
- If no licensed live feed is connected, keep the interface clearly labelled as manual/demo data.

## 9. Recommended next sequence

1. Request commercial proposals from BetMakers and Mediality.
2. Ask Punting Form for commercial sectional/API pricing, unless BetMakers can supply the required sectionals on acceptable terms.
3. Assess Betfair for exchange-only prices and historical market research, subject to written commercial rights.
4. Compare the proposals using the written questions in Section 6.
5. Select the smallest licensed package that supports core racecards, results, horse form and participant statistics.
6. Build and test the provider adapter and data normalisation in staging.
7. Add odds, sectionals and advanced modelling as separately approved layers.

## 10. Current status — honest distinction

**Verified in public supplier material:** the Racing Australia wholesaler framework and approved wholesaler list; product descriptions published by BetMakers and Mediality; Mediality's documented historical-result and international coverage; Punting Form's personal-use restriction for its Modeller product and need for a commercial quote; Betfair's distinction between personal and commercial use.

**Not yet verified:** contract-ready pricing for Punters HQ, full API schemas, data quality under load, commercial display/redistribution/AI rights for the exact app, and whether any candidate can satisfy every requested feature as one feed.

**Not connected:** no live racing data, odds feed or licensed provider credentials have been added to the staging app as part of this research.

---
This document is a product and engineering decision brief, not legal advice or a signed data licence.
