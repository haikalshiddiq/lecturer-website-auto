# AI Model Release Incident Scenario Pack

## Purpose

Use this teaching artifact to simulate an AI release incident where a model passes pre-release checks but creates harmful outcomes after production exposure. The exercise helps learners connect model evaluation, release governance, and operational evidence.

## Learning goals

- evaluate whether benchmark success is enough for production readiness
- interpret incident evidence from dashboards, support signals, and qualitative review
- decide when to pause, roll back, or continue an AI release
- propose stronger gates for the next deployment cycle

## Scenario summary

A student-support classification model is scheduled for release through an automated CI/CD pipeline. The candidate passes unit tests, packaging checks, and offline evaluation. Within one hour of deployment, advisors report misrouted urgent cases and the support dashboard shows a spike in manual overrides.

## Roles

1. **Release manager** — decides whether to continue, pause, or roll back.
2. **Evaluation lead** — explains benchmark evidence and confidence limits.
3. **Observability lead** — interprets dashboards, logs, and incident indicators.
4. **Stakeholder advocate** — voices user impact, escalation risk, and service expectations.

## Round 1: pre-release evidence

- offline F1 score improved from `0.81` to `0.87`
- regression suite passed on stored validation data
- no infrastructure errors detected in staging
- rollout plan uses a 25% traffic split for the first hour

### Prompt for learners

Would you approve the release at this point? Which extra checks would you require before pressing deploy?

## Round 2: early production signals

After 20 minutes:

- urgent support tickets routed to the general queue increase by `18%`
- manual override actions rise from `4` to `19`
- response latency stays healthy, so infrastructure alarms remain green
- one staff reviewer reports that multilingual messages look under-classified

### Prompt for learners

Is this enough evidence to halt the rollout, or do you need more data? Which metrics now matter more than latency and uptime?

## Round 3: incident confirmation

After 55 minutes:

- two high-priority student cases miss the urgent escalation path
- the shadow model from last week would have classified both correctly
- confidence scores on multilingual inputs are high despite the wrong labels
- the communications team requests an incident statement within 30 minutes

### Prompt for learners

Choose one action:

- continue rollout and monitor closely
- freeze traffic at 25% while investigating
- roll back immediately

Then justify the decision with both technical and service-quality evidence.

## Debrief questions

1. Which signals should have been promoted into release gates before deployment?
2. Did the team over-trust offline metrics?
3. What post-release dashboard would have caught the problem faster?
4. How should a trustworthy AI release policy define rollback triggers?
5. Which stakeholder concerns were operationally important, not just reputationally important?

## Extension activity

Ask students to redesign the incident as a GitHub-to-Cloudflare style workflow:

- add evaluation thresholds as merge or deploy blockers
- define a canary-review checkpoint before full rollout
- require a rollback playbook in the release checklist
- specify what evidence must appear in the post-release report

## Suggested facilitator note

Encourage students to notice that this is not an infrastructure outage. The core lesson is that a technically successful deployment can still be an educationally rich operational failure when model behaviour is misaligned with real-world use.
