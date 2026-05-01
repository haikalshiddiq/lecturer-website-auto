# Campus Release Governance Scorecard

Use this scorecard to decide whether a campus-facing digital change is ready for production. The goal is not to reward speed alone, but to measure whether release governance is strong enough to protect service quality, stakeholder trust, and operational continuity.

## Suggested classroom scenario

A university team wants to release an update to its student advising portal. The update includes a new appointment-status workflow, refreshed FAQ content, and a small backend rule change for reminder notifications. CI is green, but several questions remain about rollback ownership, stakeholder communications, and post-release verification.

## How to score

- Rate each criterion from **0 to 4**.
- Multiply the score by the weight.
- Add the weighted totals for a final release-readiness score.
- Recommended decision guide:
  - **85–100:** release is well governed and can proceed with routine monitoring
  - **70–84:** release may proceed only with explicit mitigations recorded
  - **50–69:** release should pause until material governance gaps are closed
  - **Below 50:** release should not proceed

## Weighted scorecard

| Criterion | What good looks like | Weight | Score (0–4) | Weighted score |
| --- | --- | ---: | ---: | ---: |
| Service ownership clarity | Named owner, approver, and escalation contact are explicit | 5 |  |  |
| Change rationale | Business purpose and learner/user impact are clearly stated | 4 |  |  |
| CI/CD evidence | Build, validation, and relevant checks are complete and visible | 5 |  |  |
| Release scope control | Team can describe exactly what changed and what did not | 4 |  |  |
| Rollback readiness | Rollback trigger, owner, and recovery path are defined | 5 |  |  |
| Stakeholder communication | Affected groups know timing, impact, and support path | 4 |  |  |
| Data or workflow risk review | Operational and information-quality risks were examined | 4 |  |  |
| Production verification plan | Team knows which live signals prove the release worked | 5 |  |  |
| Support readiness | Frontline support or operations team can respond quickly | 3 |  |  |
| Retrospective discipline | Team will capture lessons after release, not only incidents | 3 |  |  |

## Interpretation prompts

### If the score is high
- Which governance practices made the release trustworthy rather than simply fast?
- Which parts of the scorecard could become automation in GitHub Actions or deployment policy?

### If the score is medium
- Which missing evidence is easiest to fix before release?
- What mitigation would still be too weak for a high-risk student-facing service?

### If the score is low
- Which missing control creates the largest institutional risk?
- Would a technically successful deployment still count as a management failure? Why?

## Fast debrief questions

1. Which criteria were easiest for students to justify with evidence?
2. Which criteria triggered disagreement between technical and managerial viewpoints?
3. How would the scorecard change for a low-risk content update versus a workflow-critical system change?
4. What should be verified after release so the scorecard does not stop at pre-deployment confidence?

## Extension activity

Ask learners to convert one scorecard criterion into a concrete release artifact. Examples:

- a rollback runbook section
- a stakeholder notification template
- a GitHub Actions job that enforces a required quality gate
- a post-release verification checklist for a Cloudflare Pages deployment
