# Punters HQ — Master Design System
**Version:** 1.0  
**Status:** Owner-approved visual standard  
**Reference:** User-supplied 123Bang / Aussie Punters dashboard image  
**Applies to:** Every future Punters HQ screen, module, staging build and mobile layout.

## 1. Design principle

Punters HQ must look and feel like one premium racing-intelligence platform. New screens must reuse the visual language and interaction patterns in this document. Do not introduce an unrelated theme or redesign individual modules in isolation.

The supplied dashboard is the master visual reference. It is a reference for visual direction and layout hierarchy, not evidence that any pictured race, odds, prediction, membership state or statistic is connected to a real data source.

## 2. Colour tokens

| Token | Value | Use |
|---|---|---|
| Main background | `#070816` | Main page and app background |
| Secondary background | `#090b1b` | Large background surfaces |
| Card / panel | `#101226` | Standard cards and panels |
| Raised panel | `#151832` | Secondary surfaces and embedded cards |
| Primary purple | `#8b2be2` | Primary actions and active states |
| Violet | `#bd4cff` | Borders, focus and secondary highlights |
| Magenta | `#ec45d5` | Selected navigation accent and highlights |
| Metallic gold | `#f4c542` | Premium features, important racing accents |
| Emerald green | `#19e58b` | Positive values and verified live status |
| Primary text | `#f4f3ff` | Headings and key data |
| Muted text | `#a6a8c4` | Supporting copy |
| Warning | Amber / orange | Warnings and caution states |
| Negative | Red | Errors, losses and critical states |

Use the tokens consistently. Do not use emerald to imply a live data feed unless the feed is genuinely connected and fresh. Use amber for unknown, stale or unverified states.

## 3. Visual treatment

- Premium dark surfaces with subtle purple or violet gradients.
- Fine violet/purple panel borders.
- Soft, controlled glow around active or high-importance elements.
- Metallic gold for premium labels and key racing icons.
- Emerald for positive statuses and verified live states.
- High-quality racing imagery where it adds real value.
- Consistent corner radii, spacing and alignment.
- Clear contrast between panel, background and interactive controls.

Avoid excessive glow, large decorative gradients behind every card, clutter, tiny text and unnecessary animation.

## 4. Standard application shell

### Desktop
- Left navigation rail with brand identity and clearly labelled destinations.
- Top information bar for status, next race and account/membership context when those data are real.
- Main content area with a clear information hierarchy.
- Footer with age restriction, education disclaimer and safer-play pathways.

### Mobile / Android
- Preserve the same brand and colour tokens.
- Use compact, clearly labelled navigation.
- Use large tap targets and readable figures.
- Stack dashboard cards in a sensible order.
- Avoid horizontal scrolling for ordinary page content.
- Prevent fixed navigation from covering content or controls.
- Respect device safe areas.

Desktop and mobile are two responsive layouts of one product, not separate products.

## 5. Dashboard layout pattern

The home dashboard should follow the approved reference's hierarchy:

1. **Feature banner:** the most relevant verified racing insight or a clearly labelled workspace status.
2. **Personal performance:** settled net result, strike rate, stakes and pending records.
3. **Recent activity:** the user's actual saved selections and activity.
4. **Racing workspace:** Race Centre access and current meeting/race data when connected.
5. **Market tools:** odds comparison and calculations, clearly marked manual or live.
6. **Intelligence tools:** AI insights and analysis with data coverage and confidence explained.
7. **Blackbook and alerts:** saved horses and alert status when implemented.
8. **Learning and safer play:** useful guidance and visible support pathways.

Do not create fake countdowns, made-up meeting names, invented bookmaker prices, fictional balances or ungrounded AI insights to fill space. When live data is not available, use a clear workspace status or a useful shortcut.

## 6. Cards and information blocks

Each card should have:
- One obvious purpose.
- A recognisable icon.
- A short category/eyebrow label where helpful.
- A readable heading.
- The most important figure or information first.
- Supporting context below.
- One obvious action where appropriate.
- Consistent padding, spacing and border treatment.

Keep card layouts consistent across dashboard, race tools, horse profiles, statistics, markets, blackbook, alerts and membership screens.

## 7. Typography

- Use a clean, modern sans-serif family.
- Use strong, readable headings.
- Make important figures prominent.
- Keep secondary labels readable on Android.
- Use short paragraphs and plain-language labels.
- Never rely on decorative type for race data, odds or financial figures.

## 8. Buttons and controls

- **Primary action:** purple gradient with white text and restrained glow.
- **Premium action:** metallic gold treatment.
- **Positive action/status:** emerald.
- **Secondary action:** dark surface with fine violet border.
- Inputs, selects and text areas use dark backgrounds, high contrast and visible focus rings.

Every visible control must work. Never make an inert control look interactive. Provide clear disabled, loading, validation, success and error states.

## 9. Data display integrity

Every racing or betting-related display must distinguish:
- Live connected data
- Historical licensed data
- Manually entered user data
- Demonstration/sample data
- AI-generated analysis or estimates

Show source and last-updated time where relevant. Mark stale or unavailable feeds. Never present demonstration data as live. A confidence band is not a calibrated win probability unless the model has been trained, validated and calibrated for that specific output.

## 10. Accessibility and usability

- Maintain high text contrast.
- Do not use colour as the only status signal.
- Pair icons with labels where meaning may be unclear.
- Use keyboard-accessible controls and visible focus indicators.
- Respect reduced-motion preferences.
- Keep page headings and actions predictable.
- Avoid unnecessary steps and repeated setup.
- Make errors actionable and understandable.

## 11. Build and release rules

Before creating or changing a screen:
1. Follow this design system and the approved dashboard reference.
2. Reuse existing shared styles and components.
3. Preserve existing working functionality and saved data.
4. Do not remove or replace a feature without owner approval.
5. Make all visible controls functional.
6. Use real data or clearly labelled sample/manual data.
7. Check desktop and Android layouts.
8. Check empty, loading, stale, offline and error states where relevant.
9. Report what is built, what is connected, what is manually tested and what remains incomplete.

All visual changes must be made in staging first. Production remains untouched until the owner expressly approves release.

## 12. Non-negotiable exclusions

- No random redesigns or unrelated palettes.
- No fake live odds, racecards, results or statistics.
- No pretend AI predictions.
- No non-working buttons or placeholder navigation presented as complete.
- No unlabelled sample content.
- No removal of existing functionality without approval.
- No production deployment during staging work without explicit approval.

## 13. Approval rule

This is the standing visual standard for future Punters HQ builds. Change it only when the owner explicitly approves a new direction.
