---
title: 'Interactive Deep Lab: AI Incident Intelligence Dashboard'
summary: 'A deep, interactive Information System Management lab where students transform messy incident evidence into a management-ready AI incident intelligence dashboard with source scoring, governance, and executive decision logic.'
topic: 'Information System Management'
publishedAt: '2026-05-29'
featured: true
tags:
  - information system management
  - incident response
  - dashboard
  - source evaluation
  - ai governance
level: Advanced
format: Toolkit
---

## Deep lab purpose

This is no longer a short reading activity. It is a full studio-style hands-on lab. Students do the work of an incident intelligence team: collect evidence, challenge weak sources, model business impact, build dashboard logic, and defend decisions to management.

## Scenario

A major public digital-service outage affects identity, immigration, education, and citizen-facing services. Information arrives from operational logs, media reports, vendor statements, internal updates, and social channels. Some claims are true, some are incomplete, and some are repeated without evidence.

Students must design an AI-supported incident intelligence dashboard that helps leaders answer four questions:

1. What is affected?
2. What evidence supports that conclusion?
3. What decision is needed now?
4. What should not be said publicly yet?

## Native Python + tool testing requirement

Students must run the provided native Python dashboard API, test the endpoints in Postman, automate a health/KPI check in n8n, and capture HTTP evidence in Wireshark. The lab is considered complete only when the team can show API output, dashboard logic, Postman responses, and packet-level request/response evidence.

## Required student artifacts

- Evidence register with source credibility scoring.
- Service impact matrix with owner, users, severity, and dependencies.
- Timeline reconstructed from uncertain and confirmed signals.
- Dashboard storyboard or working prototype.
- AI prompt log showing how generated summaries were checked.
- Executive incident brief with recommendations and limitations.

## Lab depth extension

For a 3-hour session, require each team to add:

- a risk heat map,
- a backlog of incident-response actions,
- an executive communication approval workflow,
- a post-incident improvement plan,
- and a short audit trail explaining why each dashboard metric exists.

## Instructor facilitation notes

Push students away from decorative dashboards. Every chart must answer a management decision. If a widget does not change a decision, students must remove it or justify it.

Ask these challenge questions during review:

- Which metric could create panic if misunderstood?
- Which claim has the highest impact but weakest evidence?
- Which recovery update requires human approval before publication?
- Which service owner should be called first, and why?
- What would the dashboard hide from executives if it only used technical logs?

## Assessment emphasis

Strong submissions show disciplined source handling, clear decision logic, and honest uncertainty. Weak submissions look visually polished but fail to connect evidence to action.
