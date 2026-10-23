# IASD-only maintenance contract

## Scope

- Active course: IASD / SI306, 3 SKS, Indonesian teaching content.
- Pause new publishing for Information System Management, Communication Protocol, and Artificial Intelligence. Keep their existing material available without edits or deletion.
- Do not modify the unrelated Indonesia Intelligence Dashboard or personal-learning/reminder jobs.
- General GitHub queued publishing is manual-only and guarded by `automation/lecturer-focus.json`.

## Content work each daily run

Choose one IASD session using the maintained enhancement log, not the calendar day as student progress. Make one meaningful, bounded improvement that helps both a student and an instructor:

1. A concrete Aruna worked example with stated inputs, reasoning, result and limitations.
2. An interactive what-if or decision exercise with correct/incorrect feedback explaining why the answer changes.
3. An intentional misconception or counterexample and correction.
4. Instructor facilitation prompts: ask a prediction, demonstrate, ask for an explanation, then check an individual transfer task.
5. A measurable student artifact and a short rubric aligned with the selected session outcome.

Use the original bundled cases and primary sources already cited by the course. If a new external fact is needed, verify it from a primary source and record its URL and access date. Label classroom assumptions as assumptions; do not invent official university policies or assessment approval.

## Source and learner safety

Keep `src/data/iasd-course.json` identical to the supplied attachment. Put new material in a clearly labeled IASD supplement or improve the existing IASD runtime without changing the baseline, answer keys, storage key, or saved state compatibility. Supplements must actually render on an IASD route; writing an unused JSON file is not an improvement.

Do not generate generic date-stamped posts or copy the same template each day. Do not imply local completion equals official grades or automatically collected assignments. No login wall is needed for either learner or instructor access.

## Release

- Keep homepage compact, and reveal detailed content by session/tab/disclosure.
- Allowed editing area is enforced by `/home/ubuntu/.hermes/scripts/hicall_iasd_maintainer.py`. Other course content, generic blogs/resources, dashboard files and shared app dependencies are out of scope.
- Run `python3 /home/ubuntu/.hermes/scripts/hicall_iasd_maintainer.py` after completing a bounded improvement. It validates, builds, tests desktop/mobile/PWA/IASD, commits only scoped files, deploys and reads back exact production revision plus the supplied course baseline.
- The legacy lecturer updater delegates to the same IASD-only release path while the focus file is active; its rotating multi-course generator is disabled.
- A failed gate means no success claim and no force-push/force-install. Preserve changes, report the concrete blocker and do not advance the published enhancement log.
- If no genuine improvement can be completed safely, deliver an honest no-change/blocked report rather than filler content or a fabricated publication.

## Report

Use Indonesian, briefly state the selected session, learning improvement, student link, instructor link, real tests, deployment evidence, and remaining limitation. Separate an improvement implemented in source from one verified live. Student progress must not be inferred from the date or cron run count.
