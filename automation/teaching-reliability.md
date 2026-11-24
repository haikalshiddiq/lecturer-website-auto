# Teaching reliability and recovery

## Operational contract

- Keep the original reasoning-heavy IASD/AiFn authoring job `2f1406e02689`, daily `30 0 * * *` (07:30 Asia/Jakarta), its delivery thread and successful-release rotation. A watchdog is not a substitute for fresh pedagogical authoring.
- Keep antislop DURING, REA evidence discipline and hicall-work-quality first. Load `hermes-agent` for scheduler/provider incidents, `superior-debugging`/`superior-testing` for a failing test and `superior-reliability` for recovery changes. Use actual supported CLI/tool schemas. Do not install or modify another client/profile.
- For ordinary Astro/source/notebook work, the job uses native file/terminal/web/browser/skills tools and `no_mcp`; this prevents unrelated MCP schemas from joining every model request. The REA evidence standard still applies. This reduces irrelevant tool payload, not proof of the historical HTTP400 cause.
- Keep genuine browser/PWA/numerical/baseline gates. An assertion failure must remain a failure. Split diagnostics into focused element, outline and 44px dimensions; identify the owning race/defect before changing code. A clean retry is not a fix.

## Bounded guardian

`./scripts/teaching-guardian.py` is a deterministic monitor (job `6a493a51fd1d`, `*/15 * * * *`, same Telegram thread). Its profile entry point is `~/.hermes/scripts/hicall_teaching_guardian.py`, protected by the standard cron-quality wrapper `quality_6a493a51fd1d.py`.

- Inspect only the teaching job, rotation checkpoint and live course manifest. Healthy ticks are silent; receipts establish execution only.
- Detect failed/current-slot or missed scheduled work, respect active claims/queued runs, and serialize final pause checks with Hermes' native reentrant job-store lock.
- At most two recovery requests per teaching slot, one-hour cooldown, within six hours after 07:30 WIB. Each queues the original agent with a transient recovery-only prompt, not a duplicate authoring job. Persist the reservation before enqueue to prefer a missed retry over double dispatch after a crash.
- Do not rearm a user pause, replay a delivery failure, change provider credentials, override quota/auth failures, bypass a baseline/scope error, or loop over unclassified errors.
- Never queue a second lesson when a verified release already exists in the slot. If live revision disagrees with the rotation checkpoint, stop for publication review: a failed response may follow a successful external write.
- A queued recovery is not a successful repair or publication. Only the scoped maintainer plus exact production read-back establish a release. The guardian never edits source lessons, advances rotation or invents replacement content.
- Native Hermes already retries truly pre-model network failures and respects provider usage windows. Do not duplicate those mechanisms or erase update/drain fences.

## Recovery procedure for the authoring agent

1. Read the expected course/slot from the recovery prompt; compare with persisted rotation. Stop if the turn changed or publication already completed.
2. Inspect git status, retained failure log and actual live revision first. Preserve pending tracked/untracked work and save a binary diff outside the repo before reconciliation. Never reset/stash blindly or force push.
3. If provider failure interrupted a draft, recover the same draft before selecting another session. If publication state is ambiguous, reconcile exact source, remote and live effects before any new write.
4. If a test fails, load the focused debugging/testing skill. Capture failure dimensions and a discriminating reproduction. Repair only the owning boundary; do not add sleeps, skip gates, inflate timeouts or blindly retry a failed assertion.
5. After a proven repair, rerun the same full gates and exact production checks. If blocked by credentials, quota, protected content or uncertain state, report the blocker and preserve progress.
6. Keep the original schedule/delivery and mark no new student completion. Capture remaining unknowns instead of promising uninterrupted operation.

## Verification

- `python3 scripts/test-teaching-guardian.py` uses isolated fixtures: healthy/paused/busy/missed/HTTP400/gate/auth/quota/ambiguous publication, cooldown/budget, atomic pause race, check-only and rotation preservation. It never fires a real job.
- `hicall_teaching_guardian.py --check` reads real job/checkpoint state without queuing work or changing recovery budget.
- For the real scheduled watchdog path, use its generated quality launcher and inspect both receipt and `cache/teaching-guardian/state.json`; a zero exit alone does not certify lesson content.
- Verify the exact updated job fields and gateway heartbeat. Do not restart an active gateway, update Hermes, switch providers or enable unrelated paused jobs as a side effect.
