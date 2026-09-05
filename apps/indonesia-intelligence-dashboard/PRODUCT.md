# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: Haikal Shiddiq, an Indonesian lecturer and family decision-maker. He reviews the dashboard on desktop and Android to understand national conditions, career exposure, and whether his family should keep monitoring Indonesia or prepare a relocation option.

## Product Purpose

Indonesia Intelligence turns recurring news collection into concise, source-linked daily and weekly intelligence. Success means the user can identify material changes across covered fields, understand uncertainty, and decide what to monitor or prepare without reading every article.

## Positioning

The product combines a broad Indonesia briefing, topic-level sentiment, market context, and a family-oriented weekly decision signal in one inspectable source-linked dashboard.

## Operating Context

Daily news data is refreshed automatically in Asia/Jakarta time. A separate weekly report publishes every Sunday at 07:00 WIB. The user may compare relocation planning fit for Malaysia, Taiwan, and Japan, but country summaries must remain high-level and link to official immigration sources.

## Capabilities and Constraints

- Existing Vite, React, Recharts, static JSON, PWA, and Cloudflare Pages architecture remains in place.
- Weekly national status uses three evidence levels: Pantau, Siapkan Opsi, and Pertimbangkan Bertindak.
- The status is a news-risk signal, not a guarantee of personal safety or an instruction to relocate.
- Every material news claim must retain a source and URL.
- Sentiment derived from headlines or snippets must disclose its method and limitations.
- Never infer a major family decision from sentiment alone. Expose coverage gaps, source diversity, confidence, and concrete trigger checks.

## Brand Commitments

Name: Indonesia Intelligence. Voice: calm, executive, evidence-first, direct, and non-alarmist. Existing light and dark themes, Geist typography, blue accent, and dense analytical presentation are established product traits.

## Evidence on Hand

- Daily structured feed: `public/data/news.json`
- Daily Google News RSS collector: `scripts/refresh-news-from-google-rss.py`
- Existing source-linked market and sentiment visualizations in `src/main.jsx`
- No verified personal-safety dataset, immigration eligibility assessment, or legal advice is available and none may be fabricated.

## Product Principles

1. Separate signal from verdict.
2. Show sources, method, uncertainty, and missing coverage.
3. Make weekly change more visible than raw volume.
4. Prefer preparation triggers over panic language.
5. Keep relocation comparisons practical but subordinate to official advice.

## Accessibility & Inclusion

Keyboard navigation, visible focus, WCAG AA contrast, reduced-motion support, responsive layouts, and non-color status labels are required.
