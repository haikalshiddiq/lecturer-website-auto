# AiFn enhancement ledger

## S01: target/input boundary (2026-11-16, Asia/Jakarta)

- Selection: `hicall_courses_maintainer.py --next-course` returned AiFn. Both earlier AiFn content commits (8e9d9ca, 167ac06) were whole-course integration; no session-level refinement ledger existed. S01 was selected as the oldest tied session and prerequisite for later model work, not inferred learner progress.
- Scope: S01 only in course JSON and workflow renderer, plus course-scoped smoke assertions. Other lessons, grading, RPS baseline, source data, downloads and storage version/keys remain unchanged.
- Student change: A/B input audit counts four candidate features versus a fifth leaked target, renders actual first-source-row values, changes explanatory feedback with the routing, and explicitly does not train a leaking model. A means only structural separation, not verified timing or deployment fitness.
- Worked example: explicitly hypothetical values separate from the real UCI row; no invented currency, calibrated score or default horizon. Individual transfer changes target to amount, excludes it from predictors and withholds risk without timing evidence.
- Instructor change: 35-minute predict/demonstrate/explain/transfer sequence and diagnostic rubric, not a new official grading scheme.
- Design Read: compact finance learning studio for Python beginners, ENERGY 1 / RHYTHM 2 / MOTION 1. Existing typography/palette retained for continuity and chart readability; bars count routed columns, table supplies exact row evidence, text carries the limits. No new assets, decoration, CSS, theme or navigation.
- Source boundary: existing retained UCI records/documentation and immutable supplied AiFn RPS mapping; no new external factual claims. IASD original RPS remains unavailable.
- Review: manual code review (aislop not on PATH); inspect branching, actual field list, first-row binding, escaped output, unchanged model and state, and S01-only JSON diff. No scanner score claimed.
- Verification plan: existing validator executes all 17 notebook code cells, numerical Python/JS comparisons, immutable provenance/RPS checks; scoped maintainer enforces full build and both-course desktop/mobile/PWA/offline gates. New smoke assertions bind A/B expected answers, real routing table and SVG bar widths. Run output and additional hosted evidence stay outside the release input.
- Publication status at authoring: pending; the record below was appended only after live verification. A committed log alone is not publication evidence.

### Verified release and hosted checks

- Scoped maintainer `--course AiFn` exited 0: content/links, Astro lint/build, learning validation, both-course desktop/mobile/PWA/offline and Impeccable/PWA artifact gates. Course validators executed all 17 notebook code cells and numerical Python/JS comparisons.
- Publication commit: `6dae6fd2c304bda1cb68dba6bb1b6cff073d1dbe`, read back from exact origin/main. Production manifest revision: `c0897afb653e2f77c451008a2be0d4ab2cbef4a59f18f58c17e1b386d5383d78`; selected AiFn revision: `3b8b7e0839d251b3762cc4b200fa180e1f75a2e3249bfedddb898c7535651719`.
- Canonical read-only `verify_live` rerun matched the entire manifest, both embedded course datasets and all checked downloads exactly. An extra raw urllib probe returned HTTP 403; canonical fetch and hosted Chromium passed, so the client-specific failure is retained, not labeled an application defect.
- Hosted AiFn full smoke: desktop and 390px mobile each covered all 16 sessions, 48 quiz answers, control changes, source-bound model outputs, teacher views, storage/backups/rejection, actual downloads, clipboard, loading/error/empty recovery and offline all-session revisits. Both reported zero pageerrors. Reports: `output/aifn-smoke-live-{desktop,mobile}.json`.
- Additional hosted S01: 320/390/1365px × both themes, 24 A/B-answer cases, Enter, focus ring, chart enlargement/Escape/focus return, stale-feedback clearing, teacher entry and offline A/B changes. Zero document overflow; control height at least 44px. Evidence: `output/aifn-s01-live-check.json` and screenshots. Narrow screenshot inspected: text reflows; diagram uses intentional bounded horizontal scrolling and enlargement, not document overflow.
- Hosted computed text contrast: all 16 AiFn sessions, four tabs, expanded disclosures, steady light/dark; 3483/3493 checked text elements respectively, zero failures. Disabled controls/transition frames excluded; not full WCAG certification.
- Review verified only S01 changed in lesson JSON and top-level contract unchanged. Manual review, not an aislop scan. Scope-limited antislop rule evidence: `output/aifn-s01-delivery-gate.md`. Historical S04 focus issue remains open despite this run passing its local gate.
- Rotation advanced by the canonical release to IASD only after exact live verification; not edited manually. This post-verification log-only commit does not represent another content publication.
- Historical limitation: IASD S04 mobile-focus issue remains unresolved; passing retries do not constitute a fix. Browser smoke is not WCAG certification or physical-device installation evidence.
