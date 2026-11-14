# IASD + AiFn teaching maintenance

## Confirmed course contract

- Active courses: IASD / SI306 (existing immutable attachment) and AiFn / Artificial Intelligence in Finance (supplied RPS, 2 SKS, semester 3, 16 meetings).
- Keep the old Information System Management, Communication Protocol and general Artificial Intelligence publishers paused. Preserve their existing material. Do not modify the unrelated dashboard or other cronjobs.
- AiFn final assessment follows the user's explicit confirmation: UTS 25%, UAS 25%, individual 20%, group 20%, attendance 10%. Weekly RPS table weights are preserved as source provenance, not an alternative active grading system.
- AiFn uses browser simulations and downloadable Colab/Jupyter notebooks; Claude is a manual prompt exercise without a website API/backend. All course/instructor material is public; UTS/UAS are practice, never secret official examinations.
- Use synthetic labeled datasets or verified licensed public data, not actual personal financial information. No investment recommendations, real credit approval, automated grading/submission or implied backend transactions.

## Daily turn selection

One existing agent cron at 07:30 WIB alternates IASD and AiFn by successful new course publication, not calendar parity, scheduler count or learner progress.

1. Run `python3 /home/ubuntu/.hermes/scripts/hicall_courses_maintainer.py --next-course`.
2. Read the chosen course's session records, enhancement log and git history. Deepen one underserved session only; do not regenerate all lessons or change the other course.
3. If a draft is pending, preserve it and reconcile safely before authoring. Back up the binary diff outside the repo. Fetch origin, compare all dirty/untracked paths with remote changes, and use ff-only only for strictly ahead, disjoint updates. On overlap/divergence/unrelated edits, report a blocker, never reset/stash blindly.
4. Make one meaningful content/interaction improvement with a worked example, what-if reasoning, misconception, transfer artifact and instructor facilitation/rubric. Update that course's log with evidence. No repetitive date-stamped filler.
5. Run `python3 /home/ubuntu/.hermes/scripts/hicall_courses_maintainer.py --course IASD` or `--course AiFn`, matching the selected turn. The command enforces paths, baseline integrity, build, all-course visual/interaction checks, deployment and exact live read-back.
6. Only the release command advances `/home/ubuntu/.hermes/cache/teaching-course-rotation.json` after a changed course revision is verified live. No-change, failed authoring, failed build, API/model outage and deployment failure retain the same next course. A failed run never skips a course or invents learner completion.

The initial integration uses `--bootstrap` only in the explicitly authorized parent implementation. Daily cron must never use that flag to broaden its editing scope.

## Quality and visual direction

Use antislop DURING first, REA evidence discipline second, then the hicall-work-quality router and task-specific specialists. Preserve the compact studio, ENERGY 1 / RHYTHM 2 / MOTION 1. Every meeting in both courses must have a relevant accessible pedagogical visualization with readable explanation and working interaction. Do not replace diagrams with stock photos or decorative generic illustrations. Keep both themes, keyboard focus, 44px controls, narrow screen layout and PWA/offline working.

Use scoped code review with aislop when its scanner is available. Otherwise record manual review, never invent a scanner score. Pick the applicable Superior specialist and relevant engineering disciplines; do not run the entire installed skillpack or implicitly invoke explicit-only workflows. Installing a skill is not proof its CLI/MCP/dependencies ran.

Preserve IASD baseline source/answers/files and browser storage keys. Preserve AiFn RPS session mapping and active user-confirmed assessment; add labeled supplements rather than silently changing the source. Keep student progress browser-local with independent course export/import and incompatible-backup rejection.

Keep known S04 mobile-focus behavior explicitly unresolved until causal isolation. A clean retry is not proof it was fixed. Record failed and repeated checks separately, do not relax gates or claim unqualified production regression coverage after a partial run.

## Delivery

In Indonesian, report selected course/session, actual student and instructor benefit, links, observed local/live tests, exact deployed revision and remaining limitation. Differentiate code written, build passed, publication verified and public-source truth. Do not claim an unavailable original IASD RPS was verified; AiFn does have the supplied RPS. External Claude/Colab and references require network even when bundled studio/notebooks are cached offline. Never claim absolutely bug-free software or full WCAG compliance from smoke tests alone.
