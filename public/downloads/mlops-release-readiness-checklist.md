# MLOps Release Readiness Checklist

Use this checklist to decide whether an AI-assisted feature or model update is ready to move through a CI/CD release gate.

## Evaluation gate

- [ ] The expected task, user group, and failure mode are documented.
- [ ] Test data includes normal, edge-case, and harmful-output examples.
- [ ] Evaluation thresholds are written before the release decision.
- [ ] Human review is required for ambiguous or high-impact outputs.

## Operational gate

- [ ] The release has an owner and rollback contact.
- [ ] Logs or audit records can connect a deployed result to its source change.
- [ ] Monitoring checks include quality, availability, and user feedback signals.
- [ ] The team knows what condition should stop or revert the release.

## Classroom activity

Ask students to compare two AI release plans: one that only passes a build, and one that also includes evaluation evidence, rollback planning, and live monitoring. Have them justify which plan is safer for a campus-facing service.
