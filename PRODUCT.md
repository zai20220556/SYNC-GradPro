# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

SYNC is a two-sided marketplace in Jordan. Both sides are primary and get equal priority. When their needs conflict, resolve it for the health of the deal rather than favoring one role.

- **Seekers** need sponsorship: clubs, student groups, athletes and sports teams, content creators, event organizers, and charities. Their job is to present an opportunity clearly, offer packages, and win a sponsor.
- **Sponsors** offer sponsorship: local businesses such as restaurants, gyms, banks, telecoms, and retailers. Their job is to find opportunities that fit their business, city, budget, and audience, then compare them and commit with confidence.
- **Admins** are a supporting role. They review verification documents and oversee users and listings.

## Product Purpose

SYNC puts the sponsorship process in one place: listings, packages, requests, messages, deals, and results.

SYNC is a graduation project at Princess Sumaya University for Technology. Success means a convincing demo and a strong evaluation at the graduation defense. A public launch is not a current goal.

## Positioning

SYNC is the one place in Jordan to take a sponsorship from discovery to measured results. Verified profiles, clear packages priced in JOD, rule-based matching, messaging, and deal tracking live in a single flow.

## Operating Context

The core workflow has four steps:

1. Create a profile as a seeker or a sponsor. Seekers join free.
2. Seekers post opportunities with packages. Sponsors search, filter, and compare.
3. A sponsor sends a request, both sides message, and they agree the terms.
4. The agreed deal is recorded, and both sides add reach, engagement, and sales.

The main evaluation setting is a live demo using the seeded accounts for each role.

## Capabilities and Constraints

- **Built:** email and password accounts, seeker and sponsor profiles, listings with multiple packages, browse and filter, side-by-side comparison, match scores out of 100, sponsorship requests, messaging, notifications, deal tracking, self-reported results, document-based verification, and admin review.
- **Listing categories:** events, sports, creators, student activities, charity, music and arts, gaming and esports, tech and startups, education and workshops, and culture and community.
- **Matching** is rule-based, using category fit, city, budget, and audience. Do not describe it as AI.
- **Results are self-reported.** SYNC does not verify reach, engagement, or sales, and copy must never imply that it does.
- **Verification** means an admin reviewed an uploaded student ID, club registration, or commercial registration. It does not guarantee a party's performance or reliability.
- **SYNC does not process payments.** Prices and agreed values are recorded in JOD, and money changes hands outside the product.
- **Not active in the product:** the data model includes subscriptions, paid promotion records, and a Google account field, but no user flow offers them. A promoted label and sort exist for listings. Do not present subscriptions, paid promotion, or Google sign-in as available features.

## Brand Commitments

- The name is **SYNC**, written in capitals.
- The tagline is "Sponsorships made simple."
- Voice is plain, direct, and practical in both languages.
- English and Arabic are equal. Every screen must work and feel designed in both, including right-to-left layout. New text must be added to both languages.
- The Arabic copy is currently marked as a draft and needs review by a fluent speaker.

## Evidence on Hand

- `server/prisma/seed.js` contains fake demo users, listings, and activity. Some demo profiles use realistic or institution-like names, so they must not be presented as real customers or partners.
- There are no real customers, testimonials, partnerships, press, usage figures, or measured outcomes. Do not fabricate them.
- No logo or image assets are committed to the repository.

## Product Principles

1. **Serve both sides of the deal.** A flow is only finished when it works for the seeker and the sponsor.
2. **Carry the whole journey.** Each step should lead clearly to the next, from discovery through to results.
3. **Make decisions comparable.** Show price, audience, reach, fit, and verification in ways people can weigh quickly.
4. **Be honest about trust.** Always make clear what was verified, what was self-reported, and what SYNC does not check.
5. **Treat both languages as native.** Arabic and English each deserve a complete experience.

## Accessibility & Inclusion

Full right-to-left support for Arabic is a product requirement. No other specific accessibility standard has been set.
