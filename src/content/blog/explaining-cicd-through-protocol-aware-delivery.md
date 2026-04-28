---
title: Explaining CI/CD Through Protocol-Aware Delivery
summary: Communication Protocol courses can teach CI/CD more accurately by tracing the real GitHub-to-Cloudflare path used to publish this lecturer website every day.
topic: Communication Protocol
publishedAt: 2026-04-28
featured: true
tags:
  - ci/cd
  - protocols
  - cloudflare
  - github-actions
---

Students often see deployment pipelines as abstract automation. A better lesson is to walk through a real release path: GitHub Actions publishes a queued article, pushes it to `main`, CI validates the repo, and Cloudflare receives the approved release for Pages plus Worker deployment.

## What to discuss in class

Break the release into protocol checkpoints:

1. GitHub Actions authenticates and pushes content back to the repository over HTTPS.
2. CI downloads dependencies, builds the site, and prepares static output.
3. Cloudflare deployment calls move the validated release to Pages and the Worker environment.
4. Browser-based verification checks confirm what users actually receive at the edge.

This lets students connect source control, API calls, TLS, HTTP responses, and observability instead of treating CI/CD as a black box.

## A practical assignment idea

Give each group the website's release sequence and ask them to label which protocol or transport concern is active at each step: repository push, dependency download, deploy request, edge response, and Worker verification.

## Why this matters

CI/CD becomes easier to understand when learners can explain not only *what* the pipeline does, but also *how* protocol behaviour makes the release succeed or fail.
