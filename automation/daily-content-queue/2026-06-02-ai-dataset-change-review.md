---
targetCollection: resources
targetSlug: ai-dataset-change-review
title: AI Dataset Change Review
description: A classroom-ready review worksheet for helping students evaluate how dataset changes can shift AI behaviour, risk, and governance evidence.
publishOn: 2026-06-02
summary: A practical Artificial Intelligence activity for checking dataset drift, review evidence, and release decisions before model-backed services change.
topic: Artificial Intelligence
featured: false
tags:
  - artificial intelligence
  - dataset drift
  - model governance
  - release review
---

Artificial Intelligence lessons become more useful when students can connect model behaviour to the data decisions behind it. A model update may look like a code release, but the largest risk often comes from a changed dataset, a new labelling rule, or a different sampling window.

This review activity asks learners to inspect a dataset-change scenario before approving a model-backed campus service update.

## Scenario

A campus helpdesk assistant is retrained with a new semester of support tickets. The team reports higher accuracy in testing, but several departments worry that rare cases from previous semesters may now be underrepresented.

## Student task

Ask each group to prepare a dataset-change review with five sections:

1. **Change summary:** Which data sources, labels, or time windows changed?
2. **Coverage check:** Which student or staff groups might be overrepresented or missing?
3. **Behaviour evidence:** Which prompts or tasks improved, degraded, or became less predictable?
4. **Risk note:** What could go wrong if the new model is released without additional monitoring?
5. **Release decision:** Should the team approve, delay, or limit the release, and what evidence supports that choice?

## Teaching note

Keep the discussion evidence-based. Students should avoid treating a single aggregate accuracy score as proof that the system is safe. Encourage them to compare examples, edge cases, and governance requirements.

## Learning outcome

Students learn that responsible Artificial Intelligence delivery requires dataset-level review, not only model output review. They practise turning data-change evidence into a release decision that managers, engineers, and users can understand.
